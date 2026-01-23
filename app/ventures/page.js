import VenturesTabs from '@/components/ventures/VenturesTabs';

export const metadata = {
  title: 'Our Ventures - Satwik Farms',
  description: 'Explore all ventures at Satwik Farms: organic produce, dairy products, farm visits, educational programs, and corporate events.',
};

export default function VenturesPage() {
  return (
    <div className="pt-20">
      <VenturesTabs />
    </div>
  );
}
