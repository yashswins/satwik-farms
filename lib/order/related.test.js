import { describe, it, expect } from 'vitest';

import { groupsFor, relatedProducts } from './related';

// Shapes mirror mapCatalog output — related.js runs on mapped products.
const P = (id, name, categoryId, extra = {}) => ({
  id, name, categoryId, inStock: true, isActive: true, sortOrder: 0, ...extra,
});

const catalog = {
  products: [
    P('DAI-001', 'MILK', 'Dairy Products', { sortOrder: 1 }),
    P('DAI-002', 'PANEER', 'Dairy Products', { sortOrder: 2 }),
    P('DAI-003', 'YOGHURT', 'Dairy Products', { sortOrder: 3 }),
    P('DAI-004', 'soya milk', 'Dairy Products', { sortOrder: 4 }),
    P('DAI-005', 'Tofu', 'Dairy Products', { sortOrder: 5, inStock: false }),
    P('VEG-001', 'TOMATO', 'Vegetables', { sortOrder: 1 }),
    P('VEG-002', 'ONION', 'Vegetables', { sortOrder: 2 }),
    P('VEG-003', 'ROSEMARY', 'Vegetables', { sortOrder: 3 }),
    P('VEG-004', 'POTATO', 'Vegetables', { sortOrder: 4 }),
    P('VEG-005', 'GARLIC', 'Vegetables', { sortOrder: 5 }),
    P('GRO-001', 'TOOR DAAL', 'Grocery', { sortOrder: 1 }),
    P('GRO-002', 'NEEM AND TULSI SOAP', 'Grocery', { sortOrder: 2 }),
    P('GRO-003', 'YELLOW MOONG DAL', 'Grocery', { sortOrder: 3 }),
  ],
};

describe('groupsFor', () => {
  it('places dairy names in the dairy family', () => {
    const milk = groupsFor('MILK');
    expect(milk.length).toBeGreaterThan(0);
    expect(groupsFor('soya milk').some((g) => milk.includes(g))).toBe(true);
  });

  it('survives the sheet’s stray whitespace', () => {
    expect(groupsFor('RED CHILLI  ')).toEqual(groupsFor('red chilli'));
  });

  it('unknown names simply have no group', () => {
    expect(groupsFor('MYSTERY ITEM')).toEqual([]);
  });
});

describe('relatedProducts', () => {
  const byId = (id) => catalog.products.find((p) => p.id === id);

  it('the owner’s example: milk suggests the other dairy items', () => {
    const names = relatedProducts(catalog, byId('DAI-001')).map((p) => p.name);
    expect(names).toContain('PANEER');
    expect(names).toContain('YOGHURT');
    expect(names).toContain('soya milk');
  });

  it('never suggests the product itself', () => {
    const ids = relatedProducts(catalog, byId('DAI-001')).map((p) => p.id);
    expect(ids).not.toContain('DAI-001');
  });

  it('never suggests something out of stock', () => {
    const ids = relatedProducts(catalog, byId('DAI-001')).map((p) => p.id);
    expect(ids).not.toContain('DAI-005'); // Tofu, inStock: false
  });

  it('kitchen staples outrank same-category herbs for tomato', () => {
    // Three group-mates exist (onion, potato, garlic), so at limit 3 the
    // category-only match (rosemary) must not make the cut.
    const names = relatedProducts(catalog, byId('VEG-001'), { limit: 3 }).map((p) => p.name);
    expect(names).toEqual(expect.arrayContaining(['ONION', 'POTATO', 'GARLIC']));
    expect(names).not.toContain('ROSEMARY');
  });

  it('dal suggests dal before soap, even though both are Grocery', () => {
    const names = relatedProducts(catalog, byId('GRO-001')).map((p) => p.name);
    expect(names.indexOf('YELLOW MOONG DAL')).toBeLessThan(names.indexOf('NEEM AND TULSI SOAP'));
  });

  it('is safe on missing input', () => {
    expect(relatedProducts(null, byId('DAI-001'))).toEqual([]);
    expect(relatedProducts(catalog, null)).toEqual([]);
  });
});
