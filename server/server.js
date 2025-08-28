import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { serve } from "inngest/express";
import connectDB from "./configs/db.js";
import { functions, inngest } from "./inngest/index.js";
import messageRouter from "./routes/messageRoutes.js";
import postRouter from "./routes/postRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
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
app.post("/api/test-clerk-webhook", async (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).json({ received: true });
});
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Buzzconnect Server listening at http://localhost:${PORT}`);
});
