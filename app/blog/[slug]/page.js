import { getAllBlogSlugs, getBlogBySlug } from '@/lib/blogUtils';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogContent from './BlogContent';

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }) {
  const blog = getBlogBySlug(params.slug);

  if (!blog) {
    return {
      title: 'Blog Not Found',
    };
  }

  return {
    title: `${blog.title} | Satwik Farms Blog`,
    description: blog.excerpt,
  };
}

export default function BlogPost({ params }) {
  const blog = getBlogBySlug(params.slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 bg-farm-cream">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center text-farm-green-bright hover:text-farm-green-primary mb-6 transition"
          >
            ← Back to Blog
          </Link>

          <div className="mb-6">
            <span className="bg-farm-green-bright text-white px-4 py-2 rounded-full text-sm font-semibold">
              {blog.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-farm-green-primary mb-4">
            {blog.title}
          </h1>

          <p className="text-lg text-text-secondary mb-6">{blog.excerpt}</p>

          <div className="text-sm text-text-light">
            <time dateTime={blog.date}>{blog.date}</time>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {blog.image && (
        <section className="px-6 py-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                quality={90}
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* Blog Content */}
      <section className="py-12 md:py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <BlogContent content={blog.content} />
        </div>
      </section>

      {/* Back to Blog CTA */}
      <section className="py-12 px-6 bg-farm-cream">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/blog"
            className="btn-primary px-8 py-4 rounded-full text-lg inline-block"
          >
            ← Back to All Posts
          </Link>
        </div>
      </section>
    </div>
  );
}
