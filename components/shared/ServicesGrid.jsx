import Link from 'next/link';
import { services } from '@/lib/services';

// Grid of focused service landing pages — used to internally link from
// /ventures and the homepage to the SEO-targeted service pages.
export default function ServicesGrid({
  heading = 'Explore our services',
  intro = 'Each service has its own page with details, features, and how to order.',
  slugs,
}) {
  const items = (slugs || Object.keys(services)).map((s) => services[s]).filter(Boolean);

  return (
    <section className="py-16 md:py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-farm-green-primary mb-4 text-center">
          {heading}
        </h2>
        <p className="text-base md:text-lg text-text-secondary mb-10 text-center max-w-3xl mx-auto">
          {intro}
        </p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {items.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/${service.slug}`}
                className="block bg-farm-cream rounded-2xl p-6 hover:shadow-md transition border border-transparent hover:border-farm-green-light h-full"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="text-lg md:text-xl font-bold text-farm-green-primary mb-2">
                  {service.title}
                </h3>
                <p className="text-sm md:text-base text-text-secondary mb-3">
                  {service.tagline}
                </p>
                <span className="text-sm text-farm-green-bright font-semibold">Learn more →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
