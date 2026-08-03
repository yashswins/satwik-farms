'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useCustomerStore, useStoreHydrated } from '@/lib/order/stores';

/**
 * Sends a genuinely new visitor to /order/welcome once.
 *
 * Keyed off `onboarded`, which is set both by completing the form and by
 * skipping it, so a guest is never bounced back. The phone app instead
 * re-derives this from whether stored details validate, which means a guest who
 * skipped gets the onboarding screen on every single launch.
 *
 * Runs after mount because the answer lives in localStorage; rendering it
 * server-side would guess wrong and flash the wrong screen.
 */
const EXEMPT = ['/order/welcome'];

export default function FirstVisitGuard() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const onboarded = useCustomerStore((s) => s.onboarded);
  // Must wait for the real hydration signal, not a timer. A setTimeout that
  // fires before localStorage is read makes every returning customer look new
  // and redirects them to the welcome screen mid-visit.
  const hydrated = useStoreHydrated(useCustomerStore);

  useEffect(() => {
    if (!hydrated) return;
    if (EXEMPT.some((p) => pathname.startsWith(p))) return;
    if (!onboarded) router.replace('/order/welcome');
  }, [hydrated, onboarded, pathname, router]);

  return null;
}
