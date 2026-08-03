import { describe, it, expect } from 'vitest';

import { formatPrice, formatAmount, productImageUrl, greeting } from './format';

describe('formatPrice — must match the phone app exactly', () => {
  it('prefixes TSH and groups thousands', () => {
    expect(formatPrice(12400)).toBe('TSH 12,400');
  });

  it('rounds to the nearest 100', () => {
    expect(formatPrice(12449)).toBe('TSH 12,400');
    expect(formatPrice(12450)).toBe('TSH 12,500');
    expect(formatPrice(1049)).toBe('TSH 1,000');
  });

  it('handles zero and nonsense without throwing', () => {
    expect(formatPrice(0)).toBe('TSH 0');
    expect(formatPrice(null)).toBe('TSH 0');
    expect(formatPrice(undefined)).toBe('TSH 0');
    expect(formatPrice('abc')).toBe('TSH 0');
  });

  it('formats large baskets', () => {
    expect(formatPrice(1234567)).toBe('TSH 1,234,600');
  });
});

describe('formatAmount', () => {
  it('omits the currency prefix', () => {
    expect(formatAmount(12400)).toBe('12,400');
  });
});

describe('productImageUrl', () => {
  // Bare asset URL — width/format transforms are injected per rendered slot by
  // the Cloudinary loader (imageLoader.js), not baked in here.
  it('builds a bare Cloudinary URL from the product id', () => {
    expect(productImageUrl({ id: 'VEG-048' }))
      .toBe('https://res.cloudinary.com/di05dpaiq/image/upload/VEG-048');
  });

  it('honours an override from the sheet', () => {
    expect(productImageUrl({ id: 'VEG-048', imageUrlOverride: 'https://example.com/a.jpg' }))
      .toBe('https://example.com/a.jpg');
  });

  it('accepts the raw snake_case override too', () => {
    expect(productImageUrl({ id: 'X', image_url_override: 'https://example.com/b.jpg' }))
      .toBe('https://example.com/b.jpg');
  });

  it('returns null when there is nothing to build from', () => {
    expect(productImageUrl(null)).toBeNull();
    expect(productImageUrl({})).toBeNull();
  });
});

describe('greeting', () => {
  it('changes with the time of day', () => {
    expect(greeting(new Date('2026-08-03T08:00:00'))).toBe('Good morning');
    expect(greeting(new Date('2026-08-03T13:00:00'))).toBe('Good afternoon');
    expect(greeting(new Date('2026-08-03T20:00:00'))).toBe('Good evening');
  });
});
