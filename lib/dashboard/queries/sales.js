/**
 * Sales page data (dashboard_spec.md §6.2). Same definitions as the Overview:
 * submitted, undeleted invoices by posting_date; returns subtract.
 *
 * `channels` is null (all) or an array of mirror channel values.
 */
import 'server-only';

import { one, query } from '@/lib/dashboard/db';
import { addDays, granularityFor, toDate, toIso } from '@/lib/dashboard/periods';
import { displayName } from '@/lib/dashboard/queries/_names';

const BASE = 'i.docstatus = 1 AND i.deleted_at IS NULL';
const CH = '($3::text[] IS NULL OR i.channel = ANY($3::text[]))';

export async function summary(start, end, channels) {
  const row = await one(
    `SELECT COALESCE(SUM(i.grand_total), 0)::float8 AS sales,
            COUNT(*) FILTER (WHERE NOT COALESCE(i.is_return, false))::int AS invoices,
            COUNT(*) FILTER (WHERE COALESCE(i.is_return, false))::int AS returns,
            COALESCE(SUM(i.grand_total) FILTER (WHERE COALESCE(i.is_return, false)), 0)::float8 AS returns_value,
            COALESCE(SUM(i.discount_amount), 0)::float8 AS discount,
            COUNT(DISTINCT i.customer)::int AS customers
       FROM erp_invoices i
      WHERE ${BASE} AND i.posting_date BETWEEN $1::date AND $2::date AND ${CH}`,
    [start, end, channels],
  );
  const items = await one(
    `SELECT COALESCE(SUM(it.qty), 0)::float8 AS qty, COUNT(*)::int AS lines
       FROM erp_invoice_items it JOIN erp_invoices i ON i.name = it.invoice
      WHERE ${BASE} AND i.posting_date BETWEEN $1::date AND $2::date AND ${CH}`,
    [start, end, channels],
  );
  return { ...row, items_qty: items?.qty ?? 0, lines: items?.lines ?? 0 };
}

/** Sales per bucket (day / week / month) for a range, zero-filled. */
export async function bucketed(start, end, channels, granularity = granularityFor(1 + (toDate(end) - toDate(start)) / 86_400_000)) {
  const rows = await query(
    `SELECT date_trunc($4, i.posting_date)::date::text AS bucket,
            COALESCE(SUM(i.grand_total), 0)::float8 AS sales,
            COUNT(*) FILTER (WHERE NOT COALESCE(i.is_return, false))::int AS invoices,
            COALESCE(SUM(i.grand_total) FILTER (WHERE i.channel = 'app'), 0)::float8 AS app,
            COALESCE(SUM(i.grand_total) FILTER (WHERE i.channel = 'web'), 0)::float8 AS web,
            COALESCE(SUM(i.grand_total) FILTER (WHERE i.channel = 'offline' OR i.channel IS NULL), 0)::float8 AS offline
       FROM erp_invoices i
      WHERE ${BASE} AND i.posting_date BETWEEN $1::date AND $2::date AND ${CH}
      GROUP BY 1 ORDER BY 1`,
    [start, end, channels, granularity],
  );
  const byBucket = new Map(rows.map((r) => [r.bucket, r]));
  const series = [];
  for (const b of buckets(start, end, granularity)) {
    const r = byBucket.get(b);
    series.push({ bucket: b, sales: 0, invoices: 0, app: 0, web: 0, offline: 0, ...(r || {}) });
  }
  return { granularity, series };
}

/** Bucket start dates covering [start, end] at the given granularity. */
export function buckets(start, end, granularity) {
  const out = [];
  let cur = start;
  if (granularity === 'week') {
    const dow = (toDate(start).getUTCDay() + 6) % 7;
    cur = addDays(start, -dow);
  } else if (granularity === 'month') {
    cur = `${start.slice(0, 7)}-01`;
  }
  while (cur <= end) {
    out.push(cur);
    if (granularity === 'day') cur = addDays(cur, 1);
    else if (granularity === 'week') cur = addDays(cur, 7);
    else {
      const d = toDate(cur);
      cur = toIso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)));
    }
  }
  return out;
}

export async function byCategory(start, end, channels) {
  return query(
    `SELECT COALESCE(it.item_group, 'Uncategorised') AS item_group,
            COALESCE(SUM(it.amount), 0)::float8 AS revenue,
            COALESCE(SUM(it.qty), 0)::float8 AS qty,
            COUNT(DISTINCT it.invoice)::int AS invoices
       FROM erp_invoice_items it JOIN erp_invoices i ON i.name = it.invoice
      WHERE ${BASE} AND i.posting_date BETWEEN $1::date AND $2::date AND ${CH}
      GROUP BY 1 ORDER BY revenue DESC`,
    [start, end, channels],
  );
}

/** Invoices by weekday × hour of posting_time. */
export async function heatmap(start, end, channels) {
  const rows = await query(
    `SELECT EXTRACT(ISODOW FROM i.posting_date)::int AS dow,
            EXTRACT(HOUR FROM i.posting_time::time)::int AS hour,
            COUNT(*)::int AS invoices,
            COALESCE(SUM(i.grand_total), 0)::float8 AS sales
       FROM erp_invoices i
      WHERE ${BASE} AND i.posting_date BETWEEN $1::date AND $2::date AND ${CH} AND i.posting_time IS NOT NULL
      GROUP BY 1, 2`,
    [start, end, channels],
  );
  const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ invoices: 0, sales: 0 })));
  let max = 0;
  for (const r of rows) {
    if (r.dow >= 1 && r.dow <= 7 && r.hour >= 0 && r.hour < 24) {
      grid[r.dow - 1][r.hour] = { invoices: r.invoices, sales: r.sales };
      max = Math.max(max, r.invoices);
    }
  }
  return { grid, max };
}

export async function outstandingList(limit = 25) {
  return query(
    `SELECT i.name, i.posting_date::text AS posting_date, i.customer, i.grand_total, i.outstanding, i.status,
            COALESCE(c.contact_name, c.customer_name, i.customer) AS display_name,
            (CURRENT_DATE - i.posting_date)::int AS age_days
       FROM erp_invoices i LEFT JOIN erp_customers c ON c.name = i.customer
      WHERE ${BASE} AND i.outstanding > 0
      ORDER BY i.outstanding DESC, i.posting_date ASC
      LIMIT $1`,
    [limit],
  );
}

export async function outstandingTotals() {
  return one(
    `SELECT COALESCE(SUM(i.outstanding), 0)::float8 AS amount, COUNT(*)::int AS invoices,
            COUNT(*) FILTER (WHERE i.posting_date < CURRENT_DATE - 30)::int AS older_than_30d
       FROM erp_invoices i WHERE ${BASE} AND i.outstanding > 0`,
  );
}

const PAGE_SIZE = 25;

/**
 * Invoice list with filters. Returns { rows, total, page, pages }.
 * q matches the invoice name, customer id, display name or SF order id.
 */
export async function invoiceList({ start, end, channels, q = '', status = '', minAmount = 0, page = 1 }) {
  const like = q ? `%${q.trim()}%` : null;
  const rows = await query(
    `SELECT i.name, i.posting_date::text AS posting_date, i.posting_time, i.customer, i.channel, i.sf_order_id,
            i.grand_total, i.discount_amount, i.outstanding, i.status, i.is_return,
            ${displayName({ c: 'c', i: 'i', id: 'i.customer' })} AS display_name,
            (SELECT COUNT(*)::int FROM erp_invoice_items it WHERE it.invoice = i.name) AS lines,
            COUNT(*) OVER()::int AS total
       FROM erp_invoices i LEFT JOIN erp_customers c ON c.name = i.customer
      WHERE ${BASE} AND i.posting_date BETWEEN $1::date AND $2::date AND ${CH}
        AND ($4::text IS NULL OR i.name ILIKE $4 OR i.customer ILIKE $4 OR c.full_name ILIKE $4 OR i.customer_full_name ILIKE $4
             OR c.contact_name ILIKE $4 OR c.customer_name ILIKE $4 OR i.sf_order_id ILIKE $4)
        AND ($5::text = '' OR i.status = $5)
        AND i.grand_total >= $6
      ORDER BY i.posting_date DESC, i.posting_time DESC NULLS LAST, i.name DESC
      LIMIT $7 OFFSET $8`,
    [start, end, channels, like, status, Number(minAmount) || 0, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
  const total = rows[0]?.total ?? 0;
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE };
}

export async function invoiceStatuses() {
  const rows = await query(`SELECT DISTINCT status FROM erp_invoices WHERE docstatus = 1 AND status IS NOT NULL ORDER BY 1`);
  return rows.map((r) => r.status);
}

export async function drafts() {
  return one(
    `SELECT COUNT(*)::int AS n, MIN(posting_date)::text AS oldest, MAX(posting_date)::text AS newest
       FROM erp_invoices WHERE docstatus = 0 AND deleted_at IS NULL`,
  );
}

export async function futureDated(today) {
  return one(
    `SELECT COUNT(*)::int AS n, COALESCE(SUM(grand_total), 0)::float8 AS amount
       FROM erp_invoices WHERE docstatus = 1 AND deleted_at IS NULL AND posting_date > $1::date`,
    [today],
  );
}

export async function cancelledAndAmended(start, end) {
  return one(
    `SELECT COUNT(*)::int AS cancelled,
            COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM erp_invoices a WHERE a.amended_from = i.name))::int AS amended
       FROM erp_invoices i WHERE i.docstatus = 2 AND i.deleted_at IS NULL AND i.posting_date BETWEEN $1::date AND $2::date`,
    [start, end],
  );
}
