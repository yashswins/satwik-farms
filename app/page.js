import HeroSlideshow from '@/components/home/HeroSlideshow';
import FarmHighlights from '@/components/home/FarmHighlights';
import GroceryDelivery from '@/components/home/GroceryDelivery';
import StatsCounter from '@/components/home/StatsCounter';
import AppDownload from '@/components/home/AppDownload';
import SocialConnect from '@/components/home/SocialConnect';
import Testimonials from '@/components/home/Testimonials';
import QuickVisitCTA from '@/components/home/QuickVisitCTA';

export const metadata = {
  title: 'Satwik Farms - Grocery Delivery & Residue Free Farm in Tanzania',
  description: 'Satwik Farms delivers groceries, fresh residue-free vegetables, fruits, dairy products, and daily essentials to your door in Dar es Salaam. Also offering farm visits in Kisarawe, Tanzania. Order via WhatsApp or our app.',
  keywords: ['grocery delivery Dar es Salaam', 'home delivery groceries Tanzania', 'fresh vegetables delivery Tanzania', 'residue free farm Tanzania', 'dairy delivery Dar es Salaam', 'farm visits Kisarawe'],
  alternates: {
    canonical: 'https://satwikfarms.com',
  },
};

export default function Home() {
  return (
    <>
      <HeroSlideshow />
      <FarmHighlights />
      <GroceryDelivery />
      <StatsCounter />
      <AppDownload />
      <SocialConnect />
      <Testimonials />
      <QuickVisitCTA />
    </>
  );
}
