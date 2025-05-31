import { Request, Response } from "express";
import { config } from "dotenv";
import { join } from "path";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

import MyJwtPayload from "@/interface/MyJwtPayload";

import {
  createDirectory,
  directoryExists,
  readFileAsync,
  writeFileAsync,
} from "@/FSM/utils/FileOperations";

import { sendSuccess, sendError } from "@/utils/response";

import { User } from "@/models/user.model";
import { Workspace } from "@/models/workspace.model";
import { Project } from "@/models/project.model";
import { File } from "@/models/file.model";
import { CryptoUtil } from "@/utils/Crypto";

config();

export const getProjectId = async (
  req: Request,
  res: Response
): Promise<any> => {
  const token = req.query.token;
  if (!token)
    return sendError(
      400,
      res,
      "Token is required",
      "fsm.getProjectId.missing_token"
    );

  try {
    const user = await User.findOne({ userId: token });

    if (!user)
      return sendError(
        404,
        res,
        "User not found",
        "fsm.getProjectId.user_not_found"
      );

    const workspace = await Workspace.findOne({ owner: user._id });

    if (!workspace)
      return sendError(
        404,
        res,
        "Workspace not found",
        "fsm.getProjectId.workspace_not_found"
      );

    const project = await Project.findOne({
      workspaceId: workspace.workspaceId,
    });

    if (!project)
      return sendError(
        404,
        res,
        "Project not found",
        "fsm.getProjectId.project_not_found"
      );

    return sendSuccess(200, res, "Project found", {
      projectId: project.projectId,
    });
  } catch (error) {
    console.error("Error fetching project ID:", error);
    return sendError(
      500,
      res,
      "Internal server error",
      "fsm.getProjectId.internal_error"
    );
  }
};

export const getDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  let token = req.query.token;

  if (!token)
    return sendError(
      400,
      res,
      "Token is required",
      "fsm.getWorkspaceId.missing_token"
    );


  // Decrypt the token
  token = CryptoUtil.decrypt(token as string);

  // Validate the toke
  const validToken = jwt.verify(
    token as string,
    process.env.JWT_SECRET || "default_secret_key"
  ) as MyJwtPayload;

  try {


    const user = await User.findOne({ userId: validToken.userId});
    if (!user)
      return sendError(
        404,
        res,
        "User not found",
        "fsm.getWorkspaceId.user_not_found"
      );

    const workspace = await Workspace.findOne({ owner: user._id });
    if (!workspace)
      return sendError(
        404,
        res,
        "Workspace not found",
        "fsm.getWorkspaceId.workspace_not_found"
      );

    return sendSuccess(200, res, "Workspace found", {
      workspaceId: workspace.workspaceId,
      projectId: workspace.projects[0]?.toString() || null,
    });
  } catch (error) {
    console.error("Error fetching workspace ID:", error);
    return sendError(
      500,
      res,
      "Internal server error",
      "fsm.getWorkspaceId.internal_error"
    );
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { workspaceId, projectName } = req.body;
  if (!workspaceId || !projectName)
    return sendError(
      400,
      res,
      "Workspace ID and project name are required",
      "fsm.createProject.missing_fields"
    );

  try {
    const workspace = await Workspace.findOne({ workspaceId });
    if (!workspace)
      return sendError(
        404,
        res,
        "Workspace not found",
        "fsm.createProject.workspace_not_found"
      );

    const newProject = new Project({
      projectId: uuidv4(),
      workspaceId: workspace._id as Types.ObjectId,
      name: projectName,
    });
    await newProject.save();

    if (!process.env.WORKSPACE_PATH || !workspaceId || !newProject.projectId) {
      await Project.deleteOne({ projectId: newProject.projectId });
      return sendError(
        500,
        res,
        "Workspace path is not configured",
        "fsm.createProject.workspace_path_undefined"
      );
    }

    const newProjectPath = join(
      process.env.WORKSPACE_PATH,
      workspaceId,
      newProject.projectId
    );
    await createDirectory(newProjectPath);

    workspace.projects.push(newProject._id as Types.ObjectId);
    await workspace.save();

    return sendSuccess(201, res, "Project created successfully", {
      projectId: newProject.projectId,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return sendError(
      500,
      res,
      "Internal server error",
      "fsm.createProject.internal_error"
    );
  }
};

export const getProjects = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { workspaceId } = req.params;
  if (!workspaceId)
    return sendError(
      400,
      res,
      "Workspace ID is required",
      "fsm.getProjects.missing_workspace_id"
    );

  try {
    const projects = await Project.find({ workspaceId });
    if (!projects.length)
      return sendError(
        404,
        res,
        "No projects found for this workspace",
        "fsm.getProjects.no_projects_found"
      );

    return sendSuccess(200, res, "Projects retrieved successfully", {
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return sendError(
      500,
      res,
      "Internal server error",
      "fsm.getProjects.internal_error"
    );
  }
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { workspaceId, projectId } = req.params;
  if (!workspaceId || !projectId)
    return sendError(
      400,
      res,
      "Workspace ID and project ID are required",
      "fsm.deleteProject.missing_fields"
    );

  try {
    const project = await Project.findOne({ projectId });
    if (!project)
      return sendError(
        404,
        res,
        "Project not found",
        "fsm.deleteProject.project_not_found"
      );

    await Project.deleteOne({ projectId });

    if (!process.env.WORKSPACE_PATH || !workspaceId || !project.projectId) {
      return sendError(
        500,
        res,
        "Workspace path is not configured",
        "fsm.createProject.workspace_path_undefined"
      );
    }

    const projectPath = join(
      process.env.WORKSPACE_PATH,
      workspaceId,
      project.projectId
    );

    if (await directoryExists(projectPath))
      fs.rmdirSync(projectPath, { recursive: true });

    return sendSuccess(200, res, "Project deleted successfully", {});
  } catch (error) {
    console.error("Error deleting project:", error);
    return sendError(
      500,
      res,
      "Internal server error",
      "fsm.deleteProject.internal_error"
    );
  }
};

export const addFileToProject = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { workspaceId, projectId } = req.body;
  const file = req.file;

  if (!workspaceId || !projectId || !file) {
    return sendError(
      400,
      res,
      "Project ID and file are required",
      "fsm.addFileToProject.missing_fields"
    );
  }

  try {
    const project = await Project.findOne({ projectId });
    if (!project) {
      return sendError(
        404,
        res,
        "Project not found",
        "fsm.addFileToProject.project_not_found"
      );
    }

    const basePath = process.env.WORKSPACE_PATH;
    if (!basePath) {
      return sendError(
        500,
        res,
        "Workspace path is not configured",
        "fsm.addFileToProject.workspace_path_undefined"
      );
    }

    const fileId = uuidv4();
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${fileId}.${fileExt}`;

    const projectPath = join(basePath, workspaceId, projectId);
    const finalPath = join(projectPath, fileName);

    // Ensure directory exists
    if (!(await directoryExists(projectPath))) {
      await createDirectory(projectPath);
    }

    // Move uploaded file from temp to final path
    fs.renameSync(file.path, finalPath);

    const user = await User.findOne({ userId: (req as any).auth.userId });
    if (!user) {
      return sendError(
        404,
        res,
        "User not found for the given workspace",
        "fsm.addFileToProject.user_not_found"
      );
    }

    const newFile = new File({
      fileId,
      project: project._id,
      userId: user._id,
      filename: fileName,
      originalName: file.originalname,
      path: finalPath,
      size: file.size,
      mimeType: file.mimetype,
      uploadedBy: user._id,
    });

    await newFile.save();
    project.files.push(newFile._id as Types.ObjectId);
    await project.save();

    return sendSuccess(201, res, "File added to project successfully", {
      fileId: newFile.fileId,
      fileName: newFile.filename,
      fullPath: `${workspaceId}/${projectId}/${newFile.filename}`,
    });
  } catch (error) {
    console.error("Error adding file to project:", error);

    // Cleanup temp file if not yet moved
    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupErr) {
        console.error("Temp file cleanup failed:", cleanupErr);
      }
    }

    return sendError(
      500,
      res,
      "Internal server error",
      "fsm.addFileToProject.internal_error"
    );
  }
};


export const deleteFileFromProject = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { projectId, workspaceId, fileId } = req.params;
  if (!projectId || !workspaceId || !fileId)
    return sendError(
      400,
      res,
      "Project ID and file name are required",
      "fsm.deleteFileFromProject.missing_fields"
    );

  try {
    const project = await Project.findOne({ projectId });
    if (!project)
      return sendError(
        404,
        res,
        "Project not found",
        "fsm.deleteFileFromProject.project_not_found"
      );

    if (!process.env.WORKSPACE_PATH || !projectId || !project.workspaceId) {
      return sendError(
        500,
        res,
        "Workspace path is not configured",
        "fsm.deleteFileFromProject.workspace_path_undefined"
      );
    }

    // delete file from database
    const file = await File.findOneAndDelete({ fileId, project: project._id });
    if (!file)
      return sendError(
        404,
        res,
        "File not found in project",
        "fsm.deleteFileFromProject.file_not_found"
      );
    
    // delete file from filesystem

    const filePath = join(
      process.env.WORKSPACE_PATH,
      workspaceId,
      projectId,
      file.filename
    );


    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return sendSuccess(200, res, "File deleted from project successfully", {});
  } catch (error) {
    console.error("Error deleting file from project:", error);
    return sendError(
      500,
      res,
      "Internal server error",
      "fsm.deleteFileFromProject.internal_error"
    );
  }
};
