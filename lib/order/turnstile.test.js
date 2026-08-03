import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { verifyTurnstile } from './turnstile';

const KEYS = ['TURNSTILE_SECRET', 'TURNSTILE_SECRET_KEY', 'NEXT_PUBLIC_TURNSTILE_SITE_KEY'];
let saved;

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  KEYS.forEach((k) => delete process.env[k]);
});
afterEach(() => {
  KEYS.forEach((k) => {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  });
  vi.restoreAllMocks();
});

describe('verifyTurnstile configuration handling', () => {
  it('allows when nothing is configured (local development)', async () => {
    const r = await verifyTurnstile(null, '1.2.3.4');
    expect(r.ok).toBe(true);
    expect(r.reason).toBe('not_configured');
  });

  it('allows when a secret is set but the site key is NOT', async () => {
    // The deployment mistake that would otherwise 403 every single order: the
    // widget cannot render without a site key, so no token can ever exist.
    process.env.TURNSTILE_SECRET_KEY = 'secret';
    const r = await verifyTurnstile(null, '1.2.3.4');
    expect(r.ok).toBe(true);
    expect(r.reason).toBe('site_key_missing');
  });

  it('rejects a missing token once BOTH keys are configured', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret';
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'site';
    const r = await verifyTurnstile(null, '1.2.3.4');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('missing_token');
  });

  it('accepts either secret variable name', async () => {
    process.env.TURNSTILE_SECRET = 'secret';
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'site';
    const r = await verifyTurnstile(null, '1.2.3.4');
    expect(r.reason).toBe('missing_token'); // reached the token check, so the secret was found
  });
});

describe('verifyTurnstile against siteverify', () => {
  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = 'secret';
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'site';
  });

  it('accepts a token Cloudflare confirms', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ json: async () => ({ success: true }) });
    expect((await verifyTurnstile('tok', '1.2.3.4')).ok).toBe(true);
  });

  it('rejects a token Cloudflare refuses, and reports why', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ success: false, 'error-codes': ['timeout-or-duplicate'] }),
    });
    const r = await verifyTurnstile('spent-token', '1.2.3.4');
    expect(r.ok).toBe(false);
    expect(r.reason).toContain('timeout-or-duplicate');
  });

  it('allows when Cloudflare itself is unreachable', async () => {
    // Owner decision: an outage at Cloudflare must not stop the shop trading.
    // Deliberate deviation from Cloudflare's fail-closed recipe.
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('ENOTFOUND'));
    const r = await verifyTurnstile('tok', '1.2.3.4');
    expect(r.ok).toBe(true);
    expect(r.reason).toBe('verifier_unreachable');
  });
});
