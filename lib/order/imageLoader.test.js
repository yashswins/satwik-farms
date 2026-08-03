import { describe, it, expect } from 'vitest';

import { cloudinaryLoader, CLOUDINARY_UPLOAD_PREFIX } from './imageLoader';

describe('cloudinaryLoader', () => {
  const src = `${CLOUDINARY_UPLOAD_PREFIX}VEG-048`;

  it('injects the requested width with auto format and quality', () => {
    expect(cloudinaryLoader({ src, width: 128 }))
      .toBe(`${CLOUDINARY_UPLOAD_PREFIX}w_128,c_fill,f_auto,q_auto/VEG-048`);
  });

  it('every width produces a distinct URL — that is the whole point', () => {
    const urls = [64, 128, 384, 828].map((width) => cloudinaryLoader({ src, width }));
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('passes an explicit quality through', () => {
    expect(cloudinaryLoader({ src, width: 400, quality: 75 })).toContain('q_75');
  });

  it('leaves a non-Cloudinary override URL untouched at any width', () => {
    const override = 'https://example.com/photos/custom.jpg';
    expect(cloudinaryLoader({ src: override, width: 640 })).toBe(override);
  });
});
