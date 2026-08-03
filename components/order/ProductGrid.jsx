'use client';

import ProductCard from '@/components/order/ProductCard';

/**
 * Full product listing — always a grid, gaining columns with viewport width.
 * Used by category, search and favourites, where the customer wants to see
 * everything rather than scroll one row.
 */
export function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} fluid />
      ))}
    </div>
  );
}

/**
 * Home-screen category row.
 *
 * A horizontal scroller on phones, matching the app, but a wrapped grid from
 * tablet up — a single scrolling row on a laptop wastes most of the width and
 * hides products behind a gesture that is awkward with a mouse.
 */
export function ProductRow({ products }) {
  return (
    <div
      className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1
                 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0
                 lg:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
