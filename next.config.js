/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Optimize chunks and reduce bundle size
  experimental: {
    optimizePackageImports: ['framer-motion', 'react-icons'],
  },
  // Redirect www to non-www for canonical URLs
  async redirects() {
    return [
      // Redirect www to non-www (handles both http and https)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.satwikfarms.com',
          },
        ],
        destination: 'https://satwikfarms.com/:path*',
        permanent: true,
      },
      // Redirect HTTP to HTTPS for non-www
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://satwikfarms.com/:path*',
        permanent: true,
      },
    ];
  },
  // Set security headers
  async headers() {
    // The internal dashboard is unlisted, not merely unlinked: never indexed,
    // never cached by the CDN or a shared browser. Deliberately NOT in
    // robots.txt — a Disallow line advertises the path.
    const dashboardHeaders = [
      { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
      { key: 'Cache-Control', value: 'private, no-store' },
    ];
    return [
      { source: '/dashboard', headers: dashboardHeaders },
      { source: '/dashboard/:path*', headers: dashboardHeaders },
      { source: '/api/dashboard/:path*', headers: dashboardHeaders },
      { source: '/api/auth/:path*', headers: dashboardHeaders },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js requires 'unsafe-inline' for initial hydration, but we remove 'unsafe-eval'
              // challenges.cloudflare.com serves the Turnstile bot check on /order/checkout
              "script-src 'self' 'unsafe-inline' https://cdn.vercel-analytics.com https://va.vercel-scripts.com https://challenges.cloudflare.com",
              // Style requires 'unsafe-inline' for CSS-in-JS (framer-motion, Next.js)
              "style-src 'self' 'unsafe-inline'",
              // Restrict images to specific domains instead of all HTTPS.
              // res.cloudinary.com hosts the product photography for /order.
              "img-src 'self' data: blob: https://satwikfarms.com https://*.vercel.app https://res.cloudinary.com",
              // Poppins is self-hosted by next/font, so no external font origin is needed.
              "font-src 'self' data:",
              // Deliberately NOT widened for the ordering backend: the browser only
              // ever calls same-origin /api/shop/* routes, which proxy to Render and
              // Apps Script server-side. Adding those origins here would be a
              // symptom of the API key having leaked into the client bundle.
              "connect-src 'self' https://cdn.vercel-analytics.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              // Turnstile renders in an iframe
              "frame-src 'self' https://challenges.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://wa.me",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
