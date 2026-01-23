const BASE_URL = 'https://satwikfarms.com';

export default function sitemap() {
  const lastModified = new Date();
  const routes = [
    { path: '/', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/farm-visits', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/ventures', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/blog/submit', changeFrequency: 'monthly', priority: 0.5 },
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
