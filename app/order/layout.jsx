import { Poppins } from 'next/font/google';

import ShopShell from '@/components/order/ShopShell';

/**
 * Self-hosted at build time by next/font, so the site's `font-src 'self'` CSP
 * needs no change. A <link> to Google Fonts would be blocked.
 */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata = {
  // The root layout applies a "%s | Satwik Farms" template, so this must not
  // repeat the brand or the tab reads "Order Online | Satwik Farms | Satwik Farms".
  title: 'Order Online',
  description:
    'Order residue-free vegetables, fruits, dairy and groceries from Satwik Farms. '
    + 'Fresh from farm to your doorstep in Dar es Salaam.',
  alternates: { canonical: 'https://satwikfarms.com/order' },
};

export const viewport = {
  themeColor: '#53B175',
  width: 'device-width',
  initialScale: 1,
  // Deliberately zoomable — locking zoom on a shop is an accessibility failure.
  maximumScale: 5,
};

export default function OrderLayout({ children }) {
  return (
    // Phone-width column on mobile, widening on tablet and desktop. The layout
    // stays one adaptive design rather than two: same components, more columns.
    <div className={`${poppins.variable} min-h-screen bg-shop-primary-light/20 font-poppins`}>
      <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-shop-bg shadow-xl
                      md:max-w-3xl lg:max-w-5xl">
        {/* Tab bar and first-visit routing are client concerns; ShopShell also
            decides which screens are full-screen routes without a tab bar. */}
        <ShopShell>{children}</ShopShell>
      </div>
    </div>
  );
}
