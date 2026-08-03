import { describe, it, expect } from 'vitest';

import {
  mapCatalog, truthy, splitIds, sellableProducts, groupIds, bannerHref,
  productsInCategory, promoBannerFrom, searchProducts, searchInCategory,
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

describe('banners — real sheet schema (id, image_url, target_type, target_id)', () => {
  const RAW_BANNERS = {
    products: [],
    banners: [
      { id: 'banner_001', image_url: 'https://placeholder.com/banner1.jpg',
        target_type: 'category', target_id: 'Dairy Products', sort_order: 1, is_active: true },
      { id: 'banner_002', image_url: 'https://placeholder.com/banner2.jpg',
        target_type: 'category', target_id: 'Fruits', sort_order: 2, is_active: false },
    ],
  };

  it('keeps only active banners', () => {
    const { banners } = mapCatalog(RAW_BANNERS);
    expect(banners.map((b) => b.id)).toEqual(['banner_001']);
  });

  it('builds a category link from target_type + target_id', () => {
    const { banners } = mapCatalog(RAW_BANNERS);
    // The sheet has no href column — the destination is described, not given.
    expect(banners[0].href).toBe('/order/category/Dairy%20Products');
  });

  it('survives having no title or subtitle, which the live schema lacks', () => {
    const { banners } = mapCatalog(RAW_BANNERS);
    expect(banners[0].title).toBe('');
    expect(banners[0].subtitle).toBeNull();
    expect(banners[0].targetId).toBe('Dairy Products');
  });
});

describe('bannerHref', () => {
  it('maps each target type', () => {
    expect(bannerHref('category', 'Fruits')).toBe('/order/category/Fruits');
    expect(bannerHref('product', 'VEG-048')).toBe('/order/product/VEG-048');
    expect(bannerHref('combo', 'combo_002')).toBe('/order/combo/combo_002');
  });

  it('is case-insensitive about the type', () => {
    expect(bannerHref('CATEGORY', 'Fruits')).toBe('/order/category/Fruits');
  });

  it('returns null rather than a broken link when the target is unusable', () => {
    expect(bannerHref('category', '')).toBeNull();
    expect(bannerHref('mystery', 'x')).toBeNull();
    expect(bannerHref(null, null)).toBeNull();
    expect(bannerHref('url', 'not-a-url')).toBeNull();
  });

  it('encodes ids containing spaces', () => {
    expect(bannerHref('category', 'Dairy Products')).toBe('/order/category/Dairy%20Products');
  });
});

describe('promoBannerFrom — the one code the home banner may advertise', () => {
  it('picks the highest active discount, like the phone app', () => {
    expect(promoBannerFrom([
      { code: 'small', amount_off: 500, active: 'YES' },
      { code: 'big', amount_off: 2000, active: 'YES' },
      { code: 'huge-but-off', amount_off: 9000, active: 'NO' },
    ])).toEqual({ code: 'BIG', amount_off: 2000 });
  });

  it('handles both the string and boolean active shapes', () => {
    expect(promoBannerFrom([{ code: 'A', amount_off: 100, active: true }]))
      .toEqual({ code: 'A', amount_off: 100 });
    expect(promoBannerFrom([{ code: 'A', amount_off: 100, active: 'NO' }])).toBeNull();
  });

  it('returns null when there is nothing worth advertising', () => {
    expect(promoBannerFrom([])).toBeNull();
    expect(promoBannerFrom(null)).toBeNull();
    expect(promoBannerFrom([{ code: 'ZERO', amount_off: 0, active: 'YES' }])).toBeNull();
    expect(promoBannerFrom([{ code: '', amount_off: 500, active: 'YES' }])).toBeNull();
  });

  it('never leaks the minimum spend or any other field', () => {
    const banner = promoBannerFrom([
      { code: 'X', amount_off: 500, active: 'YES', minimum_spend: 50000, one_time: 'YES' },
    ]);
    expect(Object.keys(banner).sort()).toEqual(['amount_off', 'code']);
  });
});

describe('mapCatalog promo_banner', () => {
  it('maps a server-provided banner', () => {
    const mapped = mapCatalog({ products: [], promo_banner: { code: 'FLASH24', amount_off: 1000 } });
    expect(mapped.promoBanner).toEqual({ code: 'FLASH24', amountOff: 1000 });
  });

  it('is null when absent or junk — the old response shape must keep working', () => {
    expect(mapCatalog(RAW).promoBanner).toBeNull();
    expect(mapCatalog({ products: [], promo_banner: { code: '', amount_off: 5 } }).promoBanner).toBeNull();
    expect(mapCatalog({ products: [], promo_banner: 'junk' }).promoBanner).toBeNull();
  });
});
