import Link from 'next/link';

import Bars from '@/components/dashboard/Bars';
import BucketChart from '@/components/dashboard/BucketChart';
import Card, { Empty, Unavailable } from '@/components/dashboard/Card';
import Heatmap from '@/components/dashboard/Heatmap';
import KpiTile from '@/components/dashboard/KpiTile';
import PageControls from '@/components/dashboard/PageControls';
import { isConfigured } from '@/lib/dashboard/db';
import { CHANNEL_LABELS, dateLabel, delta, num, pct, rangeLabel, tsh } from '@/lib/dashboard/format';
import { hrefWith, parsePageParams } from '@/lib/dashboard/params';
import { darDate } from '@/lib/dashboard/periods';
import {
  bucketed, byCategory, cancelledAndAmended, drafts, futureDated, heatmap, invoiceList,
  invoiceStatuses, onlineByPeriod, summary,
} from '@/lib/dashboard/queries/sales';

export const metadata = { title: 'Sales' };
export const dynamic = 'force-dynamic';

async function settle(promise, fallback = null) {
  try { return { value: await promise, error: null }; } catch (error) {
    console.error('[dashboard/sales]', error.message);
    return { value: fallback, error: error.message };
  }
}

const ACCU360 = 'https://satwik.accu360.cloud/app/sales-invoice/';

export default async function SalesPage({ searchParams }) {
  const sp = (await searchParams) ?? {};
  if (!isConfigured()) return <Card title="Dashboard database not configured" />;
  const now = new Date();
  const today = darDate(now);
  const { period, channels, channelKey, channelLabel, page } = parsePageParams(sp, { now });
  const current = { period, channelKey };
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 80) : '';
  const status = typeof sp.status === 'string' ? sp.status.slice(0, 40) : '';
  const minAmount = Number(sp.min) || 0;

  const [cur, prev, chart, chartPrev, cats, heat, list, statuses, draft, future, cancelled, online] = await Promise.all([
    settle(summary(period.start, period.end, channels)),
    settle(summary(period.compareStart, period.compareEnd, channels)),
    settle(bucketed(period.start, period.end, channels)),
    settle(bucketed(period.compareStart, period.compareEnd, channels)),
    settle(byCategory(period.start, period.end, channels), []),
    settle(heatmap(period.start, period.end, channels), { grid: [], max: 0 }),
    settle(invoiceList({ start: period.start, end: period.end, channels, q, status, minAmount, page }), { rows: [], total: 0, page: 1, pages: 1 }),
    settle(invoiceStatuses(), []),
    settle(drafts(), { n: 0 }),
    settle(futureDated(today), { n: 0, amount: 0 }),
    settle(cancelledAndAmended(period.start, period.end), { cancelled: 0, amended: 0 }),
    settle(onlineByPeriod(now), []),
  ]);

  const s = cur.value;
  const p = prev.value;
  const aiv = (x) => (x?.invoices ? x.sales / x.invoices : 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Sales</h1>
          <p className="text-xs text-shop-text-secondary">
            {period.label} · {rangeLabel(period.start, period.end)} · {channelLabel} · {period.compareLabel}
          </p>
        </div>
        <PageControls period={period} channelKey={channelKey} today={today} />
      </div>

      {cur.error || !s ? <Unavailable what="Summary" reason={cur.error} /> : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <KpiTile label="Sales" value={s.sales} previous={p?.sales} compareLabel={period.compareLabel} />
          <KpiTile label="Invoices" value={s.invoices} previous={p?.invoices} compareLabel={period.compareLabel} format="num" />
          <KpiTile label="Average invoice" value={aiv(s)} previous={aiv(p)} compareLabel={period.compareLabel} />
          <KpiTile label="Customers" value={s.customers} previous={p?.customers} compareLabel={period.compareLabel} format="num" />
          <KpiTile label="Discount given" value={s.discount} previous={p?.discount} compareLabel={period.compareLabel} polarity="down" sub={s.sales ? `${((s.discount / (s.sales + s.discount)) * 100).toFixed(1)}% of gross` : undefined} />
          <KpiTile label="Returns" value={s.returns} previous={p?.returns} compareLabel={period.compareLabel} polarity="down" format="num" sub={s.returns ? tsh(-s.returns_value) : 'none'} />
        </div>
      )}

      {/* Online channel over fixed periods, whatever the selection above (owner, 2026-09-05). */}
      <Card title="Online channel" subtitle="App and web over fixed periods, whatever is selected above. Placed = orders our backend accepted; invoiced = what Accu360 billed against an SF order id (the truth)." href="/dashboard/channels" hrefLabel="Channels page">
        {online.error ? <Unavailable what="Online channel" reason={online.error} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary">
                <tr><th className="py-1 pr-3">Period</th><th className="py-1 pr-3 text-right">Placed</th><th className="hidden md:table-cell py-1 pr-3 text-right">Invoiced online</th><th className="py-1 pr-3 text-right">Online sales</th><th className="py-1 pr-3 text-right">Share</th><th className="hidden md:table-cell py-1 pr-3 text-right">Customers</th><th className="py-1 text-right">Online sales vs before</th></tr>
              </thead>
              <tbody>
                {online.value.map(({ period: pp, current: c, previous: pv }) => {
                  const d = delta(c.online_sales, pv.online_sales);
                  return (
                    <tr key={pp.key} className="border-t border-shop-border align-top dark:border-[#2E352E]">
                      <td className="py-1.5 pr-3"><Link href={`/dashboard/sales?period=${pp.key}&channel=online`} className="hover:underline">{pp.label}</Link><br /><span className="text-xs text-shop-text-secondary">{rangeLabel(pp.start, pp.end)}</span></td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{num(c.placed)}<br /><span className="text-xs text-shop-text-secondary">{num((c.placed || 0) - (c.placed_web || 0))} app · {num(c.placed_web)} web</span></td>
                      <td className="hidden md:table-cell py-1.5 pr-3 text-right tabular-nums">{num(c.online_invoices)}<br /><span className="text-xs text-shop-text-secondary">{num(c.app_invoices)} app · {num(c.web_invoices)} web</span></td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(c.online_sales, { compact: true })}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{c.sales ? pct(c.online_sales / c.sales, 0) : '–'}</td>
                      <td className="hidden md:table-cell py-1.5 pr-3 text-right tabular-nums">{num(c.online_customers)}</td>
                      <td className={`py-1.5 text-right text-xs tabular-nums ${d.good === null ? 'text-shop-text-secondary' : d.good ? 'text-shop-primary-dark' : 'text-shop-error'}`}>{d.text}<br /><span className="text-shop-text-secondary">{pp.compareLabel}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Sales over time" subtitle={`Per ${chart.value?.granularity ?? 'day'}, with the previous period as a dashed line`} className="xl:col-span-2">
          {chart.error ? <Unavailable what="Chart" reason={chart.error} /> : (
            <BucketChart series={chart.value.series} compare={chartPrev.value?.series ?? null} granularity={chart.value.granularity} mode="total" />
          )}
        </Card>
        <Card title="By channel" subtitle="Same buckets, stacked">
          {chart.error ? <Unavailable what="Chart" reason={chart.error} /> : (
            <BucketChart series={chart.value.series} granularity={chart.value.granularity} mode="channel" height={220} />
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="By category" subtitle="Invoice lines grouped by Accu360 item group">
          {cats.error ? <Unavailable what="Categories" reason={cats.error} /> : <Bars rows={cats.value.map((c) => ({ label: c.item_group, value: c.revenue, sub: `${num(c.invoices)} inv.` }))} subKey="sub" />}
        </Card>
        <Card title="When invoices are raised" subtitle="Weekday × hour of posting time (Dar). Offline invoices are raised by staff; online ones at delivery.">
          {heat.error ? <Unavailable what="Heatmap" reason={heat.error} /> : <Heatmap grid={heat.value.grid} max={heat.value.max} />}
        </Card>
      </div>

      <Card title="Housekeeping" subtitle="Things that are not sales but explain the numbers">
        <ul className="grid gap-3 text-sm sm:grid-cols-3">
          <li><span className="text-2xl font-semibold tabular-nums">{num(draft.value?.n ?? 0)}</span><p className="text-xs text-shop-text-secondary">uninvoiced drafts{draft.value?.newest ? ` · newest dated ${dateLabel(draft.value.newest)}` : ''}</p></li>
          <li><span className="text-2xl font-semibold tabular-nums">{num(future.value?.n ?? 0)}</span><p className="text-xs text-shop-text-secondary">submitted invoices dated after today ({tsh(future.value?.amount ?? 0, { compact: true })}) — held out of Sales until their date</p></li>
          <li><span className="text-2xl font-semibold tabular-nums">{num(cancelled.value?.cancelled ?? 0)}</span><p className="text-xs text-shop-text-secondary">cancelled in this period, {num(cancelled.value?.amended ?? 0)} of them replaced by an amendment</p></li>
        </ul>
      </Card>

      <Card title="Invoices" subtitle={`${num(list.value.total)} in ${period.label.toLowerCase()} · ${channelLabel}`}>
        <form method="get" className="mb-3 flex flex-wrap items-end gap-2 text-sm">
          {period.key !== 'mtd' && <input type="hidden" name="period" value={period.key} />}
          {period.key === 'custom' && <><input type="hidden" name="from" value={period.start} /><input type="hidden" name="to" value={period.end} /></>}
          {channelKey !== 'all' && <input type="hidden" name="channel" value={channelKey} />}
          <label className="flex flex-col text-xs text-shop-text-secondary">Search<input name="q" defaultValue={q} placeholder="invoice, customer, SF id" className="mt-1 rounded border border-shop-border bg-transparent px-2 py-1 text-sm dark:border-[#2E352E]" /></label>
          <label className="flex flex-col text-xs text-shop-text-secondary">Status
            <select name="status" defaultValue={status} className="mt-1 rounded border border-shop-border bg-transparent px-2 py-1 text-sm dark:border-[#2E352E]">
              <option value="">any</option>
              {statuses.value.map((st) => <option key={st} value={st}>{st}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-xs text-shop-text-secondary">Min amount<input name="min" type="number" min="0" step="1000" defaultValue={minAmount || ''} className="mt-1 w-28 rounded border border-shop-border bg-transparent px-2 py-1 text-sm dark:border-[#2E352E]" /></label>
          <button type="submit" className="rounded-shop-sm bg-shop-primary px-3 py-1.5 text-sm font-medium text-white">Filter</button>
          {(q || status || minAmount) ? <Link href={hrefWith('/dashboard/sales', current)} className="text-xs text-shop-text-secondary hover:underline">clear</Link> : null}
        </form>
        {list.error ? <Unavailable what="Invoice list" reason={list.error} /> : list.value.rows.length === 0 ? <Empty>No invoices match.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary">
                <tr><th className="py-1 pr-3">Invoice</th><th className="py-1 pr-3">Date</th><th className="py-1 pr-3">Customer</th><th className="hidden md:table-cell py-1 pr-3">Channel</th><th className="hidden md:table-cell py-1 pr-3 text-right">Lines</th><th className="py-1 pr-3 text-right">Total</th><th className="hidden md:table-cell py-1 pr-3 text-right">Discount</th><th className="py-1 pr-3">Status</th><th className="hidden md:table-cell py-1">Order</th></tr>
              </thead>
              <tbody>
                {list.value.rows.map((r) => (
                  <tr key={r.name} className="border-t border-shop-border dark:border-[#2E352E]">
                    <td className="py-1.5 pr-3 whitespace-nowrap"><a href={`${ACCU360}${encodeURIComponent(r.name)}`} target="_blank" rel="noreferrer" className="hover:underline">{r.name}</a>{r.is_return ? <span className="ml-1 text-xs text-shop-error">return</span> : null}</td>
                    <td className="py-1.5 pr-3 whitespace-nowrap">{dateLabel(r.posting_date)} <span className="text-xs text-shop-text-secondary">{String(r.posting_time || '').slice(0, 5)}</span></td>
                    <td className="py-1.5 pr-3"><Link href={`/dashboard/customers/${encodeURIComponent(r.customer)}`} className="hover:underline">{r.display_name}</Link></td>
                    <td className="hidden md:table-cell py-1.5 pr-3">{CHANNEL_LABELS[r.channel] || 'Offline'}</td>
                    <td className="hidden md:table-cell py-1.5 pr-3 text-right tabular-nums">{r.lines}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(r.grand_total)}</td>
                    <td className="hidden md:table-cell py-1.5 pr-3 text-right tabular-nums text-shop-text-secondary">{r.discount_amount ? tsh(r.discount_amount) : ''}</td>
                    <td className="py-1.5 pr-3">{r.status}</td>
                    <td className="hidden md:table-cell py-1.5">{r.sf_order_id ? <Link href={`/dashboard/orders/${encodeURIComponent(r.sf_order_id)}`} className="text-xs hover:underline">{r.sf_order_id}</Link> : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination current={current} page={list.value.page} pages={list.value.pages} extra={{ q, status, min: minAmount || undefined }} />
          </div>
        )}
      </Card>
    </div>
  );
}

function Pagination({ current, page, pages, extra }) {
  if (pages <= 1) return null;
  const link = (n) => hrefWith('/dashboard/sales', current, { ...extra, page: n > 1 ? n : undefined });
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-shop-text-secondary">
      <span>Page {page} of {pages}</span>
      <div className="flex gap-3">
        {page > 1 && <Link href={link(page - 1)} className="hover:underline">← Previous</Link>}
        {page < pages && <Link href={link(page + 1)} className="hover:underline">Next →</Link>}
      </div>
    </div>
  );
}
