import { Request, Response } from "express";

import { config } from "dotenv";

import { join } from "path";

import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { User } from "@/models/user.model";
import { Workspace } from "@/models/workspace.model";

import { createDirectory } from "@/FSM/utils/FileOperations";

import { sendSuccess, sendError } from "@/utils/response";

// Load environment variables from .env file
config();

export const login = async (req: Request, res: Response): Promise<any> => {
  // get user credentials from request body
  const { email, password } = req.body;

  // check if credentials are valid
  let user = await User.find({ email, password });
  if (user.length === 0) {
    return sendError(
      401,
      res,
      "Invalid credentials",
      "auth.login.invalid_credentials"
    );
  }

  // generate JWT token
  const token = jwt.sign({ userId: user[0].userId, email: user[0].email }, process.env.JWT_SECRET!, {
    expiresIn: "1Y",
  });

  // set cookie with token
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
  });

  // send token in response
  return sendSuccess(200, res, "Login successfull", {
    token,
  });
};

export const register = async (req: Request, res: Response): Promise<any> => {
  // get user details from request body
  const { email, password } = req.body;

  // check if user already exists
  let existingUser = await User.find({ email });
  if (existingUser.length > 0) {
    return sendError(
      409,
      res,
      "User already exists",
      "auth.register.user_exists"
    );
  }

  const workspaceId = uuidv4(); // Generate a unique workspace ID

  // create new user
  const newUser = new User({
    userId: uuidv4(), // Generate a unique user ID
    email,
    password, // In production, ensure to hash the password
    workspace: null, // Workspace will be assigned later
  });

  // create workspace for the user
  const workspace = new Workspace({
    workspaceId: workspaceId, // Generate a unique workspace ID
    owner: newUser._id,
    name: `${newUser.userId}'s Workspace`,
  });


  // Save both user and workspace to the database
  await newUser.save();
  await workspace.save();

  // Add the workspace reference to the user
  newUser.workspace = workspace._id as import("mongoose").Types.ObjectId;
  await newUser.save();

  // Create a directory for the new workspace
  if (!process.env.WORKSPACE_PATH) {
    // If directory creation fails, clean up the created user and workspace
    await User.deleteOne({ _id: newUser._id });
    await Workspace.deleteOne({ _id: workspace._id });

    return sendError(
      500,
      res,
      "Workspace path is not configured",
      "auth.register.workspace_path_undefined"
    );
  }

  const workspaceDirPath = join(
    process.env.WORKSPACE_PATH,
    workspace.workspaceId
  );
  try {
    await createDirectory(workspaceDirPath);
  } catch (error) {
    // If directory creation fails, clean up the created user and workspace
    await User.deleteOne({ _id: newUser._id });
    await Workspace.deleteOne({ _id: workspace._id });

    return sendError(
      500,
      res,
      "Failed to create workspace directory",
      "auth.register.workspace_directory_error"
    );
  }

  return sendSuccess(201, res, "User registered successfully", {
    workspaceId: workspace.workspaceId,
    workspaceName: workspace.name,
  });
};
