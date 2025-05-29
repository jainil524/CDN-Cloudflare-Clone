import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFile extends Document {
  fileId: number; // Unique identifier for the file
  filename: string; // e.g., "fileid.ext"
  originalName: string; // original uploaded filename
  mimeType: string;
  size: number; // bytes
  path: string; // absolute or relative storage path
  project: Types.ObjectId; // Reference Project
  uploadedBy: Types.ObjectId; // Reference User who uploaded
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema: Schema<IFile> = new Schema(
  {
    fileId: { type: Number, required: true, unique: true },
    filename: { type: String, required: true, unique: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const File = mongoose.model<IFile>("File", FileSchema);
