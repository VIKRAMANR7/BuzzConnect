import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

export async function connectDB(): Promise<void> {
  if (!MONGO_URI) {
    throw new Error("❌ MONGODB_URI is missing in environment variables.");
  }

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "buzzconnect",
    });

    console.log("📦 MongoDB Connected Successfully!");

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export default connectDB;
