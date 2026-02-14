import { getAllBlogs } from '@/lib/blogUtils';
import BlogHero from './BlogHero';
import BlogGrid from './BlogGrid';

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
