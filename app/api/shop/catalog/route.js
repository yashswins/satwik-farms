/**
 * Catalogue proxy.
 *
 * The browser only ever talks to this origin. That matters for three reasons:
 *
 *  1. The site's CSP is `connect-src 'self'` — a direct browser fetch to the
 *     Apps Script endpoint would be blocked, and widening the CSP to allow it
 *     would weaken every page on the site.
 *  2. Apps Script `/exec` deployments do not reliably emit CORS headers, so the
 *     direct call would fail from a browser regardless.
 *  3. `promo_codes` are filtered here. The raw feed exposes every code, its
 *     discount and its minimum spend; that must never reach a customer's
 *     device. Only AUTO-APPLYING codes are forwarded, because those are granted
 *     to everyone who qualifies and are shown at checkout anyway — there is
 *     nothing left to keep secret about them. Typed codes stay server-side, and
 *     the server revalidates every discount regardless.
 *
 * Fetching, retrying and caching live in lib/order/serverCatalog so that every
 * route touching the sheet gets the same resilience.
 */
import { promoBannerFrom, truthy } from '@/lib/order/catalog';
import { getServerCatalog } from '@/lib/order/serverCatalog';

/**
 * Dynamic on purpose.
 *
 * With `revalidate` this route is prerendered at build time, which means a build
 * running without CATALOG_API_URL would bake a 503 into the cache and serve it
 * to real customers. Running dynamically keeps caching under our control:
 * successful responses carry s-maxage so Vercel's CDN still serves them from the
 * edge, while error responses carry no-store and are never cached.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.CATALOG_API_URL) {
    return Response.json(
      { error: 'catalog_not_configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const { catalog, stale, cached } = await getServerCatalog();
    // Two deliberate exceptions to "never ship promo codes":
    //
    //  - `promo_banner`: the single best active code, advertised exactly as the
    //    phone app's home banner does. One public code is marketing; the full
    //    list with minimum spends would be a leak.
    //  - auto-applying codes: the customer gets these without typing anything
    //    and sees them itemised at checkout, so withholding the rule would only
    //    stop the browser showing a discount it is about to be given anyway.
    //
    // A code the customer must know to type is still withheld.
    const { promo_codes: promoCodes, ...publicCatalog } = catalog;
    const promoBanner = promoBannerFrom(promoCodes);
    if (promoBanner) publicCatalog.promo_banner = promoBanner;
    publicCatalog.promo_codes = (promoCodes ?? []).filter(
      (p) => truthy(p?.active) && truthy(p?.auto_apply),
    );
    return Response.json(publicCatalog, {
      headers: {
        // A stale copy must not be cached at the edge as though it were fresh.
        'Cache-Control': stale ? 'no-store' : 's-maxage=120, stale-while-revalidate=3600',
        'X-Catalog-Cache': stale ? 'stale' : (cached ? 'hit' : 'miss'),
      },
    });
  } catch (error) {
    console.error('[shop/catalog] unavailable:', error.message);
    return Response.json(
      { error: 'catalog_unavailable' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
