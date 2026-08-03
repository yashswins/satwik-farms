'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import ProductImage from '@/components/order/ProductImage';
import { ProductRow } from '@/components/order/ProductGrid';
import { formatPrice } from '@/lib/order/format';

/**
 * Sections that are empty in the catalogue today but will be populated later:
 * banners, featured sections and combo deals.
 *
 * They are wired now and tested against synthetic data, because the failure
 * mode otherwise is silent — the sheet gets its first banner and nothing
 * appears, with no error to explain why. Each renders nothing when its source
 * array is empty, so they cost nothing until they are used.
 */

/** Auto-advancing promotional banners. */
export function BannerCarousel({ banners }) {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(timer.current);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const banner = banners[Math.min(index, banners.length - 1)];

  const content = (
    <div className="relative h-[128px] w-full overflow-hidden rounded-shop-md bg-shop-surface-alt
                    sm:h-[168px]">
      {banner.imageUrl ? (
        // Banner images come from the sheet as absolute URLs, which may be on a
        // host the CSP does not allow. A plain <img> still fails closed there,
        // so the gradient below shows through rather than leaving a blank box.
        <img
          src={banner.imageUrl}
          alt={banner.title || (banner.targetId ? `Shop ${banner.targetId}` : 'Offer')}
          className="h-full w-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-r from-shop-primary-dark to-shop-primary" />
      )}
      {(banner.title || banner.subtitle || banner.targetId) && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t
                        from-black/55 to-transparent p-4">
          <p className="text-[16px] font-semibold text-white">
            {banner.title || banner.targetId}
          </p>
          {banner.subtitle && (
            <p className="text-[13px] text-white/90">{banner.subtitle}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="mb-6" aria-label="Offers">
      {banner.href
        ? <Link href={banner.href} aria-label={`Shop ${banner.title || banner.targetId}`}>{content}</Link>
        : content}
      {banners.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show offer ${i + 1} of ${banners.length}`}
              aria-current={i === index ? 'true' : undefined}
              className={`h-1.5 rounded-full transition-all
                          ${i === index ? 'w-5 bg-shop-primary' : 'w-1.5 bg-shop-border'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** Curated product rows, e.g. "Weekly picks". */
export function FeaturedSections({ catalog }) {
  const sections = (catalog.featuredSections ?? [])
    .map((section) => ({
      ...section,
      products: section.itemIds
        .map((id) => catalog.productsById.get(id))
        .filter((p) => p && p.isActive && p.inStock),
    }))
    // A section whose items have all sold out would render an empty heading.
    .filter((section) => section.products.length > 0);

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <section key={section.id} className="mb-7">
          <div className="mb-3">
            <h2 className="text-[16px] font-semibold text-shop-text">{section.title}</h2>
            {section.subtitle && (
              <p className="text-[13px] text-shop-text-secondary">{section.subtitle}</p>
            )}
          </div>
          <ProductRow products={section.products} />
        </section>
      ))}
    </>
  );
}

/** Bundle deals — a fixed price for a set of products. */
export function ComboDeals({ catalog }) {
  const combos = (catalog.combos ?? [])
    .map((combo) => {
      // lineItems collapses repeated ids into quantities; totalUnits is what the
      // customer actually receives.
      const lines = combo.lineItems
        .map(({ id, quantity }) => ({ product: catalog.productsById.get(id), quantity }))
        .filter((l) => l.product);
      return {
        ...combo,
        lines,
        totalUnits: lines.reduce((n, l) => n + l.quantity, 0),
      };
    })
    .filter((combo) => combo.lines.length > 0);

  if (combos.length === 0) return null;

  return (
    <section className="mb-7">
      <h2 className="mb-3 text-[16px] font-semibold text-shop-text">Combo deals</h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1
                      [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                      md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0
                      lg:grid-cols-3">
        {combos.map((combo) => (
          <Link
            key={combo.id}
            href={`/order/combo/${encodeURIComponent(combo.id)}`}
            className="flex w-[240px] shrink-0 gap-3 rounded-shop-md border border-shop-border
                       bg-shop-surface p-3 md:w-auto md:hover:shadow-md"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-shop-sm
                            bg-shop-surface-alt">
              <ProductImage product={combo.lines[0].product} sizes="64px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-shop-text">{combo.name}</p>
              <p className="text-[12px] text-shop-text-secondary">
                {combo.totalUnits} {combo.totalUnits === 1 ? 'item' : 'items'}
              </p>
              <p className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[14px] font-semibold text-shop-text">
                  {formatPrice(combo.price)}
                </span>
                {combo.originalPrice > combo.price && (
                  <span className="text-[11px] text-shop-text-tertiary line-through">
                    {formatPrice(combo.originalPrice)}
                  </span>
                )}
              </p>
              {combo.discountText && (
                <p className="mt-0.5 inline-block rounded-full bg-shop-primary/10 px-2 py-0.5
                              text-[10px] font-semibold text-shop-primary-dark">
                  {combo.discountText}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
