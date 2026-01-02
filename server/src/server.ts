import cors from "cors";
import "dotenv/config";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";

import connectDB from "./configs/db.js";
import { validateEnv } from "./configs/validateEnv.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { functions, inngest } from "./inngest/index.js";

import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

validateEnv();

await connectDB();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://buzzconnect.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (_req, res) => {
  res.send("BuzzConnect Server is Live");
});

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
