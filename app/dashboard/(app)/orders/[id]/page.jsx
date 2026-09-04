import Link from 'next/link';
import { notFound } from 'next/navigation';

import Card, { Empty } from '@/components/dashboard/Card';
import { isConfigured } from '@/lib/dashboard/db';
import { ago, darTime, dateLabel, dateOnly, num, tsh } from '@/lib/dashboard/format';
import { orderDetail } from '@/lib/dashboard/queries/orders';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Order ${id}` };
}

const CHANNEL = { web: 'Web', mobile_release: 'App', mobile_debug: 'App (debug)' };
const ACCU360_SO = 'https://satwik.accu360.cloud/app/sales-order/';
const ACCU360_SI = 'https://satwik.accu360.cloud/app/sales-invoice/';

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  if (!isConfigured()) return <Card title="Dashboard database not configured" />;
  const detail = await orderDetail(id);
  if (!detail) notFound();
  const { order, salesOrders, invoices, deleted, acks, twin } = detail;
  const items = Array.isArray(order.items) ? order.items : [];

  const timeline = [
    { at: order.created_at, what: `Order placed (${CHANNEL[order.channel] || 'online'}${order.app_version ? `, ${order.app_version}` : ''})` },
    ...salesOrders.map((s) => ({ at: s.transaction_date, what: `Sales Order ${s.name} · ${s.status}${s.deleted_at ? ' · since deleted' : ''}`, href: `${ACCU360_SO}${encodeURIComponent(s.name)}` })),
    ...invoices.map((i) => ({ at: i.posting_date, what: `Invoice ${i.name} · ${i.docstatus === 2 ? 'cancelled' : i.status} · ${tsh(i.grand_total)}${i.amended_from ? ` (amends ${i.amended_from})` : ''}`, href: `${ACCU360_SI}${encodeURIComponent(i.name)}` })),
    ...deleted.map((d) => ({ at: d.deleted_on, what: `${d.deleted_doctype} ${d.deleted_name} deleted by ${d.deleted_by || 'staff'}` })),
    ...acks.map((a) => ({ at: a.at, what: `Acknowledged by ${a.actor}${a.detail?.note ? `: ${a.detail.note}` : ''}` })),
  ].sort((a, b) => String(a.at).localeCompare(String(b.at)));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-shop-text-secondary"><Link href="/dashboard/orders" className="hover:underline">Orders</Link> / {order.id}</p>
        <h1 className="text-xl font-semibold">{order.id} <span className="ml-2 rounded-full bg-shop-surface-alt px-2 py-0.5 text-xs font-medium dark:bg-[#252A25]">{order.status}</span></h1>
        <p className="text-xs text-shop-text-secondary">Placed {dateLabel(String(order.created_dar))} at {darTime(order.created_at)} Dar · {ago(`${order.created_at}Z`)}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Customer">
          <dl className="space-y-1 text-sm">
            <Row k="Name" v={order.customer_name} />
            <Row k="Phone" v={order.customer_phone} />
            <Row k="Email" v={order.customer_email || '—'} />
            <Row k="Address" v={order.customer_address} />
            <Row k="Notes" v={order.delivery_notes || '—'} />
          </dl>
        </Card>
        <Card title="Money">
          <dl className="space-y-1 text-sm">
            <Row k="Subtotal" v={tsh(order.subtotal)} />
            <Row k="Discount" v={order.discount ? `−${tsh(order.discount)}${order.discount_source ? ` (${order.discount_source})` : ''}` : 'none'} />
            <Row k="Promo code" v={order.promo_code || (order.discount ? 'code unknown (before 3 Sep 2026)' : '—')} />
            <Row k="Delivery fee" v={tsh(order.delivery_fee)} />
            <Row k="Total ordered" v={<strong>{tsh(order.total)}</strong>} />
            {invoices.filter((i) => i.docstatus === 1).map((i) => <Row key={i.name} k={`Invoiced (${i.name})`} v={`${tsh(i.grand_total)}${i.outstanding > 0 ? ` · ${tsh(i.outstanding)} outstanding` : ''}`} />)}
          </dl>
        </Card>
        <Card title="Attribution">
          <dl className="space-y-1 text-sm">
            <Row k="Channel" v={CHANNEL[order.channel] || (order.channel ? order.channel : 'online, unsplit (before 3 Sep 2026)')} />
            <Row k="App version" v={order.app_version || '—'} />
            <Row k="Accu360 SO" v={order.accu360_order_id ? <a href={`${ACCU360_SO}${encodeURIComponent(order.accu360_order_id)}`} target="_blank" rel="noreferrer" className="hover:underline">{order.accu360_order_id}</a> : '—'} />
            <Row k="Idempotency key" v={order.idempotency_key ? `${String(order.idempotency_key).slice(0, 12)}…` : '—'} />
            {twin && <Row k="Duplicate of" v={<Link href={`/dashboard/orders/${encodeURIComponent(twin)}`} className="hover:underline">{twin}</Link>} />}
            {order.failure_reason && <Row k="Note" v={<span className="text-shop-error">{order.failure_reason}</span>} />}
          </dl>
        </Card>
      </div>

      <Card title={`Lines (${num(items.length)})`}>
        {items.length === 0 ? <Empty>No lines stored.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Item</th><th className="py-1 pr-3">SKU</th><th className="py-1 pr-3">Unit</th><th className="py-1 pr-3 text-right">Qty</th><th className="py-1 pr-3 text-right">Unit price</th><th className="py-1 pr-3 text-right">Line total</th><th className="py-1">Combo</th></tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={`${it.accu360_sku}-${i}`} className="border-t border-shop-border dark:border-[#2E352E]">
                    <td className="py-1.5 pr-3">{it.name}</td>
                    <td className="py-1.5 pr-3 text-xs">{it.accu360_sku ? <Link href={`/dashboard/products/${encodeURIComponent(it.accu360_sku)}`} className="hover:underline">{it.accu360_sku}</Link> : ''}</td>
                    <td className="py-1.5 pr-3 text-xs">{it.unit}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{it.quantity}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(it.unit_price)}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(it.total_price)}</td>
                    <td className="py-1.5 text-xs">{it.combo_id || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Timeline">
        <ol className="space-y-2 text-sm">
          {timeline.map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-28 shrink-0 text-xs text-shop-text-secondary">{String(t.at).length > 10 ? `${dateLabel(dateOnly(t.at))} ${darTime(t.at)}` : dateLabel(t.at)}</span>
              <span>{t.href ? <a href={t.href} target="_blank" rel="noreferrer" className="hover:underline">{t.what}</a> : t.what}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex gap-3">
      <dt className="w-32 shrink-0 text-xs text-shop-text-secondary">{k}</dt>
      <dd className="min-w-0 break-words">{v}</dd>
    </div>
  );
}
