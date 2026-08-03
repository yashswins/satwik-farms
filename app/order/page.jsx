import { Suspense } from 'react';

import HomeChrome, { HomeCatalog, HomeSkeleton } from './ShopHome';
import { promoBannerFrom } from '@/lib/order/catalog';
import { getServerCatalog } from '@/lib/order/serverCatalog';

export const metadata = {
  title: 'Order Online',
  description:
    'Order residue-free vegetables, fruits, dairy and groceries from Satwik Farms, '
    + 'delivered fresh across Dar es Salaam.',
};

/**
 * Dynamic so the catalogue can be fetched per-request on the server. The header
 * and greeting stream immediately; the product sections follow as soon as the
 * catalogue arrives (usually instantly — the server-side cache holds it for
 * 5 minutes). The skeleton is now the streaming fallback rather than the
 * guaranteed first paint it used to be.
 */
export const dynamic = 'force-dynamic';

/**
 * MUST NOT block the shell: the catalogue fetch happens inside Suspense, and a
 * failure falls back to the client-side fetch/retry path rather than erroring
 * the page. Observed live 2026-08-03: a cold serverless instance hitting an
 * Apps Script hiccup 502s — that must degrade to the old client behaviour, not
 * break the first paint.
 */
async function HomeCatalogServer() {
  let initialData = null;
  try {
    const { catalog } = await getServerCatalog();
    // Same shape /api/shop/catalog serves: promo codes stripped, the single
    // best active code exposed as promo_banner (see that route for why).
    const { promo_codes: promoCodes, ...publicCatalog } = catalog;
    const promoBanner = promoBannerFrom(promoCodes);
    if (promoBanner) publicCatalog.promo_banner = promoBanner;
    initialData = publicCatalog;
  } catch {
    // Fall through with null — HomeCatalog fetches client-side and shows the
    // retry UI if that fails too.
  }
  return <HomeCatalog initialData={initialData} />;
}

export default function OrderPage() {
  return (
    <HomeChrome>
      <Suspense fallback={<HomeSkeleton />}>
        <HomeCatalogServer />
      </Suspense>
    </HomeChrome>
  );
}
