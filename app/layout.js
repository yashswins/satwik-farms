import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export const metadata = {
  title: 'Satwik Farms - Organic Farm in Kisarawe, Tanzania',
  description: 'Fresh organic vegetables and premium dairy products delivered from our farm in Kisarawe to your doorstep. Harvest to home: Freshness delivered.',
  keywords: 'organic farm, Tanzania, Kisarawe, fresh vegetables, dairy products, farm visits',
  openGraph: {
    title: 'Satwik Farms - Organic Farm in Tanzania',
    description: 'Fresh organic vegetables and premium dairy delivered to your doorstep',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
