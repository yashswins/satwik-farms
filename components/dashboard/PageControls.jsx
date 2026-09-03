'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { CHANNEL_FILTERS } from '@/lib/dashboard/params';
import { PERIOD_KEYS, PERIOD_LABELS } from '@/lib/dashboard/periods';

/**
 * Period picker + channel filter, kept in the URL so a view can be shared by
 * link and the back button works. Changing either resets pagination.
 */
export default function PageControls({ period, channelKey, showChannel = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [custom, setCustom] = useState({ from: period.start, to: period.end });

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
        onChange={(e) => push({ period: e.target.value, from: e.target.value === 'custom' ? custom.from : undefined, to: e.target.value === 'custom' ? custom.to : undefined })}
        className="rounded-shop-sm border border-shop-border bg-shop-surface px-2 py-1.5 dark:border-[#2E352E] dark:bg-[#1A1E1A]"
      >
        {PERIOD_KEYS.map((k) => <option key={k} value={k}>{PERIOD_LABELS[k]}</option>)}
      </select>

      {period.key === 'custom' && (
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => { e.preventDefault(); push({ period: 'custom', from: custom.from, to: custom.to }); }}
        >
          <input type="date" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} className="rounded-shop-sm border border-shop-border bg-shop-surface px-2 py-1 text-xs dark:border-[#2E352E] dark:bg-[#1A1E1A]" aria-label="From" />
          <span className="text-xs text-shop-text-secondary">to</span>
          <input type="date" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} className="rounded-shop-sm border border-shop-border bg-shop-surface px-2 py-1 text-xs dark:border-[#2E352E] dark:bg-[#1A1E1A]" aria-label="To" />
          <button type="submit" className="rounded-shop-sm bg-shop-primary px-2 py-1 text-xs font-medium text-white">Apply</button>
        </form>
      )}

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
