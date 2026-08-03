import { getAllBlogs } from '@/lib/blogUtils';
import { getAllServiceSlugs } from '@/lib/services';

const BASE_URL = 'https://satwikfarms.com';

// Bump this only when a static/service page meaningfully changes.
// Using new Date() here stamped every URL with the request time, so lastmod
// churned daily and Google learns to ignore the sitemap's dates entirely.
const STATIC_LASTMOD = new Date('2026-08-03');

export default function sitemap() {
  const lastModified = STATIC_LASTMOD;
  const staticRoutes = [
    // Ordering storefront. Sub-routes (cart, checkout, account) are
    // transactional and marked noindex in their own metadata.
    { path: '/order', changeFrequency: 'daily', priority: 0.9 },
    { path: '/', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/farm-visits', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/gallery', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/ventures', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/blog/submit', changeFrequency: 'monthly', priority: 0.5 },
  ];

  const serviceRoutes = getAllServiceSlugs().map((slug) => ({
    path: `/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  const blogs = getAllBlogs();
  const blogRoutes = blogs.map((blog) => ({
    url: `${BASE_URL}/blog/${blog.slug}`,
    lastModified: blog.dateModified
      ? new Date(blog.dateModified)
      : blog.date
        ? new Date(blog.date)
        : lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${BASE_URL}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...serviceRoutes.map((route) => ({
      url: `${BASE_URL}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...blogRoutes,
  ];
}
