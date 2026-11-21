/** Creates or updates the organizer account from ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD. */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config();
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !password || password.length < 8) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD (min 8 characters) in your environment first.");
  }
  const admin = await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash: await bcrypt.hash(password, 12) },
    update: { passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`Organizer ready: ${admin.email}`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
