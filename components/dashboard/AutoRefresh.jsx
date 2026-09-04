'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Re-renders the page from the server every `minutes`, so a phone or a
 * screen left on the Overview stays current without anyone reloading.
 * Pauses while the tab is hidden; refreshes as soon as it is shown again.
 */
export default function AutoRefresh({ minutes = 5 }) {
  const router = useRouter();
  useEffect(() => {
    let timer = null;
    const arm = () => {
      clearInterval(timer);
      timer = setInterval(() => { if (!document.hidden) router.refresh(); }, minutes * 60_000);
    };
    const onVisible = () => { if (!document.hidden) { router.refresh(); arm(); } };
    arm();
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [router, minutes]);
  return null;
}
