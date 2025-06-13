"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilePath = getFilePath;
exports.getResizedImage = getResizedImage;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const access_service_1 = require("@/services/access.service");
const file_service_1 = require("@/services/file.service");
const response_1 = require("@/utils/response");
const sharp_1 = __importDefault(require("sharp"));
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
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        // Optional: Set proper content type if known
        const ext = path_1.default.extname(fileName).toLowerCase();
        if (ext === ".jpg" || ext === ".jpeg")
            res.contentType("image/jpeg");
        else if (ext === ".png")
            res.contentType("image/png");
        else if (ext === ".gif")
            res.contentType("image/gif");
        else if (ext === ".webp")
            res.contentType("image/webp");
        else if (ext === ".svg")
            res.contentType("image/svg+xml");
        else if (ext === ".bmp")
            res.contentType("image/bmp");
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
async function getResizedImage(req, res) {
    const { workspaceId, projectId, fileName } = req.params;
    const { userId } = req.auth;
    // Parse query params
    const width = req.query.width ? parseInt(req.query.width, 10) : null;
    const height = req.query.height ? parseInt(req.query.height, 10) : null;
    const quality = req.query.quality ? Math.min(100, Math.max(1, parseInt(req.query.quality, 10))) : 80;
    const requestedFormat = req.query.format?.toLowerCase() || null;
    try {
        // Ownership validation
        const owns = await (0, access_service_1.userOwnsWorkspace)(userId, workspaceId);
        if (!owns) {
            return (0, response_1.sendError)(403, res, "Unauthorized access to workspace", "access.workspace.unauthorized");
        }
        // Resolve file path
        const absolutePath = await (0, file_service_1.getFilePathById)(workspaceId, projectId, fileName);
        if (!absolutePath || !fs_1.default.existsSync(absolutePath)) {
            return (0, response_1.sendError)(404, res, "File not found", "file.not_found");
        }
        // Validate image extension
        const ext = path_1.default.extname(fileName).toLowerCase();
        const supportedFormats = [".jpg", ".jpeg", ".png", ".webp"];
        if (!supportedFormats.includes(ext)) {
            return (0, response_1.sendError)(400, res, "Unsupported image format for resizing", "image.unsupported_format");
        }
        // Set CORS headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        // Create sharp instance with input file
        let image = (0, sharp_1.default)(absolutePath);
        // Apply resize if either width or height provided
        if (width || height) {
            image = image.resize(width || null, height || null, {
                fit: 'inside', // Keep aspect ratio, fit inside box
                withoutEnlargement: true, // Do not upscale
            });
        }
        // Output format and compression
        switch (requestedFormat) {
            case "jpeg":
            case "jpg":
                res.contentType("image/jpeg");
                image = image.jpeg({ quality });
                break;
            case "png":
                res.contentType("image/png");
                image = image.png({ compressionLevel: Math.floor((9 * (100 - quality)) / 100) }); // compressionLevel 0-9
                break;
            case "webp":
                res.contentType("image/webp");
                image = image.webp({ quality });
                break;
            default:
                // Use original format
                if (ext === ".jpg" || ext === ".jpeg") {
                    res.contentType("image/jpeg");
                    image = image.jpeg({ quality });
                }
                else if (ext === ".png") {
                    res.contentType("image/png");
                    image = image.png({ compressionLevel: Math.floor((9 * (100 - quality)) / 100) });
                }
                else if (ext === ".webp") {
                    res.contentType("image/webp");
                    image = image.webp({ quality });
                }
                else {
                    res.contentType("application/octet-stream");
                }
                break;
        }
        // Pipe the transformed image stream directly to response
        image.on("error", (err) => {
            console.error("Sharp processing error:", err);
            if (!res.headersSent)
                (0, response_1.sendError)(500, res, "Image processing failed", "image.processing_error");
        });
        return image.pipe(res);
    }
    catch (error) {
        console.error("Unexpected error in getResizedImage:", error);
        return (0, response_1.sendError)(500, res, "Unexpected server error", "server.error");
    }
}
