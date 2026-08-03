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
 *  3. `promo_codes` are stripped here. The raw feed exposes every code, its
 *     discount and its minimum spend; that must never reach a customer's
 *     device. Promo validity is decided server-side (backend P0-6).
 *
 * The endpoint is also intermittently unreliable — it returned a transient 404
 * during the 2026-08-03 investigation — so responses are cached and a stale copy
 * is preferred over showing an empty shop.
 */

/**
 * Dynamic on purpose.
 *
 * With `revalidate` this route is prerendered at build time, which means a build
 * running without CATALOG_API_URL would bake a 503 into the cache and serve it
 * to real customers until the next revalidation. Running dynamically keeps the
 * caching under our control: successful responses carry s-maxage so Vercel's CDN
 * still serves them from the edge, while error responses carry no-store and are
 * never cached.
 */
export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 5 * 60 * 1000;
const STALE_MAX_MS = 60 * 60 * 1000;

// Module-scope cache. Survives between requests on a warm lambda; a cold one
// simply refetches. Not a correctness dependency, just latency insurance.
let cache = { data: null, fetchedAt: 0 };

async function fetchCatalog(url) {
  let lastStatus = 0;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 },
      });
      lastStatus = res.status;
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && Array.isArray(data.products)) return data;
      }
    } catch {
      // fall through to retry
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  throw new Error(`catalog fetch failed (last status ${lastStatus})`);
}

export async function GET() {
  const url = process.env.CATALOG_API_URL;
  if (!url) {
    return Response.json(
      { error: 'catalog_not_configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const age = Date.now() - cache.fetchedAt;
  if (cache.data && age < CACHE_TTL_MS) {
    return Response.json(cache.data, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=3600',
        'X-Catalog-Cache': 'hit',
      },
    });
  }

  try {
    const raw = await fetchCatalog(url);
    // Never ship promo codes to the browser.
    const { promo_codes: _promoCodes, ...publicCatalog } = raw;
    cache = { data: publicCatalog, fetchedAt: Date.now() };
    return Response.json(publicCatalog, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=3600',
        'X-Catalog-Cache': 'miss',
      },
    });
  } catch (error) {
    // A flaky upstream must not empty the shop.
    if (cache.data && age < STALE_MAX_MS) {
      console.warn(`[shop/catalog] serving stale catalogue (${Math.round(age / 1000)}s old):`, error.message);
      return Response.json(cache.data, {
        headers: { 'Cache-Control': 'no-store', 'X-Catalog-Cache': 'stale' },
      });
    }
    console.error('[shop/catalog] unavailable:', error.message);
    return Response.json(
      { error: 'catalog_unavailable' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
