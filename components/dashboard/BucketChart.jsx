'use client';

import {
  Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import { CHANNEL_COLORS, CHANNEL_LABELS, shortDate, tsh } from '@/lib/dashboard/format';

function fmtY(v) {
  return v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}k`;
}

function labelFor(bucket, granularity) {
  if (granularity === 'month') return bucket.slice(0, 7);
  return shortDate(bucket);
}

/**
 * Sales per bucket. mode 'channel' stacks App / Web / Online (unsplit) /
 * Offline; mode 'total' shows one bar with the comparison period as a faint
 * line aligned by position (bucket 1 vs bucket 1).
 */
export default function BucketChart({ series, compare = null, granularity = 'day', mode = 'channel', height = 260 }) {
  if (!series?.length) return null;
  const data = series.map((d, i) => ({
    ...d,
    label: labelFor(d.bucket, granularity),
    previous: compare?.[i]?.sales ?? null,
  }));
  const tickEvery = Math.max(1, Math.round(data.length / 8));
  return (
    <div style={{ height }} className="w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="currentColor" strokeOpacity={0.12} vertical={false} />
          <XAxis dataKey="label" interval={0} tickFormatter={(v, i) => (i % tickEvery === 0 ? v : '')} tick={{ fill: 'currentColor', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtY} tick={{ fill: 'currentColor', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
          <Tooltip cursor={{ fill: 'currentColor', fillOpacity: 0.05 }} contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(value, name) => [tsh(value), name]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {mode === 'channel' ? (
            ['app', 'web', 'online_unsplit', 'offline'].map((c, idx, arr) => (
              <Bar key={c} dataKey={c} name={CHANNEL_LABELS[c]} stackId="s" fill={CHANNEL_COLORS[c]} radius={idx === arr.length - 1 ? [3, 3, 0, 0] : 0} />
            ))
          ) : (
            <Bar dataKey="sales" name="Sales" fill={CHANNEL_COLORS.app} radius={[3, 3, 0, 0]} />
          )}
          {compare && <Line dataKey="previous" name="Previous period" type="monotone" stroke="#7C7C7C" strokeWidth={2} strokeDasharray="4 3" dot={false} />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
