/**
 * Manual incidents: what staff post when customers are affected by something
 * the detectors cannot see ("deliveries delayed today — road closed").
 * Any signed-in user may post and update (owner decision 2026-09-03).
 */
import 'server-only';

import { normaliseEmail } from '@/lib/dashboard/access';
import { one, query } from '@/lib/dashboard/db';
import { recordAudit } from '@/lib/dashboard/users';

export const IMPACTS = ['ordering', 'delivery', 'catalogue', 'other'];
export const SEVERITIES = ['critical', 'warning', 'info'];
export const STATUSES = ['investigating', 'identified', 'monitoring', 'resolved'];

export async function openIncidents() {
  return query("SELECT id, created_at, created_by, title, impact, severity, customer_note, status, updates FROM incidents WHERE status <> 'resolved' ORDER BY created_at DESC");
}

export async function recentIncidents(days = 14) {
  return query(
    `SELECT id, created_at, created_by, title, impact, severity, customer_note, status, resolved_at, updates
       FROM incidents WHERE created_at >= (now() AT TIME ZONE 'UTC') - ($1 || ' days')::interval
      ORDER BY created_at DESC`,
    [String(days)],
  );
}

function clean(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

export async function createIncident(input, actor) {
  const title = clean(input.title, 140);
  if (!title) throw new Error('A title is required.');
  const impact = IMPACTS.includes(input.impact) ? input.impact : 'other';
  const severity = SEVERITIES.includes(input.severity) ? input.severity : 'warning';
  const status = STATUSES.includes(input.status) && input.status !== 'resolved' ? input.status : 'investigating';
  const note = clean(input.customer_note, 1000) || null;
  const by = normaliseEmail(actor);
  const row = await one(
    `INSERT INTO incidents (created_at, created_by, title, impact, severity, customer_note, status, updates)
     VALUES (now() AT TIME ZONE 'UTC', $1, $2, $3, $4, $5, $6, '[]'::json) RETURNING id`,
    [by, title, impact, severity, note, status],
  );
  await recordAudit(by, 'incident', { id: row?.id, action: 'create', title, severity, status });
  return row?.id;
}

export async function updateIncident(id, input, actor) {
  const status = STATUSES.includes(input.status) ? input.status : null;
  const note = clean(input.note, 1000);
  const by = normaliseEmail(actor);
  const existing = await one('SELECT id, status, updates FROM incidents WHERE id = $1', [id]);
  if (!existing) throw new Error('Incident not found.');
  const updates = Array.isArray(existing.updates) ? existing.updates : [];
  updates.push({ at: new Date().toISOString(), by, status: status || existing.status, note: note || null });
  await query(
    `UPDATE incidents SET status = COALESCE($2, status), updates = $3::json,
            resolved_at = CASE WHEN $2 = 'resolved' THEN now() AT TIME ZONE 'UTC' ELSE resolved_at END
      WHERE id = $1`,
    [id, status, JSON.stringify(updates)],
  );
  await recordAudit(by, 'incident', { id, action: 'update', status: status || existing.status, note: note || null });
}
