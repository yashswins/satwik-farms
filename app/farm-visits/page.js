import VisitHero from '@/components/farm-visits/VisitHero';
import ActivitiesGrid from '@/components/farm-visits/ActivitiesGrid';
import FarmVisitRegistrationForm from '@/components/farm-visits/FarmVisitRegistrationForm';
import PricingInfo from '@/components/farm-visits/PricingInfo';
import BookingForm from '@/components/farm-visits/BookingForm';

export const metadata = {
  title: 'Farm Visits & Tours - Book Your Experience',
  description: 'Visit Satwik Farms in Kisarawe, Tanzania for guided farm tours, nature walks, mud bath experiences, tree planting, cattle interaction, and fresh vegetarian farm meals. Perfect for families, school field trips, and groups. Pricing: Adults TZS 50,000, Children TZS 30,000. Weekends only.',
  keywords: ['farm visits Tanzania', 'Kisarawe tours', 'farm activities', 'school field trips', 'agro-tourism Tanzania', 'farm tours Dar es Salaam', 'family activities Tanzania', 'vegetarian farm meals'],
  openGraph: {
    title: 'Farm Visits at Satwik Farms - Experience Residue Free Farming',
    description: 'Guided tours, nature walks, hands-on farm activities, and vegetarian meals. Weekends only. Book your visit today!',
    url: 'https://satwikfarms.com/farm-visits',
    images: ['/images/activities/1.jpg'],
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
    </div>
  );
}
