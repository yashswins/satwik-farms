import VisitHero from '@/components/farm-visits/VisitHero';
import ActivitiesGrid from '@/components/farm-visits/ActivitiesGrid';
import PricingInfo from '@/components/farm-visits/PricingInfo';
import BookingForm from '@/components/farm-visits/BookingForm';

export const metadata = {
  title: 'Farm Visits - Satwik Farms',
  description: 'Visit Satwik Farms in Kisarawe. Experience farm life, nature walks, and hands-on activities. Perfect for families, schools, and groups.',
};

export default function FarmVisitsPage() {
  return (
    <div className="pt-20">
      <VisitHero />
      <ActivitiesGrid />
      <PricingInfo />
      <BookingForm />
    </div>
  );
}
