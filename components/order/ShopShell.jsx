'use client';

import { usePathname } from 'next/navigation';

import BottomTabs from '@/components/order/BottomTabs';
import FirstVisitGuard from '@/components/order/FirstVisitGuard';

/**
 * Decides whether a screen is a tab root or a full-screen route.
 *
 * The phone app only shows its tab bar on the five tab screens; everything
 * reached by drilling down — product detail, checkout, confirmation, onboarding
 * — is a stack route covering the whole screen. Matching that is not just
 * cosmetic: leaving the tabs visible during checkout invites a customer to tap
 * away mid-order, and on the confirmation screen it would let them navigate
 * backwards into a cart they have already paid for.
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
  const showTabs = TAB_ROOTS.includes(pathname.replace(/\/$/, ''));

  return (
    <>
      <FirstVisitGuard />
      <div className={showTabs ? 'pb-[76px]' : ''}>{children}</div>
      {showTabs && <BottomTabs />}
    </>
  );
}
