import mongoose, { Schema, Document } from "mongoose";

export interface IAccessGrant extends Document {
  recordId: string;
  providerWallet: string;
  providerName?: string;
  expiresAt: Date;
  createdAt: Date;
  status: "active" | "expired" | "revoked";
}

const AccessGrantSchema = new Schema<IAccessGrant>(
  {
    recordId: { type: String, required: true, index: true },
    providerWallet: { type: String, required: true, index: true },
    providerName: { type: String },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const AccessGrant = mongoose.model<IAccessGrant>("AccessGrant", AccessGrantSchema);

