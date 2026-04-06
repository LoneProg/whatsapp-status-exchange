/**
 * src/routes/auth.routes.ts
 */

import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import { requireAdmin } from "../middleware/auth.middleware";

export const authRouter = Router();

// POST /api/auth/login
authRouter.post("/login", login);

// GET  /api/auth/me  (protected)
authRouter.get("/me", requireAdmin, getMe);
