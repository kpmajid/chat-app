import { Schema, model, Document, Types } from "mongoose";

import { IUser } from "./User";
import { IConversation } from "./Conversation";
import { IMessage } from "./Message";
import { timeStamp } from "console";

export type NotificationType = "message" | "mention";

export interface INotification extends Document {
  user: Types.ObjectId | IUser;
  type: NotificationType;
  conversation: Types.ObjectId | IConversation;
  message?: Types.ObjectId | IMessage;
  read: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["message", "mention"], required: true },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = model<INotification>(
  "Notification",
  notificationSchema
);
