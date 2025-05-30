import path from "path";

// /services/file.service.ts
export async function getFilePathById(
  workspaceId: string,
  projectId: string,
  fileName: string,
): Promise<string | null> {
  const basePath = process.env.WORKSPACE_PATH || path.join(__dirname, "../FSM/workspaces");
  const fullPath = path.resolve(basePath, workspaceId, projectId, fileName);

  return fullPath;
}
