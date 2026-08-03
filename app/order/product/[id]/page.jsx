import ProductDetail from './ProductDetail';

export const metadata = { title: 'Product' };

export default async function ProductPage({ params }) {
  const { id } = await params;
  return <ProductDetail productId={decodeURIComponent(id)} />;
}
