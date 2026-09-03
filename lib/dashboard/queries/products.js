/**
 * Products page (dashboard_spec.md §6.3): what sells, what is dying, what
 * goes together. Item revenue = Σ invoice line amount on submitted invoices.
 */
import 'server-only';

import { one, query } from '@/lib/dashboard/db';
import { addDays, darDate } from '@/lib/dashboard/periods';

const BASE = 'i.docstatus = 1 AND i.deleted_at IS NULL';
const CH = '($5::text[] IS NULL OR i.channel = ANY($5::text[]))';

/** Items over the period and its comparison in one pass. */
export async function items(start, end, compareStart, compareEnd, channels, limit = 200) {
  return query(
    `SELECT it.item_code,
            MAX(it.item_name) AS item_name, MAX(it.item_group) AS item_group, MAX(it.uom) AS uom,
            COALESCE(SUM(it.amount) FILTER (WHERE i.posting_date BETWEEN $1::date AND $2::date), 0)::float8 AS revenue,
            COALESCE(SUM(it.qty) FILTER (WHERE i.posting_date BETWEEN $1::date AND $2::date), 0)::float8 AS qty,
            COUNT(DISTINCT it.invoice) FILTER (WHERE i.posting_date BETWEEN $1::date AND $2::date)::int AS invoices,
            COALESCE(SUM(it.amount) FILTER (WHERE i.posting_date BETWEEN $3::date AND $4::date), 0)::float8 AS revenue_prev,
            COUNT(DISTINCT it.invoice) FILTER (WHERE i.posting_date BETWEEN $3::date AND $4::date)::int AS invoices_prev
       FROM erp_invoice_items it JOIN erp_invoices i ON i.name = it.invoice
      WHERE ${BASE} AND it.item_code IS NOT NULL AND ${CH}
        AND (i.posting_date BETWEEN $1::date AND $2::date OR i.posting_date BETWEEN $3::date AND $4::date)
      GROUP BY it.item_code
      ORDER BY revenue DESC
      LIMIT $6`,
    [start, end, compareStart, compareEnd, channels, limit],
  );
}

/** ERP-enabled items with no sale in `days` days (or ever). */
export async function notSelling(days = 60, limit = 100) {
  return query(
    `SELECT e.item_code, e.item_name, e.item_group, MAX(i.posting_date)::text AS last_sold
       FROM erp_items e
       LEFT JOIN erp_invoice_items l ON l.item_code = e.item_code
       LEFT JOIN erp_invoices i ON i.name = l.invoice AND i.docstatus = 1 AND i.deleted_at IS NULL
      WHERE COALESCE(e.disabled, false) = false
      GROUP BY e.item_code, e.item_name, e.item_group
     HAVING MAX(i.posting_date) IS NULL OR MAX(i.posting_date) < CURRENT_DATE - $1::int
      ORDER BY MAX(i.posting_date) NULLS FIRST, e.item_name
      LIMIT $2`,
    [days, limit],
  );
}

/** Item pairs on the same invoice, with lift over independence. */
export async function boughtTogether(start, end, minTogether = 5, limit = 20) {
  return query(
    `WITH inv AS (
       SELECT name FROM erp_invoices i WHERE ${BASE} AND i.posting_date BETWEEN $1::date AND $2::date
     ), lines AS (
       SELECT DISTINCT l.invoice, l.item_code FROM erp_invoice_items l JOIN inv ON inv.name = l.invoice WHERE l.item_code IS NOT NULL
     ), cnt AS (
       SELECT item_code, COUNT(*)::float8 AS n FROM lines GROUP BY 1
     ), total AS (
       SELECT COUNT(*)::float8 AS n FROM inv
     ), pairs AS (
       SELECT a.item_code AS a, b.item_code AS b, COUNT(*)::int AS together
         FROM lines a JOIN lines b ON a.invoice = b.invoice AND a.item_code < b.item_code
        GROUP BY 1, 2 HAVING COUNT(*) >= $3
     )
     SELECT p.a, p.b, p.together, ca.n::int AS n_a, cb.n::int AS n_b,
            (p.together / NULLIF(ca.n * cb.n / total.n, 0))::float8 AS lift,
            ia.item_name AS a_name, ib.item_name AS b_name
       FROM pairs p
       JOIN cnt ca ON ca.item_code = p.a
       JOIN cnt cb ON cb.item_code = p.b
       CROSS JOIN total
       LEFT JOIN erp_items ia ON ia.item_code = p.a
       LEFT JOIN erp_items ib ON ib.item_code = p.b
      ORDER BY lift DESC, p.together DESC
      LIMIT $4`,
    [start, end, minTogether, limit],
  );
}

export async function disabledItemsStillSelling(days = 30) {
  return query(
    `SELECT e.item_code, e.item_name, COUNT(DISTINCT l.invoice)::int AS invoices, MAX(i.posting_date)::text AS last_sold
       FROM erp_items e JOIN erp_invoice_items l ON l.item_code = e.item_code
       JOIN erp_invoices i ON i.name = l.invoice AND i.docstatus = 1 AND i.deleted_at IS NULL AND i.posting_date >= CURRENT_DATE - $1::int
      WHERE e.disabled = true GROUP BY 1, 2 ORDER BY invoices DESC`,
    [days],
  );
}

export async function itemDetail(code, start, end, now = new Date()) {
  const info = await one('SELECT item_code, item_name, item_group, disabled FROM erp_items WHERE item_code = $1', [code]);
  const nameRow = info || await one('SELECT item_code, MAX(item_name) AS item_name, MAX(item_group) AS item_group FROM erp_invoice_items WHERE item_code = $1 GROUP BY item_code', [code]);
  if (!nameRow) return null;
  const today = darDate(now);
  const trendStart = addDays(today, -89);
  const [trend, channels, customers, invoices, totals] = await Promise.all([
    query(
      `SELECT i.posting_date::text AS date, COALESCE(SUM(l.amount), 0)::float8 AS revenue, COALESCE(SUM(l.qty), 0)::float8 AS qty
         FROM erp_invoice_items l JOIN erp_invoices i ON i.name = l.invoice
        WHERE ${BASE} AND l.item_code = $1 AND i.posting_date BETWEEN $2::date AND $3::date GROUP BY 1 ORDER BY 1`,
      [code, trendStart, today],
    ),
    query(
      `SELECT COALESCE(i.channel, 'offline') AS channel, COALESCE(SUM(l.amount), 0)::float8 AS sales, COUNT(DISTINCT l.invoice)::int AS invoices
         FROM erp_invoice_items l JOIN erp_invoices i ON i.name = l.invoice
        WHERE ${BASE} AND l.item_code = $1 AND i.posting_date BETWEEN $2::date AND $3::date GROUP BY 1`,
      [code, start, end],
    ),
    query(
      `SELECT i.customer, COALESCE(c.contact_name, c.customer_name, i.customer) AS display_name,
              COUNT(DISTINCT l.invoice)::int AS invoices, COALESCE(SUM(l.amount), 0)::float8 AS revenue, COALESCE(SUM(l.qty), 0)::float8 AS qty
         FROM erp_invoice_items l JOIN erp_invoices i ON i.name = l.invoice LEFT JOIN erp_customers c ON c.name = i.customer
        WHERE ${BASE} AND l.item_code = $1 AND i.posting_date BETWEEN $2::date AND $3::date
        GROUP BY i.customer, c.contact_name, c.customer_name ORDER BY revenue DESC LIMIT 10`,
      [code, start, end],
    ),
    query(
      `SELECT i.name, i.posting_date::text AS posting_date, i.customer, COALESCE(c.contact_name, c.customer_name, i.customer) AS display_name,
              l.qty, l.uom, l.rate, l.amount, i.channel
         FROM erp_invoice_items l JOIN erp_invoices i ON i.name = l.invoice LEFT JOIN erp_customers c ON c.name = i.customer
        WHERE ${BASE} AND l.item_code = $1 ORDER BY i.posting_date DESC, i.name DESC LIMIT 30`,
      [code],
    ),
    one(
      `SELECT COALESCE(SUM(l.amount), 0)::float8 AS revenue, COALESCE(SUM(l.qty), 0)::float8 AS qty, COUNT(DISTINCT l.invoice)::int AS invoices,
              MIN(i.posting_date)::text AS first_sold, MAX(i.posting_date)::text AS last_sold, AVG(l.rate)::float8 AS avg_rate
         FROM erp_invoice_items l JOIN erp_invoices i ON i.name = l.invoice
        WHERE ${BASE} AND l.item_code = $1 AND i.posting_date BETWEEN $2::date AND $3::date`,
      [code, start, end],
    ),
  ]);
  const byDate = new Map(trend.map((t) => [t.date, t]));
  const series = [];
  for (let d = trendStart; d <= today; d = addDays(d, 1)) series.push({ date: d, sales: byDate.get(d)?.revenue ?? 0, online: 0, invoices: 0 });
  for (let i = 0; i < series.length; i += 1) {
    const w = series.slice(Math.max(0, i - 6), i + 1);
    series[i].avg7 = w.reduce((s, x) => s + x.sales, 0) / w.length;
  }
  return { info: { ...nameRow, disabled: info?.disabled ?? null }, trend: series, channels, customers, invoices, totals };
}
