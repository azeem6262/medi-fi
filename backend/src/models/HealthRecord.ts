import mongoose, { Schema, Document } from "mongoose";

export interface IHealthRecord extends Document {
  name: string;
  type: string;
  date: string;
  ipfsHash: string;
  ipfsUrl: string;
  ownerWallet: string;
  createdAt: Date;
  updatedAt: Date;
}

const HealthRecordSchema = new Schema<IHealthRecord>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    ipfsUrl: { type: String, required: true },
    ownerWallet: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const HealthRecord = mongoose.model<IHealthRecord>("HealthRecord", HealthRecordSchema);

