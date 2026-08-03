import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { redisCredentials, clientIp, rateLimit } from './rateLimit';

const KEYS = [
  'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN',
  'KV_REST_API_URL', 'KV_REST_API_TOKEN',
];

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
});

describe('redisCredentials — naming must match what the provider actually creates', () => {
  it('reads the Vercel Marketplace names', () => {
    // Verified 2026-08-03: the Upstash integration with prefix KV creates
    // exactly these. If this test fails, rate limiting has silently degraded
    // to per-instance memory rather than erroring.
    process.env.KV_REST_API_URL = 'https://example.upstash.io';
    process.env.KV_REST_API_TOKEN = 'token-abc';
    expect(redisCredentials()).toEqual({
      url: 'https://example.upstash.io',
      token: 'token-abc',
    });
  });

  it('reads the Upstash console names', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://console.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token-xyz';
    expect(redisCredentials()).toEqual({
      url: 'https://console.upstash.io',
      token: 'token-xyz',
    });
  });

  it('prefers UPSTASH_* when both are present', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://a';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'ta';
    process.env.KV_REST_API_URL = 'https://b';
    process.env.KV_REST_API_TOKEN = 'tb';
    expect(redisCredentials().url).toBe('https://a');
  });

  it('returns null when unconfigured', () => {
    expect(redisCredentials()).toBeNull();
  });

  it('returns null when only half the pair is set', () => {
    process.env.KV_REST_API_URL = 'https://example.upstash.io';
    expect(redisCredentials()).toBeNull();
  });
});

describe('clientIp', () => {
  const req = (headers) => ({ headers: { get: (k) => headers[k.toLowerCase()] ?? null } });

  it('takes the leftmost x-forwarded-for entry', () => {
    expect(clientIp(req({ 'x-forwarded-for': '203.0.113.1, 70.41.3.18' }))).toBe('203.0.113.1');
  });

  it('falls back to x-real-ip', () => {
    expect(clientIp(req({ 'x-real-ip': '198.51.100.7' }))).toBe('198.51.100.7');
  });

  it('never throws when nothing is present', () => {
    expect(clientIp(req({}))).toBe('unknown');
  });
});

describe('rateLimit in-memory fallback', () => {
  it('allows up to the limit then blocks', async () => {
    const ip = `192.0.2.${Math.floor(Math.random() * 200)}`;
    const opts = { limit: 3, windowMs: 60_000 };
    const results = [];
    for (let i = 0; i < 4; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      results.push((await rateLimit('test', ip, opts)).success);
    }
    expect(results).toEqual([true, true, true, false]);
  });

  it('buckets separately per IP', async () => {
    const opts = { limit: 1, windowMs: 60_000 };
    expect((await rateLimit('sep', '192.0.2.240', opts)).success).toBe(true);
    expect((await rateLimit('sep', '192.0.2.240', opts)).success).toBe(false);
    expect((await rateLimit('sep', '192.0.2.241', opts)).success).toBe(true);
  });
});

describe('rateLimit fails open when Redis is unreachable', () => {
  it('allows the request rather than blocking checkout', async () => {
    process.env.KV_REST_API_URL = 'https://unreachable.invalid';
    process.env.KV_REST_API_TOKEN = 'token';
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
    const result = await rateLimit('outage', '192.0.2.99', { limit: 1, windowMs: 60_000 });
    expect(result.success).toBe(true);
    vi.restoreAllMocks();
  });
});
