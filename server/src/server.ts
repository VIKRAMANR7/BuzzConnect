import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import "dotenv/config";

import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";

import connectDB from "@/configs/db.js";
import { functions, inngest } from "@/inngest/index.js";
import messageRouter from "@/routes/messageRoutes.js";
import postRouter from "@/routes/postRoutes.js";
import storyRouter from "@/routes/storyRoutes.js";
import userRouter from "@/routes/userRoutes.js";

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Simple logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// Health Check Route
app.get("/", (_req: Request, res: Response) => {
  res.send("Buzzconnect Server is Live");
});

// Inngest Handler
app.use("/api/inngest", serve({ client: inngest, functions }));

// Test Clerk Webhook
app.post("/api/test-clerk-webhook", (req: Request, res: Response) => {
  console.log("Webhook received:", req.body);
  return res.status(200).json({ received: true });
});

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

// Global Error Handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Server Error:", err);

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

export async function startServer(): Promise<void> {
  try {
    await connectDB();

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(`🚀 Buzzconnect server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

export default app;

startServer();
