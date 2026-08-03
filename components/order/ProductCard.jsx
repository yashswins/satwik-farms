'use client';

import Link from 'next/link';
import { IoAdd, IoCheckmark } from 'react-icons/io5';
import { useState } from 'react';

import ProductImage from '@/components/order/ProductImage';
import { formatPrice } from '@/lib/order/format';
import { useCartStore } from '@/lib/order/stores';

export default function ProductCard({ product, fluid = false }) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (event) => {
    // The whole card is a link to the product page; adding must not navigate.
    event.preventDefault();
    event.stopPropagation();
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <Link
      href={`/order/product/${encodeURIComponent(product.id)}`}
      className={`flex flex-col rounded-shop-md border border-shop-border bg-shop-surface p-3
                  transition-shadow active:shadow-sm md:hover:shadow-md
                  ${fluid ? 'w-full' : 'w-[150px] shrink-0 md:w-auto'}`}
    >
      <div className="relative mb-2 h-[92px] w-full overflow-hidden rounded-shop-sm bg-shop-surface-alt sm:h-[120px] lg:h-[140px]">
        <ProductImage product={product} sizes="(max-width: 768px) 150px, 240px" />
        {product.badge && (
          <span className="absolute left-1 top-1 rounded-full bg-shop-primary px-2 py-0.5
                           text-[10px] font-semibold text-white">
            {product.badge}
          </span>
        )}
      </div>

      <p className="line-clamp-2 min-h-[34px] text-[13px] font-medium leading-[17px] text-shop-text">
        {product.name}
      </p>
      {product.unit && (
        <p className="mt-0.5 text-[11px] text-shop-text-secondary">{product.unit}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-shop-text">
          {formatPrice(product.price)}
        </span>
        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors
                      ${justAdded ? 'bg-shop-primary-dark' : 'bg-shop-primary'} text-white`}
        >
          {justAdded ? <IoCheckmark aria-hidden /> : <IoAdd aria-hidden />}
        </button>
      </div>
    </Link>
  );
}
