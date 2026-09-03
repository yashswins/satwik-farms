/**
 * Overview page data. Every figure here follows the metric dictionary in
 * dashboard_spec.md §2: Sales = submitted (docstatus 1), undeleted invoices
 * by posting_date; returns subtract; drafts and cancellations never count.
 */
import 'server-only';

import { one, query } from '@/lib/dashboard/db';
import { addDays, darDate, resolvePeriod } from '@/lib/dashboard/periods';

const SALES_WHERE = 'docstatus = 1 AND deleted_at IS NULL';

async function salesBetween(start, end) {
  const row = await one(
    `SELECT COALESCE(SUM(grand_total), 0)::float8 AS sales,
            COUNT(*) FILTER (WHERE NOT COALESCE(is_return, false))::int AS invoices,
            COALESCE(SUM(discount_amount), 0)::float8 AS discount
       FROM erp_invoices
      WHERE ${SALES_WHERE} AND posting_date BETWEEN $1::date AND $2::date`,
    [start, end],
  );
  return { sales: row?.sales ?? 0, invoices: row?.invoices ?? 0, discount: row?.discount ?? 0 };
}

/** The four headline tiles plus their comparison periods. */
export async function headlineKpis(now = new Date()) {
  const keys = ['today', 'week', 'mtd', 'last30'];
  const periods = keys.map((k) => resolvePeriod(k, { now }));
  const results = await Promise.all(periods.flatMap((p) => [
    salesBetween(p.start, p.end),
    salesBetween(p.compareStart, p.compareEnd),
  ]));
  return periods.map((p, i) => ({
    period: p,
    current: results[i * 2],
    previous: results[i * 2 + 1],
  }));
}

export async function outstanding() {
  const row = await one(
    `SELECT COALESCE(SUM(outstanding), 0)::float8 AS amount, COUNT(*)::int AS invoices
       FROM erp_invoices
      WHERE ${SALES_WHERE} AND outstanding > 0`,
  );
  return { amount: row?.amount ?? 0, invoices: row?.invoices ?? 0 };
}

export async function channelSplit(start, end) {
  const rows = await query(
    `SELECT COALESCE(channel, 'offline') AS channel,
            COALESCE(SUM(grand_total), 0)::float8 AS sales,
            COUNT(*)::int AS invoices
       FROM erp_invoices
      WHERE ${SALES_WHERE} AND posting_date BETWEEN $1::date AND $2::date
      GROUP BY 1`,
    [start, end],
  );
  const total = rows.reduce((s, r) => s + r.sales, 0);
  return { rows, total };
}

/** Daily sales for the trend chart, with a trailing 7-day average. */
export async function salesTrend(days = 90, now = new Date()) {
  const end = darDate(now);
  const start = addDays(end, -(days - 1));
  const rows = await query(
    `SELECT posting_date::text AS date,
            COALESCE(SUM(grand_total), 0)::float8 AS sales,
            COUNT(*) FILTER (WHERE NOT COALESCE(is_return, false))::int AS invoices,
            COALESCE(SUM(grand_total) FILTER (WHERE channel IN ('app', 'web', 'online_unsplit')), 0)::float8 AS online
       FROM erp_invoices
      WHERE ${SALES_WHERE} AND posting_date BETWEEN $1::date AND $2::date
      GROUP BY 1 ORDER BY 1`,
    [start, end],
  );
  const byDate = new Map(rows.map((r) => [r.date, r]));
  const series = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const r = byDate.get(d);
    series.push({ date: d, sales: r?.sales ?? 0, invoices: r?.invoices ?? 0, online: r?.online ?? 0 });
  }
  for (let i = 0; i < series.length; i += 1) {
    const window = series.slice(Math.max(0, i - 6), i + 1);
    series[i].avg7 = window.reduce((s, x) => s + x.sales, 0) / window.length;
  }
  return series;
}

export async function topItems(start, end, limit = 5) {
  return query(
    `SELECT it.item_code, MAX(it.item_name) AS item_name, MAX(it.item_group) AS item_group,
            COALESCE(SUM(it.amount), 0)::float8 AS revenue,
            COALESCE(SUM(it.qty), 0)::float8 AS qty,
            COUNT(DISTINCT it.invoice)::int AS invoices
       FROM erp_invoice_items it
       JOIN erp_invoices i ON i.name = it.invoice
      WHERE i.${SALES_WHERE.replace('deleted_at', 'deleted_at')} AND i.posting_date BETWEEN $1::date AND $2::date
        AND it.item_code IS NOT NULL
      GROUP BY it.item_code
      ORDER BY revenue DESC
      LIMIT $3`,
    [start, end, limit],
  );
}

/**
 * Top customers with a readable name: the name the customer typed in the app
 * (orders, joined by last-9-digit phone identity) → Contact person name →
 * Accu360 customer_name (usually a phone number here).
 */
export async function topCustomers(start, end, limit = 5, orderBy = 'invoices') {
  const order = orderBy === 'revenue' ? 'revenue DESC, invoices DESC' : 'invoices DESC, revenue DESC';
  return query(
    `WITH agg AS (
       SELECT customer,
              COUNT(*) FILTER (WHERE NOT COALESCE(is_return, false))::int AS invoices,
              COALESCE(SUM(grand_total), 0)::float8 AS revenue,
              MAX(posting_date)::text AS last_invoice
         FROM erp_invoices
        WHERE ${SALES_WHERE} AND posting_date BETWEEN $1::date AND $2::date AND customer IS NOT NULL
        GROUP BY customer
        ORDER BY ${order}
        LIMIT $3
     )
     SELECT a.customer, a.invoices, a.revenue, a.last_invoice,
            COALESCE(o.customer_name, c.contact_name, c.customer_name, a.customer) AS display_name,
            c.phone, c.customer_group
       FROM agg a
       LEFT JOIN erp_customers c ON c.name = a.customer
       LEFT JOIN LATERAL (
         SELECT customer_name FROM orders
          WHERE c.phone_identity IS NOT NULL
            AND RIGHT(REGEXP_REPLACE(customer_phone, '\\D', '', 'g'), 9) = c.phone_identity
          ORDER BY created_at DESC LIMIT 1
       ) o ON true
      ORDER BY ${order}`,
    [start, end, limit],
  );
}

/** Online pipeline over the last 24 hours, from our own orders table. */
export async function pipeline24h() {
  const rows = await query(
    `SELECT status, COUNT(*)::int AS n
       FROM orders
      WHERE created_at >= (now() AT TIME ZONE 'UTC') - INTERVAL '24 hours'
      GROUP BY status`,
  );
  const by = Object.fromEntries(rows.map((r) => [r.status, r.n]));
  const placed = rows.reduce((s, r) => s + r.n, 0);
  return {
    placed,
    accepted: (by.pending ?? 0) + (by.completed ?? 0),
    rejected: by.rejected ?? 0,
    failed: by.failed ?? 0,
    queued: by.queued ?? 0,
    cancelled: by.cancelled ?? 0,
  };
}

/** Server-side attempt counts for a Dar date (all channels). */
export async function attemptsFor(date) {
  const rows = await query(
    'SELECT channel, outcome, count FROM order_attempts_daily WHERE date_dar = $1::date',
    [date],
  );
  const totals = {};
  for (const r of rows) totals[r.outcome] = (totals[r.outcome] ?? 0) + r.count;
  return { rows, totals };
}

export async function promoPulse(start, end) {
  const row = await one(
    `SELECT COUNT(*)::int AS orders,
            COUNT(*) FILTER (WHERE promo_code IS NOT NULL AND COALESCE(discount, 0) > 0)::int AS promo_orders,
            COUNT(*) FILTER (WHERE COALESCE(discount, 0) > 0)::int AS discounted_orders,
            COALESCE(SUM(discount), 0)::float8 AS discount,
            COUNT(*) FILTER (WHERE EXISTS (
              SELECT 1 FROM json_array_elements(items) e WHERE COALESCE(e->>'combo_id', '') <> ''
            ))::int AS combo_orders
       FROM orders
      WHERE status IN ('pending', 'completed')
        AND (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Dar_es_Salaam')::date BETWEEN $1::date AND $2::date`,
    [start, end],
  );
  return row ?? { orders: 0, promo_orders: 0, discounted_orders: 0, discount: 0, combo_orders: 0 };
}

/** Latest snapshot of each kind, plus sync state. */
export async function health() {
  const [snapshots, sync] = await Promise.all([
    query(
      `SELECT DISTINCT ON (kind) kind, taken_at, payload
         FROM ops_snapshots
        ORDER BY kind, taken_at DESC`,
    ),
    query('SELECT step, watermark, last_ok_at, last_error, last_error_at, rows_total, last_run_seconds FROM sync_state ORDER BY step'),
  ]);
  const byKind = Object.fromEntries(snapshots.map((s) => [s.kind, s]));
  return { snapshots: byKind, sync };
}

/** Invoice freshness: newest invoice mirrored and the mirror's own timestamp. */
export async function freshness() {
  const row = await one(
    `SELECT (SELECT MAX(synced_at) FROM erp_invoices) AS synced_at,
            (SELECT MAX(posting_date)::text FROM erp_invoices WHERE docstatus = 1) AS latest_posting_date,
            (SELECT COUNT(*)::int FROM erp_invoices) AS invoices`,
  );
  return row ?? { synced_at: null, latest_posting_date: null, invoices: 0 };
}
