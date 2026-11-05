import path from 'node:path';
import { defineConfig } from 'vitest/config';

const root = path.resolve(import.meta.dirname, '..', '..');

export default defineConfig({
  root,
  test: {
    environment: 'node',
    include: ['scripts/dashboard-parity/parity.test.mjs'],
    testTimeout: 30 * 60_000,
    hookTimeout: 5 * 60_000,
  },
  resolve: {
    alias: [
      { find: 'server-only', replacement: path.join(root, 'scripts/dashboard-parity/server-only-stub.js') },
      { find: /^@\//, replacement: `${root}/` },
    ],
  },
});
