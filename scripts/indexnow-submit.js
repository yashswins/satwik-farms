/**
 * Submit URLs to IndexNow (Bing, DuckDuckGo, Yandex, Naver, Seznam).
 *
 * Usage:
 *   npm run indexnow                          -> submits every URL in the live sitemap
 *   npm run indexnow -- /blog/my-new-post     -> submits only the given path(s)
 *
 * Run after publishing or meaningfully updating pages. The key file must be
 * live at https://satwikfarms.com/<KEY>.txt (it's in public/), so on a brand
 * new key, deploy first and submit second.
 */

const HOST = 'satwikfarms.com';
const KEY = '00c180714a3d48e4fe404b97475bd914';
const BASE_URL = `https://${HOST}`;

async function getSitemapUrls() {
  const res = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`Failed to fetch sitemap: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const args = process.argv.slice(2);
  const urlList = args.length
    ? args.map((p) => (p.startsWith('http') ? p : `${BASE_URL}${p.startsWith('/') ? p : `/${p}`}`))
    : await getSitemapUrls();

  console.log(`Submitting ${urlList.length} URL(s) to IndexNow...`);

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${BASE_URL}/${KEY}.txt`,
      urlList,
    }),
  });

  // 200 = submitted, 202 = accepted (key validation pending). Anything else is a failure.
  console.log(`IndexNow response: HTTP ${res.status} ${res.statusText}`);
  if (res.status !== 200 && res.status !== 202) {
    const body = await res.text();
    console.error(body);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
