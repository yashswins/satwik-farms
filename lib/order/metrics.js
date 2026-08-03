'use client';

/**
 * Fire-and-forget funnel beacon.
 *
 * Never awaited and never allowed to throw: measurement must not be able to
 * break shopping. sendBeacon survives navigation (order_placed fires right
 * before the redirect to the confirmation screen); the fetch fallback uses
 * keepalive for the same reason.
 */

import { METRIC_EVENTS } from './metricsShared';

export function trackEvent(event, { returning } = {}) {
  try {
    if (typeof window === 'undefined') return;
    if (!METRIC_EVENTS.includes(event)) return;
    const body = JSON.stringify({ event, ...(returning ? { returning: true } : {}) });
    const sent = navigator.sendBeacon?.(
      '/api/shop/metrics',
      new Blob([body], { type: 'application/json' }),
    );
    if (!sent) {
      fetch('/api/shop/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* measurement must never break the shop */
  }
}
