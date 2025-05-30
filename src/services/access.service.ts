import { Types } from "mongoose";
import { Workspace } from "@/models/workspace.model";
import { User } from "@/models/user.model";

export async function userOwnsWorkspace(
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  try {
    if (userId == null || workspaceId == null) return false;

    const user = await User.findOne({ userId }).select("_id").lean();
    if (!user) return false;

    const workspace = await Workspace.findOne({
      workspaceId: workspaceId,
      owner: user._id,
    }).lean();

    return workspace !== null;
  } catch (error) {
    console.error("Error checking workspace ownership", error);
    return false;
  }
}
