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

const BASE_URL = 'https://satwikfarms.com';

function toISODate(dateStr) {
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const blog = getBlogBySlug(resolvedParams.slug);

  if (!blog) {
    return { title: 'Blog Not Found' };
  }

  const canonicalUrl = `${BASE_URL}/blog/${resolvedParams.slug}`;
  const ogImageSource = blog.ogImage || blog.image;
  const imageUrl = ogImageSource
    ? ogImageSource.startsWith('http')
      ? ogImageSource
      : `${BASE_URL}${ogImageSource}`
    : `${BASE_URL}/images/farm/1.jpg`;
  const isoDate = toISODate(blog.date);

  return {
    title: `${blog.title} | Satwik Farms Blog`,
    description: blog.excerpt,
    keywords: blog.keywords ?? [blog.category, 'Satwik Farms', 'Tanzania', 'residue free farming'],
    authors: [{ name: 'Satwik Farms', url: BASE_URL }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: blog.title,
      description: blog.excerpt,
      siteName: 'Satwik Farms',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      ...(isoDate && {
        article: {
          publishedTime: isoDate,
          section: blog.category,
          authors: ['https://satwikfarms.com'],
        },
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt,
      images: [imageUrl],
    },
  };
}

export default async function BlogPost({ params }) {
  const resolvedParams = await params;
  const blog = getBlogBySlug(resolvedParams.slug);

  if (!blog) {
    notFound();
  }

  const canonicalUrl = `${BASE_URL}/blog/${resolvedParams.slug}`;
  const imageUrl = blog.image
    ? blog.image.startsWith('http')
      ? blog.image
      : `${BASE_URL}${blog.image}`
    : `${BASE_URL}/images/farm/1.jpg`;
  const isoDate = toISODate(blog.date);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: imageUrl,
    url: canonicalUrl,
    datePublished: isoDate,
    dateModified: isoDate,
    author: {
      '@type': 'Organization',
      name: 'Satwik Farms',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Satwik Farms',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    articleSection: blog.category,
    keywords: Array.isArray(blog.keywords)
      ? blog.keywords.join(', ')
      : [blog.category, 'Satwik Farms', 'Tanzania'].join(', '),
  };

  return (
    <div className="pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            <time dateTime={isoDate ?? blog.date}>{blog.date}</time>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {blog.image && (
        <section className="px-6 py-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className={`relative w-full h-64 md:h-80 lg:h-[520px] rounded-2xl overflow-hidden ${blog.imageFit === 'contain' ? 'bg-farm-cream' : ''}`}>
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className={blog.imageFit === 'contain' ? 'object-contain p-4' : 'object-cover object-[center_20%]'}
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
