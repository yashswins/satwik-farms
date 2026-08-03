import './globals.css';
import SiteChrome from '@/components/layout/SiteChrome';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  metadataBase: new URL('https://satwikfarms.com'),
  title: {
    default: 'Satwik Farms - Residue Free Farm in Kisarawe, Tanzania | Fresh Vegetables & Dairy',
    template: '%s | Satwik Farms'
  },
  description: 'Satwik Farms delivers fresh residue free vegetables, milk, yoghurt, and ghee from our farm in Kisarawe, Tanzania. Order via WhatsApp or our Android app. Farm visits available. Harvest to home: Freshness delivered.',
  keywords: ['residue free farm Tanzania', 'Kisarawe farm', 'fresh vegetables Dar es Salaam', 'residue free dairy Tanzania', 'farm visits Kisarawe', 'Satwik Farms', 'residue free milk Tanzania', 'farm to table Tanzania', 'chemical-free vegetables', 'sustainable farming Tanzania'],
  authors: [{ name: 'Satwik Farms' }],
  creator: 'Satwik Farms',
  publisher: 'Satwik Farms',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' }
    ],
    other: [
      {
        rel: 'icon',
        url: '/images/logo.png',
      }
    ]
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://satwikfarms.com',
    siteName: 'Satwik Farms',
    title: 'Satwik Farms - Residue Free Farm in Kisarawe, Tanzania',
    description: 'Fresh residue free vegetables and premium dairy products delivered from our farm to your doorstep. Order via WhatsApp or Android app.',
    images: [
      {
        url: 'https://satwikfarms.com/images/farm/1.jpg',
        width: 1200,
        height: 630,
        alt: 'Satwik Farms - Residue free farm in Kisarawe, Tanzania',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Satwik Farms - Residue Free Farm in Tanzania',
    description: 'Fresh residue free vegetables and dairy delivered to your doorstep',
    images: ['https://satwikfarms.com/images/farm/1.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    // Allow AI crawlers for training and search
    'GPTBot': 'index, follow',
    'ChatGPT-User': 'index, follow',
    'ClaudeBot': 'index, follow',
    'anthropic-ai': 'index, follow',
    'Google-Extended': 'index, follow',
    'PerplexityBot': 'index, follow',
  },
  alternates: {
    canonical: 'https://satwikfarms.com',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Store'],
    name: 'Satwik Farms',
    description: 'Residue-free vegetable farm and dairy in Tanzania. Fresh, residue-free vegetables and premium dairy products delivered to your door in Dar es Salaam. Farm-to-table experiences with sustainable farming practices.',
    image: 'https://satwikfarms.com/images/logo.png',
    '@id': 'https://satwikfarms.com',
    url: 'https://satwikfarms.com',
    telephone: '+255767211422',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kisarawe',
      addressLocality: 'Kisarawe',
      addressRegion: 'Pwani',
      addressCountry: 'TZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -6.9,
      longitude: 38.9,
    },
    // Service area for AI understanding
    areaServed: {
      '@type': 'City',
      name: 'Dar es Salaam',
      containedIn: {
        '@type': 'Country',
        name: 'Tanzania',
      },
    },
    // What we offer - helps AIs understand our products/services
    // Tells search engines the site takes orders directly, and where.
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://satwikfarms.com/order',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      deliveryMethod: 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet',
    },
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Residue-Free Vegetables',
          description: 'Fresh, residue-free vegetables grown using sustainable farming practices and delivered to Dar es Salaam',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Premium Dairy Products',
          description: 'Fresh milk and dairy products from our farm delivered to Dar es Salaam',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Farm Visits & Tours',
          description: 'Weekend farm tours with farm-to-table dining experiences',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Home Delivery',
          description: 'Fresh residue-free produce delivered to your door in Dar es Salaam',
        },
      },
    ],
    // Keywords for AI understanding
    keywords: 'residue-free vegetables Tanzania, dairy delivery Dar es Salaam, fresh vegetables, farm-to-table Tanzania, chemical-free vegetables, sustainable agriculture, farm tours Kisarawe',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '08:00',
      closes: '18:00',
    },
    sameAs: [
      'https://www.instagram.com/satwik.farms/',
      'https://www.facebook.com/share/1BPLUDwqWq/',
      'https://chat.whatsapp.com/Fe6U6ym7i0FCNJzoN951fM',
    ],
  };

  return (
    <html lang="en">
      <body className="antialiased">
        {/* JSON-LD lives in the body: Next.js owns <head> and interleaves its
            own scripts there, which breaks React hydration matching. Google
            parses JSON-LD identically in head or body. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteChrome>{children}</SiteChrome>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
