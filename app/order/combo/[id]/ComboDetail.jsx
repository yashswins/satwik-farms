'use client';

import { useState } from 'react';
import { IoBagHandleOutline, IoCheckmark } from 'react-icons/io5';

import ProductImage from '@/components/order/ProductImage';
import ScreenHeader from '@/components/order/ScreenHeader';
import { EmptyState } from '@/components/order/ShopStates';
import { formatPrice } from '@/lib/order/format';
import { useCartStore } from '@/lib/order/stores';
import { useCatalog } from '@/lib/order/useCatalog';

/**
 * A combo is a bundle of products sold together at a fixed price.
 *
 * The combo price is SPLIT EQUALLY across the in-stock products, exactly as the
 * phone app does (useComboDetail.ts:64) — so "Buy 5 kg at 1900 TSH per kg"
 * puts five lines of 1,900 in the cart and totals the advertised 9,500.
 *
 * Without this the customer saw one price advertised and a different, higher
 * one charged, because the lines carried catalogue prices. Each line records
 * its comboId so the backend can verify the discount is a real combo rather
 * than a forged price.
 */
export default function ComboDetail({ comboId }) {
  const { catalog, loading } = useCatalog();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const combo = catalog?.combos.find((c) => c.id === comboId) ?? null;
  // Repeated ids in product_ids are quantities ("Buy 5 kg" arrives as the same
  // id five times), so group them rather than listing one product five times.
  const lines = combo
    ? combo.lineItems
      .map(({ id, quantity }) => ({ product: catalog.productsById.get(id), quantity }))
      .filter((l) => l.product)
    : [];
  const available = lines.filter((l) => l.product.isActive && l.product.inStock);
  const totalUnits = available.reduce((n, l) => n + l.quantity, 0);
  const partsTotal = available.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

  if (loading) {
    return (
      <>
        <ScreenHeader title="Combo" />
        <div className="p-4"><div className="h-40 animate-pulse rounded-shop-md bg-shop-surface-alt" /></div>
      </>
    );
  }

  if (!combo) {
    return (
      <>
        <ScreenHeader title="Combo" />
        <EmptyState
          Icon={IoBagHandleOutline}
          title="This combo is no longer available"
          actionHref="/order"
          actionLabel="Back to shop"
        />
      </>
    );
  }

  const addAll = () => {
    // Split across UNITS, not distinct products, so a combo of 5×potato prices
    // each unit at comboPrice/5 rather than putting the whole price on one line.
    const pricePerUnit = totalUnits > 0 ? combo.price / totalUnits : 0;
    available.forEach(({ product, quantity }) => addItem(product, quantity, {
      priceOverride: pricePerUnit,
      comboId: combo.id,
      comboName: combo.name,
    }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <>
      <ScreenHeader title={combo.name} />
      <div className="px-4 pb-6 pt-4">
        {combo.description && (
          <p className="text-[14px] leading-[21px] text-shop-text-secondary">{combo.description}</p>
        )}

        {combo.discountText && (
          <p className="mt-3 inline-block rounded-full bg-shop-primary/10 px-3 py-1 text-[12px]
                        font-semibold text-shop-primary-dark">
            {combo.discountText}
          </p>
        )}

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-[22px] font-bold text-shop-text">{formatPrice(combo.price)}</span>
          {combo.originalPrice > combo.price && (
            <span className="text-[14px] text-shop-text-tertiary line-through">
              {formatPrice(combo.originalPrice)}
            </span>
          )}
        </div>

        <h2 className="mb-2 mt-6 text-[15px] font-semibold text-shop-text">
          What&apos;s included
        </h2>
        <ul className="divide-y divide-shop-border rounded-shop-md border border-shop-border bg-shop-surface">
          {lines.map(({ product, quantity }) => {
            const sellable = product.isActive && product.inStock;
            return (
              <li key={product.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-shop-sm bg-shop-surface-alt">
                  <ProductImage product={product} sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-shop-text">
                    {product.name}
                    {quantity > 1 && (
                      <span className="text-shop-text-secondary"> × {quantity}</span>
                    )}
                  </p>
                  <p className="text-[12px] text-shop-text-secondary">
                    {product.unit}
                    {!sellable && <span className="text-shop-error"> · unavailable</span>}
                  </p>
                </div>
                <span className="shrink-0 text-[13px] text-shop-text-secondary">
                  {formatPrice(product.price * quantity)}
                </span>
              </li>
            );
          })}
        </ul>

        {available.length < lines.length && (
          <p className="mt-3 text-[13px] text-shop-text-secondary">
            Only the available items will be added to your cart.
          </p>
        )}

        {available.length > 0 && (
          <div className="sticky bottom-0 mt-6 border-t border-shop-border bg-shop-surface py-3">
            <p className="mb-2 text-center text-[12px] text-shop-text-secondary">
              Adds {totalUnits} {totalUnits === 1 ? 'item' : 'items'} for{' '}
              <span className="font-semibold text-shop-text">{formatPrice(combo.price)}</span>
              {partsTotal > combo.price && (
                <span> · normally {formatPrice(partsTotal)}</span>
              )}
            </p>
            <button
              type="button"
              onClick={addAll}
              className={`w-full rounded-full py-3.5 text-[15px] font-semibold text-white
                          ${added ? 'bg-shop-primary-dark' : 'bg-shop-primary'}`}
            >
              {added ? (<span className="inline-flex items-center gap-2"><IoCheckmark aria-hidden /> Added to cart</span>) : 'Add all to cart'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
