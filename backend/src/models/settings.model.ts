import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  storeName: string;
  supportEmail: string;
  currency: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    storeName: { type: String, default: "Online Book Store" },
    supportEmail: { type: String, default: "support@example.com" },
    currency: { type: String, default: "USD" },
  },
  { timestamps: true }
);

export const SettingsModel =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);