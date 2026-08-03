'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { IoSearch, IoRefresh, IoCart, IoLocationSharp, IoClose, IoTimeOutline } from 'react-icons/io5';

import { BannerCarousel, ComboDeals, FeaturedSections, PromoBanner } from '@/components/order/HomeSections';
import { ProductRow } from '@/components/order/ProductGrid';
import { mapCatalog, productsInCategory, sellableProducts } from '@/lib/order/catalog';
import { isSameDayWindow } from '@/lib/order/delivery';
import { greeting } from '@/lib/order/format';
import { trackEvent } from '@/lib/order/metrics';
import { S } from '@/lib/order/strings';
import { useCatalog } from '@/lib/order/useCatalog';
import { useCartStore, useCustomerStore, useStoreHydrated } from '@/lib/order/stores';

const ROW_LIMIT = 6; // matches the phone app's per-category row

/**
 * Whether the greeting has already been shown this page-load.
 *
 * Module scope on purpose: it survives client-side navigation but resets on a
 * genuine reload. So the greeting appears once when someone arrives, and does
 * not reappear every time they come back to the shop tab from a product or the
 * cart — which made a one-time welcome feel like a banner that would not go
 * away. The phone app shows it once per session for the same reason.
 */
let greetingShownThisLoad = false;

/**
 * One flag per browser session, set on the first home visit. The cart reminder
 * keys off it so "You left N items in your cart" appears only when someone
 * RETURNS with a persisted cart — not two seconds after they added something
 * themselves.
 */
const SESSION_FLAG = 'sf.session.v1';

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

/** Suspense fallback while the server streams the catalogue sections. */
export function HomeSkeleton() {
  return (
    <>
      <SkeletonRow />
      <SkeletonRow />
    </>
  );
}

/**
 * Header, delivery strip, greeting and cart reminder — everything that does
 * NOT depend on the catalogue. Renders immediately; the catalogue sections
 * stream in as children (see page.jsx).
 */
export default function HomeChrome({ children }) {
  const customerName = useCustomerStore((s) => s.name);
  const cartItems = useCartStore((s) => s.items);
  const cartHydrated = useStoreHydrated(useCartStore);
  const [showGreeting, setShowGreeting] = useState(!greetingShownThisLoad);
  const [reminderCount, setReminderCount] = useState(0);

  // Greeting, cart count and the delivery window depend on the clock and on
  // stored data, so defer to after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cartCount = mounted ? cartItems.length : 0;

  useEffect(() => { trackEvent('shop_viewed'); }, []);

  // Count the greeting as seen only once it has actually been on screen for a
  // moment.
  //
  // A first-time visitor briefly mounts this screen before the guard redirects
  // them to /welcome; marking it seen on unmount meant they never saw the
  // greeting at all. A redirect is far quicker than this delay, so only a real
  // viewing counts.
  useEffect(() => {
    if (!showGreeting) return undefined;
    const t = setTimeout(() => { greetingShownThisLoad = true; }, 1500);
    return () => clearTimeout(t);
  }, [showGreeting]);

  // Return-visit cart reminder: first home visit of the session only.
  useEffect(() => {
    if (!cartHydrated) return;
    try {
      if (sessionStorage.getItem(SESSION_FLAG)) return;
      sessionStorage.setItem(SESSION_FLAG, '1');
      const count = useCartStore.getState().items.length;
      if (count > 0) setReminderCount(count);
    } catch {
      /* private browsing: no reminder, no harm */
    }
  }, [cartHydrated]);

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

      {/* Same-day cutoff strip — owner-requested. Time-dependent, so after mount. */}
      {mounted && (
        <p className="flex items-center justify-center gap-1.5 bg-shop-primary-dark/95 px-4 py-1.5
                      text-center text-[12px] font-medium text-white">
          <IoTimeOutline aria-hidden className="shrink-0 text-[14px]" />
          {isSameDayWindow() ? S.DELIVERY_STRIP_SAME_DAY : S.DELIVERY_STRIP_NEXT_DAY}
        </p>
      )}

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
            onClick={() => { greetingShownThisLoad = true; setShowGreeting(false); }}
            aria-label="Dismiss greeting"
            className="shrink-0 text-shop-text-secondary"
          >
            <IoClose aria-hidden className="text-[22px]" />
          </button>
        </div>
      )}

      {/* Return-visit cart reminder — one line, no countdown, no pressure. */}
      {reminderCount > 0 && cartCount > 0 && (
        <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-shop-md
                        border border-shop-border bg-shop-surface px-4 py-3">
          <p className="text-[13px] text-shop-text">
            {reminderCount === 1 ? S.CART_REMINDER_ONE : S.CART_REMINDER_MANY(reminderCount)}
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/order/cart" className="text-[13px] font-semibold text-shop-primary-dark">
              {S.CART_REMINDER_ACTION}
            </Link>
            <button
              type="button"
              onClick={() => setReminderCount(0)}
              aria-label="Dismiss cart reminder"
              className="text-shop-text-tertiary"
            >
              <IoClose aria-hidden className="text-[16px]" />
            </button>
          </div>
        </div>
      )}

      <div className="px-4 pt-5">{children}</div>
    </div>
  );
}

/**
 * The catalogue sections. When the server fetched successfully, `initialData`
 * is the same JSON /api/shop/catalog serves and no client fetch happens — the
 * products are already in the HTML. When the server could not fetch (cold
 * start plus a flaky Apps Script — observed live), this falls back to exactly
 * the old behaviour: client fetch, skeleton, retry button.
 */
export function HomeCatalog({ initialData = null }) {
  const initial = useMemo(() => (initialData ? mapCatalog(initialData) : null), [initialData]);
  const fetched = useCatalog({ enabled: !initial });

  const catalog = initial ?? fetched.catalog;
  const loading = initial ? false : fetched.loading;
  const error = initial ? null : fetched.error;

  return (
    <>
      {loading && <HomeSkeleton />}

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
            onClick={fetched.reload}
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

          {/* Promo banner sits between the greeting and the carousel, matching
              the phone app's section order (HomeScreen.tsx:120-153). */}
          <PromoBanner promo={catalog.promoBanner} />
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
    </>
  );
}
