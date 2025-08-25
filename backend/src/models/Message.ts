import { Schema, model, Document, Types } from "mongoose";

import { IConversation } from "./Conversation";
import { IUser } from "./User";

export interface IMessage extends Document {
  conversation: Types.ObjectId | IConversation;
  sender: Types.ObjectId | IUser;
  content: string;
  readBy?: Types.ObjectId[];
  editedAt?: Date;

  isDeleted: boolean;
  deletedAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    editedAt: Date,

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, isDeleted: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ readBy: 1 });

export const Message = model<IMessage>("Message", messageSchema);
