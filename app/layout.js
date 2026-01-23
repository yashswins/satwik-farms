import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://satwikfarms.com',
    siteName: 'Satwik Farms',
    title: 'Satwik Farms - Residue Free Farm in Kisarawe, Tanzania',
    description: 'Fresh residue free vegetables and premium dairy products delivered from our farm to your doorstep. Order via WhatsApp or Android app.',
    images: [
      {
        url: '/images/farm/1.jpg',
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
    images: ['/images/farm/1.jpg'],
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
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Satwik Farms',
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
      'https://chat.whatsapp.com/Fe6U6ym7i0FCNJzoN951fM',
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
