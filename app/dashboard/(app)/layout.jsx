import Shell from '@/components/dashboard/Shell';
import { requireDashboardUser } from '@/lib/dashboard/session';

export const dynamic = 'force-dynamic';

/**
 * Layer 2 of the gate: nothing under /dashboard (except /dashboard/login,
 * which lives outside this route group) renders without a signed-in,
 * still-allowlisted user. Middleware may have already redirected; this
 * check does not rely on it.
 */
export default async function DashboardAppLayout({ children }) {
  const user = await requireDashboardUser();
  return <Shell user={user}>{children}</Shell>;
}
