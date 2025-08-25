import cors from "cors";
import "dotenv/config";
import express from "express";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";

const app = express();

await connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.get("/", (req, res) => {
  res.send("Buzzconnect Server is Live");
});
app.use("/api/inngest", serve({ client: inngest, functions }));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Buzzconnect Server listening at http://localhost:${PORT}`);
});
