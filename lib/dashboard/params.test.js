import { describe, expect, it } from 'vitest';

import { hrefWith, parsePageParams } from './params';

const NOW = new Date('2026-09-03T09:00:00Z');

describe('parsePageParams', () => {
  it('defaults to month to date and all channels', () => {
    const p = parsePageParams({}, { now: NOW });
    expect(p.period.key).toBe('mtd');
    expect(p.channelKey).toBe('all');
    expect(p.channels).toBeNull();
    expect(p.page).toBe(1);
  });

  it('maps channel filters to mirror channel values', () => {
    expect(parsePageParams({ channel: 'online' }, { now: NOW }).channels).toEqual(['app', 'web', 'online_unsplit']);
    expect(parsePageParams({ channel: 'offline' }, { now: NOW }).channels).toEqual(['offline']);
    expect(parsePageParams({ channel: 'bogus' }, { now: NOW }).channelKey).toBe('all');
  });

  it('accepts custom ranges and clamps the page number', () => {
    const p = parsePageParams({ period: 'custom', from: '2026-08-01', to: '2026-08-15', page: '-3' }, { now: NOW });
    expect([p.period.start, p.period.end]).toEqual(['2026-08-01', '2026-08-15']);
    expect(p.page).toBe(1);
    expect(parsePageParams({ page: ['7'] }, { now: NOW }).page).toBe(7);
  });
});

describe('hrefWith', () => {
  const current = parsePageParams({ period: 'last30', channel: 'app' }, { now: NOW });
  it('keeps the selection and applies overrides', () => {
    expect(hrefWith('/dashboard/sales', current)).toBe('/dashboard/sales?period=last30&channel=app');
    expect(hrefWith('/dashboard/sales', current, { page: 2 })).toBe('/dashboard/sales?period=last30&channel=app&page=2');
    expect(hrefWith('/dashboard/sales', current, { channel: 'all', period: 'mtd' })).toBe('/dashboard/sales');
  });
  it('carries custom dates', () => {
    const custom = parsePageParams({ period: 'custom', from: '2026-08-01', to: '2026-08-15' }, { now: NOW });
    expect(hrefWith('/dashboard/channels', custom)).toBe('/dashboard/channels?period=custom&from=2026-08-01&to=2026-08-15');
  });
});
