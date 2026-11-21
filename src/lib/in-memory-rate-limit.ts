/**
 * Lightweight per-instance limiter for high-volume, read-only routes such as
 * image delivery. It avoids a database write per thumbnail while still
 * throttling ID probing on a warm serverless instance.
 */
const memory = new Map<string, number[]>();

export function checkInMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): { ok: boolean; remaining: number; retryAfter: number } {
  const hits = (memory.get(key) ?? []).filter((time) => time > now - windowMs);

  // Bound memory growth for long-lived instances.
  if (memory.size > 5000) {
    for (const [storedKey, times] of memory) {
      if (!times.some((time) => time > now - windowMs)) memory.delete(storedKey);
    }
  }

  if (hits.length >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil(windowMs / 1000)) };
  }
  hits.push(now);
  memory.set(key, hits);
  return { ok: true, remaining: Math.max(0, limit - hits.length), retryAfter: 0 };
}

const MEDIA_REQUEST_LIMIT = 300;
const MEDIA_WINDOW_MS = 60_000;

/** Generous enough for a full gallery load plus lightbox navigation. */
export function checkMediaRateLimit(clientIp: string) {
  return checkInMemoryRateLimit(`media:${clientIp}`, MEDIA_REQUEST_LIMIT, MEDIA_WINDOW_MS);
}
