"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userOwnsWorkspace = userOwnsWorkspace;
const workspace_model_1 = require("@/models/workspace.model");
const user_model_1 = require("@/models/user.model");
async function userOwnsWorkspace(userId, workspaceId) {
    try {
        if (userId == null || workspaceId == null)
            return false;
        const user = await user_model_1.User.findOne({ userId }).select("_id").lean();
        if (!user)
            return false;
        const workspace = await workspace_model_1.Workspace.findOne({
            workspaceId: workspaceId,
            owner: user._id,
        }).lean();
        return workspace !== null;
    }
    catch (error) {
        console.error("Error checking workspace ownership", error);
        return false;
    }
}
