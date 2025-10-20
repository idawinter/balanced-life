// server/src/routes/auth.ts
import { Router, Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User";

export const authRouter = Router();

const bodySchema = z.object({
  email: z.string().email(),
});

// POST /auth/login  { email }
// Creates user if not exists, returns { ok, userId, email }
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email } = bodySchema.parse(req.body);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }

    return res.json({ ok: true, userId: user._id.toString(), email: user.email });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: "ValidationError", issues: err.issues });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "ServerError" });
  }
});
