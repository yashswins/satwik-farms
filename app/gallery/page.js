import GalleryClient from './GalleryClient';

export const metadata = {
  title: 'Farm Gallery - Photos from Satwik Farms',
  description: 'Browse photos from Satwik Farms in Kisarawe, Tanzania — farm tours, nature walks, cattle, fresh produce, and visitor experiences. See the farm before you visit.',
  keywords: ['Satwik Farms gallery', 'farm photos Tanzania', 'Kisarawe farm pictures', 'farm tour photos Tanzania', 'residue free farm images'],
  alternates: {
    canonical: 'https://satwikfarms.com/gallery',
  },
  openGraph: {
    type: 'website',
    url: 'https://satwikfarms.com/gallery',
    title: 'Farm Gallery - Satwik Farms',
    description: 'Photos from our residue free farm in Kisarawe — tours, nature walks, fresh produce, and farm life.',
    images: [
      {
        url: 'https://satwikfarms.com/images/activities/1.jpg',
        width: 1200,
        height: 630,
        alt: 'Satwik Farms gallery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Farm Gallery - Satwik Farms',
    description: 'Photos from our residue free farm in Kisarawe, Tanzania.',
    images: ['https://satwikfarms.com/images/activities/1.jpg'],
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
