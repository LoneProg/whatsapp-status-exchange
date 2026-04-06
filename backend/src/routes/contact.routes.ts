/**
 * src/routes/contact.routes.ts
 * Public contact submission — extra rate limiting applied.
 */

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { submitContact } from "../controllers/contact.controller";

// Tight limiter for the submission endpoint — prevents spam
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // max 5 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions from this IP. Please wait 15 minutes and try again.",
  },
});

export const contactRouter = Router();

// POST /api/contacts
contactRouter.post("/", submissionLimiter, submitContact);
