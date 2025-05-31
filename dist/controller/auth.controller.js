"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const user_model_1 = require("@/models/user.model");
const workspace_model_1 = require("@/models/workspace.model");
const FileOperations_1 = require("@/FSM/utils/FileOperations");
const response_1 = require("@/utils/response");
// Load environment variables from .env file
(0, dotenv_1.config)();
const login = async (req, res) => {
    // get user credentials from request body
    const { email, password } = req.body;
    // check if credentials are valid
    let user = await user_model_1.User.find({ email, password });
    if (user.length === 0) {
        return (0, response_1.sendError)(401, res, "Invalid credentials", "auth.login.invalid_credentials");
    }
    // generate JWT token
    const token = jsonwebtoken_1.default.sign({ userId: user[0].userId, email: user[0].email }, process.env.JWT_SECRET, {
        expiresIn: "1Y",
    });
    // set cookie with token
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });
    // send token in response
    return (0, response_1.sendSuccess)(200, res, "Login successfull", {
        token,
    });
};
exports.login = login;
const register = async (req, res) => {
    // get user details from request body
    const { email, password } = req.body;
    // check if user already exists
    let existingUser = await user_model_1.User.find({ email });
    if (existingUser.length > 0) {
        return (0, response_1.sendError)(409, res, "User already exists", "auth.register.user_exists");
    }
    const workspaceId = (0, uuid_1.v4)(); // Generate a unique workspace ID
    // create new user
    const newUser = new user_model_1.User({
        userId: (0, uuid_1.v4)(), // Generate a unique user ID
        email,
        password, // In production, ensure to hash the password
        workspace: null, // Workspace will be assigned later
    });
    // create workspace for the user
    const workspace = new workspace_model_1.Workspace({
        workspaceId: workspaceId, // Generate a unique workspace ID
        owner: newUser._id,
        name: `${newUser.userId}'s Workspace`,
    });
    // Save both user and workspace to the database
    await newUser.save();
    await workspace.save();
    // Add the workspace reference to the user
    newUser.workspace = workspace._id;
    await newUser.save();
    // Create a directory for the new workspace
    if (!process.env.WORKSPACE_PATH) {
        // If directory creation fails, clean up the created user and workspace
        await user_model_1.User.deleteOne({ _id: newUser._id });
        await workspace_model_1.Workspace.deleteOne({ _id: workspace._id });
        return (0, response_1.sendError)(500, res, "Workspace path is not configured", "auth.register.workspace_path_undefined");
    }
    const workspaceDirPath = (0, path_1.join)(process.env.WORKSPACE_PATH, workspace.workspaceId);
    try {
        await (0, FileOperations_1.createDirectory)(workspaceDirPath);
    }
    catch (error) {
        // If directory creation fails, clean up the created user and workspace
        await user_model_1.User.deleteOne({ _id: newUser._id });
        await workspace_model_1.Workspace.deleteOne({ _id: workspace._id });
        return (0, response_1.sendError)(500, res, "Failed to create workspace directory", "auth.register.workspace_directory_error");
    }
    return (0, response_1.sendSuccess)(201, res, "User registered successfully", {
        workspaceId: workspace.workspaceId,
        workspaceName: workspace.name,
    });
};
exports.register = register;
