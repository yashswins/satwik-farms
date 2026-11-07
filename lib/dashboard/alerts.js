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
  bootGraceSeconds: 180,
  accu360LatencyMs: 5000,
  // Backend syncs every 30 min in business hours: one missed run is quiet, two are not.
  mirrorStaleMinutesBusiness: 75,
  lapsedDays: 45,
  // dbt data checks run daily (GitHub Actions, 03:30 UTC); one missed day is not yet news.
  dataChecksStaleHours: 30,
  // The backend compares the mirror with Accu360 every 3 hours.
  truthCheckStaleHours: 26,
};

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

export function sortAlerts(alerts) {
  return [...alerts].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

function durationLabel(minutes) {
  const m = Math.round(Number(minutes) || 0);
  if (m < 90) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

/**
 * What a person should do about an order the outbox cannot write, read from
 * Accu360's refusal. Retrying gets past an outage or a slow Accu360 by itself;
 * it never gets past a refusal about the data. On 5 Nov an order sat for 13 h
 * because its customer had been disabled, while the alert told staff the
 * outbox would sort it out.
 */
export function erpSyncAction(error) {
  const e = String(error || '');
  const customer = e.match(/Customer (\S+) is disabled/i);
  if (customer) {
    return `Customer ${customer[1]} is disabled in Accu360. Re-enable it and the next retry (hourly) writes the order. If it was disabled on purpose, contact the customer and mark the order handled.`;
  }
  if (/cannot be written|is disabled|PartyDisabled|CharacterLengthExceeded|MandatoryError|ValidationError|not allowed/i.test(e)) {
    return 'Accu360 refuses this order, and retrying will not change that. Fix the cause in Accu360, or contact the customer and mark the order handled.';
  }
  return 'Usually Accu360 being slow or down; the outbox retries on its own. If it persists, check the backend log.';
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
 * @param {object|null} input.dataChecksSnapshot latest 'data_checks' row (dbt, satwik-farms-backend/analytics)
 * @param {object|null} input.truthSnapshot latest 'truth_check' row (backend: mirror vs Accu360 totals)
 * @param {Array} input.sync sync_state rows
 * @param {{web: object, app: object}|null} input.funnelToday totals per surface for today
 * @param {object|null} input.attemptsToday order_attempts_daily totals for today
 * @param {number} input.now epoch ms
 * @param {boolean} input.businessHours
 */
export function evaluateAlerts({
  healthSnapshot = null,
  catalogSnapshot = null,
  // undefined = caller does not read data checks; null = none has ever been recorded.
  dataChecksSnapshot = undefined,
  truthSnapshot = undefined,
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
    // A4 — the backend's copy of the Sheet catalogue. A process that has just
    // booted has not fetched it yet; that is not an outage, so the first few
    // minutes after a restart are exempt.
    const justBooted = (h.uptime_seconds ?? Infinity) < T.bootGraceSeconds;
    if (h.catalog?.configured && !justBooted
        && (h.catalog.age_seconds === null || h.catalog.age_seconds > T.catalogStaleMinutes * 60)) {
      alerts.push({
        id: 'A4', severity: 'warning', title: 'The backend cannot reach the Sheet catalogue',
        detail: h.catalog.age_seconds === null
          ? 'The backend has no copy of the Sheet loaded — every fetch since it started has failed.'
          : `Last successful fetch ${Math.round(h.catalog.age_seconds / 60)} min ago.`,
        threshold: `older than ${T.catalogStaleMinutes} min, ignoring the first ${Math.round(T.bootGraceSeconds / 60)} min after a restart`,
        action: 'Customers can still order; the backend skips its price and promo checks on new orders until the Sheet loads. The shop fetches the Sheet separately.',
      });
    }
    // A6 — ERP sync backlog. Escalated jobs someone has closed by hand are
    // history, not a backlog; only open ones count (escalated_open, backend
    // ≥ 2026-09-03; older snapshots lack the field and are not alerted on).
    const escalatedOpen = h.erp_sync?.escalated_open ?? 0;
    // needs_person: Accu360 refused an accepted order for a reason only a
    // person can clear (a disabled customer). Accepted and flagged at once
    // (owner, 2026-11-07), not after the 30-minute backlog alarm.
    const needsPerson = h.erp_sync?.needs_person ?? 0;
    if (h.erp_sync && (escalatedOpen > 0 || h.erp_sync.alarm || needsPerson > 0)) {
      // stuck: oldest owed jobs with Accu360's own reason (backend ≥ 2026-11-05).
      const first = (h.erp_sync.stuck || [])[0];
      const named = first
        ? ` ${first.order_id}, ${first.attempts} attempts${first.error ? `: Accu360 says "${first.error}"` : ''}.`
        : '';
      alerts.push({
        id: 'A6', severity: 'warning',
        title: needsPerson > 0 ? `${needsPerson === 1 ? 'An accepted order needs' : `${needsPerson} accepted orders need`} someone in Accu360` : 'Accepted orders have not reached Accu360 yet',
        detail: `${h.erp_sync.pending} pending, ${escalatedOpen} escalated and unhandled, oldest ${durationLabel(h.erp_sync.oldest_minutes)}.${named}`,
        threshold: 'a refusal only a person can fix (at once), any unhandled escalated job, or a pending job older than the backlog alarm',
        action: erpSyncAction(first?.error),
      });
    }
  }

  // D1 — mirror stale. The backend keeps a step's last error after it recovers
  // (mark_ok leaves it as history), so the error explains the staleness only
  // when it came after the last success. On 2026-10-29 an 18-day-old SSL error
  // was shown as the cause while the backend was simply asleep.
  const invoices = sync.find((s) => s.step === 'invoices');
  const mirrorAge = minutesSince(invoices?.last_ok_at, now);
  if (businessHours && mirrorAge > T.mirrorStaleMinutesBusiness) {
    const failing = Boolean(invoices?.last_error)
      && (!invoices.last_error_at || minutesSince(invoices.last_error_at, now) < mirrorAge);
    alerts.push({
      id: 'D1', severity: 'warning', title: 'Dashboard money figures are stale',
      detail: !invoices?.last_ok_at
        ? 'The invoice mirror has never completed a run.'
        : failing
          ? `Invoices last mirrored ${Math.round(mirrorAge)} min ago — the sync is failing: ${invoices.last_error.slice(0, 120)}.`
          : `Invoices last mirrored ${Math.round(mirrorAge)} min ago. No sync has failed since then: the backend has not run one (it was asleep, restarting or down).`,
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
    } else if (issue.kind === 'item_no_sku') {
      alerts.push({
        id: `A10-nosku-${issue.name}`, severity: 'warning', title: `${issue.name || 'A product'} is on the shop with no Accu360 SKU`,
        detail: 'It cannot be ordered: the backend rejects lines without a SKU.',
        threshold: 'active in the Sheet with an empty accu360_sku', action: 'Fill in the SKU in the Sheet, or deactivate the product.',
      });
    } else if (issue.kind === 'price_drift_online' && issue.basis === 'order') {
      // Judged against what the app charged for each order (the backend validated
      // that against the catalogue at order time), so a Sheet edit between
      // ordering and invoicing is not a drift. A drift here is Accu360 billing
      // something other than what the customer paid in the app.
      alerts.push({
        id: `A12-${issue.sku}`, severity: 'warning', title: `${issue.name || issue.sku}: Accu360 billed app orders at a different price from what the app charged`,
        detail: `App charged ${issue.app_rate?.toLocaleString()} per stock unit vs ${issue.invoiced_rate?.toLocaleString()} invoiced on the latest ${issue.lines} app lines${issue.latest_line ? `, newest ${issue.latest_line}` : ''} (${issue.drift_pct > 0 ? '+' : ''}${issue.drift_pct}%). Sheet today: ${issue.sheet_price?.toLocaleString()} per ${issue.unit}.`,
        threshold: 'latest app lines more than 5% and TSH 100 from the price the app charged for that order, at least 3 lines',
        action: 'Open the invoices: staff changed the price or substituted the item after the customer paid the app price.',
      });
    } else if (issue.kind === 'price_drift_online') {
      alerts.push({
        id: `A12-${issue.sku}`, severity: 'warning', title: `${issue.name || issue.sku}: app orders were charged a different price from the Sheet`,
        detail: `Sheet ${issue.sheet_price?.toLocaleString()} per ${issue.unit} (${issue.expected_rate?.toLocaleString()} per stock unit) vs ${issue.invoiced_rate?.toLocaleString()} on the latest ${issue.lines} app lines${issue.latest_line ? `, newest ${issue.latest_line}` : ''} (${issue.drift_pct > 0 ? '+' : ''}${issue.drift_pct}%). These orders are older than our price records, so they are judged against the Sheet of their invoice day.`,
        threshold: 'latest lines more than 5% and TSH 100 from the Sheet price of their day, at least 3 lines',
        action: 'Check the Sheet price and whether the app catalogue was stale when these were placed.',
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

  if (dataChecksSnapshot !== undefined) alerts.push(...dataCheckAlerts(dataChecksSnapshot, now));
  if (truthSnapshot !== undefined) alerts.push(...truthCheckAlerts(truthSnapshot, now));

  return sortAlerts(alerts);
}

/**
 * What each dbt data check means to a person, and what to do about it. The
 * checks live in satwik-farms-backend/analytics/tests; a check not listed
 * here still alerts, with its dbt name and a pointer to the run.
 */
const DATA_CHECKS = {
  app_customers_are_enabled: {
    title: (n) => `${n} customer${n === 1 ? ' who orders' : 's who order'} in the app ${n === 1 ? 'is' : 'are'} disabled in Accu360`,
    action: 'Their next app order will be accepted but cannot reach Accu360 until they are re-enabled (it is flagged here when it happens). If the disable was a mistake, re-enable them now.',
  },
  completed_orders_have_a_sale: {
    title: (n) => `${n} app order${n === 1 ? '' : 's'} marked completed ${n === 1 ? 'has' : 'have'} no sale in Accu360`,
    action: 'Their only invoice was cancelled after the order was marked completed. In Accu360, re-bill each one with the order id in PO No, or close its Sales Order if it will not be billed; either clears this.',
  },
  online_invoices_have_an_app_order: {
    title: (n) => `${n} app/web invoice${n === 1 ? '' : 's'} with no matching order`,
    action: 'Channel attribution is wrong for these invoices, so App/Web/Offline splits are off. Tell the developer.',
  },
  mirror_sync_ran_recently: {
    title: () => 'A mirror step has not succeeded for 3 hours',
    action: 'See Admin → Sync. The backend may be down or Accu360 unreachable.',
  },
  sales_invoice_total_matches_its_lines: {
    title: (n) => `${n} invoice${n === 1 ? '' : 's'} whose lines do not add up to the total`,
    action: 'The invoice-line mirror is incomplete, so the Products page disagrees with Sales. Check the backend invoice sync.',
  },
  sales_invoice_grand_total_is_total_less_discount: {
    title: (n) => `${n} invoice${n === 1 ? '' : 's'} with a charge other than a discount`,
    action: 'Something new (a tax or delivery fee?) is on these invoices and every sales figure includes it. Tell the developer.',
  },
  customer_lifetime_reconciles_to_sales: {
    title: () => 'Customer totals no longer add up to sales',
    action: 'Two dbt definitions have drifted apart. See the latest dbt run.',
  },
};

function exampleLabel(example) {
  if (!example || typeof example !== 'object') return '';
  const key = example.id ?? example.name ?? example.invoice ?? example.step ?? Object.values(example)[0];
  return key == null ? '' : String(key);
}

/** Alerts from the latest dbt run recorded in ops_snapshots (kind 'data_checks'). */
export function dataCheckAlerts(snapshot, now = Date.now()) {
  if (!snapshot) {
    return [{
      id: 'A13-never', severity: 'info', title: 'Data checks have not run yet',
      detail: 'No dbt run has been recorded.', threshold: 'no data_checks snapshot',
      action: 'Run the dbt workflow (satwik-farms-backend → GitHub Actions → dbt) or analytics/run_dbt.py build.',
    }];
  }
  const out = [];
  const age = minutesSince(snapshot.taken_at, now);
  if (age > THRESHOLDS.dataChecksStaleHours * 60) {
    out.push({
      id: 'A13-stale', severity: 'warning', title: `Data checks have not run for ${durationLabel(age)}`,
      detail: 'The checks below are from the last run, not today.',
      threshold: `no dbt run for ${THRESHOLDS.dataChecksStaleHours} h`,
      action: 'Check the dbt workflow in GitHub Actions (satwik-farms-backend). Its DBT_DATABASE_URL secret may be missing or wrong.',
    });
  }
  const when = `Checked ${durationLabel(age)} ago.`;
  for (const p of snapshot.payload?.problems || []) {
    const known = DATA_CHECKS[p.check];
    const n = Number(p.failures) || 0;
    const examples = (p.examples || []).map(exampleLabel).filter(Boolean).slice(0, 3);
    if (p.kind === 'model' || p.kind === 'run' || p.status === 'error') {
      out.push({
        id: `A13-${p.check}`, severity: 'warning', title: `dbt could not finish ${p.check}`,
        detail: `${(p.message || '').slice(0, 160)} ${when}`.trim(), threshold: 'a dbt model or check errored',
        action: 'The dashboard may be reading the previous version of a view. See the latest dbt run in GitHub Actions.',
      });
      continue;
    }
    out.push({
      id: `A13-${p.check}`,
      severity: p.status === 'warn' ? 'info' : 'warning',
      title: known ? known.title(n) : `Data check failed: ${p.check} (${n})`,
      detail: `${examples.length ? `For example ${examples.join(', ')}${n > examples.length ? ` and ${n - examples.length} more` : ''}. ` : ''}${when}`,
      threshold: p.status === 'warn' ? 'dbt check (warning level), any row' : 'dbt check, any row',
      action: known?.action || 'See the latest dbt run in GitHub Actions for the rows.',
    });
  }
  return out;
}

const tsh = (v) => `TSH ${Math.round(Number(v) || 0).toLocaleString('en-US')}`;

/**
 * Alerts from the backend's truth check (ops_snapshots kind 'truth_check'):
 * the mirror's sales against Accu360's own totals, month by month. Only a
 * mismatch seen on two checks in a row is an alert; one could be an invoice
 * edited between the mirror's fetch and the comparison.
 */
export function truthCheckAlerts(snapshot, now = Date.now()) {
  if (!snapshot) {
    return [{
      id: 'A14-never', severity: 'info', title: 'The Accu360 truth check has not run yet',
      detail: 'No comparison of dashboard sales with Accu360 has been recorded.', threshold: 'no truth_check snapshot',
      action: 'It runs with the backend sync every 3 hours; check Admin → Sync.',
    }];
  }
  const out = [];
  const age = minutesSince(snapshot.taken_at, now);
  if (age > THRESHOLDS.truthCheckStaleHours * 60) {
    out.push({
      id: 'A14-stale', severity: 'info', title: `The Accu360 truth check has not run for ${durationLabel(age)}`,
      detail: 'Dashboard sales have not been compared with Accu360 since then.',
      threshold: `no truth check for ${THRESHOLDS.truthCheckStaleHours} h`, action: 'Check Admin → Sync; the backend sync may be failing.',
    });
  }
  const bad = (snapshot.payload?.months || []).filter((m) => m.confirmed);
  if (bad.length) {
    out.push({
      id: 'A14', severity: 'warning',
      title: `Dashboard sales disagree with Accu360 for ${bad.map((m) => m.month).join(', ')}`,
      detail: `${bad.map((m) => `${m.month}: dashboard ${tsh(m.mirror_total)} on ${m.mirror_invoices} invoices, Accu360 ${tsh(m.erp_total)} on ${m.erp_invoices} (difference ${tsh(m.mirror_total - m.erp_total)})`).join('; ')}. Checked ${durationLabel(age)} ago.`,
      threshold: 'any difference, seen on two checks in a row',
      action: 'Every sales figure for that month is off by the difference. The mirror missed changes in Accu360; tell the developer to re-sync that month.',
    });
  }
  return out;
}
