//backend\src\models
import { Schema, model, Document, Types } from "mongoose";

import { IUser } from "./User";

export type GroupRole = "admin" | "member";

export interface IGroupMember {
  user: Types.ObjectId | IUser;
  role: GroupRole;
}

export interface IGroup extends Document {
  name: string;
  avatar?: string;
  members: IGroupMember[];
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    avatar: { type: String },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["admin", "member"], default: "member" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Group = model<IGroup>("Group", groupSchema);
