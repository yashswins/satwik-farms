import Image from 'next/image';
import { redirect } from 'next/navigation';

import { safeCallbackPath } from '@/lib/dashboard/access';
import { signIn } from '@/lib/dashboard/auth';
import { currentDashboardUser } from '@/lib/dashboard/session';

export const metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

/**
 * The only public surface of the dashboard: one button, no data, no links.
 * Every message here is generic on purpose — a visitor who is not on the list
 * learns nothing about who is.
 */
const MESSAGES = {
  signin: 'Please sign in to continue.',
  not_allowlisted: 'This Google account does not have access to the dashboard.',
  unverified: 'Google has not verified the email address on this account.',
  deactivated: 'This account no longer has access to the dashboard.',
  no_email: 'Google did not return an email address for this account.',
  unavailable: 'The dashboard is not available right now. Please try again in a few minutes.',
  lookup_failed: 'The dashboard is not available right now. Please try again in a few minutes.',
  admin: 'That page needs an admin account.',
  Configuration: 'Dashboard sign-in is not configured on this deployment yet.',
  AccessDenied: 'This Google account does not have access to the dashboard.',
  OAuthCallbackError: 'Sign-in did not complete. Please try again.',
  OAuthSignin: 'Sign-in did not start. Please try again.',
  Callback: 'Sign-in did not complete. Please try again.',
  Default: 'Sign-in did not complete. Please try again.',
};

export default async function LoginPage({ searchParams }) {
  const params = (await searchParams) ?? {};
  const callbackUrl = safeCallbackPath(params.callbackUrl);

  const user = await currentDashboardUser();
  if (user) redirect(callbackUrl);

  const error = typeof params.error === 'string' ? params.error : null;
  const message = error ? (MESSAGES[error] ?? MESSAGES.Default) : null;
  const configured = Boolean(
    process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  async function signInWithGoogle() {
    'use server';
    await signIn('google', { redirectTo: callbackUrl });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-shop-lg bg-shop-surface p-8 text-center shadow-lg
                      dark:bg-[#1A1E1A]">
        <Image
          src="/images/logo.png"
          alt="Satwik Farms"
          width={72}
          height={72}
          className="mx-auto mb-4 h-18 w-18 rounded-full"
          priority
        />
        <h1 className="text-xl font-semibold">Satwik Farms dashboard</h1>
        <p className="mt-1 text-sm text-shop-text-secondary">Staff only.</p>

        {message && (
          <p
            role="alert"
            className="mt-5 rounded-shop-sm bg-shop-warning/10 px-3 py-2 text-sm text-shop-warning"
          >
            {message}
          </p>
        )}

        {configured ? (
          <form action={signInWithGoogle} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-shop-md bg-shop-primary px-4 py-3 font-medium text-white
                         transition hover:bg-shop-primary-dark focus:outline-none focus:ring-2
                         focus:ring-shop-primary focus:ring-offset-2"
            >
              Continue with Google
            </button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-shop-text-secondary">
            {MESSAGES.Configuration}
          </p>
        )}
      </div>
    </main>
  );
}
