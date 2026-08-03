/**
 * Browser storage for the ordering app.
 *
 * Everything here is convenience data the customer typed on their own device:
 * name, phone, address, cart, favourites, local order history. There are no
 * tokens, passwords or payment details anywhere in this system, so localStorage
 * is the right tool — it is same-origin scoped, survives reloads, and needs no
 * cookie banner.
 *
 * Every key is versioned and every read is defensive: corrupted JSON must reset
 * that key, never white-screen the shop.
 */

export const STORAGE_KEYS = {
  customer: 'sf.customer.v1',
  cart: 'sf.cart.v1',
  favorites: 'sf.favorites.v1',
  saved: 'sf.saved.v1',
  orders: 'sf.orders.v1',
  device: 'sf.device.v1',
};

/** Storage adapter for zustand's persist middleware. */
export const safeStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(name);
      if (!raw) return null;
      JSON.parse(raw); // validate before handing to zustand
      return raw;
    } catch {
      // Corrupted or unparseable — drop it rather than crashing on every render.
      try {
        window.localStorage.removeItem(name);
      } catch {
        /* private mode: nothing to clean up */
      }
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Quota exceeded or private browsing. The app still works for this
      // session; the customer simply retypes next time.
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

/** Stable per-device id, generated once. Sent to the backend for analytics. */
export function getDeviceId() {
  if (typeof window === 'undefined') return null;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEYS.device);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed?.deviceId) return parsed.deviceId;
    }
  } catch {
    /* fall through and regenerate */
  }
  const deviceId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  try {
    window.localStorage.setItem(STORAGE_KEYS.device, JSON.stringify({ deviceId }));
  } catch {
    /* ignore */
  }
  return deviceId;
}

/** Remove everything this app has stored. Backs the "clear my details" control. */
export function clearAllStoredData() {
  Object.values(STORAGE_KEYS).forEach((key) => safeStorage.removeItem(key));
}
