'use client';

import {
  Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

import { CHANNEL_COLORS, dateLabel, shortDate, tsh } from '@/lib/dashboard/format';

const num = (v) => Math.round(Number(v) || 0).toLocaleString('en-US');

/**
 * Daily series as stacked bars (online / offline) behind a 7-day average
 * line. mode 'sales' plots money; mode 'orders' plots invoice counts with the
 * number of app/web orders placed that day as a second line.
 *
 * The tooltip leads with the day's TOTAL — the owner's first question — and
 * only then the split, the average and the orders placed.
 */
export default function SalesTrendChart({ series, mode = 'sales', height = 256 }) {
  if (!series?.length) return null;
  const isSales = mode === 'sales';
  const data = series.map((d) => (isSales
    ? { ...d, total: d.sales, offline: Math.max(0, d.sales - d.online), onlinePart: d.online }
    : { ...d, total: d.invoices, offline: Math.max(0, d.invoices - (d.online_invoices || 0)), onlinePart: d.online_invoices || 0, avg: d.avg7_invoices }
  ));
  const fmt = isSales ? tsh : num;
  const tickEvery = Math.max(1, Math.round(data.length / 6));

  function TrendTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="rounded-xl border border-shop-border bg-shop-surface px-3 py-2 text-xs shadow-lg dark:border-[#2E352E] dark:bg-[#1A1E1A]">
        <p className="font-semibold">{dateLabel(label)}</p>
        <p className="mt-1 text-sm font-semibold">{isSales ? 'Sales' : 'Invoices'}: {fmt(d.total)}</p>
        <p style={{ color: CHANNEL_COLORS.app }}>Online: {fmt(d.onlinePart)}</p>
        <p style={{ color: CHANNEL_COLORS.offline }}>Offline: {fmt(d.offline)}</p>
        {isSales
          ? <p className="text-shop-text-secondary">{num(d.invoices)} invoices · 7-day avg {fmt(d.avg7)}</p>
          : <p className="text-shop-text-secondary">{num(d.placed)} app/web orders placed · 7-day avg {num(d.avg)}</p>}
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="currentColor" strokeOpacity={0.12} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v, i) => (i % tickEvery === 0 ? shortDate(v) : '')}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tickFormatter={(v) => (isSales ? (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}k`) : num(v))}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip cursor={{ fill: 'currentColor', fillOpacity: 0.05 }} content={<TrendTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="onlinePart" name="Online" stackId="s" fill={CHANNEL_COLORS.app} />
          <Bar dataKey="offline" name="Offline" stackId="s" fill={CHANNEL_COLORS.offline} radius={[3, 3, 0, 0]} />
          <Line dataKey={isSales ? 'avg7' : 'avg'} name="7-day average" type="monotone" stroke="#1B2E1B" strokeWidth={2} dot={false} strokeOpacity={0.7} />
          {!isSales && <Line dataKey="placed" name="App/web orders placed" type="monotone" stroke="#2F6FB5" strokeWidth={2} dot={false} />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
