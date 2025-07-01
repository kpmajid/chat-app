//backend\src\models
import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  googleId: string;
  username: string;
  email: string;
  avatar?: string;
  online: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String, unique: true, sparse: true },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    avatar: String,
    online: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
