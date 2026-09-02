import HeroSlideshow from '@/components/home/HeroSlideshow';
import FarmHighlights from '@/components/home/FarmHighlights';
import GroceryDelivery from '@/components/home/GroceryDelivery';
import StatsCounter from '@/components/home/StatsCounter';
import AppDownload from '@/components/home/AppDownload';
import SocialConnect from '@/components/home/SocialConnect';
import Testimonials from '@/components/home/Testimonials';
import QuickVisitCTA from '@/components/home/QuickVisitCTA';
import RelatedArticles from '@/components/shared/RelatedArticles';

const homePosts = [
  { slug: 'why-choose-satwik-farms', title: 'Why Choose Satwik Farms: Regenerative, Residue-Free Farming', excerpt: 'The story, the values, and the practices behind everything we grow.' },
  { slug: 'benefits-of-residue-free-farming', title: 'The Benefits of Residue-Free Farming', excerpt: 'What "residue-free" really means and why it matters for your health.' },
  { slug: 'raw-forest-honey-kisarawe', title: 'Raw Forest Honey from Kisarawe: Benefits & Ayurvedic Uses', excerpt: 'Wild, unfiltered honey straight from the Miombo forests of Tanzania.' },
  { slug: 'satwik-yoghurt-dahi', title: 'Satwik Yoghurt (Dahi): The Gut-Healing Superfood', excerpt: 'Why traditionally cultured yoghurt is one of the most powerful foods you can eat daily.' },
];

export const metadata = {
  title: 'Satwik Farms - Grocery Delivery & Residue Free Farm in Tanzania',
  description: 'Satwik Farms delivers groceries, fresh residue-free vegetables, fruits, dairy products, and daily essentials to your door in Dar es Salaam. Also offering farm visits in Kisarawe, Tanzania. Order online or via our app.',
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
      <RelatedArticles
        posts={homePosts}
        heading="From our blog"
        intro="The wisdom, science, and stories behind Satwik Farms — handpicked reading from our blog."
      />
      <QuickVisitCTA />
    </>
  );
}
