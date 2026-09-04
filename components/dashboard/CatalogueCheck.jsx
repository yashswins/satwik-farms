import Link from 'next/link';

import Card from '@/components/dashboard/Card';
import { ago, num, tsh } from '@/lib/dashboard/format';

const KIND = {
  item_missing_in_erp: { label: 'Not in Accu360', tone: 'critical', why: 'Any cart with it is rejected at checkout' },
  item_disabled_in_erp: { label: 'Disabled in Accu360', tone: 'critical', why: 'Any cart with it is rejected at checkout' },
  item_no_sku: { label: 'No SKU on the Sheet', tone: 'warning', why: 'Cannot be ordered' },
  price_drift_online: { label: 'App price ≠ Sheet', tone: 'warning', why: 'App orders invoiced at a different rate' },
  price_drift_offline: { label: 'Staff price ≠ Sheet', tone: 'info', why: 'Offline invoices charge a different rate' },
};
const TONE = {
  critical: 'bg-shop-error/10 text-shop-error',
  warning: 'bg-shop-warning/10 text-shop-warning',
  info: 'bg-shop-surface-alt text-shop-text-secondary dark:bg-[#252A25]',
};

/**
 * Sheet vs Accu360, as a table, from the backend's last catalogue check.
 * Sits high on the Overview because a product that is live on the Sheet but
 * missing or disabled in Accu360 rejects every cart containing it — the
 * 2026-08-03 lost-order cause.
 */
export default function CatalogueCheck({ snapshot }) {
  const payload = snapshot?.payload || null;
  const rows = (payload?.issues || []).filter((i) => KIND[i.kind]);
  const order = { critical: 0, warning: 1, info: 2 };
  rows.sort((a, b) => order[KIND[a.kind].tone] - order[KIND[b.kind].tone] || String(a.name).localeCompare(String(b.name)));
  const checkedAt = snapshot?.taken_at ? ago(`${snapshot.taken_at}Z`) : null;
  const subtitle = payload
    ? `${num(payload.checked_products)} active Sheet products checked ${checkedAt} against the Accu360 item list and the last ${payload.price_drift_days ?? 14} days of invoices`
    : 'No check has run yet';
  const critical = rows.filter((r) => KIND[r.kind].tone === 'critical').length;

  return (
    <Card title={critical ? `Sheet vs Accu360: ${num(critical)} product${critical === 1 ? '' : 's'} will reject orders` : 'Sheet vs Accu360'} subtitle={subtitle} href="/dashboard/products" hrefLabel="Products">
      {!payload ? <p className="text-sm text-shop-text-secondary">Waiting for the backend's first catalogue check.</p>
        : rows.length === 0 ? (
          <p className="text-sm text-shop-primary-dark dark:text-shop-primary-light">All clear: every active product on the Sheet exists and is enabled in Accu360, and invoiced prices match the Sheet within {payload.price_drift_tolerance_pct ?? 5}%.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-shop-text-secondary"><tr><th className="py-1 pr-3">Product</th><th className="py-1 pr-3">SKU</th><th className="py-1 pr-3">Problem</th><th className="py-1 pr-3">Sheet</th><th className="py-1 pr-3">Invoiced</th><th className="py-1">Effect</th></tr></thead>
              <tbody>
                {rows.map((r, i) => {
                  const k = KIND[r.kind];
                  return (
                    <tr key={`${r.kind}-${r.sku || r.name}-${i}`} className="border-t border-shop-border dark:border-[#2E352E]">
                      <td className="py-1.5 pr-3 font-medium">{r.name || r.sku}</td>
                      <td className="py-1.5 pr-3 text-xs">{r.sku ? <Link href={`/dashboard/products/${encodeURIComponent(r.sku)}`} className="hover:underline">{r.sku}</Link> : <span className="text-shop-text-secondary">—</span>}</td>
                      <td className="py-1.5 pr-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE[k.tone]}`}>{k.label}</span></td>
                      <td className="py-1.5 pr-3 text-xs tabular-nums">{r.sheet_price !== undefined ? `${tsh(r.sheet_price)} / ${r.unit}` : (r.in_stock === false ? 'out of stock' : 'in stock')}</td>
                      <td className="py-1.5 pr-3 text-xs tabular-nums">{r.invoiced_rate !== undefined ? `${tsh(r.invoiced_rate)} per stock unit (${r.drift_pct > 0 ? '+' : ''}${r.drift_pct}%, ${r.lines} lines) vs ${tsh(r.expected_rate)} expected` : ''}</td>
                      <td className="py-1.5 text-xs text-shop-text-secondary">{k.why}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </Card>
  );
}
