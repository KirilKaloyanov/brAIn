// Builds the Express app without listening, so tests can send requests to it directly.
import type { HealthResponse } from '@brain/shared';
import cookieParser from 'cookie-parser';
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import { join } from 'node:path';
import type { DeviceStore } from './auth/devices.js';
import type { GoogleSignIn } from './auth/google.js';
import { requireSameOrigin, requireSession } from './auth/guard.js';
import { authRouter } from './auth/routes.js';
import type { Config } from './config.js';

/** What the routes depend on; tests pass fakes (architecture §2.1). */
export interface AppDeps {
  devices: DeviceStore;
  google: GoogleSignIn;
}

export interface AppOptions {
  /** Folder with the built web app; when set, it is served with an SPA fallback to `index.html`. */
  webDir?: string;
}

export function createApp(
  config: Config,
  deps: AppDeps,
  options: AppOptions = {},
): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(cookieParser());
  app.use(requireSameOrigin(config.publicUrl));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' } satisfies HealthResponse);
  });

  app.use(authRouter({ config, ...deps }));

  // Every other API route needs a signed-in device (architecture §4.2).
  app.use('/api', requireSession(deps.devices, 'api'));

  if (options.webDir !== undefined) {
    serveWeb(app, options.webDir, requireSession(deps.devices, 'page'));
  }

  app.use(errorHandler(config));
  return app;
}

function serveWeb(app: express.Express, webDir: string, guard: RequestHandler): void {
  // index: false, so every HTML page goes through the routes below and the session guard.
  app.use(express.static(webDir, { index: false }));

  const sendIndex: RequestHandler = (_req, res) => {
    res.sendFile(join(webDir, 'index.html'));
  };

  app.get('/sign-in', sendIndex);

  // Any other GET is a client-side route for a signed-in device; unknown /api and /auth paths stay
  // 404s.
  app.get(
    '/{*path}',
    (req, _res, next) => {
      next(/^\/(api|auth)(\/|$)/.test(req.path) ? 'route' : undefined);
    },
    guard,
    sendIndex,
  );
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
