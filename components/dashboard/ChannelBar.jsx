import Link from 'next/link';

import { CHANNEL_COLORS, CHANNEL_LABELS, pct, tsh } from '@/lib/dashboard/format';
import { Empty } from '@/components/dashboard/Card';

const ORDER = ['app', 'web', 'online_unsplit', 'offline'];

/** One stacked bar of sales by channel, with a legend of values and shares. */
export default function ChannelBar({ rows, total, linkBase = '/dashboard/channels' }) {
  if (!total) return <Empty>No invoices in this period.</Empty>;
  const byChannel = Object.fromEntries(rows.map((r) => [r.channel, r]));
  const segments = ORDER.filter((c) => byChannel[c]?.sales > 0).map((c) => ({
    channel: c, sales: byChannel[c].sales, invoices: byChannel[c].invoices, share: byChannel[c].sales / total,
  }));
  return (
    <div>
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-shop-surface-alt dark:bg-[#252A25]" role="img"
           aria-label={segments.map((s) => `${CHANNEL_LABELS[s.channel]} ${pct(s.share, 0)}`).join(', ')}>
        {segments.map((s) => (
          <Link
            key={s.channel}
            href={`${linkBase}?channel=${s.channel}`}
            title={`${CHANNEL_LABELS[s.channel]}: ${tsh(s.sales)} (${pct(s.share, 0)})`}
            style={{ width: `${s.share * 100}%`, backgroundColor: CHANNEL_COLORS[s.channel] }}
            className="h-full transition hover:opacity-80"
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        {segments.map((s) => (
          <li key={s.channel} className="flex items-start gap-2">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: CHANNEL_COLORS[s.channel] }} />
            <div className="min-w-0">
              <p className="font-medium">{CHANNEL_LABELS[s.channel]} <span className="text-shop-text-secondary">{pct(s.share, 0)}</span></p>
              <p className="text-xs text-shop-text-secondary tabular-nums">{tsh(s.sales)} · {s.invoices} inv.</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
