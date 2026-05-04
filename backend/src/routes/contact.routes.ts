/**
 * src/routes/contact.routes.ts
 * Public contact submission — extra rate limiting applied.
 */

import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getContactsCount,
  submitContact,
} from "../controllers/contact.controller";

// Tight limiter for the submission endpoint — prevents spam
const submissionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 5 minutes
  max: 5, // max 5 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many submissions from this IP. Please wait 5 minutes and try again.",
  },
});

export const contactRouter = Router();

// POST /api/contacts
contactRouter.post("/", submissionLimiter, submitContact);

//GET /api/contact/contacts-count
contactRouter.get("/contacts-count", getContactsCount);
