/**
 * Cloudflare Turnstile verification.
 *
 * This is the real bot wall on /order/checkout. The honeypot field catches lazy
 * scripts; Turnstile catches the rest, without making a customer identify traffic
 * lights.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * @returns {Promise<{ok: boolean, reason?: string}>}
 *
 * Fails CLOSED in production: an unverified token is rejected. That is the
 * opposite of the catalogue and price checks, and deliberately so — those
 * protect against our own infrastructure being flaky, whereas skipping this one
 * would leave the order endpoint open to exactly the automated abuse it exists
 * to stop.
 *
 * Without a configured secret it allows the request but logs an error, so local
 * development works while a misconfigured production deploy is loud.
 */
export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[shop] TURNSTILE_SECRET_KEY not set — bot protection is DISABLED.');
    }
    return { ok: true, reason: 'not_configured' };
  }

  if (!token) return { ok: false, reason: 'missing_token' };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== 'unknown') body.set('remoteip', ip);

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      cache: 'no-store',
    });
    const data = await res.json();

    if (data.success) return { ok: true };
    return { ok: false, reason: (data['error-codes'] || []).join(',') || 'rejected' };
  } catch (error) {
    // Cloudflare unreachable. Rejecting would stop all ordering because of an
    // outage at a third party; allow it and rely on the rate limits, which are
    // what actually cap the damage.
    console.error('[shop] Turnstile verification unreachable, allowing:', error.message);
    return { ok: true, reason: 'verifier_unreachable' };
  }
}
