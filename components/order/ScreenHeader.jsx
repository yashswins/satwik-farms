'use client';

import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';

/** Back-titled header for drill-down screens. */
export default function ScreenHeader({ title, fallbackHref = '/order', right = null }) {
  const router = useRouter();

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
    </header>
  );
}
