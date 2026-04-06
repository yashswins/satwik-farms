import { getAllBlogs } from '@/lib/blogUtils';
import BlogHero from './BlogHero';
import BlogGrid from './BlogGrid';

export const metadata = {
  title: 'Blog | Satwik Farms',
  description: 'Explore articles on residue-free farming, healthy eating, farm life, nutrition, and sustainable agriculture from Satwik Farms in Kisarawe, Tanzania.',
  keywords: ['Satwik Farms blog', 'residue free farming Tanzania', 'healthy eating Tanzania', 'sustainable agriculture blog', 'farm to table Tanzania', 'organic farming tips'],
  alternates: {
    canonical: 'https://satwikfarms.com/blog',
  },
  openGraph: {
    type: 'website',
    url: 'https://satwikfarms.com/blog',
    title: 'Blog | Satwik Farms',
    description: 'Explore articles on residue-free farming, healthy eating, farm life, and sustainable agriculture from Satwik Farms in Tanzania.',
    images: [
      {
        url: 'https://satwikfarms.com/images/farm/1.jpg',
        width: 1200,
        height: 630,
        alt: 'Satwik Farms Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Satwik Farms',
    description: 'Articles on residue-free farming, healthy eating, and sustainable agriculture from Satwik Farms Tanzania.',
    images: ['https://satwikfarms.com/images/farm/1.jpg'],
  },
};

export default function BlogPage() {
  const blogPosts = getAllBlogs();

  return (
    <div className="pt-20">
      <BlogHero />

      {/* Blog Posts Grid */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <BlogGrid blogPosts={blogPosts} />
        </div>
      </section>
    </div>
  );
}
