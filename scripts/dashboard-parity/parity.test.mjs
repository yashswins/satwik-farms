/**
 * Every dashboard query, old code vs new, same arguments, same database.
 * Run through run.mjs, which puts the old code in .base/queries.
 *
 * A difference is reported with the function, the arguments and the first
 * path that differs. EXPECTED_DIFFERENCES lists the functions allowed to
 * differ on purpose, each with its reason; a listed function that does NOT
 * differ is reported too, so a stale entry can't hide a regression.
 */
import fs from 'node:fs';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { query } from '@/lib/dashboard/db';

const modules = ['sales', 'overview', 'channels', 'customers', 'orders', 'products', 'promotions'];
const load = async (dir) => Object.fromEntries(await Promise.all(modules.map(async (m) => [m, await import(`${dir}/${m}.js`)])));
const OLD = await load('./.base/queries');
const NEW = await load('../../lib/dashboard/queries');

/** Allowed differences: `${module}.${fn}` → why. Filled per migration step. */
const EXPECTED_DIFFERENCES = JSON.parse(process.env.PARITY_EXPECTED || '{}');

/**
 * Fields the new side may carry that the old did not, by function. Nothing
 * else about the result may change. orderDetail selects `o.*`, and
 * analytics.app_orders adds three derived columns to the orders table's own;
 * the order page reads named fields only (checked 2026-11-05).
 */
const ALLOWED_NEW_FIELDS = {
  'orders.orderDetail': new Set(['created_date_dar', 'phone_identity', 'is_accepted']),
};

// ---- arguments -----------------------------------------------------------
const RANGES = [
  ['2026-11-05', '2026-11-05'], ['2026-11-04', '2026-11-04'], ['2026-10-27', '2026-11-02'],
  ['2026-10-01', '2026-10-31'], ['2026-08-01', '2026-11-05'], ['2024-10-01', '2026-11-05'],
  ['2026-12-01', '2026-12-31'],
];
const CHANNELS = [null, ['app'], ['web'], ['offline'], ['app', 'web']];
const NOWS = [new Date('2026-11-05T15:00:00Z'), new Date('2026-11-04T06:30:00Z'), new Date('2026-10-31T20:00:00Z')];
const cross = (...lists) => lists.reduce((acc, l) => acc.flatMap((a) => l.map((x) => [...a, x])), [[]]);

async function ids() {
  const pick = async (sql) => (await query(sql)).map((r) => Object.values(r)[0]);
  return {
    customers: [
      ...(await pick(`SELECT customer FROM analytics.customer_lifetime ORDER BY revenue DESC LIMIT 3`)),
      ...(await pick(`SELECT c.name FROM analytics.customers c WHERE EXISTS (SELECT 1 FROM analytics.app_orders o WHERE o.phone_identity = c.phone_identity) ORDER BY c.name LIMIT 3`)),
      ...(await pick(`SELECT customer FROM analytics.invoices WHERE docstatus = 1 AND deleted_at IS NOT NULL ORDER BY name LIMIT 2`)),
      'CUST-DOES-NOT-EXIST',
    ],
    orders: [
      ...(await pick(`SELECT DISTINCT ON (status) id FROM analytics.app_orders ORDER BY status, created_at DESC`)),
      ...(await pick(`SELECT id FROM analytics.app_orders WHERE failure_reason LIKE 'DUPLICATE%' ORDER BY created_at DESC LIMIT 1`)),
      ...(await pick(`SELECT o.id FROM analytics.app_orders o JOIN analytics.deleted_docs d ON d.deleted_name = o.accu360_order_id ORDER BY o.created_at DESC LIMIT 1`)),
      'SF-DOES-NOT-EXIST',
    ],
    items: [
      ...(await pick(`SELECT item_code FROM analytics.invoice_lines WHERE item_code IS NOT NULL GROUP BY 1 ORDER BY SUM(amount) DESC LIMIT 3`)),
      ...(await pick(`SELECT item_code FROM analytics.items WHERE disabled ORDER BY item_code LIMIT 1`)),
      'NOPE-000',
    ],
    names: (await pick(`SELECT split_part(full_name, ' ', 1) FROM analytics.customers WHERE full_name <> '' ORDER BY name LIMIT 2`)),
    promo: (await pick(`SELECT promo_code FROM analytics.app_orders WHERE promo_code IS NOT NULL GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 1`))[0] || '',
    products: (await pick(`SELECT e->>'product_id' FROM analytics.app_orders o, json_array_elements(o.items) e WHERE e->>'product_id' IS NOT NULL GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 3`)),
    sf: (await pick(`SELECT sf_order_id FROM analytics.sales_invoices WHERE sf_order_id IS NOT NULL ORDER BY posting_date DESC LIMIT 1`))[0],
  };
}

function matrix(id) {
  const r = RANGES; const ch = CHANNELS;
  const c = [];
  const add = (mod, fn, argsList) => argsList.forEach((args) => c.push({ mod, fn, args }));
  // sales
  add('sales', 'summary', cross(r, ch).map(([[s, e], k]) => [s, e, k]));
  add('sales', 'bucketed', cross(r, ch).map(([[s, e], k]) => [s, e, k]));
  add('sales', 'bucketed', [['2026-08-01', '2026-11-05', null, 'week'], ['2025-01-01', '2026-11-05', ['app'], 'month']]);
  add('sales', 'byCategory', cross(r, ch).map(([[s, e], k]) => [s, e, k]));
  add('sales', 'heatmap', cross(r, ch).map(([[s, e], k]) => [s, e, k]));
  add('sales', 'outstandingList', [[25], [5]]);
  add('sales', 'outstandingTotals', [[]]);
  add('sales', 'invoiceList', [
    ...cross(r.slice(2, 6), ch).map(([[s, e], k]) => [{ start: s, end: e, channels: k }]),
    ...['SINV-26-2', id.sf, ...id.names, 'zzzz-no-match'].map((q) => [{ start: '2024-10-01', end: '2026-11-05', channels: null, q }]),
    ...['Paid', 'Unpaid', 'Overdue'].map((status) => [{ start: '2026-08-01', end: '2026-11-05', channels: null, status }]),
    [{ start: '2026-08-01', end: '2026-11-05', channels: null, minAmount: 50000 }],
    [{ start: '2026-08-01', end: '2026-11-05', channels: null, page: 3 }],
  ]);
  add('sales', 'invoiceStatuses', [[]]);
  add('sales', 'drafts', [[]]);
  add('sales', 'futureDated', [['2026-11-05'], ['2026-10-01']]);
  add('sales', 'cancelledAndAmended', r.map(([s, e]) => [s, e]));
  add('sales', 'onlineByPeriod', NOWS.map((n) => [n]));
  // overview
  add('overview', 'todayVsYesterdayToNow', NOWS.map((n) => [n]));
  add('overview', 'ordersKpis', NOWS.map((n) => [n]));
  add('overview', 'discountPulse', r.map(([s, e]) => [s, e]));
  add('overview', 'headlineKpis', NOWS.map((n) => [n]));
  add('overview', 'outstanding', [[]]);
  add('overview', 'channelSplit', r.map(([s, e]) => [s, e]));
  add('overview', 'salesTrend', cross([30, 90, 400], NOWS).map(([d, n]) => [d, n]));
  add('overview', 'topItems', cross(r, [5, 20]).map(([[s, e], l]) => [s, e, l]));
  add('overview', 'topCustomers', cross(r, [5, 25], ['invoices', 'revenue']).map(([[s, e], l, o]) => [s, e, l, o]));
  add('overview', 'pipeline24h', [[]]);
  add('overview', 'attemptsFor', [['2026-11-05'], ['2026-11-04']]);
  add('overview', 'promoPulse', r.map(([s, e]) => [s, e]));
  add('overview', 'freshness', [[]]);
  // channels
  add('channels', 'channelKpis', r.map(([s, e]) => [s, e]));
  add('channels', 'adoptionMonthly', cross([3, 12, 24], NOWS).map(([m, n]) => [m, n]));
  add('channels', 'probablyOnline', r.map(([s, e]) => [s, e, 50]));
  add('channels', 'appVersions', [[7], [30], [365]]);
  add('channels', 'basketByChannel', cross(r, [8, 3]).map(([[s, e], l]) => [s, e, l]));
  // customers
  add('customers', 'kpis', cross(r, NOWS).map(([[s, e], n]) => [s, e, n]));
  add('customers', 'top', cross(r, ['invoices', 'revenue'], [50, 10]).map(([[s, e], o, l]) => [s, e, o, l]));
  add('customers', 'newVsReturningWeekly', cross([4, 12, 52], NOWS).map(([w, n]) => [w, n]));
  add('customers', 'frequency', cross([30, 90, 365], NOWS).map(([d, n]) => [d, n]));
  add('customers', 'cohorts', cross([3, 6, 12], NOWS).map(([m, n]) => [m, n]));
  add('customers', 'lapsed', cross([50, 10], [45, 90], NOWS).map(([l, d, n]) => [l, d, n]));
  add('customers', 'migration', r.map(([s, e]) => [s, e]));
  add('customers', 'search', [...id.names, '0712', '7', 'CUST-2026', 'zzzz-no-match'].map((q) => [q, 20]));
  add('customers', 'detail', id.customers.map((x) => [x]));
  // orders
  add('orders', 'attention', [[{}], [{ includeHandled: true }], [{ since: '2026-08-01', deletedDays: 90 }]]);
  add('orders', 'handledRecently', [[50]]);
  add('orders', 'attemptsByDay', [[14], [60]]);
  add('orders', 'statusByDay', [[14], [60]]);
  add('orders', 'invoiceLag', [[30], [90]]);
  add('orders', 'reconciliationState', [[7]]);
  add('orders', 'orderList', [
    ...cross(['', 'completed', 'failed', 'pending'], ['all', 'app', 'web', 'online']).map(([status, channelKey]) => [{ status, channelKey, start: '2026-08-01', end: '2026-11-05' }]),
    [{ promo: id.promo, start: '2026-08-01', end: '2026-11-05' }],
    [{ combo: true, start: '2026-08-01', end: '2026-11-05' }],
    ...['SF-2026110', '0712', 'SAL-ORD-2026-02'].map((q) => [{ q, start: '2024-10-01', end: '2026-11-05' }]),
    [{ start: '2026-08-01', end: '2026-11-05', page: 4 }],
    [{ start: '2026-11-05', end: '2026-11-05' }],
  ]);
  add('orders', 'orderDetail', id.orders.map((x) => [x]));
  add('orders', 'promoCodesSeen', [[]]);
  // products
  add('products', 'items', cross(r.slice(0, 6), ch).map(([[s, e], k]) => [s, e, '2026-09-01', '2026-09-30', k]));
  add('products', 'items', [['2026-10-01', '2026-10-31', '2026-09-01', '2026-09-30', null, 10]]);
  add('products', 'notSelling', [[60, 100], [7, 50], [365, 100]]);
  add('products', 'boughtTogether', cross(r.slice(2, 6), [5, 20]).map(([[s, e], m]) => [s, e, m, 20]));
  add('products', 'disabledItemsStillSelling', [[30], [365]]);
  add('products', 'itemDetail', cross(id.items, [['2026-10-01', '2026-10-31'], ['2024-10-01', '2026-11-05']]).map(([code, [s, e]]) => [code, s, e, NOWS[0]]));
  // promotions
  add('promotions', 'discountKpis', r.map(([s, e]) => [s, e]));
  add('promotions', 'promoUsage', r.map(([s, e]) => [s, e]));
  add('promotions', 'discountSourceWeekly', cross([4, 12], NOWS).map(([w, n]) => [w, n]));
  add('promotions', 'subtotalHistogram', cross(r, [5000, 10000]).map(([[s, e], b]) => [s, e, b]));
  add('promotions', 'comboUsage', r.map(([s, e]) => [s, e]));
  add('promotions', 'alaCarte', [[id.products, '2026-08-01', '2026-11-05'], [[], '2026-08-01', '2026-11-05'], [id.products.slice(0, 1), '2026-10-01', '2026-10-31']]);
  add('promotions', 'tierOrders', r.map(([s, e]) => [s, e]));
  add('promotions', 'discountMismatches', r.map(([s, e]) => [s, e]));
  return c;
}

// ---- comparison ------------------------------------------------------------
function firstDifference(a, b, at = '$', allowNew = null) {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return null;
    return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)) ? null : `${at}: ${a} vs ${b}`;
  }
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime() ? null : `${at}: ${a} vs ${b}`;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return `${at}: array vs ${typeof b}`;
    if (a.length !== b.length) return `${at}: length ${a.length} vs ${b.length}`;
    for (let i = 0; i < a.length; i += 1) {
      const d = firstDifference(a[i], b[i], `${at}[${i}]`, allowNew);
      if (d) return d;
    }
    return null;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      if (!(k in a)) {
        if (allowNew?.has(k)) continue;
        return `${at}.${k}: only in new`;
      }
      if (!(k in b)) return `${at}.${k}: only in old`;
      const d = firstDifference(a[k], b[k], `${at}.${k}`, allowNew);
      if (d) return d;
    }
    return null;
  }
  return Object.is(a, b) || a === b ? null : `${at}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
}
const canon = (v) => JSON.stringify(v, (k, x) => (typeof x === 'number' ? Number(x.toPrecision(12)) : x));
/** Same rows in another order? Catches ties under ORDER BY ... LIMIT and unordered GROUP BYs. */
function sameMultiset(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return canon([...a].map(canon).sort()) === canon([...b].map(canon).sort());
}

const report = { calls: 0, equal: 0, orderOnly: [], different: [], errors: [], expectedSeen: new Set() };

describe('dashboard parity', async () => {
  const id = await ids();
  const calls = matrix(id);
  it(`runs ${calls.length} calls on both versions`, async () => {
    const queue = [...calls];
    const worker = async () => {
      while (queue.length) {
        const { mod, fn, args } = queue.shift();
        const key = `${mod}.${fn}`;
        report.calls += 1;
        let a; let b;
        try {
          [a, b] = await Promise.all([OLD[mod][fn](...structuredClone(args)), NEW[mod][fn](...structuredClone(args))]);
        } catch (err) {
          report.errors.push({ key, args, error: String(err?.message || err).slice(0, 300) });
          continue;
        }
        const d = firstDifference(a, b, '$', ALLOWED_NEW_FIELDS[key] || null);
        if (!d) { report.equal += 1; continue; }
        // Unordered results compared as sets; any nested array too.
        const flatOrderOnly = sameMultiset(a, b) || (a && b && typeof a === 'object' && !Array.isArray(a)
          && Object.keys(a).length === Object.keys(b).length
          && Object.keys(a).every((k) => !firstDifference(a[k], b[k]) || sameMultiset(a[k], b[k])));
        if (flatOrderOnly) { report.orderOnly.push({ key, args, d }); continue; }
        if (EXPECTED_DIFFERENCES[key]) report.expectedSeen.add(key);
        report.different.push({ key, args, d, expected: Boolean(EXPECTED_DIFFERENCES[key]) });
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
    const unexpected = report.different.filter((x) => !x.expected);
    expect(report.errors, JSON.stringify(report.errors.slice(0, 5), null, 1)).toEqual([]);
    expect(unexpected, JSON.stringify(unexpected.slice(0, 8), null, 1)).toEqual([]);
    const stale = Object.keys(EXPECTED_DIFFERENCES).filter((k) => !report.expectedSeen.has(k));
    expect(stale, 'listed as expected to differ but did not').toEqual([]);
  });
});

afterAll(() => {
  const byKey = (list) => Object.entries(list.reduce((m, x) => ({ ...m, [x.key]: (m[x.key] || 0) + 1 }), {}));
  const lines = ['=== parity report ===',
    `base ${process.env.PARITY_BASE_REF}: ${report.calls} calls, ${report.equal} identical, ${report.orderOnly.length} same rows in another order, ${report.different.length} different, ${report.errors.length} errors`];
  if (report.orderOnly.length) lines.push(`order-only: ${JSON.stringify(byKey(report.orderOnly))} ${JSON.stringify(report.orderOnly.slice(0, 3)).slice(0, 600)}`);
  for (const x of report.different) lines.push(`${x.expected ? 'EXPECTED ' : 'DIFF     '} ${x.key} ${JSON.stringify(x.args).slice(0, 140)} -> ${x.d.slice(0, 220)}`);
  for (const x of report.errors) lines.push(`ERROR     ${x.key} ${JSON.stringify(x.args).slice(0, 140)} -> ${x.error}`);
  // vitest hides console output of passing tests; run.mjs prints this file.
  fs.writeFileSync(path.join(import.meta.dirname, '.base', 'report.txt'), `${lines.join('\n')}\n`);
});
