// @ts-check
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
      // apps/web joins when React is added (jsdom + Testing Library).
    ],
  },
});
