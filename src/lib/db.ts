import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { env, hasDatabase } from "./env";

const globalForPrisma = globalThis as unknown as { cwrPrisma?: PrismaClient | null };

function createClient(): PrismaClient | null {
  if (!hasDatabase || !env.DATABASE_URL) return null;
  const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient | null = globalForPrisma.cwrPrisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.cwrPrisma = prisma;

/** True when a real Neon database connection is configured. */
export const dbReady = prisma !== null;
