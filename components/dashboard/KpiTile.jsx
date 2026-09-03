import Link from 'next/link';

import { delta as computeDelta, num, tsh } from '@/lib/dashboard/format';

/**
 * Big number, delta vs the comparison period, one line of context.
 * `polarity` says which direction is good ('up' for sales, 'down' for
 * failures); the badge colour follows it, never the arrow alone.
 */
export default function KpiTile({
  label, value, previous, compareLabel, sub, polarity = 'up', format = 'tsh', href, tone,
}) {
  const shown = format === 'tsh' ? tsh(value, { compact: true }) : num(value);
  const full = format === 'tsh' ? tsh(value) : num(value);
  const d = previous === undefined ? null : computeDelta(value, previous, polarity);
  const badge = d && d.direction !== 'flat'
    ? (d.good ? 'bg-shop-primary/15 text-shop-primary-dark dark:text-shop-primary-light' : 'bg-shop-error/10 text-shop-error')
    : 'bg-shop-surface-alt text-shop-text-secondary dark:bg-[#252A25]';
  const body = (
    <div
      className={`flex h-full flex-col rounded-shop-md border border-shop-border bg-shop-surface p-4 shadow-sm
                  dark:border-[#2E352E] dark:bg-[#1A1E1A] ${tone === 'warning' ? 'border-l-4 border-l-shop-warning' : ''}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-shop-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums" title={full}>{shown}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {d && (
          <span className={`rounded-full px-2 py-0.5 font-medium ${badge}`} title={compareLabel}>
            {d.text}
          </span>
        )}
        {compareLabel && d && <span className="text-shop-text-secondary">{compareLabel}</span>}
      </div>
      {sub && <p className="mt-auto pt-2 text-xs text-shop-text-secondary">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="block h-full">{body}</Link> : body;
}
