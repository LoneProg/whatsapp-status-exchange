/**
 * src/controllers/contact.controller.ts
 * HTTP layer for public contact submission.
 */

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createContact } from "../services/contact.service";
import { AppError } from "../middleware/errorHandler";

// ── Zod validation schema ─────────────────────────────────
const CreateContactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must not exceed 100 characters.")
    .trim(),
  phone: z
    .string()
    .min(7, "Phone number is too short.")
    .max(20, "Phone number is too long.")
    .trim(),
});

/**
 * POST /api/contacts
 * Public endpoint — no authentication required.
 */
export async function submitContact(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = CreateContactSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        400,
        parsed.error.errors.map((e) => e.message).join(" | ")
      );
    }

    const contact = await createContact(parsed.data);

    res.status(201).json({
      success: true,
      message: "Contact submitted successfully! We'll add you to the group.",
      data: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
      },
    });
  } catch (err) {
    next(err);
  }
}
