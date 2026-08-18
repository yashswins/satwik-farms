'use client';

/**
 * Client state for the ordering app.
 *
 * Cart semantics follow the phone app (Satwik_Farms_React/src/store/cartStore.ts)
 * so the two behave the same — including the badge counting DISTINCT products
 * rather than summing quantities.
 */
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { STORAGE_KEYS, safeStorage } from './storage';
import { DEFAULT_COUNTRY_CODE } from './validation';

const jsonStorage = () => createJSONStorage(() => safeStorage);

/**
 * True once a persisted store has finished reading localStorage.
 *
 * Rehydration is asynchronous. Anything that copies store values into local
 * state on mount — every prefilled form here — will otherwise read the empty
 * defaults and show blank fields to a customer whose details are saved. That is
 * silent: the page looks fine, it just quietly loses their address.
 *
 * The same applies to routing decisions: reading `onboarded` too early sends a
 * returning customer back to the welcome screen.
 */
export function useStoreHydrated(store) {
  // Starts false on purpose, and is NEVER seeded from hasHydrated().
  //
  // hasHydrated() can already report true during the first render while the
  // merged state has not yet reached React's snapshot — measured directly:
  // render 1 gave `hydrated true, onboarded false`, render 2 gave
  // `onboarded true`. Seeding from it therefore opened the gate one render too
  // early and callers acted on pre-hydration defaults, which sent returning
  // customers back to the welcome screen on every reload.
  //
  // Flipping it only inside an effect guarantees at least one commit has passed,
  // by which point the hydrated values are readable.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (store.persist?.hasHydrated?.()) setHydrated(true);
    const unsubscribe = store.persist?.onFinishHydration?.(() => setHydrated(true));
    // Stores without persist (or SSR) would otherwise never become ready.
    if (!store.persist) setHydrated(true);
    return () => unsubscribe?.();
  }, [store]);

  return hydrated;
}

/* ------------------------------------------------------------------ customer */

export const useCustomerStore = create()(
  persist(
    (set) => ({
      name: '',
      countryCode: DEFAULT_COUNTRY_CODE,
      phone: '',
      email: '',
      address: '',
      deliveryNotes: '',
      savedAt: null,
      // True once the customer has either filled the form or chosen to skip it,
      // so we do not bounce them back to the welcome screen on every visit.
      onboarded: false,

      setCustomer: (details) =>
        set((state) => ({ ...state, ...details, savedAt: new Date().toISOString() })),
      markOnboarded: () => set({ onboarded: true }),
      clearCustomer: () =>
        set({
          name: '', countryCode: DEFAULT_COUNTRY_CODE, phone: '', email: '',
          address: '', deliveryNotes: '', savedAt: null, onboarded: false,
        }),
    }),
    { name: STORAGE_KEYS.customer, storage: jsonStorage(), version: 1 },
  ),
);

/* ---------------------------------------------------------------------- cart */

export const useCartStore = create()(
  persist(
    (set, get) => ({
      items: [],

      /**
       * @param opts.comboId      set when the line comes from a combo
       * @param opts.priceOverride combo price share, as the phone app does
       *
       * Combo lines are keyed separately from the same product bought normally.
       * Merging them would silently overwrite one price with the other and
       * either overcharge the customer or undercharge the shop.
       */
      addItem: (product, quantity = 1, opts = {}) =>
        set((state) => {
          const lineId = opts.comboId ? `${product.id}::${opts.comboId}` : product.id;
          const existing = state.items.find((i) => (i.lineId ?? i.productId) === lineId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                (i.lineId ?? i.productId) === lineId
                  ? { ...i, quantity: Math.min(999, i.quantity + quantity) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                lineId,
                productId: product.id,
                comboId: opts.comboId ?? null,
                comboName: opts.comboName ?? null,
                name: product.name,
                price: opts.priceOverride ?? product.price,
                quantity: Math.min(999, Math.max(1, quantity)),
                unit: product.unit ?? '',
                // One field name end to end. The phone app calls this
                // accu360Sku on products but accu360ItemCode on cart entries and
                // bridges the two with `as any` casts on the order path, which
                // silently ships an empty SKU when it goes wrong.
                accu360Sku: product.accu360Sku ?? '',
              },
            ],
          };
        }),

      // Keyed by lineId so combo lines and normal lines stay independent.
      setQuantity: (lineId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => (i.lineId ?? i.productId) !== lineId) };
          }
          return {
            items: state.items.map((i) =>
              (i.lineId ?? i.productId) === lineId
                ? { ...i, quantity: Math.min(999, quantity) } : i,
            ),
          };
        }),

      removeItem: (lineId) =>
        set((state) => ({
          items: state.items.filter((i) => (i.lineId ?? i.productId) !== lineId),
        })),

      /**
       * Remove a whole combo, every line at once.
       *
       * A combo is a bundle: its lines are priced as a share of one bundle
       * price, so a basket holding SOME of them is not a cheaper combo, it is
       * an incoherent order. The server agrees and rejects it — a real customer
       * lost a TSH 22,100 basket on 2026-08-18 after trimming a combo down.
       * The cart therefore edits combos only as a unit.
       */
      removeCombo: (comboId) =>
        set((state) => ({ items: state.items.filter((i) => i.comboId !== comboId) })),

      clearCart: () => set({ items: [] }),

      /** Distinct products, not total units — matches the phone app's badge. */
      itemCount: () => get().items.length,

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: STORAGE_KEYS.cart, storage: jsonStorage(), version: 1 },
  ),
);

/* ----------------------------------------------------------------- favorites */

export const useFavoritesStore = create()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
      isFavorite: (productId) => get().ids.includes(productId),
      clear: () => set({ ids: [] }),
    }),
    { name: STORAGE_KEYS.favorites, storage: jsonStorage(), version: 1 },
  ),
);

/* ------------------------------------------------------------ saved for later */

/**
 * "Save for later" from the cart — distinct from favourites, which are
 * long-lived hearts. A saved line remembers its quantity so "Move to cart"
 * restores exactly what was set aside. Name and unit are kept so a product
 * that later vanishes from the catalogue still renders as something the
 * customer can recognise and delete.
 */
export const useSavedStore = create()(
  persist(
    (set) => ({
      items: [],
      save: (line) =>
        set((state) => ({
          items: [
            {
              productId: line.productId,
              name: line.name,
              quantity: line.quantity ?? 1,
              unit: line.unit ?? '',
            },
            ...state.items.filter((i) => i.productId !== line.productId),
          ],
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: STORAGE_KEYS.saved, storage: jsonStorage(), version: 1 },
  ),
);

/* -------------------------------------------------------------- order history */

const MAX_STORED_ORDERS = 50;

export const useOrderHistoryStore = create()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => ({
          orders: [{ ...order, createdAt: new Date().toISOString() }, ...state.orders]
            .slice(0, MAX_STORED_ORDERS),
        })),
      clear: () => set({ orders: [] }),
    }),
    { name: STORAGE_KEYS.orders, storage: jsonStorage(), version: 1 },
  ),
);
