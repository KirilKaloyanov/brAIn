// Entry point: loads config, builds the app and listens on PORT.
import { resolve } from 'node:path';
import { createApp } from './app.js';
import { ConfigError, loadConfig } from './config.js';

try {
  const config = loadConfig();
  // In development Vite serves the web app (architecture §8); src/ and dist/ are both one level deep.
  const webDir =
    config.nodeEnv === 'production' ? resolve(import.meta.dirname, '../../web/dist') : undefined;
  createApp(config, { webDir }).listen(config.port, () => {
    console.log(`brAIn server listening on port ${config.port} (${config.nodeEnv})`);
  });
} catch (err) {
  if (!(err instanceof ConfigError)) throw err;
  console.error(err.message);
  process.exit(1);
}
