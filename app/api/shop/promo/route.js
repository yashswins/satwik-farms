/**
 * Promo code validation.
 *
 * Exists because the catalogue proxy strips `promo_codes` before the browser
 * sees it — shipping the full list of codes, discounts and minimum spends to
 * every visitor would be handing out the codes. The browser submits a code and
 * a cart; the server answers with a discount or a reason.
 *
 * This is a convenience endpoint, not the enforcement point. The backend
 * revalidates the code and recomputes the discount against its own view of the
 * catalogue when the order is placed, so a forged response here buys nothing.
 *
 * The subtotal is recomputed from catalogue prices rather than trusted from the
 * request: promo codes are freely reusable by design, which makes minimum spend
 * the only guard, and a client that could name its own subtotal would clear any
 * threshold it liked.
 */
import { rateLimit, clientIp } from '@/lib/order/rateLimit';

export const dynamic = 'force-dynamic';

function truthy(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return ['yes', 'true', '1', 'y'].includes(value.trim().toLowerCase());
  return false;
}

export async function POST(request) {
  const ip = clientIp(request);
  // Codes are guessable; without a limit this is a free brute-force oracle.
  const limited = await rateLimit('promo', ip, { limit: 15, windowMs: 60_000 });
  if (!limited.success) {
    return Response.json(
      { valid: false, message: 'Too many attempts. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } },
    );
  }

  const url = process.env.CATALOG_API_URL;
  if (!url) {
    return Response.json({ valid: false, message: 'Promo codes are unavailable right now.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ valid: false, message: 'Invalid request.' }, { status: 400 });
  }

  const code = String(body?.code ?? '').trim().toUpperCase().slice(0, 64);
  const items = Array.isArray(body?.items) ? body.items.slice(0, 100) : [];
  if (!code) {
    return Response.json({ valid: false, message: 'Please enter a promo code.' }, { status: 400 });
  }

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) throw new Error(`catalog ${res.status}`);
    const catalog = await res.json();

    const priceBySku = new Map();
    for (const product of catalog.products ?? []) {
      for (const key of [product.accu360_sku, product.id]) {
        const k = String(key ?? '').trim();
        if (k && !priceBySku.has(k)) priceBySku.set(k, Number(product.price) || 0);
      }
    }
    const subtotal = items.reduce((sum, item) => {
      const price = priceBySku.get(String(item?.accu360_sku ?? item?.product_id ?? '').trim());
      if (price === undefined) return sum;
      const qty = Math.max(0, Math.min(999, Number(item?.quantity) || 0));
      return sum + price * qty;
    }, 0);

    const promo = (catalog.promo_codes ?? []).find(
      (p) => String(p.code ?? '').trim().toUpperCase() === code,
    );

    if (!promo) {
      return Response.json({ valid: false, message: 'Invalid promo code' },
        { headers: { 'Cache-Control': 'no-store' } });
    }
    if (!truthy(promo.active)) {
      return Response.json({ valid: false, message: 'This promo code has expired' },
        { headers: { 'Cache-Control': 'no-store' } });
    }
    const minimumSpend = Number(promo.minimum_spend) || 0;
    if (subtotal < minimumSpend) {
      return Response.json({
        valid: false,
        message: 'Minimum order amount not met for this promo code',
        minimumSpend,
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    return Response.json({
      valid: true,
      code,
      amountOff: Number(promo.amount_off) || 0,
      message: 'Promo code applied successfully!',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[shop/promo] validation failed:', error.message);
    return Response.json(
      { valid: false, message: 'Could not apply promo code. Please try again.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
