/**
 * The two things the dashboard asks the backend to do: refresh the mirror and
 * report its sync state. Server-held key; the browser never sees it.
 */
import 'server-only';

const BASE = (process.env.BACKEND_BASE_URL || 'https://satwik-farms-backend.onrender.com').replace(/\/+$/, '');

function headers() {
  const key = process.env.APP_API_KEY_DASHBOARD;
  if (!key) throw new Error('APP_API_KEY_DASHBOARD is not set');
  return { 'X-API-Key': key, Accept: 'application/json' };
}

export function backendConfigured() {
  return Boolean(process.env.APP_API_KEY_DASHBOARD);
}

export async function triggerRefresh() {
  const res = await fetch(`${BASE}/dashboard/refresh`, {
    method: 'POST', headers: headers(), cache: 'no-store', signal: AbortSignal.timeout(15_000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`backend ${res.status}`);
  return body;
}

export async function syncStatus() {
  const res = await fetch(`${BASE}/dashboard/sync-status`, {
    headers: headers(), cache: 'no-store', signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`backend ${res.status}`);
  return res.json();
}

export async function acknowledgeReconciliation(orderId, note) {
  const res = await fetch(`${BASE}/reconciliation/acknowledge`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, note }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`backend ${res.status}`);
  return res.json();
}
