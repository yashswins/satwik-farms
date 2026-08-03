'use client';

import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile widget.
 *
 * Declarative markup PLUS an explicit render fallback, because neither alone is
 * sufficient in a single-page app:
 *
 *  - api.js auto-renders `.cf-turnstile` elements when it loads. That covers a
 *    fresh page load, but on a client-side navigation to checkout the script has
 *    already run, so the newly mounted widget is never processed and no widget
 *    appears at all. The customer then submits without a token and is told the
 *    security check failed.
 *  - Calling render() unconditionally would double-render on a fresh load.
 *
 * So: leave the declarative attributes for the fresh-load path, and after mount
 * check whether anything actually rendered. If not, render it ourselves.
 *
 * Do NOT route this through turnstile.ready() — after api.js has loaded that
 * logs "turnstile.ready() would break if called before the Turnstile api.js
 * script is loaded" and never runs the callback, leaving no widget and no error.
 */
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

export default function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef(null);
  const widgetId = useRef(null);

  useEffect(() => {
    if (!siteKey) return undefined;

    // Load api.js once per page.
    if (!document.querySelector(`script[src^="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    let cancelled = false;
    let elapsed = 0;
    const timer = setInterval(() => {
      if (cancelled) return;
      const el = containerRef.current;
      if (!el) return;

      // Auto-render got there first — nothing to do.
      if (el.children.length > 0) {
        clearInterval(timer);
        return;
      }
      if (window.turnstile && widgetId.current === null) {
        clearInterval(timer);
        try {
          widgetId.current = window.turnstile.render(el, {
            sitekey: siteKey,
            action: 'turnstile-spin-v2',
            theme: 'light',
          });
        } catch (error) {
          console.error('[shop] Turnstile render failed:', error);
        }
        return;
      }
      elapsed += 200;
      if (elapsed >= 15000) {
        clearInterval(timer);
        console.error('[shop] Turnstile did not initialise within 15s.');
      }
    }, 200);

    return () => {
      cancelled = true;
      clearInterval(timer);
      if (widgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* already gone */
        }
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <div
      ref={containerRef}
      className="cf-turnstile mt-4 flex justify-center"
      data-sitekey={siteKey}
      data-action="turnstile-spin-v2"
      data-theme="light"
    />
  );
}

/**
 * Clear the redeemed or expired token so a retry gets a fresh one.
 *
 * Tokens are single-use and expire after about five minutes, so the one issued
 * when checkout loaded is often stale by the time someone finishes typing their
 * address. Without a reset the retry fails as timeout-or-duplicate.
 */
export function resetTurnstile() {
  if (typeof window !== 'undefined' && window.turnstile) {
    try {
      window.turnstile.reset();
    } catch {
      /* not rendered; nothing to reset */
    }
  }
}
