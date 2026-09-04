/**
 * Orders page (dashboard_spec.md §6.5): the online pipeline and the seven
 * "did not go through" buckets. Everything here is ordered, never sales.
 */
import 'server-only';

import { one, query } from '@/lib/dashboard/db';

const DAR_DATE = "(o.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Dar_es_Salaam')::date";
const ORDER_COLS = `o.id, o.status, o.created_at, o.customer_name, o.customer_phone, o.total, o.channel, o.app_version,
                    o.promo_code, o.discount, o.accu360_order_id, o.failure_reason`;

/**
 * Fresh slate (owner, 2026-09-04): everything before this Dar date had been
 * dealt with by hand, so the attention list starts here. Deleted Sales
 * Orders keep a 14-day window because they are found late.
 */
export const ATTENTION_SINCE = '2026-09-04';

/** Orders someone has marked as handled from the dashboard (audit action 'handled'). */
const NOT_HANDLED = `NOT EXISTS (SELECT 1 FROM dashboard_audit a WHERE a.action = 'handled' AND a.detail->>'order_id' = o.id)`;

/** The attention list — one array per bucket letter (B–G plus twins). */
export async function attention({ since = ATTENTION_SINCE, deletedDays = 14, includeHandled = false } = {}) {
  const fresh = `${DAR_DATE} >= $1::date`;
  const handled = includeHandled ? 'true' : NOT_HANDLED;
  const p = [since];
  const [rejected, failed, queued, noSalesOrder, reconcile, soDeleted, notInvoiced, mismatch, twins] = await Promise.all([
    query(`SELECT ${ORDER_COLS} FROM orders o WHERE o.status = 'rejected' AND ${fresh} AND ${handled} ORDER BY o.created_at DESC LIMIT 100`, p),
    query(`SELECT ${ORDER_COLS} FROM orders o WHERE o.status = 'failed' AND ${fresh} AND ${handled} ORDER BY o.created_at DESC LIMIT 100`, p),
    query(`SELECT ${ORDER_COLS} FROM orders o WHERE o.status = 'queued' AND o.created_at < (now() AT TIME ZONE 'UTC') - INTERVAL '15 minutes' AND ${fresh} AND ${handled} ORDER BY o.created_at DESC LIMIT 100`, p),
    query(`SELECT ${ORDER_COLS} FROM orders o WHERE o.status = 'pending' AND o.accu360_order_id IS NULL AND o.created_at < (now() AT TIME ZONE 'UTC') - INTERVAL '60 minutes' AND ${fresh} AND ${handled} ORDER BY o.created_at DESC LIMIT 100`, p),
    query(`SELECT ${ORDER_COLS} FROM orders o WHERE o.failure_reason LIKE 'RECONCILE%' AND ${fresh} AND ${handled} ORDER BY o.created_at DESC LIMIT 100`, p),
    query(`SELECT ${ORDER_COLS}, d.deleted_on, d.deleted_by FROM orders o JOIN erp_deleted_docs d ON d.deleted_doctype = 'Sales Order' AND d.deleted_name = o.accu360_order_id WHERE d.deleted_on >= (now() AT TIME ZONE 'UTC') - ($2 || ' days')::interval AND ${handled} AND NOT EXISTS (SELECT 1 FROM erp_invoices i WHERE i.sf_order_id = o.id AND i.docstatus = 1) ORDER BY d.deleted_on DESC LIMIT 100`, [since, String(deletedDays)]),
    query(`SELECT ${ORDER_COLS}, s.name AS so_name, s.delivery_date::text AS delivery_date, s.status AS so_status FROM orders o JOIN erp_sales_orders s ON s.po_no = o.id AND s.docstatus = 1 AND s.deleted_at IS NULL WHERE o.status = 'pending' AND COALESCE(s.per_billed, 0) = 0 AND s.status NOT IN ('Cancelled', 'Closed', 'Completed') AND s.delivery_date < CURRENT_DATE - 1 AND ${fresh} AND ${handled} ORDER BY s.delivery_date ASC LIMIT 100`, p),
    query(`SELECT ${ORDER_COLS}, i.name AS invoice, i.grand_total AS invoiced, i.posting_date::text AS posting_date FROM orders o JOIN erp_invoices i ON i.sf_order_id = o.id AND i.docstatus = 1 AND i.deleted_at IS NULL WHERE ${fresh} AND ${handled} AND ABS(i.grand_total - o.total) > GREATEST(2000, 0.05 * o.total) ORDER BY o.created_at DESC LIMIT 100`, p),
    query(`SELECT ${ORDER_COLS} FROM orders o WHERE o.failure_reason LIKE 'DUPLICATE%' AND ${fresh} ORDER BY o.created_at DESC LIMIT 50`, p),
  ]);
  return { rejected, failed, queued, noSalesOrder, reconcile, soDeleted, notInvoiced, mismatch, twins };
}

/** Who handled what, most recent first. */
export async function handledRecently(limit = 50) {
  return query(
    `SELECT a.at, a.actor, a.detail->>'order_id' AS order_id, a.detail->>'bucket' AS bucket, a.detail->>'note' AS note
       FROM dashboard_audit a WHERE a.action = 'handled' ORDER BY a.at DESC LIMIT $1`,
    [limit],
  );
}

export async function attemptsByDay(days = 14) {
  return query(
    `SELECT date_dar::text AS date, outcome, SUM(count)::int AS n
       FROM order_attempts_daily
      WHERE date_dar >= CURRENT_DATE - $1::int
      GROUP BY 1, 2 ORDER BY 1`,
    [days],
  );
}

export async function statusByDay(days = 14) {
  return query(
    `SELECT ${DAR_DATE}::text AS date, o.status, COUNT(*)::int AS n
       FROM orders o
      WHERE o.created_at >= (now() AT TIME ZONE 'UTC') - ($1 || ' days')::interval
      GROUP BY 1, 2 ORDER BY 1`,
    [String(days)],
  );
}

/** Order-to-invoice lag over the last 30 days, in hours. */
export async function invoiceLag(days = 30) {
  const rows = await query(
    `SELECT EXTRACT(EPOCH FROM ((i.posting_date + COALESCE(i.posting_time::time, TIME '18:00'))
                                - (o.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Dar_es_Salaam'))) / 3600.0 AS hours
       FROM orders o JOIN erp_invoices i ON i.sf_order_id = o.id AND i.docstatus = 1 AND i.deleted_at IS NULL
      WHERE o.created_at >= (now() AT TIME ZONE 'UTC') - ($1 || ' days')::interval`,
    [String(days)],
  );
  const hours = rows.map((r) => Number(r.hours)).filter((h) => Number.isFinite(h)).sort((a, b) => a - b);
  const q = (p) => (hours.length ? hours[Math.min(hours.length - 1, Math.floor(p * hours.length))] : null);
  const bucket = (h) => (h < 6 ? '< 6 h' : h < 24 ? '6–24 h' : h < 48 ? '1–2 days' : '> 2 days');
  const counts = { '< 6 h': 0, '6–24 h': 0, '1–2 days': 0, '> 2 days': 0 };
  for (const h of hours) counts[bucket(Math.max(0, h))] += 1;
  return { n: hours.length, median: q(0.5), p90: q(0.9), buckets: counts };
}

export async function reconciliationState(days = 7) {
  const [latest, runs] = await Promise.all([
    query(`SELECT DISTINCT ON (kind) kind, taken_at, payload FROM ops_snapshots WHERE kind IN ('reconcile', 'completion') ORDER BY kind, taken_at DESC`),
    query(`SELECT (taken_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Dar_es_Salaam')::date::text AS date, COUNT(*)::int AS runs FROM ops_snapshots WHERE kind = 'reconcile' AND taken_at >= (now() AT TIME ZONE 'UTC') - ($1 || ' days')::interval GROUP BY 1 ORDER BY 1`, [String(days)]),
  ]);
  return { latest: Object.fromEntries(latest.map((r) => [r.kind, r])), runs };
}

const PAGE_SIZE = 25;

export async function orderList({ status = '', channelKey = 'all', promo = '', combo = false, q = '', start, end, page = 1 }) {
  const like = q ? `%${q.trim()}%` : null;
  const channels = channelKey === 'app' ? ['mobile_release', 'mobile_debug'] : channelKey === 'web' ? ['web'] : channelKey === 'online' ? ['mobile_release', 'mobile_debug', 'web'] : null;
  const rows = await query(
    `SELECT ${ORDER_COLS},
            i.name AS invoice, i.grand_total AS invoiced,
            (SELECT COUNT(*)::int FROM json_array_elements(o.items)) AS lines,
            EXISTS (SELECT 1 FROM json_array_elements(o.items) e WHERE COALESCE(e->>'combo_id', '') <> '') AS has_combo,
            COUNT(*) OVER()::int AS total
       FROM orders o
       LEFT JOIN LATERAL (SELECT name, grand_total FROM erp_invoices WHERE sf_order_id = o.id AND docstatus = 1 AND deleted_at IS NULL ORDER BY posting_date DESC LIMIT 1) i ON true
      WHERE ${DAR_DATE} BETWEEN $1::date AND $2::date
        AND ($3::text = '' OR o.status = $3)
        AND ($4::text[] IS NULL OR o.channel = ANY($4::text[]))
        AND ($5::text = '' OR o.promo_code = $5)
        AND ($6::boolean = false OR EXISTS (SELECT 1 FROM json_array_elements(o.items) e WHERE COALESCE(e->>'combo_id', '') <> ''))
        AND ($7::text IS NULL OR o.id ILIKE $7 OR o.customer_name ILIKE $7 OR o.customer_phone ILIKE $7 OR o.accu360_order_id ILIKE $7)
      ORDER BY o.created_at DESC
      LIMIT $8 OFFSET $9`,
    [start, end, status, channels, promo.toUpperCase(), Boolean(combo), like, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
  const total = rows[0]?.total ?? 0;
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function orderDetail(id) {
  const order = await one(`SELECT o.*, ${DAR_DATE} AS created_dar FROM orders o WHERE o.id = $1`, [id]);
  if (!order) return null;
  const [salesOrders, invoices, deleted, acks] = await Promise.all([
    query('SELECT name, status, docstatus, per_billed, grand_total, discount_amount, transaction_date::text AS transaction_date, delivery_date::text AS delivery_date, deleted_at FROM erp_sales_orders WHERE po_no = $1 ORDER BY name', [id]),
    query('SELECT name, docstatus, status, posting_date::text AS posting_date, posting_time, grand_total, discount_amount, outstanding, amended_from, deleted_at FROM erp_invoices WHERE sf_order_id = $1 ORDER BY posting_date, name', [id]),
    query("SELECT deleted_doctype, deleted_name, deleted_on, deleted_by FROM erp_deleted_docs WHERE deleted_name = $1 OR deleted_name = ANY(SELECT accu360_order_id FROM orders WHERE id = $2 AND accu360_order_id IS NOT NULL)", [order.accu360_order_id || '', id]),
    query("SELECT at, actor, action, detail FROM dashboard_audit WHERE action IN ('acknowledge', 'handled') AND detail->>'order_id' = $1 ORDER BY at DESC", [id]),
  ]);
  const twin = order.failure_reason?.startsWith('DUPLICATE') ? (order.failure_reason.match(/SF-\d{8}-[0-9a-f]{8}/g) || []).find((x) => x !== id) : null;
  return { order, salesOrders, invoices, deleted, acks, twin };
}

export async function promoCodesSeen() {
  const rows = await query(`SELECT promo_code, COUNT(*)::int AS n FROM orders WHERE promo_code IS NOT NULL GROUP BY 1 ORDER BY n DESC LIMIT 50`);
  return rows.map((r) => r.promo_code);
}
