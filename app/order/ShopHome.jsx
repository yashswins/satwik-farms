'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IoSearch, IoRefresh } from 'react-icons/io5';

import ProductCard from '@/components/order/ProductCard';
import { productsInCategory, sellableProducts } from '@/lib/order/catalog';
import { greeting } from '@/lib/order/format';
import { useCatalog } from '@/lib/order/useCatalog';
import { useCustomerStore } from '@/lib/order/stores';

const ROW_LIMIT = 6; // matches the phone app's per-category row

function SkeletonRow() {
  return (
    <div className="mb-6">
      <div className="mb-3 h-4 w-32 animate-pulse rounded bg-shop-surface-alt" />
      <div className="flex gap-3 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[210px] w-[150px] shrink-0 animate-pulse
                                  rounded-shop-md bg-shop-surface-alt" />
        ))}
      </div>
    </div>
  );
}

export default function ShopHome() {
  const { catalog, loading, error, reload } = useCatalog();
  const customerName = useCustomerStore((s) => s.name);

  // Greeting depends on the clock and on stored data, so defer to after mount
  // to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="bg-shop-tab-home">
      {/* Hero strip */}
      <header className="bg-gradient-to-b from-shop-primary-light to-shop-tab-home px-4 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo_transparent.png"
            alt=""
            width={40}
            height={40}
            className="rounded-full bg-white/70 p-1"
          />
          <div className="min-w-0">
            <p className="text-[13px] text-shop-text-secondary">
              {mounted ? greeting() : 'Welcome'}
              {mounted && customerName ? `, ${customerName.split(' ')[0]}` : ''}
            </p>
            <p className="truncate text-[17px] font-semibold text-shop-text">
              Fresh from farm to your doorstep
            </p>
          </div>
        </div>

        <Link
          href="/order/search"
          className="mt-4 flex items-center gap-2 rounded-shop-md border border-shop-border
                     bg-shop-surface px-3 py-2.5 text-[14px] text-shop-text-tertiary"
        >
          <IoSearch aria-hidden className="text-[18px]" />
          Search for vegetables, fruits…
        </Link>
      </header>

      <div className="px-4 pt-5">
        {loading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}

        {error && !loading && (
          <div className="rounded-shop-md border border-shop-border bg-shop-surface p-6 text-center">
            <p className="text-[15px] font-medium text-shop-text">
              We couldn&apos;t load the shop
            </p>
            <p className="mt-1 text-[13px] text-shop-text-secondary">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-shop-primary
                         px-5 py-2.5 text-[14px] font-semibold text-white"
            >
              <IoRefresh aria-hidden /> Try again
            </button>
          </div>
        )}

        {catalog && !loading && !error && (
          <>
            {sellableProducts(catalog).length === 0 && (
              <p className="py-10 text-center text-[14px] text-shop-text-secondary">
                Nothing is available to order right now. Please check back soon.
              </p>
            )}

            {catalog.categories.map((category) => {
              const products = productsInCategory(catalog, category.id, { limit: ROW_LIMIT });
              if (products.length === 0) return null;
              return (
                <section key={category.id} className="mb-7">
                  <div className="mb-3 flex items-baseline justify-between">
                    <h2 className="text-[16px] font-semibold text-shop-text">{category.name}</h2>
                    <Link
                      href={`/order/category/${encodeURIComponent(category.id)}`}
                      className="text-[13px] font-medium text-shop-primary"
                    >
                      See all
                    </Link>
                  </div>
                  <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1
                                  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
