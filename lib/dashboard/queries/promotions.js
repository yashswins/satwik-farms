/**
 * Promotions page (dashboard_spec.md §6.6). Discount AMOUNTS are invoice
 * truth; WHICH code earned them is known only from our own orders (recorded
 * since the 2026-09-03 backend deploy) — earlier discounted orders show as
 * "code unknown". Combos exist only in our order lines (nothing marks a
 * bundle in the ERP).
 */
import 'server-only';

import { one, query } from '@/lib/dashboard/db';
import { addDays, darDate } from '@/lib/dashboard/periods';

const DAR_DATE = "(o.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Dar_es_Salaam')::date";
const ACCEPTED = "o.status IN ('pending', 'completed')";

export async function discountKpis(start, end) {
  const [inv, ord] = await Promise.all([
    one(
      `SELECT COALESCE(SUM(discount_amount), 0)::float8 AS discount,
              COUNT(*) FILTER (WHERE discount_amount > 0)::int AS discounted, COUNT(*)::int AS invoices,
              COALESCE(SUM(grand_total), 0)::float8 AS sales
         FROM erp_invoices WHERE docstatus = 1 AND deleted_at IS NULL AND posting_date BETWEEN $1::date AND $2::date`,
      [start, end],
    ),
    one(
      `SELECT COUNT(*)::int AS orders,
              COUNT(*) FILTER (WHERE promo_code IS NOT NULL AND COALESCE(discount, 0) > 0)::int AS promo_orders,
              COUNT(*) FILTER (WHERE COALESCE(discount, 0) > 0)::int AS discounted_orders,
              COALESCE(SUM(discount) FILTER (WHERE promo_code IS NOT NULL), 0)::float8 AS promo_cost,
              COALESCE(AVG(total) FILTER (WHERE promo_code IS NOT NULL AND COALESCE(discount, 0) > 0), 0)::float8 AS aiv_with_promo,
              COALESCE(AVG(total) FILTER (WHERE promo_code IS NULL OR COALESCE(discount, 0) = 0), 0)::float8 AS aiv_without,
              COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM json_array_elements(o.items) e WHERE COALESCE(e->>'combo_id', '') <> ''))::int AS combo_orders
         FROM orders o WHERE ${ACCEPTED} AND ${DAR_DATE} BETWEEN $1::date AND $2::date`,
      [start, end],
    ),
  ]);
  return { invoices: inv, orders: ord };
}

/** Usage per code from our orders, plus refusals parsed from rejection notes. */
export async function promoUsage(start, end) {
  const [used, refused] = await Promise.all([
    query(
      `SELECT promo_code AS code, COUNT(*)::int AS orders, COALESCE(SUM(total), 0)::float8 AS ordered_value,
              COALESCE(SUM(discount), 0)::float8 AS cost, MIN(created_at) AS first_used, MAX(created_at) AS last_used,
              COUNT(*) FILTER (WHERE discount_source = 'auto_promo')::int AS auto_applied
         FROM orders o WHERE ${ACCEPTED} AND promo_code IS NOT NULL AND COALESCE(discount, 0) > 0 AND ${DAR_DATE} BETWEEN $1::date AND $2::date
        GROUP BY promo_code ORDER BY orders DESC`,
      [start, end],
    ),
    query(
      `SELECT UPPER(SUBSTRING(failure_reason FROM 'promo(?: code)? ''([^'']+)''')) AS code, COUNT(*)::int AS refused,
              STRING_AGG(DISTINCT CASE WHEN failure_reason ILIKE '%does not exist%' THEN 'unknown code'
                                       WHEN failure_reason ILIKE '%not active%' THEN 'inactive'
                                       WHEN failure_reason ILIKE '%minimum spend%' THEN 'below minimum'
                                       ELSE 'other' END, ', ') AS reasons
         FROM orders o WHERE o.status = 'rejected' AND failure_reason ILIKE '%promo%' AND ${DAR_DATE} BETWEEN $1::date AND $2::date
        GROUP BY 1`,
      [start, end],
    ),
  ]);
  return { used, refused };
}

export async function discountSourceWeekly(weeks = 12, now = new Date()) {
  const today = darDate(now);
  const start = addDays(today, -(7 * weeks - 1));
  return query(
    `SELECT date_trunc('week', ${DAR_DATE})::date::text AS week,
            COUNT(*) FILTER (WHERE discount_source = 'tier')::int AS tier,
            COUNT(*) FILTER (WHERE discount_source = 'auto_promo')::int AS auto_promo,
            COUNT(*) FILTER (WHERE discount_source = 'promo_code')::int AS promo_code,
            COUNT(*) FILTER (WHERE discount_source = 'unverified')::int AS unverified,
            COUNT(*) FILTER (WHERE COALESCE(discount, 0) > 0 AND discount_source IS NULL)::int AS unknown,
            COUNT(*) FILTER (WHERE COALESCE(discount, 0) = 0)::int AS none
       FROM orders o WHERE ${ACCEPTED} AND ${DAR_DATE} BETWEEN $1::date AND $2::date
      GROUP BY 1 ORDER BY 1`,
    [start, today],
  );
}

/** Order subtotals in TSH 5,000 buckets, for the tier-threshold histogram. */
export async function subtotalHistogram(start, end, bucket = 5000) {
  return query(
    `SELECT (FLOOR(subtotal / $3) * $3)::float8 AS bucket, COUNT(*)::int AS orders
       FROM orders o WHERE ${ACCEPTED} AND ${DAR_DATE} BETWEEN $1::date AND $2::date AND subtotal > 0 AND subtotal < 200000
      GROUP BY 1 ORDER BY 1`,
    [start, end, bucket],
  );
}

/** Combo usage from order lines. */
export async function comboUsage(start, end) {
  return query(
    `SELECT e->>'combo_id' AS combo_id, COUNT(DISTINCT o.id)::int AS orders,
            COALESCE(SUM((e->>'total_price')::float8), 0)::float8 AS ordered_value,
            COUNT(*)::int AS lines, MAX(o.created_at) AS last_sold
       FROM orders o, json_array_elements(o.items) e
      WHERE ${ACCEPTED} AND COALESCE(e->>'combo_id', '') <> '' AND ${DAR_DATE} BETWEEN $1::date AND $2::date
      GROUP BY 1 ORDER BY orders DESC`,
    [start, end],
  );
}

/** How often a combo's component items are bought individually (no combo_id) in the period. */
export async function alaCarte(productIds, start, end) {
  if (!productIds?.length) return { orders: 0 };
  return one(
    `SELECT COUNT(DISTINCT o.id)::int AS orders
       FROM orders o, json_array_elements(o.items) e
      WHERE ${ACCEPTED} AND COALESCE(e->>'combo_id', '') = '' AND (e->>'product_id') = ANY($3::text[])
        AND ${DAR_DATE} BETWEEN $1::date AND $2::date`,
    [start, end, productIds],
  );
}
