import Link from 'next/link';
import { notFound } from 'next/navigation';

import Bars from '@/components/dashboard/Bars';
import BucketChart from '@/components/dashboard/BucketChart';
import Card, { Empty } from '@/components/dashboard/Card';
import { isConfigured } from '@/lib/dashboard/db';
import { CHANNEL_LABELS, darTime, dateLabel, dateOnly, num, pct, tsh } from '@/lib/dashboard/format';
import { detail } from '@/lib/dashboard/queries/customers';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Customer ${id}` };
}

const ACCU360 = 'https://satwik.accu360.cloud/app/';
const ORDER_CHANNEL = { web: 'Web', mobile_release: 'App', mobile_debug: 'App (debug)' };

export default async function CustomerPage({ params }) {
  const { id } = await params;
  if (!isConfigured()) return <Card title="Dashboard database not configured" />;
  const d = await detail(id);
  if (!d) notFound();
  const h = d.header;
  const name = h.full_name || h.app_name || h.contact_name || h.customer_name || h.name;
  const t = d.totals || {};
  const monthly = (d.monthly || []).map((m) => ({ bucket: m.month, sales: m.sales, invoices: m.invoices, app: 0, web: 0, offline: 0 }));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-shop-text-secondary"><Link href="/dashboard/customers" className="hover:underline">Customers</Link> / {h.name}</p>
        <h1 className="text-xl font-semibold">{name}</h1>
        <p className="text-xs text-shop-text-secondary">
          {h.phone || ''}{h.customer_email ? ` · ${h.customer_email}` : ''}{h.customer_group ? ` · ${h.customer_group}` : ''}{h.territory ? ` · ${h.territory}` : ''}
          {' · '}<a href={`${ACCU360}customer/${encodeURIComponent(h.name)}`} target="_blank" rel="noreferrer" className="hover:underline">open in Accu360</a>
        </p>
        {h.customer_address && <p className="mt-1 text-xs text-shop-text-secondary">Last app address: {h.customer_address}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Lifetime revenue" value={tsh(t.revenue ?? 0, { compact: true })} />
        <Tile label="Invoices" value={num(t.invoices ?? 0)} sub={t.invoices ? `${pct((t.online_invoices ?? 0) / t.invoices, 0)} online` : ''} />
        <Tile label="Average invoice" value={tsh(t.invoices ? t.revenue / t.invoices : 0, { compact: true })} />
        <Tile label="First / last" value={t.first_invoice ? dateLabel(t.first_invoice) : '–'} sub={t.last_invoice ? `last ${dateLabel(t.last_invoice, { year: true })}` : ''} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Sales by month" subtitle="Last 12 months" className="xl:col-span-2">
          {monthly.length === 0 ? <Empty /> : <BucketChart series={monthly} granularity="month" mode="total" height={220} />}
        </Card>
        <Card title="Usually buys" subtitle="By lifetime revenue">
          <Bars rows={(d.items || []).map((i) => ({ label: i.item_name || i.item_code, value: i.revenue, sub: `${num(i.invoices)} inv.` }))} subKey="sub" max={15} />
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Invoices" subtitle="Latest 50">
          {d.invoices.length === 0 ? <Empty /> : (
            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Invoice</th><th className="py-1 pr-3">Date</th><th className="hidden md:table-cell py-1 pr-3 text-right">Lines</th><th className="py-1 pr-3 text-right">Total</th><th className="py-1 pr-3">Status</th><th className="py-1">Channel</th></tr></thead>
                <tbody>{d.invoices.map((r) => <tr key={r.name} className="border-t border-shop-border dark:border-[#2E352E]"><td className="py-1 pr-3 whitespace-nowrap"><a href={`${ACCU360}sales-invoice/${encodeURIComponent(r.name)}`} target="_blank" rel="noreferrer" className="hover:underline">{r.name}</a></td><td className="py-1 pr-3 whitespace-nowrap">{dateLabel(r.posting_date)}</td><td className="hidden md:table-cell py-1 pr-3 text-right tabular-nums">{r.lines}</td><td className="py-1 pr-3 text-right tabular-nums">{tsh(r.grand_total)}{r.outstanding > 0 ? <span className="block text-[11px] text-shop-warning">{tsh(r.outstanding)} due</span> : null}</td><td className="py-1 pr-3 text-xs">{r.status}</td><td className="py-1 text-xs">{CHANNEL_LABELS[r.channel] || 'Offline'}{r.sf_order_id ? <Link href={`/dashboard/orders/${encodeURIComponent(r.sf_order_id)}`} className="ml-1 hover:underline">↗</Link> : null}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title="Online orders" subtitle="Matched by phone number · latest 50 · includes rejected and failed">
          {d.orders.length === 0 ? <Empty>No online orders from this phone number.</Empty> : (
            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Order</th><th className="py-1 pr-3">Placed</th><th className="py-1 pr-3 text-right">Total</th><th className="py-1 pr-3">Status</th><th className="py-1">Channel</th></tr></thead>
                <tbody>{d.orders.map((o) => <tr key={o.id} className="border-t border-shop-border dark:border-[#2E352E]"><td className="py-1 pr-3 whitespace-nowrap"><Link href={`/dashboard/orders/${encodeURIComponent(o.id)}`} className="hover:underline">{o.id}</Link></td><td className="py-1 pr-3 whitespace-nowrap text-xs">{dateLabel(dateOnly(o.created_at))} {darTime(o.created_at)}</td><td className="py-1 pr-3 text-right tabular-nums">{tsh(o.total)}{o.promo_code ? <span className="block text-[11px] text-shop-text-secondary">{o.promo_code}</span> : null}</td><td className={`py-1 pr-3 text-xs ${['failed', 'rejected'].includes(o.status) ? 'text-shop-error' : ''}`}>{o.status}</td><td className="py-1 text-xs">{ORDER_CHANNEL[o.channel] || 'Online'}</td></tr>)}</tbody>
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
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-shop-text-secondary">{sub}</p>}
    </div>
  );
}
