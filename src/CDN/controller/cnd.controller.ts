import { Request, Response } from "express";
import path from "path";
import fs from "fs"; // You missed this import
import { userOwnsWorkspace } from "@/services/access.service";
import { getFilePathById } from "@/services/file.service";

import { sendSuccess, sendError } from "@/utils/response";

export async function getFilePath(req: Request, res: Response): Promise<any> {
  const { workspaceId, projectId, fileName } = req.params;
  const { userId } = (req as any).auth; // From verified token

  // Ownership check
  const owns = await userOwnsWorkspace(userId, workspaceId);
  if (!owns) {
    return sendError(
      403,
      res,
      "You do not have permission to access this workspace",
      "access.workspace.unauthorized",
    );
  }

  // Get full path from DB or logic
  const absolutePath = await getFilePathById(workspaceId, fileName);
  if (!absolutePath || !fs.existsSync(absolutePath)) {
    return sendError(404, res, "File not found", "file.not_found");
  }

  // Send file as response
  res.sendFile(absolutePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      return sendError(500, res, "Error sending file", "file.send_error");
    }
  });
  return sendSuccess(200, res, "File retrieved successfully", {
    filePath: absolutePath,
  });
}
