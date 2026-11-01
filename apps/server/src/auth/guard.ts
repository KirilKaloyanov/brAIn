// Request guards (architecture §4.1, §4.2).
import type { CookieOptions, Request, RequestHandler } from 'express';
import { deviceId, type DeviceStore } from './devices.js';

export const SESSION_COOKIE = '__Host-session';

/**
 * Options for the app's cookies. A `__Host-` cookie must be `Secure` with `Path=/` and no domain;
 * browsers accept `Secure` cookies from `http://localhost` too. `Lax`, not `Strict`, because the
 * redirect back from Google is a cross-site navigation.
 */
export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
};

/** A cookie parsed by `cookie-parser`, which types them all as `any`. */
export function readCookie(req: Request, name: string): string | undefined {
  const value = (req.cookies as Record<string, unknown>)[name];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Lets a request through only from a signed-in device, kept in `res.locals.deviceId` and
 * `res.locals.device`. Signed out means no cookie, an unknown device or an expired one: a page load
 * is redirected to `/sign-in`, an API call gets `401`.
 */
export function requireSession(devices: DeviceStore, kind: 'page' | 'api'): RequestHandler {
  return async (req, res, next) => {
    const token = readCookie(req, SESSION_COOKIE);
    const id = token ? deviceId(token) : undefined;
    const device = id === undefined ? undefined : await devices.get(id);
    if (device === undefined || device.expiresAt <= new Date()) {
      if (kind === 'page') res.redirect(302, '/sign-in');
      else res.status(401).json({ code: 'signed-out' });
      return;
    }
    res.locals.deviceId = id;
    res.locals.device = device;
    next();
  };
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Rejects state-changing requests from other sites, on top of `SameSite=Lax`: the `Origin` must be
 * the app's own, and a body, if any, must be JSON, which a cross-site HTML form can't send.
 */
export function requireSameOrigin(publicUrl: string): RequestHandler {
  return (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }
    if (req.get('origin') !== publicUrl) {
      res.status(403).json({ code: 'bad-origin' });
      return;
    }
    // A request without a body, like a bodyless fetch(), sends neither header (or Content-Length: 0).
    const hasContent =
      req.get('content-type') !== undefined ||
      req.get('transfer-encoding') !== undefined ||
      Number(req.get('content-length') ?? 0) > 0;
    if (hasContent && !req.is('application/json')) {
      res.status(415).json({ code: 'json-required' });
      return;
    }
    next();
  };
}
