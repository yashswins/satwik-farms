/**
 * Money and text formatting for the ordering app.
 *
 * Mirrors the phone app so prices read identically in both places
 * (Satwik_Farms_React/src/utils/imageLoader.ts:79-83).
 */

/** Tanzanian Shilling, rounded to the nearest 100 — matches the phone app. */
export function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'TSH 0';
  const rounded = Math.round(amount / 100) * 100;
  return `TSH ${rounded.toLocaleString('en-US')}`;
}

/** Bare number with thousands separators, no currency prefix. */
export function formatAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0';
  return (Math.round(amount / 100) * 100).toLocaleString('en-US');
}

const CLOUDINARY_CLOUD = 'di05dpaiq';

/**
 * Product image URL.
 *
 * Built from the product id, as the phone app does
 * (Satwik_Farms_React/src/utils/imageLoader.ts:28-37). `image_url_override`
 * takes precedence when the sheet supplies one.
 */
export function productImageUrl(product, { width = 400 } = {}) {
  if (!product) return null;
  const override = product.imageUrlOverride || product.image_url_override;
  if (override) return override;
  const id = product.id || product.accu360Sku || product.accu360_sku;
  if (!id) return null;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/w_${width},c_fill,f_auto,q_auto/${id}`;
}

/** "Good morning" / "Good afternoon" / "Good evening" for the home greeting. */
export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
