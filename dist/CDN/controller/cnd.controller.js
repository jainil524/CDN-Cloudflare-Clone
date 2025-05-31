"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilePath = getFilePath;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const access_service_1 = require("@/services/access.service");
const file_service_1 = require("@/services/file.service");
const response_1 = require("@/utils/response");
async function getFilePath(req, res) {
    const { workspaceId, projectId, fileName } = req.params;
    const { userId } = req.auth;
    try {
        // Ownership check
        const owns = await (0, access_service_1.userOwnsWorkspace)(userId, workspaceId);
        if (!owns) {
            return (0, response_1.sendError)(403, res, "You do not have permission to access this workspace", "access.workspace.unauthorized");
        }
        // Get full path from DB or logic
        const absolutePath = await (0, file_service_1.getFilePathById)(workspaceId, projectId, fileName);
        if (!absolutePath || !fs_1.default.existsSync(absolutePath)) {
            return (0, response_1.sendError)(404, res, "File not found", "file.not_found");
        }
        // ✅ Set proper headers for CORS and file serving
        res.setHeader("Access-Control-Allow-Origin", "*"); // or restrict to domain
        res.setHeader("Access-Control-Allow-Methods", "GET");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        // Optional: Set proper content type if known
        const ext = path_1.default.extname(fileName).toLowerCase();
        if (ext === ".jpg" || ext === ".jpeg")
            res.contentType("image/jpeg");
        else if (ext === ".png")
            res.contentType("image/png");
        else if (ext === ".pdf")
            res.contentType("application/pdf");
        // Send file
        return res.sendFile(absolutePath, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return (0, response_1.sendError)(500, res, "Error sending file", "file.send_error");
            }
        });
    }
    catch (err) {
        console.error("Unexpected error:", err);
        return (0, response_1.sendError)(500, res, "Unexpected error", "file.unexpected_error");
    }
}
