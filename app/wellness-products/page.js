import ServiceLanding from '@/components/services/ServiceLanding';
import { getService } from '@/lib/services';

const service = getService('wellness-products');

export const metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  keywords: service.keywords,
  alternates: {
    canonical: `https://satwikfarms.com/${service.slug}`,
  },
  openGraph: {
    type: 'website',
    title: service.metaTitle,
    description: service.metaDescription,
    url: `https://satwikfarms.com/${service.slug}`,
    images: [
      {
        url: `https://satwikfarms.com${service.image}`,
        width: 1200,
        height: 630,
        alt: service.imageAlt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: service.title,
    description: service.metaDescription,
    images: [`https://satwikfarms.com${service.image}`],
  },
};

export default function WellnessProductsPage() {
  return <ServiceLanding service={service} />;
}
