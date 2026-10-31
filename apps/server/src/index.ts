// Entry point: loads config, builds the app and listens on PORT.
import { createApp } from './app.js';
import { ConfigError, loadConfig } from './config.js';

try {
  const config = loadConfig();
  createApp(config).listen(config.port, () => {
    console.log(`brAIn server listening on port ${config.port} (${config.nodeEnv})`);
  });
} catch (err) {
  if (!(err instanceof ConfigError)) throw err;
  console.error(err.message);
  process.exit(1);
}
