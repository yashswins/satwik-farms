/**
 * Funnel metrics — the parts shared by the client beacon and the API route.
 *
 * Design constraints, in order:
 *   1. No PII, ever. Events are bare counters — no customer fields, no product
 *      ids, no session ids, no IP stored. The only dimension besides the event
 *      name is a boolean "returning device" flag on order_placed.
 *   2. Same-origin only. The beacon posts to /api/shop/metrics, so the CSP's
 *      connect-src 'self' is untouched. (Vercel's custom events would have
 *      needed a paid plan; the funnel's page-view steps still come free from
 *      the existing pageview analytics.)
 *   3. Counters live in the Upstash Redis already used for rate limiting:
 *      one INCR per event per day, keyed in Dar es Salaam local time so a
 *      "day" matches the business day.
 */

/** The complete funnel. Anything else is dropped without comment. */
export const METRIC_EVENTS = [
  'shop_viewed',
  'product_viewed',
  'added_to_cart',
  'checkout_started',
  'order_placed',
  'order_failed',
];

/** Calendar date (YYYY-MM-DD) in Dar es Salaam for a given instant. */
export function metricDate(date = new Date()) {
  // en-CA formats as YYYY-MM-DD directly.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Dar_es_Salaam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Validate a beacon payload. Returns `{ event, returning, source }` or null.
 * Anything malformed is null — the route answers 204 either way, so a probe
 * learns nothing from the response.
 *
 * `source` separates the two shops: the phone app posts `source: "app"`
 * (mobile 1.7.0+, utils/metrics.ts), everything else counts as the web.
 * Mixing the surfaces into one counter would silently change what the web
 * funnel numbers mean on the day the app ships.
 */
export function parseMetricEvent(body) {
  if (!body || typeof body !== 'object') return null;
  const { event, returning, source } = body;
  if (!METRIC_EVENTS.includes(event)) return null;
  return {
    event,
    returning: returning === true,
    source: source === 'app' ? 'app' : 'web',
  };
}

/** Redis keys to increment for one event. */
export function metricKeys({ event, returning, source }, date = metricDate()) {
  const prefix = source === 'app' ? 'sf:m:app' : 'sf:m';
  const keys = [`${prefix}:${event}:${date}`];
  // Reorder rate = order_placed:r / order_placed for the same day.
  if (returning && event === 'order_placed') keys.push(`${prefix}:${event}:r:${date}`);
  return keys;
}
