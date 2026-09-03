'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/sales', label: 'Sales' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/customers', label: 'Customers' },
  { href: '/dashboard/orders', label: 'Orders' },
  { href: '/dashboard/promotions', label: 'Promotions' },
  { href: '/dashboard/channels', label: 'Channels' },
  { href: '/dashboard/issues', label: 'Issues' },
  { href: '/dashboard/admin', label: 'Admin', admin: true },
];

export default function Nav({ role, orientation }) {
  const pathname = usePathname() || '';
  const items = ITEMS.filter((item) => !item.admin || role === 'admin');
  const isActive = (href) => (href === '/dashboard' ? pathname === href : pathname.startsWith(href));

  if (orientation === 'vertical') {
    return (
      <nav aria-label="Dashboard" className="flex flex-col gap-0.5 px-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
            className={`rounded-shop-sm px-3 py-2 text-sm font-medium transition ${
              isActive(item.href)
                ? 'bg-shop-primary/15 text-shop-primary-dark dark:text-shop-primary-light'
                : 'text-shop-text-secondary hover:bg-shop-surface-alt dark:hover:bg-[#252A25]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Dashboard"
      className="flex gap-1 overflow-x-auto border-b border-shop-border bg-shop-surface px-2 py-1.5
                 dark:border-[#2E352E] dark:bg-[#1A1E1A]"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? 'page' : undefined}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
            isActive(item.href)
              ? 'bg-shop-primary text-white'
              : 'text-shop-text-secondary hover:bg-shop-surface-alt dark:hover:bg-[#252A25]'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
