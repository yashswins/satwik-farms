import { describe, expect, it } from 'vitest';

import { addDays, darDate, daysBetween, granularityFor, resolvePeriod } from './periods';

// 2026-09-03 21:30 UTC is 2026-09-04 00:30 in Dar — the Dar date must win.
const LATE_UTC = new Date('2026-09-03T21:30:00Z');
const MIDDAY = new Date('2026-09-03T09:00:00Z'); // 12:00 Dar, Thursday

describe('darDate', () => {
  it('uses the Dar calendar, not UTC', () => {
    expect(darDate(LATE_UTC)).toBe('2026-09-04');
    expect(darDate(MIDDAY)).toBe('2026-09-03');
  });
});

describe('resolvePeriod', () => {
  it('today compares with yesterday', () => {
    const p = resolvePeriod('today', { now: MIDDAY });
    expect([p.start, p.end, p.compareStart, p.compareEnd]).toEqual(['2026-09-03', '2026-09-03', '2026-09-02', '2026-09-02']);
  });

  it('this week runs Monday to today and compares with the same days last week', () => {
    const p = resolvePeriod('week', { now: MIDDAY }); // Thursday
    expect([p.start, p.end]).toEqual(['2026-08-31', '2026-09-03']);
    expect([p.compareStart, p.compareEnd]).toEqual(['2026-08-24', '2026-08-27']);
    expect(p.days).toBe(4);
  });

  it('a Monday is a one-day week', () => {
    const p = resolvePeriod('week', { now: new Date('2026-09-07T09:00:00Z') });
    expect([p.start, p.end]).toEqual(['2026-09-07', '2026-09-07']);
  });

  it('month to date compares with the same days of the previous month', () => {
    const p = resolvePeriod('mtd', { now: MIDDAY });
    expect([p.start, p.end]).toEqual(['2026-09-01', '2026-09-03']);
    expect([p.compareStart, p.compareEnd]).toEqual(['2026-08-01', '2026-08-03']);
  });

  it('month to date on the 31st clamps the comparison to a shorter month', () => {
    const p = resolvePeriod('mtd', { now: new Date('2026-07-31T09:00:00Z') });
    expect(p.compareEnd).toBe('2026-06-30');
  });

  it('last month is a whole month and compares with the month before', () => {
    const p = resolvePeriod('lastmonth', { now: MIDDAY });
    expect([p.start, p.end]).toEqual(['2026-08-01', '2026-08-31']);
    expect([p.compareStart, p.compareEnd]).toEqual(['2026-07-01', '2026-07-31']);
  });

  it('last month across a year boundary', () => {
    const p = resolvePeriod('lastmonth', { now: new Date('2027-01-15T09:00:00Z') });
    expect([p.start, p.end]).toEqual(['2026-12-01', '2026-12-31']);
    expect([p.compareStart, p.compareEnd]).toEqual(['2026-11-01', '2026-11-30']);
  });

  it('quarter and year to date', () => {
    const q = resolvePeriod('qtd', { now: MIDDAY });
    expect([q.start, q.end, q.compareStart]).toEqual(['2026-07-01', '2026-09-03', '2026-04-01']);
    expect(q.compareEnd).toBe(addDays('2026-04-01', q.days - 1));
    const y = resolvePeriod('ytd', { now: MIDDAY });
    expect([y.start, y.end, y.compareStart, y.compareEnd]).toEqual(['2026-01-01', '2026-09-03', '2025-01-01', '2025-09-03']);
  });

  it('last 30 days and its comparison do not overlap', () => {
    const p = resolvePeriod('last30', { now: MIDDAY });
    expect(p.days).toBe(30);
    expect(daysBetween(p.compareStart, p.compareEnd)).toBe(30);
    expect(addDays(p.compareEnd, 1)).toBe(p.start);
  });

  it('custom ranges are clamped to today, ordered, and compared with the same length before', () => {
    const p = resolvePeriod('custom', { now: MIDDAY, from: '2026-09-10', to: '2026-08-30' });
    expect([p.start, p.end]).toEqual(['2026-08-30', '2026-09-03']);
    expect([p.compareStart, p.compareEnd]).toEqual(['2026-08-25', '2026-08-29']);
    const bad = resolvePeriod('custom', { now: MIDDAY, from: 'nope', to: '2026-13-99' });
    expect(bad.days).toBe(7);
  });

  it('unknown keys fall back to month to date', () => {
    expect(resolvePeriod('whatever', { now: MIDDAY }).key).toBe('mtd');
  });
});

describe('granularityFor', () => {
  it('picks day, week, month', () => {
    expect(granularityFor(1)).toBe('day');
    expect(granularityFor(45)).toBe('day');
    expect(granularityFor(46)).toBe('week');
    expect(granularityFor(400)).toBe('month');
  });
});

describe('single-day custom periods', () => {
  it('label a chosen single day as such and compare it with the day before', () => {
    const p = resolvePeriod('custom', { now: MIDDAY, from: '2026-08-20', to: '2026-08-20' });
    expect(p.label).toBe('Single day');
    expect(p.days).toBe(1);
    expect(p.compareStart).toBe('2026-08-19');
    expect(p.compareEnd).toBe('2026-08-19');
    expect(p.compareLabel).toBe('vs previous 1 day');
  });
  it('label multi-day custom ranges as chosen dates', () => {
    expect(resolvePeriod('custom', { now: MIDDAY, from: '2026-08-01', to: '2026-08-15' }).label).toBe('Chosen dates');
  });
});
