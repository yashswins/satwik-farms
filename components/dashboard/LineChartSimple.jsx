'use client';

import {
  CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import { tsh } from '@/lib/dashboard/format';

const FORMATS = {
  int: { value: (v) => Math.round(Number(v) || 0).toLocaleString('en-US'), axis: undefined },
  tsh: { value: (v) => tsh(v), axis: (v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}k`) },
  pct: { value: (v) => (v === null || v === undefined ? '–' : `${Math.round(Number(v) * 100)}%`), axis: (v) => `${Math.round(v * 100)}%` },
};

/** One or more lines over labelled points; optional horizontal reference lines. */
export default function LineChartSimple({ data, series, height = 200, valueFormat = 'int', references = [], yDomain }) {
  if (!data?.length) return null;
  const fmt = FORMATS[valueFormat] || FORMATS.int;
  const tickEvery = Math.max(1, Math.round(data.length / 8));
  return (
    <div style={{ height }} className="w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="currentColor" strokeOpacity={0.12} vertical={false} />
          <XAxis dataKey="label" interval={0} tickFormatter={(v, i) => (i % tickEvery === 0 ? v : '')} tick={{ fill: 'currentColor', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'currentColor', fontSize: 11 }} axisLine={false} tickLine={false} width={44} tickFormatter={fmt.axis} domain={yDomain} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(value, name) => [fmt.value(value), name]} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {references.map((r) => <ReferenceLine key={r.y} y={r.y} stroke={r.color || '#F3603F'} strokeDasharray="4 3" label={{ value: r.label, fontSize: 10, fill: r.color || '#F3603F', position: 'insideTopRight' }} />)}
          {series.map((s) => <Line key={s.key} dataKey={s.key} name={s.name} type="monotone" stroke={s.color} strokeWidth={2} dot={false} connectNulls />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
