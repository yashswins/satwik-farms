'use client';

import Link from 'next/link';
import { IoRefresh } from 'react-icons/io5';

import { S } from '@/lib/order/strings';

/** Loading placeholder for a grid of products. */
export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-[210px] animate-pulse rounded-shop-md bg-shop-surface-alt" />
      ))}
    </div>
  );
}

/** Catalogue failed to load. Always offers a way forward, never a dead end. */
export function LoadError({ onRetry }) {
  return (
    <div className="rounded-shop-md border border-shop-border bg-shop-surface p-6 text-center">
      <p className="text-[15px] font-medium text-shop-text">{S.ERROR_LOAD_TITLE}</p>
      <p className="mt-1 text-[13px] text-shop-text-secondary">{S.ERROR_LOAD_SUBTITLE}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-shop-primary px-5 py-2.5
                     text-[14px] font-semibold text-white"
        >
          <IoRefresh aria-hidden /> {S.ERROR_RETRY}
        </button>
      )}
    </div>
  );
}

/** Shared empty state: icon, title, optional subtitle and call to action. */
export function EmptyState({ Icon, title, subtitle, actionHref, actionLabel }) {
  return (
    <div className="px-6 py-16 text-center">
      {Icon && <Icon aria-hidden className="mx-auto text-[56px] text-shop-primary-light" />}
      <h2 className="mt-4 text-[17px] font-semibold text-shop-text">{title}</h2>
      {subtitle && (
        <p className="mx-auto mt-1 max-w-[320px] text-[14px] text-shop-text-secondary">
          {subtitle}
        </p>
      )}
      {actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-block rounded-full bg-shop-primary px-7 py-3 text-[15px]
                     font-semibold text-white active:bg-shop-primary-dark"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
