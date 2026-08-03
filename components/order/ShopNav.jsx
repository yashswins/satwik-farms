'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  IoHome, IoHomeOutline, IoGrid, IoGridOutline, IoCart, IoCartOutline,
  IoHeart, IoHeartOutline, IoPerson, IoPersonOutline,
} from 'react-icons/io5';

import { useCartStore } from '@/lib/order/stores';

const TABS = [
  { href: '/order', label: 'Shop', Icon: IoHome, IconOutline: IoHomeOutline },
  { href: '/order/categories', label: 'Explore', Icon: IoGrid, IconOutline: IoGridOutline },
  { href: '/order/cart', label: 'Cart', Icon: IoCart, IconOutline: IoCartOutline, badge: true },
  { href: '/order/favorites', label: 'Saved', Icon: IoHeart, IconOutline: IoHeartOutline },
  { href: '/order/account', label: 'Account', Icon: IoPerson, IconOutline: IoPersonOutline },
];

function useTabState() {
  const pathname = usePathname() || '';
  const items = useCartStore((s) => s.items);
  // Cart count comes from localStorage, so server and first client render differ.
  // Render 0 until mounted to keep hydration clean.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return { pathname, count: mounted ? items.length : 0 };
}

const isActive = (pathname, href) =>
  (href === '/order' ? pathname === '/order' : pathname.startsWith(href));

/**
 * Primary navigation.
 *
 * Both variants are rendered and toggled with CSS rather than a JS breakpoint
 * check — measuring the viewport in JavaScript means the server and the first
 * client render disagree, which produces a visible flash of the wrong nav.
 */
export default function ShopNav() {
  const { pathname, count } = useTabState();

  return (
    <>
      {/* Mobile: fixed bottom tab bar, as in the phone app. */}
      <nav
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2
                   border-t border-shop-border bg-shop-surface
                   pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Shop sections"
      >
        <ul className="flex">
          {TABS.map(({ href, label, Icon, IconOutline, badge }) => {
            const active = isActive(pathname, href);
            const Glyph = active ? Icon : IconOutline;
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-[56px] flex-col items-center justify-center
                              gap-0.5 text-[11px] transition-colors
                              ${active ? 'text-shop-primary' : 'text-shop-text-secondary'}`}
                >
                  <span className="relative">
                    <Glyph aria-hidden className="text-[22px]" />
                    {badge && count > 0 && (
                      <span className="absolute -right-2 -top-1 min-w-[16px] rounded-full
                                       bg-shop-primary px-1 text-center text-[10px] font-semibold
                                       leading-4 text-white">
                        {count}
                      </span>
                    )}
                  </span>
                  <span className={active ? 'font-semibold' : ''}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Tablet and desktop: horizontal bar under the header. A bottom tab bar
          on a laptop reads as a phone app shrunk into a browser. */}
      <nav
        className="sticky top-0 z-40 hidden border-b border-shop-border bg-shop-surface/95
                   backdrop-blur md:block"
        aria-label="Shop sections"
      >
        <ul className="mx-auto flex max-w-5xl gap-1 px-4">
          {TABS.map(({ href, label, Icon, IconOutline, badge }) => {
            const active = isActive(pathname, href);
            const Glyph = active ? Icon : IconOutline;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-2 border-b-2 px-4 py-3.5 text-[14px]
                              transition-colors
                              ${active
                    ? 'border-shop-primary font-semibold text-shop-primary'
                    : 'border-transparent text-shop-text-secondary hover:text-shop-text'}`}
                >
                  <Glyph aria-hidden className="text-[18px]" />
                  {label}
                  {badge && count > 0 && (
                    <span className="ml-0.5 min-w-[18px] rounded-full bg-shop-primary px-1.5
                                     text-center text-[11px] font-semibold leading-[18px] text-white">
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
