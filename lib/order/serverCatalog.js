/**
 * Server-side catalogue fetch, shared by every route that needs the sheet.
 *
 * The Apps Script endpoint is genuinely unreliable — within a few minutes on
 * 2026-08-03 it returned a 302, a 404 and a Google Drive "unable to open the
 * file" HTML page before finally serving JSON. Any route that calls it naively
 * will fail for customers at that rate.
 *
 * This is one module rather than logic duplicated per route because the promo
 * endpoint originally had its own bare fetch: a customer entering a valid code
 * was told "Could not apply promo code. Please try again." purely because
 * Google hiccupped, while the catalogue on the same page loaded fine from its
 * retrying fetcher. Shared resilience or none.
 *
 * NOTE the deliberate `cache: 'no-store'`. Next's data cache is written to disk
 * and survives restarts and deploys, so a `revalidate` here silently outranks
 * the module cache and can serve a catalogue from before the sheet was last
 * edited — observed when newly activated rows failed to appear at all.
 */

const CACHE_TTL_MS = 5 * 60 * 1000;
const STALE_MAX_MS = 60 * 60 * 1000;
const ATTEMPTS = 3;

let cache = { data: null, fetchedAt: 0 };

function looksLikeCatalog(data) {
  return Boolean(data && typeof data === 'object' && Array.isArray(data.products));
}

async function fetchFresh(url) {
  let lastError = 'unknown';
  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (res.ok) {
        // A Drive error page is served as HTML with a 200, so parsing must be
        // guarded rather than assumed from the status code.
        const data = await res.json().catch(() => null);
        if (looksLikeCatalog(data)) return data;
        lastError = 'non-catalogue body';
      } else {
        lastError = `HTTP ${res.status}`;
      }
    } catch (error) {
      lastError = error.message;
    }
    if (attempt < ATTEMPTS - 1) {
      await new Promise((r) => { setTimeout(r, 400 * (attempt + 1)); });
    }
  }
  throw new Error(lastError);
}

/**
 * @returns {Promise<{catalog: object, stale: boolean, cached: boolean}>}
 * @throws when the upstream fails and no usable cached copy exists.
 */
export async function getServerCatalog() {
  const url = process.env.CATALOG_API_URL;
  if (!url) throw new Error('CATALOG_API_URL is not set');

  const age = Date.now() - cache.fetchedAt;
  if (cache.data && age < CACHE_TTL_MS) {
    return { catalog: cache.data, stale: false, cached: true };
  }

  try {
    const data = await fetchFresh(url);
    cache = { data, fetchedAt: Date.now() };
    return { catalog: data, stale: false, cached: false };
  } catch (error) {
    // A flaky upstream must not empty the shop or reject a valid promo code.
    if (cache.data && age < STALE_MAX_MS) {
      console.warn(`[shop] serving stale catalogue (${Math.round(age / 1000)}s old): ${error.message}`);
      return { catalog: cache.data, stale: true, cached: true };
    }
    throw error;
  }
}

/** Test seam: drop the cache so a test can force a fresh fetch. */
export function resetServerCatalogCache() {
  cache = { data: null, fetchedAt: 0 };
}
