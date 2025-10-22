// server/src/app.ts
import express, { Request, Response } from "express";
import cors from "cors";
import { dailyRouter } from "./routes/daily";
import { authRouter } from "./routes/auth";
import { requireUser } from "./middleware/auth";
import { ouraRouter } from "./routes/oura";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRouter);                 // public
app.use("/daily", requireUser, dailyRouter);  // protected
app.use("/oura", ouraRouter);

// Health
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "balanced-life-api", time: new Date().toISOString() });
});

export default app;
