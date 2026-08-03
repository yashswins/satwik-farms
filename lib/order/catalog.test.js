import { describe, it, expect } from 'vitest';

import {
  mapCatalog, truthy, splitIds, sellableProducts,
  productsInCategory, searchProducts, searchInCategory,
} from './catalog';

/** Shaped exactly like the live Apps Script feed, including its type quirks. */
const RAW = {
  categories: [
    { id: 'Vegetables', name: 'Vegetables', tint_color: '#E8F5E9', sort_order: 2, is_active: true },
    { id: 'Fruits', name: 'Fruits', tint_color: '#FFF3E0', sort_order: 1, is_active: true },
  ],
  products: [
    { id: 'VEG-048', accu360_sku: 'VEG-048', name: 'POTATO', category_id: 'Vegetables',
      price: 1000, original_price: 1000, unit: '0.5 Kg', in_stock: true, is_active: true,
      badge: 'Best Seller', sort_order: 1, description: 'Local potatoes' },
    { id: 'VEG-113', accu360_sku: 'VEG-113', name: 'METHI SPROUTS', category_id: 'Vegetables',
      price: 2000, unit: '100 gram', in_stock: false, is_active: true, sort_order: 2 },
    { id: 'FRU-020', accu360_sku: 'FRU-020', name: 'APPLE', category_id: 'Fruits',
      price: 2500, unit: '1 piece', in_stock: true, is_active: true, sort_order: 1,
      description: 'Crisp imported apples' },
  ],
  featured_sections: [
    { id: 'F1', title: 'Weekly picks', item_ids: 'VEG-048|FRU-020', is_active: true, sort_order: 1 },
  ],
  combos: [
    { id: 'C1', name: 'Salad box', product_ids: 'VEG-048|FRU-020', price: 3000, is_active: true, sort_order: 1 },
  ],
  promo_codes: [{ code: 'FLASH24', amount_off: 1000, minimum_spend: 5000, active: 'NO' }],
  last_updated: '2026-08-03T10:00:00Z',
};

describe('truthy — the feed mixes booleans and YES/NO strings', () => {
  it.each([true, 1, 'YES', 'yes', 'True', '1', 'y'])('%s is true', (v) => {
    expect(truthy(v)).toBe(true);
  });

  it.each([false, 0, 'NO', 'no', '', null, undefined, 'maybe'])('%s is false', (v) => {
    expect(truthy(v)).toBe(false);
  });

  it('treats a boolean false as out of stock', () => {
    // The live feed switched these to real booleans; reading them as strings
    // would mark every product out of stock.
    expect(truthy(false)).toBe(false);
  });
});

describe('splitIds — pipe-separated strings, not arrays', () => {
  it('splits on the pipe', () => {
    expect(splitIds('A|B|C')).toEqual(['A', 'B', 'C']);
  });

  it('trims and drops blanks', () => {
    expect(splitIds(' A | | B ')).toEqual(['A', 'B']);
  });

  it('passes arrays through', () => {
    expect(splitIds(['A', 'B'])).toEqual(['A', 'B']);
  });

  it('returns empty for nothing', () => {
    expect(splitIds(null)).toEqual([]);
    expect(splitIds(undefined)).toEqual([]);
    expect(splitIds('')).toEqual([]);
  });
});

describe('mapCatalog', () => {
  const catalog = mapCatalog(RAW);

  it('maps every product', () => {
    expect(catalog.products).toHaveLength(3);
  });

  it('carries stock status through as a boolean', () => {
    expect(catalog.productsById.get('VEG-048').inStock).toBe(true);
    expect(catalog.productsById.get('VEG-113').inStock).toBe(false);
  });

  it('sorts categories by sort_order', () => {
    expect(catalog.categories.map((c) => c.id)).toEqual(['Fruits', 'Vegetables']);
  });

  it('expands pipe-separated section and combo ids', () => {
    expect(catalog.featuredSections[0].itemIds).toEqual(['VEG-048', 'FRU-020']);
    expect(catalog.combos[0].productIds).toEqual(['VEG-048', 'FRU-020']);
  });

  it('indexes by id and by sku', () => {
    expect(catalog.productsById.get('FRU-020').name).toBe('APPLE');
    expect(catalog.productsBySku.get('FRU-020').id).toBe('FRU-020');
  });

  it('survives an empty or malformed feed', () => {
    expect(mapCatalog(null).products).toEqual([]);
    expect(mapCatalog({}).products).toEqual([]);
    expect(mapCatalog({ products: [] }).categories).toEqual([]);
  });

  it('drops products with no id rather than rendering blanks', () => {
    expect(mapCatalog({ products: [{ name: 'ghost' }] }).products).toEqual([]);
  });
});

describe('sellableProducts', () => {
  it('excludes out-of-stock items', () => {
    const ids = sellableProducts(mapCatalog(RAW)).map((p) => p.id);
    expect(ids).toContain('VEG-048');
    expect(ids).not.toContain('VEG-113');
  });

  it('excludes inactive items', () => {
    const catalog = mapCatalog({
      products: [{ id: 'X', name: 'X', price: 1, in_stock: true, is_active: false }],
    });
    expect(sellableProducts(catalog)).toHaveLength(0);
  });
});

describe('productsInCategory', () => {
  const catalog = mapCatalog(RAW);

  it('filters by category and hides unsellable items', () => {
    expect(productsInCategory(catalog, 'Vegetables').map((p) => p.id)).toEqual(['VEG-048']);
  });

  it('honours the row limit', () => {
    expect(productsInCategory(catalog, 'Vegetables', { limit: 0 })).toHaveLength(0);
  });
});

describe('search', () => {
  const catalog = mapCatalog(RAW);

  it('matches product names case-insensitively', () => {
    expect(searchProducts(catalog, 'pot').map((p) => p.id)).toEqual(['VEG-048']);
  });

  it('returns nothing for an empty query', () => {
    expect(searchProducts(catalog, '  ')).toEqual([]);
  });

  it('does NOT match descriptions globally', () => {
    // Deliberate asymmetry, mirroring the phone app.
    expect(searchProducts(catalog, 'crisp')).toEqual([]);
  });

  it('DOES match descriptions within a category', () => {
    expect(searchInCategory(catalog, 'Fruits', 'crisp').map((p) => p.id)).toEqual(['FRU-020']);
  });
});
