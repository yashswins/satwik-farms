'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IoReceiptOutline, IoChevronForward } from 'react-icons/io5';

import ScreenHeader from '@/components/order/ScreenHeader';
import { EmptyState } from '@/components/order/ShopStates';
import { formatPrice } from '@/lib/order/format';
import { S } from '@/lib/order/strings';
import { useOrderHistoryStore } from '@/lib/order/stores';

export function formatOrderDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function statusLabel(status) {
  return S.ORDER_STATUS[String(status || '').toLowerCase()] ?? S.ORDER_STATUS.pending;
}

/**
 * Order history is read from this device only.
 *
 * There is no server endpoint that lists a customer's orders — the backend can
 * only be queried by a specific order id, and only with an API key. So this
 * shows what was placed from this browser, exactly as the phone app shows what
 * was placed from that phone.
 */
export default function OrderHistoryScreen() {
  const orders = useOrderHistoryStore((s) => s.orders);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <ScreenHeader title={S.ORDER_HISTORY_TITLE} fallbackHref="/order/account" />

      <div className="px-4 pb-6 pt-4">
        {!mounted && (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-shop-md bg-shop-surface-alt" />
            ))}
          </div>
        )}

        {mounted && orders.length === 0 && (
          <EmptyState
            Icon={IoReceiptOutline}
            title={S.ORDER_HISTORY_EMPTY}
            subtitle="Orders you place on this device will appear here."
            actionHref="/order"
            actionLabel={S.CART_EMPTY_ACTION}
          />
        )}

        {mounted && orders.length > 0 && (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.orderId}>
                <Link
                  href={`/order/account/orders/${encodeURIComponent(order.orderId)}`}
                  className="flex items-center gap-3 rounded-shop-md border border-shop-border
                             bg-shop-surface p-3.5 active:bg-shop-surface-alt
                             md:hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[13px] font-semibold text-shop-text">
                      {order.orderId}
                    </p>
                    <p className="mt-0.5 text-[12px] text-shop-text-secondary">
                      {formatOrderDate(order.createdAt)}
                    </p>
                    <p className="mt-1 text-[12px] text-shop-text-secondary">
                      {order.items?.length ?? 0}{' '}
                      {(order.items?.length ?? 0) === 1 ? 'item' : 'items'}
                      {' · '}
                      <span className="font-medium text-shop-text">
                        {formatPrice(order.total)}
                      </span>
                    </p>
                  </div>
                  <span className="rounded-full bg-shop-surface-alt px-2.5 py-1 text-[11px]
                                   font-semibold text-shop-primary-dark">
                    {statusLabel(order.status)}
                  </span>
                  <IoChevronForward aria-hidden className="text-[16px] text-shop-text-tertiary" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
