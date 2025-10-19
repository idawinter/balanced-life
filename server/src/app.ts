// server/src/app.ts
import express, { Request, Response } from "express";
import cors from "cors";
import { dailyRouter } from "./routes/daily";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/daily", dailyRouter);

// Health
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "balanced-life-api", time: new Date().toISOString() });
});

export default app;
