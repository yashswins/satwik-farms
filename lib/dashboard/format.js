/**
 * Number and date formatting for the dashboard. One place, so every page
 * shows money and deltas the same way.
 */

export function tsh(value, { compact = false } = {}) {
  const n = Number(value) || 0;
  if (compact) {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `TSH ${trim((n / 1_000_000).toFixed(2))}M`;
    if (abs >= 10_000) return `TSH ${trim((n / 1_000).toFixed(1))}k`;
  }
  return `TSH ${Math.round(n).toLocaleString('en-US')}`;
}

function trim(s) {
  return s.replace(/\.?0+$/, '');
}

export function num(value) {
  return (Number(value) || 0).toLocaleString('en-US');
}

export function pct(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '–';
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

/**
 * Change from `previous` to `current`.
 * polarity 'up' (default): a rise is good; 'down': a fall is good.
 * @returns {{pct: number|null, direction: 'up'|'down'|'flat', good: boolean|null, text: string}}
 */
export function delta(current, previous, polarity = 'up') {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (p === 0) {
    if (c === 0) return { pct: null, direction: 'flat', good: null, text: 'no change' };
    return { pct: null, direction: 'up', good: polarity === 'up', text: 'new' };
  }
  const change = (c - p) / Math.abs(p);
  const direction = Math.abs(change) < 0.0005 ? 'flat' : change > 0 ? 'up' : 'down';
  const good = direction === 'flat' ? null : (direction === 'up') === (polarity === 'up');
  const arrow = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '';
  return { pct: change, direction, good, text: `${arrow} ${Math.abs(change * 100).toFixed(1)}%`.trim() };
}

/**
 * Small-N honesty: a percentage over fewer than 10 events reads as the raw
 * fraction ("2 of 7") instead.
 */
export function share(numerator, denominator) {
  const n = Number(numerator) || 0;
  const d = Number(denominator) || 0;
  if (d === 0) return '–';
  if (d < 10) return `${n} of ${d}`;
  return pct(n / d, 0);
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-09-03' → 'Thu 3 Sep' */
export function dateLabel(iso, { year = false } = {}) {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const base = `${WEEKDAYS[date.getUTCDay()]} ${d} ${MONTHS[m - 1]}`;
  return year ? `${base} ${y}` : base;
}

/** '2026-09-03' → '3 Sep'; used on axes. */
export function shortDate(iso) {
  const [, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** Relative age of a timestamp: '3 min ago', '2 h ago', '4 d ago'. */
export function ago(value, now = Date.now()) {
  if (!value) return 'never';
  const t = value instanceof Date ? value.getTime() : Date.parse(value);
  if (Number.isNaN(t)) return 'unknown';
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

/** Dar wall-clock time 'HH:MM' for a timestamp (UTC-naive strings are UTC). */
export function darTime(value) {
  if (!value) return '';
  const t = value instanceof Date ? value : new Date(String(value).endsWith('Z') || String(value).includes('+') ? value : `${value}Z`);
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Dar_es_Salaam', hour: '2-digit', minute: '2-digit' }).format(t);
}

/** Excel-safe CSV cell: quotes, and neutralises formula injection. */
export function csvCell(value) {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export const CHANNEL_LABELS = {
  app: 'App',
  web: 'Web',
  online_unsplit: 'Online (unsplit)',
  offline: 'Offline',
};

export const CHANNEL_COLORS = {
  app: '#53B175',
  web: '#2F6FB5',
  online_unsplit: '#8FCFA5',
  offline: '#FF8A65',
};
