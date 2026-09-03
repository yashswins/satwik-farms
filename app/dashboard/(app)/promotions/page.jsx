import Bars from '@/components/dashboard/Bars';
import Card, { Empty, Unavailable } from '@/components/dashboard/Card';
import KpiTile from '@/components/dashboard/KpiTile';
import PageControls from '@/components/dashboard/PageControls';
import StackedBarChart from '@/components/dashboard/StackedBarChart';
import { isConfigured } from '@/lib/dashboard/db';
import { ago, dateLabel, num, share, tsh } from '@/lib/dashboard/format';
import { parsePageParams } from '@/lib/dashboard/params';
import { health } from '@/lib/dashboard/queries/overview';
import { alaCarte, comboUsage, discountKpis, discountSourceWeekly, promoUsage, subtotalHistogram } from '@/lib/dashboard/queries/promotions';
import { splitIds, truthy } from '@/lib/order/catalog';
import { getServerCatalog } from '@/lib/order/serverCatalog';

export const metadata = { title: 'Promotions' };
export const dynamic = 'force-dynamic';

async function settle(promise, fallback = null) {
  try { return { value: await promise, error: null }; } catch (error) {
    console.error('[dashboard/promotions]', error.message);
    return { value: fallback, error: error.message };
  }
}

/**
 * The Sheet catalogue (promo / combo / tier configuration) comes from Apps
 * Script, which takes 4–6 s and retries for up to a minute when it misbehaves.
 * The page must not wait for that: give it a few seconds, otherwise render
 * usage-only and let the shared cache warm up for the next visit.
 */
function catalogWithin(ms) {
  if (!process.env.CATALOG_API_URL) return Promise.resolve(null);
  return Promise.race([
    getServerCatalog().then((r) => r.catalog).catch(() => null),
    new Promise((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

const SOURCES = [
  { key: 'tier', name: 'Spend tier', color: '#53B175' },
  { key: 'auto_promo', name: 'Auto promo', color: '#2F6FB5' },
  { key: 'promo_code', name: 'Typed code', color: '#3B8B5A' },
  { key: 'unverified', name: 'Unverified', color: '#F3603F' },
  { key: 'unknown', name: 'Code unknown (pre-Sep 2026)', color: '#B3B3B3' },
  { key: 'none', name: 'No discount', color: '#E5E5E5' },
];

export default async function PromotionsPage({ searchParams }) {
  const sp = (await searchParams) ?? {};
  if (!isConfigured()) return <Card title="Dashboard database not configured" />;
  const now = new Date();
  const { period } = parsePageParams(sp, { now });

  const [kpi, kpiPrev, usage, sources, hist, combos, cat, hlth] = await Promise.all([
    settle(discountKpis(period.start, period.end), null),
    settle(discountKpis(period.compareStart, period.compareEnd), null),
    settle(promoUsage(period.start, period.end), { used: [], refused: [] }),
    settle(discountSourceWeekly(12, now), []),
    settle(subtotalHistogram(period.start, period.end, 5000), []),
    settle(comboUsage(period.start, period.end), []),
    settle(catalogWithin(6000), null),
    settle(health(), { snapshots: {} }),
  ]);

  const catalog = cat.value || {};
  const promoConfig = (catalog.promo_codes || []).map((p) => ({
    code: String(p.code || '').trim().toUpperCase(), label: p.label || '', active: truthy(p.active), autoApply: truthy(p.auto_apply),
    minimumSpend: Number(p.minimum_spend) || 0, amountOff: Number(p.amount_off) || 0,
  }));
  const usedByCode = Object.fromEntries((usage.value.used || []).map((u) => [u.code, u]));
  const refusedByCode = Object.fromEntries((usage.value.refused || []).filter((r) => r.code).map((r) => [r.code, r]));
  const codes = [...new Set([...promoConfig.map((p) => p.code), ...Object.keys(usedByCode), ...Object.keys(refusedByCode)])];
  const promoRows = codes.map((code) => ({ code, config: promoConfig.find((p) => p.code === code), used: usedByCode[code], refused: refusedByCode[code] }))
    .sort((a, b) => (b.used?.orders ?? 0) - (a.used?.orders ?? 0));

  const tiers = (catalog.discount_tiers || []).map((t) => ({ id: t.id, label: t.label || '', minSpend: Number(t.min_spend) || 0, percentOff: Number(t.percent_off) || 0, active: truthy(t.is_active) }));
  const histRows = (hist.value || []).map((h) => ({ label: `TSH ${num(h.bucket)}–${num(h.bucket + 5000)}`, value: h.orders }));

  const comboConfig = (catalog.combos || []).map((c) => ({ id: String(c.id || '').trim(), name: c.name || '', price: Number(c.combo_price ?? c.price) || 0, original: c.original_price == null ? null : Number(c.original_price), active: truthy(c.is_active), productIds: splitIds(c.product_ids) }));
  const usageByCombo = Object.fromEntries((combos.value || []).map((c) => [c.combo_id, c]));
  const comboIds = [...new Set([...comboConfig.map((c) => c.id), ...Object.keys(usageByCombo)])];
  const alaCarteCounts = await Promise.all(comboIds.map((id) => {
    const cfg = comboConfig.find((c) => c.id === id);
    return cfg?.productIds?.length ? alaCarte([...new Set(cfg.productIds)], period.start, period.end).catch(() => ({ orders: null })) : Promise.resolve({ orders: null });
  }));
  const comboRows = comboIds.map((id, i) => ({ id, config: comboConfig.find((c) => c.id === id), used: usageByCombo[id], alaCarte: alaCarteCounts[i]?.orders ?? null }))
    .sort((a, b) => (b.used?.orders ?? 0) - (a.used?.orders ?? 0));

  const sanity = (hlth.value.snapshots?.catalog_checks?.payload?.issues || []).filter((i) => !i.kind.startsWith('item_'));
  const sourceData = (sources.value || []).map((w) => ({ label: dateLabel(w.week).slice(4), ...w }));
  const o = kpi.value?.orders; const op = kpiPrev.value?.orders; const inv = kpi.value?.invoices; const invp = kpiPrev.value?.invoices;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Promotions, discounts and combos</h1>
          <p className="text-xs text-shop-text-secondary">{period.label} · {dateLabel(period.start)} – {dateLabel(period.end)}. Discount amounts are invoice truth; which code earned them is known from our own orders since 3 Sep 2026.</p>
        </div>
        <PageControls period={period} channelKey="all" showChannel={false} />
      </div>

      {kpi.error || !kpi.value ? <Unavailable what="KPIs" reason={kpi.error} /> : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <KpiTile label="Discount given" value={inv.discount} previous={invp?.discount} compareLabel={period.compareLabel} polarity="down" sub={`${share(inv.discounted, inv.invoices)} of invoices · from invoices`} />
          <KpiTile label="Discount cost" value={inv.sales ? Math.round((inv.discount / (inv.sales + inv.discount)) * 1000) / 10 : 0} format="num" polarity="down" sub="% of gross sales" />
          <KpiTile label="Orders with a promo" value={o.promo_orders} previous={op?.promo_orders} compareLabel={period.compareLabel} format="num" sub={`${share(o.promo_orders, o.orders)} of ${num(o.orders)} online orders`} />
          <KpiTile label="Promo cost" value={o.promo_cost} previous={op?.promo_cost} compareLabel={period.compareLabel} polarity="down" sub="online orders, recorded codes" />
          <KpiTile label="Avg order with promo" value={o.aiv_with_promo} sub={`vs ${tsh(o.aiv_without, { compact: true })} without`} />
          <KpiTile label="Orders with a combo" value={o.combo_orders} previous={op?.combo_orders} compareLabel={period.compareLabel} format="num" sub={`${share(o.combo_orders, o.orders)} attach rate`} />
        </div>
      )}

      <Card title="Promo codes" subtitle={cat.value ? 'Configuration from the Sheet, usage from our orders' : 'Sheet catalogue did not answer within 6 s — usage only; reload in a moment for the configuration columns'}>
        {promoRows.length === 0 ? <Empty>No promo codes configured or used.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Code</th><th className="py-1 pr-3">Status</th><th className="py-1 pr-3 text-right">Min spend</th><th className="py-1 pr-3 text-right">Amount off</th><th className="py-1 pr-3 text-right">Orders</th><th className="py-1 pr-3 text-right">Ordered value</th><th className="py-1 pr-3 text-right">Cost</th><th className="py-1 pr-3">Used</th><th className="py-1">Refused</th></tr></thead>
              <tbody>
                {promoRows.map((r) => (
                  <tr key={r.code} className="border-t border-shop-border dark:border-[#2E352E]">
                    <td className="py-1.5 pr-3 font-medium">{r.code}{r.config?.label ? <span className="ml-1 text-xs font-normal text-shop-text-secondary">{r.config.label}</span> : null}</td>
                    <td className="py-1.5 pr-3 text-xs">{r.config ? `${r.config.active ? 'active' : 'inactive'}${r.config.autoApply ? ' · auto-apply' : ''}` : 'not in Sheet'}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{r.config ? tsh(r.config.minimumSpend) : ''}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{r.config ? tsh(r.config.amountOff) : ''}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{num(r.used?.orders ?? 0)}{r.used?.auto_applied ? <span className="block text-[11px] text-shop-text-secondary">{r.used.auto_applied} auto</span> : null}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{r.used ? tsh(r.used.ordered_value) : ''}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{r.used ? tsh(r.used.cost) : ''}</td>
                    <td className="py-1.5 pr-3 text-xs text-shop-text-secondary">{r.used ? `${dateLabel(String(r.used.first_used).slice(0, 10))} – ${ago(`${r.used.last_used}Z`)}` : ''}</td>
                    <td className="py-1.5 text-xs text-shop-text-secondary">{r.refused ? `${r.refused.refused} (${r.refused.reasons})` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="How discounts are earned" subtitle="Accepted online orders per week by discount source, last 12 weeks">
          {sources.error ? <Unavailable what="Sources" reason={sources.error} /> : <StackedBarChart data={sourceData} series={SOURCES} />}
        </Card>
        <Card title="Spend tiers" subtitle={tiers.length ? `Thresholds: ${tiers.map((t) => `${tsh(t.minSpend, { compact: true })} → ${t.percentOff}%${t.active ? '' : ' (inactive)'}`).join(' · ')}` : 'No spend tiers in the Sheet'}>
          <p className="mb-2 text-xs text-shop-text-secondary">Where online order subtotals fall (TSH 5,000 buckets) — a tier threshold just above a busy bucket is money left on the table, one just below it is a discount everybody gets.</p>
          {hist.error ? <Unavailable what="Histogram" reason={hist.error} /> : <Bars rows={histRows} format={(v) => `${num(v)} orders`} max={20} />}
        </Card>
      </div>

      <Card title="Combos" subtitle="From our order lines; the ERP has no idea which lines were a bundle">
        {comboRows.length === 0 ? <Empty>No combos configured or sold.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Combo</th><th className="py-1 pr-3">Status</th><th className="py-1 pr-3 text-right">Price</th><th className="py-1 pr-3 text-right">Orders</th><th className="py-1 pr-3 text-right">Ordered value</th><th className="py-1 pr-3">Last sold</th><th className="py-1">Components bought à la carte</th></tr></thead>
              <tbody>
                {comboRows.map((r) => (
                  <tr key={r.id} className="border-t border-shop-border dark:border-[#2E352E]">
                    <td className="py-1.5 pr-3">{r.config?.name || r.id} <span className="text-xs text-shop-text-secondary">{r.id}</span></td>
                    <td className="py-1.5 pr-3 text-xs">{r.config ? (r.config.active ? 'active' : 'inactive') : 'not in Sheet'}{!r.used && r.config?.active ? <span className="ml-1 text-shop-warning">never sold in period</span> : null}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{r.config ? `${tsh(r.config.price)}${r.config.original ? ` (was ${tsh(r.config.original)})` : ''}` : ''}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{num(r.used?.orders ?? 0)}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{r.used ? tsh(r.used.ordered_value) : ''}</td>
                    <td className="py-1.5 pr-3 text-xs">{r.used ? ago(`${r.used.last_sold}Z`) : ''}</td>
                    <td className="py-1.5 text-xs text-shop-text-secondary">{r.alaCarte === null ? '' : `${num(r.alaCarte)} orders bought a component without the combo`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Promo configuration checks" subtitle="From the backend's catalogue checks">
        {sanity.length === 0 ? <Empty>Nothing to flag.</Empty> : (
          <ul className="space-y-1 text-sm">{sanity.map((i, idx) => <li key={idx}>{i.kind.replace(/_/g, ' ')}: {i.code || i.tier} {i.minimum_spend ? `(min spend ${tsh(i.minimum_spend)} vs median basket ${tsh(i.median_subtotal)})` : ''}{i.amount_off ? `(${tsh(i.amount_off)} off vs median basket ${tsh(i.median_subtotal)})` : ''}{i.percent_off !== undefined ? `(${i.percent_off}%)` : ''}</li>)}</ul>
        )}
      </Card>
    </div>
  );
}
