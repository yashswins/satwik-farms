import { pct, tsh } from '@/lib/dashboard/format';

/** Horizontal bars with share, for category / item breakdowns. Server component. */
export default function Bars({ rows, labelKey = 'label', valueKey = 'value', total, max = 12, format = tsh, subKey }) {
  const shown = rows.slice(0, max);
  const sum = total ?? rows.reduce((s, r) => s + (Number(r[valueKey]) || 0), 0);
  const top = Math.max(...shown.map((r) => Number(r[valueKey]) || 0), 1);
  if (shown.length === 0) return <p className="py-6 text-center text-sm text-shop-text-secondary">Nothing to show for this period.</p>;
  return (
    <ul className="space-y-2 text-sm">
      {shown.map((r) => {
        const v = Number(r[valueKey]) || 0;
        return (
          <li key={r[labelKey]}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate">{r[labelKey]}{subKey && r[subKey] ? <span className="ml-1 text-xs text-shop-text-secondary">{r[subKey]}</span> : null}</span>
              <span className="shrink-0 tabular-nums text-shop-text-secondary">{format(v)} · {sum ? pct(v / sum, 0) : '–'}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-shop-surface-alt dark:bg-[#252A25]">
              <div className="h-1.5 rounded-full bg-shop-primary" style={{ width: `${(v / top) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
