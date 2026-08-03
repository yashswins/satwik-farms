'use client';

import Image from 'next/image';
import { useState } from 'react';
import { IoLeafOutline } from 'react-icons/io5';

import { productImageUrl } from '@/lib/order/format';
import { cloudinaryLoader } from '@/lib/order/imageLoader';

/**
 * Product photograph with a graceful fallback.
 *
 * Image URLs are derived from the product id, so a product whose Cloudinary
 * asset was never uploaded produces a 404 — three of the 152 live products are
 * in that state today. Without this the browser renders its broken-image glyph,
 * which makes a shop look abandoned. A leaf placeholder is quieter and honest.
 *
 * `sizes` is what controls download weight: next/image builds a srcset through
 * the Cloudinary loader and the browser picks a width to match the rendered
 * slot and device density. Keep it honest for new call sites.
 */
export default function ProductImage({ product, sizes = '150px', className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = productImageUrl(product);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-shop-surface-alt ${className}`}
        role="img"
        aria-label={`${product?.name ?? 'Product'} (no photo available)`}
      >
        <IoLeafOutline aria-hidden className="text-[28px] text-shop-primary-light" />
      </div>
    );
  }

  return (
    <Image
      loader={cloudinaryLoader}
      src={src}
      alt={product?.name ?? ''}
      fill
      sizes={sizes}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
