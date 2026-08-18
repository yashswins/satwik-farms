import { describe, it, expect } from 'vitest';

import {
  bestTier, comboSavings, computeAutoDiscount, orderTotals, roundDiscountUp,
} from './discounts';

// The owner's worked example, 2026-08-06.
const TIERS = [
  { id: 't1', minSpend: 25000, percentOff: 3, label: '3% off over 25,000', isActive: true },
  { id: 't2', minSpend: 50000, percentOff: 5, label: '5% off over 50,000', isActive: true },
  { id: 't3', minSpend: 100000, percentOff: 8, label: '8% off over 100,000', isActive: true },
];
const CATALOG = { discountTiers: TIERS, promoCodes: [], combos: [] };

describe('roundDiscountUp — must match the backend exactly', () => {
  it('rounds up to a whole hundred', () => {
    expect(roundDiscountUp(750)).toBe(800);
    expect(roundDiscountUp(1499.97)).toBe(1500);
    expect(roundDiscountUp(900)).toBe(900);
  });

  it('never gives less than earned, nor a whole extra hundred', () => {
    for (const raw of [1, 99, 100, 101, 199, 4999.95, 12345]) {
      const r = roundDiscountUp(raw);
      expect(r % 100).toBe(0);
      expect(r).toBeGreaterThanOrEqual(raw);
      expect(r - raw).toBeLessThan(100);
    }
  });

  it('is zero for nothing and for nonsense', () => {
    expect(roundDiscountUp(0)).toBe(0);
    expect(roundDiscountUp(-5)).toBe(0);
    expect(roundDiscountUp(NaN)).toBe(0);
  });
});

describe('spend tiers', () => {
  // These figures are duplicated in the backend's test_auto_discounts.py on
  // purpose: if the two ever disagree the server rejects what the customer saw.
  it.each([
    [24999, 0],
    [25000, 800],
    [30000, 900],
    [49999, 1500],
    [50000, 2500],
    [99999, 5000],
    [100000, 8000],
    [250000, 20000],
  ])('a basket of %i earns %i', (subtotal, expected) => {
    expect(computeAutoDiscount(subtotal, CATALOG).amount).toBe(expected);
  });

  it('does not stack — 100,000 gets 8%, not 3 + 5 + 8', () => {
    expect(computeAutoDiscount(100000, CATALOG).amount).toBe(8000);
  });

  it('ignores an inactive tier', () => {
    const rigged = {
      discountTiers: [{ id: 'x', minSpend: 1000, percentOff: 90, isActive: false }],
    };
    expect(computeAutoDiscount(50000, rigged).amount).toBe(0);
  });

  it('applies nothing to an empty basket', () => {
    expect(computeAutoDiscount(0, CATALOG).amount).toBe(0);
  });

  it('survives a catalogue with no tiers tab at all', () => {
    // The sheet gains discount_tiers after this code ships.
    expect(computeAutoDiscount(100000, { promoCodes: [] }).amount).toBe(0);
    expect(computeAutoDiscount(100000, null).amount).toBe(0);
  });

  it('names the tier so checkout can explain the discount', () => {
    expect(computeAutoDiscount(30000, CATALOG).label).toBe('3% off over 25,000');
  });
});

describe('auto-applying flat promos', () => {
  const withPromo = {
    ...CATALOG,
    promoCodes: [
      { code: 'AUTO5K', amountOff: 5000, minimumSpend: 40000, active: true,
        autoApply: true, label: 'TSH 5,000 off over 40,000' },
      { code: 'TYPED', amountOff: 9000, minimumSpend: 0, active: true, autoApply: false },
    ],
  };

  it('applies without anything being typed', () => {
    const got = computeAutoDiscount(45000, withPromo);
    expect(got.amount).toBe(5000);
    expect(got.source).toBe('auto_promo');
  });

  it('respects its minimum spend', () => {
    // 39,000 misses the 40,000 floor, so the 3% tier wins: 1,170 -> 1,200.
    const got = computeAutoDiscount(39000, withPromo);
    expect(got.source).toBe('tier');
    expect(got.amount).toBe(1200);
  });

  it('gives the customer whichever is better', () => {
    expect(computeAutoDiscount(45000, withPromo).amount).toBe(5000);   // promo beats 3%
    expect(computeAutoDiscount(250000, withPromo).amount).toBe(20000); // 8% beats promo
  });

  it('still honours a typed code — nothing that worked may stop working', () => {
    const got = computeAutoDiscount(10000, withPromo, 'typed');
    expect(got.amount).toBe(9000);
    expect(got.source).toBe('promo_code');
  });

  it('does not grant a typed code that was not typed', () => {
    expect(computeAutoDiscount(10000, withPromo).amount).toBe(0);
  });
});

describe('combo savings shown at checkout', () => {
  const catalog = {
    ...CATALOG,
    combos: [{
      id: 'combo_002', name: 'Combo offer', price: 11000, originalPrice: 12000,
      lineItems: [{ id: 'VEG-048', quantity: 4 }, { id: 'VEG-050', quantity: 4 },
                  { id: 'VEG-047', quantity: 2 }],
    }],
  };

  it('reports what a whole combo saved', () => {
    const items = [
      { productId: 'VEG-048', comboId: 'combo_002', quantity: 4 },
      { productId: 'VEG-050', comboId: 'combo_002', quantity: 4 },
      { productId: 'VEG-047', comboId: 'combo_002', quantity: 2 },
    ];
    const [saving] = comboSavings(items, catalog);
    expect(saving.saved).toBe(1000);
    expect(saving.name).toBe('Combo offer');
  });

  it('reports pro rata when only part of a combo is in the basket', () => {
    const items = [{ productId: 'VEG-048', comboId: 'combo_002', quantity: 5 }];
    expect(comboSavings(items, catalog)[0].saved).toBe(500);
  });

  it('ignores ordinary lines', () => {
    expect(comboSavings([{ productId: 'VEG-048', quantity: 3 }], catalog)).toEqual([]);
  });
});

describe('orderTotals', () => {
  it('never lets a discount produce a negative total', () => {
    const rigged = {
      discountTiers: [{ id: 'x', minSpend: 0, percentOff: 500, isActive: true }],
      promoCodes: [], combos: [],
    };
    const t = orderTotals(1000, 0, rigged, [], null);
    expect(t.total).toBe(0);
    expect(t.discount.amount).toBeLessThanOrEqual(1000);
  });

  it('adds delivery after the discount', () => {
    const t = orderTotals(30000, 2000, CATALOG, [], null);
    expect(t.discount.amount).toBe(900);
    expect(t.total).toBe(31100);
  });
});
