/**
 * src/index.ts
 * Application entry point — boots Express, wires middleware & routes.
 */

import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth.routes";
import { contactRouter } from "./routes/contact.routes";
import { adminRouter } from "./routes/admin.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// If behind a proxy (e.g. in production), trust the first proxy for correct IPs
app.set("trust proxy", 1);

const PORT = process.env.PORT ?? 4000;

// ── Security headers ─────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);

// ── Body parsing ─────────────────────────────────────────
app.use(express.json());

// ── Global rate limiter ──────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900_000), // 15 min
  max: Number(process.env.RATE_LIMIT_MAX ?? 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// ── Health check ─────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/admin", adminRouter);

// ── 404 catch-all ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global error handler ──────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV ?? "development"}`);
});

export default app;
