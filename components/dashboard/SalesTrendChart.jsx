'use client';

import {
  Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

import { CHANNEL_COLORS, shortDate, tsh } from '@/lib/dashboard/format';

/**
 * Daily sales as stacked bars (online / offline) behind a 7-day average line.
 * Client component only because Recharts renders in the browser; the data is
 * already computed server-side.
 */
export default function SalesTrendChart({ series }) {
  if (!series?.length) return null;
  const data = series.map((d) => ({
    ...d,
    offline: Math.max(0, d.sales - d.online),
    weekend: [0, 6].includes(new Date(`${d.date}T00:00:00Z`).getUTCDay()),
  }));
  const tickEvery = Math.max(1, Math.round(data.length / 6));
  return (
    <div className="h-64 w-full text-xs">
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
            tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}k`)}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            cursor={{ fill: 'currentColor', fillOpacity: 0.05 }}
            contentStyle={{ borderRadius: 12, fontSize: 12 }}
            formatter={(value, name) => [tsh(value), name]}
            labelFormatter={(label) => shortDate(label)}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="online" name="Online" stackId="s" fill={CHANNEL_COLORS.app} radius={[0, 0, 0, 0]} />
          <Bar dataKey="offline" name="Offline" stackId="s" fill={CHANNEL_COLORS.offline} radius={[3, 3, 0, 0]} />
          <Line dataKey="avg7" name="7-day average" type="monotone" stroke="#1B2E1B" strokeWidth={2} dot={false} strokeOpacity={0.7} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
