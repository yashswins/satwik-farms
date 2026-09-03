import { signOut } from '@/lib/dashboard/auth';

export default function SignOutButton() {
  async function action() {
    'use server';
    await signOut({ redirectTo: '/dashboard/login' });
  }
  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-shop-sm border border-shop-border px-3 py-1.5 text-xs font-medium
                   text-shop-text-secondary transition hover:bg-shop-surface-alt
                   dark:border-[#2E352E] dark:hover:bg-[#252A25]"
      >
        Sign out
      </button>
    </form>
  );
}
