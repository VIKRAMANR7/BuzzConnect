import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const MONGO_URI = process.env.MONGODB_URI!;

  try {
    await mongoose.connect(MONGO_URI, { dbName: "buzzconnect" });

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
