import OurStory from '@/components/about/OurStory';
import MissionVision from '@/components/about/MissionVision';

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
    </div>
  );
}
