import type { NextFunction, Request, Response } from "express";
import { requireAuth } from "./requireAuth.js";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: "Admin role required" });
      return;
    }
    next();
  });
}
