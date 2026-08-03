import CategoryScreen from './CategoryScreen';

export const metadata = { title: 'Category' };

export default async function CategoryPage({ params }) {
  const { id } = await params;
  return <CategoryScreen categoryId={decodeURIComponent(id)} />;
}
