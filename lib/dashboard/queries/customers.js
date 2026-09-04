/**
 * Customers page (dashboard_spec.md §6.4). Customer = the Accu360 Customer on
 * the invoice; display name resolved app-name → Contact → customer_name.
 */
import 'server-only';

import { one, query } from '@/lib/dashboard/db';
import { addDays, darDate } from '@/lib/dashboard/periods';
import { appNameLateral, displayName } from '@/lib/dashboard/queries/_names';

const BASE = 'i.docstatus = 1 AND i.deleted_at IS NULL';
const DISPLAY = displayName({ c: 'c', o: 'o', id: 'x.customer' });
const APP_NAME_LATERAL = appNameLateral('c', 'o');

export async function kpis(start, end, now = new Date()) {
  const today = darDate(now);
  const row = await one(
    `WITH firsts AS (
       SELECT customer, MIN(posting_date) AS first_date, MAX(posting_date) AS last_date, COUNT(*) AS lifetime
         FROM erp_invoices i WHERE ${BASE} AND customer IS NOT NULL GROUP BY customer
     )
     SELECT (SELECT COUNT(DISTINCT customer) FROM erp_invoices i WHERE ${BASE} AND posting_date > $3::date - 30)::int AS active_30d,
            (SELECT COUNT(*) FROM firsts WHERE first_date BETWEEN $1::date AND $2::date)::int AS new_in_period,
            (SELECT COUNT(*) FROM firsts WHERE lifetime >= 2 AND last_date < $3::date - 45)::int AS lapsed,
            (SELECT COALESCE(SUM(i.grand_total), 0) FROM erp_invoices i JOIN firsts f ON f.customer = i.customer
              WHERE ${BASE} AND i.posting_date BETWEEN $1::date AND $2::date AND f.first_date < $1::date)::float8 AS returning_sales,
            (SELECT COALESCE(SUM(i.grand_total), 0) FROM erp_invoices i WHERE ${BASE} AND i.posting_date BETWEEN $1::date AND $2::date)::float8 AS sales`,
    [start, end, today],
  );
  return row;
}

export async function top(start, end, orderBy = 'invoices', limit = 50) {
  const inner = orderBy === 'revenue' ? 'revenue DESC, invoices DESC' : 'invoices DESC, revenue DESC';
  const outer = orderBy === 'revenue' ? 'x.revenue DESC, x.invoices DESC' : 'x.invoices DESC, x.revenue DESC';
  return query(
    `WITH x AS (
       SELECT customer,
              COUNT(*) FILTER (WHERE NOT COALESCE(is_return, false))::int AS invoices,
              COALESCE(SUM(grand_total), 0)::float8 AS revenue,
              MIN(posting_date)::text AS first_in_period, MAX(posting_date)::text AS last_invoice,
              COUNT(*) FILTER (WHERE channel IN ('app', 'web'))::int AS online_invoices
         FROM erp_invoices i WHERE ${BASE} AND posting_date BETWEEN $1::date AND $2::date AND customer IS NOT NULL
        GROUP BY customer ORDER BY ${inner} LIMIT $3
     )
     SELECT x.*, ${DISPLAY} AS display_name, c.phone, c.customer_group,
            (SELECT MIN(posting_date)::text FROM erp_invoices f WHERE f.customer = x.customer AND f.docstatus = 1) AS first_ever
       FROM x LEFT JOIN erp_customers c ON c.name = x.customer ${APP_NAME_LATERAL}
      ORDER BY ${outer}`,
    [start, end, limit],
  );
}

export async function newVsReturningWeekly(weeks = 12, now = new Date()) {
  const today = darDate(now);
  const start = addDays(today, -(7 * weeks - 1));
  return query(
    `WITH firsts AS (SELECT customer, MIN(posting_date) AS first_date FROM erp_invoices i WHERE ${BASE} GROUP BY customer)
     SELECT date_trunc('week', i.posting_date)::date::text AS week,
            COALESCE(SUM(i.grand_total) FILTER (WHERE f.first_date >= date_trunc('week', i.posting_date)), 0)::float8 AS new_sales,
            COALESCE(SUM(i.grand_total) FILTER (WHERE f.first_date < date_trunc('week', i.posting_date)), 0)::float8 AS returning_sales
       FROM erp_invoices i JOIN firsts f ON f.customer = i.customer
      WHERE ${BASE} AND i.posting_date BETWEEN $1::date AND $2::date
      GROUP BY 1 ORDER BY 1`,
    [start, today],
  );
}

export async function frequency(days = 90, now = new Date()) {
  const today = darDate(now);
  const rows = await query(
    `SELECT CASE WHEN n = 1 THEN '1' WHEN n = 2 THEN '2' WHEN n <= 4 THEN '3–4' WHEN n <= 8 THEN '5–8' ELSE '9+' END AS bucket, COUNT(*)::int AS customers
       FROM (SELECT customer, COUNT(*) AS n FROM erp_invoices i WHERE ${BASE} AND posting_date > $1::date - $2::int AND customer IS NOT NULL GROUP BY customer) t
      GROUP BY 1`,
    [today, days],
  );
  const order = ['1', '2', '3–4', '5–8', '9+'];
  return order.map((b) => ({ label: `${b} invoice${b === '1' ? '' : 's'}`, value: rows.find((r) => r.bucket === b)?.customers ?? 0 }));
}

/** Monthly cohorts: share of a first-invoice month's customers seen again N months later. */
export async function cohorts(months = 6, now = new Date()) {
  const today = darDate(now);
  const start = `${addDays(today, -31 * months).slice(0, 7)}-01`;
  const rows = await query(
    `WITH firsts AS (SELECT customer, date_trunc('month', MIN(posting_date))::date AS cohort FROM erp_invoices i WHERE ${BASE} AND customer IS NOT NULL GROUP BY customer),
     activity AS (SELECT DISTINCT i.customer, date_trunc('month', i.posting_date)::date AS month FROM erp_invoices i WHERE ${BASE})
     SELECT f.cohort::text AS cohort, COUNT(DISTINCT f.customer)::int AS size,
            ((EXTRACT(YEAR FROM a.month) - EXTRACT(YEAR FROM f.cohort)) * 12 + EXTRACT(MONTH FROM a.month) - EXTRACT(MONTH FROM f.cohort))::int AS months_since,
            COUNT(DISTINCT a.customer)::int AS returning
       FROM firsts f JOIN activity a ON a.customer = f.customer
      WHERE f.cohort >= $1::date
      GROUP BY f.cohort, months_since ORDER BY f.cohort, months_since`,
    [start],
  );
  const byCohort = new Map();
  for (const r of rows) {
    if (!byCohort.has(r.cohort)) byCohort.set(r.cohort, { cohort: r.cohort, size: 0, cells: {} });
    const c = byCohort.get(r.cohort);
    if (r.months_since === 0) c.size = r.returning;
    c.cells[r.months_since] = r.returning;
  }
  return [...byCohort.values()];
}

export async function lapsed(limit = 50, days = 45, now = new Date()) {
  const today = darDate(now);
  return query(
    `WITH x AS (
       SELECT customer, COUNT(*)::int AS lifetime, COALESCE(SUM(grand_total), 0)::float8 AS revenue, MAX(posting_date)::text AS last_invoice
         FROM erp_invoices i WHERE ${BASE} AND customer IS NOT NULL GROUP BY customer
       HAVING COUNT(*) >= 2 AND MAX(posting_date) < $1::date - $2::int
     )
     SELECT x.*, ${DISPLAY} AS display_name, c.phone,
            (SELECT STRING_AGG(item_name, ', ') FROM (
               SELECT MAX(l.item_name) AS item_name FROM erp_invoice_items l JOIN erp_invoices i ON i.name = l.invoice
                WHERE i.customer = x.customer AND i.docstatus = 1 GROUP BY l.item_code ORDER BY SUM(l.amount) DESC LIMIT 3) t) AS usual_items
       FROM x LEFT JOIN erp_customers c ON c.name = x.customer ${APP_NAME_LATERAL}
      ORDER BY x.revenue DESC LIMIT $3`,
    [today, days, limit],
  );
}

export async function migration(start, end) {
  return one(
    `WITH per AS (
       SELECT customer,
              BOOL_OR(channel IN ('app', 'web')) AS any_online,
              BOOL_OR(COALESCE(channel, 'offline') = 'offline') AS any_offline,
              MIN(posting_date) FILTER (WHERE channel IN ('app', 'web')) AS first_online,
              MIN(posting_date) AS first_any,
              MIN(posting_date) FILTER (WHERE COALESCE(channel, 'offline') = 'offline') AS first_offline
         FROM erp_invoices i WHERE ${BASE} AND customer IS NOT NULL GROUP BY customer
     )
     SELECT COUNT(*) FILTER (WHERE any_online AND NOT any_offline)::int AS online_only,
            COUNT(*) FILTER (WHERE any_offline AND NOT any_online)::int AS offline_only,
            COUNT(*) FILTER (WHERE any_online AND any_offline)::int AS both,
            COUNT(*) FILTER (WHERE first_offline IS NOT NULL AND first_online IS NOT NULL AND first_offline < first_online AND first_online BETWEEN $1::date AND $2::date)::int AS moved_online_in_period
       FROM per`,
    [start, end],
  );
}

export async function search(q, limit = 20) {
  const like = `%${q.trim()}%`;
  const digits = q.replace(/\D/g, '');
  return query(
    `SELECT c.name, ${displayName({ c: 'c', o: 'o', id: 'c.name' })} AS display_name, c.phone, c.customer_group,
            (SELECT COUNT(*)::int FROM erp_invoices i WHERE i.customer = c.name AND i.docstatus = 1) AS invoices
       FROM erp_customers c ${APP_NAME_LATERAL}
      WHERE c.name ILIKE $1 OR c.customer_name ILIKE $1 OR c.full_name ILIKE $1 OR c.contact_name ILIKE $1 OR o.customer_name ILIKE $1
         OR ($2 <> '' AND c.phone_identity LIKE '%' || $2 || '%')
      ORDER BY invoices DESC LIMIT $3`,
    [like, digits.slice(-9), limit],
  );
}

export async function detail(id) {
  const header = await one(
    `SELECT c.name, c.customer_name, c.full_name, c.contact_name, c.phone, c.phone_identity, c.customer_group, c.territory, c.first_seen::text AS first_seen,
            o.customer_name AS app_name, o.customer_email, o.customer_address
       FROM erp_customers c
       LEFT JOIN LATERAL (SELECT customer_name, customer_email, customer_address FROM orders
                           WHERE c.phone_identity IS NOT NULL AND RIGHT(REGEXP_REPLACE(customer_phone, '\\D', '', 'g'), 9) = c.phone_identity
                           ORDER BY created_at DESC LIMIT 1) o ON true
      WHERE c.name = $1`,
    [id],
  );
  const fallback = header || await one('SELECT customer AS name, MAX(customer_name) AS customer_name FROM erp_invoices WHERE customer = $1 GROUP BY customer', [id]);
  if (!fallback) return null;
  const [totals, monthly, invoices, orders, items] = await Promise.all([
    one(`SELECT COUNT(*) FILTER (WHERE NOT COALESCE(is_return, false))::int AS invoices, COALESCE(SUM(grand_total), 0)::float8 AS revenue,
                MIN(posting_date)::text AS first_invoice, MAX(posting_date)::text AS last_invoice, COALESCE(SUM(outstanding), 0)::float8 AS outstanding,
                COUNT(*) FILTER (WHERE channel IN ('app', 'web'))::int AS online_invoices
           FROM erp_invoices i WHERE ${BASE} AND customer = $1`, [id]),
    query(`SELECT date_trunc('month', posting_date)::date::text AS month, COALESCE(SUM(grand_total), 0)::float8 AS sales, COUNT(*)::int AS invoices
             FROM erp_invoices i WHERE ${BASE} AND customer = $1 AND posting_date >= CURRENT_DATE - 365 GROUP BY 1 ORDER BY 1`, [id]),
    query(`SELECT name, posting_date::text AS posting_date, grand_total, discount_amount, outstanding, status, channel, sf_order_id,
                  (SELECT COUNT(*)::int FROM erp_invoice_items l WHERE l.invoice = i.name) AS lines
             FROM erp_invoices i WHERE ${BASE} AND customer = $1 ORDER BY posting_date DESC, name DESC LIMIT 50`, [id]),
    fallback.phone_identity
      ? query(`SELECT id, status, created_at, total, channel, promo_code, discount, accu360_order_id, failure_reason FROM orders
                WHERE RIGHT(REGEXP_REPLACE(customer_phone, '\\D', '', 'g'), 9) = $1 ORDER BY created_at DESC LIMIT 50`, [fallback.phone_identity])
      : Promise.resolve([]),
    query(`SELECT l.item_code, MAX(l.item_name) AS item_name, COALESCE(SUM(l.amount), 0)::float8 AS revenue, COALESCE(SUM(l.qty), 0)::float8 AS qty, COUNT(DISTINCT l.invoice)::int AS invoices
             FROM erp_invoice_items l JOIN erp_invoices i ON i.name = l.invoice WHERE ${BASE} AND i.customer = $1 AND l.item_code IS NOT NULL
            GROUP BY l.item_code ORDER BY revenue DESC LIMIT 15`, [id]),
  ]);
  return { header: fallback, totals, monthly, invoices, orders, items };
}
