import { describe, it, expect } from 'vitest';

import { hourInDar, isSameDayWindow, SAME_DAY_CUTOFF_HOUR } from './delivery';

// Dar es Salaam is UTC+3 with no daylight saving, so fixed UTC instants map to
// fixed local hours all year round.
describe('delivery cutoff — evaluated in Dar es Salaam time', () => {
  it('converts UTC instants to Dar hours', () => {
    expect(hourInDar(new Date('2026-08-03T10:59:00Z'))).toBe(13);
    expect(hourInDar(new Date('2026-08-03T11:00:00Z'))).toBe(14);
  });

  it('handles midnight without the ICU "24" quirk', () => {
    expect(hourInDar(new Date('2026-08-03T21:00:00Z'))).toBe(0);
  });

  it('13:59 in Dar still qualifies for same-day', () => {
    expect(isSameDayWindow(new Date('2026-08-03T10:59:00Z'))).toBe(true);
  });

  it('14:00 in Dar does not', () => {
    expect(isSameDayWindow(new Date('2026-08-03T11:00:00Z'))).toBe(false);
  });

  it('a browser in another timezone gets the same answer', () => {
    // 16:00 in Dar es Salaam is 13:00 UTC — a UTC browser clock must not
    // conclude same-day is still open.
    expect(isSameDayWindow(new Date('2026-08-03T13:00:00Z'))).toBe(false);
  });

  it('cutoff is the documented 2 PM', () => {
    expect(SAME_DAY_CUTOFF_HOUR).toBe(14);
  });
});
