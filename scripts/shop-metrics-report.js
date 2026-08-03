/**
 * Shop funnel readout.
 *
 * Prints the last N days of ordering-funnel counters written by
 * /api/shop/metrics. Run locally with the Upstash credentials in the
 * environment (same names the app itself uses):
 *
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... node scripts/shop-metrics-report.js [days]
 *
 * KV_REST_API_URL / KV_REST_API_TOKEN work too. No PII exists in these keys —
 * they are bare per-day counters.
 */

const URL_BASE = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

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
    console.error('Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_*).');
    process.exit(1);
  }

  const dates = Array.from({ length: DAYS }, (_, i) => darDate(DAYS - 1 - i));
  const keys = dates.flatMap((date) => EVENTS.map((e) => `sf:m:${e}:${date}`));

  // One MGET for everything.
  const res = await fetch(`${URL_BASE}/mget/${keys.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    console.error(`Upstash error: HTTP ${res.status}`);
    process.exit(1);
  }
  const values = (await res.json()).result.map((v) => Number(v) || 0);

  const header = ['date', ...EVENTS].map((h) => h.padStart(16)).join('');
  console.log(header);
  const totals = new Array(EVENTS.length).fill(0);
  dates.forEach((date, row) => {
    const cells = EVENTS.map((_, col) => {
      const v = values[row * EVENTS.length + col];
      totals[col] += v;
      return String(v).padStart(16);
    });
    console.log(date.padStart(16) + cells.join(''));
  });
  console.log('TOTAL'.padStart(16) + totals.map((t) => String(t).padStart(16)).join(''));

  const [, , added, started, placed] = totals;
  if (added || started || placed) {
    console.log('\nDrop-off: added_to_cart → checkout_started '
      + `${started && added ? Math.round((100 * started) / added) : '–'}%, `
      + `checkout_started → order_placed ${placed && started ? Math.round((100 * placed) / started) : '–'}%`);
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
