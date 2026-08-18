import { describe, it, expect } from 'vitest';
import { totalQuantityLabel } from './units';

describe('totalQuantityLabel — what the customer actually gets', () => {
  it('turns the combo listing into the amount a shopper thinks in', () => {
    // The live combo: "Buy 2kg Potato, 2kg Onion and 1kg Tomato".
    expect(totalQuantityLabel('0.5 Kg', 4)).toBe('2 Kg');
    expect(totalQuantityLabel('0.5 Kg', 2)).toBe('1 Kg');
  });

  it.each([
    ['0.5 Kg', 3, '1.5 Kg'],
    ['1 Kg', 2, '2 Kg'],
    ['250 gram', 2, '500 g'],
    ['250 gram', 4, '1 Kg'],
    ['100 gram', 3, '300 g'],
    ['0.1 Kg', 5, '500 g'],
  ])('%s x %i is %s', (unit, qty, expected) => {
    expect(totalQuantityLabel(unit, qty)).toBe(expected);
  });

  it('keeps grams as grams below a kilo — nobody asks for 0.25 Kg', () => {
    expect(totalQuantityLabel('250 gram', 1)).toBe('250 g');
  });

  it.each([
    ['100 ml', 3, '300 ml'],
    ['500 ml', 2, '1 L'],
    ['1 liter', 2, '2 L'],
  ])('%s x %i is %s', (unit, qty, expected) => {
    expect(totalQuantityLabel(unit, qty)).toBe(expected);
  });

  it.each([
    ['1 piece', 4, '4 pieces'],
    ['1 piece', 1, '1 piece'],
    ['4 piece', 2, '8 pieces'],
    ['1 bunch', 3, '3 bunches'],
    ['1 box', 2, '2 boxes'],
    ['1 no', 5, '5 nos'],
  ])('%s x %i is %s', (unit, qty, expected) => {
    expect(totalQuantityLabel(unit, qty)).toBe(expected);
  });

  it('does not invent a number it cannot work out', () => {
    expect(totalQuantityLabel('a handful', 3)).toBe('a handful x 3');
    expect(totalQuantityLabel('a handful', 1)).toBe('a handful');
  });

  it('is silent rather than wrong for nonsense', () => {
    expect(totalQuantityLabel('', 3)).toBeNull();
    expect(totalQuantityLabel(null, 3)).toBeNull();
    expect(totalQuantityLabel('0.5 Kg', 0)).toBeNull();
  });

  it('does not show false precision', () => {
    expect(totalQuantityLabel('0.5 Kg', 4)).toBe('2 Kg');
    expect(totalQuantityLabel('0.5 Kg', 4)).not.toBe('2.000 Kg');
  });
});
