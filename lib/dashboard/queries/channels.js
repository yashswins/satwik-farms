/**
 * Channels page (dashboard_spec.md §6.7): App / Web / Offline, from invoices.
 */
import 'server-only';

import { query } from '@/lib/dashboard/db';
import { addDays, darDate } from '@/lib/dashboard/periods';

// A sale (submitted, undeleted invoice) is defined once, in dbt: analytics.sales_invoices.

/** Per-channel KPIs for a range: sales, invoices, customers, new customers, discount. */
export async function channelKpis(start, end) {
  return query(
    `WITH firsts AS (
       SELECT customer, first_date FROM analytics.customer_lifetime
     ), per AS (
       SELECT COALESCE(i.channel, 'offline') AS channel, i.customer,
              SUM(i.grand_total) AS sales,
              COUNT(*) FILTER (WHERE NOT COALESCE(i.is_return, false)) AS invoices,
              SUM(i.discount_amount) AS discount
         FROM analytics.sales_invoices i
        WHERE i.posting_date BETWEEN $1::date AND $2::date
        GROUP BY 1, 2
     )
     SELECT p.channel,
            COALESCE(SUM(p.sales), 0)::float8 AS sales,
            COALESCE(SUM(p.invoices), 0)::int AS invoices,
            COUNT(DISTINCT p.customer)::int AS customers,
            COUNT(DISTINCT p.customer) FILTER (WHERE f.first_date BETWEEN $1::date AND $2::date)::int AS new_customers,
            COALESCE(SUM(p.discount), 0)::float8 AS discount
       FROM per p LEFT JOIN firsts f ON f.customer = p.customer
      GROUP BY p.channel`,
    [start, end],
  );
}

/** Share of active customers (≥1 invoice in the month) who bought online at least once, per month. */
export async function adoptionMonthly(months = 12, now = new Date()) {
  const end = darDate(now);
  const start = `${addDays(end, -30 * (months - 1)).slice(0, 7)}-01`;
  return query(
    `SELECT date_trunc('month', i.posting_date)::date::text AS month,
            COUNT(DISTINCT i.customer)::int AS active,
            COUNT(DISTINCT i.customer) FILTER (WHERE i.channel IN ('app', 'web'))::int AS online
       FROM analytics.sales_invoices i
      WHERE i.posting_date BETWEEN $1::date AND $2::date AND i.customer IS NOT NULL
      GROUP BY 1 ORDER BY 1`,
    [start, end],
  );
}

/**
 * Offline invoices that look like a hand-recreated app order: same customer
 * (by phone identity), same Dar day, within 10% of a failed / rejected /
 * unwritten online order. Staff do not add the SF id when recreating by hand
 * (owner, 2026-09-03), so this heuristic is the only way these get noticed.
 */
export async function probablyOnline(start, end, limit = 50) {
  return query(
    `SELECT i.name, i.posting_date::text AS posting_date, i.grand_total, i.customer,
            COALESCE(NULLIF(c.full_name, ''), NULLIF(i.customer_full_name, ''), c.contact_name, c.customer_name, i.customer) AS display_name,
            o.id AS order_id, o.status AS order_status, o.total AS order_total, o.channel AS order_channel
       FROM analytics.sales_invoices i
       JOIN analytics.customers c ON c.name = i.customer AND c.phone_identity IS NOT NULL
       JOIN analytics.app_orders o
         ON o.phone_identity = c.phone_identity
        AND o.created_date_dar = i.posting_date
        AND (o.status IN ('failed', 'rejected') OR (o.status = 'pending' AND o.accu360_order_id IS NULL))
        AND ABS(o.total - i.grand_total) <= 0.10 * GREATEST(i.grand_total, 1)
      WHERE i.channel = 'offline' AND i.posting_date BETWEEN $1::date AND $2::date
      ORDER BY i.posting_date DESC, i.name DESC
      LIMIT $3`,
    [start, end, limit],
  );
}

export async function appVersions(days = 30) {
  return query(
    `SELECT COALESCE(NULLIF(app_version, ''), 'unknown') AS version,
            COALESCE(channel, 'unknown') AS channel,
            COUNT(*)::int AS orders
       FROM analytics.app_orders
      WHERE created_at >= (now() AT TIME ZONE 'UTC') - ($1 || ' days')::interval
      GROUP BY 1, 2 ORDER BY orders DESC`,
    [String(days)],
  );
}

/** Top items per channel group (online vs offline) for the basket comparison. */
export async function basketByChannel(start, end, limit = 8) {
  return query(
    `WITH lines AS (
       SELECT CASE WHEN i.channel IN ('app', 'web') THEN 'online' ELSE 'offline' END AS grp,
              it.item_code, MAX(it.item_name) AS item_name, SUM(it.amount) AS revenue, SUM(it.qty) AS qty
         FROM analytics.invoice_lines it JOIN analytics.sales_invoices i ON i.name = it.invoice
        WHERE i.posting_date BETWEEN $1::date AND $2::date AND it.item_code IS NOT NULL
        GROUP BY 1, 2
     ), ranked AS (
       SELECT *, ROW_NUMBER() OVER (PARTITION BY grp ORDER BY revenue DESC) AS rn,
              revenue / NULLIF(SUM(revenue) OVER (PARTITION BY grp), 0) AS share
         FROM lines
     )
     SELECT grp, item_code, item_name, revenue::float8, qty::float8, share::float8
       FROM ranked WHERE rn <= $3 ORDER BY grp, rn`,
    [start, end, limit],
  );
}
