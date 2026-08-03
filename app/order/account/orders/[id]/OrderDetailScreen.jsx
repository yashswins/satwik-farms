'use client';

import { useEffect, useState } from 'react';
import { IoReceiptOutline } from 'react-icons/io5';

import ScreenHeader from '@/components/order/ScreenHeader';
import { EmptyState } from '@/components/order/ShopStates';
import { formatPrice } from '@/lib/order/format';
import { S } from '@/lib/order/strings';
import { useOrderHistoryStore } from '@/lib/order/stores';
import { formatOrderDate, statusLabel } from '../OrderHistoryScreen';

export default function OrderDetailScreen({ orderId }) {
  const orders = useOrderHistoryStore((s) => s.orders);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const order = orders.find((o) => o.orderId === orderId) ?? null;

  if (!mounted) {
    return (
      <>
        <ScreenHeader title={S.ORDER_DETAIL_TITLE} fallbackHref="/order/account/orders" />
        <div className="p-4">
          <div className="h-40 animate-pulse rounded-shop-md bg-shop-surface-alt" />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <ScreenHeader title={S.ORDER_DETAIL_TITLE} fallbackHref="/order/account/orders" />
        <EmptyState
          Icon={IoReceiptOutline}
          title="Order not found"
          subtitle="It may have been placed on another device, or your saved data was cleared."
          actionHref="/order/account/orders"
          actionLabel={S.ORDER_HISTORY_TITLE}
        />
      </>
    );
  }

  const subtotal = order.subtotal ?? order.total ?? 0;
  const deliveryFee = Math.max(0, (order.total ?? 0) - subtotal);

  return (
    <>
      <ScreenHeader title={S.ORDER_DETAIL_TITLE} fallbackHref="/order/account/orders" />

      <div className="px-4 pb-8 pt-4">
        <div className="rounded-shop-md border border-shop-border bg-shop-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] text-shop-text-secondary">{S.ORDER_ID_LABEL}</p>
              <p className="truncate font-mono text-[15px] font-semibold text-shop-text">
                {order.orderId}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-shop-surface-alt px-3 py-1 text-[12px]
                             font-semibold text-shop-primary-dark">
              {statusLabel(order.status)}
            </span>
          </div>
          <p className="mt-3 text-[12px] text-shop-text-secondary">{S.ORDER_DATE_LABEL}</p>
          <p className="text-[14px] text-shop-text">{formatOrderDate(order.createdAt)}</p>
        </div>

        <h2 className="mb-2 mt-6 text-[15px] font-semibold text-shop-text">
          {S.ORDER_ITEMS_LABEL}
        </h2>
        <ul className="divide-y divide-shop-border rounded-shop-md border border-shop-border
                       bg-shop-surface">
          {(order.items ?? []).map((item, index) => (
            <li
              key={`${item.product_id ?? item.productId ?? index}`}
              className="flex items-center justify-between gap-3 px-3.5 py-3"
            >
              <span className="min-w-0 flex-1 text-[14px] text-shop-text">
                <span className="block truncate">{item.name}</span>
                <span className="text-[12px] text-shop-text-secondary">
                  {item.unit ? `${item.unit} · ` : ''}× {item.quantity}
                </span>
              </span>
              <span className="shrink-0 text-[14px] font-medium text-shop-text">
                {formatPrice(item.total_price ?? item.unit_price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1.5 px-1">
          <div className="flex justify-between text-[14px] text-shop-text-secondary">
            <span>{S.CART_SUBTOTAL}</span><span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[14px] text-shop-text-secondary">
            <span>{S.CART_DELIVERY_FEE}</span>
            <span>{deliveryFee === 0 ? S.CART_DELIVERY_FREE : formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-shop-border pt-2 text-[17px]
                          font-bold text-shop-text">
            <span>{S.CART_TOTAL}</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <p className="mt-6 text-center text-[12px] text-shop-text-secondary">
          Questions about this order? Call us on{' '}
          <a href={`tel:${S.HELP_CONTACT_PHONE_HREF}`} className="font-semibold text-shop-primary-dark">
            {S.HELP_CONTACT_PHONE}
          </a>
        </p>
      </div>
    </>
  );
}
