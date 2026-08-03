/**
 * Cloudinary loader for next/image.
 *
 * Product images were previously fetched at a fixed w_400 regardless of the
 * rendered size, so a 64px cart thumbnail downloaded the same 34KB asset a
 * 150px card did (measured live 2026-08-03: w_128 is 5.7KB — a 6x saving).
 * Letting next/image drive the width through this loader serves each slot an
 * image sized for it, and fixes the opposite problem too: the product detail
 * hero was capped at w_800, under-resolved on 3x-density phones.
 *
 * `f_auto,q_auto` stay in the URL — Cloudinary already negotiates WebP/AVIF
 * from the Accept header, so format needs no work here.
 */

export const CLOUDINARY_UPLOAD_PREFIX =
  'https://res.cloudinary.com/di05dpaiq/image/upload/';

export function cloudinaryLoader({ src, width, quality }) {
  // A sheet-supplied override may live on any host; it cannot be resized by
  // Cloudinary, so it passes through untouched (and simply has no srcset).
  if (!src.startsWith(CLOUDINARY_UPLOAD_PREFIX)) return src;
  const assetPath = src.slice(CLOUDINARY_UPLOAD_PREFIX.length);
  const q = quality ? `q_${quality}` : 'q_auto';
  return `${CLOUDINARY_UPLOAD_PREFIX}w_${width},c_fill,f_auto,${q}/${assetPath}`;
}
