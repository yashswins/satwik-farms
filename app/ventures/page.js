import VenturesTabs from '@/components/ventures/VenturesTabs';

export const metadata = {
  title: 'Our Ventures - Grocery Delivery, Residue Free Produce, Dairy & Farm Experiences',
  description: 'Satwik Farms delivers groceries, fresh residue-free vegetables, fruits, dairy (milk, yoghurt, ghee), and wellness products to your door in Dar es Salaam. Also offering weekend farm visits in Kisarawe. Order via WhatsApp or our app.',
  keywords: ['grocery delivery Dar es Salaam', 'home delivery groceries Tanzania', 'residue free vegetables Tanzania', 'dairy products Kisarawe', 'farm visits Tanzania', 'wellness products Tanzania'],
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
