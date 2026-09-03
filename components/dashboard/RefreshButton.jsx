import { revalidatePath } from 'next/cache';

import { backendConfigured, triggerRefresh } from '@/lib/dashboard/backend';
import { requireDashboardUser } from '@/lib/dashboard/session';
import { recordAudit } from '@/lib/dashboard/users';

/**
 * Asks the backend to run one mirror pass now. Server action: the key stays
 * on the server, the click is audited, and the backend rate-limits it.
 */
export default function RefreshButton({ path = '/dashboard' }) {
  async function refresh() {
    'use server';
    const user = await requireDashboardUser();
    try {
      const result = await triggerRefresh();
      await recordAudit(user.email, 'refresh', result);
    } catch (error) {
      await recordAudit(user.email, 'refresh', { error: error.message });
    }
    revalidatePath(path);
  }
  if (!backendConfigured()) return null;
  return (
    <form action={refresh}>
      <button
        type="submit"
        className="rounded-shop-sm border border-shop-border px-3 py-1 text-xs font-medium
                   text-shop-text-secondary hover:bg-shop-surface-alt dark:border-[#2E352E] dark:hover:bg-[#252A25]"
      >
        Refresh now
      </button>
    </form>
  );
}
