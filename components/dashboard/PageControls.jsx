'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import DateRangePicker from '@/components/dashboard/DateRangePicker';
import { CHANNEL_FILTERS } from '@/lib/dashboard/params';
import { PERIOD_KEYS, PERIOD_LABELS } from '@/lib/dashboard/periods';

/**
 * Period presets, a calendar for any day or range, and the channel filter —
 * all kept in the URL so a view can be shared by link and the back button
 * works. Changing any of them resets pagination.
 */
export default function PageControls({ period, channelKey, today, showChannel = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  function push(overrides) {
    const params = new URLSearchParams(search.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === null || v === '' || v === 'all' || (k === 'period' && v === 'mtd')) params.delete(k);
      else params.set(k, v);
    }
    params.delete('page');
    if (params.get('period') !== 'custom') {
      params.delete('from');
      params.delete('to');
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label className="sr-only" htmlFor="period">Period</label>
      <select
        id="period"
        value={period.key}
        onChange={(e) => push({ period: e.target.value, from: e.target.value === 'custom' ? period.start : undefined, to: e.target.value === 'custom' ? period.end : undefined })}
        className="rounded-shop-sm border border-shop-border bg-shop-surface px-2 py-1.5 dark:border-[#2E352E] dark:bg-[#1A1E1A]"
      >
        {PERIOD_KEYS.map((k) => <option key={k} value={k}>{PERIOD_LABELS[k]}</option>)}
      </select>

      <DateRangePicker
        start={period.start}
        end={period.end}
        today={today || period.end}
        onApply={(from, to) => push({ period: 'custom', from, to })}
      />

      {showChannel && (
        <div role="group" aria-label="Channel" className="flex overflow-hidden rounded-shop-sm border border-shop-border dark:border-[#2E352E]">
          {Object.entries(CHANNEL_FILTERS).map(([key, f]) => (
            <button
              key={key}
              type="button"
              onClick={() => push({ channel: key })}
              aria-pressed={channelKey === key}
              className={`px-2.5 py-1.5 text-xs font-medium transition ${
                channelKey === key ? 'bg-shop-primary text-white' : 'bg-shop-surface text-shop-text-secondary hover:bg-shop-surface-alt dark:bg-[#1A1E1A] dark:hover:bg-[#252A25]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
