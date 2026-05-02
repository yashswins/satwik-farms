import BlogSubmitForm from './BlogSubmitForm';

export const metadata = {
  title: 'Share Your Farm Story',
  description: 'Submit your farm visit experience, recipe, farming tip, or product testimonial to be featured on the Satwik Farms blog.',
  keywords: ['Satwik Farms blog submission', 'share farm story', 'submit farm visit experience Tanzania', 'guest post farm blog'],
  alternates: {
    canonical: 'https://satwikfarms.com/blog/submit',
  },
  openGraph: {
    type: 'website',
    url: 'https://satwikfarms.com/blog/submit',
    title: 'Share Your Farm Story | Satwik Farms',
    description: 'Submit your farm visit experience, recipe, farming tip, or testimonial to be featured on our blog.',
    images: [
      {
        url: 'https://satwikfarms.com/images/farm/1.jpg',
        width: 1200,
        height: 630,
        alt: 'Share your farm story with Satwik Farms',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Share Your Farm Story | Satwik Farms',
    description: 'Submit your farm visit experience or testimonial to be featured on the Satwik Farms blog.',
    images: ['https://satwikfarms.com/images/farm/1.jpg'],
  },
};

export default function BlogSubmitPage() {
  return <BlogSubmitForm />;
}
