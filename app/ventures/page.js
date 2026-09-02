import VenturesTabs from '@/components/ventures/VenturesTabs';
import ServicesGrid from '@/components/shared/ServicesGrid';
import RelatedArticles from '@/components/shared/RelatedArticles';

const venturePosts = [
  { slug: 'why-choose-satwik-farms', title: 'Why Choose Satwik Farms: Regenerative, Residue-Free Farming', excerpt: 'The values, practices, and people behind every box we deliver.' },
  { slug: 'raw-forest-honey-kisarawe', title: 'Raw Forest Honey from Kisarawe: Benefits & Ayurvedic Uses', excerpt: 'Wild, unfiltered honey from the Miombo forests — and what makes it special.' },
  { slug: 'satwik-yoghurt-dahi', title: 'Satwik Yoghurt (Dahi): The Gut-Healing Superfood', excerpt: 'Why traditionally cultured yoghurt is one of the most powerful daily foods.' },
  { slug: 'microgreens-satwik-superfood', title: 'Microgreens: A Satwik Superfood Backed by Science & Ayurveda', excerpt: 'Tiny, nutrient-dense greens — and how to use them every day.' },
];

export const metadata = {
  title: 'Our Ventures - Grocery Delivery, Residue Free Produce, Dairy & Farm Experiences',
  description: 'Satwik Farms delivers groceries, fresh residue-free vegetables, fruits, dairy (milk, yoghurt, ghee), and wellness products to your door in Dar es Salaam. Also offering weekend farm visits in Kisarawe. Order online or via our app.',
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
      <ServicesGrid
        heading="Browse our focused service pages"
        intro="Each service has its own dedicated page with full details, features, and how to order."
      />
      <RelatedArticles
        posts={venturePosts}
        heading="The thinking behind our products"
        intro="Articles that explain our farming, our products, and the wellness philosophy that ties it all together."
      />
    </div>
  );
}
