import Image from 'next/image';
import Link from 'next/link';
import { buildServiceJsonLd } from '@/lib/services';

export default function ServiceLanding({ service }) {
  const jsonLd = buildServiceJsonLd(service);

  return (
    <div className="pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative py-16 md:py-24 px-6 bg-farm-cream">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <div className="text-5xl md:text-6xl mb-4 md:mb-6">{service.icon}</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-farm-green-primary mb-4">
              {service.title}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-8">
              {service.tagline}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/255767211422"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg inline-block"
              >
                Order on WhatsApp
              </a>
              <a
                href="tel:+255767211422"
                className="px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg inline-block bg-white text-farm-green-primary border border-farm-green-primary hover:bg-farm-green-light/20 transition"
              >
                Call +255 767 211 422
              </a>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg">
            <Image
              src={service.image}
              alt={service.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={85}
              priority
            />
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 md:py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-farm-green-primary mb-8 text-center">
            What you get
          </h2>
          <p className="text-base md:text-lg text-text-secondary mb-10 text-center max-w-3xl mx-auto">
            {service.description}
          </p>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {service.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 bg-farm-cream rounded-2xl p-5 md:p-6"
              >
                <span className="text-farm-green-bright text-2xl shrink-0">✓</span>
                <span className="text-base md:text-lg text-text-primary">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Reading from blog */}
      {service.relatedBlogs && service.relatedBlogs.length > 0 && (
        <section className="py-16 md:py-20 px-6 bg-farm-cream">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-farm-green-primary mb-4 text-center">
              Learn more
            </h2>
            <p className="text-base md:text-lg text-text-secondary mb-10 text-center">
              Dive deeper into the products and farming philosophy behind this service.
            </p>
            <ul className="space-y-3">
              {service.relatedBlogs.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block bg-white rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition border border-transparent hover:border-farm-green-light"
                  >
                    <span className="text-base md:text-lg font-semibold text-farm-green-primary">
                      {post.title}
                    </span>
                    <span className="block text-sm text-farm-green-bright mt-1">Read article →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-farm-green-primary mb-4">
            Ready to order?
          </h2>
          <p className="text-base md:text-lg text-text-secondary mb-8">
            Place your order in minutes via WhatsApp, or browse the full range in the Satwik Farms app.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/255767211422"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-8 py-4 rounded-full text-lg inline-block"
            >
              Order on WhatsApp
            </a>
            <Link
              href="/ventures"
              className="px-8 py-4 rounded-full text-lg inline-block bg-white text-farm-green-primary border border-farm-green-primary hover:bg-farm-green-light/20 transition"
            >
              See all ventures
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
