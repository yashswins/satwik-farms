import ComboDetail from './ComboDetail';

export const metadata = { title: 'Combo Deal' };

export default async function ComboPage({ params }) {
  const { id } = await params;
  return <ComboDetail comboId={decodeURIComponent(id)} />;
}
