import Link from 'next/link';

import Bars from '@/components/dashboard/Bars';
import BucketChart from '@/components/dashboard/BucketChart';
import Card, { Empty, Unavailable } from '@/components/dashboard/Card';
import LineChartSimple from '@/components/dashboard/LineChartSimple';
import PageControls from '@/components/dashboard/PageControls';
import StackedBarChart from '@/components/dashboard/StackedBarChart';
import { isConfigured } from '@/lib/dashboard/db';
import { CHANNEL_COLORS, CHANNEL_LABELS, dateLabel, delta, num, pct, tsh } from '@/lib/dashboard/format';
import { parsePageParams } from '@/lib/dashboard/params';
import { addDays, darDate } from '@/lib/dashboard/periods';
import { adoptionMonthly, appVersions, basketByChannel, channelKpis, probablyOnline } from '@/lib/dashboard/queries/channels';
import { bucketed } from '@/lib/dashboard/queries/sales';

export const metadata = { title: 'Channels' };
export const dynamic = 'force-dynamic';

async function settle(promise, fallback = null) {
  try { return { value: await promise, error: null }; } catch (error) {
    console.error('[dashboard/channels]', error.message);
    return { value: fallback, error: error.message };
  }
}

const ORDER = ['app', 'web', 'online_unsplit', 'offline'];

export default async function ChannelsPage({ searchParams }) {
  const sp = (await searchParams) ?? {};
  if (!isConfigured()) return <Card title="Dashboard database not configured" />;
  const now = new Date();
  const today = darDate(now);
  const { period } = parsePageParams(sp, { now });
  const weeksStart = addDays(today, -7 * 26 + 1);

  const [kpis, kpisPrev, weekly, adoption, probable, versions, basket] = await Promise.all([
    settle(channelKpis(period.start, period.end), []),
    settle(channelKpis(period.compareStart, period.compareEnd), []),
    settle(bucketed(weeksStart, today, null, 'week'), { series: [] }),
    settle(adoptionMonthly(12, now), []),
    settle(probablyOnline(period.start, period.end), []),
    settle(appVersions(30), []),
    settle(basketByChannel(period.start, period.end, 8), []),
  ]);

  const byCh = Object.fromEntries((kpis.value || []).map((r) => [r.channel, r]));
  const byChPrev = Object.fromEntries((kpisPrev.value || []).map((r) => [r.channel, r]));
  const columns = ORDER.filter((c) => byCh[c] || byChPrev[c] || c !== 'online_unsplit');
  const totalSales = Object.values(byCh).reduce((s, r) => s + r.sales, 0);

  const weeklyData = (weekly.value.series || []).map((w) => ({ label: dateLabel(w.bucket), ...w }));
  const adoptionData = (adoption.value || []).map((m) => ({ label: m.month.slice(0, 7), share: m.active ? m.online / m.active : 0, active: m.active, online: m.online }));
  const versionRows = (versions.value || []).map((v) => ({ label: `${v.version} · ${CHANNEL_LABELS[v.channel] || v.channel}`, value: v.orders }));
  const online = (basket.value || []).filter((b) => b.grp === 'online');
  const offline = (basket.value || []).filter((b) => b.grp === 'offline');

  const rowsSpec = [
    ['Sales', (r) => tsh(r?.sales ?? 0, { compact: true }), (r) => r?.sales ?? 0],
    ['Share', (r) => (totalSales ? pct((r?.sales ?? 0) / totalSales, 0) : '–'), null],
    ['Invoices', (r) => num(r?.invoices ?? 0), (r) => r?.invoices ?? 0],
    ['Avg invoice', (r) => tsh(r?.invoices ? r.sales / r.invoices : 0, { compact: true }), (r) => (r?.invoices ? r.sales / r.invoices : 0)],
    ['Customers', (r) => num(r?.customers ?? 0), (r) => r?.customers ?? 0],
    ['New customers', (r) => num(r?.new_customers ?? 0), (r) => r?.new_customers ?? 0],
    ['Discount %', (r) => (r?.sales ? pct(r.discount / (r.sales + r.discount), 1) : '–'), null],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Channels</h1>
          <p className="text-xs text-shop-text-secondary">{period.label} · {dateLabel(period.start)} – {dateLabel(period.end)} · {period.compareLabel}. Online = App + Web; an invoice with an SF order id is online, one without is offline.</p>
        </div>
        <PageControls period={period} channelKey="all" showChannel={false} />
      </div>

      <Card title="Channel comparison" subtitle="Invoice truth; deltas against the comparison period">
        {kpis.error ? <Unavailable what="KPIs" reason={kpis.error} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr><th className="py-1 pr-3 text-left text-xs uppercase tracking-wide text-shop-text-secondary" />{columns.map((c) => <th key={c} className="py-1 pr-3 text-right"><span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CHANNEL_COLORS[c] }} />{CHANNEL_LABELS[c]}</span></th>)}</tr></thead>
              <tbody>
                {rowsSpec.map(([label, fmt, raw]) => (
                  <tr key={label} className="border-t border-shop-border dark:border-[#2E352E]">
                    <td className="py-1.5 pr-3 text-xs text-shop-text-secondary">{label}</td>
                    {columns.map((c) => {
                      const d = raw ? delta(raw(byCh[c]), raw(byChPrev[c]), label === 'Discount %' ? 'down' : 'up') : null;
                      return (
                        <td key={c} className="py-1.5 pr-3 text-right tabular-nums">
                          {fmt(byCh[c])}
                          {d && d.direction !== 'flat' && <span className={`ml-1 text-[11px] ${d.good ? 'text-shop-primary-dark' : 'text-shop-error'}`}>{d.text}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Share of sales, weekly" subtitle="Last 26 weeks">
          {weekly.error ? <Unavailable what="Chart" reason={weekly.error} /> : (
            <StackedBarChart data={weeklyData} percent valueFormat="tsh" series={ORDER.map((c) => ({ key: c, name: CHANNEL_LABELS[c], color: CHANNEL_COLORS[c] }))} />
          )}
        </Card>
        <Card title="Sales by channel, weekly" subtitle="Last 26 weeks">
          {weekly.error ? <Unavailable what="Chart" reason={weekly.error} /> : <BucketChart series={weekly.value.series} granularity="week" mode="channel" height={220} />}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Online adoption" subtitle="Share of active customers each month who bought online at least once">
          {adoption.error ? <Unavailable what="Adoption" reason={adoption.error} /> : adoptionData.length === 0 ? <Empty /> : (
            <LineChartSimple data={adoptionData} series={[{ key: 'share', name: 'Online share', color: CHANNEL_COLORS.app }]} valueFormat="pct" yDomain={[0, 1]} />
          )}
        </Card>
        <Card title="App versions placing orders" subtitle="Last 30 days, from our order records">
          {versions.error ? <Unavailable what="Versions" reason={versions.error} /> : <Bars rows={versionRows} format={(v) => `${num(v)} orders`} />}
        </Card>
      </div>

      <Card title="Probably online, counted as offline" subtitle="Offline invoices matching a failed, rejected or unwritten online order from the same customer on the same day, within 10%. Staff recreate these by hand without the SF id.">
        {probable.error ? <Unavailable what="Matches" reason={probable.error} /> : probable.value.length === 0 ? <Empty>No likely misattributions in this period.</Empty> : (
          <div className="overflow-x-auto">
            <p className="mb-2 text-xs text-shop-text-secondary">{num(probable.value.length)} invoices, {tsh(probable.value.reduce((s, r) => s + Number(r.grand_total), 0))} — add these to the App column mentally; they are not moved automatically.</p>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Invoice</th><th className="py-1 pr-3">Date</th><th className="py-1 pr-3">Customer</th><th className="py-1 pr-3 text-right">Invoiced</th><th className="py-1 pr-3">Online order</th><th className="py-1 pr-3 text-right">Ordered</th><th className="py-1">Order status</th></tr></thead>
              <tbody>
                {probable.value.map((r) => (
                  <tr key={`${r.name}-${r.order_id}`} className="border-t border-shop-border dark:border-[#2E352E]">
                    <td className="py-1.5 pr-3">{r.name}</td>
                    <td className="py-1.5 pr-3 whitespace-nowrap">{dateLabel(r.posting_date)}</td>
                    <td className="py-1.5 pr-3"><Link href={`/dashboard/customers/${encodeURIComponent(r.customer)}`} className="hover:underline">{r.display_name}</Link></td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(r.grand_total)}</td>
                    <td className="py-1.5 pr-3"><Link href={`/dashboard/orders/${encodeURIComponent(r.order_id)}`} className="hover:underline">{r.order_id}</Link></td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(r.order_total)}</td>
                    <td className="py-1.5">{r.order_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="What each channel buys" subtitle="Top items by revenue, online vs offline">
        {basket.error ? <Unavailable what="Baskets" reason={basket.error} /> : (
          <div className="grid gap-6 md:grid-cols-2">
            <div><h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-shop-text-secondary">Online</h3><Bars rows={online.map((b) => ({ label: b.item_name || b.item_code, value: b.revenue }))} /></div>
            <div><h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-shop-text-secondary">Offline</h3><Bars rows={offline.map((b) => ({ label: b.item_name || b.item_code, value: b.revenue }))} /></div>
          </div>
        )}
      </Card>
    </div>
  );
}
