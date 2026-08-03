'use client';

import Image from 'next/image';
import { useState } from 'react';
import { IoLeafOutline } from 'react-icons/io5';

import { productImageUrl } from '@/lib/order/format';

/**
 * Product photograph with a graceful fallback.
 *
 * Image URLs are derived from the product id, so a product whose Cloudinary
 * asset was never uploaded produces a 404 — three of the 152 live products are
 * in that state today. Without this the browser renders its broken-image glyph,
 * which makes a shop look abandoned. A leaf placeholder is quieter and honest.
 */
export default function ProductImage({ product, sizes = '150px', width = 400, className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = productImageUrl(product, { width });

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
      src={src}
      alt={product?.name ?? ''}
      fill
      sizes={sizes}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}
