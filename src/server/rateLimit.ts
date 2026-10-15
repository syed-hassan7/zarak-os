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
    return ipv6Prefix64(raw);
  }
  return raw;
}

/**
 * First four hextets of an IPv6 address, with `::` correctly expanded first.
 * (Naively splitting on ':' and dropping empty groups loses the position of
 * `::`, so `2001:db8:1::1` and `2001:db8:1::2` — same /64 — landed in
 * different buckets.)
 */
export function ipv6Prefix64(address: string): string {
  const withoutZone = address.split('%')[0].toLowerCase();
  const [head = '', tail = ''] = withoutZone.split('::');
  const headGroups = head ? head.split(':') : [];
  const tailGroups = tail ? tail.split(':') : [];
  const missing = Math.max(0, 8 - headGroups.length - tailGroups.length);
  const groups = [...headGroups, ...Array<string>(missing).fill('0'), ...tailGroups];
  return (
    groups
      .slice(0, 4)
      .map((group) => group.replace(/^0+(?=.)/, ''))
      .join(':') + '::/64'
  );
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
 * Fixed-window counter: returns true while this call is within `cap` for the
 * window. INCR and EXPIRE NX go out as one MULTI/EXEC transaction, so the key
 * always gets a TTL — a timeout between two separate calls (or a retried INCR
 * returning 2, which skipped the old `count === 1` EXPIRE) could previously
 * leave a counter that never expired and locked everyone out permanently.
 * EXPIRE NX only sets a TTL when none exists, so later hits don't slide the
 * window.
 */
export async function consumeCounter(
  redis: Redis,
  key: string,
  cap: number,
  windowSeconds: number,
): Promise<boolean> {
  const [count] = await redis.multi().incr(key).expire(key, windowSeconds, 'NX').exec<[number, number]>();
  return count <= cap;
}

/**
 * A shared global ceiling (independent of per-IP buckets) so that
 * IP-rotation abuse can't multiply total upstream (Gemini) spend just by
 * spreading requests across many distinct addresses/spoofed headers.
 * Returns true if this call is still within the global cap. Callers must
 * check their per-IP limit FIRST — a request the per-IP limiter would reject
 * must not consume global budget, or one abusive IP can drain the global cap
 * and lock out every honest visitor.
 */
export function consumeGlobalQuota(redis: Redis, key: string, cap: number, windowSeconds: number): Promise<boolean> {
  return consumeCounter(redis, key, cap, windowSeconds);
}
