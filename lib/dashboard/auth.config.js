/**
 * Auth.js configuration that is safe to load in the Edge runtime (middleware):
 * the Google provider, the session shape, and no database access.
 *
 * lib/dashboard/auth.js layers the allowlist check on top for the Node
 * runtime. Splitting them is the pattern Auth.js documents for exactly this
 * reason — middleware must decode the session without a database.
 */
import Google from 'next-auth/providers/google';

import { normaliseEmail } from '@/lib/dashboard/access';

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Ask which account every time: several people here have more than one
      // Google account, and the wrong one silently fails the allowlist.
      authorization: { params: { prompt: 'select_account' } },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,   // absolute: sign in again after a week
    updateAge: 24 * 60 * 60,    // refreshed daily while in use
  },
  pages: {
    signIn: '/dashboard/login',
    error: '/dashboard/login',
  },
  trustHost: true,
  callbacks: {
    jwt({ token, profile }) {
      if (profile?.email) token.email = normaliseEmail(profile.email);
      return token;
    },
    session({ session, token }) {
      if (session.user && token?.email) session.user.email = token.email;
      return session;
    },
  },
};
