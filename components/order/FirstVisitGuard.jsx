'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useCustomerStore } from '@/lib/order/stores';

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
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Zustand's persist middleware rehydrates asynchronously; wait a tick so we
    // read the stored value rather than the initial default.
    const timer = setTimeout(() => setChecked(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (EXEMPT.some((p) => pathname.startsWith(p))) return;
    if (!onboarded) router.replace('/order/welcome');
  }, [checked, onboarded, pathname, router]);

  return null;
}
