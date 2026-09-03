import Link from 'next/link';

import { ago } from '@/lib/dashboard/format';

const DOT = {
  ok: 'bg-shop-primary',
  warn: 'bg-shop-warning',
  bad: 'bg-shop-error',
  unknown: 'bg-shop-text-tertiary',
};

/**
 * One dot per component, derived from the latest health snapshot and the
 * mirror's sync state. Every dot says when it was last checked.
 */
export function deriveStatus({ health, funnelConfigured, funnelEventsToday, now = Date.now() }) {
  const snap = health?.snapshots?.health;
  const p = snap?.payload || {};
  const snapAge = snap?.taken_at ? (now - Date.parse(`${snap.taken_at}Z`)) / 60000 : Infinity;
  const inv = health?.sync?.find((s) => s.step === 'invoices');
  const invAge = inv?.last_ok_at ? (now - Date.parse(`${inv.last_ok_at}Z`)) / 60000 : Infinity;

  return [
    {
      key: 'backend', label: 'Backend',
      state: snapAge < 30 ? 'ok' : snapAge < 120 ? 'warn' : 'bad',
      text: snap ? `checked ${ago(`${snap.taken_at}Z`, now)}${p.uptime_seconds ? ` · up ${Math.round(p.uptime_seconds / 3600)} h` : ''}` : 'no health snapshot yet',
    },
    {
      key: 'accu360', label: 'Accu360',
      state: !snap ? 'unknown' : p.accu360?.ok ? (p.accu360.latency_ms > 5000 ? 'warn' : 'ok') : 'bad',
      text: p.accu360 ? (p.accu360.ok ? `${p.accu360.latency_ms} ms` : 'not answering') : '—',
    },
    {
      key: 'catalog', label: 'Catalogue feed',
      state: !snap ? 'unknown' : !p.catalog?.configured ? 'warn' : p.catalog.age_seconds === null ? 'bad' : p.catalog.age_seconds > 1800 ? 'warn' : 'ok',
      text: p.catalog?.configured ? (p.catalog.age_seconds === null ? 'not loaded' : `${p.catalog.products} products · ${Math.round(p.catalog.age_seconds / 60)} min old`) : 'not configured',
    },
    {
      key: 'mirror', label: 'Invoice mirror',
      state: invAge < 30 ? 'ok' : invAge < 120 ? 'warn' : 'bad',
      text: inv?.last_ok_at ? `synced ${ago(`${inv.last_ok_at}Z`, now)}` : 'never',
    },
    {
      key: 'funnel', label: 'Funnel beacon',
      state: !funnelConfigured ? 'unknown' : funnelEventsToday > 0 ? 'ok' : 'warn',
      text: !funnelConfigured ? 'not configured here' : `${funnelEventsToday} events today`,
    },
  ];
}

export default function StatusDots({ items }) {
  return (
    <Link href="/dashboard/issues" className="block">
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
        {items.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${DOT[s.state]}`} aria-hidden />
            <span className="font-medium">{s.label}</span>
            <span className="text-shop-text-secondary">{s.text}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
