// server/src/models/DailyMetrics.ts
import mongoose, { Schema, Document } from "mongoose";

/** One document per user per date */
export interface IDailyMetrics extends Document {
  userId: string;          // we'll hardcode a fake user for now until auth
  date: string;            // YYYY-MM-DD (UTC)
  metrics: {
    steps?: number;
    sleepHours?: number;   // float like 7.5
    hrv?: number;          // ms
    mindfulnessMin?: number;
    waterMl?: number;
    mood?: number;         // 1-5
  };
  menopause?: {
    hotFlashCount?: number;
    hotFlashIntensityAvg?: number; // 1-5
    nightSweats?: boolean;
    drynessLevel?: number;         // 0-5
    notes?: string;
  };
  supplements?: {
    glycineMg?: number;
    magnesiumMg?: number;
    collagen?: boolean;
    omega3?: boolean;
  };
  manualOverride?: {
    steps?: boolean;
    sleepHours?: boolean;
    hrv?: boolean;
    mindfulnessMin?: boolean;
  };
  sources?: Array<{
    provider: "manual" | "oura";
    metric: string; // e.g. "sleep" | "steps" | "hrv"
    providerEntryId?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DailyMetricsSchema = new Schema<IDailyMetrics>(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true }, // store as YYYY-MM-DD
    metrics: {
      steps: Number,
      sleepHours: Number,
      hrv: Number,
      mindfulnessMin: Number,
      waterMl: Number,
      mood: Number,
    },
    menopause: {
      hotFlashCount: Number,
      hotFlashIntensityAvg: Number,
      nightSweats: Boolean,
      drynessLevel: Number,
      notes: String,
    },
    supplements: {
      glycineMg: Number,
      magnesiumMg: Number,
      collagen: Boolean,
      omega3: Boolean,
    },
    manualOverride: {
      steps: Boolean,
      sleepHours: Boolean,
      hrv: Boolean,
      mindfulnessMin: Boolean,
    },
    sources: [
      {
        provider: { type: String, enum: ["manual", "oura"], required: true },
        metric: { type: String, required: true },
        providerEntryId: String,
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate day per user:
DailyMetricsSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyMetrics = mongoose.model<IDailyMetrics>(
  "DailyMetrics",
  DailyMetricsSchema
);
