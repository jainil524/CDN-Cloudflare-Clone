import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  userId: string;
  email: string;
  password: string;
  workspace: Types.ObjectId; // References Workspace
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace" },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", UserSchema);
