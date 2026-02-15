import { NextResponse } from 'next/server';

export function middleware(request) {
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4)$).*)',
  ],
};
