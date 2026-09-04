import Link from 'next/link';

import Bars from '@/components/dashboard/Bars';
import Card, { Empty, Unavailable } from '@/components/dashboard/Card';
import KpiTile from '@/components/dashboard/KpiTile';
import PageControls from '@/components/dashboard/PageControls';
import StackedBarChart from '@/components/dashboard/StackedBarChart';
import { isConfigured } from '@/lib/dashboard/db';
import { dateLabel, num, pct, tsh } from '@/lib/dashboard/format';
import { hrefWith, parsePageParams } from '@/lib/dashboard/params';
import { cohorts, frequency, kpis, lapsed, migration, newVsReturningWeekly, search, top } from '@/lib/dashboard/queries/customers';

export const metadata = { title: 'Customers' };
export const dynamic = 'force-dynamic';

async function settle(promise, fallback = null) {
  try { return { value: await promise, error: null }; } catch (error) {
    console.error('[dashboard/customers]', error.message);
    return { value: fallback, error: error.message };
  }
}

export default async function CustomersPage({ searchParams }) {
  const sp = (await searchParams) ?? {};
  if (!isConfigured()) return <Card title="Dashboard database not configured" />;
  const now = new Date();
  const { period, channelKey } = parsePageParams(sp, { now });
  const current = { period, channelKey };
  const by = sp.by === 'invoices' ? 'invoices' : 'revenue';
  const q = typeof sp.q === 'string' ? sp.q.trim().slice(0, 60) : '';

  const [k, kPrev, topRows, weekly, freq, coh, lap, mig, found] = await Promise.all([
    settle(kpis(period.start, period.end, now), null),
    settle(kpis(period.compareStart, period.compareEnd, now), null),
    settle(top(period.start, period.end, by, 50), []),
    settle(newVsReturningWeekly(12, now), []),
    settle(frequency(90, now), []),
    settle(cohorts(6, now), []),
    settle(lapsed(50, 45, now), []),
    settle(migration(period.start, period.end), null),
    settle(q ? search(q, 20) : Promise.resolve([]), []),
  ]);

  const returningShare = k.value?.sales ? k.value.returning_sales / k.value.sales : null;
  const weeklyData = (weekly.value || []).map((w) => ({ label: dateLabel(w.week).slice(4), new_sales: w.new_sales, returning_sales: w.returning_sales }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Customers</h1>
          <p className="text-xs text-shop-text-secondary">{period.label} · {dateLabel(period.start)} – {dateLabel(period.end)} · names come from Accu360's full-name field, then the linked contact, then the name typed in the app</p>
        </div>
        <PageControls period={period} channelKey="all" showChannel={false} />
      </div>

      <form method="get" className="flex flex-wrap items-end gap-2 text-sm">
        {period.key !== 'mtd' && <input type="hidden" name="period" value={period.key} />}
        <label className="flex flex-col text-xs text-shop-text-secondary">Find a customer<input name="q" defaultValue={q} placeholder="name or phone digits" className="mt-1 w-64 rounded border border-shop-border bg-transparent px-2 py-1 text-sm dark:border-[#2E352E]" /></label>
        <button type="submit" className="rounded-shop-sm bg-shop-primary px-3 py-1.5 text-sm font-medium text-white">Search</button>
      </form>
      {q && (
        <Card title={`Search: "${q}"`}>
          {found.value.length === 0 ? <Empty>No customer matches.</Empty> : (
            <ul className="divide-y divide-shop-border text-sm dark:divide-[#2E352E]">{found.value.map((c) => <li key={c.name} className="flex justify-between gap-3 py-1.5"><Link href={`/dashboard/customers/${encodeURIComponent(c.name)}`} className="hover:underline">{c.display_name} <span className="text-xs text-shop-text-secondary">{c.name} · {c.phone || ''} · {c.customer_group || ''}</span></Link><span className="text-xs text-shop-text-secondary">{c.invoices} invoices</span></li>)}</ul>
          )}
        </Card>
      )}

      {k.error || !k.value ? <Unavailable what="KPIs" reason={k.error} /> : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiTile label="Active (30 days)" value={k.value.active_30d} format="num" sub="at least one invoice in the last 30 days" />
          <KpiTile label="New in period" value={k.value.new_in_period} previous={kPrev.value?.new_in_period} compareLabel={period.compareLabel} format="num" sub="first-ever invoice in the period" />
          <KpiTile label="Returning share of sales" value={returningShare === null ? 0 : Math.round(returningShare * 1000) / 10} format="num" sub={returningShare === null ? 'no sales' : `${pct(returningShare, 0)} of ${tsh(k.value.sales, { compact: true })} from customers seen before`} />
          <KpiTile label="Lapsed" value={k.value.lapsed} format="num" polarity="down" sub="2+ invoices, none in 45 days" href="#lapsed" tone={k.value.lapsed ? 'warning' : undefined} />
        </div>
      )}

      <Card title={`Top customers by ${by === 'revenue' ? 'total value' : 'invoices'}`} subtitle={period.label} href={hrefWith('/dashboard/customers', current, { by: by === 'revenue' ? 'invoices' : undefined })} hrefLabel={by === 'revenue' ? 'Sort by invoices' : 'Sort by total value'}>
        {topRows.error ? <Unavailable what="Top customers" reason={topRows.error} /> : topRows.value.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">#</th><th className="py-1 pr-3">Customer</th><th className="py-1 pr-3">Group</th><th className="py-1 pr-3 text-right">Invoices</th><th className="py-1 pr-3 text-right">Revenue</th><th className="py-1 pr-3 text-right">Avg</th><th className="py-1 pr-3">Online</th><th className="py-1 pr-3">Last</th><th className="py-1">Since</th></tr></thead>
              <tbody>
                {topRows.value.map((c, i) => (
                  <tr key={c.customer} className="border-t border-shop-border dark:border-[#2E352E]">
                    <td className="py-1.5 pr-3 text-xs text-shop-text-secondary">{i + 1}</td>
                    <td className="py-1.5 pr-3"><Link href={`/dashboard/customers/${encodeURIComponent(c.customer)}`} className="hover:underline">{c.display_name}</Link>{c.phone && c.phone !== c.display_name ? <span className="ml-1 text-xs text-shop-text-secondary">{c.phone}</span> : null}</td>
                    <td className="py-1.5 pr-3 text-xs text-shop-text-secondary">{c.customer_group}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{num(c.invoices)}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(c.revenue)}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums text-shop-text-secondary">{tsh(c.invoices ? c.revenue / c.invoices : 0, { compact: true })}</td>
                    <td className="py-1.5 pr-3 text-xs">{c.invoices ? pct(c.online_invoices / c.invoices, 0) : '–'}</td>
                    <td className="py-1.5 pr-3 whitespace-nowrap text-xs">{dateLabel(c.last_invoice)}</td>
                    <td className="py-1.5 whitespace-nowrap text-xs text-shop-text-secondary">{c.first_ever ? dateLabel(c.first_ever, { year: true }) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="New vs returning" subtitle="Weekly sales, last 12 weeks">
          {weekly.error ? <Unavailable what="Chart" reason={weekly.error} /> : <StackedBarChart data={weeklyData} valueFormat="tsh" series={[{ key: 'returning_sales', name: 'Returning', color: '#53B175' }, { key: 'new_sales', name: 'New', color: '#2F6FB5' }]} />}
        </Card>
        <Card title="How often customers buy" subtitle="Invoices per customer, trailing 90 days">
          {freq.error ? <Unavailable what="Frequency" reason={freq.error} /> : <Bars rows={freq.value} format={(v) => `${num(v)} customers`} />}
        </Card>
        <Card title="Channel mix, lifetime" subtitle={mig.value ? `${num(mig.value.moved_online_in_period)} customers moved from offline to online in ${period.label.toLowerCase()}` : ''}>
          {mig.error || !mig.value ? <Unavailable what="Migration" reason={mig.error} /> : (
            <Bars rows={[{ label: 'Offline only', value: mig.value.offline_only }, { label: 'Both', value: mig.value.both }, { label: 'Online only', value: mig.value.online_only }]} format={(v) => `${num(v)} customers`} />
          )}
        </Card>
      </div>

      <Card title="Retention by first-invoice month" subtitle="Share of each cohort seen again N months later (small numbers — read as a tendency)">
        {coh.error ? <Unavailable what="Cohorts" reason={coh.error} /> : coh.value.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr><th className="py-1 pr-3 text-left">Cohort</th><th className="py-1 pr-3 text-right">Size</th>{[1, 2, 3, 4, 5, 6].map((m) => <th key={m} className="py-1 pr-3 text-right">+{m}</th>)}</tr></thead>
              <tbody>{coh.value.map((c) => <tr key={c.cohort} className="border-t border-shop-border dark:border-[#2E352E]"><td className="py-1 pr-3">{c.cohort.slice(0, 7)}</td><td className="py-1 pr-3 text-right tabular-nums">{c.size}</td>{[1, 2, 3, 4, 5, 6].map((m) => { const v = c.cells[m]; const share = v !== undefined && c.size ? v / c.size : null; return <td key={m} className="py-1 pr-3 text-right tabular-nums" style={share !== null ? { backgroundColor: `rgba(83,177,117,${0.1 + 0.6 * share})` } : undefined}>{share === null ? '' : pct(share, 0)}</td>; })}</tr>)}</tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Lapsed customers" subtitle="2+ lifetime invoices, none in 45 days, by lifetime revenue — the call list">
        <div id="lapsed" />
        {lap.error ? <Unavailable what="Lapsed" reason={lap.error} /> : lap.value.length === 0 ? <Empty>Nobody has lapsed.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Customer</th><th className="py-1 pr-3 text-right">Lifetime inv.</th><th className="py-1 pr-3 text-right">Lifetime revenue</th><th className="py-1 pr-3">Last invoice</th><th className="py-1">Usually buys</th></tr></thead>
              <tbody>{lap.value.map((c) => <tr key={c.customer} className="border-t border-shop-border dark:border-[#2E352E]"><td className="py-1.5 pr-3"><Link href={`/dashboard/customers/${encodeURIComponent(c.customer)}`} className="hover:underline">{c.display_name}</Link> <span className="text-xs text-shop-text-secondary">{c.phone || ''}</span></td><td className="py-1.5 pr-3 text-right tabular-nums">{c.lifetime}</td><td className="py-1.5 pr-3 text-right tabular-nums">{tsh(c.revenue)}</td><td className="py-1.5 pr-3 whitespace-nowrap text-xs">{dateLabel(c.last_invoice, { year: true })}</td><td className="py-1.5 text-xs text-shop-text-secondary">{c.usual_items}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
