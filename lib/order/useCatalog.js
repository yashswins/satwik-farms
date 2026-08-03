'use client';

import { useCallback, useEffect, useState } from 'react';

import { mapCatalog } from './catalog';

/**
 * Load the catalogue from our own origin.
 *
 * Same-origin only: the browser never talks to Apps Script directly (see
 * app/api/shop/catalog/route.js for why).
 */
export function useCatalog() {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/shop/catalog', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`catalog_${res.status}`);
      setCatalog(mapCatalog(await res.json()));
    } catch (err) {
      setError(err.message || 'catalog_unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { catalog, loading, error, reload: load };
}
