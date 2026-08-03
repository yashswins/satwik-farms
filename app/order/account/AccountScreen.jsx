'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  IoChevronForward, IoReceiptOutline, IoLocationOutline, IoHelpCircleOutline,
  IoInformationCircleOutline, IoTrashOutline, IoPersonCircle,
} from 'react-icons/io5';

import { S } from '@/lib/order/strings';
import { clearAllStoredData } from '@/lib/order/storage';
import {
  useCartStore, useCustomerStore, useFavoritesStore, useOrderHistoryStore,
} from '@/lib/order/stores';

const MENU = [
  { href: '/order/account/orders', label: S.ORDER_HISTORY_TITLE, Icon: IoReceiptOutline },
  { href: '/order/account/address', label: S.ADDRESS_TITLE, Icon: IoLocationOutline },
  { href: '/order/account/help', label: S.HELP_TITLE, Icon: IoHelpCircleOutline },
  { href: '/order/account/about', label: S.ABOUT_TITLE, Icon: IoInformationCircleOutline },
];

export default function AccountScreen() {
  const customer = useCustomerStore();
  const cart = useCartStore();
  const favorites = useFavoritesStore();
  const history = useOrderHistoryStore();
  const [mounted, setMounted] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  useEffect(() => setMounted(true), []);

  const clearEverything = () => {
    // Reset the in-memory stores as well as storage; otherwise the current page
    // keeps rendering the old values until a reload.
    customer.clearCustomer();
    cart.clearCart();
    favorites.clear();
    history.clear();
    clearAllStoredData();
    setConfirmingClear(false);
  };

  const hasDetails = mounted && Boolean(customer.name);

  return (
    <div className="min-h-screen bg-shop-tab-account pb-6">
      <header className="bg-gradient-to-r from-shop-primary-dark to-shop-primary px-4 pb-6 pt-6">
        <div className="flex items-center gap-3">
          <IoPersonCircle aria-hidden className="text-[48px] text-white/90" />
          <div className="min-w-0">
            <p className="truncate text-[18px] font-semibold text-white">
              {hasDetails ? customer.name : S.ACCOUNT_GUEST}
            </p>
            <p className="truncate text-[13px] text-white/85">
              {hasDetails
                ? `${customer.countryCode}${customer.phone}`
                : S.ACCOUNT_GUEST_SUBTITLE}
            </p>
          </div>
        </div>
      </header>

      <nav className="mt-4 px-4" aria-label="Account">
        <ul className="overflow-hidden rounded-shop-md border border-shop-border bg-shop-surface">
          {MENU.map(({ href, label, Icon }) => (
            <li key={href} className="border-b border-shop-border last:border-b-0">
              <Link
                href={href}
                className="flex items-center gap-3 px-4 py-3.5 active:bg-shop-surface-alt
                           md:hover:bg-shop-surface-alt"
              >
                <Icon aria-hidden className="text-[20px] text-shop-primary-dark" />
                <span className="flex-1 text-[15px] text-shop-text">{label}</span>
                <IoChevronForward aria-hidden className="text-[16px] text-shop-text-tertiary" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="mt-6 px-4">
        <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-shop-text-secondary">
          Your data
        </h2>
        <div className="rounded-shop-md border border-shop-border bg-shop-surface p-4">
          <p className="text-[13px] leading-[19px] text-shop-text-secondary">
            Your name, phone, address, cart and saved items are stored only on this
            device to speed up your next order. Nothing is kept here after you clear them.
          </p>

          {!confirmingClear ? (
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              className="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold text-shop-error"
            >
              <IoTrashOutline aria-hidden /> Clear my details
            </button>
          ) : (
            <div className="mt-3">
              <p className="text-[14px] font-medium text-shop-text">
                Clear everything saved on this device?
              </p>
              <p className="mt-0.5 text-[13px] text-shop-text-secondary">
                This removes your details, cart, saved items and order history. It
                cannot be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={clearEverything}
                  className="rounded-full bg-shop-error px-4 py-2 text-[14px] font-semibold text-white"
                >
                  Yes, clear it
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingClear(false)}
                  className="rounded-full border border-shop-border px-4 py-2 text-[14px]
                             font-semibold text-shop-text"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
