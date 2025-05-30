import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  projectId: string; // Unique identifier for the project
  name: string;
  workspaceId: Types.ObjectId; // Reference Workspace
  files: Types.ObjectId[]; // References File
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
  {
    projectId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    files: [{ type: Schema.Types.ObjectId, ref: "File" }],
  },
  { timestamps: true },
);

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
