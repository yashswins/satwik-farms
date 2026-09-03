/**
 * URL state shared by every dashboard page: ?period=…&from=…&to=…&channel=…
 * Pure, so it is unit-tested and so links between pages can be built without
 * a request in hand.
 */
import { resolvePeriod } from '@/lib/dashboard/periods';

export const CHANNEL_FILTERS = {
  all: { label: 'All', channels: null },
  app: { label: 'App', channels: ['app'] },
  web: { label: 'Web', channels: ['web'] },
  online: { label: 'Online', channels: ['app', 'web', 'online_unsplit'] },
  offline: { label: 'Offline', channels: ['offline'] },
};

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * @param {Record<string, string|string[]|undefined>} searchParams
 * @param {{now?: Date, defaultPeriod?: string}} opts
 */
export function parsePageParams(searchParams = {}, { now = new Date(), defaultPeriod = 'mtd' } = {}) {
  const periodKey = first(searchParams.period) || defaultPeriod;
  const period = resolvePeriod(periodKey, {
    now, from: first(searchParams.from), to: first(searchParams.to),
  });
  const channelKey = CHANNEL_FILTERS[first(searchParams.channel)] ? first(searchParams.channel) : 'all';
  const page = Math.max(1, Math.min(10_000, parseInt(first(searchParams.page), 10) || 1));
  return {
    period,
    channelKey,
    channels: CHANNEL_FILTERS[channelKey].channels,
    channelLabel: CHANNEL_FILTERS[channelKey].label,
    page,
  };
}

/** Build a dashboard href that keeps the current period/channel selection. */
export function hrefWith(pathname, current, overrides = {}) {
  const params = new URLSearchParams();
  const period = overrides.period ?? current?.period?.key;
  if (period && period !== 'mtd') params.set('period', period);
  if (period === 'custom') {
    const from = overrides.from ?? current?.period?.start;
    const to = overrides.to ?? current?.period?.end;
    if (from) params.set('from', from);
    if (to) params.set('to', to);
  }
  const channel = overrides.channel ?? current?.channelKey;
  if (channel && channel !== 'all') params.set('channel', channel);
  for (const [k, v] of Object.entries(overrides)) {
    if (['period', 'from', 'to', 'channel'].includes(k)) continue;
    if (v === undefined || v === null || v === '') params.delete(k);
    else params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
