'use client';

import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import { tsh } from '@/lib/dashboard/format';

// Formatters are chosen by name: functions cannot cross the server → client
// boundary, and every chart on the dashboard needs one of these three anyway.
const FORMATS = {
  int: (v) => Math.round(Number(v) || 0).toLocaleString('en-US'),
  tsh: (v) => tsh(v),
  pct: (v) => `${Math.round((Number(v) || 0) * 100)}%`,
};

/**
 * Generic stacked bars: `data` rows with a `label` and one numeric field per
 * key in `series` ([{key, name, color}]). `percent` normalises each bar to
 * 100%. Used for attempts by outcome, order status by day, channel share.
 */
export default function StackedBarChart({ data, series, height = 220, valueFormat = 'int', percent = false }) {
  if (!data?.length) return null;
  const fmt = FORMATS[valueFormat] || FORMATS.int;
  const tickEvery = Math.max(1, Math.round(data.length / 8));
  return (
    <div style={{ height }} className="w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} stackOffset={percent ? 'expand' : 'none'}>
          <CartesianGrid strokeDasharray="2 4" stroke="currentColor" strokeOpacity={0.12} vertical={false} />
          <XAxis dataKey="label" interval={0} tickFormatter={(v, i) => (i % tickEvery === 0 ? v : '')} tick={{ fill: 'currentColor', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'currentColor', fontSize: 11 }} axisLine={false} tickLine={false} width={44} tickFormatter={percent ? (v) => `${Math.round(v * 100)}%` : valueFormat === 'tsh' ? (v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}k`) : undefined} />
          <Tooltip cursor={{ fill: 'currentColor', fillOpacity: 0.05 }} contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(value, name) => [fmt(value), name]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} stackId="s" fill={s.color} radius={i === series.length - 1 ? [3, 3, 0, 0] : 0} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
