/**
 * The trust boundary for every dashboard page and API route.
 *
 * Middleware redirects anonymous visitors, but middleware is convenience, not
 * the guard: every server component and route handler calls one of these and
 * gets either a user or a redirect/401. The allowlist row is re-read each
 * time so revocation is immediate.
 */
import 'server-only';
import { redirect } from 'next/navigation';

import { normaliseEmail } from '@/lib/dashboard/access';
import { auth } from '@/lib/dashboard/auth';
import { ensureBootstrapAdmin, getDashboardUser } from '@/lib/dashboard/users';

/**
 * Local development only: `DASHBOARD_DEV_USER=you@example.com npm run dev`
 * skips Google so pages can be built without an OAuth client. Three guards,
 * all required: development build, the variable set, and no NextAuth config
 * that would make the bypass reachable in a deployed preview (Vercel builds
 * are NODE_ENV=production, where this is dead code).
 */
function devUser() {
  if (process.env.NODE_ENV !== 'development') return null;
  const email = normaliseEmail(process.env.DASHBOARD_DEV_USER);
  if (!email) return null;
  return { email, role: 'admin', dev: true };
}

/** The signed-in, still-allowed user, or null. Never throws. */
export async function currentDashboardUser() {
  const dev = devUser();
  if (dev) return dev;
  let email = null;
  try {
    const session = await auth();
    email = normaliseEmail(session?.user?.email);
  } catch (error) {
    console.error('[dashboard] session read failed:', error.message);
    return null;
  }
  if (!email) return null;
  try {
    await ensureBootstrapAdmin();
    const row = await getDashboardUser(email);
    if (!row || row.active !== true) return null;
    return { email, role: row.role === 'admin' ? 'admin' : 'staff' };
  } catch (error) {
    console.error('[dashboard] allowlist read failed:', error.message);
    return null;
  }
}

/** For pages: returns the user or redirects to the login page. */
export async function requireDashboardUser({ admin = false } = {}) {
  const user = await currentDashboardUser();
  if (!user) redirect('/dashboard/login?error=signin');
  if (admin && user.role !== 'admin') redirect('/dashboard?error=admin');
  return user;
}

/** For route handlers: returns { user } or { response } to send as-is. */
export async function requireApiUser({ admin = false } = {}) {
  const user = await currentDashboardUser();
  if (!user) {
    return { response: Response.json({ error: 'Sign in required.' }, { status: 401, headers: NO_STORE }) };
  }
  if (admin && user.role !== 'admin') {
    return { response: Response.json({ error: 'Admin only.' }, { status: 403, headers: NO_STORE }) };
  }
  return { user };
}

export const NO_STORE = { 'Cache-Control': 'private, no-store' };
