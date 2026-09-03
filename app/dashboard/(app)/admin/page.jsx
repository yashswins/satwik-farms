import { revalidatePath } from 'next/cache';

import Card, { Empty } from '@/components/dashboard/Card';
import { backendConfigured, syncStatus } from '@/lib/dashboard/backend';
import { ago, darTime } from '@/lib/dashboard/format';
import { requireDashboardUser } from '@/lib/dashboard/session';
import { listUsers, recentAudit, upsertUser } from '@/lib/dashboard/users';

export const metadata = { title: 'Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const me = await requireDashboardUser({ admin: true });
  const bootstrap = String(process.env.DASHBOARD_BOOTSTRAP_ADMIN_EMAIL || '').toLowerCase();

  const [users, audit, sync] = await Promise.all([
    listUsers().catch(() => []),
    recentAudit(60).catch(() => []),
    backendConfigured() ? syncStatus().catch((e) => ({ error: e.message })) : Promise.resolve(null),
  ]);

  async function addUser(formData) {
    'use server';
    const actor = await requireDashboardUser({ admin: true });
    await upsertUser({ email: formData.get('email'), role: formData.get('role'), active: true }, actor.email);
    revalidatePath('/dashboard/admin');
  }

  async function setActive(formData) {
    'use server';
    const actor = await requireDashboardUser({ admin: true });
    const email = String(formData.get('email') || '').toLowerCase();
    const active = formData.get('active') === 'true';
    const row = (await listUsers()).find((u) => u.email === email);
    if (!row) return;
    if (!active && (email === actor.email || email === bootstrap)) return; // never lock yourself or the bootstrap admin out
    await upsertUser({ email, role: row.role, active }, actor.email);
    revalidatePath('/dashboard/admin');
  }

  async function setRole(formData) {
    'use server';
    const actor = await requireDashboardUser({ admin: true });
    const email = String(formData.get('email') || '').toLowerCase();
    const role = formData.get('role') === 'admin' ? 'admin' : 'staff';
    const row = (await listUsers()).find((u) => u.email === email);
    if (!row) return;
    if (role !== 'admin' && (email === actor.email || email === bootstrap)) return;
    await upsertUser({ email, role, active: row.active }, actor.email);
    revalidatePath('/dashboard/admin');
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Admin</h1>

      <Card title="Users" subtitle="Google accounts that may sign in. Deactivating takes effect on the person's next request.">
        {users.length === 0 ? <Empty>No users yet.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary">
                <tr><th className="py-1 pr-3">Email</th><th className="py-1 pr-3">Role</th><th className="py-1 pr-3">Active</th><th className="py-1 pr-3">Last sign-in</th><th className="py-1 pr-3">Added by</th><th className="py-1" /></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email} className="border-t border-shop-border dark:border-[#2E352E]">
                    <td className="py-2 pr-3 font-medium">{u.email}{u.email === me.email ? ' (you)' : ''}</td>
                    <td className="py-2 pr-3">
                      <form action={setRole} className="inline-flex items-center gap-1">
                        <input type="hidden" name="email" value={u.email} />
                        <select name="role" defaultValue={u.role} className="rounded border border-shop-border bg-transparent px-1 py-0.5 text-xs dark:border-[#2E352E]">
                          <option value="staff">staff</option>
                          <option value="admin">admin</option>
                        </select>
                        <button type="submit" className="text-xs text-shop-primary-dark hover:underline">save</button>
                      </form>
                    </td>
                    <td className="py-2 pr-3">{u.active ? 'yes' : <span className="text-shop-error">no</span>}</td>
                    <td className="py-2 pr-3 text-xs text-shop-text-secondary">{u.last_login_at ? `${darTime(u.last_login_at)} · ${ago(`${u.last_login_at}Z`)}` : 'never'}</td>
                    <td className="py-2 pr-3 text-xs text-shop-text-secondary">{u.added_by || '—'}</td>
                    <td className="py-2 text-right">
                      <form action={setActive}>
                        <input type="hidden" name="email" value={u.email} />
                        <input type="hidden" name="active" value={u.active ? 'false' : 'true'} />
                        <button type="submit" className="text-xs text-shop-text-secondary hover:underline" disabled={u.active && (u.email === me.email || u.email === bootstrap)}>
                          {u.active ? 'deactivate' : 'reactivate'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <form action={addUser} className="mt-4 flex flex-wrap items-end gap-2 text-sm">
          <label className="flex flex-col text-xs text-shop-text-secondary">
            Google email
            <input name="email" type="email" required placeholder="name@gmail.com" className="mt-1 rounded border border-shop-border bg-transparent px-2 py-1 text-sm dark:border-[#2E352E]" />
          </label>
          <label className="flex flex-col text-xs text-shop-text-secondary">
            Role
            <select name="role" defaultValue="staff" className="mt-1 rounded border border-shop-border bg-transparent px-2 py-1 text-sm dark:border-[#2E352E]">
              <option value="staff">staff</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <button type="submit" className="rounded-shop-sm bg-shop-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-shop-primary-dark">Add user</button>
        </form>
      </Card>

      <Card title="Mirror sync" subtitle="What the backend reports about the Accu360 → Neon mirror">
        {!sync ? <Empty>Backend key not configured on this deployment.</Empty> : sync.error ? <Empty>Backend did not answer: {sync.error}</Empty> : (
          <div className="overflow-x-auto text-sm">
            <p className="mb-2 text-xs text-shop-text-secondary">
              {sync.enabled ? `Every ${Math.round(sync.interval_seconds / 60)} min in business hours` : 'Disabled'} · {sync.running ? 'running now' : 'idle'} · last run {sync.last_run?.started_at ? ago(`${sync.last_run.started_at}Z`) : 'never'}
            </p>
            <table className="w-full">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Step</th><th className="py-1 pr-3">Last ok</th><th className="py-1 pr-3">Watermark</th><th className="py-1 pr-3">Rows</th><th className="py-1 pr-3">Secs</th><th className="py-1">Last error</th></tr></thead>
              <tbody>
                {sync.steps.map((s) => (
                  <tr key={s.step} className="border-t border-shop-border dark:border-[#2E352E]">
                    <td className="py-1 pr-3 font-medium">{s.step}</td>
                    <td className="py-1 pr-3 text-xs">{s.last_ok_at ? ago(`${s.last_ok_at}Z`) : 'never'}</td>
                    <td className="py-1 pr-3 text-xs text-shop-text-secondary">{s.watermark ? s.watermark.replace('T', ' ').slice(0, 19) : '—'}</td>
                    <td className="py-1 pr-3 tabular-nums">{s.rows_total ?? '—'}</td>
                    <td className="py-1 pr-3 tabular-nums">{s.last_run_seconds ?? '—'}</td>
                    <td className="py-1 text-xs text-shop-error">{s.last_error ? `${s.last_error.slice(0, 120)} (${ago(`${s.last_error_at}Z`)})` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Audit log" subtitle="Sign-ins, denials, changes, refreshes, exports">
        {audit.length === 0 ? <Empty>Nothing yet.</Empty> : (
          <ul className="divide-y divide-shop-border text-xs dark:divide-[#2E352E]">
            {audit.map((a) => (
              <li key={a.id} className="flex flex-wrap gap-x-3 py-1.5">
                <span className="w-28 shrink-0 text-shop-text-secondary">{darTime(a.at)} · {ago(`${a.at}Z`)}</span>
                <span className="font-medium">{a.action}</span>
                <span className="text-shop-text-secondary">{a.actor || '—'}</span>
                {a.detail && <span className="min-w-0 truncate text-shop-text-secondary">{typeof a.detail === 'string' ? a.detail : JSON.stringify(a.detail)}</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
