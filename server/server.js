import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { serve } from "inngest/express";
import connectDB from "./configs/db.js";
import { functions, inngest } from "./inngest/index.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

await connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// API Routes
app.get("/", (req, res) => {
  res.send("Buzzconnect Server is Live");
});
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Buzzconnect Server listening at http://localhost:${PORT}`);
});
