import VisitHero from '@/components/farm-visits/VisitHero';
import ActivitiesGrid from '@/components/farm-visits/ActivitiesGrid';
import FarmVisitRegistrationForm from '@/components/farm-visits/FarmVisitRegistrationForm';
import PricingInfo from '@/components/farm-visits/PricingInfo';
import BookingForm from '@/components/farm-visits/BookingForm';
import RelatedArticles from '@/components/shared/RelatedArticles';

const farmVisitPosts = [
  { slug: 'school-trip-success', title: 'Farm Visit Highlights: School Trip Success at Satwik Farms', excerpt: 'A peek at what a school group experiences during a Satwik Farms visit.' },
  { slug: 'satwik-farming-technique', title: 'Satwik Farming: Holistic, Regenerative Agriculture', excerpt: 'See the farming methods you will encounter on a guided tour.' },
  { slug: 'meet-our-cattle', title: 'Meet Our Cattle: The Heart of Our Dairy', excerpt: 'Get to know the cows you might meet on your visit.' },
  { slug: 'whats-growing-january', title: "What's Growing This Month: Seasonal Harvest at Satwik Farms", excerpt: 'See what is in season — visit during the right month for the best experience.' },
];

export const metadata = {
  title: 'Farm Visits & Tours - Book Your Experience',
  description: 'Visit Satwik Farms in Kisarawe, Tanzania for guided farm tours, nature walks, mud bath experiences, tree planting, cattle interaction, and fresh vegetarian farm meals. Perfect for families, school field trips, and groups. Pricing: Adults TZS 50,000, Children TZS 30,000. Weekends only.',
  keywords: ['farm visits Tanzania', 'Kisarawe tours', 'farm activities', 'school field trips', 'agro-tourism Tanzania', 'farm tours Dar es Salaam', 'family activities Tanzania', 'vegetarian farm meals'],
  alternates: {
    canonical: 'https://satwikfarms.com/farm-visits',
  },
  openGraph: {
    type: 'website',
    title: 'Farm Visits at Satwik Farms - Experience Residue Free Farming',
    description: 'Guided tours, nature walks, hands-on farm activities, and vegetarian meals. Weekends only. Book your visit today!',
    url: 'https://satwikfarms.com/farm-visits',
    images: [
      {
        url: 'https://satwikfarms.com/images/activities/1.jpg',
        width: 1200,
        height: 630,
        alt: 'Farm visits at Satwik Farms, Kisarawe Tanzania',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Farm Visit at Satwik Farms, Tanzania',
    description: 'Guided tours, nature walks, hands-on activities and vegetarian meals. Weekends only. Adults TZS 50,000, Children TZS 30,000.',
    images: ['https://satwikfarms.com/images/activities/1.jpg'],
  },
};

export default function FarmVisitsPage() {
  return (
    <div className="pt-20">
      <VisitHero />
      <ActivitiesGrid />
      <FarmVisitRegistrationForm />
      <PricingInfo />
      <BookingForm />
      <RelatedArticles
        posts={farmVisitPosts}
        heading="Get to know us before you visit"
        intro="A few articles to help you make the most of your time on the farm."
      />
    </div>
  );
}
