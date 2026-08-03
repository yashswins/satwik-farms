/**
 * Delivery timing.
 *
 * The business rule comes from the FAQ (strings.js FAQ_DELIVERY): orders before
 * 2 PM are typically delivered the same day, later orders the next day. The
 * shop runs on Dar es Salaam time (UTC+3, no daylight saving), so the cutoff is
 * evaluated in that timezone regardless of where the customer's browser is.
 *
 * Owner said the 2 PM cutoff is firm for now but may change — that is why it is
 * a single named constant here and nowhere else.
 */

export const DELIVERY_TIMEZONE = 'Africa/Dar_es_Salaam';

/** 24h clock. Change this one line if the cutoff ever moves. */
export const SAME_DAY_CUTOFF_HOUR = 14;

/** Human-readable form of the cutoff for copy. Kept beside the hour so the
 *  two cannot drift apart. */
export const SAME_DAY_CUTOFF_LABEL = '2 PM';

/** Hour of day (0-23) in Dar es Salaam for a given instant. */
export function hourInDar(date = new Date()) {
  const hour = new Intl.DateTimeFormat('en-GB', {
    timeZone: DELIVERY_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  }).format(date);
  // en-GB renders midnight as "24" in some ICU versions; normalise to 0.
  return Number(hour) % 24;
}

/** True while an order placed now would still make today's delivery run. */
export function isSameDayWindow(date = new Date()) {
  return hourInDar(date) < SAME_DAY_CUTOFF_HOUR;
}
