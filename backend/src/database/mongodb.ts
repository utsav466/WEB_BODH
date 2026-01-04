import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export async function connectDB() {
  try {
    console.log("Connecting to MongoDB with URI:", MONGODB_URI);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // wait up to 5s
    });

    console.log("✅ Connected to MongoDB Atlas");
  } catch (error: any) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  }
}
