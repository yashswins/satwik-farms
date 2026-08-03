'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoArrowBack, IoCart } from 'react-icons/io5';

import { useCartStore } from '@/lib/order/stores';

/**
 * Back-titled header for drill-down screens.
 *
 * Always carries the cart, because these screens have no tab bar — without it
 * there is no way to reach the cart from a product or combo page, which is
 * exactly where someone has just added something.
 */
export default function ScreenHeader({ title, fallbackHref = '/order', right = null }) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  // Cart count comes from localStorage; render 0 until mounted so the server
  // and first client render agree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? items.length : 0;

  const goBack = () => {
    // A deep link opened in a new tab has no history to go back to.
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-shop-border
                       bg-shop-surface/95 px-2 py-2 backdrop-blur">
      <button
        type="button"
        onClick={goBack}
        aria-label="Go back"
        className="flex h-10 w-10 items-center justify-center rounded-full text-shop-text
                   active:bg-shop-surface-alt"
      >
        <IoArrowBack aria-hidden className="text-[20px]" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-[16px] font-semibold text-shop-text">{title}</h1>
      {right}
      <Link
        href="/order/cart"
        aria-label={count ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}` : 'Cart'}
        className="relative mr-1 flex h-10 w-10 items-center justify-center rounded-full
                   text-shop-text active:bg-shop-surface-alt"
      >
        <IoCart aria-hidden className="text-[22px]" />
        {count > 0 && (
          <span className="absolute right-0.5 top-0.5 min-w-[17px] rounded-full bg-shop-primary
                           px-1 text-center text-[10px] font-semibold leading-[17px] text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Link>
    </header>
  );
}
