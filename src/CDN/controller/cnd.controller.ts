import e, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { userOwnsWorkspace } from "@/services/access.service";
import { getFilePathById } from "@/services/file.service";
import { sendSuccess, sendError } from "@/utils/response";

export async function getFilePath(req: Request, res: Response): Promise<any> {
  const { workspaceId, projectId, fileName } = req.params;
  const { userId } = (req as any).auth;

  try {
    // Ownership check
    const owns = await userOwnsWorkspace(userId, workspaceId);
    if (!owns) {
      return sendError(
        403,
        res,
        "You do not have permission to access this workspace",
        "access.workspace.unauthorized"
      );
    }

    // Get full path from DB or logic
    const absolutePath = await getFilePathById(
      workspaceId,
      projectId,
      fileName
    );
    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return sendError(404, res, "File not found", "file.not_found");
    }

    // ✅ Set proper headers for CORS and file serving
    res.setHeader("Access-Control-Allow-Origin", "*"); // or restrict to domain
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    // Optional: Set proper content type if known
    const ext = path.extname(fileName).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") res.contentType("image/jpeg");
    else if (ext === ".png") res.contentType("image/png");
    else if (ext === ".gif") res.contentType("image/gif");
    else if (ext === ".webp") res.contentType("image/webp");
    else if (ext === ".svg") res.contentType("image/svg+xml");
    else if (ext === ".bmp") res.contentType("image/bmp");
    else if (ext === ".pdf") res.contentType("application/pdf");

    // Send file
    return res.sendFile(absolutePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return sendError(500, res, "Error sending file", "file.send_error");
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return sendError(500, res, "Unexpected error", "file.unexpected_error");
  }
}
