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

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: Math.min(999, i.quantity + quantity) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
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

      setQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity: Math.min(999, quantity) } : i,
            ),
          };
        }),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

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
