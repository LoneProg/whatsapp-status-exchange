/**
 * src/services/auth.service.ts
 * Business logic for admin authentication.
 */

import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { signToken } from "../utils/jwt.utils";
import { AppError } from "../middleware/errorHandler";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  admin: { id: string; email: string };
}

/**
 * Validate credentials and return a signed JWT on success.
 * Throws AppError on invalid credentials.
 */
export async function loginAdmin(dto: LoginDto): Promise<LoginResult> {
  // 1. Look up admin by email
  const user = await prisma.user.findUnique({ where: { email: dto.email } });

  if (!user) {
    // Deliberate vague message to avoid user enumeration
    throw new AppError(401, "Invalid email or password.");
  }

  // 2. Verify password
  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) {
    throw new AppError(401, "Invalid email or password.");
  }

  // 3. Issue JWT
  const token = signToken({ userId: user.id, email: user.email });

  return {
    token,
    admin: { id: user.id, email: user.email },
  };
}
