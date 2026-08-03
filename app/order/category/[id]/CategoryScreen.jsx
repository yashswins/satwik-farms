'use client';

import { useState } from 'react';
import { IoSearch, IoCloseCircle, IoBagHandleOutline } from 'react-icons/io5';

import { ProductGrid } from '@/components/order/ProductGrid';
import ScreenHeader from '@/components/order/ScreenHeader';
import { EmptyState, GridSkeleton, LoadError } from '@/components/order/ShopStates';
import { searchInCategory } from '@/lib/order/catalog';
import { S } from '@/lib/order/strings';
import { useCatalog } from '@/lib/order/useCatalog';

export default function CategoryScreen({ categoryId }) {
  const { catalog, loading, error, reload } = useCatalog();
  const [query, setQuery] = useState('');

  const category = catalog?.categories.find((c) => c.id === categoryId) ?? null;
  // Within a category the phone app matches name OR description, unlike global
  // search which matches name only. Kept deliberately.
  const products = catalog ? searchInCategory(catalog, categoryId, query) : [];

  return (
    <>
      <ScreenHeader title={category?.name ?? 'Category'} fallbackHref="/order/categories" />

      <div className="px-4 pb-6 pt-4">
        <div className="relative">
          <IoSearch
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2
                       text-[18px] text-shop-text-tertiary"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 100))}
            placeholder={`Search in ${category?.name ?? 'this category'}…`}
            aria-label={`Search in ${category?.name ?? 'category'}`}
            className="w-full rounded-shop-md border border-shop-border bg-shop-surface py-2.5
                       pl-10 pr-9 text-[14px] text-shop-text placeholder:text-shop-text-tertiary
                       focus:outline-none focus:ring-2 focus:ring-shop-primary/40"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-shop-text-tertiary"
            >
              <IoCloseCircle aria-hidden className="text-[18px]" />
            </button>
          )}
        </div>

        <div className="mt-4">
          {loading && <GridSkeleton />}
          {error && !loading && <LoadError onRetry={reload} />}

          {catalog && !loading && !error && (
            <>
              {!category && (
                <EmptyState
                  Icon={IoBagHandleOutline}
                  title="Category not found"
                  subtitle="It may no longer be available."
                  actionHref="/order/categories"
                  actionLabel="Browse categories"
                />
              )}

              {category && products.length === 0 && (
                <EmptyState
                  Icon={IoBagHandleOutline}
                  title={query ? S.SEARCH_EMPTY_TITLE : S.EMPTY_STATE_TITLE}
                  subtitle={query ? S.SEARCH_EMPTY_SUBTITLE : undefined}
                />
              )}

              {category && products.length > 0 && (
                <>
                  <p className="mb-3 text-[13px] text-shop-text-secondary">
                    {products.length} {products.length === 1 ? 'item' : 'items'}
                  </p>
                  <ProductGrid products={products} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
