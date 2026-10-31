// @ts-check
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const root = resolve(import.meta.dirname, '../..');

export default defineConfig(({ mode }) => {
  // The server's PORT lives in the root .env; '' loads every variable, not just VITE_*.
  const { PORT = '8080' } = loadEnv(mode, root, '');
  const server = `http://localhost:${PORT}`;

  return {
    plugins: [react()],
    // Bundle @brain/shared from source, so dev and build don't need it built first.
    resolve: {
      alias: { '@brain/shared': resolve(root, 'packages/shared/src/index.ts') },
    },
    // Same origin in development too: the browser only talks to Vite (architecture §8).
    server: {
      proxy: { '/api': server, '/auth': server },
    },
  };
});
