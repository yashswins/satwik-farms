'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { IoAdd, IoRemove, IoTrashOutline, IoCartOutline, IoBookmarkOutline, IoClose } from 'react-icons/io5';

import ProductImage from '@/components/order/ProductImage';
import { formatPrice } from '@/lib/order/format';
import { totalQuantityLabel } from '@/lib/order/units';
import { orderTotals } from '@/lib/order/discounts';
import { S } from '@/lib/order/strings';
import { useCartStore, useSavedStore } from '@/lib/order/stores';
import { useCatalog } from '@/lib/order/useCatalog';

/**
 * "Saved for later" — lines set aside from the cart instead of deleted.
 * Rendered under the cart (and under the empty state, or saving a whole cart
 * would make the saved items vanish with it). Each line re-resolves against
 * the live catalogue: available items get "Move to cart" at today's price,
 * unavailable ones say so and can only be removed.
 */
function SavedForLater({ catalog }) {
  const saved = useSavedStore();
  const addItem = useCartStore((s) => s.addItem);

  if (saved.items.length === 0) return null;

  return (
    <section className="px-4 pt-6">
      <h2 className="mb-3 text-[16px] font-semibold text-shop-text">
        {S.SAVED_FOR_LATER_TITLE}
      </h2>
      <ul className="space-y-3">
        {saved.items.map((item) => {
          const product = catalog?.productsById.get(item.productId) ?? null;
          const available = Boolean(product && product.isActive && product.inStock);
          return (
            <li
              key={item.productId}
              className="flex items-center gap-3 rounded-shop-md border border-shop-border
                         bg-shop-surface p-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-shop-sm
                              bg-shop-surface-alt">
                <ProductImage product={product ?? { name: item.name }} sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-shop-text">{item.name}</p>
                {item.unit && (
                  <p className="text-[12px] text-shop-text-secondary">
                    {item.unit}{item.quantity > 1 ? ` × ${item.quantity}` : ''}
                  </p>
                )}
                {available ? (
                  <button
                    type="button"
                    onClick={() => { addItem(product, item.quantity); saved.remove(item.productId); }}
                    className="mt-1 text-[13px] font-semibold text-shop-primary-dark"
                  >
                    {S.MOVE_TO_CART} · {formatPrice(product.price * item.quantity)}
                  </button>
                ) : (
                  <p className="mt-1 text-[12px] font-medium text-shop-error">
                    Currently unavailable
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => saved.remove(item.productId)}
                aria-label={`Remove ${item.name} from saved`}
                className="shrink-0 text-shop-text-tertiary"
              >
                <IoClose aria-hidden className="text-[18px]" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * The cart is stored on the device, so its contents can be stale: prices change
 * and items sell out between visits. Every line is re-checked against the live
 * catalogue on load, prices are refreshed silently, and checkout is blocked
 * while anything is unavailable — the same rule the phone app applies.
 */
export default function CartScreen() {
  const { catalog, loading } = useCatalog();
  const { items, setQuantity, removeItem, removeCombo } = useCartStore();
  const saveForLater = useSavedStore((s) => s.save);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useMemo(() => {
    if (!catalog) return items.map((i) => ({ ...i, status: 'unknown', livePrice: i.price }));
    return items.map((item) => {
      const product = catalog.productsById.get(item.productId);
      if (!product) return { ...item, status: 'gone', livePrice: item.price, product: null };
      const available = product.isActive && product.inStock;
      // A combo line's price is the combo's split, not the catalogue price —
      // re-pricing it from the catalogue would quietly cancel the discount.
      const isCombo = Boolean(item.comboId);
      return {
        ...item,
        product,
        livePrice: isCombo ? item.price : product.price,
        priceChanged: !isCombo && Math.abs(product.price - item.price) > 0.5,
        status: available ? 'ok' : 'unavailable',
      };
    });
  }, [items, catalog]);

  // A combo is one thing in the basket, not a pile of separately-editable
  // lines. Letting a customer trim one produced a basket the server correctly
  // refuses (a partial bundle at bundle prices), which cost a real TSH 22,100
  // order on 2026-08-18.
  const groups = (() => {
    const out = [];
    const seen = new Map();
    for (const line of lines) {
      if (!line.comboId) { out.push({ kind: 'item', line }); continue; }
      let group = seen.get(line.comboId);
      if (!group) {
        group = {
          kind: 'combo',
          comboId: line.comboId,
          name: line.comboName || 'Combo',
          lines: [],
        };
        seen.set(line.comboId, group);
        out.push(group);
      }
      group.lines.push(line);
    }
    return out;
  })();

  const unavailable = lines.filter((l) => l.status === 'unavailable' || l.status === 'gone');
  const subtotal = lines
    .filter((l) => l.status === 'ok')
    .reduce((sum, l) => sum + l.livePrice * l.quantity, 0);

  // Same calculation the checkout and the server use — one module, three
  // callers, so the number never changes as the customer moves between screens.
  const cartTotals = orderTotals(subtotal, 0, catalog, items, null);

  // How far to the next tier, so "spend a bit more" is an informed choice.
  const nextTier = (() => {
    const t = (catalog?.discountTiers ?? [])
      .filter((x) => x.minSpend > subtotal)
      .sort((a, b) => a.minSpend - b.minSpend)[0];
    if (!t || subtotal <= 0) return null;
    return { short: t.minSpend - subtotal, label: t.label || `${t.percentOff}% off` };
  })();

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
      <div className="bg-shop-tab-cart pb-8">
        <div className="px-6 py-20 text-center">
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
        <SavedForLater catalog={catalog} />
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
        {groups.filter((g) => g.kind === 'combo').map((group) => {
          const total = group.lines.reduce((s, l) => s + l.livePrice * l.quantity, 0);
          const blocked = group.lines.some(
            (l) => l.status === 'unavailable' || l.status === 'gone',
          );
          return (
            <li
              key={group.comboId}
              className={`rounded-shop-md border bg-shop-surface p-3
                          ${blocked ? 'border-shop-error/40' : 'border-shop-primary/30'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-shop-text">
                    {group.name}
                  </p>
                  <p className="text-[11px] font-medium text-shop-primary-dark">
                    Bundle price — edit as one
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeCombo(group.comboId)}
                  aria-label={`Remove ${group.name}`}
                  className="shrink-0 text-shop-text-tertiary active:text-shop-error"
                >
                  <IoTrashOutline aria-hidden className="text-[18px]" />
                </button>
              </div>

              <ul className="mt-2 space-y-1.5">
                {group.lines.map((l) => (
                  <li key={l.lineId} className="flex items-center gap-2.5">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-shop-sm
                                    bg-shop-surface-alt">
                      <ProductImage product={l.product ?? { name: l.name }} sizes="36px" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-shop-text">
                      {l.name}
                    </span>
                    {/* What they actually get: 2 Kg, not "0.5 Kg x 4". */}
                    <span className="shrink-0 text-[12px] text-shop-text-secondary">
                      {totalQuantityLabel(l.unit, l.quantity) ?? `x ${l.quantity}`}
                    </span>
                  </li>
                ))}
              </ul>

              {blocked && (
                <p className="mt-2 text-[12px] font-medium text-shop-error">
                  Part of this combo is unavailable — please remove it to continue.
                </p>
              )}
              <p className="mt-2 text-right text-[14px] font-semibold text-shop-text">
                {formatPrice(total)}
              </p>
            </li>
          );
        })}

        {groups.filter((g) => g.kind === 'item').map(({ line }) => {
          const blocked = line.status === 'unavailable' || line.status === 'gone';
          return (
            <li
              key={line.lineId ?? line.productId}
              className={`flex gap-3 rounded-shop-md border bg-shop-surface p-3
                          ${blocked ? 'border-shop-error/40' : 'border-shop-border'}`}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-shop-sm
                              bg-shop-surface-alt">
                <ProductImage product={line.product ?? { name: line.name }} sizes="64px" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-shop-text">{line.name}</p>
                {line.comboName && (
                  <p className="text-[11px] font-medium text-shop-primary-dark">
                    part of {line.comboName}
                  </p>
                )}
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

                {/* A removed item is gone; a saved one is a future order. Combo
                    lines are excluded — their price split only exists inside
                    the combo. Deliberately available on UNAVAILABLE lines too:
                    it clears the checkout blocker without asking the customer
                    to give the item up. */}
                {!line.comboId && (
                  <button
                    type="button"
                    onClick={() => {
                      saveForLater(line);
                      removeItem(line.lineId ?? line.productId);
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium
                               text-shop-text-secondary active:text-shop-primary-dark"
                  >
                    <IoBookmarkOutline aria-hidden className="text-[13px]" />
                    {S.SAVE_FOR_LATER}
                  </button>
                )}
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  type="button"
                  onClick={() => removeItem(line.lineId ?? line.productId)}
                  aria-label={`Remove ${line.name}`}
                  className="text-shop-text-tertiary active:text-shop-error"
                >
                  <IoTrashOutline aria-hidden className="text-[18px]" />
                </button>

                {!blocked && (
                  <div className="flex items-center gap-2 rounded-full border border-shop-border px-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.lineId ?? line.productId, line.quantity - 1)}
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
                      onClick={() => setQuantity(line.lineId ?? line.productId, line.quantity + 1)}
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

      <SavedForLater catalog={catalog} />

      <div className="sticky bottom-0 mt-5 border-t border-shop-border bg-shop-surface px-4 py-3">
        {/* Show the discount HERE, not only at checkout. A customer deciding
            whether to add one more thing needs to know what it earns them. */}
        {cartTotals.discount.amount > 0 && (
          <>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[13px] text-shop-text-secondary">{S.CART_SUBTOTAL}</span>
              <span className="text-[14px] text-shop-text-secondary">{formatPrice(subtotal)}</span>
            </div>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[13px] font-medium text-shop-primary-dark">
                {cartTotals.discount.label || 'Discount'}
              </span>
              <span className="text-[14px] font-medium text-shop-primary-dark">
                −{formatPrice(cartTotals.discount.amount)}
              </span>
            </div>
          </>
        )}
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-[14px] text-shop-text-secondary">
            {cartTotals.discount.amount > 0 ? S.CART_TOTAL : S.CART_SUBTOTAL}
          </span>
          <span className="text-[18px] font-bold text-shop-text">
            {formatPrice(cartTotals.discount.amount > 0 ? cartTotals.total : subtotal)}
          </span>
        </div>
        {nextTier && (
          <p className="mb-3 -mt-1 text-[12px] text-shop-text-tertiary">
            Spend {formatPrice(nextTier.short)} more for {nextTier.label}
          </p>
        )}
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
