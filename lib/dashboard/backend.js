/**
 * What the dashboard asks the backend to do: refresh the mirror, report its
 * sync state, and close findings and outbox jobs staff have dealt with.
 * Server-held key; the browser never sees it.
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

// The backend reads `order_ids` and ignores anything else; an empty body
// acknowledges every outstanding finding, so the list is not optional.
export async function acknowledgeReconciliation(orderId) {
  const res = await fetch(`${BASE}/reconciliation/acknowledge`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_ids: [orderId] }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`backend ${res.status}`);
  return res.json();
}

/**
 * Stop the backend retrying an order someone dealt with by hand. Without this,
 * "mark handled" hid the row here while the outbox kept retrying it and the
 * backlog alert stayed on. Returns { closed, reason? }; an order with no open
 * job is a no-op.
 */
export async function closeErpSyncJob(orderId, note) {
  const res = await fetch(`${BASE}/erp-sync/close`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, note }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`backend ${res.status}`);
  return res.json();
}
