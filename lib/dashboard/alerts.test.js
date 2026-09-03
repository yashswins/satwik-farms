import { describe, expect, it } from 'vitest';

import { evaluateAlerts } from './alerts';

const NOW = Date.parse('2026-09-03T10:00:00Z');
const fresh = (payload) => ({ taken_at: '2026-09-03T09:55:00', payload });
const syncOk = [{ step: 'invoices', last_ok_at: '2026-09-03T09:50:00', last_error: null }];

describe('evaluateAlerts', () => {
  it('is quiet when everything is fine', () => {
    const alerts = evaluateAlerts({
      healthSnapshot: fresh({ accu360: { ok: true, latency_ms: 700 }, catalog: { configured: true, age_seconds: 60 }, erp_sync: { pending: 0, escalated: 0, alarm: false }, render: { events_24h: {} } }),
      sync: syncOk, funnelToday: { web: { order_placed: 20, order_failed: 2 }, app: {} }, now: NOW,
    });
    expect(alerts).toEqual([]);
  });

  it('flags client failure rate with the right severity and the server-side explanation', () => {
    const a = evaluateAlerts({ sync: syncOk, now: NOW, funnelToday: { web: { order_placed: 6, order_failed: 4 }, app: { order_placed: 2, order_failed: 8 } }, attemptsToday: { accepted: 8 } });
    const web = a.find((x) => x.id === 'A1-web');
    const app = a.find((x) => x.id === 'A1-app');
    expect(web.severity).toBe('warning');
    expect(app.severity).toBe('critical');
    expect(app.action).toMatch(/never arrived/);
    expect(a[0].severity).toBe('critical');
  });

  it('ignores tiny samples', () => {
    const a = evaluateAlerts({ sync: syncOk, now: NOW, funnelToday: { web: { order_placed: 1, order_failed: 3 }, app: {} } });
    expect(a.find((x) => x.id.startsWith('A1'))).toBeUndefined();
  });

  it('reads Accu360, restarts, catalogue and backlog from the health snapshot', () => {
    const a = evaluateAlerts({
      sync: syncOk, now: NOW,
      healthSnapshot: fresh({ accu360: { ok: false }, catalog: { configured: true, age_seconds: 3600 }, erp_sync: { pending: 3, escalated: 1, escalated_open: 1, oldest_minutes: 45, alarm: true }, render: { events_24h: { server_failed: 5 } } }),
    });
    expect(a.map((x) => x.id).sort()).toEqual(['A3', 'A4', 'A5-down', 'A6']);
  });

  it('does not alert on escalated jobs that were closed by hand', () => {
    const a = evaluateAlerts({
      sync: syncOk, now: NOW,
      healthSnapshot: fresh({ accu360: { ok: true, latency_ms: 300 }, catalog: { configured: true, age_seconds: 60 }, erp_sync: { pending: 0, escalated: 5, escalated_open: 0, oldest_minutes: 0, alarm: false } }),
    });
    expect(a.find((x) => x.id === 'A6')).toBeUndefined();
  });

  it('ignores an old health snapshot rather than alerting on stale news', () => {
    const a = evaluateAlerts({ sync: syncOk, now: NOW, healthSnapshot: { taken_at: '2026-09-02T09:55:00', payload: { accu360: { ok: false } } } });
    expect(a.find((x) => x.id === 'A5-down')).toBeUndefined();
  });

  it('warns when the mirror is stale in business hours only', () => {
    const stale = [{ step: 'invoices', last_ok_at: '2026-09-03T08:00:00', last_error: 'HTTP 500' }];
    expect(evaluateAlerts({ sync: stale, now: NOW, businessHours: true }).map((x) => x.id)).toEqual(['D1']);
    expect(evaluateAlerts({ sync: stale, now: NOW, businessHours: false })).toEqual([]);
    expect(evaluateAlerts({ sync: [], now: NOW, businessHours: true })[0].detail).toMatch(/never completed/);
  });

  it('turns catalogue check issues into alerts, critical first', () => {
    const a = evaluateAlerts({
      sync: syncOk, now: NOW,
      catalogSnapshot: fresh({ issues: [
        { kind: 'promo_minimum_unreachable', code: 'BIG', minimum_spend: 100000, median_subtotal: 20000 },
        { kind: 'item_disabled_in_erp', sku: 'GRO-113', name: 'RICE FLOUR' },
        { kind: 'tier_percent_suspicious', tier: 'T1', percent_off: 0.5 },
      ] }),
    });
    expect(a.map((x) => x.severity)).toEqual(['critical', 'warning', 'info']);
    expect(a[0].title).toMatch(/RICE FLOUR/);
    expect(a[0].threshold).toBeTruthy();
  });
});
