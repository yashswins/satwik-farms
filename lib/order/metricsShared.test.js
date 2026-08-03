import { describe, it, expect } from 'vitest';

import { METRIC_EVENTS, metricDate, metricKeys, parseMetricEvent } from './metricsShared';

describe('parseMetricEvent', () => {
  it('accepts every funnel event', () => {
    for (const event of METRIC_EVENTS) {
      expect(parseMetricEvent({ event })).toEqual({ event, returning: false });
    }
  });

  it('rejects unknown events and junk shapes', () => {
    expect(parseMetricEvent({ event: 'password_typed' })).toBeNull();
    expect(parseMetricEvent({})).toBeNull();
    expect(parseMetricEvent(null)).toBeNull();
    expect(parseMetricEvent('shop_viewed')).toBeNull();
  });

  it('returning must be the literal boolean true', () => {
    expect(parseMetricEvent({ event: 'order_placed', returning: 'yes' }).returning).toBe(false);
    expect(parseMetricEvent({ event: 'order_placed', returning: true }).returning).toBe(true);
  });
});

describe('metricKeys', () => {
  it('one counter per event per day', () => {
    expect(metricKeys({ event: 'added_to_cart', returning: false }, '2026-08-03'))
      .toEqual(['sf:m:added_to_cart:2026-08-03']);
  });

  it('order_placed from a returning device also bumps the reorder counter', () => {
    expect(metricKeys({ event: 'order_placed', returning: true }, '2026-08-03'))
      .toEqual(['sf:m:order_placed:2026-08-03', 'sf:m:order_placed:r:2026-08-03']);
  });

  it('the returning flag is ignored for every other event', () => {
    expect(metricKeys({ event: 'shop_viewed', returning: true }, '2026-08-03'))
      .toEqual(['sf:m:shop_viewed:2026-08-03']);
  });
});

describe('metricDate — business days are Dar es Salaam days', () => {
  it('22:30 UTC is already the next day in Dar (UTC+3)', () => {
    expect(metricDate(new Date('2026-08-03T22:30:00Z'))).toBe('2026-08-04');
  });

  it('20:00 UTC is still the same day', () => {
    expect(metricDate(new Date('2026-08-03T20:00:00Z'))).toBe('2026-08-03');
  });
});
