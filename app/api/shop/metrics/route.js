/**
 * Funnel counter endpoint.
 *
 * Increments per-day event counters in the same Upstash Redis the rate limiter
 * uses. Stores NOTHING about the visitor — no IP, no device id, no product —
 * just `sf:m:<event>:<date> += 1` (see lib/order/metricsShared.js).
 *
 * Always answers 204, valid or not. A prober should learn nothing, and a
 * customer's browser should never retry or log an analytics failure. Losing an
 * event to a Redis hiccup is fine; failing a page over one is not.
 *
 * Read the counters with `node scripts/shop-metrics-report.js` (uses the same
 * UPSTASH_* / KV_REST_API_* env vars).
 */
import { clientIp, rateLimit, redisCredentials } from '@/lib/order/rateLimit';
import { metricKeys, parseMetricEvent } from '@/lib/order/metricsShared';

export const dynamic = 'force-dynamic';

// ~13 months, so year-over-year comparison stays possible without the keys
// accumulating forever.
const COUNTER_TTL_SECONDS = 400 * 24 * 60 * 60;

const NO_CONTENT = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request) {
  try {
    // Generous — a real visitor produces a handful of events per screen. This
    // exists so a script cannot spin Redis writes for free.
    const limited = await rateLimit('metrics', clientIp(request), { limit: 60, windowMs: 60_000 });
    if (!limited.success) return NO_CONTENT();

    const raw = await request.text();
    if (raw.length > 512) return NO_CONTENT();
    let parsed = null;
    try {
      parsed = parseMetricEvent(JSON.parse(raw));
    } catch {
      return NO_CONTENT();
    }
    if (!parsed) return NO_CONTENT();

    const creds = redisCredentials();
    if (!creds) {
      // Same loud log as the rate limiter: a missing configuration must not
      // silently record nothing in production.
      if (process.env.NODE_ENV === 'production') {
        console.error('[shop/metrics] no Redis credentials — funnel events are being dropped');
      }
      return NO_CONTENT();
    }

    for (const key of metricKeys(parsed)) {
      // INCR, then set the TTL only when the key is new.
      const incr = await fetch(`${creds.url}/incr/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${creds.token}` },
        cache: 'no-store',
      });
      if (!incr.ok) continue;
      const count = Number((await incr.json()).result);
      if (count === 1) {
        await fetch(`${creds.url}/expire/${encodeURIComponent(key)}/${COUNTER_TTL_SECONDS}`, {
          headers: { Authorization: `Bearer ${creds.token}` },
          cache: 'no-store',
        });
      }
    }
  } catch (error) {
    console.error('[shop/metrics] dropped:', error.message);
  }
  return NO_CONTENT();
}
