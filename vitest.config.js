// @ts-check
import react from '@vitejs/plugin-react';
import { resolve as resolvePath } from 'node:path';
import { defineConfig } from 'vitest/config';

// Tests read @brain/shared from source, so they don't need `npm run build` first.
const resolve = {
  alias: {
    '@brain/shared': resolvePath(import.meta.dirname, 'packages/shared/src/index.ts'),
  },
};

// One project per workspace, so each app gets its own test environment.
export default defineConfig({
  test: {
    projects: [
      {
        resolve,
        test: {
          name: 'shared',
          root: 'packages/shared',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        resolve,
        test: {
          name: 'server',
          root: 'apps/server',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        resolve,
        plugins: [react()],
        test: {
          name: 'web',
          root: 'apps/web',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
    ],
  },
});
