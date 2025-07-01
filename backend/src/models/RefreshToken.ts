//backend\src\modles
import { Schema, model, Document, Types } from "mongoose";

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  token: string;
  expiresAt: Date;
  revoked: boolean;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, expires: "1d" },
  revoked: { type: Boolean, default: false },
});

// refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
