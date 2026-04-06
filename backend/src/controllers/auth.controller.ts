/**
 * src/controllers/auth.controller.ts
 * HTTP layer for admin authentication.
 */

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { loginAdmin } from "../services/auth.service";
import { AppError } from "../middleware/errorHandler";

const LoginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

/**
 * POST /api/auth/login
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = LoginSchema.safeParse(req.body);

    if (!parsed.success) {
      const formatted = z.flattenError(parsed.error);
      throw new AppError(
        400,
        Object.values(formatted.fieldErrors).flat().join(" | "),
      );
    }

    const result = await loginAdmin(parsed.data);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated admin's info.
 */
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.admin) {
      throw new AppError(401, "Unauthorised.");
    }

    res.status(200).json({
      success: true,
      data: { id: req.admin.userId, email: req.admin.email },
    });
  } catch (err) {
    next(err);
  }
}
