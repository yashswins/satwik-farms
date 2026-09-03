import { describe, expect, it } from 'vitest';

import { ago, csvCell, dateLabel, delta, pct, share, tsh } from './format';

describe('tsh', () => {
  it('formats whole shillings with separators', () => {
    expect(tsh(1234567.4)).toBe('TSH 1,234,567');
    expect(tsh(null)).toBe('TSH 0');
  });
  it('compacts large amounts on tiles', () => {
    expect(tsh(1_240_000, { compact: true })).toBe('TSH 1.24M');
    expect(tsh(2_000_000, { compact: true })).toBe('TSH 2M');
    expect(tsh(45_600, { compact: true })).toBe('TSH 45.6k');
    expect(tsh(9_999, { compact: true })).toBe('TSH 9,999');
  });
});

describe('delta', () => {
  it('reports direction, goodness and text', () => {
    expect(delta(120, 100)).toMatchObject({ direction: 'up', good: true, text: '▲ 20.0%' });
    expect(delta(80, 100)).toMatchObject({ direction: 'down', good: false, text: '▼ 20.0%' });
    expect(delta(80, 100, 'down')).toMatchObject({ direction: 'down', good: true });
    expect(delta(100, 100)).toMatchObject({ direction: 'flat', good: null });
  });
  it('handles a zero baseline honestly', () => {
    expect(delta(50, 0)).toMatchObject({ pct: null, text: 'new' });
    expect(delta(0, 0)).toMatchObject({ pct: null, text: 'no change' });
  });
});

describe('share and pct', () => {
  it('shows raw fractions under ten events', () => {
    expect(share(2, 7)).toBe('2 of 7');
    expect(share(20, 40)).toBe('50%');
    expect(share(0, 0)).toBe('–');
    expect(pct(0.256)).toBe('25.6%');
    expect(pct(null)).toBe('–');
  });
});

describe('dates', () => {
  it('labels dates', () => {
    expect(dateLabel('2026-09-03')).toBe('Thu 3 Sep');
    expect(dateLabel('2026-09-03', { year: true })).toBe('Thu 3 Sep 2026');
  });
  it('relative ages', () => {
    const now = Date.parse('2026-09-03T10:00:00Z');
    expect(ago('2026-09-03T09:57:00Z', now)).toBe('3 min ago');
    expect(ago('2026-09-03T07:00:00Z', now)).toBe('3 h ago');
    expect(ago('2026-08-30T10:00:00Z', now)).toBe('4 d ago');
    expect(ago(null)).toBe('never');
  });
});

describe('csvCell', () => {
  it('neutralises formulas and quotes', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell('+255 700')).toBe("'+255 700");
    expect(csvCell('plain')).toBe('plain');
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell(null)).toBe('');
  });
});
