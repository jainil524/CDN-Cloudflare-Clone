import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  projectId: number; // Unique identifier for the project
  name: string;
  workspace: Types.ObjectId; // Reference Workspace
  files: Types.ObjectId[]; // References File
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
  {
    projectId: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    files: [{ type: Schema.Types.ObjectId, ref: "File" }],
  },
  { timestamps: true },
);

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
