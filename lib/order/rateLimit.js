/**
 * Per-IP rate limiting for the shop API routes.
 *
 * Uses Upstash Redis when configured. An in-process Map is NOT a valid
 * substitute in production — Vercel runs many lambda instances, each with its
 * own memory, so a local counter resets constantly and an attacker simply
 * spreads requests across instances. The fallback below exists so local
 * development works, and it logs loudly so a missing configuration cannot pass
 * silently into production.
 */

const memoryBuckets = new Map();

function memoryLimit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  bucket.count += 1;
  return {
    success: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

/**
 * Redis REST credentials.
 *
 * Accepts both naming conventions because they arrive differently depending on
 * how the database was created: Upstash's own console uses UPSTASH_REDIS_REST_*,
 * while Vercel's Marketplace integration injects KV_REST_API_*. Supporting both
 * means the integration can be set up either way without a code change.
 */
export function redisCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

async function upstashLimit(key, limit, windowMs) {
  const { url, token } = redisCredentials();
  const windowSeconds = Math.ceil(windowMs / 1000);

  // INCR then EXPIRE on first hit — a fixed window, which is all we need here.
  const incr = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!incr.ok) throw new Error(`upstash incr failed: ${incr.status}`);
  const count = Number((await incr.json()).result);

  if (count === 1) {
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${windowSeconds}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  }

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: Date.now() + windowMs,
  };
}

/**
 * @returns {Promise<{success: boolean, remaining: number, resetAt: number}>}
 * Fails OPEN if Redis is unreachable: a rate limiter outage must not stop
 * customers ordering. The backend enforces its own limit independently, so an
 * attacker still cannot flood the ERP.
 */
export async function rateLimit(bucket, ip, { limit, windowMs }) {
  const key = `shop:${bucket}:${ip}`;

  if (!redisCredentials()) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[shop] No Redis credentials (UPSTASH_REDIS_REST_* or KV_REST_API_*) — falling '
        + 'back to per-instance in-memory rate limiting, which does NOT hold across '
        + 'Vercel lambdas.',
      );
    }
    return memoryLimit(key, limit, windowMs);
  }

  try {
    return await upstashLimit(key, limit, windowMs);
  } catch (error) {
    console.error('[shop] rate limit backend unavailable, allowing request:', error.message);
    return { success: true, remaining: 0, resetAt: Date.now() + windowMs };
  }
}

/** Originating client IP, as seen through Vercel's proxy. */
export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
