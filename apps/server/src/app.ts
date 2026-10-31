// Builds the Express app without listening, so tests can send requests to it directly.
import type { HealthResponse } from '@brain/shared';
import express, { type ErrorRequestHandler } from 'express';
import type { Config } from './config.js';

export function createApp(config: Config): express.Express {
  const app = express();
  app.disable('x-powered-by');

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' } satisfies HealthResponse);
  });

  app.use(errorHandler(config));
  return app;
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
