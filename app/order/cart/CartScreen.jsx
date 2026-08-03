'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { IoAdd, IoRemove, IoTrashOutline, IoCartOutline } from 'react-icons/io5';

import ProductImage from '@/components/order/ProductImage';
import { formatPrice } from '@/lib/order/format';
import { S } from '@/lib/order/strings';
import { useCartStore } from '@/lib/order/stores';
import { useCatalog } from '@/lib/order/useCatalog';

/**
 * The cart is stored on the device, so its contents can be stale: prices change
 * and items sell out between visits. Every line is re-checked against the live
 * catalogue on load, prices are refreshed silently, and checkout is blocked
 * while anything is unavailable — the same rule the phone app applies.
 */
export default function CartScreen() {
  const { catalog, loading } = useCatalog();
  const { items, setQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useMemo(() => {
    if (!catalog) return items.map((i) => ({ ...i, status: 'unknown', livePrice: i.price }));
    return items.map((item) => {
      const product = catalog.productsById.get(item.productId);
      if (!product) return { ...item, status: 'gone', livePrice: item.price, product: null };
      const available = product.isActive && product.inStock;
      return {
        ...item,
        product,
        livePrice: product.price,
        priceChanged: Math.abs(product.price - item.price) > 0.5,
        status: available ? 'ok' : 'unavailable',
      };
    });
  }, [items, catalog]);

  const unavailable = lines.filter((l) => l.status === 'unavailable' || l.status === 'gone');
  const subtotal = lines
    .filter((l) => l.status === 'ok')
    .reduce((sum, l) => sum + l.livePrice * l.quantity, 0);

  if (!mounted || loading) {
    return (
      <div className="p-4">
        <div className="mb-4 h-6 w-24 animate-pulse rounded bg-shop-surface-alt" />
        {[0, 1].map((i) => (
          <div key={i} className="mb-3 h-20 animate-pulse rounded-shop-md bg-shop-surface-alt" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-shop-tab-cart px-6 py-20 text-center">
        <IoCartOutline aria-hidden className="mx-auto text-[56px] text-shop-primary-light" />
        <h1 className="mt-4 text-[18px] font-semibold text-shop-text">{S.CART_EMPTY_TITLE}</h1>
        <p className="mt-1 text-[14px] text-shop-text-secondary">
          {S.CART_EMPTY_SUBTITLE}
        </p>
        <Link
          href="/order"
          className="mt-6 inline-block rounded-full bg-shop-primary px-7 py-3
                     text-[15px] font-semibold text-white"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-shop-tab-cart pb-4">
      <header className="px-4 pb-2 pt-5">
        <h1 className="text-[20px] font-semibold text-shop-text">{S.CART_TITLE}</h1>
        <p className="text-[13px] text-shop-text-secondary">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
      </header>

      {unavailable.length > 0 && (
        <div role="alert" className="mx-4 mb-3 rounded-shop-sm border border-shop-error/30
                                     bg-shop-error/5 p-3">
          <p className="text-[13px] font-semibold text-shop-error">
            {unavailable.length === 1 ? 'One item is' : `${unavailable.length} items are`} unavailable
          </p>
          <p className="mt-0.5 text-[12px] text-shop-text-secondary">
            Please remove {unavailable.length === 1 ? 'it' : 'them'} to continue to checkout.
          </p>
        </div>
      )}

      <ul className="space-y-3 px-4">
        {lines.map((line) => {
          const blocked = line.status === 'unavailable' || line.status === 'gone';
          return (
            <li
              key={line.productId}
              className={`flex gap-3 rounded-shop-md border bg-shop-surface p-3
                          ${blocked ? 'border-shop-error/40' : 'border-shop-border'}`}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-shop-sm
                              bg-shop-surface-alt">
                <ProductImage product={line.product ?? { name: line.name }} sizes="64px" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-shop-text">{line.name}</p>
                {line.unit && (
                  <p className="text-[12px] text-shop-text-secondary">{line.unit}</p>
                )}

                {blocked ? (
                  <p className="mt-1 text-[12px] font-medium text-shop-error">
                    Currently unavailable
                  </p>
                ) : (
                  <p className="mt-1 text-[14px] font-semibold text-shop-text">
                    {formatPrice(line.livePrice * line.quantity)}
                    {line.priceChanged && (
                      <span className="ml-2 text-[11px] font-normal text-shop-text-secondary">
                        price updated
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  type="button"
                  onClick={() => removeItem(line.productId)}
                  aria-label={`Remove ${line.name}`}
                  className="text-shop-text-tertiary active:text-shop-error"
                >
                  <IoTrashOutline aria-hidden className="text-[18px]" />
                </button>

                {!blocked && (
                  <div className="flex items-center gap-2 rounded-full border border-shop-border px-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      aria-label={`Decrease ${line.name}`}
                      className="flex h-6 w-6 items-center justify-center text-shop-text"
                    >
                      <IoRemove aria-hidden className="text-[14px]" />
                    </button>
                    <span className="min-w-[16px] text-center text-[13px] font-semibold">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      aria-label={`Increase ${line.name}`}
                      className="flex h-6 w-6 items-center justify-center text-shop-text"
                    >
                      <IoAdd aria-hidden className="text-[14px]" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-0 mt-5 border-t border-shop-border bg-shop-surface px-4 py-3">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-[14px] text-shop-text-secondary">{S.CART_SUBTOTAL}</span>
          <span className="text-[18px] font-bold text-shop-text">{formatPrice(subtotal)}</span>
        </div>
        {unavailable.length > 0 ? (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-full bg-shop-border py-3.5
                       text-[15px] font-semibold text-shop-text-secondary"
          >
            Remove unavailable items to continue
          </button>
        ) : (
          <Link
            href="/order/checkout"
            className="block w-full rounded-full bg-shop-primary py-3.5 text-center
                       text-[15px] font-semibold text-white active:bg-shop-primary-dark"
          >
            {S.CART_CHECKOUT_BUTTON}
          </Link>
        )}
      </div>
    </div>
  );
}
