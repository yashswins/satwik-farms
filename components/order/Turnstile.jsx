'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

/**
 * Cloudflare Turnstile widget.
 *
 * Renders nothing when no site key is configured, so local development and
 * preview builds work without it. The server decides whether a missing token is
 * acceptable — the client never gets to make that call.
 */
export default function TurnstileWidget({ onToken }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current) return;
    if (widgetId.current !== null) return;
    if (!window.turnstile) return;

    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => onToken(token),
      'expired-callback': () => onToken(null),
      'error-callback': () => onToken(null),
      theme: 'light',
    });

    return () => {
      if (widgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* already gone */
        }
        widgetId.current = null;
      }
    };
  }, [siteKey, scriptReady, onToken]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onLoad={() => setScriptReady(true)}
        strategy="afterInteractive"
      />
      <div ref={containerRef} className="mt-4 flex justify-center" />
    </>
  );
}
