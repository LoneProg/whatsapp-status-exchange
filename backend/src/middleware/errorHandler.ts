/**
 * src/middleware/errorHandler.ts
 * Centralised Express error-handling middleware.
 * Catches all errors thrown by route handlers and returns consistent JSON.
 */

import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Operational errors (expected, user-facing)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma unique-constraint violation
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  ) {
    return res.status(409).json({
      success: false,
      message: "A record with that value already exists.",
    });
  }

  // Unknown / programming errors — don't leak internals
  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred. Please try again later.",
  });
};
