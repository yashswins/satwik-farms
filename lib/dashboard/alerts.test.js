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

  it('names the stuck order and what to do when Accu360 refuses it', () => {
    // 5 Nov: SF-20261105-88b28997 sat 13 h behind "the outbox retries on its own"
    const a6 = evaluateAlerts({
      sync: syncOk, now: NOW,
      healthSnapshot: fresh({ accu360: { ok: true, latency_ms: 300 }, catalog: { configured: true, age_seconds: 60 }, erp_sync: {
        pending: 1, escalated: 6, escalated_open: 0, oldest_minutes: 738.7, alarm: true,
        stuck: [{ order_id: 'SF-20261105-88b28997', state: 'pending', attempts: 17, minutes: 738.7, error: 'accu360_rejected HTTP 417: PartyDisabled: Customer CUST-2026-00748 is disabled' }],
      } }),
    }).find((x) => x.id === 'A6');
    expect(a6.detail).toMatch(/oldest 12 h 19 min\. SF-20261105-88b28997, 17 attempts: Accu360 says ".*is disabled"/);
    expect(a6.action).toMatch(/^Customer CUST-2026-00748 is disabled in Accu360\. Re-enable it/);
    expect(a6.action).toMatch(/mark the order handled/);
  });

  it('keeps the self-healing advice for transient errors and old snapshots', () => {
    const base = { pending: 1, escalated: 0, escalated_open: 0, oldest_minutes: 45, alarm: true };
    const transient = evaluateAlerts({ sync: syncOk, now: NOW, healthSnapshot: fresh({ erp_sync: { ...base, stuck: [{ order_id: 'SF-X', attempts: 3, error: 'unverified: ReadTimeout' }] } }) }).find((x) => x.id === 'A6');
    expect(transient.action).toMatch(/retries on its own/);
    const old = evaluateAlerts({ sync: syncOk, now: NOW, healthSnapshot: fresh({ erp_sync: base }) }).find((x) => x.id === 'A6');
    expect(old.detail).toBe('1 pending, 0 escalated and unhandled, oldest 45 min.');
    expect(old.action).toMatch(/retries on its own/);
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

  it('names the sync error only when it came after the last good run', () => {
    const failing = [{ step: 'invoices', last_ok_at: '2026-09-03T08:00:00', last_error: 'HTTP 500', last_error_at: '2026-09-03T09:30:00' }];
    expect(evaluateAlerts({ sync: failing, now: NOW })[0].detail).toMatch(/sync is failing: HTTP 500/);
    // 29 Oct: an SSL error from 11 Oct, long since recovered, was shown as the cause of a stale mirror
    const recovered = [{ step: 'invoices', last_ok_at: '2026-09-03T08:00:00', last_error: 'ConnectError: certificate has expired', last_error_at: '2026-08-16T04:37:23' }];
    const detail = evaluateAlerts({ sync: recovered, now: NOW })[0].detail;
    expect(detail).not.toMatch(/certificate/);
    expect(detail).toMatch(/120 min ago\. No sync has failed since then/);
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
