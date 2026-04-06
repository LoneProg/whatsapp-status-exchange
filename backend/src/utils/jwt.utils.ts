/**
 * src/utils/jwt.utils.ts
 * Thin wrappers around jsonwebtoken for signing and verifying admin tokens.
 */

import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "8h") as SignOptions["expiresIn"];

export interface AdminTokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

/**
 * Sign a JWT for the given admin user.
 */
export function signToken(payload: Omit<AdminTokenPayload, keyof JwtPayload>): string {
  if (!SECRET) throw new Error("JWT_SECRET is not defined in environment.");

  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * Verify and decode a JWT.
 * Throws if expired or tampered.
 */
export function verifyToken(token: string): AdminTokenPayload {
  return jwt.verify(token, SECRET) as AdminTokenPayload;
}
