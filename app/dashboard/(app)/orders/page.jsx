import Card from '@/components/dashboard/Card';

export const metadata = { title: 'Orders' };
export const dynamic = 'force-dynamic';

export default function OrdersPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Orders</h1>
      <Card>
        <p className="text-sm text-shop-text-secondary">
          This page is next in the build. The Overview already shows the headline figures.
        </p>
      </Card>
    </div>
  );
}
