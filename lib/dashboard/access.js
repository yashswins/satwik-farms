/**
 * Who may sign in to the dashboard — the decision, kept pure so it is testable
 * without Google or a database.
 *
 * Two conditions, both required: Google says the address is verified, and the
 * address is an ACTIVE row in dashboard_users. Nothing else counts — not the
 * domain, not who invited them, not a session they used to have.
 */

export function normaliseEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

/**
 * @param {{email?: string, email_verified?: boolean}} profile  Google's ID-token claims
 * @param {{email: string, role: string, active: boolean} | null} row  dashboard_users row, if any
 * @returns {{ok: true, email: string, role: string} | {ok: false, reason: string, email: string}}
 */
export function decideSignIn(profile, row) {
  const email = normaliseEmail(profile?.email);
  if (!email) return { ok: false, reason: 'no_email', email };
  if (profile?.email_verified !== true) return { ok: false, reason: 'unverified', email };
  if (!row) return { ok: false, reason: 'not_allowlisted', email };
  if (normaliseEmail(row.email) !== email) return { ok: false, reason: 'not_allowlisted', email };
  if (row.active !== true) return { ok: false, reason: 'deactivated', email };
  const role = row.role === 'admin' ? 'admin' : 'staff';
  return { ok: true, email, role };
}

/** Only same-origin dashboard paths are honoured as a post-login destination. */
export function safeCallbackPath(value) {
  const path = String(value ?? '');
  if (!path.startsWith('/dashboard')) return '/dashboard';
  if (path.startsWith('//') || path.includes('://') || path.includes('\\')) return '/dashboard';
  return path;
}
