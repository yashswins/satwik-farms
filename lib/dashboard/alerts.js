/**
 * Alert rules (dashboard_spec.md §8) as pure functions over the data the
 * pages already have. Thresholds are constants here and printed next to the
 * alert they produce, so nobody has to remember what a warning means.
 */

export const THRESHOLDS = {
  clientFailureWarn: 0.35,
  clientFailureCritical: 0.60,
  minAttemptsForRate: 5,
  restartsPer6h: 3,
  catalogStaleMinutes: 30,
  accu360LatencyMs: 5000,
  mirrorStaleMinutesBusiness: 30,
  lapsedDays: 45,
};

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

export function sortAlerts(alerts) {
  return [...alerts].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

function minutesSince(value, now) {
  if (!value) return Infinity;
  const t = value instanceof Date ? value.getTime() : Date.parse(String(value).endsWith('Z') ? value : `${value}Z`);
  return Number.isNaN(t) ? Infinity : (now - t) / 60_000;
}

/**
 * @param {object} input
 * @param {object|null} input.healthSnapshot  latest ops_snapshots row of kind 'health' ({taken_at, payload})
 * @param {object|null} input.catalogSnapshot latest 'catalog_checks' row
 * @param {Array} input.sync sync_state rows
 * @param {{web: object, app: object}|null} input.funnelToday totals per surface for today
 * @param {object|null} input.attemptsToday order_attempts_daily totals for today
 * @param {number} input.now epoch ms
 * @param {boolean} input.businessHours
 */
export function evaluateAlerts({
  healthSnapshot = null,
  catalogSnapshot = null,
  sync = [],
  funnelToday = null,
  attemptsToday = null,
  now = Date.now(),
  businessHours = true,
} = {}) {
  const alerts = [];
  const T = THRESHOLDS;

  // A1 — customers failing to place orders (client-side funnel)
  if (funnelToday) {
    for (const surface of ['web', 'app']) {
      const f = funnelToday[surface] || {};
      const placed = f.order_placed || 0;
      const failed = f.order_failed || 0;
      const attempts = placed + failed;
      if (attempts >= T.minAttemptsForRate) {
        const rate = failed / attempts;
        if (rate >= T.clientFailureWarn) {
          alerts.push({
            id: `A1-${surface}`,
            severity: rate >= T.clientFailureCritical ? 'critical' : 'warning',
            title: `Customers are failing to place orders (${surface})`,
            detail: `${failed} of ${attempts} checkout attempts today reported failure (${Math.round(rate * 100)}%).`,
            threshold: `warning at ${Math.round(T.clientFailureWarn * 100)}%, critical at ${Math.round(T.clientFailureCritical * 100)}%, over at least ${T.minAttemptsForRate} attempts`,
            action: attemptsToday?.failed || attemptsToday?.rejected
              ? 'The backend also recorded rejections or failures today — check the Orders page.'
              : 'The backend accepted everything it received, so these requests never arrived. Network path, not a server fault.',
          });
        }
      }
    }
  }

  const h = healthSnapshot?.payload || null;
  const healthAge = minutesSince(healthSnapshot?.taken_at, now);

  // A2/A5 — Accu360 reachability / latency, from the latest health snapshot
  if (h && healthAge < 120) {
    if (h.accu360 && h.accu360.ok === false) {
      alerts.push({
        id: 'A5-down', severity: 'warning', title: 'Accu360 did not answer the last check',
        detail: `Checked ${Math.round(healthAge)} min ago.`,
        threshold: 'any failed ping', action: 'Orders are accepted and queued; confirmations may be delayed.',
      });
    } else if (h.accu360?.latency_ms > T.accu360LatencyMs) {
      alerts.push({
        id: 'A5-slow', severity: 'warning', title: 'Accu360 is slow',
        detail: `${h.accu360.latency_ms} ms on the last check.`,
        threshold: `over ${T.accu360LatencyMs} ms`, action: 'Orders will take longer to confirm.',
      });
    }
    // A3 — restarts
    const events = h.render?.events_24h || {};
    const failed = events.server_failed || 0;
    if (failed >= T.restartsPer6h) {
      alerts.push({
        id: 'A3', severity: 'warning', title: 'The backend has restarted repeatedly',
        detail: `${failed} server_failed events in the last 24 h.`,
        threshold: `${T.restartsPer6h} or more`, action: 'Orders may be slow or fail intermittently while it restarts.',
      });
    }
    // A4 — catalogue feed
    if (h.catalog?.configured && (h.catalog.age_seconds === null || h.catalog.age_seconds > T.catalogStaleMinutes * 60)) {
      alerts.push({
        id: 'A4', severity: 'warning', title: 'The catalogue feed is stale',
        detail: h.catalog.age_seconds === null
          ? 'The backend has no catalogue loaded.'
          : `Last successful fetch ${Math.round(h.catalog.age_seconds / 60)} min ago.`,
        threshold: `older than ${T.catalogStaleMinutes} min`,
        action: 'The shop may show an incomplete or stale catalogue; price checks are skipped.',
      });
    }
    // A6 — ERP sync backlog
    if (h.erp_sync && (h.erp_sync.escalated > 0 || h.erp_sync.alarm)) {
      alerts.push({
        id: 'A6', severity: 'warning', title: 'Accepted orders have not reached Accu360 yet',
        detail: `${h.erp_sync.pending} pending, ${h.erp_sync.escalated} escalated, oldest ${h.erp_sync.oldest_minutes} min.`,
        threshold: 'any escalated job, or a pending job older than the backlog alarm',
        action: 'Check the backend; the outbox retries on its own.',
      });
    }
  }

  // D1 — mirror stale
  const invoices = sync.find((s) => s.step === 'invoices');
  const mirrorAge = minutesSince(invoices?.last_ok_at, now);
  if (businessHours && mirrorAge > T.mirrorStaleMinutesBusiness) {
    alerts.push({
      id: 'D1', severity: 'warning', title: 'Dashboard money figures are stale',
      detail: invoices?.last_ok_at
        ? `Invoices last mirrored ${Math.round(mirrorAge)} min ago${invoices.last_error ? ` — last error: ${invoices.last_error.slice(0, 120)}` : ''}.`
        : 'The invoice mirror has never completed a run.',
      threshold: `older than ${T.mirrorStaleMinutesBusiness} min in business hours`,
      action: 'Use Refresh; if it stays stale, check the backend sync status on the Admin page.',
    });
  }

  // A10 / A11 / P1–P3 — catalogue checks
  for (const issue of catalogSnapshot?.payload?.issues || []) {
    if (issue.kind === 'item_disabled_in_erp' || issue.kind === 'item_missing_in_erp') {
      alerts.push({
        id: `A10-${issue.sku}`, severity: 'critical',
        title: `${issue.name || issue.sku} is on the shop but ${issue.kind === 'item_disabled_in_erp' ? 'disabled' : 'missing'} in Accu360`,
        detail: `Any cart containing ${issue.sku} will be rejected at checkout.`,
        threshold: 'active in the Sheet, disabled or absent in Accu360',
        action: 'Set it out of stock in the Sheet, or enable the Item in Accu360.',
      });
    } else if (issue.kind === 'promo_minimum_unreachable') {
      alerts.push({
        id: `P1-${issue.code}`, severity: 'info', title: `Almost nobody can qualify for ${issue.code}`,
        detail: `Minimum spend TSH ${Math.round(issue.minimum_spend).toLocaleString()} vs a median basket of TSH ${Math.round(issue.median_subtotal).toLocaleString()}.`,
        threshold: 'minimum spend over 3× the median basket', action: 'Lower the minimum or retire the code.',
      });
    } else if (issue.kind === 'auto_promo_large') {
      alerts.push({
        id: `P2-${issue.code}`, severity: 'warning', title: `${issue.code} auto-applies a large discount`,
        detail: `TSH ${Math.round(issue.amount_off).toLocaleString()} off, against a median basket of TSH ${Math.round(issue.median_subtotal).toLocaleString()}.`,
        threshold: 'auto-apply amount at least 20% of the median basket', action: 'Confirm this is intended.',
      });
    } else if (issue.kind === 'tier_percent_suspicious') {
      alerts.push({
        id: `P3-${issue.tier}`, severity: 'warning', title: `Discount tier ${issue.tier} is set to ${issue.percent_off}%`,
        detail: 'Below 1% — probably a typo (0.5 instead of 5).', threshold: 'percent_off under 1', action: 'Fix the Sheet.',
      });
    }
  }

  return sortAlerts(alerts);
}
