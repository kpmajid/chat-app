import { Schema, model, Document, Types } from "mongoose";

import { IUser } from "./User";

export type ConversationType = "user" | "group";

export interface IConversation extends Document {
  type: ConversationType;
  participants: Types.ObjectId[] | IUser[];
  group?: Types.ObjectId;
  lastMessage?: Types.ObjectId;
}

const conversationSchema = new Schema<IConversation>(
  {
    type: { type: String, enum: ["user", "group"], required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    group: { type: Schema.Types.ObjectId, ref: "Group" },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, type: 1 });
conversationSchema.index({ lastMessage: -1 });

export const Conversation = model<IConversation>(
  "Conversation",
  conversationSchema
);
