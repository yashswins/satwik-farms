import Link from 'next/link';

// Reusable section that links from non-blog pages to relevant blog posts.
// Pass `posts` as an array of { slug, title, excerpt? } objects, plus
// optional `heading` and `intro` overrides.
export default function RelatedArticles({
  posts,
  heading = 'Read more from the Satwik blog',
  intro = 'Dive deeper into our farming, products, and the Ayurvedic wisdom behind everything we do.',
}) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-16 md:py-20 px-6 bg-farm-cream">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-farm-green-primary mb-4 text-center">
          {heading}
        </h2>
        <p className="text-base md:text-lg text-text-secondary mb-10 text-center max-w-3xl mx-auto">
          {intro}
        </p>
        <ul className="grid md:grid-cols-2 gap-4 md:gap-5">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block bg-white rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition border border-transparent hover:border-farm-green-light h-full"
              >
                <span className="block text-base md:text-lg font-semibold text-farm-green-primary">
                  {post.title}
                </span>
                {post.excerpt && (
                  <span className="block text-sm md:text-base text-text-secondary mt-2">
                    {post.excerpt}
                  </span>
                )}
                <span className="block text-sm text-farm-green-bright mt-3">Read article →</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-block px-8 py-3 rounded-full text-base bg-white text-farm-green-primary border border-farm-green-primary hover:bg-farm-green-light/20 transition font-semibold"
          >
            Browse all articles →
          </Link>
        </div>
      </div>
    </section>
  );
}
