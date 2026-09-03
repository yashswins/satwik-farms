/**
 * The dashboard's database access: Neon over HTTP, as the read-mostly role
 * `dashboard_app` (SELECT on the mirror tables, INSERT/UPDATE on the three
 * dashboard-owned ones, nothing on orders or the ERP outbox).
 *
 * Server-only. Nothing here may be imported by a client component — the
 * connection string is a secret, and the CSP's connect-src 'self' would block
 * the browser talking to Neon anyway.
 */
import 'server-only';
import { neon } from '@neondatabase/serverless';

let client = null;

function connection() {
  if (client) return client;
  const url = process.env.DASHBOARD_DATABASE_URL;
  if (!url) throw new Error('DASHBOARD_DATABASE_URL is not set');
  client = neon(url);
  return client;
}

/**
 * Parameterised query. `text` uses $1, $2 … placeholders; never interpolate
 * user input into `text`.
 * @returns {Promise<Array<Record<string, any>>>}
 */
export async function query(text, params = []) {
  return connection().query(text, params);
}

/** First row or null. */
export async function one(text, params = []) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}

/** Whether the database is configured at all — pages degrade rather than crash. */
export function isConfigured() {
  return Boolean(process.env.DASHBOARD_DATABASE_URL);
}
