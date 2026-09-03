import { describe, expect, it } from 'vitest';

import { decideSignIn, normaliseEmail, safeCallbackPath } from './access';

const owner = { email: 'namansheel@gmail.com', role: 'admin', active: true };

describe('decideSignIn', () => {
  it('lets an active, verified, allowlisted address in with its role', () => {
    expect(decideSignIn({ email: 'NamanSheel@gmail.com', email_verified: true }, owner))
      .toEqual({ ok: true, email: 'namansheel@gmail.com', role: 'admin' });
  });

  it('refuses when Google has not verified the address', () => {
    expect(decideSignIn({ email: 'namansheel@gmail.com', email_verified: false }, owner).reason).toBe('unverified');
    expect(decideSignIn({ email: 'namansheel@gmail.com' }, owner).reason).toBe('unverified');
  });

  it('refuses anyone not on the list, however verified', () => {
    expect(decideSignIn({ email: 'stranger@gmail.com', email_verified: true }, null).reason).toBe('not_allowlisted');
  });

  it('refuses a row for a different address (defence against a sloppy lookup)', () => {
    const r = decideSignIn({ email: 'stranger@gmail.com', email_verified: true }, owner);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('not_allowlisted');
  });

  it('refuses a deactivated row', () => {
    expect(decideSignIn({ email: 'namansheel@gmail.com', email_verified: true }, { ...owner, active: false }).reason)
      .toBe('deactivated');
  });

  it('never invents a role', () => {
    expect(decideSignIn({ email: 'x@gmail.com', email_verified: true }, { email: 'x@gmail.com', role: 'owner', active: true }).role)
      .toBe('staff');
  });

  it('normalises email', () => {
    expect(normaliseEmail('  A@B.com ')).toBe('a@b.com');
    expect(normaliseEmail(null)).toBe('');
  });
});

describe('safeCallbackPath', () => {
  it('keeps dashboard paths and rejects everything else', () => {
    expect(safeCallbackPath('/dashboard/sales?period=mtd')).toBe('/dashboard/sales?period=mtd');
    expect(safeCallbackPath('/order')).toBe('/dashboard');
    expect(safeCallbackPath('//evil.example')).toBe('/dashboard');
    expect(safeCallbackPath('https://evil.example/dashboard')).toBe('/dashboard');
    expect(safeCallbackPath(undefined)).toBe('/dashboard');
  });
});
