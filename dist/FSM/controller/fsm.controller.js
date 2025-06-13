"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileFromProject = exports.addFileToProject = exports.deleteProject = exports.getProjects = exports.createProject = exports.getDetails = exports.getProjectId = void 0;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const FileOperations_1 = require("@/FSM/utils/FileOperations");
const response_1 = require("@/utils/response");
const user_model_1 = require("@/models/user.model");
const workspace_model_1 = require("@/models/workspace.model");
const project_model_1 = require("@/models/project.model");
const file_model_1 = require("@/models/file.model");
const Crypto_1 = require("@/utils/Crypto");
(0, dotenv_1.config)();
const getProjectId = async (req, res) => {
    const token = req.query.token;
    if (!token)
        return (0, response_1.sendError)(400, res, "Token is required", "fsm.getProjectId.missing_token");
    try {
        const user = await user_model_1.User.findOne({ userId: token });
        if (!user)
            return (0, response_1.sendError)(404, res, "User not found", "fsm.getProjectId.user_not_found");
        const workspace = await workspace_model_1.Workspace.findOne({ owner: user._id });
        if (!workspace)
            return (0, response_1.sendError)(404, res, "Workspace not found", "fsm.getProjectId.workspace_not_found");
        const project = await project_model_1.Project.findOne({
            workspaceId: workspace.workspaceId,
        });
        if (!project)
            return (0, response_1.sendError)(404, res, "Project not found", "fsm.getProjectId.project_not_found");
        return (0, response_1.sendSuccess)(200, res, "Project found", {
            projectId: project.projectId,
        });
    }
    catch (error) {
        console.error("Error fetching project ID:", error);
        return (0, response_1.sendError)(500, res, "Internal server error", "fsm.getProjectId.internal_error");
    }
};
exports.getProjectId = getProjectId;
const getDetails = async (req, res) => {
    let token = req.query.token;
    if (!token)
        return (0, response_1.sendError)(400, res, "Token is required", "fsm.getWorkspaceId.missing_token");
    // Decrypt the token
    token = Crypto_1.CryptoUtil.decrypt(token);
    // Validate the toke
    const validToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default_secret_key");
    try {
        const user = await user_model_1.User.findOne({ userId: validToken.userId });
        if (!user)
            return (0, response_1.sendError)(404, res, "User not found", "fsm.getWorkspaceId.user_not_found");
        const workspace = await workspace_model_1.Workspace.findOne({ owner: user._id });
        if (!workspace)
            return (0, response_1.sendError)(404, res, "Workspace not found", "fsm.getWorkspaceId.workspace_not_found");
        return (0, response_1.sendSuccess)(200, res, "Workspace found", {
            workspaceId: workspace.workspaceId,
            projectId: workspace.projects[0]?.toString() || null,
        });
    }
    catch (error) {
        console.error("Error fetching workspace ID:", error);
        return (0, response_1.sendError)(500, res, "Internal server error", "fsm.getWorkspaceId.internal_error");
    }
};
exports.getDetails = getDetails;
const createProject = async (req, res) => {
    const { workspaceId, projectName } = req.body;
    if (!workspaceId || !projectName)
        return (0, response_1.sendError)(400, res, "Workspace ID and project name are required", "fsm.createProject.missing_fields");
    try {
        const workspace = await workspace_model_1.Workspace.findOne({ workspaceId });
        if (!workspace)
            return (0, response_1.sendError)(404, res, "Workspace not found", "fsm.createProject.workspace_not_found");
        const newProject = new project_model_1.Project({
            projectId: (0, uuid_1.v4)(),
            workspaceId: workspace._id,
            name: projectName,
        });
        await newProject.save();
        if (!process.env.WORKSPACE_PATH || !workspaceId || !newProject.projectId) {
            await project_model_1.Project.deleteOne({ projectId: newProject.projectId });
            return (0, response_1.sendError)(500, res, "Workspace path is not configured", "fsm.createProject.workspace_path_undefined");
        }
        const newProjectPath = (0, path_1.join)(process.env.WORKSPACE_PATH, workspaceId, newProject.projectId);
        await (0, FileOperations_1.createDirectory)(newProjectPath);
        workspace.projects.push(newProject._id);
        await workspace.save();
        return (0, response_1.sendSuccess)(201, res, "Project created successfully", {
            projectId: newProject.projectId,
        });
    }
    catch (error) {
        console.error("Error creating project:", error);
        return (0, response_1.sendError)(500, res, "Internal server error", "fsm.createProject.internal_error");
    }
};
exports.createProject = createProject;
const getProjects = async (req, res) => {
    const { workspaceId } = req.params;
    if (!workspaceId)
        return (0, response_1.sendError)(400, res, "Workspace ID is required", "fsm.getProjects.missing_workspace_id");
    try {
        const projects = await project_model_1.Project.find({ workspaceId });
        if (!projects.length)
            return (0, response_1.sendError)(404, res, "No projects found for this workspace", "fsm.getProjects.no_projects_found");
        return (0, response_1.sendSuccess)(200, res, "Projects retrieved successfully", {
            projects,
        });
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        return (0, response_1.sendError)(500, res, "Internal server error", "fsm.getProjects.internal_error");
    }
};
exports.getProjects = getProjects;
const deleteProject = async (req, res) => {
    const { workspaceId, projectId } = req.params;
    if (!workspaceId || !projectId)
        return (0, response_1.sendError)(400, res, "Workspace ID and project ID are required", "fsm.deleteProject.missing_fields");
    try {
        const project = await project_model_1.Project.findOne({ projectId });
        if (!project)
            return (0, response_1.sendError)(404, res, "Project not found", "fsm.deleteProject.project_not_found");
        await project_model_1.Project.deleteOne({ projectId });
        if (!process.env.WORKSPACE_PATH || !workspaceId || !project.projectId) {
            return (0, response_1.sendError)(500, res, "Workspace path is not configured", "fsm.createProject.workspace_path_undefined");
        }
        const projectPath = (0, path_1.join)(process.env.WORKSPACE_PATH, workspaceId, project.projectId);
        if (await (0, FileOperations_1.directoryExists)(projectPath))
            fs_1.default.rmdirSync(projectPath, { recursive: true });
        return (0, response_1.sendSuccess)(200, res, "Project deleted successfully", {});
    }
    catch (error) {
        console.error("Error deleting project:", error);
        return (0, response_1.sendError)(500, res, "Internal server error", "fsm.deleteProject.internal_error");
    }
};
exports.deleteProject = deleteProject;
const addFileToProject = async (req, res) => {
    const { workspaceId, projectId } = req.body;
    const file = req.file;
    if (!workspaceId || !projectId || !file) {
        return (0, response_1.sendError)(400, res, "Project ID and file are required", "fsm.addFileToProject.missing_fields");
    }
    try {
        const project = await project_model_1.Project.findOne({ projectId });
        if (!project) {
            return (0, response_1.sendError)(404, res, "Project not found", "fsm.addFileToProject.project_not_found");
        }
        const basePath = process.env.WORKSPACE_PATH;
        if (!basePath) {
            return (0, response_1.sendError)(500, res, "Workspace path is not configured", "fsm.addFileToProject.workspace_path_undefined");
        }
        const fileId = (0, uuid_1.v4)();
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${fileId}.${fileExt}`;
        const projectPath = (0, path_1.join)(basePath, workspaceId, projectId);
        const finalPath = (0, path_1.join)(projectPath, fileName);
        // Ensure directory exists
        if (!(await (0, FileOperations_1.directoryExists)(projectPath))) {
            await (0, FileOperations_1.createDirectory)(projectPath);
        }
        // Move uploaded file from temp to final path
        fs_1.default.renameSync(file.path, finalPath);
        const user = await user_model_1.User.findOne({ userId: req.auth.userId });
        if (!user) {
            return (0, response_1.sendError)(404, res, "User not found for the given workspace", "fsm.addFileToProject.user_not_found");
        }
        const newFile = new file_model_1.File({
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
        let token = req.query.token;
        await newFile.save();
        project.files.push(newFile._id);
        await project.save();
        return (0, response_1.sendSuccess)(201, res, "File added to project successfully", {
            fileId: newFile.fileId,
            fileName: newFile.filename,
            fullPath: `${workspaceId}/${projectId}/${newFile.filename}`,
            url: `${process.env.CDN_URL}/cdn/${workspaceId}/${projectId}/${newFile.filename}?token=${token}`,
        });
    }
    catch (error) {
        console.error("Error adding file to project:", error);
        // Cleanup temp file if not yet moved
        if (file?.path && fs_1.default.existsSync(file.path)) {
            try {
                fs_1.default.unlinkSync(file.path);
            }
            catch (cleanupErr) {
                console.error("Temp file cleanup failed:", cleanupErr);
            }
        }
        return (0, response_1.sendError)(500, res, "Internal server error", "fsm.addFileToProject.internal_error");
    }
};
exports.addFileToProject = addFileToProject;
const deleteFileFromProject = async (req, res) => {
    const { projectId, workspaceId, fileId } = req.params;
    if (!projectId || !workspaceId || !fileId)
        return (0, response_1.sendError)(400, res, "Project ID and file name are required", "fsm.deleteFileFromProject.missing_fields");
    try {
        const project = await project_model_1.Project.findOne({ projectId });
        if (!project)
            return (0, response_1.sendError)(404, res, "Project not found", "fsm.deleteFileFromProject.project_not_found");
        if (!process.env.WORKSPACE_PATH || !projectId || !project.workspaceId) {
            return (0, response_1.sendError)(500, res, "Workspace path is not configured", "fsm.deleteFileFromProject.workspace_path_undefined");
        }
        // delete file from database
        const file = await file_model_1.File.findOneAndDelete({ fileId, project: project._id });
        if (!file)
            return (0, response_1.sendError)(404, res, "File not found in project", "fsm.deleteFileFromProject.file_not_found");
        // delete file from filesystem
        const filePath = (0, path_1.join)(process.env.WORKSPACE_PATH, workspaceId, projectId, file.filename);
        if (fs_1.default.existsSync(filePath))
            fs_1.default.unlinkSync(filePath);
        return (0, response_1.sendSuccess)(200, res, "File deleted from project successfully", {});
    }
    catch (error) {
        console.error("Error deleting file from project:", error);
        return (0, response_1.sendError)(500, res, "Internal server error", "fsm.deleteFileFromProject.internal_error");
    }
};
exports.deleteFileFromProject = deleteFileFromProject;
