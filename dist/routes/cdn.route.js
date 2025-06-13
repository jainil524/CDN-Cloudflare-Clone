"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// /routes/cdn.router.ts
const express_1 = require("express");
const cnd_controller_1 = require("@/CDN/controller/cnd.controller");
const asyncHandler_1 = __importDefault(require("@/utils/asyncHandler"));
const cdnrouter = (0, express_1.Router)();
cdnrouter.get("/hello", (req, res) => {
    res.status(200).json({ message: "CDN Service is running" });
});
cdnrouter.get("/optimized/:workspaceId/:projectId/:fileName", (0, asyncHandler_1.default)(cnd_controller_1.getResizedImage));
/**
 * CDN Secure File Delivery
 * GET /cdn/:workspaceId/:fileName.ext?token=xxx
 */
cdnrouter.get("/:workspaceId/:projectId/:fileName", (0, asyncHandler_1.default)(cnd_controller_1.getFilePath));
exports.default = cdnrouter;
