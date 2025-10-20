// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Reads x-user-id into req.userId; 401 if missing when required
export function requireUser(req: Request, res: Response, next: NextFunction) {
  const id = req.header("x-user-id");
  if (!id) {
    return res.status(401).json({ ok: false, error: "Unauthorized", message: "Missing x-user-id" });
  }
  req.userId = id;
  next();
}
