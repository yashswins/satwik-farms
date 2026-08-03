'use client';

import Script from 'next/script';

/**
 * Cloudflare Turnstile widget, declarative form.
 *
 * api.js auto-renders any `.cf-turnstile` element and injects a hidden
 * `cf-turnstile-response` input into the surrounding form, which is where the
 * token is read from at submit time.
 *
 * An earlier version used `render=explicit` plus a manual `turnstile.render()`
 * call. That is the documented API but it is easy to get subtly wrong — calling
 * render() before the API settles, or routing through `turnstile.ready()` after
 * api.js has loaded, both leave the widget silently absent: no error, no
 * iframe, and checkout looking perfectly fine with no bot protection at all.
 * The declarative form has no such failure mode.
 *
 * Renders nothing without a site key, so local and preview builds work without
 * one. The server decides whether a missing token is acceptable.
 */
export default function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile mt-4 flex justify-center"
        data-sitekey={siteKey}
        // Analytics attribution for Cloudflare's integration tooling.
        data-action="turnstile-spin-v2"
        data-theme="light"
      />
    </>
  );
}

/**
 * Clear the redeemed token so a retry gets a fresh one.
 *
 * Turnstile tokens are single-use: once siteverify redeems one, the browser
 * still holds it in the DOM, and resubmitting sends the same value — which
 * Cloudflare rejects as `timeout-or-duplicate`. Without this, the FIRST failure
 * at checkout makes every subsequent retry fail too, for a different reason
 * than the customer was told.
 */
export function resetTurnstile() {
  if (typeof window !== 'undefined' && window.turnstile) {
    try {
      window.turnstile.reset();
    } catch {
      /* widget not rendered; nothing to reset */
    }
  }
}
