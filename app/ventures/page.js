import VenturesTabs from '@/components/ventures/VenturesTabs';

export const metadata = {
  title: 'Our Ventures - Residue Free Produce, Dairy & Experiences',
  description: 'Explore Satwik Farms ventures: fresh residue free vegetables, premium dairy (milk, yoghurt, ghee), farm visits, holistic living, wellness products, and agro-tourism. Order via WhatsApp or Android app.',
  keywords: ['residue free vegetables Tanzania', 'dairy products Kisarawe', 'holistic living', 'wellness products Tanzania', 'agro-tourism'],
  openGraph: {
    title: 'Satwik Farms Ventures - From Fresh Produce to Farm Experiences',
    description: 'Residue free farming, dairy products, holistic living, and wellness products',
    url: 'https://satwikfarms.com/ventures',
  },
};

export default function VenturesPage() {
  return (
    <div className="pt-20">
      <VenturesTabs />
    </div>
  );
}
