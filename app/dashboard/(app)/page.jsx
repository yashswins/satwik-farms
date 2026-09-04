import Link from 'next/link';

import AlertStrip from '@/components/dashboard/AlertStrip';
import AutoRefresh from '@/components/dashboard/AutoRefresh';
import Card, { Empty, Unavailable } from '@/components/dashboard/Card';
import CatalogueCheck from '@/components/dashboard/CatalogueCheck';
import ChannelBar from '@/components/dashboard/ChannelBar';
import OrderingHealth from '@/components/dashboard/OrderingHealth';
import KpiTile from '@/components/dashboard/KpiTile';
import RefreshButton from '@/components/dashboard/RefreshButton';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import StatusDots, { deriveStatus } from '@/components/dashboard/StatusDots';
import { evaluateAlerts } from '@/lib/dashboard/alerts';
import { isConfigured, query } from '@/lib/dashboard/db';
import { ago, darTime, dateLabel, num, share, tsh } from '@/lib/dashboard/format';
import { addDays, darDate, resolvePeriod } from '@/lib/dashboard/periods';
import {
  attemptsFor, channelSplit, discountPulse, freshness, headlineKpis, health, ordersKpis, pipeline24h,
  promoPulse, salesTrend, todayVsYesterdayToNow, topCustomers, topItems,
} from '@/lib/dashboard/queries/overview';
import { funnelConfigured, funnelCounts, funnelTotals } from '@/lib/dashboard/upstash';

export const metadata = { title: 'Overview' };
export const dynamic = 'force-dynamic';

/** One failing widget must never white-screen the page. */
async function settle(promise, fallback = null) {
  try {
    return { value: await promise, error: null };
  } catch (error) {
    console.error('[dashboard/overview]', error.message);
    return { value: fallback, error: error.message };
  }
}

export default async function OverviewPage() {
  if (!isConfigured()) {
    return (
      <Card title="Dashboard database not configured">
        <p className="text-sm text-shop-text-secondary">
          Set <code>DASHBOARD_DATABASE_URL</code> for this deployment. Nothing else on this page can load without it.
        </p>
      </Card>
    );
  }

  const now = new Date();
  const today = darDate(now);
  const mtd = resolvePeriod('mtd', { now });
  const darHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Dar_es_Salaam', hour: '2-digit', hour12: false }).format(now));

  const [
    kpis, todayCmp, orders, split, trend, items, customers, pipeline, attempts, promo, disc, hlth, fresh, funnel, incidents,
  ] = await Promise.all([
    settle(headlineKpis(now), []),
    settle(todayVsYesterdayToNow(now), null),
    settle(ordersKpis(now), []),
    settle(channelSplit(mtd.start, mtd.end), { rows: [], total: 0 }),
    settle(salesTrend(90, now), []),
    settle(topItems(mtd.start, mtd.end, 5), []),
    settle(topCustomers(mtd.start, mtd.end, 5, 'revenue'), []),
    settle(pipeline24h(), null),
    settle(attemptsFor(today), { rows: [], totals: {} }),
    settle(promoPulse(mtd.start, mtd.end), null),
    settle(discountPulse(mtd.start, mtd.end), null),
    settle(health(), { snapshots: {}, sync: [] }),
    settle(freshness(), { synced_at: null, latest_posting_date: null, invoices: 0 }),
    settle(funnelConfigured() ? funnelCounts(Array.from({ length: 7 }, (_, i) => addDays(today, -(6 - i)))) : Promise.resolve(null), null),
    settle(query("SELECT id, title, severity, status, customer_note, created_by FROM incidents WHERE status <> 'resolved' ORDER BY created_at DESC LIMIT 5"), []),
  ]);

  const funnelToday = funnel.value
    ? { web: funnelTotals({ [today]: funnel.value.web[today] }), app: funnelTotals({ [today]: funnel.value.app[today] }) }
    : null;
  const funnelWeek = funnel.value
    ? (() => { const w = funnelTotals(funnel.value.web); const a = funnelTotals(funnel.value.app); return { placed: w.order_placed + a.order_placed, failed: w.order_failed + a.order_failed }; })()
    : null;
  const funnelEventsToday = funnelToday
    ? Object.values(funnelToday.web).reduce((a, b) => a + b, 0) + Object.values(funnelToday.app).reduce((a, b) => a + b, 0)
    : 0;
  const neverArrived = funnelToday
    ? Math.max(0, (funnelToday.web.order_failed + funnelToday.app.order_failed)
        - ((attempts.value.totals.rejected ?? 0) + (attempts.value.totals.failed ?? 0)))
    : null;

  const alerts = evaluateAlerts({
    healthSnapshot: hlth.value.snapshots.health ?? null,
    catalogSnapshot: hlth.value.snapshots.catalog_checks ?? null,
    sync: hlth.value.sync,
    funnelToday,
    attemptsToday: attempts.value.totals,
    now: now.getTime(),
    businessHours: darHour >= 6 && darHour < 22,
  });
  const status = deriveStatus({
    health: hlth.value, funnelConfigured: funnelConfigured(), funnelEventsToday, now: now.getTime(),
  });

  return (
    <div className="space-y-5">
      <AutoRefresh minutes={5} />
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Overview</h1>
          <p className="text-xs text-shop-text-secondary">{dateLabel(today, { year: true })} · Dar es Salaam time · refreshes itself every 5 minutes</p>
        </div>
        <RefreshButton />
      </div>

      <AlertStrip alerts={alerts} incidents={incidents.value} compact />

      <CatalogueCheck snapshot={hlth.value.snapshots.catalog_checks ?? null} />

      {/* Sales tiles. Today is compared with yesterday up to the same time of day. */}
      {kpis.error ? <Unavailable what="Sales tiles" reason={kpis.error} /> : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.value.map(({ period, current, previous }) => {
            const isToday = period.key === 'today';
            const prev = isToday && todayCmp.value ? todayCmp.value.yesterdayToNow : previous;
            return (
              <KpiTile
                key={period.key}
                label={`Sales ${period.label.toLowerCase()}`}
                value={current.sales}
                previous={prev.sales}
                compareLabel={isToday && todayCmp.value ? `vs yesterday to ${todayCmp.value.time}` : period.compareLabel}
                sub={`${num(current.invoices)} invoices · avg ${tsh(current.invoices ? current.sales / current.invoices : 0, { compact: true })}${isToday && todayCmp.value ? ` · all of yesterday ${tsh(todayCmp.value.yesterdayFull.sales, { compact: true })}` : ''}`}
                href={`/dashboard/sales?period=${period.key}`}
              />
            );
          })}
        </div>
      )}

      {/* Orders tiles: app and web orders accepted, from our own records. */}
      {orders.error ? <Unavailable what="Order tiles" reason={orders.error} /> : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {orders.value.map(({ period, current, previous }) => (
            <KpiTile
              key={period.key}
              label={`Online orders ${period.label.toLowerCase()}`}
              value={current.orders}
              previous={previous.orders}
              compareLabel={period.compareLabel}
              format="num"
              sub={`${num(current.app)} app · ${num(current.web)} web · ${tsh(current.value, { compact: true })} ordered`}
              href={`/dashboard/orders?period=${period.key}`}
            />
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Sales by channel" subtitle={`${mtd.label} · ${dateLabel(mtd.start)} – ${dateLabel(mtd.end)}`} href="/dashboard/channels" className="lg:col-span-1">
          {split.error ? <Unavailable what="Channel split" reason={split.error} /> : <ChannelBar rows={split.value.rows} total={split.value.total} />}
        </Card>
        <Card title="Sales, last 90 days" subtitle="Hover a day for its total; bars split online and offline, line is the 7-day average" href="/dashboard/sales?period=custom" className="lg:col-span-2">
          {trend.error ? <Unavailable what="Trend" reason={trend.error} /> : trend.value.length ? <SalesTrendChart series={trend.value} mode="sales" /> : <Empty />}
        </Card>
      </div>

      <Card title="Orders, last 90 days" subtitle="Invoices per day, online and offline; the blue line is app and web orders placed that day" href="/dashboard/orders">
        {trend.error ? <Unavailable what="Trend" reason={trend.error} /> : trend.value.length ? <SalesTrendChart series={trend.value} mode="orders" height={220} /> : <Empty />}
      </Card>

      <OrderingHealth funnelToday={funnelToday} attemptsToday={attempts.value.totals} funnelWeek={funnelWeek} />

      <Card title="Online orders, last 24 hours" subtitle="From our own order records; never counted as sales" href="/dashboard/orders" hrefLabel="Orders page">
        {pipeline.error || !pipeline.value ? <Unavailable what="Pipeline" reason={pipeline.error} /> : (
          <ul className="grid grid-cols-3 gap-3 text-center sm:grid-cols-6">
            <Stat label="Placed" value={pipeline.value.placed} />
            <Stat label="Accepted" value={pipeline.value.accepted} />
            <Stat label="Rejected" value={pipeline.value.rejected} bad href="/dashboard/orders?status=rejected" />
            <Stat label="Failed" value={pipeline.value.failed} bad href="/dashboard/orders?status=failed" />
            <Stat label="Queued" value={pipeline.value.queued} bad={pipeline.value.queued > 0} href="/dashboard/orders?status=queued" />
            <Stat
              label="Never arrived"
              value={neverArrived === null ? '–' : neverArrived}
              bad={neverArrived > 0}
              title={funnelToday ? 'Checkouts that reported failure today minus rejections and failures the backend recorded' : 'Funnel counters are not configured here'}
            />
          </ul>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Top items" subtitle={mtd.label} href="/dashboard/products">
          {items.error ? <Unavailable what="Top items" reason={items.error} /> : items.value.length === 0 ? <Empty /> : (
            <ol className="space-y-2 text-sm">
              {items.value.map((it, i) => (
                <li key={it.item_code} className="flex items-baseline gap-2">
                  <span className="w-4 text-xs text-shop-text-secondary">{i + 1}</span>
                  <Link href={`/dashboard/products/${encodeURIComponent(it.item_code)}`} className="min-w-0 flex-1 truncate hover:underline">{it.item_name || it.item_code}</Link>
                  <span className="tabular-nums text-shop-text-secondary">{tsh(it.revenue, { compact: true })}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
        <Card title="Top customers" subtitle={`${mtd.label} · by total value`} href="/dashboard/customers">
          {customers.error ? <Unavailable what="Top customers" reason={customers.error} /> : customers.value.length === 0 ? <Empty /> : (
            <ol className="space-y-2 text-sm">
              {customers.value.map((c, i) => (
                <li key={c.customer} className="flex items-baseline gap-2">
                  <span className="w-4 text-xs text-shop-text-secondary">{i + 1}</span>
                  <Link href={`/dashboard/customers/${encodeURIComponent(c.customer)}`} className="min-w-0 flex-1 truncate hover:underline">{c.display_name}</Link>
                  <span className="text-xs text-shop-text-secondary">{c.invoices} inv.</span>
                  <span className="tabular-nums text-shop-text-secondary">{tsh(c.revenue, { compact: true })}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
        <Card title="Discounts, promos & combos" subtitle={mtd.label} href="/dashboard/promotions">
          {disc.error || !disc.value ? <Unavailable what="Discount pulse" reason={disc.error} /> : (
            <div className="grid grid-cols-2 gap-3">
              <Mini label="Invoices with a discount" value={share(disc.value.discounted, disc.value.invoices)} sub={`${num(disc.value.discounted)} of ${num(disc.value.invoices)} · ${tsh(disc.value.discount)} given`} />
              <Mini label="Online invoices discounted" value={share(disc.value.discounted_online, disc.value.online_invoices)} sub={`${num(disc.value.discounted_online)} of ${num(disc.value.online_invoices)} app/web`} />
              <Mini label="Orders with a combo" value={promo.value ? share(promo.value.combo_orders, promo.value.orders) : '–'} sub={promo.value ? `${num(promo.value.combo_orders)} of ${num(promo.value.orders)} online orders` : ''} />
              <Mini label="Orders with a promo code" value={promo.value ? share(promo.value.promo_orders, promo.value.orders) : '–'} sub="codes recorded since 3 Sep 2026" />
            </div>
          )}
        </Card>
      </div>

      <Card>
        <StatusDots items={status} />
        <p className="mt-3 text-xs text-shop-text-secondary">
          Invoices as of {fresh.value.synced_at ? `${darTime(fresh.value.synced_at)} (${ago(`${fresh.value.synced_at}Z`)})` : 'never'} ·
          {' '}{num(fresh.value.invoices)} invoices mirrored, latest dated {fresh.value.latest_posting_date ? dateLabel(fresh.value.latest_posting_date) : '–'} ·
          {' '}Pipeline as of page load.
        </p>
      </Card>
    </div>
  );
}

function Stat({ label, value, bad = false, href, title }) {
  const inner = (
    <>
      <p className={`text-2xl font-semibold tabular-nums ${bad && Number(value) > 0 ? 'text-shop-error' : ''}`} title={title}>{value}</p>
      <p className="text-xs text-shop-text-secondary">{label}</p>
    </>
  );
  return <li>{href ? <Link href={href} className="block rounded-shop-sm hover:bg-shop-surface-alt dark:hover:bg-[#252A25]">{inner}</Link> : inner}</li>;
}

function Mini({ label, value, sub }) {
  return (
    <div className="rounded-shop-sm bg-shop-surface-alt p-3 dark:bg-[#252A25]">
      <p className="text-xs text-shop-text-secondary">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      {sub && <p className="text-[11px] text-shop-text-secondary">{sub}</p>}
    </div>
  );
}
