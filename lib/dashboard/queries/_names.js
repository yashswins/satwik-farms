/**
 * One rule for what to call a customer, used by every query.
 *
 * On this Accu360 site `customer_name` is the phone number; the person is in
 * `customer_full_name` (on the Customer and on every invoice). Order of
 * preference: the Customer's full name → the invoice's full name (when an
 * invoice alias is given) → the linked Contact's person name → the name the
 * customer typed in the app (when an orders alias is given) → the phone.
 *
 * @param {{c: string, i?: string, o?: string, id: string}} aliases table aliases in the query
 */
export function displayName({ c, i = null, o = null, id }) {
  const parts = [`NULLIF(${c}.full_name, '')`];
  if (i) parts.push(`NULLIF(${i}.customer_full_name, '')`);
  parts.push(`NULLIF(${c}.contact_name, '')`);
  if (o) parts.push(`NULLIF(${o}.customer_name, '')`);
  parts.push(`${c}.customer_name`, id);
  return `COALESCE(${parts.join(', ')})`;
}

/** Lateral join giving the latest app-typed name for a customer alias `c`. */
export function appNameLateral(c = 'c', o = 'o') {
  return `LEFT JOIN LATERAL (
    SELECT customer_name FROM orders
     WHERE ${c}.phone_identity IS NOT NULL
       AND RIGHT(REGEXP_REPLACE(customer_phone, '\\D', '', 'g'), 9) = ${c}.phone_identity
     ORDER BY created_at DESC LIMIT 1
  ) ${o} ON true`;
}
