'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { IoAdd, IoRemove, IoHeart, IoHeartOutline } from 'react-icons/io5';

import ProductImage from '@/components/order/ProductImage';
import ScreenHeader from '@/components/order/ScreenHeader';
import { ProductRow } from '@/components/order/ProductGrid';
import { formatPrice } from '@/lib/order/format';
import { trackEvent } from '@/lib/order/metrics';
import { relatedProducts } from '@/lib/order/related';
import { S } from '@/lib/order/strings';
import { useCartStore, useFavoritesStore } from '@/lib/order/stores';
import { useCatalog } from '@/lib/order/useCatalog';

export default function ProductDetail({ productId }) {
  const { catalog, loading, error } = useCatalog();
  const addItem = useCartStore((s) => s.addItem);
  const favorites = useFavoritesStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = catalog?.productsById.get(productId) ?? null;
  const isFavorite = favorites.ids.includes(productId);
  const related = useMemo(
    () => relatedProducts(catalog, product),
    [catalog, product],
  );

  useEffect(() => { trackEvent('product_viewed'); }, [productId]);

  if (loading) {
    return (
      <>
        <ScreenHeader title="Loading…" />
        <div className="p-4">
          <div className="h-56 w-full animate-pulse rounded-shop-md bg-shop-surface-alt" />
          <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-shop-surface-alt" />
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <ScreenHeader title="Product" />
        <div className="p-8 text-center">
          <p className="text-[15px] font-medium text-shop-text">
            {error ? 'We couldn’t load this product' : 'This product is no longer available'}
          </p>
          <Link
            href="/order"
            className="mt-4 inline-block rounded-full bg-shop-primary px-6 py-2.5
                       text-[14px] font-semibold text-white"
          >
            Back to shop
          </Link>
        </div>
      </>
    );
  }

  const sellable = product.isActive && product.inStock;

  const handleAdd = () => {
    addItem(product, quantity);
    trackEvent('added_to_cart');
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <ScreenHeader
        title={product.name}
        right={(
          <button
            type="button"
            onClick={() => favorites.toggle(productId)}
            aria-label={isFavorite ? 'Remove from saved' : 'Save for later'}
            aria-pressed={isFavorite}
            className="flex h-10 w-10 items-center justify-center rounded-full
                       text-shop-primary active:bg-shop-surface-alt"
          >
            {isFavorite ? <IoHeart aria-hidden className="text-[20px]" />
              : <IoHeartOutline aria-hidden className="text-[20px]" />}
          </button>
        )}
      />

      <div className="relative h-64 w-full bg-shop-surface-alt">
        <ProductImage product={product} sizes="480px" />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-shop-primary px-3 py-1
                           text-[11px] font-semibold text-white">
            {product.badge}
          </span>
        )}
      </div>

      <div className="px-4 pt-4">
        <h2 className="text-[20px] font-semibold text-shop-text">{product.name}</h2>
        {product.unit && (
          <p className="mt-0.5 text-[13px] text-shop-text-secondary">{product.unit}</p>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[22px] font-bold text-shop-text">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-[14px] text-shop-text-tertiary line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {product.description && (
          <p className="mt-4 text-[14px] leading-[21px] text-shop-text-secondary">
            {product.description}
          </p>
        )}

        {product.nutritionInfo && (
          <div className="mt-5 rounded-shop-sm bg-shop-surface-alt p-3">
            <p className="mb-1 text-[13px] font-semibold text-shop-text">Nutrition</p>
            <p className="text-[13px] leading-[19px] text-shop-text-secondary">
              {product.nutritionInfo}
            </p>
          </div>
        )}

        {!sellable && (
          <p className="mt-5 rounded-shop-sm bg-shop-surface-alt p-3 text-center text-[14px]
                        font-medium text-shop-text-secondary">
            Out of stock right now — please check back soon.
          </p>
        )}

        {/* Curated suggestions (lib/order/related.js) — rule-based until real
            basket data exists to replace them. */}
        {related.length > 0 && (
          <section className="mt-7">
            <h3 className="mb-3 text-[16px] font-semibold text-shop-text">{S.RELATED_TITLE}</h3>
            <ProductRow products={related} />
          </section>
        )}
      </div>

      {sellable && (
        <div className="sticky bottom-0 mt-6 flex items-center gap-3 border-t border-shop-border
                        bg-shop-surface px-4 py-3">
          <div className="flex items-center gap-3 rounded-full border border-shop-border px-2 py-1.5">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full
                         text-shop-text disabled:text-shop-text-tertiary"
            >
              <IoRemove aria-hidden />
            </button>
            <span aria-live="polite" className="min-w-[20px] text-center text-[15px] font-semibold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(999, q + 1))}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full text-shop-text"
            >
              <IoAdd aria-hidden />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 rounded-full py-3 text-[15px] font-semibold text-white
                        ${added ? 'bg-shop-primary-dark' : 'bg-shop-primary'}`}
          >
            {added ? 'Added to cart' : `Add · ${formatPrice(product.price * quantity)}`}
          </button>
        </div>
      )}
    </>
  );
}
