import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWorkspace extends Document {
  workspaceId: string; // Unique identifier for the workspace
  name: string;
  owner: Types.ObjectId; // Reference User who owns this workspace
  projects: Types.ObjectId[]; // References Project
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema: Schema<IWorkspace> = new Schema(
  {
    workspaceId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true },
);

export const Workspace = mongoose.model<IWorkspace>(
  "Workspace",
  WorkspaceSchema,
);
