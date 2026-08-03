import OrderDetailScreen from './OrderDetailScreen';

export const metadata = { title: 'Order Details', robots: { index: false, follow: false } };

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  return <OrderDetailScreen orderId={decodeURIComponent(id)} />;
}
