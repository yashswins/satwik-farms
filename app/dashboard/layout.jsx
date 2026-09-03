import { Poppins } from 'next/font/google';

/**
 * Shared by the login page and the signed-in app (app/dashboard/(app)).
 * Nothing here fetches data or trusts anyone; the (app) layout does the
 * gating. Metadata: never indexed — see also the X-Robots-Tag header in
 * next.config.js, which covers responses this metadata cannot.
 */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata = {
  title: { default: 'Dashboard', template: '%s · Dashboard' },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export const viewport = {
  themeColor: '#53B175',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const dynamic = 'force-dynamic';

export default function DashboardRootLayout({ children }) {
  return (
    <div
      className={`${poppins.variable} min-h-screen bg-shop-bg font-poppins text-shop-text
                  dark:bg-[#0F1410] dark:text-[#D4EDD4]`}
    >
      {children}
    </div>
  );
}
