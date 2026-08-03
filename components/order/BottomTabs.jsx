'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoHome, IoHomeOutline, IoGrid, IoGridOutline, IoCart, IoCartOutline,
  IoHeart, IoHeartOutline, IoPerson, IoPersonOutline } from 'react-icons/io5';

import { useCartStore } from '@/lib/order/stores';

const TABS = [
  { href: '/order', label: 'Shop', Icon: IoHome, IconOutline: IoHomeOutline },
  { href: '/order/categories', label: 'Explore', Icon: IoGrid, IconOutline: IoGridOutline },
  { href: '/order/cart', label: 'Cart', Icon: IoCart, IconOutline: IoCartOutline, badge: true },
  { href: '/order/favorites', label: 'Saved', Icon: IoHeart, IconOutline: IoHeartOutline },
  { href: '/order/account', label: 'Account', Icon: IoPerson, IconOutline: IoPersonOutline },
];

export default function BottomTabs() {
  const pathname = usePathname() || '';
  const items = useCartStore((s) => s.items);

  // Cart count comes from localStorage, so it differs between server and first
  // client render. Render 0 until mounted to keep hydration clean.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? items.length : 0;

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2
                 border-t border-shop-border bg-shop-surface
                 pb-[env(safe-area-inset-bottom)]"
      aria-label="Shop sections"
    >
      <ul className="flex">
        {TABS.map(({ href, label, Icon, IconOutline, badge }) => {
          const active = href === '/order' ? pathname === '/order' : pathname.startsWith(href);
          const Glyph = active ? Icon : IconOutline;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-[56px] flex-col items-center justify-center gap-0.5
                            text-[11px] transition-colors
                            ${active ? 'text-shop-primary' : 'text-shop-text-secondary'}`}
              >
                <span className="relative">
                  <Glyph aria-hidden className="text-[22px]" />
                  {badge && count > 0 && (
                    <span
                      className="absolute -right-2 -top-1 min-w-[16px] rounded-full bg-shop-primary
                                 px-1 text-center text-[10px] font-semibold leading-4 text-white"
                    >
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
  );
}
