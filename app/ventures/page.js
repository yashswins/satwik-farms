import VenturesTabs from '@/components/ventures/VenturesTabs';

export const metadata = {
  title: 'Our Ventures - Organic Produce, Dairy & Experiences',
  description: 'Explore Satwik Farms ventures: fresh organic vegetables, premium dairy (milk, yoghurt, ghee), farm visits, educational programs for schools, corporate events, and agro-tourism. Order via WhatsApp or Android app.',
  keywords: ['organic vegetables Tanzania', 'dairy products Kisarawe', 'farm educational programs', 'corporate team building Tanzania', 'agro-tourism'],
  openGraph: {
    title: 'Satwik Farms Ventures - From Fresh Produce to Farm Experiences',
    description: 'Organic farming, dairy products, educational programs, and agro-tourism',
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
