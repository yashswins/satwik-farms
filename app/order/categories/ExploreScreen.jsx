'use client';

import Link from 'next/link';
import { IoSearch } from 'react-icons/io5';

import ProductImage from '@/components/order/ProductImage';
import { LoadError } from '@/components/order/ShopStates';
import { productsInCategory } from '@/lib/order/catalog';
import { S } from '@/lib/order/strings';
import { useCatalog } from '@/lib/order/useCatalog';

export default function ExploreScreen() {
  const { catalog, loading, error, reload } = useCatalog();

  return (
    <div className="min-h-screen bg-shop-tab-explore px-4 pb-6 pt-5">
      <h1 className="text-[20px] font-semibold text-shop-text">{S.CATEGORIES_TITLE}</h1>

      <Link
        href="/order/search"
        className="mt-3 flex items-center gap-2 rounded-shop-md border border-shop-border
                   bg-shop-surface px-3 py-2.5 text-[14px] text-shop-text-tertiary"
      >
        <IoSearch aria-hidden className="text-[18px]" />
        {S.SEARCH_PLACEHOLDER}
      </Link>

      <div className="mt-5">
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-[110px] animate-pulse rounded-shop-md bg-shop-surface-alt" />
            ))}
          </div>
        )}

        {error && !loading && <LoadError onRetry={reload} />}

        {catalog && !loading && !error && (
          <>
            {catalog.categories.length === 0 && (
              <p className="py-10 text-center text-[14px] text-shop-text-secondary">
                {S.CATEGORIES_EMPTY}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {catalog.categories.map((category) => {
                const products = productsInCategory(catalog, category.id);
                // A category with nothing sellable in it is a dead end; hide it
                // rather than let a customer tap into an empty screen.
                if (products.length === 0) return null;
                return (
                  <Link
                    key={category.id}
                    href={`/order/category/${encodeURIComponent(category.id)}`}
                    className="overflow-hidden rounded-shop-md border border-shop-border
                               bg-shop-surface transition-shadow active:shadow-sm
                               md:hover:shadow-md"
                  >
                    <div
                      className="relative h-[86px] w-full sm:h-[110px]"
                      style={{ backgroundColor: category.tintColor }}
                    >
                      <ProductImage
                        product={products[0]}
                        sizes="(max-width: 768px) 50vw, 240px"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-[14px] font-medium text-shop-text">
                        {category.name}
                      </p>
                      <p className="text-[12px] text-shop-text-secondary">
                        {products.length} {products.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
