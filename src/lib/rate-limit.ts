import { prisma } from "./db";
import { checkInMemoryRateLimit } from "./in-memory-rate-limit";

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ ok: boolean; remaining: number; retryAfter: number }> {
  const now = Date.now();
  if (prisma) {
    const since = new Date(now - windowMs);
    try {
      const recent = await prisma.rateLimitEvent.count({ where: { key, createdAt: { gte: since } } });
      if (recent >= limit) {
        return { ok: false, remaining: 0, retryAfter: Math.ceil(windowMs / 1000) };
      }
      await prisma.rateLimitEvent.create({ data: { key } });
      await prisma.rateLimitEvent.deleteMany({ where: { createdAt: { lt: new Date(now - windowMs * 4) } } });
      return { ok: true, remaining: Math.max(0, limit - recent - 1), retryAfter: 0 };
    } catch {
      // Fail open for availability; validation and moderation still apply.
    }
  }
  return checkInMemoryRateLimit(key, limit, windowMs, now);
}
