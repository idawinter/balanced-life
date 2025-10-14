import express, { Request, Response } from "express";
import mongoose from "mongoose";
import "dotenv/config";   // loads .env automatically

const app = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from Balanced Life backend (TypeScript + MongoDB)!");
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "balanced-life-api", time: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "";

// connect to MongoDB first, then start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
