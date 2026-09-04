import Link from 'next/link';

export default function Card({ title, subtitle, href, hrefLabel = 'See all', children, className = '' }) {
  return (
    <section
      className={`min-w-0 rounded-shop-md border border-shop-border bg-shop-surface p-4 shadow-sm
                  dark:border-[#2E352E] dark:bg-[#1A1E1A] ${className}`}
    >
      {(title || href) && (
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {subtitle && <p className="text-xs text-shop-text-secondary">{subtitle}</p>}
          </div>
          {href && (
            <Link href={href} className="shrink-0 text-xs font-medium text-shop-primary-dark hover:underline dark:text-shop-primary-light">
              {hrefLabel} →
            </Link>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

export function Empty({ children = 'Nothing to show for this period.' }) {
  return <p className="py-6 text-center text-sm text-shop-text-secondary">{children}</p>;
}

export function Unavailable({ what = 'This widget', reason }) {
  return (
    <p className="rounded-shop-sm bg-shop-warning/10 px-3 py-2 text-xs text-shop-warning">
      {what} could not be loaded{reason ? `: ${reason}` : '.'}
    </p>
  );
}
