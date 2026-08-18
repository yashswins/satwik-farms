/**
 * Shop funnel readout.
 *
 * Prints the last N days of ordering-funnel counters written by
 * /api/shop/metrics. Keep the credentials in `.env.upstash.local` (gitignored
 * via `.env*.local`, and deliberately NOT a name Next.js auto-loads — putting
 * them in `.env.local` would make every local dev server and e2e run write
 * rate-limit buckets and phantom funnel events into PRODUCTION Redis):
 *
 *   node --env-file=.env.upstash.local scripts/shop-metrics-report.js [days]
 *
 * Accepts both naming conventions (Upstash console vs Vercel marketplace),
 * and the READ-ONLY token — this script only ever reads. No PII exists in
 * these keys; they are bare per-day counters.
 */

const URL_BASE = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_READ_ONLY_TOKEN
  || process.env.KV_REST_API_READ_ONLY_TOKEN
  || process.env.UPSTASH_REDIS_REST_TOKEN
  || process.env.KV_REST_API_TOKEN;

const EVENTS = [
  'shop_viewed',
  'product_viewed',
  'added_to_cart',
  'checkout_started',
  'order_placed',
  'order_placed:r', // reorder subset of order_placed
  'order_failed',
];

const DAYS = Math.max(1, Math.min(60, Number(process.argv[2]) || 14));

function darDate(offsetDays) {
  const d = new Date(Date.now() - offsetDays * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Dar_es_Salaam', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

async function main() {
  if (!URL_BASE || !TOKEN) {
    console.error('Set UPSTASH_REDIS_REST_URL and a token (READ_ONLY_TOKEN or TOKEN; KV_REST_API_* names work too).');
    console.error('Usually: node --env-file=.env.upstash.local scripts/shop-metrics-report.js');
    process.exit(1);
  }

  const dates = Array.from({ length: DAYS }, (_, i) => darDate(DAYS - 1 - i));

  // The two shops count separately (see metricsShared.js): web keys under
  // sf:m:, phone-app keys under sf:m:app:.
  for (const [title, prefix] of [['WEB', 'sf:m'], ['APP', 'sf:m:app']]) {
    const keys = dates.flatMap((date) => EVENTS.map((e) => `${prefix}:${e}:${date}`));

    // One MGET per surface.
    const res = await fetch(`${URL_BASE}/mget/${keys.map(encodeURIComponent).join('/')}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!res.ok) {
      console.error(`Upstash error: HTTP ${res.status}`);
      process.exit(1);
    }
    const values = (await res.json()).result.map((v) => Number(v) || 0);

    console.log(`\n=== ${title} ===`);
    const header = ['date', ...EVENTS].map((h) => h.padStart(18)).join('');
    console.log(header);
    const totals = new Array(EVENTS.length).fill(0);
    dates.forEach((date, row) => {
      const cells = EVENTS.map((_, col) => {
        const v = values[row * EVENTS.length + col];
        totals[col] += v;
        return String(v).padStart(18);
      });
      console.log(date.padStart(18) + cells.join(''));
    });
    console.log('TOTAL'.padStart(18) + totals.map((t) => String(t).padStart(18)).join(''));

    const [, , added, started, placed] = totals;
    if (added || started || placed) {
      console.log('\nDrop-off: added_to_cart → checkout_started '
        + `${started && added ? Math.round((100 * started) / added) : '–'}%, `
        + `checkout_started → order_placed ${placed && started ? Math.round((100 * placed) / started) : '–'}%`);
    }
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
