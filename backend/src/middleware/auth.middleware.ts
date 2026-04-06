/**
 * src/middleware/auth.middleware.ts
 * Protects admin routes by validating the Bearer JWT in the Authorization header.
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken, AdminTokenPayload } from "../utils/jwt.utils";

// Augment Express Request to carry the decoded admin payload
declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Unauthorised: no token provided." });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload = verifyToken(token);
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Unauthorised: invalid or expired token." });
  }
}
