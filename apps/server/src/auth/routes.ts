// Google sign-in routes (architecture §4.1). Failures go back to the sign-in page with
// `?error=denied` (another account) or `?error=failed` (anything else).
import { Router } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { Config } from '../config.js';
import { deviceId, newSessionToken, type DeviceStore } from './devices.js';
import { CALLBACK_PATH, type GoogleAccount, type GoogleSignIn } from './google.js';
import { COOKIE_OPTIONS, readCookie, SESSION_COOKIE } from './guard.js';

const STATE_COOKIE = '__Host-oauth-state';
const STATE_MAX_AGE_MS = 10 * 60 * 1000;
export const SESSION_MAX_AGE_MS = 15 * 24 * 60 * 60 * 1000;

export interface AuthRouterDeps {
  config: Pick<Config, 'allowedEmail'>;
  devices: DeviceStore;
  google: GoogleSignIn;
}

export function authRouter({ config, devices, google }: AuthRouterDeps): Router {
  const router = Router();

  // The state cookie ties the callback to a sign-in this browser started.
  router.get('/auth/google', (_req, res) => {
    const state = randomBytes(32).toString('base64url');
    res.cookie(STATE_COOKIE, state, { ...COOKIE_OPTIONS, maxAge: STATE_MAX_AGE_MS });
    res.redirect(302, google.authUrl(state));
  });

  router.get(CALLBACK_PATH, async (req, res) => {
    const expectedState = readCookie(req, STATE_COOKIE);
    res.clearCookie(STATE_COOKIE, COOKIE_OPTIONS);
    // Without a code, e.g. when the owner cancels on Google's screen.
    const { state, code } = req.query;
    if (typeof code !== 'string' || !sameState(state, expectedState)) {
      res.redirect(302, '/sign-in?error=failed');
      return;
    }

    let account: GoogleAccount;
    try {
      account = await google.account(code);
    } catch (err) {
      console.error(err);
      res.redirect(302, '/sign-in?error=failed');
      return;
    }
    if (!account.emailVerified || account.email.toLowerCase() !== config.allowedEmail) {
      res.redirect(302, '/sign-in?error=denied');
      return;
    }

    // A new device each time, so signing in here leaves other devices signed in (FR-3).
    const token = newSessionToken();
    const now = new Date();
    await devices.create(deviceId(token), {
      createdAt: now,
      expiresAt: new Date(now.getTime() + SESSION_MAX_AGE_MS),
      lastActiveAt: now,
      failedPins: 0,
      userAgent: req.get('user-agent') ?? '',
    });
    res.cookie(SESSION_COOKIE, token, { ...COOKIE_OPTIONS, maxAge: SESSION_MAX_AGE_MS });
    res.redirect(302, '/');
  });

  return router;
}

function sameState(received: unknown, expected: string | undefined): boolean {
  if (typeof received !== 'string' || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
