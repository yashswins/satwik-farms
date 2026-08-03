/**
 * Catalogue normalisation.
 *
 * The Google Sheet feed is inconsistent about types and this is where that stops:
 *
 *   - `in_stock` / `is_active` on products arrive as real JSON booleans, but the
 *     same concepts on promo codes (`active`, `one_time`) arrive as the strings
 *     "YES"/"NO". Both shapes are accepted.
 *   - `item_ids` (featured sections) and `product_ids` (combos) are single
 *     pipe-separated strings, not arrays.
 *
 * Getting either wrong fails quietly — everything renders as out of stock, or a
 * section renders empty — so both are covered by unit tests.
 */

/** Accepts true, 1, "YES", "true", "1", "y" — anything else is false. */
export function truthy(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return ['yes', 'true', '1', 'y'].includes(value.trim().toLowerCase());
  }
  return false;
}

/** Split a pipe-separated id list into a clean array. */
export function splitIds(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  return value.split('|').map((v) => v.trim()).filter(Boolean);
}

function mapProduct(raw) {
  return {
    id: String(raw.id ?? '').trim(),
    name: raw.name ?? '',
    description: raw.description ?? null,
    categoryId: raw.category_id ?? '',
    accu360Sku: String(raw.accu360_sku ?? '').trim(),
    price: Number(raw.price ?? 0),
    originalPrice: raw.original_price == null ? null : Number(raw.original_price),
    unit: raw.unit ?? '',
    inStock: truthy(raw.in_stock),
    isActive: truthy(raw.is_active),
    imageUrlOverride: raw.image_url_override ?? null,
    badge: raw.badge ?? null,
    nutritionInfo: raw.nutrition_info ?? null,
    sortOrder: Number(raw.sort_order ?? 0),
  };
}

function mapCategory(raw) {
  return {
    id: String(raw.id ?? '').trim(),
    name: raw.name ?? '',
    tintColor: raw.tint_color ?? '#EEF4EC',
    isActive: truthy(raw.is_active),
    sortOrder: Number(raw.sort_order ?? 0),
  };
}

function mapBanner(raw) {
  return {
    id: String(raw.id ?? '').trim(),
    title: raw.title ?? '',
    subtitle: raw.subtitle ?? null,
    imageUrl: raw.image_url ?? null,
    isActive: truthy(raw.is_active),
    sortOrder: Number(raw.sort_order ?? 0),
  };
}

function mapFeaturedSection(raw) {
  return {
    id: String(raw.id ?? '').trim(),
    title: raw.title ?? '',
    subtitle: raw.subtitle ?? null,
    itemIds: splitIds(raw.item_ids),
    isActive: truthy(raw.is_active),
    sortOrder: Number(raw.sort_order ?? 0),
  };
}

/**
 * Collapse a pipe-separated id list into unique ids with quantities.
 *
 * Combos express multiples by repeating an id: "Buy 5 kg" arrives as
 * `VEG-048|VEG-048|VEG-048|VEG-048|VEG-048`. Rendering that literally shows the
 * same product five times, so group it into one line with a quantity.
 */
export function groupIds(value) {
  const counts = new Map();
  for (const id of splitIds(value)) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts.entries()].map(([id, quantity]) => ({ id, quantity }));
}

function mapCombo(raw) {
  return {
    id: String(raw.id ?? '').trim(),
    name: raw.name ?? '',
    description: raw.description ?? null,
    // The sheet's column is `combo_price`, NOT `price` — verified against live
    // data 2026-08-03. Reading `price` alone silently rendered every combo as
    // TSH 0, which is exactly the kind of failure that looks like a design
    // choice rather than a bug.
    price: Number(raw.combo_price ?? raw.price ?? 0),
    originalPrice: raw.original_price == null ? null : Number(raw.original_price),
    discountText: raw.discount_text ?? null,
    productIds: splitIds(raw.product_ids),
    // Repeats in product_ids are quantities, not duplicates.
    lineItems: groupIds(raw.product_ids),
    imageUrl: raw.image_url ?? null,
    isActive: truthy(raw.is_active),
    sortOrder: Number(raw.sort_order ?? 0),
  };
}

const bySortOrder = (a, b) => a.sortOrder - b.sortOrder;

/** Normalise the raw feed into the shape the UI consumes. */
export function mapCatalog(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const products = (safe.products ?? []).map(mapProduct).filter((p) => p.id).sort(bySortOrder);
  const categories = (safe.categories ?? []).map(mapCategory).filter((c) => c.id).sort(bySortOrder);

  const productsById = new Map(products.map((p) => [p.id, p]));
  const productsBySku = new Map(products.filter((p) => p.accu360Sku).map((p) => [p.accu360Sku, p]));

  return {
    products,
    categories,
    banners: (safe.banners ?? []).map(mapBanner).filter((b) => b.isActive).sort(bySortOrder),
    featuredSections: (safe.featured_sections ?? [])
      .map(mapFeaturedSection).filter((s) => s.isActive).sort(bySortOrder),
    combos: (safe.combos ?? []).map(mapCombo).filter((c) => c.isActive).sort(bySortOrder),
    productsById,
    productsBySku,
    lastUpdated: safe.last_updated ?? null,
  };
}

/** Products a customer may actually buy: active and in stock. */
export function sellableProducts(catalog) {
  return (catalog?.products ?? []).filter((p) => p.isActive && p.inStock);
}

/** Sellable products in a category. */
export function productsInCategory(catalog, categoryId, { limit } = {}) {
  const list = sellableProducts(catalog).filter((p) => p.categoryId === categoryId);
  return typeof limit === 'number' ? list.slice(0, limit) : list;
}

/**
 * Search by name only — deliberately.
 *
 * The phone app's global search matches name only, while its within-category
 * search also matches description. Keeping that asymmetry so results feel the
 * same in both apps.
 */
export function searchProducts(catalog, query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return [];
  return sellableProducts(catalog).filter((p) => p.name.toLowerCase().includes(q));
}

/** Within-category search: matches name OR description, as the phone app does. */
export function searchInCategory(catalog, categoryId, query) {
  const q = String(query ?? '').trim().toLowerCase();
  const list = productsInCategory(catalog, categoryId);
  if (!q) return list;
  return list.filter(
    (p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q),
  );
}
