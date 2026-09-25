import type { Redis } from '@upstash/redis/cloudflare';

// Vercel's edge network sets x-forwarded-for itself and does not forward an
// externally-supplied value on standard (non-Enterprise "trusted proxy")
// deployments — but x-vercel-forwarded-for is the platform's own documented,
// non-overridable client-IP header, so it's used here as the primary source
// with x-forwarded-for only as a fallback for local/`vercel dev` testing
// where that header isn't present. IPv6 addresses are collapsed to their
// /64 prefix so trivial privacy-extension address rotation within one
// network doesn't create a fresh rate-limit bucket per request.
export function getClientIp(request: Request): string | null {
  const trusted = request.headers.get('x-vercel-forwarded-for');
  const fallback = request.headers.get('x-forwarded-for');
  const raw = (trusted ?? fallback)?.split(',')[0]?.trim();
  if (!raw) return null;

  if (raw.includes(':') && !raw.includes('.')) {
    // IPv6 — collapse to /64.
    const groups = raw.split(':').filter(Boolean);
    return groups.slice(0, 4).join(':') + '::/64';
  }
  return raw;
}

export interface RateLimitOptions {
  redis: Redis;
  /** Redis key for this specific bucket (already namespaced by caller). */
  key: string;
  windowSeconds: number;
}

/**
 * Atomic set-with-TTL rate limit: returns true if this call is the first in
 * the window (i.e. allowed), false if the window is already consumed.
 * Using SET NX EX instead of INCR+EXPIRE avoids the race where a crash or
 * timeout between the two separate calls could leave a permanent,
 * never-expiring key for that bucket.
 */
export async function consumeRateLimit({ redis, key, windowSeconds }: RateLimitOptions): Promise<boolean> {
  const result = await redis.set(key, 1, { nx: true, ex: windowSeconds });
  return result === 'OK';
}

/**
 * A shared global ceiling (independent of per-IP buckets) so that
 * IP-rotation abuse can't multiply total upstream (Gemini) spend just by
 * spreading requests across many distinct addresses/spoofed headers.
 * Returns true if this call is still within the global cap.
 */
export async function consumeGlobalQuota(redis: Redis, key: string, cap: number, windowSeconds: number): Promise<boolean> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return count <= cap;
}
