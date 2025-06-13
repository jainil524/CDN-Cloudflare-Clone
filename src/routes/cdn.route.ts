// /routes/cdn.router.ts
import { Router } from "express";

import { getFilePath, getResizedImage } from "@/CDN/controller/cnd.controller";
import asyncHandler from "@/utils/asyncHandler";

const cdnrouter = Router();

cdnrouter.get("/hello", (req, res) => {
  res.status(200).json({ message: "CDN Service is running" });
});

cdnrouter.get(
  "/optimized/:workspaceId/:projectId/:fileName",
  asyncHandler(getResizedImage),
);

/**
 * CDN Secure File Delivery
 * GET /cdn/:workspaceId/:fileName.ext?token=xxx
 */


cdnrouter.get(
  "/:workspaceId/:projectId/:fileName",
  asyncHandler(getFilePath),
);
export default cdnrouter;
