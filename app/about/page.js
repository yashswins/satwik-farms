import OurStory from '@/components/about/OurStory';
import MissionVision from '@/components/about/MissionVision';
import RelatedArticles from '@/components/shared/RelatedArticles';

const aboutPosts = [
  { slug: 'why-choose-satwik-farms', title: 'Why Choose Satwik Farms: Regenerative, Residue-Free Farming', excerpt: 'The values, practices, and people behind every box we deliver.' },
  { slug: 'satwik-farming-technique', title: 'Satwik Farming: Holistic, Regenerative Agriculture Rooted in Ancient Indian Wisdom', excerpt: 'How we farm in tune with the land — and why it produces healthier food.' },
  { slug: 'benefits-of-residue-free-farming', title: 'The Benefits of Residue-Free Farming', excerpt: 'What "residue-free" really means and why it matters for you and the environment.' },
  { slug: 'meet-our-cattle', title: 'Meet Our Cattle: The Heart of Our Dairy', excerpt: 'How we raise our cows and what that means for the milk you drink.' },
];

export const metadata = {
  title: 'About Us - Our Story & Mission',
  description: 'Learn about Satwik Farms - residue free farming in Kisarawe, Tanzania since our founding. Our mission to deliver chemical-free vegetables and dairy products, commitment to sustainable agriculture, and vision for a healthier Tanzania.',
  keywords: ['about Satwik Farms', 'residue free farming Tanzania', 'sustainable agriculture', 'farm story', 'Kisarawe farmers'],
  alternates: {
    canonical: 'https://satwikfarms.com/about',
  },
  openGraph: {
    type: 'website',
    title: 'About Satwik Farms - Residue Free Farming in Kisarawe',
    description: 'Our story, mission, and commitment to delivering fresh residue free produce from farm to your table',
    url: 'https://satwikfarms.com/about',
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
    title: 'About Satwik Farms - Residue Free Farming in Tanzania',
    description: 'Our story, mission, and commitment to delivering fresh residue free produce from farm to your table',
    images: ['https://satwikfarms.com/images/farm/1.jpg'],
  },
};

export default function AboutPage() {
  return (
    <div className="pt-20">
      <OurStory />
      <MissionVision />
      <RelatedArticles
        posts={aboutPosts}
        heading="More about how we farm"
        intro="Stories, methods, and philosophy behind Satwik Farms — straight from our blog."
      />
    </div>
  );
}
