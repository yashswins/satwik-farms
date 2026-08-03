import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['lib/**/*.test.js', 'components/**/*.test.jsx'],
  },
  resolve: {
    alias: { '@': path.resolve(process.cwd()) },
  },
});
