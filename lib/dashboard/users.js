/**
 * dashboard_users and dashboard_audit — the allowlist and the paper trail.
 *
 * The bootstrap admin (DASHBOARD_BOOTSTRAP_ADMIN_EMAIL) is re-applied on every
 * lookup that finds no row, so a lost admin can always be recovered by editing
 * one Vercel variable and redeploying. Everything else is managed from the
 * Admin page and audited.
 */
import 'server-only';

import { normaliseEmail } from '@/lib/dashboard/access';
import { one, query } from '@/lib/dashboard/db';

export async function getDashboardUser(email) {
  const e = normaliseEmail(email);
  if (!e) return null;
  return one('SELECT email, role, active FROM dashboard_users WHERE email = $1', [e]);
}

export async function ensureBootstrapAdmin() {
  const e = normaliseEmail(process.env.DASHBOARD_BOOTSTRAP_ADMIN_EMAIL);
  if (!e) return null;
  await query(
    `INSERT INTO dashboard_users (email, role, active, added_by, added_at)
     VALUES ($1, 'admin', true, 'bootstrap', now())
     ON CONFLICT (email) DO UPDATE SET role = 'admin', active = true`,
    [e],
  );
  return e;
}

export async function touchLogin(email) {
  await query('UPDATE dashboard_users SET last_login_at = now() WHERE email = $1', [normaliseEmail(email)]);
}

export async function listUsers() {
  return query('SELECT email, role, active, added_by, added_at, last_login_at FROM dashboard_users ORDER BY added_at');
}

export async function upsertUser({ email, role, active }, actor) {
  const e = normaliseEmail(email);
  if (!e || !e.includes('@')) throw new Error('A valid email address is required.');
  const r = role === 'admin' ? 'admin' : 'staff';
  await query(
    `INSERT INTO dashboard_users (email, role, active, added_by, added_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, active = EXCLUDED.active`,
    [e, r, active !== false, normaliseEmail(actor)],
  );
  await recordAudit(actor, 'user_change', { email: e, role: r, active: active !== false });
}

/**
 * Best-effort: an audit failure must never block the action it describes,
 * but it is logged loudly because a silent audit gap is worse than none.
 */
export async function recordAudit(actor, action, detail = null, ip = null) {
  try {
    await query(
      'INSERT INTO dashboard_audit (at, actor, action, detail, ip) VALUES (now(), $1, $2, $3, $4)',
      [normaliseEmail(actor) || null, action, detail ? JSON.stringify(detail) : null, ip],
    );
  } catch (error) {
    console.error('[dashboard] audit write failed:', action, error.message);
  }
}

export async function recentAudit(limit = 100) {
  return query('SELECT id, at, actor, action, detail, ip FROM dashboard_audit ORDER BY at DESC LIMIT $1', [limit]);
}
