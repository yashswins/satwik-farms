import Image from 'next/image';
import Link from 'next/link';

import Nav from '@/components/dashboard/Nav';
import SignOutButton from '@/components/dashboard/SignOutButton';
import ThemeToggle from '@/components/dashboard/ThemeToggle';

/**
 * The signed-in frame: header (brand, who is signed in, sign out), navigation
 * (left rail on desktop, scrollable strip on phones) and the page.
 * Server component — the page's data is fetched by the page itself.
 */
export default function Shell({ user, children }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <header
        className="flex items-center justify-between gap-3 border-b border-shop-border bg-shop-surface
                   px-4 py-3 dark:border-[#2E352E] dark:bg-[#1A1E1A] lg:hidden"
      >
        <Brand />
        <UserMenu user={user} compact />
      </header>

      <aside
        className="hidden w-64 shrink-0 flex-col border-r border-shop-border bg-shop-surface
                   dark:border-[#2E352E] dark:bg-[#1A1E1A] lg:flex"
      >
        <div className="px-5 py-5">
          <Brand />
        </div>
        <Nav role={user.role} orientation="vertical" />
        <div className="mt-auto border-t border-shop-border px-5 py-4 dark:border-[#2E352E]">
          <UserMenu user={user} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="lg:hidden">
          <Nav role={user.role} orientation="horizontal" />
        </div>
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <Image src="/images/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
      <span className="text-sm font-semibold leading-tight">
        Satwik Farms
        <span className="block text-xs font-normal text-shop-text-secondary">Dashboard</span>
      </span>
    </Link>
  );
}

function UserMenu({ user, compact = false }) {
  return (
    <div className={compact ? 'flex items-center gap-2' : 'space-y-2'}>
      <div className={`min-w-0 ${compact ? 'hidden sm:block' : ''}`}>
        <p className="truncate text-xs font-medium" title={user.email}>{user.email}</p>
        <p className="text-[11px] uppercase tracking-wide text-shop-text-secondary">
          {user.role}{user.dev ? ' · dev bypass' : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <SignOutButton />
      </div>
    </div>
  );
}
