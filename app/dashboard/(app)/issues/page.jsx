import { revalidatePath } from 'next/cache';

import AlertStrip from '@/components/dashboard/AlertStrip';
import Card, { Empty, Unavailable } from '@/components/dashboard/Card';
import StatusDots, { deriveStatus } from '@/components/dashboard/StatusDots';
import { THRESHOLDS, evaluateAlerts } from '@/lib/dashboard/alerts';
import { isConfigured, query } from '@/lib/dashboard/db';
import { ago, darTime, dateLabel, dateOnly, num } from '@/lib/dashboard/format';
import { IMPACTS, SEVERITIES, STATUSES, createIncident, openIncidents, recentIncidents, updateIncident } from '@/lib/dashboard/incidents';
import { darDate } from '@/lib/dashboard/periods';
import { attemptsFor, health } from '@/lib/dashboard/queries/overview';
import { reconciliationState } from '@/lib/dashboard/queries/orders';
import { requireDashboardUser } from '@/lib/dashboard/session';
import { funnelConfigured, funnelCounts, funnelTotals } from '@/lib/dashboard/upstash';

export const metadata = { title: 'Issues' };
export const dynamic = 'force-dynamic';

async function settle(promise, fallback = null) {
  try { return { value: await promise, error: null }; } catch (error) {
    console.error('[dashboard/issues]', error.message);
    return { value: fallback, error: error.message };
  }
}

export default async function IssuesPage() {
  if (!isConfigured()) return <Card title="Dashboard database not configured" />;
  const now = new Date();
  const today = darDate(now);
  const darHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Dar_es_Salaam', hour: '2-digit', hour12: false }).format(now));

  const [hlth, attempts, funnel, open, recent, recon, security, syncErrors] = await Promise.all([
    settle(health(), { snapshots: {}, sync: [] }),
    settle(attemptsFor(today), { totals: {} }),
    settle(funnelConfigured() ? funnelCounts([today]) : Promise.resolve(null), null),
    settle(openIncidents(), []),
    settle(recentIncidents(14), []),
    settle(reconciliationState(7), { latest: {}, runs: [] }),
    settle(query("SELECT at, actor, action, detail, ip FROM dashboard_audit WHERE action IN ('login_denied', 'user_change', 'export') AND at >= (now() AT TIME ZONE 'UTC') - INTERVAL '14 days' ORDER BY at DESC LIMIT 50"), []),
    settle(query("SELECT step, last_error, last_error_at FROM sync_state WHERE last_error IS NOT NULL ORDER BY last_error_at DESC"), []),
  ]);

  const funnelToday = funnel.value ? { web: funnelTotals(funnel.value.web), app: funnelTotals(funnel.value.app) } : null;
  const funnelEventsToday = funnelToday ? Object.values(funnelToday.web).concat(Object.values(funnelToday.app)).reduce((a, b) => a + b, 0) : 0;
  const alerts = evaluateAlerts({
    healthSnapshot: hlth.value.snapshots.health ?? null,
    catalogSnapshot: hlth.value.snapshots.catalog_checks ?? null,
    sync: hlth.value.sync, funnelToday, attemptsToday: attempts.value.totals,
    now: now.getTime(), businessHours: darHour >= 6 && darHour < 22,
  });
  const status = deriveStatus({ health: hlth.value, funnelConfigured: funnelConfigured(), funnelEventsToday, now: now.getTime() });
  const h = hlth.value.snapshots.health?.payload || {};
  const catalogIssues = hlth.value.snapshots.catalog_checks?.payload?.issues || [];

  async function post(formData) {
    'use server';
    const user = await requireDashboardUser();
    await createIncident({
      title: formData.get('title'), impact: formData.get('impact'), severity: formData.get('severity'),
      customer_note: formData.get('customer_note'), status: formData.get('status'),
    }, user.email);
    revalidatePath('/dashboard/issues');
    revalidatePath('/dashboard');
  }

  async function update(formData) {
    'use server';
    const user = await requireDashboardUser();
    await updateIncident(Number(formData.get('id')), { status: formData.get('status'), note: formData.get('note') }, user.email);
    revalidatePath('/dashboard/issues');
    revalidatePath('/dashboard');
  }

  const timeline = [
    ...recent.value.flatMap((i) => [
      { at: i.created_at, what: `Incident posted: ${i.title} (${i.severity})`, by: i.created_by },
      ...(Array.isArray(i.updates) ? i.updates.map((u) => ({ at: u.at, what: `Incident "${i.title}" → ${u.status}${u.note ? `: ${u.note}` : ''}`, by: u.by })) : []),
    ]),
    ...syncErrors.value.map((s) => ({ at: s.last_error_at, what: `Mirror step ${s.step} failed: ${String(s.last_error).slice(0, 120)}` })),
    ...(h.render?.last_event ? [{ at: h.render.last_event.at, what: `Render: ${h.render.last_event.type}` }] : []),
  ].filter((t) => t.at).sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 40);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Issues</h1>
        <p className="text-xs text-shop-text-secondary">What is broken now, what customers are experiencing, and what broke recently. Every automated alert prints the rule that produced it.</p>
      </div>

      <Card title={alerts.length || open.value.length ? `${num(alerts.length + open.value.length)} open` : 'Nothing open'} subtitle="Automated alerts and posted incidents, critical first">
        {alerts.length === 0 && open.value.length === 0 ? <Empty>All quiet.</Empty> : <AlertStrip alerts={alerts} incidents={open.value} />}
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Post an incident" subtitle="For anything the detectors cannot see. Shows on the Overview for everyone until resolved.">
          <form action={post} className="grid gap-2 text-sm">
            <input name="title" required maxLength={140} placeholder="Deliveries delayed today — road closed" className="rounded border border-shop-border bg-transparent px-2 py-1.5 dark:border-[#2E352E]" />
            <div className="grid grid-cols-3 gap-2">
              <select name="impact" className="rounded border border-shop-border bg-transparent px-2 py-1.5 dark:border-[#2E352E]">{IMPACTS.map((x) => <option key={x} value={x}>{x}</option>)}</select>
              <select name="severity" defaultValue="warning" className="rounded border border-shop-border bg-transparent px-2 py-1.5 dark:border-[#2E352E]">{SEVERITIES.map((x) => <option key={x} value={x}>{x}</option>)}</select>
              <select name="status" defaultValue="investigating" className="rounded border border-shop-border bg-transparent px-2 py-1.5 dark:border-[#2E352E]">{STATUSES.filter((s) => s !== 'resolved').map((x) => <option key={x} value={x}>{x}</option>)}</select>
            </div>
            <textarea name="customer_note" rows={2} maxLength={1000} placeholder="What customers will notice, in plain words" className="rounded border border-shop-border bg-transparent px-2 py-1.5 dark:border-[#2E352E]" />
            <button type="submit" className="justify-self-start rounded-shop-sm bg-shop-primary px-3 py-1.5 text-sm font-medium text-white">Post</button>
          </form>
        </Card>
        <Card title="Open incidents" subtitle="Update the status or add a note">
          {open.value.length === 0 ? <Empty>None open.</Empty> : (
            <ul className="space-y-3 text-sm">
              {open.value.map((i) => (
                <li key={i.id} className="rounded-shop-sm border border-shop-border p-3 dark:border-[#2E352E]">
                  <p className="font-semibold">{i.title} <span className="ml-1 text-xs font-normal text-shop-text-secondary">{i.severity} · {i.impact} · {i.status} · {ago(`${i.created_at}Z`)} by {i.created_by}</span></p>
                  {i.customer_note && <p className="text-xs text-shop-text-secondary">{i.customer_note}</p>}
                  <form action={update} className="mt-2 flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={i.id} />
                    <select name="status" defaultValue={i.status} className="rounded border border-shop-border bg-transparent px-2 py-1 text-xs dark:border-[#2E352E]">{STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}</select>
                    <input name="note" placeholder="note" className="min-w-0 flex-1 rounded border border-shop-border bg-transparent px-2 py-1 text-xs dark:border-[#2E352E]" />
                    <button type="submit" className="text-xs font-medium text-shop-primary-dark hover:underline">Update</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Service status" subtitle={hlth.value.snapshots.health ? `Health snapshot ${ago(`${hlth.value.snapshots.health.taken_at}Z`)}` : 'No health snapshot yet'}>
        <StatusDots items={status} />
        {h.accu360 && (
          <dl className="mt-3 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <Kv k="Accu360" v={h.accu360.ok ? `${h.accu360.latency_ms} ms` : 'not answering'} />
            <Kv k="Catalogue" v={h.catalog?.configured ? `${h.catalog.products} products, ${h.catalog.promo_codes} promo codes, ${h.catalog.combos} combos, ${h.catalog.discount_tiers} tiers · ${Math.round((h.catalog.age_seconds ?? 0) / 60)} min old` : 'not configured'} />
            <Kv k="Item cache" v={h.item_cache?.enabled ? `${h.item_cache.items} items, ${h.item_cache.disabled} disabled · ${h.item_cache.age_seconds}s old` : 'disabled'} />
            <Kv k="ERP outbox" v={h.erp_sync ? `${h.erp_sync.pending} pending · ${h.erp_sync.escalated} escalated · oldest ${h.erp_sync.oldest_minutes} min · async ${h.async_erp_sync ? 'on' : 'off'}` : '—'} />
            <Kv k="Backend uptime" v={h.uptime_seconds ? `${(h.uptime_seconds / 3600).toFixed(1)} h` : '—'} />
            <Kv k="Render, last 24 h" v={h.render?.events_24h ? Object.entries(h.render.events_24h).map(([k, v]) => `${k} ${v}`).join(' · ') : (h.render?.error || 'not configured')} />
          </dl>
        )}
        <p className="mt-3 text-[11px] text-shop-text-secondary">Thresholds: client failure {Math.round(THRESHOLDS.clientFailureWarn * 100)}% / {Math.round(THRESHOLDS.clientFailureCritical * 100)}% over ≥ {THRESHOLDS.minAttemptsForRate} attempts · restarts ≥ {THRESHOLDS.restartsPer6h} · catalogue stale &gt; {THRESHOLDS.catalogStaleMinutes} min · Accu360 &gt; {THRESHOLDS.accu360LatencyMs} ms · mirror stale &gt; {THRESHOLDS.mirrorStaleMinutesBusiness} min in business hours.</p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Catalogue checks" subtitle={hlth.value.snapshots.catalog_checks ? `${num(hlth.value.snapshots.catalog_checks.payload.checked_products)} active products checked ${ago(`${hlth.value.snapshots.catalog_checks.taken_at}Z`)}` : 'not run yet'}>
          {catalogIssues.length === 0 ? <Empty>No catalogue problems: every active product exists and is enabled in Accu360; promo configuration looks sane.</Empty> : (
            <ul className="space-y-1 text-sm">
              {catalogIssues.map((i, idx) => <li key={idx}><span className={`mr-2 rounded-full px-2 py-0.5 text-[10px] uppercase ${i.severity === 'critical' ? 'bg-shop-error/10 text-shop-error' : i.severity === 'warning' ? 'bg-shop-warning/10 text-shop-warning' : 'bg-shop-surface-alt text-shop-text-secondary'}`}>{i.severity}</span>{i.kind.replace(/_/g, ' ')}: {i.name || i.code || i.tier || ''} {i.sku ? `(${i.sku})` : ''}</li>)}
            </ul>
          )}
        </Card>
        <Card title="Reconciliation health" subtitle="Sweeps per day over the last 7 days; 26 expected between 06:00 and 19:00 Dar">
          {recon.value.runs.length === 0 ? <Empty>No sweeps recorded yet — snapshots began with the 3 Sep 2026 deploy.</Empty> : (
            <ul className="flex flex-wrap gap-2 text-sm">{recon.value.runs.map((r) => <li key={r.date} className={`rounded-shop-sm px-2 py-1 ${r.runs < 20 ? 'bg-shop-warning/10 text-shop-warning' : 'bg-shop-surface-alt dark:bg-[#252A25]'}`}>{dateLabel(r.date).slice(4)}: {r.runs}</li>)}</ul>
          )}
          {recon.value.latest.reconcile?.payload?.findings?.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-shop-text-secondary">{recon.value.latest.reconcile.payload.findings.slice(0, 10).map((f, i) => <li key={i}>{JSON.stringify(f)}</li>)}</ul>
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Timeline, 14 days" subtitle="Incidents, mirror errors, last Render event">
          {timeline.length === 0 ? <Empty>Quiet.</Empty> : (
            <ol className="space-y-1.5 text-sm">{timeline.map((t, i) => <li key={i} className="flex gap-3"><span className="w-32 shrink-0 text-xs text-shop-text-secondary">{dateLabel(dateOnly(t.at))} {darTime(t.at)}</span><span>{t.what}{t.by ? <span className="text-xs text-shop-text-secondary"> — {t.by}</span> : null}</span></li>)}</ol>
          )}
        </Card>
        <Card title="Security events" subtitle="Denied sign-ins, user changes and exports, last 14 days">
          {security.value.length === 0 ? <Empty>None.</Empty> : (
            <ul className="space-y-1 text-xs">{security.value.map((a, i) => <li key={i}><span className="text-shop-text-secondary">{dateLabel(dateOnly(a.at))} {darTime(a.at)}</span> · <strong>{a.action}</strong> · {a.actor || '—'} {a.detail ? <span className="text-shop-text-secondary">{typeof a.detail === 'string' ? a.detail : JSON.stringify(a.detail)}</span> : null} {a.ip ? <span className="text-shop-text-tertiary">{a.ip}</span> : null}</li>)}</ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Kv({ k, v }) {
  return <div><dt className="inline font-medium">{k}: </dt><dd className="inline text-shop-text-secondary">{v}</dd></div>;
}
