'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { IoSearch, IoCloseCircle, IoSearchOutline } from 'react-icons/io5';

import { ProductGrid } from '@/components/order/ProductGrid';
import ScreenHeader from '@/components/order/ScreenHeader';
import { EmptyState, GridSkeleton, LoadError } from '@/components/order/ShopStates';
import { searchProducts } from '@/lib/order/catalog';
import { S } from '@/lib/order/strings';
import { useCatalog } from '@/lib/order/useCatalog';

export default function SearchScreen() {
  const { catalog, loading, error, reload } = useCatalog();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // Someone who taps search wants to type immediately.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  const trimmed = query.trim();
  const results = catalog && trimmed ? searchProducts(catalog, trimmed) : [];

  return (
    <>
      <ScreenHeader title="Search" />

      <div className="px-4 pb-6 pt-4">
        <div className="relative">
          <IoSearch
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2
                       text-[18px] text-shop-text-tertiary"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 100))}
            placeholder={S.SEARCH_PLACEHOLDER}
            aria-label="Search products"
            className="w-full rounded-shop-md border border-shop-border bg-shop-surface py-3
                       pl-10 pr-9 text-[15px] text-shop-text placeholder:text-shop-text-tertiary
                       focus:outline-none focus:ring-2 focus:ring-shop-primary/40"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-shop-text-tertiary"
            >
              <IoCloseCircle aria-hidden className="text-[18px]" />
            </button>
          )}
        </div>

        <div className="mt-4">
          {loading && <GridSkeleton count={4} />}
          {error && !loading && <LoadError onRetry={reload} />}

          {catalog && !loading && !error && (
            <>
              {!trimmed && (
                <div className="pt-8 text-center">
                  <IoSearchOutline aria-hidden className="mx-auto text-[48px] text-shop-primary-light" />
                  <p className="mt-3 text-[14px] text-shop-text-secondary">
                    Search for a product by name.
                  </p>
                  <Link
                    href="/order/categories"
                    className="mt-4 inline-block text-[14px] font-semibold text-shop-primary"
                  >
                    Or browse categories
                  </Link>
                </div>
              )}

              {trimmed && results.length === 0 && (
                <EmptyState
                  Icon={IoSearchOutline}
                  title={S.SEARCH_EMPTY_TITLE}
                  subtitle={S.SEARCH_EMPTY_SUBTITLE}
                  actionHref="/order/categories"
                  actionLabel="Browse categories"
                />
              )}

              {trimmed && results.length > 0 && (
                <>
                  <p aria-live="polite" className="mb-3 text-[13px] text-shop-text-secondary">
                    {results.length} {results.length === 1 ? 'result' : 'results'}
                  </p>
                  <ProductGrid products={results} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
