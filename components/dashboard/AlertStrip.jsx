import Link from 'next/link';

const STYLES = {
  critical: 'border-shop-error bg-shop-error/10 text-shop-error',
  warning: 'border-shop-warning bg-shop-warning/10 text-shop-warning',
  info: 'border-shop-border bg-shop-surface-alt text-shop-text-secondary dark:bg-[#252A25]',
};

/**
 * Open alerts and incidents, critical first. Renders nothing when quiet —
 * an empty green banner would train people to ignore the space.
 */
export default function AlertStrip({ alerts = [], incidents = [], compact = false }) {
  const items = [
    ...incidents.map((i) => ({
      id: `incident-${i.id}`, severity: i.severity || 'warning', title: i.title,
      detail: i.customer_note, action: `Posted by ${i.created_by || 'staff'} · ${i.status}`, incident: true,
    })),
    ...alerts,
  ];
  if (items.length === 0) return null;
  const shown = compact ? items.slice(0, 4) : items;
  return (
    <div className="space-y-2" role="region" aria-label="Open alerts">
      {shown.map((a) => (
        <div key={a.id} className={`rounded-shop-sm border-l-4 px-3 py-2 text-sm ${STYLES[a.severity] || STYLES.info}`}>
          <p className="font-semibold">{a.title}</p>
          {a.detail && <p className="mt-0.5 text-xs opacity-90">{a.detail}</p>}
          {a.action && <p className="mt-0.5 text-xs opacity-80">{a.action}</p>}
          {a.threshold && !compact && <p className="mt-0.5 text-[11px] opacity-70">Rule: {a.threshold}</p>}
        </div>
      ))}
      {compact && items.length > shown.length && (
        <Link href="/dashboard/issues" className="block text-xs font-medium text-shop-primary-dark hover:underline">
          {items.length - shown.length} more on the Issues page →
        </Link>
      )}
    </div>
  );
}
