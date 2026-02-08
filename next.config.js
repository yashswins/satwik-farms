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
    ];
  },
  // Set security headers
  async headers() {
    return [
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
              "script-src 'self' 'unsafe-inline' https://cdn.vercel-analytics.com https://va.vercel-scripts.com",
              // Style requires 'unsafe-inline' for CSS-in-JS (framer-motion, Next.js)
              "style-src 'self' 'unsafe-inline'",
              // Restrict images to specific domains instead of all HTTPS
              "img-src 'self' data: blob: https://satwikfarms.com https://*.vercel.app",
              "font-src 'self' data:",
              "connect-src 'self' https://cdn.vercel-analytics.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              "frame-src 'self'",
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
