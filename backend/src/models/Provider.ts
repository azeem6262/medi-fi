import mongoose, { Schema, Document } from "mongoose";

export interface IProvider extends Document {
  name: string;
  walletAddress: string;
  createdAt: Date;
  recordsAccessCount?: number;
}

const ProviderSchema = new Schema<IProvider>(
  {
    name: { type: String, required: true },
    walletAddress: { type: String, required: true, unique: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const Provider = mongoose.model<IProvider>("Provider", ProviderSchema);

