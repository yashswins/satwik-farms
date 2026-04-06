import VenturesTabs from '@/components/ventures/VenturesTabs';

export const metadata = {
  title: 'Our Ventures - Residue Free Produce, Dairy & Experiences',
  description: 'Explore Satwik Farms ventures: fresh residue free vegetables, premium dairy (milk, yoghurt, ghee), farm visits, holistic living, wellness products, and agro-tourism. Order via WhatsApp or Android app.',
  keywords: ['residue free vegetables Tanzania', 'dairy products Kisarawe', 'holistic living', 'wellness products Tanzania', 'agro-tourism'],
  alternates: {
    canonical: 'https://satwikfarms.com/ventures',
  },
  openGraph: {
    type: 'website',
    title: 'Satwik Farms Ventures - From Fresh Produce to Farm Experiences',
    description: 'Residue free farming, dairy products, holistic living, and wellness products',
    url: 'https://satwikfarms.com/ventures',
    images: [
      {
        url: 'https://satwikfarms.com/images/farm/1.jpg',
        width: 1200,
        height: 630,
        alt: 'Satwik Farms products and ventures',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Satwik Farms Ventures - Fresh Produce, Dairy & Farm Experiences',
    description: 'Residue free vegetables, premium dairy, holistic wellness products, and farm visits from Satwik Farms Tanzania.',
    images: ['https://satwikfarms.com/images/farm/1.jpg'],
  },
};

export default function VenturesPage() {
  return (
    <div className="pt-20">
      <VenturesTabs />
    </div>
  );
}
