import VisitHero from '@/components/farm-visits/VisitHero';
import ActivitiesGrid from '@/components/farm-visits/ActivitiesGrid';
import Gallery from '@/components/farm-visits/Gallery';
import PricingInfo from '@/components/farm-visits/PricingInfo';
import BookingForm from '@/components/farm-visits/BookingForm';

export const metadata = {
  title: 'Farm Visits & Tours - Book Your Experience',
  description: 'Visit Satwik Farms in Kisarawe, Tanzania for guided farm tours, nature walks, mud bath experiences, tree planting, cattle interaction, and fresh farm meals. Perfect for families, school field trips, and groups. Pricing: Adults TZS 15,000, Children TZS 10,000.',
  keywords: ['farm visits Tanzania', 'Kisarawe tours', 'farm activities', 'school field trips', 'agro-tourism Tanzania', 'farm tours Dar es Salaam', 'family activities Tanzania'],
  openGraph: {
    title: 'Farm Visits at Satwik Farms - Experience Residue Free Farming',
    description: 'Guided tours, nature walks, and hands-on farm activities in Kisarawe',
    url: 'https://satwikfarms.com/farm-visits',
    images: ['/images/activities/1.jpg'],
  },
};

export default function FarmVisitsPage() {
  return (
    <div className="pt-20">
      <VisitHero />
      <ActivitiesGrid />
      <Gallery />
      <PricingInfo />
      <BookingForm />
    </div>
  );
}
