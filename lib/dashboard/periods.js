/**
 * Reporting periods, all in Dar es Salaam time, all as inclusive ISO dates.
 *
 * Every period carries its comparison period: the same length immediately
 * before it, or the same days of the previous month/year for "to date"
 * periods, so a delta on the 3rd of the month compares the 1st–3rd with the
 * 1st–3rd, not with a whole month. Weeks run Monday to Sunday (owner
 * decision 2026-09-03). Pure functions — no database, no Date.now() unless
 * asked — so they are testable across month and year boundaries.
 */

const DAR = 'Africa/Dar_es_Salaam';
const DAY = 86_400_000;

/** Calendar date (YYYY-MM-DD) in Dar for an instant. */
export function darDate(instant = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DAR, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(instant);
}

/** ISO date → UTC-midnight Date (only ever used for day arithmetic). */
export function toDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toIso(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso, days) {
  return toIso(new Date(toDate(iso).getTime() + days * DAY));
}

export function daysBetween(startIso, endIso) {
  return Math.round((toDate(endIso) - toDate(startIso)) / DAY) + 1;
}

function monthStart(iso) {
  return `${iso.slice(0, 7)}-01`;
}

function monthEnd(iso) {
  const d = toDate(iso);
  return toIso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
}

function shiftMonths(iso, months) {
  // Same day-of-month `months` back, clamped to that month's length.
  const d = toDate(iso);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), last));
  return toIso(target);
}

function quarterStart(iso) {
  const d = toDate(iso);
  const q = Math.floor(d.getUTCMonth() / 3) * 3;
  return toIso(new Date(Date.UTC(d.getUTCFullYear(), q, 1)));
}

export const PERIOD_KEYS = [
  'today', 'yesterday', 'week', 'last7', 'mtd', 'last30', 'lastmonth', 'qtd', 'ytd', 'custom',
];

export const PERIOD_LABELS = {
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'This week',
  last7: 'Last 7 days',
  mtd: 'Month to date',
  last30: 'Last 30 days',
  lastmonth: 'Last month',
  qtd: 'Quarter to date',
  ytd: 'Year to date',
  custom: 'Custom',
};

/**
 * @param {string} key one of PERIOD_KEYS (unknown → 'mtd')
 * @param {{now?: Date, from?: string, to?: string}} opts
 * @returns {{key, label, start, end, compareStart, compareEnd, days, compareLabel}}
 */
export function resolvePeriod(key, { now = new Date(), from, to } = {}) {
  const today = darDate(now);
  let k = PERIOD_KEYS.includes(key) ? key : 'mtd';
  let start;
  let end;
  let compareStart;
  let compareEnd;
  let compareLabel;

  switch (k) {
    case 'today':
      start = end = today;
      compareStart = compareEnd = addDays(today, -1);
      compareLabel = 'vs yesterday';
      break;
    case 'yesterday':
      start = end = addDays(today, -1);
      compareStart = compareEnd = addDays(today, -2);
      compareLabel = 'vs the day before';
      break;
    case 'week': {
      const dow = (toDate(today).getUTCDay() + 6) % 7; // Monday = 0
      start = addDays(today, -dow);
      end = today;
      compareStart = addDays(start, -7);
      compareEnd = addDays(end, -7);
      compareLabel = 'vs same days last week';
      break;
    }
    case 'last7':
      start = addDays(today, -6);
      end = today;
      compareStart = addDays(start, -7);
      compareEnd = addDays(end, -7);
      compareLabel = 'vs previous 7 days';
      break;
    case 'mtd':
      start = monthStart(today);
      end = today;
      compareStart = monthStart(shiftMonths(today, -1));
      compareEnd = shiftMonths(today, -1);
      compareLabel = 'vs same days last month';
      break;
    case 'last30':
      start = addDays(today, -29);
      end = today;
      compareStart = addDays(start, -30);
      compareEnd = addDays(end, -30);
      compareLabel = 'vs previous 30 days';
      break;
    case 'lastmonth': {
      const prev = shiftMonths(monthStart(today), -1);
      start = monthStart(prev);
      end = monthEnd(prev);
      const prev2 = shiftMonths(start, -1);
      compareStart = monthStart(prev2);
      compareEnd = monthEnd(prev2);
      compareLabel = 'vs the month before';
      break;
    }
    case 'qtd': {
      start = quarterStart(today);
      end = today;
      const len = daysBetween(start, end);
      compareStart = quarterStart(shiftMonths(start, -3));
      compareEnd = addDays(compareStart, len - 1);
      compareLabel = 'vs same days last quarter';
      break;
    }
    case 'ytd': {
      start = `${today.slice(0, 4)}-01-01`;
      end = today;
      const y = Number(today.slice(0, 4)) - 1;
      compareStart = `${y}-01-01`;
      compareEnd = shiftYears(today, -1);
      compareLabel = 'vs same days last year';
      break;
    }
    case 'custom': {
      const f = isIso(from) ? from : addDays(today, -6);
      const t = isIso(to) ? to : today;
      start = f <= t ? f : t;
      end = f <= t ? t : f;
      if (end > today) end = today;
      if (start > end) start = end;
      const len = daysBetween(start, end);
      compareEnd = addDays(start, -1);
      compareStart = addDays(compareEnd, -(len - 1));
      compareLabel = `vs previous ${len} day${len === 1 ? '' : 's'}`;
      break;
    }
    default:
      k = 'mtd';
  }

  return {
    key: k,
    label: PERIOD_LABELS[k],
    start,
    end,
    compareStart,
    compareEnd,
    days: daysBetween(start, end),
    compareLabel,
  };
}

function shiftYears(iso, years) {
  const d = toDate(iso);
  const target = new Date(Date.UTC(d.getUTCFullYear() + years, d.getUTCMonth(), 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), last));
  return toIso(target);
}

export function isIso(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toDate(value).getTime());
}

/** Bucket size for a chart over `days` days: day ≤ 45, week ≤ 182, else month. */
export function granularityFor(days) {
  if (days <= 45) return 'day';
  if (days <= 182) return 'week';
  return 'month';
}
