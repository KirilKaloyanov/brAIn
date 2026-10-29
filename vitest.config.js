// @ts-check
import { defineConfig } from 'vitest/config';

// One project per workspace, so each app gets its own test environment.
export default defineConfig({
  test: {
    projects: [
      {
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
