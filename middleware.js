import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';

import { authConfig } from '@/lib/dashboard/auth.config';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

function isDashboardPage(pathname) {
  if (pathname === '/dashboard/login' || pathname.startsWith('/dashboard/login/')) return false;
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

function isDashboardApi(pathname) {
  return pathname === '/api/dashboard' || pathname.startsWith('/api/dashboard/');
}

/** The site-wide redirects that were here before the dashboard existed. */
function canonicalRedirect(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';

  // Redirect www to non-www
  if (hostname.startsWith('www.')) {
    url.hostname = hostname.replace('www.', '');
    url.protocol = 'https:';
    return NextResponse.redirect(url, { status: 301 });
  }

  // Redirect HTTP to HTTPS
  if (protocol === 'http' && process.env.NODE_ENV === 'production') {
    url.protocol = 'https:';
    return NextResponse.redirect(url, { status: 301 });
  }

  return null;
}

/**
 * Dashboard gate — layer 1 of 2. Anonymous requests to /dashboard/* are sent
 * to the login page and anonymous /api/dashboard/* calls get a 401 before any
 * page code runs. It is a convenience, not the trust boundary: every
 * dashboard page and route handler re-checks the session AND the allowlist
 * itself (lib/dashboard/session.js), so a request that somehow skips this
 * file still gets nothing.
 *
 * Built lazily and only for dashboard paths, so a missing AUTH_SECRET makes
 * the dashboard unavailable rather than taking the marketing site down.
 */
const gate = NextAuth(authConfig).auth((request) => {
  const { pathname, search } = request.nextUrl;
  const signedIn = Boolean(request.auth?.user?.email);
  if (signedIn) return NextResponse.next();

  if (isDashboardApi(pathname)) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401, headers: NO_STORE });
  }
  const login = request.nextUrl.clone();
  login.pathname = '/dashboard/login';
  login.search = '';
  login.searchParams.set('error', 'signin');
  login.searchParams.set('callbackUrl', `${pathname}${search}`);
  return NextResponse.redirect(login);
});

export default async function middleware(request, event) {
  const redirected = canonicalRedirect(request);
  if (redirected) return redirected;

  const { pathname } = request.nextUrl;
  if (!isDashboardPage(pathname) && !isDashboardApi(pathname)) return NextResponse.next();

  // Local development without a Google client: lib/dashboard/session.js
  // honours DASHBOARD_DEV_USER only when NODE_ENV is 'development', and so
  // does this. Production builds never take this branch.
  if (process.env.NODE_ENV === 'development' && process.env.DASHBOARD_DEV_USER) {
    return NextResponse.next();
  }

  if (!process.env.AUTH_SECRET) {
    if (isDashboardApi(pathname)) {
      return NextResponse.json({ error: 'Dashboard sign-in is not configured.' }, { status: 503, headers: NO_STORE });
    }
    const login = request.nextUrl.clone();
    login.pathname = '/dashboard/login';
    login.search = '?error=Configuration';
    return NextResponse.redirect(login);
  }

  return gate(request, event);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) — except /api/dashboard, which is gated below
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4)$).*)',
    '/api/dashboard/:path*',
  ],
};
