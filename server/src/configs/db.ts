import mongoose from "mongoose";

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI!, { dbName: "buzzconnect" });
  console.log("MongoDB Connected");
}

export default connectDB;
