/**
 * Auth.js for the dashboard, Node runtime: Google sign-in gated by the
 * dashboard_users allowlist, every attempt audited.
 *
 * A session cookie only ever says WHO signed in. Whether they are still
 * allowed is decided again on every request by requireDashboardUser()
 * (lib/dashboard/session.js), which re-reads the row — so deactivating
 * someone takes effect on their next click, not when their cookie expires.
 */
import 'server-only';
import NextAuth from 'next-auth';

import { decideSignIn } from '@/lib/dashboard/access';
import { authConfig } from '@/lib/dashboard/auth.config';
import { ensureBootstrapAdmin, getDashboardUser, recordAudit, touchLogin } from '@/lib/dashboard/users';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ profile }) {
      let row = null;
      try {
        await ensureBootstrapAdmin();
        row = await getDashboardUser(profile?.email);
      } catch (error) {
        console.error('[dashboard] allowlist lookup failed:', error.message);
        await recordAudit(profile?.email, 'login_denied', { reason: 'lookup_failed' });
        return '/dashboard/login?error=unavailable';
      }
      const decision = decideSignIn(profile, row);
      if (!decision.ok) {
        await recordAudit(decision.email, 'login_denied', { reason: decision.reason });
        return `/dashboard/login?error=${decision.reason}`;
      }
      await Promise.all([
        recordAudit(decision.email, 'login_ok', { role: decision.role }),
        touchLogin(decision.email).catch(() => {}),
      ]);
      return true;
    },
  },
});
