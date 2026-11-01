import type express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { fakeGoogle, MemoryDeviceStore, testConfig } from '../testing.js';
import type { GoogleAccount } from './google.js';
import { deviceId } from './devices.js';

const owner: GoogleAccount = { email: 'owner@example.com', emailVerified: true };

function setup(account: GoogleAccount | Error = owner) {
  const devices = new MemoryDeviceStore();
  const google = fakeGoogle(account);
  const app = createApp(testConfig, { devices, google });
  return { app, devices, google };
}

/** The Set-Cookie header for `name`, or undefined. */
function setCookie(res: request.Response, name: string): string | undefined {
  const headers = (res.headers['set-cookie'] ?? []) as string[];
  return headers.find((header) => header.startsWith(`${name}=`));
}

function callback(app: express.Express, query: string, cookie = '__Host-oauth-state=abc') {
  return request(app).get(`/auth/google/callback?${query}`).set('Cookie', cookie);
}

describe('GET /auth/google', () => {
  it('redirects to Google with a state that matches the state cookie', async () => {
    const { app } = setup();
    const res = await request(app).get('/auth/google').expect(302);

    const cookie = setCookie(res, '__Host-oauth-state');
    const state = /^__Host-oauth-state=([\w-]+);/.exec(cookie ?? '')?.[1];
    expect(state).toHaveLength(43);
    expect(res.headers.location).toBe(`https://accounts.example/auth?state=${state}`);
    expect(cookie).toContain('Max-Age=600');
    expect(cookie).toMatch(/Path=\/;.*HttpOnly; Secure; SameSite=Lax/);
  });
});

describe('GET /auth/google/callback', () => {
  it('signs in the allowed account: stores a device and sets the session cookie', async () => {
    const { app, devices } = setup();
    const res = await callback(app, 'state=abc&code=good-code')
      .set('User-Agent', 'Test Browser')
      .expect(302);

    expect(res.headers.location).toBe('/');
    const cookie = setCookie(res, '__Host-session');
    expect(cookie).toContain('Max-Age=1296000');
    expect(cookie).toMatch(/Path=\/;.*HttpOnly; Secure; SameSite=Lax/);
    expect(setCookie(res, '__Host-oauth-state')).toContain('Expires=Thu, 01 Jan 1970');

    const token = /^__Host-session=([\w-]+);/.exec(cookie ?? '')?.[1] ?? '';
    expect(token).toHaveLength(43);
    const device = devices.devices.get(deviceId(token));
    expect(device).toMatchObject({ failedPins: 0, userAgent: 'Test Browser' });
    expect(device!.expiresAt.getTime() - device!.createdAt.getTime()).toBe(1296000 * 1000);
    expect(device!.lastActiveAt).toEqual(device!.createdAt);
  });

  it('accepts the allowed email in another case', async () => {
    const { app, devices } = setup({ email: 'Owner@Example.com', emailVerified: true });
    await callback(app, 'state=abc&code=good-code').expect(302).expect('Location', '/');
    expect(devices.devices.size).toBe(1);
  });

  it.each([
    ['another account', { email: 'someone@example.com', emailVerified: true }],
    ['an unverified email', { email: 'owner@example.com', emailVerified: false }],
  ])('refuses %s and stores nothing', async (_name, account) => {
    const { app, devices } = setup(account);
    const res = await callback(app, 'state=abc&code=good-code').expect(302);
    expect(res.headers.location).toBe('/sign-in?error=denied');
    expect(setCookie(res, '__Host-session')).toBeUndefined();
    expect(devices.devices.size).toBe(0);
  });

  it.each([
    ['a state that differs from the cookie', 'state=xyz&code=good-code', '__Host-oauth-state=abc'],
    ['no state cookie', 'state=abc&code=good-code', ''],
    ['no state in the query', 'code=good-code', '__Host-oauth-state=abc'],
    ['no code (cancelled on Google)', 'state=abc&error=access_denied', '__Host-oauth-state=abc'],
  ])('fails with %s, without asking Google', async (_name, query, cookie) => {
    const { app, devices, google } = setup();
    const res = await callback(app, query, cookie).expect(302);
    expect(res.headers.location).toBe('/sign-in?error=failed');
    expect(google.account).not.toHaveBeenCalled();
    expect(devices.devices.size).toBe(0);
  });

  it('fails when Google rejects the code', async () => {
    const { app, devices } = setup();
    const res = await callback(app, 'state=abc&code=bad-code').expect(302);
    expect(res.headers.location).toBe('/sign-in?error=failed');
    expect(devices.devices.size).toBe(0);
  });

  it('keeps other devices signed in', async () => {
    const { app, devices } = setup();
    const first = devices.signIn();
    await callback(app, 'state=abc&code=good-code').expect(302);
    expect(devices.devices.size).toBe(2);
    await request(app).get('/api/unknown').set('Cookie', first).expect(404);
  });
});
