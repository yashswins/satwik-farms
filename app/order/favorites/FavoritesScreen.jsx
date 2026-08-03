'use client';

import { useEffect, useState } from 'react';
import { IoHeartOutline } from 'react-icons/io5';

import { ProductGrid } from '@/components/order/ProductGrid';
import { EmptyState, GridSkeleton, LoadError } from '@/components/order/ShopStates';
import { S } from '@/lib/order/strings';
import { useFavoritesStore } from '@/lib/order/stores';
import { useCatalog } from '@/lib/order/useCatalog';

export default function FavoritesScreen() {
  const { catalog, loading, error, reload } = useCatalog();
  const ids = useFavoritesStore((s) => s.ids);

  // Favourites live in localStorage, so defer until mounted to avoid rendering
  // an empty state on the server and then flashing content in.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Saved ids can outlive the products they point at — a product removed from
  // the sheet, or one that has since sold out. Drop those rather than render
  // broken cards, and keep the customer's saved list intact for when it returns.
  const products = catalog
    ? ids.map((id) => catalog.productsById.get(id)).filter((p) => p && p.isActive && p.inStock)
    : [];
  const unavailableCount = catalog ? ids.length - products.length : 0;

  return (
    <div className="min-h-screen bg-shop-bg px-4 pb-6 pt-5">
      <h1 className="text-[20px] font-semibold text-shop-text">{S.FAVORITES_TITLE}</h1>

      <div className="mt-4">
        {(!mounted || loading) && <GridSkeleton count={4} />}
        {error && !loading && <LoadError onRetry={reload} />}

        {mounted && catalog && !loading && !error && (
          <>
            {ids.length === 0 && (
              <EmptyState
                Icon={IoHeartOutline}
                title={S.FAVORITES_EMPTY_TITLE}
                subtitle={S.FAVORITES_EMPTY_SUBTITLE}
                actionHref="/order"
                actionLabel={S.CART_EMPTY_ACTION}
              />
            )}

            {ids.length > 0 && products.length === 0 && (
              <EmptyState
                Icon={IoHeartOutline}
                title="Your saved items aren’t available right now"
                subtitle="They’ll appear here again when they’re back in stock."
                actionHref="/order"
                actionLabel={S.CART_EMPTY_ACTION}
              />
            )}

            {products.length > 0 && (
              <>
                {unavailableCount > 0 && (
                  <p className="mb-3 text-[13px] text-shop-text-secondary">
                    {unavailableCount} saved{' '}
                    {unavailableCount === 1 ? 'item is' : 'items are'} unavailable and hidden.
                  </p>
                )}
                <ProductGrid products={products} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
