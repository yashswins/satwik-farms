/**
 * Order submission proxy — the security chokepoint for the web channel.
 *
 * The browser never holds the backend API key. On the web that key would be
 * readable in DevTools by every visitor, which is strictly worse than the mobile
 * situation where it is at least inside a compiled bundle. It lives in a Vercel
 * server environment variable and is attached here.
 *
 * Checks run cheapest-first so an attacker burns our resources as slowly as
 * possible: rate limit, honeypot, Turnstile, schema, then the upstream call.
 *
 * Note this proxy is a convenience layer, not a trust boundary. Everything that
 * matters — API key, price recomputation, promo minimum spend, item
 * availability, idempotency — is enforced again by the backend, because an
 * attacker with a stolen key skips this file entirely with one curl.
 */
import { rateLimit, clientIp } from '@/lib/order/rateLimit';
import { verifyTurnstile } from '@/lib/order/turnstile';

export const dynamic = 'force-dynamic';
// The backend chains several ERP calls synchronously; a cold Render instance can
// make the first order of the day slow. Give it room rather than timing out and
// leaving the customer unsure whether the order landed.
export const maxDuration = 60;

const BACKEND_BASE_URL = (
  process.env.BACKEND_BASE_URL || 'https://satwik-farms-backend.onrender.com'
).replace(/\/+$/, '');

const MAX_BODY_BYTES = 100_000;

function bad(error, status = 400, extra = {}) {
  return Response.json({ success: false, error, ...extra }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

/** Mirrors the backend's Pydantic bounds so bad input dies before the network hop. */
function validate(payload) {
  if (!payload || typeof payload !== 'object') return 'Invalid request.';

  const name = String(payload.customer_name ?? '').trim();
  if (name.length < 1 || name.length > 200) return 'Please enter your name.';

  const phone = String(payload.customer_phone ?? '').trim();
  if (phone.length < 6 || phone.length > 32) return 'Please enter a valid phone number.';

  const address = String(payload.customer_address ?? '').trim();
  if (address.length < 5 || address.length > 1000) {
    return 'Please enter your delivery address.';
  }

  if (!Array.isArray(payload.items) || payload.items.length < 1) {
    return 'Your cart is empty.';
  }
  if (payload.items.length > 100) return 'That is too many different items for one order.';

  for (const item of payload.items) {
    if (!item || typeof item !== 'object') return 'Your cart contains an invalid item.';
    if (!String(item.accu360_sku ?? '').trim()) {
      return 'One of the items in your cart is unavailable. Please remove it and try again.';
    }
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) return 'Invalid item quantity.';
    for (const field of ['unit_price', 'total_price']) {
      const v = Number(item[field]);
      if (!Number.isFinite(v) || v < 0 || v > 50_000_000) return 'Invalid item price.';
    }
  }

  for (const field of ['subtotal', 'delivery_fee', 'total']) {
    const v = Number(payload[field]);
    if (!Number.isFinite(v) || v < 0 || v > 50_000_000) return 'Invalid order total.';
  }

  return null;
}

export async function POST(request) {
  const ip = clientIp(request);

  // 1. Rate limit first — one Redis round trip, sheds load before anything costly.
  const perMinute = await rateLimit('orders', ip, { limit: 5, windowMs: 60_000 });
  if (!perMinute.success) {
    return Response.json(
      { success: false, error: 'Too many attempts. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } },
    );
  }
  const perHour = await rateLimit('orders_hourly', ip, { limit: 20, windowMs: 3_600_000 });
  if (!perHour.success) {
    return Response.json(
      { success: false, error: 'Too many orders from this connection today. Please contact us directly.' },
      { status: 429, headers: { 'Retry-After': '3600', 'Cache-Control': 'no-store' } },
    );
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return bad('That order is too large.', 413);
    body = JSON.parse(raw);
  } catch {
    return bad('Invalid request.');
  }

  const { turnstileToken, website, idempotencyKey, ...order } = body;

  // 2. Honeypot — a field no human ever sees, let alone fills in. Answer with a
  // plausible success so the bot does not learn it was detected.
  if (website) {
    console.warn(`[shop/orders] honeypot triggered from ${ip}`);
    return Response.json({ success: true, order_id: 'SF-PENDING' }, { status: 202 });
  }

  // 3. Turnstile.
  const turnstile = await verifyTurnstile(turnstileToken, ip);
  if (!turnstile.ok) {
    console.warn(`[shop/orders] turnstile rejected ${ip}: ${turnstile.reason}`);
    return bad(
      'The security check did not complete. Please wait a moment for it to finish, '
      + 'then try again.',
      403,
    );
  }

  // 4. Schema.
  const invalid = validate(order);
  if (invalid) return bad(invalid);

  // 5. Forward with the server-held key.
  const apiKey = process.env.APP_API_KEY_WEB;
  if (!apiKey) {
    console.error('[shop/orders] APP_API_KEY_WEB is not set — cannot submit orders.');
    return bad('Ordering is temporarily unavailable. Please try again shortly.', 503);
  }

  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        // Reused across retries of the same checkout attempt, so a timeout that
        // the customer retries cannot create a second Sales Order.
        'X-Idempotency-Key': String(idempotencyKey ?? '').slice(0, 64),
        'X-Platform': 'web',
        'X-App-Version': 'web-1.0.0',
        // The backend buckets its own rate limit by client IP; without this every
        // web order would share one bucket keyed to Vercel's egress address.
        'X-Forwarded-For': ip,
      },
      body: JSON.stringify(order),
      signal: AbortSignal.timeout(55_000),
    });

    const data = await upstream.json().catch(() => ({}));

    // The backend answers business rejections (unavailable item, stale price,
    // duplicate in flight) with HTTP 200 and success:false, because the mobile
    // app discards the body on any 4xx. Browsers have no such limitation, so
    // translate to a real status code here.
    if (upstream.ok && data.success === false) {
      return Response.json(data, { status: 409, headers: { 'Cache-Control': 'no-store' } });
    }
    if (!upstream.ok) {
      console.error(`[shop/orders] backend ${upstream.status}`);
      return bad(
        'We could not place your order just now. Your cart is safe — please try again.',
        502,
      );
    }

    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const timedOut = error.name === 'TimeoutError' || error.name === 'AbortError';
    console.error(`[shop/orders] upstream ${timedOut ? 'timeout' : 'error'}:`, error.message);
    return bad(
      timedOut
        ? 'The order is taking longer than expected. Please check your order history before retrying.'
        : 'We could not reach our ordering system. Your cart is safe — please try again.',
      504,
    );
  }
}
