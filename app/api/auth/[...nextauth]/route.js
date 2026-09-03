/**
 * Auth.js endpoints: /api/auth/signin, /api/auth/callback/google,
 * /api/auth/signout, /api/auth/session, /api/auth/csrf.
 *
 * Google's OAuth client must list exactly
 *   https://satwikfarms.com/api/auth/callback/google
 * as the authorised redirect URI. Preview deployments therefore cannot sign
 * in, which is deliberate.
 */
import { handlers } from '@/lib/dashboard/auth';

export const dynamic = 'force-dynamic';
export const { GET, POST } = handlers;
