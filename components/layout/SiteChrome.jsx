'use client';

import { usePathname } from 'next/navigation';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

/**
 * Marketing chrome — navbar, footer and floating WhatsApp button.
 *
 * Hidden on /order, which is a self-contained app-like surface with its own
 * header and bottom tab bar. A root layout cannot be opted out of in the App
 * Router, so the choice is made here rather than by restructuring every
 * marketing page into a route group (same URLs, much larger diff).
 */
export default function SiteChrome({ children }) {
  const pathname = usePathname() || '';
  const isShop = pathname === '/order' || pathname.startsWith('/order/');

  if (isShop) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
