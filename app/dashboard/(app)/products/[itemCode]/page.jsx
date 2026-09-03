import Link from 'next/link';
import { notFound } from 'next/navigation';

import Card, { Empty } from '@/components/dashboard/Card';
import ChannelBar from '@/components/dashboard/ChannelBar';
import PageControls from '@/components/dashboard/PageControls';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import { isConfigured } from '@/lib/dashboard/db';
import { CHANNEL_LABELS, dateLabel, num, tsh } from '@/lib/dashboard/format';
import { parsePageParams } from '@/lib/dashboard/params';
import { itemDetail } from '@/lib/dashboard/queries/products';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { itemCode } = await params;
  return { title: itemCode };
}

export default async function ItemPage({ params, searchParams }) {
  const { itemCode } = await params;
  const sp = (await searchParams) ?? {};
  if (!isConfigured()) return <Card title="Dashboard database not configured" />;
  const now = new Date();
  const { period } = parsePageParams(sp, { now, defaultPeriod: 'last30' });
  const d = await itemDetail(itemCode, period.start, period.end, now);
  if (!d) notFound();
  const t = d.totals || {};
  const chTotal = (d.channels || []).reduce((s, r) => s + r.sales, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-shop-text-secondary"><Link href="/dashboard/products" className="hover:underline">Products</Link> / {d.info.item_code}</p>
          <h1 className="text-xl font-semibold">{d.info.item_name || d.info.item_code} {d.info.disabled ? <span className="ml-2 rounded-full bg-shop-error/10 px-2 py-0.5 text-xs text-shop-error">disabled in Accu360</span> : null}</h1>
          <p className="text-xs text-shop-text-secondary">{d.info.item_group} · {period.label}</p>
        </div>
        <PageControls period={period} channelKey="all" showChannel={false} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Revenue" value={tsh(t.revenue ?? 0, { compact: true })} />
        <Tile label="Quantity" value={num(Math.round((t.qty ?? 0) * 10) / 10)} />
        <Tile label="Invoices" value={num(t.invoices ?? 0)} />
        <Tile label="Average rate" value={tsh(t.avg_rate ?? 0)} sub={t.first_sold ? `sold ${dateLabel(t.first_sold)} – ${dateLabel(t.last_sold)}` : 'no sales in period'} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Last 90 days" subtitle="Daily revenue with a 7-day average" className="xl:col-span-2">
          {d.trend.some((x) => x.sales > 0) ? <SalesTrendChart series={d.trend} /> : <Empty />}
        </Card>
        <Card title="By channel" subtitle={period.label}>
          <ChannelBar rows={d.channels} total={chTotal} />
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Top customers for this item" subtitle={period.label}>
          {d.customers.length === 0 ? <Empty /> : (
            <ol className="space-y-1.5 text-sm">{d.customers.map((c, i) => <li key={c.customer} className="flex items-baseline gap-2"><span className="w-4 text-xs text-shop-text-secondary">{i + 1}</span><Link href={`/dashboard/customers/${encodeURIComponent(c.customer)}`} className="min-w-0 flex-1 truncate hover:underline">{c.display_name}</Link><span className="text-xs text-shop-text-secondary">{c.invoices} inv.</span><span className="tabular-nums text-shop-text-secondary">{tsh(c.revenue, { compact: true })}</span></li>)}</ol>
          )}
        </Card>
        <Card title="Recent invoices with this item" subtitle="Latest 30, all time">
          {d.invoices.length === 0 ? <Empty /> : (
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Date</th><th className="py-1 pr-3">Customer</th><th className="py-1 pr-3 text-right">Qty</th><th className="py-1 pr-3 text-right">Rate</th><th className="py-1 pr-3 text-right">Amount</th><th className="py-1">Channel</th></tr></thead>
                <tbody>{d.invoices.map((r) => <tr key={r.name} className="border-t border-shop-border dark:border-[#2E352E]"><td className="py-1 pr-3 whitespace-nowrap">{dateLabel(r.posting_date)}</td><td className="py-1 pr-3"><Link href={`/dashboard/customers/${encodeURIComponent(r.customer)}`} className="hover:underline">{r.display_name}</Link></td><td className="py-1 pr-3 text-right tabular-nums">{r.qty} {r.uom}</td><td className="py-1 pr-3 text-right tabular-nums">{tsh(r.rate)}</td><td className="py-1 pr-3 text-right tabular-nums">{tsh(r.amount)}</td><td className="py-1 text-xs">{CHANNEL_LABELS[r.channel] || 'Offline'}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Tile({ label, value, sub }) {
  return (
    <div className="rounded-shop-md border border-shop-border bg-shop-surface p-4 dark:border-[#2E352E] dark:bg-[#1A1E1A]">
      <p className="text-xs font-medium uppercase tracking-wide text-shop-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-shop-text-secondary">{sub}</p>}
    </div>
  );
}
