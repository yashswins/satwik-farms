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
  // Both names are accepted: Cloudflare's own tooling standardises on
  // TURNSTILE_SECRET, while TURNSTILE_SECRET_KEY reads more naturally beside
  // NEXT_PUBLIC_TURNSTILE_SITE_KEY. Supporting both means the variable can be
  // named either way in Vercel without a code change — and, more importantly,
  // a mismatch cannot silently disable bot protection.
  const secret = process.env.TURNSTILE_SECRET || process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[shop] Neither TURNSTILE_SECRET nor TURNSTILE_SECRET_KEY is set — bot '
        + 'protection is DISABLED.',
      );
    }
    return { ok: true, reason: 'not_configured' };
  }

  // Half-configured: a secret but no site key. The widget cannot render without
  // the site key, so no token can ever exist, and rejecting on a missing token
  // would fail EVERY order with a 403 that looks like a bot block. That is a
  // deployment mistake, not an attack, and the correct response is to keep
  // trading and shout about it rather than silently stop taking money.
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    console.error(
      '[shop] TURNSTILE secret is set but NEXT_PUBLIC_TURNSTILE_SITE_KEY is not. '
      + 'The widget cannot render, so no token can be produced. Allowing orders '
      + 'through UNVERIFIED — set the site key in the same environment to restore '
      + 'bot protection.',
    );
    return { ok: true, reason: 'site_key_missing' };
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
