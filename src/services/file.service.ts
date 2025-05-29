import path from "path";

// /services/file.service.ts
export async function getFilePathById(
  workspaceId: string,
  fileName: string,
): Promise<string | null> {
  const basePath = process.env.CDN_STORAGE_PATH || "/var/cdn/files";
  const fullPath = path.join(basePath, workspaceId, fileName);
  return fullPath;
}
