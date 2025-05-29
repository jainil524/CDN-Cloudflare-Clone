// /routes/cdn.router.ts
import { Router } from "express";

import { getFilePath } from "@/CDN/controller/cnd.controller";
import asyncHandler from "@/utils/asyncHandler";

const cdnrouter = Router();

/**
 * CDN Secure File Delivery
 * GET /cdn/:workspaceId/:fileName.ext?token=xxx
 */
cdnrouter.get(
  "/:workspaceId/:projectId/:fileName",
  asyncHandler(getFilePath),
);

export default cdnrouter;
