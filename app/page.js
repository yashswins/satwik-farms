import HeroSlideshow from '@/components/home/HeroSlideshow';
import FarmHighlights from '@/components/home/FarmHighlights';
import StatsCounter from '@/components/home/StatsCounter';
import AppDownload from '@/components/home/AppDownload';
import SocialConnect from '@/components/home/SocialConnect';
import Testimonials from '@/components/home/Testimonials';
import QuickVisitCTA from '@/components/home/QuickVisitCTA';

export default function Home() {
  return (
    <>
      <HeroSlideshow />
      <FarmHighlights />
      <StatsCounter />
      <AppDownload />
      <SocialConnect />
      <Testimonials />
      <QuickVisitCTA />
    </>
  );
}
