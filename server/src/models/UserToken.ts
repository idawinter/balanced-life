import mongoose, { Schema, Document } from "mongoose";

export interface IUserToken extends Document {
  userId: string;              // your app’s user id
  provider: "oura";
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;            // if Oura returns expiry later
  createdAt: Date;
  updatedAt: Date;
}

const UserTokenSchema = new Schema<IUserToken>(
  {
    userId: { type: String, required: true, index: true },
    provider: { type: String, enum: ["oura"], required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

UserTokenSchema.index({ userId: 1, provider: 1 }, { unique: true });

export const UserToken = mongoose.model<IUserToken>("UserToken", UserTokenSchema);
