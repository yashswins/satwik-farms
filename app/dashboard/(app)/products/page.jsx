import Link from 'next/link';

import Bars from '@/components/dashboard/Bars';
import Card, { Empty, Unavailable } from '@/components/dashboard/Card';
import PageControls from '@/components/dashboard/PageControls';
import { isConfigured } from '@/lib/dashboard/db';
import { dateLabel, delta, num, pct, tsh } from '@/lib/dashboard/format';
import { hrefWith, parsePageParams } from '@/lib/dashboard/params';
import { health } from '@/lib/dashboard/queries/overview';
import { boughtTogether, disabledItemsStillSelling, items, notSelling } from '@/lib/dashboard/queries/products';
import { byCategory } from '@/lib/dashboard/queries/sales';

export const metadata = { title: 'Products' };
export const dynamic = 'force-dynamic';

async function settle(promise, fallback = null) {
  try { return { value: await promise, error: null }; } catch (error) {
    console.error('[dashboard/products]', error.message);
    return { value: fallback, error: error.message };
  }
}

export default async function ProductsPage({ searchParams }) {
  const sp = (await searchParams) ?? {};
  if (!isConfigured()) return <Card title="Dashboard database not configured" />;
  const now = new Date();
  const { period, channels, channelKey, channelLabel } = parsePageParams(sp, { now });
  const current = { period, channelKey };
  const by = sp.by === 'qty' ? 'qty' : 'revenue';
  const staleDays = sp.stale === '90' ? 90 : 60;

  const [rows, cats, catsPrev, stale, pairs, disabledSelling, hlth] = await Promise.all([
    settle(items(period.start, period.end, period.compareStart, period.compareEnd, channels, 300), []),
    settle(byCategory(period.start, period.end, channels), []),
    settle(byCategory(period.compareStart, period.compareEnd, channels), []),
    settle(notSelling(staleDays, 100), []),
    settle(boughtTogether(period.start, period.end, 5, 20), []),
    settle(disabledItemsStillSelling(30), []),
    settle(health(), { snapshots: {} }),
  ]);

  const all = rows.value || [];
  const sold = all.filter((r) => r.invoices > 0);
  const top = [...sold].sort((a, b) => (by === 'qty' ? b.qty - a.qty : b.revenue - a.revenue)).slice(0, 25);
  const totalRevenue = sold.reduce((s, r) => s + r.revenue, 0);
  const movers = all.filter((r) => (r.invoices >= 3 || r.invoices_prev >= 3) && r.revenue_prev > 0)
    .map((r) => ({ ...r, change: (r.revenue - r.revenue_prev) / r.revenue_prev }));
  const rising = [...movers].sort((a, b) => b.change - a.change).slice(0, 8);
  const falling = [...movers].sort((a, b) => a.change - b.change).slice(0, 8);
  const prevByCat = Object.fromEntries((catsPrev.value || []).map((c) => [c.item_group, c.revenue]));
  const catalogIssues = hlth.value.snapshots?.catalog_checks?.payload?.issues || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-xs text-shop-text-secondary">{period.label} · {dateLabel(period.start)} – {dateLabel(period.end)} · {channelLabel} · from invoice lines</p>
        </div>
        <PageControls period={period} channelKey={channelKey} />
      </div>

      <Card title={`Best sellers by ${by === 'qty' ? 'quantity' : 'revenue'}`} subtitle={`${num(sold.length)} items sold · quantities mix kg and pieces, so compare within a unit`} href={hrefWith('/dashboard/products', current, { by: by === 'qty' ? undefined : 'qty' })} hrefLabel={by === 'qty' ? 'Sort by revenue' : 'Sort by quantity'}>
        {rows.error ? <Unavailable what="Items" reason={rows.error} /> : top.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">#</th><th className="py-1 pr-3">Item</th><th className="hidden md:table-cell py-1 pr-3">Category</th><th className="py-1 pr-3 text-right">Qty</th><th className="hidden md:table-cell py-1 pr-3">Unit</th><th className="py-1 pr-3 text-right">Revenue</th><th className="hidden md:table-cell py-1 pr-3 text-right">Share</th><th className="hidden md:table-cell py-1 pr-3 text-right">Invoices</th><th className="py-1 text-right">vs prior</th></tr></thead>
              <tbody>
                {top.map((r, i) => {
                  const d = delta(r.revenue, r.revenue_prev);
                  return (
                    <tr key={r.item_code} className="border-t border-shop-border dark:border-[#2E352E]">
                      <td className="py-1.5 pr-3 text-xs text-shop-text-secondary">{i + 1}</td>
                      <td className="py-1.5 pr-3"><Link href={`/dashboard/products/${encodeURIComponent(r.item_code)}`} className="hover:underline">{r.item_name || r.item_code}</Link></td>
                      <td className="hidden md:table-cell py-1.5 pr-3 text-xs text-shop-text-secondary">{r.item_group}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{num(Math.round(r.qty * 10) / 10)}</td>
                      <td className="hidden md:table-cell py-1.5 pr-3 text-xs text-shop-text-secondary">{r.uom}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{tsh(r.revenue)}</td>
                      <td className="hidden md:table-cell py-1.5 pr-3 text-right tabular-nums text-shop-text-secondary">{totalRevenue ? pct(r.revenue / totalRevenue, 1) : '–'}</td>
                      <td className="hidden md:table-cell py-1.5 pr-3 text-right tabular-nums">{num(r.invoices)}</td>
                      <td className={`py-1.5 text-right text-xs tabular-nums ${d.good === null ? 'text-shop-text-secondary' : d.good ? 'text-shop-primary-dark' : 'text-shop-error'}`}>{d.text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Rising" subtitle="Largest gain vs the comparison period (≥ 3 invoices)">
          {rising.length === 0 ? <Empty>Not enough history to compare.</Empty> : (
            <ul className="space-y-1.5 text-sm">{rising.map((r) => <li key={r.item_code} className="flex justify-between gap-2"><Link href={`/dashboard/products/${encodeURIComponent(r.item_code)}`} className="min-w-0 truncate hover:underline">{r.item_name}</Link><span className="shrink-0 tabular-nums text-shop-primary-dark">▲ {Math.round(r.change * 100)}% · {tsh(r.revenue, { compact: true })}</span></li>)}</ul>
          )}
        </Card>
        <Card title="Falling" subtitle="Largest drop vs the comparison period (≥ 3 invoices)">
          {falling.length === 0 ? <Empty>Not enough history to compare.</Empty> : (
            <ul className="space-y-1.5 text-sm">{falling.map((r) => <li key={r.item_code} className="flex justify-between gap-2"><Link href={`/dashboard/products/${encodeURIComponent(r.item_code)}`} className="min-w-0 truncate hover:underline">{r.item_name}</Link><span className="shrink-0 tabular-nums text-shop-error">▼ {Math.round(Math.abs(r.change) * 100)}% · {tsh(r.revenue, { compact: true })}</span></li>)}</ul>
          )}
        </Card>
        <Card title="Category mix" subtitle="With change vs the comparison period">
          {cats.error ? <Unavailable what="Categories" reason={cats.error} /> : (
            <Bars rows={(cats.value || []).map((c) => { const d = delta(c.revenue, prevByCat[c.item_group] ?? 0); return { label: c.item_group, value: c.revenue, sub: d.text }; })} subKey="sub" />
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title={`Not selling in ${staleDays} days`} subtitle={`Items enabled in Accu360 with no invoice line since ${dateLabel(new Date(now.getTime() - staleDays * 86_400_000).toISOString().slice(0, 10))}`} href={hrefWith('/dashboard/products', current, { stale: staleDays === 60 ? 90 : undefined })} hrefLabel={staleDays === 60 ? 'Use 90 days' : 'Use 60 days'}>
          {stale.error ? <Unavailable what="Not selling" reason={stale.error} /> : stale.value.length === 0 ? <Empty>Everything enabled has sold recently.</Empty> : (
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Item</th><th className="hidden md:table-cell py-1 pr-3">Category</th><th className="py-1">Last sold</th></tr></thead>
                <tbody>{stale.value.map((r) => <tr key={r.item_code} className="border-t border-shop-border dark:border-[#2E352E]"><td className="py-1 pr-3"><Link href={`/dashboard/products/${encodeURIComponent(r.item_code)}`} className="hover:underline">{r.item_name}</Link> <span className="text-xs text-shop-text-secondary">{r.item_code}</span></td><td className="py-1 pr-3 text-xs text-shop-text-secondary">{r.item_group}</td><td className="py-1 text-xs">{r.last_sold ? dateLabel(r.last_sold, { year: true }) : 'never'}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title="Bought together" subtitle="Item pairs on the same invoice in this period; lift = how much more often than chance (≥ 5 times together)">
          {pairs.error ? <Unavailable what="Pairs" reason={pairs.error} /> : pairs.value.length === 0 ? <Empty>No pair appears 5 times yet in this period.</Empty> : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Pair</th><th className="py-1 pr-3 text-right">Together</th><th className="py-1 text-right">Lift</th></tr></thead>
              <tbody>{pairs.value.map((p) => <tr key={`${p.a}-${p.b}`} className="border-t border-shop-border dark:border-[#2E352E]"><td className="py-1 pr-3">{p.a_name || p.a} <span className="text-shop-text-secondary">+</span> {p.b_name || p.b}</td><td className="py-1 pr-3 text-right tabular-nums">{p.together}</td><td className="py-1 text-right tabular-nums">{p.lift?.toFixed(1)}×</td></tr>)}</tbody>
            </table>
          )}
        </Card>
      </div>

      <Card title="Catalogue health" subtitle="Shop catalogue vs Accu360, from the backend's last check">
        {catalogIssues.length === 0 && (disabledSelling.value || []).length === 0 ? <Empty>No problems: every active shop product exists and is enabled in Accu360, invoiced prices match the Sheet, and no disabled item has sold recently.</Empty> : (
          <ul className="space-y-1 text-sm">
            {catalogIssues.filter((i) => i.kind === 'item_missing_in_erp' || i.kind === 'item_disabled_in_erp').map((i, idx) => <li key={`e${idx}`} className="text-shop-error">{i.name || i.sku} ({i.sku}) is active in the shop but {i.kind === 'item_disabled_in_erp' ? 'disabled' : 'missing'} in Accu360 — carts with it are rejected.</li>)}
            {catalogIssues.filter((i) => i.kind === 'item_no_sku').map((i, idx) => <li key={`n${idx}`} className="text-shop-warning">{i.name} is active in the shop with no Accu360 SKU — it cannot be ordered.</li>)}
            {catalogIssues.filter((i) => i.kind.startsWith('price_drift')).map((i, idx) => <li key={`p${idx}`} className={i.kind === 'price_drift_online' ? 'text-shop-warning' : 'text-shop-text-secondary'}>{i.name || i.sku}: {i.kind === 'price_drift_online' ? 'app orders' : 'offline invoices'} charged {tsh(i.invoiced_rate)} per stock unit vs {tsh(i.expected_rate)} from the Sheet ({tsh(i.sheet_price)} / {i.unit}), {i.drift_pct > 0 ? '+' : ''}{i.drift_pct}% over {i.lines} lines in 14 days.</li>)}
            {(disabledSelling.value || []).map((d) => <li key={d.item_code} className="text-shop-text-secondary">{d.item_name} ({d.item_code}) is disabled in Accu360 yet appeared on {d.invoices} invoices in the last 30 days (last {dateLabel(d.last_sold)}).</li>)}
          </ul>
        )}
      </Card>
    </div>
  );
}
