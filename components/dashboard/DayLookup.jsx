'use client';

import { useRouter } from 'next/navigation';

import DateRangePicker from '@/components/dashboard/DateRangePicker';

/** On the Overview: pick a day or a range and land on the Sales page for it. */
export default function DayLookup({ today }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2 text-xs text-shop-text-secondary">
      <span className="hidden sm:inline">Sales for a day or range:</span>
      <DateRangePicker
        start={today}
        end={today}
        today={today}
        compact
        label="Look up sales for a day or range"
        onApply={(from, to) => router.push(`/dashboard/sales?period=custom&from=${from}&to=${to}`)}
      />
    </div>
  );
}
