/**
 * Related-product suggestions — hand-curated, owner-approved 2026-08-03.
 *
 * There is no purchase-history data yet (the funnel counters only started
 * today), so these are rule-based groupings curated against the REAL catalogue
 * of 2026-08-03 (152 products: 76 vegetables, 46 grocery, 23 fruits, 6 dairy).
 * The intended upgrade path is to replace this with co-occurrence from the
 * orders table once enough baskets exist — the UI does not care where the
 * list comes from.
 *
 * Ranking: products sharing a curated group with the viewed item come first,
 * then the rest of its category; both tiers keep the sheet's sort order.
 * Matching is by keyword against the normalised product name, so new sheet
 * rows join the right group automatically or, at worst, fall back to their
 * category.
 */

import { sellableProducts } from './catalog';

/** Lower-case, trimmed, collapsed whitespace — sheet names carry stray spaces. */
function normalise(name) {
  return String(name ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Each group is a family a shopper plausibly buys together. A product may
// belong to several groups (ghee is dairy and an oil); any shared group counts.
const GROUPS = [
  // Dairy and alternatives — the owner's own example: milk → soya milk,
  // paneer, yoghurt.
  ['milk', 'paneer', 'yoghurt', 'tofu', 'mawa', 'ghee'],
  // The everyday Indian kitchen basket.
  ['onion', 'tomato', 'potato', 'ginger', 'garlic', 'chilli', 'coriander leaves',
    'curry leaves', 'lime', 'lemon'],
  // Leafy greens and fresh herbs.
  ['spinach', 'palak', 'methi', 'amaranthus', 'moringa', 'dill', 'mint',
    'parsely', 'parsley', 'celery', 'lettuce', 'rosemary', 'lemon grass', 'sprouts'],
  // Salad and stir-fry vegetables.
  ['capsicum', 'broccoli', 'cauliflower', 'cabbage', 'zucchini', 'cucumber',
    'carrot', 'beetroot', 'raddish', 'radish', 'cherry tomato', 'lettuce', 'celery',
    'sweet corn'],
  // Indian cooking vegetables.
  ['gourd', 'pumpkin', 'brinjal', 'lady fingers', 'drumstick', 'tindola',
    'chyote', 'suran', 'arbi', 'jackfruit', 'raw banana', 'raw turmeric', 'sem',
    'gwar', 'beans', 'peas', 'toor dana'],
  // Dals and pulses.
  ['daal', 'dal ', 'moong', 'chana', 'urad', 'masoor', 'kidney beans'],
  // Rice and flours.
  ['rice', 'flour', 'besan'],
  // Spices, seasonings and condiments.
  ['powder', 'jeera', 'dhaniya', 'haldi', 'cardamom', 'pepper', 'mustard',
    'coriander whole', 'whole dhania', 'tamarind', 'pickle'],
  // Nuts, dried fruit and seeds.
  ['cashew', 'walnut', 'pista', 'raisin', 'fig', 'almond', 'peanut',
    'moongfali', 'seeds', 'chia'],
  // Oils and ghee.
  ['oil', 'ghee'],
  // Fresh fruit (broadly its own category anyway, but keeps raw banana and
  // coconut connected to it from other categories).
  ['apple', 'banana', 'grapes', 'mango', 'papaya', 'orange', 'melon', 'kiwi',
    'guava', 'pears', 'pomegranate', 'berries', 'painapple', 'pineapple',
    'coconut', 'avocado', 'tangerine', 'machungwa'],
  // Personal care — exists mostly so soap is never "related" to dal.
  ['soap', 'mitti', 'castor'],
];

/** Indexes of every group a product name falls into. */
export function groupsFor(name) {
  const n = normalise(name);
  if (!n) return [];
  const matches = [];
  GROUPS.forEach((keywords, index) => {
    if (keywords.some((k) => n.includes(k))) matches.push(index);
  });
  return matches;
}

/**
 * Suggestions for a product page: sellable, never the product itself,
 * group-mates first, category fill after, `limit` at most.
 */
export function relatedProducts(catalog, product, { limit = 6 } = {}) {
  if (!catalog || !product) return [];
  const own = new Set(groupsFor(product.name));

  const scored = sellableProducts(catalog)
    .filter((p) => p.id !== product.id)
    .map((p) => {
      const sharesGroup = own.size > 0
        && groupsFor(p.name).some((g) => own.has(g));
      const sameCategory = p.categoryId === product.categoryId;
      return { product: p, score: (sharesGroup ? 2 : 0) + (sameCategory ? 1 : 0) };
    })
    .filter((entry) => entry.score > 0);

  // Sheet order within each tier, matching how the rest of the shop sorts.
  scored.sort((a, b) => b.score - a.score || a.product.sortOrder - b.product.sortOrder);
  return scored.slice(0, limit).map((entry) => entry.product);
}
