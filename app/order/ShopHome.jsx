'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IoSearch, IoRefresh, IoCart, IoLocationSharp, IoClose } from 'react-icons/io5';

import { BannerCarousel, ComboDeals, FeaturedSections } from '@/components/order/HomeSections';
import { ProductRow } from '@/components/order/ProductGrid';
import { productsInCategory, sellableProducts } from '@/lib/order/catalog';
import { greeting } from '@/lib/order/format';
import { useCatalog } from '@/lib/order/useCatalog';
import { useCartStore, useCustomerStore } from '@/lib/order/stores';

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
  const cartItems = useCartStore((s) => s.items);
  const [showGreeting, setShowGreeting] = useState(true);

  // Greeting and cart count depend on the clock and on stored data, so defer to
  // after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cartCount = mounted ? cartItems.length : 0;

  return (
    <div className="bg-shop-tab-home">
      {/*
        Two bands, matching the phone app's home screen:
        a saturated green top bar (gradients.primaryButton #3B8B5A → #53B175) with
        the brand, location, cart and an inset translucent search field, then a
        light mint greeting strip below (gradients.heroStrip #AEDCC0 → #F4F8F2,
        diagonal). Collapsing these into one pale band was what made the web
        version read as a different, duller green.
      */}
      <header className="bg-gradient-to-r from-shop-primary-dark to-shop-primary px-4 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/logo_transparent.png"
              alt=""
              width={36}
              height={36}
              className="rounded-full bg-white/85 p-0.5"
            />
            <div className="min-w-0">
              <p className="text-[20px] font-semibold leading-tight text-white">Satwik Farms</p>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-white/90">
                <IoLocationSharp aria-hidden className="text-[13px]" />
                Dar es Salaam, Tanzania
              </p>
            </div>
          </div>

          <Link
            href="/order/cart"
            aria-label={`Cart${cartCount ? `, ${cartCount} items` : ''}`}
            className="relative mt-1 shrink-0 text-white"
          >
            <IoCart aria-hidden className="text-[26px]" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1.5 min-w-[18px] rounded-full bg-shop-error
                               px-1 text-center text-[10px] font-semibold leading-[18px] text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>

        <Link
          href="/order/search"
          className="mt-3.5 flex items-center gap-2 rounded-shop-md border border-white/35
                     bg-white/[0.18] px-3 py-2.5 text-[14px] text-white/85"
        >
          <IoSearch aria-hidden className="text-[18px]" />
          Search for vegetables, fruits…
        </Link>
      </header>

      {/* Greeting strip — dismissible, exactly as in the app. */}
      {mounted && showGreeting && (
        <div className="flex items-center justify-between gap-3 bg-gradient-to-br
                        from-shop-primary-light to-shop-bg px-5 py-5">
          <p className="text-[22px] font-semibold leading-[30px] text-shop-primary-dark">
            {greeting()}
            {customerName ? `, ${customerName.split(' ')[0]}` : ''}
          </p>
          <button
            type="button"
            onClick={() => setShowGreeting(false)}
            aria-label="Dismiss greeting"
            className="shrink-0 text-shop-text-secondary"
          >
            <IoClose aria-hidden className="text-[22px]" />
          </button>
        </div>
      )}

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

            <BannerCarousel banners={catalog.banners} />
            <FeaturedSections catalog={catalog} />
            <ComboDeals catalog={catalog} />

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
                  <ProductRow products={products} />
                </section>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
