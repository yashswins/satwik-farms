'use client';

import { usePathname } from 'next/navigation';

import FirstVisitGuard from '@/components/order/FirstVisitGuard';
import ShopNav from '@/components/order/ShopNav';

/**
 * Decides whether a screen is a tab root or a full-screen route.
 *
 * The phone app only shows its tab bar on the five tab screens; anything
 * reached by drilling down — product detail, checkout, confirmation, onboarding
 * — covers the whole screen. Matching that is not just cosmetic: leaving the
 * tabs visible during checkout invites a customer to tap away mid-order.
 */
const TAB_ROOTS = [
  '/order',
  '/order/categories',
  '/order/cart',
  '/order/favorites',
  '/order/account',
];

export default function ShopShell({ children }) {
  const pathname = usePathname() || '';
  const showNav = TAB_ROOTS.includes(pathname.replace(/\/$/, ''));

  return (
    <>
      <FirstVisitGuard />
      {/* Desktop nav sits above content; mobile nav is fixed to the bottom, so
          only the mobile variant needs the page padded out from under it. */}
      {showNav && <ShopNav />}
      <div className={showNav ? 'pb-[76px] md:pb-0' : ''}>{children}</div>
    </>
  );
}
