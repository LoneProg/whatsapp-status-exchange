/**
 * prisma/seed.ts
 * Seeds the database with the initial admin user.
 *
 * Usage:
 *   npx ts-node prisma/seed.ts
 *   -- or --
 *   npm run db:seed
 *
 * Reads credentials from environment (or uses safe defaults for dev).
 * ALWAYS change ADMIN_EMAIL and ADMIN_PASSWORD in production.
 */

import bcrypt from "bcryptjs";
import 'dotenv/config';
import { prisma } from "../dist/utils/prisma";


async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@waexchange.local";
  const rawPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345!";

  // Hash with cost factor 12
  const password = await bcrypt.hash(rawPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { password }, // refresh hash if re-seeded
    create: { email, password },
  });

  console.log("✅ Admin seeded:", admin.email);
  console.log("   Default password:", rawPassword);
  console.log("   ⚠️  Change this password immediately in production!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
