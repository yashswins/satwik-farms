import { revalidatePath } from 'next/cache';
import Link from 'next/link';

import Bars from '@/components/dashboard/Bars';
import Card, { Empty, Unavailable } from '@/components/dashboard/Card';
import LineChartSimple from '@/components/dashboard/LineChartSimple';
import PageControls from '@/components/dashboard/PageControls';
import StackedBarChart from '@/components/dashboard/StackedBarChart';
import { THRESHOLDS } from '@/lib/dashboard/alerts';
import { acknowledgeReconciliation, backendConfigured } from '@/lib/dashboard/backend';
import { isConfigured } from '@/lib/dashboard/db';
import { ago, darTime, dateLabel, dateOnly, num, share, tsh } from '@/lib/dashboard/format';
import { hrefWith, parsePageParams } from '@/lib/dashboard/params';
import { addDays, darDate } from '@/lib/dashboard/periods';
import {
  ATTENTION_SINCE, attemptsByDay, attention, handledRecently, invoiceLag, orderList, promoCodesSeen, reconciliationState, statusByDay,
} from '@/lib/dashboard/queries/orders';
import { requireDashboardUser } from '@/lib/dashboard/session';
import { funnelConfigured, funnelCounts } from '@/lib/dashboard/upstash';
import { recordAudit } from '@/lib/dashboard/users';

export const metadata = { title: 'Orders' };
export const dynamic = 'force-dynamic';

async function settle(promise, fallback = null) {
  try { return { value: await promise, error: null }; } catch (error) {
    console.error('[dashboard/orders]', error.message);
    return { value: fallback, error: error.message };
  }
}

const CHANNEL = { web: 'Web', mobile_release: 'App', mobile_debug: 'App (debug)', dashboard: 'Dashboard' };
const channelLabel = (c) => CHANNEL[c] || (c ? c : 'App (before 3 Sep)');
const OUTCOMES = [
  { key: 'accepted', name: 'Accepted', color: '#53B175' },
  { key: 'queued', name: 'Queued', color: '#8FCFA5' },
  { key: 'duplicate_replay', name: 'Duplicate replay', color: '#B3B3B3' },
  { key: 'rejected', name: 'Rejected', color: '#F3603F' },
  { key: 'failed', name: 'Failed', color: '#E53935' },
  { key: 'unauthorized', name: 'Bad key', color: '#7C7C7C' },
  { key: 'rate_limited', name: 'Throttled', color: '#4A4A4A' },
  { key: 'never_arrived', name: 'Never arrived (funnel)', color: '#2F6FB5' },
];
const STATUSES = [
  { key: 'completed', name: 'Completed', color: '#3B8B5A' },
  { key: 'pending', name: 'Pending', color: '#AEDCC0' },
  { key: 'queued', name: 'Queued', color: '#8FCFA5' },
  { key: 'rejected', name: 'Rejected', color: '#F3603F' },
  { key: 'failed', name: 'Failed', color: '#E53935' },
  { key: 'cancelled', name: 'Cancelled', color: '#7C7C7C' },
];

const BUCKETS = [
  ['rejected', 'B · Rejected by validation', 'Call the customer; if the reason names an item, fix the catalogue.'],
  ['failed', 'C · Accepted, ERP write failed', 'Create the Sales Order by hand, or retry from the backend.'],
  ['queued', 'D · Stuck in the outbox (> 15 min)', 'Check the backend sync status on the Admin page.'],
  ['noSalesOrder', 'E · Accepted, no Sales Order after 60 min', 'The customer was told it succeeded. Recreate the SO.'],
  ['soDeleted', 'E · Sales Order deleted in Accu360', 'Staff deleted it. Confirm the customer was served, or recreate it.'],
  ['reconcile', 'E · Reconciliation findings', 'Read the note; acknowledge once handled.'],
  ['notInvoiced', 'F · Past delivery date, not invoiced', 'Fulfil or cancel.'],
  ['mismatch', 'G · Invoiced for a different amount', 'Informational — substitutions or price changes.'],
];

export default async function OrdersPage({ searchParams }) {
  const sp = (await searchParams) ?? {};
  if (!isConfigured()) return <Card title="Dashboard database not configured" />;
  const now = new Date();
  const today = darDate(now);
  const { period, channelKey, page } = parsePageParams(sp, { now, defaultPeriod: 'last7' });
  const current = { period, channelKey };
  const status = typeof sp.status === 'string' ? sp.status.slice(0, 20) : '';
  const promo = typeof sp.promo === 'string' ? sp.promo.slice(0, 32) : '';
  const combo = sp.combo === '1';
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 80) : '';
  const dates14 = Array.from({ length: 14 }, (_, i) => addDays(today, -(13 - i)));
  const showHandled = sp.handled === '1';

  const [att, attempts, statuses, lag, recon, list, promos, funnel, handled] = await Promise.all([
    settle(attention({ includeHandled: showHandled }), null),
    settle(attemptsByDay(14), []),
    settle(statusByDay(14), []),
    settle(invoiceLag(30), null),
    settle(reconciliationState(7), { latest: {}, runs: [] }),
    settle(orderList({ status, channelKey, promo, combo, q, start: period.start, end: period.end, page }), { rows: [], total: 0, page: 1, pages: 1 }),
    settle(promoCodesSeen(), []),
    settle(funnelConfigured() ? funnelCounts(dates14) : Promise.resolve(null), null),
    settle(handledRecently(30), []),
  ]);

  // Attempts vs outcomes per day, with the funnel's never-arrived gap.
  const attemptsData = dates14.map((d) => {
    const row = { label: dateLabel(d).slice(4), date: d };
    for (const o of OUTCOMES) row[o.key] = 0;
    for (const a of attempts.value.filter((x) => x.date === d)) row[a.outcome] = a.n;
    if (funnel.value) {
      const f = funnel.value.web[d] || {};
      const g = funnel.value.app[d] || {};
      const failed = (f.order_failed || 0) + (g.order_failed || 0);
      row.never_arrived = Math.max(0, failed - (row.rejected + row.failed));
    }
    return row;
  });
  const statusData = dates14.map((d) => {
    const row = { label: dateLabel(d).slice(4) };
    for (const s of STATUSES) row[s.key] = 0;
    for (const r of statuses.value.filter((x) => x.date === d)) row[r.status] = r.n;
    return row;
  });
  const failureRate = funnel.value ? dates14.map((d) => {
    const out = { label: dateLabel(d).slice(4) };
    for (const surface of ['web', 'app']) {
      const f = funnel.value[surface][d] || {};
      const attemptsN = (f.order_placed || 0) + (f.order_failed || 0);
      out[surface] = attemptsN >= 3 ? (f.order_failed || 0) / attemptsN : null;
    }
    return out;
  }) : null;

  async function acknowledge(formData) {
    'use server';
    const user = await requireDashboardUser();
    const orderId = String(formData.get('order_id') || '');
    const note = String(formData.get('note') || '').slice(0, 300);
    try {
      await acknowledgeReconciliation(orderId, `${note || 'acknowledged from dashboard'} (${user.email})`);
      await recordAudit(user.email, 'acknowledge', { order_id: orderId, note });
    } catch (error) {
      await recordAudit(user.email, 'acknowledge', { order_id: orderId, error: error.message });
    }
    revalidatePath('/dashboard/orders');
  }

  async function markHandled(formData) {
    'use server';
    const user = await requireDashboardUser();
    const orderId = String(formData.get('order_id') || '').slice(0, 40);
    const bucket = String(formData.get('bucket') || '').slice(0, 40);
    const note = String(formData.get('note') || '').slice(0, 300);
    if (orderId) await recordAudit(user.email, 'handled', { order_id: orderId, bucket, note });
    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard');
  }

  const attentionCount = att.value ? Object.entries(att.value).filter(([k]) => k !== 'twins' && k !== 'mismatch').reduce((s, [, v]) => s + v.length, 0) : 0;
  // G is informational, so it lives in its own collapsed, paged card below (owner, 2026-09-05).
  const mismatchRows = att.value?.mismatch || [];
  const G_PAGE = 10;
  const gPages = Math.max(1, Math.ceil(mismatchRows.length / G_PAGE));
  const gPage = Math.min(gPages, Math.max(1, Number(sp.gpage) || 1));
  const gSlice = mismatchRows.slice((gPage - 1) * G_PAGE, gPage * G_PAGE);
  const gHref = (n) => hrefWith('/dashboard/orders', current, { status, promo, combo: combo ? 1 : undefined, q, handled: showHandled ? 1 : undefined, gpage: n > 1 ? n : undefined });
  const handledById = Object.fromEntries((handled.value || []).map((h) => [h.order_id, h]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Orders</h1>
          <p className="text-xs text-shop-text-secondary">The online pipeline from our own records — ordered, never sales. Attention list covers the last 14 days.</p>
        </div>
      </div>

      <Card
        title={attentionCount ? `${num(attentionCount)} orders need attention` : 'Nothing needs attention'}
        subtitle={`Orders placed since ${dateLabel(ATTENTION_SINCE, { year: true })} (fresh slate), deleted Sales Orders from the last 14 days. Mark a row handled once it is dealt with: it disappears from here and the order page records who handled it.`}
        href={showHandled ? '/dashboard/orders' : '/dashboard/orders?handled=1'}
        hrefLabel={showHandled ? 'Hide handled' : `Show handled (${num((handled.value || []).length)})`}
      >
        {att.error ? <Unavailable what="Attention list" reason={att.error} /> : attentionCount === 0 ? <Empty>Every online order since the fresh slate was accepted, written to Accu360 and invoiced on time, or has been marked handled.</Empty> : (
          <div className="space-y-5">
            {BUCKETS.map(([key, title, action]) => {
              if (key === 'mismatch') return null;
              const rows = att.value[key] || [];
              if (rows.length === 0) return null;
              return (
                <div key={key}>
                  <h3 className="text-sm font-semibold">{title} <span className="ml-1 rounded-full bg-shop-error/10 px-2 py-0.5 text-xs text-shop-error">{rows.length}</span></h3>
                  <p className="mb-2 text-xs text-shop-text-secondary">{action}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Order</th><th className="hidden md:table-cell py-1 pr-3">When</th><th className="py-1 pr-3">Customer</th><th className="py-1 pr-3 text-right">Total</th><th className="hidden md:table-cell py-1 pr-3">Channel</th><th className="py-1 pr-3">Detail</th><th className="py-1" /></tr></thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={`${key}-${r.id}-${r.invoice || ''}`} className="border-t border-shop-border align-top dark:border-[#2E352E]">
                            <td className="py-1.5 pr-3 whitespace-nowrap"><Link href={`/dashboard/orders/${encodeURIComponent(r.id)}`} className="hover:underline">{r.id}</Link></td>
                            <td className="hidden md:table-cell py-1.5 pr-3 whitespace-nowrap text-xs">{darTime(r.created_at)} · {ago(`${r.created_at}Z`)}</td>
                            <td className="py-1.5 pr-3">{r.customer_name}<br /><span className="text-xs text-shop-text-secondary">{r.customer_phone}</span></td>
                            <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(r.total)}{r.invoiced !== undefined && <><br /><span className="text-xs text-shop-text-secondary">invoiced {tsh(r.invoiced)}</span></>}</td>
                            <td className="hidden md:table-cell py-1.5 pr-3">{channelLabel(r.channel)}</td>
                            <td className="py-1.5 pr-3 text-xs text-shop-text-secondary">
                              {key === 'notInvoiced' && `${r.so_name} · delivery ${dateLabel(r.delivery_date)} · ${r.so_status}`}
                              {key === 'soDeleted' && `${r.accu360_order_id} deleted ${ago(`${r.deleted_on}Z`)} by ${r.deleted_by || 'staff'}`}
                              {key === 'mismatch' && `${r.invoice} on ${dateLabel(r.posting_date)}`}
                              {!['notInvoiced', 'soDeleted', 'mismatch'].includes(key) && (r.failure_reason || r.accu360_order_id || '')}
                            </td>
                            <td className="py-1.5">
                              {handledById[r.id] ? (
                                <span className="text-xs text-shop-primary-dark">handled by {handledById[r.id].actor} · {ago(`${handledById[r.id].at}Z`)}</span>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <form action={markHandled} className="flex items-center gap-1">
                                    <input type="hidden" name="order_id" value={r.id} />
                                    <input type="hidden" name="bucket" value={key} />
                                    <input name="note" placeholder="note" className="w-28 rounded border border-shop-border bg-transparent px-1 py-0.5 text-xs dark:border-[#2E352E]" />
                                    <button type="submit" className="text-xs font-medium text-shop-primary-dark hover:underline">mark handled</button>
                                  </form>
                                  {key === 'reconcile' && backendConfigured() && (
                                    <form action={acknowledge} className="flex items-center gap-1">
                                      <input type="hidden" name="order_id" value={r.id} />
                                      <input name="note" placeholder="note for backend" className="w-28 rounded border border-shop-border bg-transparent px-1 py-0.5 text-xs dark:border-[#2E352E]" />
                                      <button type="submit" className="text-xs text-shop-text-secondary hover:underline">acknowledge</button>
                                    </form>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            {att.value.twins?.length > 0 && (
              <p className="text-xs text-shop-text-secondary">{att.value.twins.length} duplicate submissions whose twin was served are not listed as losses.</p>
            )}
          </div>
        )}
      </Card>

      {mismatchRows.length > 0 && (
        <Card title="G · Invoiced for a different amount" subtitle="Informational — substitutions or price changes, not losses">
          <details open={Boolean(sp.gpage)} className="group">
            <summary className="cursor-pointer select-none text-sm text-shop-text-secondary hover:text-shop-text">
              <span className="font-medium text-shop-text">{num(mismatchRows.length)} orders</span> since {dateLabel(ATTENTION_SINCE)} — <span className="group-open:hidden">show</span><span className="hidden group-open:inline">hide</span>
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Order</th><th className="hidden md:table-cell py-1 pr-3">When</th><th className="py-1 pr-3">Customer</th><th className="py-1 pr-3 text-right">Ordered</th><th className="py-1 pr-3 text-right">Invoiced</th><th className="hidden md:table-cell py-1 pr-3">Invoice</th><th className="py-1" /></tr></thead>
                <tbody>
                  {gSlice.map((r) => (
                    <tr key={`g-${r.id}-${r.invoice || ''}`} className="border-t border-shop-border align-top dark:border-[#2E352E]">
                      <td className="py-1.5 pr-3 whitespace-nowrap"><Link href={`/dashboard/orders/${encodeURIComponent(r.id)}`} className="hover:underline">{r.id}</Link></td>
                      <td className="hidden md:table-cell py-1.5 pr-3 whitespace-nowrap text-xs">{dateLabel(dateOnly(r.created_at))} {darTime(r.created_at)}</td>
                      <td className="py-1.5 pr-3">{r.customer_name}<br /><span className="text-xs text-shop-text-secondary">{r.customer_phone}</span></td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(r.total)}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(r.invoiced)}<br /><span className={`text-xs ${Number(r.invoiced) >= Number(r.total) ? 'text-shop-primary-dark' : 'text-shop-error'}`}>{Number(r.invoiced) >= Number(r.total) ? '+' : '−'}{tsh(Math.abs(Number(r.invoiced) - Number(r.total)))}</span></td>
                      <td className="hidden md:table-cell py-1.5 pr-3 text-xs text-shop-text-secondary">{r.invoice} · {dateLabel(r.posting_date)}</td>
                      <td className="py-1.5">
                        {handledById[r.id] ? (
                          <span className="text-xs text-shop-primary-dark">handled by {handledById[r.id].actor} · {ago(`${handledById[r.id].at}Z`)}</span>
                        ) : (
                          <form action={markHandled} className="flex items-center gap-1">
                            <input type="hidden" name="order_id" value={r.id} />
                            <input type="hidden" name="bucket" value="mismatch" />
                            <button type="submit" className="text-xs font-medium text-shop-primary-dark hover:underline">mark handled</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {gPages > 1 && (
                <div className="mt-3 flex items-center justify-between text-xs text-shop-text-secondary">
                  <span>Page {gPage} of {gPages}</span>
                  <div className="flex gap-3">
                    {gPage > 1 && <Link href={gHref(gPage - 1)} className="hover:underline">← Previous</Link>}
                    {gPage < gPages && <Link href={gHref(gPage + 1)} className="hover:underline">Next →</Link>}
                  </div>
                </div>
              )}
            </div>
          </details>
        </Card>
      )}

      {showHandled && (
        <Card title="Recently handled" subtitle="Who cleared what, most recent first">
          {(handled.value || []).length === 0 ? <Empty>Nothing marked handled yet.</Empty> : (
            <ul className="divide-y divide-shop-border text-xs dark:divide-[#2E352E]">
              {handled.value.map((h, i) => <li key={i} className="flex flex-wrap gap-x-3 py-1.5"><span className="w-28 text-shop-text-secondary">{darTime(h.at)} · {ago(`${h.at}Z`)}</span><Link href={`/dashboard/orders/${encodeURIComponent(h.order_id)}`} className="font-medium hover:underline">{h.order_id}</Link><span className="text-shop-text-secondary">{h.bucket}</span><span>{h.actor}</span>{h.note && <span className="text-shop-text-secondary">{h.note}</span>}</li>)}
            </ul>
          )}
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Attempts vs outcomes" subtitle="Every POST the server saw, by outcome, last 14 days. “Never arrived” = checkouts that reported failure minus what the server rejected or failed.">
          {attempts.error ? <Unavailable what="Attempts" reason={attempts.error} /> : attempts.value.length === 0 && !funnel.value ? <Empty>No attempts recorded yet — counting started with the backend deploy on 3 Sep 2026.</Empty> : (
            <StackedBarChart data={attemptsData} series={OUTCOMES.filter((o) => o.key !== 'never_arrived' || funnel.value)} />
          )}
        </Card>
        <Card title="Order status by day" subtitle="Status today of orders placed each day">
          {statuses.error ? <Unavailable what="Statuses" reason={statuses.error} /> : <StackedBarChart data={statusData} series={STATUSES} />}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Client failure rate" subtitle={`From the funnel beacon; warning at ${Math.round(THRESHOLDS.clientFailureWarn * 100)}%, critical at ${Math.round(THRESHOLDS.clientFailureCritical * 100)}%`}>
          {!funnel.value ? <Empty>Funnel counters are not configured on this deployment.</Empty> : (
            <LineChartSimple data={failureRate} series={[{ key: 'web', name: 'Web', color: '#2F6FB5' }, { key: 'app', name: 'App', color: '#53B175' }]} valueFormat="pct" yDomain={[0, 1]} references={[{ y: THRESHOLDS.clientFailureWarn, label: 'warn' }, { y: THRESHOLDS.clientFailureCritical, label: 'critical', color: '#E53935' }]} />
          )}
        </Card>
        <Card title="Order → invoice lag" subtitle="Accepted orders invoiced in the last 30 days">
          {lag.error || !lag.value ? <Unavailable what="Lag" reason={lag.error} /> : lag.value.n === 0 ? <Empty /> : (
            <>
              <p className="mb-2 text-sm">Median <strong>{lag.value.median?.toFixed(1)} h</strong> · p90 <strong>{lag.value.p90?.toFixed(1)} h</strong> · {num(lag.value.n)} orders</p>
              <Bars rows={Object.entries(lag.value.buckets).map(([label, value]) => ({ label, value }))} format={(v) => `${num(v)}`} />
            </>
          )}
        </Card>
        <Card title="Reconciliation" subtitle="The backend's own cross-check against Accu360">
          {recon.error ? <Unavailable what="Reconciliation" reason={recon.error} /> : (
            <div className="space-y-2 text-sm">
              {recon.value.latest.reconcile ? (
                <p>Last sweep {ago(`${recon.value.latest.reconcile.taken_at}Z`)}: checked {num(recon.value.latest.reconcile.payload.checked)}, missing {num(recon.value.latest.reconcile.payload.missing)}, duplicate {num(recon.value.latest.reconcile.payload.duplicate)}, unknown {num(recon.value.latest.reconcile.payload.unknown)}.</p>
              ) : <p className="text-shop-text-secondary">No sweep recorded since snapshots began (3 Sep 2026); sweeps run 06:00–19:00 Dar.</p>}
              {recon.value.latest.completion && (
                <p>Completion sync {ago(`${recon.value.latest.completion.taken_at}Z`)}: {num(recon.value.latest.completion.payload.completed)} completed, {num(recon.value.latest.completion.payload.cancelled)} cancelled of {num(recon.value.latest.completion.payload.checked)} checked.</p>
              )}
              <p className="text-xs text-shop-text-secondary">Sweeps per day (expected 26 in the window): {recon.value.runs.map((r) => `${dateLabel(r.date).slice(4)} ${r.runs}`).join(' · ') || 'none yet'}</p>
            </div>
          )}
        </Card>
      </div>

      <Card title="Order list" subtitle={`${num(list.value.total)} orders · ${period.label}`}>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <PageControls period={period} channelKey={channelKey} today={today} />
          <form method="get" className="flex flex-wrap items-end gap-2 text-sm">
            {period.key !== 'mtd' && <input type="hidden" name="period" value={period.key} />}
            {period.key === 'custom' && <><input type="hidden" name="from" value={period.start} /><input type="hidden" name="to" value={period.end} /></>}
            {channelKey !== 'all' && <input type="hidden" name="channel" value={channelKey} />}
            <label className="flex flex-col text-xs text-shop-text-secondary">Status
              <select name="status" defaultValue={status} className="mt-1 rounded border border-shop-border bg-transparent px-2 py-1 text-sm dark:border-[#2E352E]">
                <option value="">any</option>
                {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-xs text-shop-text-secondary">Promo
              <select name="promo" defaultValue={promo} className="mt-1 rounded border border-shop-border bg-transparent px-2 py-1 text-sm dark:border-[#2E352E]">
                <option value="">any</option>
                {promos.value.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1 text-xs text-shop-text-secondary"><input type="checkbox" name="combo" value="1" defaultChecked={combo} /> combo</label>
            <label className="flex flex-col text-xs text-shop-text-secondary">Search<input name="q" defaultValue={q} placeholder="SF id, name, phone, SO" className="mt-1 rounded border border-shop-border bg-transparent px-2 py-1 text-sm dark:border-[#2E352E]" /></label>
            <button type="submit" className="rounded-shop-sm bg-shop-primary px-3 py-1.5 text-sm font-medium text-white">Filter</button>
          </form>
        </div>
        {list.error ? <Unavailable what="Order list" reason={list.error} /> : list.value.rows.length === 0 ? <Empty>No orders match.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Order</th><th className="py-1 pr-3">Placed</th><th className="py-1 pr-3">Customer</th><th className="hidden md:table-cell py-1 pr-3">Channel</th><th className="hidden md:table-cell py-1 pr-3 text-right">Lines</th><th className="py-1 pr-3 text-right">Total</th><th className="hidden md:table-cell py-1 pr-3">Promo</th><th className="py-1 pr-3">Status</th><th className="hidden md:table-cell py-1 pr-3">Sales Order</th><th className="hidden md:table-cell py-1">Invoice</th></tr></thead>
              <tbody>
                {list.value.rows.map((r) => (
                  <tr key={r.id} className="border-t border-shop-border dark:border-[#2E352E]">
                    <td className="py-1.5 pr-3 whitespace-nowrap"><Link href={`/dashboard/orders/${encodeURIComponent(r.id)}`} className="hover:underline">{r.id}</Link></td>
                    <td className="py-1.5 pr-3 whitespace-nowrap text-xs">{dateLabel(dateOnly(r.created_at))} {darTime(r.created_at)}</td>
                    <td className="py-1.5 pr-3">{r.customer_name}</td>
                    <td className="hidden md:table-cell py-1.5 pr-3 text-xs">{channelLabel(r.channel)}{r.app_version ? <span className="text-shop-text-secondary"> · {r.app_version}</span> : ''}</td>
                    <td className="hidden md:table-cell py-1.5 pr-3 text-right tabular-nums">{r.lines}{r.has_combo ? <span className="ml-1 text-[10px] text-shop-primary-dark">combo</span> : null}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(r.total)}{r.discount > 0 && <span className="block text-[11px] text-shop-text-secondary">−{tsh(r.discount)}</span>}</td>
                    <td className="hidden md:table-cell py-1.5 pr-3 text-xs">{r.promo_code || ''}</td>
                    <td className="py-1.5 pr-3">{r.status}</td>
                    <td className="hidden md:table-cell py-1.5 pr-3 text-xs">{r.accu360_order_id || ''}</td>
                    <td className="hidden md:table-cell py-1.5 text-xs">{r.invoice ? `${r.invoice} · ${tsh(r.invoiced, { compact: true })}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.value.pages > 1 && (
              <div className="mt-3 flex items-center justify-between text-xs text-shop-text-secondary">
                <span>Page {list.value.page} of {list.value.pages}</span>
                <div className="flex gap-3">
                  {list.value.page > 1 && <Link href={hrefWith('/dashboard/orders', current, { status, promo, combo: combo ? 1 : undefined, q, page: list.value.page - 1 > 1 ? list.value.page - 1 : undefined })} className="hover:underline">← Previous</Link>}
                  {list.value.page < list.value.pages && <Link href={hrefWith('/dashboard/orders', current, { status, promo, combo: combo ? 1 : undefined, q, page: list.value.page + 1 })} className="hover:underline">Next →</Link>}
                </div>
              </div>
            )}
          </div>
        )}
        <p className="mt-3 text-[11px] text-shop-text-secondary">Share of accepted orders with a promo in this list: {share(list.value.rows.filter((r) => r.promo_code).length, list.value.rows.length)} (this page only).</p>
      </Card>
    </div>
  );
}
