// server/src/routes/daily.ts
import { Router, Request, Response } from "express";
import { z } from "zod";
import { DailyMetrics } from "../models/DailyMetrics";

// For now, we’ll fake a single user id.
// Later, auth will set this automatically.
const FAKE_USER_ID = "demo-user-1";

// --- Validation schemas (Zod) ---
const metricsSchema = z.object({
  steps: z.number().int().nonnegative().optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  hrv: z.number().min(0).optional(),
  mindfulnessMin: z.number().int().min(0).optional(),
  waterMl: z.number().int().min(0).optional(),
  mood: z.number().int().min(1).max(5).optional(),
});

const menopauseSchema = z.object({
  hotFlashCount: z.number().int().min(0).optional(),
  hotFlashIntensityAvg: z.number().int().min(1).max(5).optional(),
  nightSweats: z.boolean().optional(),
  drynessLevel: z.number().int().min(0).max(5).optional(),
  notes: z.string().max(1000).optional(),
});

const supplementsSchema = z.object({
  glycineMg: z.number().int().min(0).optional(),
  magnesiumMg: z.number().int().min(0).optional(),
  collagen: z.boolean().optional(),
  omega3: z.boolean().optional(),
});

const bodySchema = z.object({
  metrics: metricsSchema.optional(),
  menopause: menopauseSchema.optional(),
  supplements: supplementsSchema.optional(),
  manualOverride: z
    .object({
      steps: z.boolean().optional(),
      sleepHours: z.boolean().optional(),
      hrv: z.boolean().optional(),
      mindfulnessMin: z.boolean().optional(),
    })
    .optional(),
});

// Simple YYYY-MM-DD checker
const dateParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

export const dailyRouter = Router();

/**
 * Upsert a day's entry
 * POST /daily/:date
 * body: { metrics?, menopause?, supplements?, manualOverride? }
 */
dailyRouter.post("/:date", async (req: Request, res: Response) => {
  try {
    const date = dateParamSchema.parse(req.params.date);
    const body = bodySchema.parse(req.body);

    const doc = await DailyMetrics.findOneAndUpdate(
      { userId: FAKE_USER_ID, date },
      { userId: FAKE_USER_ID, date, ...body },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ ok: true, data: doc });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: "ValidationError", details: err.errors });
    }
    console.error(err);
    res.status(500).json({ ok: false, error: "ServerError" });
  }
});

/**
 * Get a range for charts
 * GET /daily?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
dailyRouter.get("/", async (req: Request, res: Response) => {
  try {
    const from = dateParamSchema.parse(req.query.from);
    const to = dateParamSchema.parse(req.query.to);

    const data = await DailyMetrics.find({
      userId: FAKE_USER_ID,
      date: { $gte: from, $lte: to },
    }).sort({ date: 1 });

    res.json({ ok: true, count: data.length, data });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: "ValidationError", details: err.errors });
    }
    console.error(err);
    res.status(500).json({ ok: false, error: "ServerError" });
  }
});
