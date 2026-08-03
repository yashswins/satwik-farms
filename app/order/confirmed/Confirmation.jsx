'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { IoCheckmarkCircle } from 'react-icons/io5';

/**
 * Shows the SERVER's order id, not a client-generated one.
 *
 * The phone app generates its own id and displays that, discarding the id the
 * backend returns — so a customer quoting their order number cannot be looked up
 * in the database or matched to an Accu360 Sales Order. The web app uses the
 * real one from the start.
 */
export default function Confirmation() {
  const orderId = useSearchParams().get('id');

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <IoCheckmarkCircle aria-hidden className="text-[72px] text-shop-primary" />
      <h1 className="mt-4 text-[22px] font-semibold text-shop-text">Order placed</h1>
      <p className="mt-2 max-w-[300px] text-[14px] leading-[21px] text-shop-text-secondary">
        Thank you. We&apos;ve received your order and will call you shortly to confirm
        delivery.
      </p>

      {orderId && (
        <div className="mt-5 rounded-shop-sm bg-shop-surface-alt px-4 py-3">
          <p className="text-[12px] text-shop-text-secondary">Your order number</p>
          <p className="mt-0.5 font-mono text-[15px] font-semibold text-shop-text">{orderId}</p>
        </div>
      )}

      <Link
        href="/order"
        className="mt-8 w-full max-w-[280px] rounded-full bg-shop-primary py-3.5
                   text-[15px] font-semibold text-white active:bg-shop-primary-dark"
      >
        Continue shopping
      </Link>
      <Link
        href="/order/account/orders"
        className="mt-3 text-[14px] font-medium text-shop-text-secondary"
      >
        View my orders
      </Link>
    </div>
  );
}
