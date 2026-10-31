// Builds the Express app without listening, so tests can send requests to it directly.
import type { HealthResponse } from '@brain/shared';
import express, { type ErrorRequestHandler } from 'express';
import { join } from 'node:path';
import type { Config } from './config.js';

export interface AppOptions {
  /** Folder with the built web app; when set, it is served with an SPA fallback to `index.html`. */
  webDir?: string;
}

export function createApp(config: Config, options: AppOptions = {}): express.Express {
  const app = express();
  app.disable('x-powered-by');

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' } satisfies HealthResponse);
  });

  if (options.webDir !== undefined) serveWeb(app, options.webDir);

  app.use(errorHandler(config));
  return app;
}

function serveWeb(app: express.Express, webDir: string): void {
  // index: false, so every HTML page goes through the fallback below (the session guard joins it later).
  app.use(express.static(webDir, { index: false }));

  // Any other GET is a client-side route; unknown /api and /auth paths stay 404s.
  app.get('/{*path}', (req, res, next) => {
    if (/^\/(api|auth)(\/|$)/.test(req.path)) {
      next();
      return;
    }
    res.sendFile(join(webDir, 'index.html'));
  });
}

export function errorHandler(config: Config): ErrorRequestHandler {
  return (err: unknown, _req, res, next) => {
    console.error(err);
    if (res.headersSent) {
      next(err);
      return;
    }
    // Details help in development; in production they could leak internals.
    const details =
      config.nodeEnv !== 'production' && err instanceof Error
        ? { message: err.message, stack: err.stack }
        : { message: 'Internal server error' };
    res.status(500).json({ code: 'internal', ...details });
  };
}
