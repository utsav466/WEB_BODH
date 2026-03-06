import mongoose, { Document, Schema } from "mongoose";

export type BookStatus = "active" | "draft";

export interface IBook extends Document {
  title: string;
  author: string;
  category: string;
  isbn?: string;
  price: number;
  stock: number;
  status: BookStatus;
  description?: string;
  coverUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["active", "draft"], default: "active" },
    description: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const BookModel = mongoose.model<IBook>("Book", BookSchema);