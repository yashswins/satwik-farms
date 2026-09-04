import Card from '@/components/dashboard/Card';
import { THRESHOLDS } from '@/lib/dashboard/alerts';
import { num, share } from '@/lib/dashboard/format';

/**
 * Can customers order right now? Three measurements, all aggregate:
 *   1. what the app and web reported (funnel beacons: placed / failed),
 *   2. what the server actually received and answered (attempts by outcome),
 *   3. the gap between them — requests that never arrived.
 * The beacons carry no identity by design, so a failure cannot be tied to a
 * customer; the Orders page has the per-day history.
 */
export default function OrderingHealth({ funnelToday, attemptsToday, funnelWeek }) {
  const f = funnelToday ? { placed: funnelToday.web.order_placed + funnelToday.app.order_placed, failed: funnelToday.web.order_failed + funnelToday.app.order_failed } : null;
  const a = attemptsToday || {};
  const received = (a.accepted ?? 0) + (a.queued ?? 0) + (a.rejected ?? 0) + (a.failed ?? 0) + (a.duplicate_replay ?? 0);
  const rate = f && f.placed + f.failed > 0 ? f.failed / (f.placed + f.failed) : null;
  const never = f ? Math.max(0, f.failed - ((a.rejected ?? 0) + (a.failed ?? 0))) : null;
  const tone = rate === null ? '' : rate >= THRESHOLDS.clientFailureCritical ? 'text-shop-error' : rate >= THRESHOLDS.clientFailureWarn ? 'text-shop-warning' : 'text-shop-primary-dark dark:text-shop-primary-light';
  const weekRate = funnelWeek && funnelWeek.placed + funnelWeek.failed > 0 ? funnelWeek.failed / (funnelWeek.placed + funnelWeek.failed) : null;

  return (
    <Card title="Can customers order today?" subtitle={`Checkouts the app and web reported, what the server received, and the gap. Warning at ${Math.round(THRESHOLDS.clientFailureWarn * 100)}% failed, critical at ${Math.round(THRESHOLDS.clientFailureCritical * 100)}%.`} href="/dashboard/orders" hrefLabel="14-day history">
      {!funnelToday ? (
        <p className="text-sm text-shop-text-secondary">Funnel counters are not configured on this deployment; the server-side counts below still apply.</p>
      ) : null}
      <ul className="grid grid-cols-2 gap-3 text-center sm:grid-cols-5">
        <Stat label="Checkouts reported failed" value={f ? num(f.failed) : '–'} sub={f ? `of ${num(f.placed + f.failed)} attempts` : ''} bad={Boolean(f?.failed)} />
        <Stat label="Failure rate" value={rate === null ? '–' : share(f.failed, f.placed + f.failed)} sub={weekRate === null ? '' : `7 days: ${Math.round(weekRate * 100)}%`} className={tone} />
        <Stat label="Received by server" value={num(received)} sub={`${num(a.accepted ?? 0)} accepted · ${num((a.rejected ?? 0) + (a.failed ?? 0))} refused`} />
        <Stat label="Retries" value={num(a.duplicate_replay ?? 0)} sub="same order sent again after a timeout" />
        <Stat label="Never arrived" value={never === null ? '–' : num(never)} sub="failed on the phone, no request landed" bad={Boolean(never)} />
      </ul>
      <p className="mt-3 text-[11px] text-shop-text-secondary">A "never arrived" failure is the network between the customer's phone and the server, not a rejection: the backend answers 200 to everything it receives. Beacons carry no customer identity, so these cannot be tied to a person.</p>
    </Card>
  );
}

function Stat({ label, value, sub, bad = false, className = '' }) {
  return (
    <li>
      <p className={`text-2xl font-semibold tabular-nums ${bad ? 'text-shop-error' : ''} ${className}`}>{value}</p>
      <p className="text-xs text-shop-text-secondary">{label}</p>
      {sub && <p className="text-[11px] text-shop-text-secondary">{sub}</p>}
    </li>
  );
}
