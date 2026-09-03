/**
 * Funnel counters, read-only. Same keys the shop's beacon writes
 * (lib/order/metricsShared.js): sf:m:<event>:<date> for the web,
 * sf:m:app:<event>:<date> for the phone app.
 *
 * Prefers the read-only token. Locally these live in .env.upstash.local by
 * design (so a dev server cannot write phantom events), so a dev dashboard
 * shows "not configured" for the funnel — that is correct, not a bug.
 */
import 'server-only';

import { METRIC_EVENTS } from '@/lib/order/metricsShared';

export const FUNNEL_EVENTS = [...METRIC_EVENTS, 'order_placed:r'];

function credentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_READ_ONLY_TOKEN
    || process.env.KV_REST_API_READ_ONLY_TOKEN
    || process.env.UPSTASH_REDIS_REST_TOKEN
    || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

export function funnelConfigured() {
  return Boolean(credentials());
}

/**
 * @param {string[]} dates ISO dates (Dar)
 * @returns {Promise<null | {web: Record<date, Record<event, number>>, app: same}>}
 */
export async function funnelCounts(dates) {
  const creds = credentials();
  if (!creds || dates.length === 0) return null;
  const out = { web: {}, app: {} };
  for (const [surface, prefix] of [['web', 'sf:m'], ['app', 'sf:m:app']]) {
    const keys = dates.flatMap((date) => FUNNEL_EVENTS.map((e) => `${prefix}:${e}:${date}`));
    const res = await fetch(`${creds.url}/mget/${keys.map(encodeURIComponent).join('/')}`, {
      headers: { Authorization: `Bearer ${creds.token}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}`);
    const values = (await res.json()).result.map((v) => Number(v) || 0);
    dates.forEach((date, row) => {
      out[surface][date] = {};
      FUNNEL_EVENTS.forEach((e, col) => {
        out[surface][date][e] = values[row * FUNNEL_EVENTS.length + col];
      });
    });
  }
  return out;
}

/** Sum a surface's counters over the dates. */
export function funnelTotals(surfaceCounts) {
  const totals = Object.fromEntries(FUNNEL_EVENTS.map((e) => [e, 0]));
  for (const day of Object.values(surfaceCounts || {})) {
    for (const e of FUNNEL_EVENTS) totals[e] += day[e] || 0;
  }
  return totals;
}
