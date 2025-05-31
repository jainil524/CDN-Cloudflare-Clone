"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilePathById = getFilePathById;
const path_1 = __importDefault(require("path"));
// /services/file.service.ts
async function getFilePathById(workspaceId, projectId, fileName) {
    const basePath = process.env.WORKSPACE_PATH || path_1.default.join(__dirname, "../FSM/workspaces");
    const fullPath = path_1.default.resolve(basePath, workspaceId, projectId, fileName);
    return fullPath;
}
