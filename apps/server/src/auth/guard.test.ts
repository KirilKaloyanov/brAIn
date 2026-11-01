import cookieParser from 'cookie-parser';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { MemoryDeviceStore } from '../testing.js';
import { requireSameOrigin, requireSession } from './guard.js';

describe('requireSession', () => {
  function setup() {
    const devices = new MemoryDeviceStore();
    const app = express();
    app.use(cookieParser());
    app.get('/page', requireSession(devices, 'page'), (_req, res) => {
      res.send('page');
    });
    app.get('/api/thing', requireSession(devices, 'api'), (_req, res) => {
      res.json({ deviceId: res.locals.deviceId as string });
    });
    return { app, devices };
  }

  const signedOut: [string, (devices: MemoryDeviceStore) => string][] = [
    ['no cookie', () => ''],
    ['an empty cookie', () => '__Host-session='],
    ['an unknown device', () => '__Host-session=unknown'],
    ['an expired device', (devices) => devices.signIn({ expiresAt: new Date(Date.now() - 1) })],
  ];

  it.each(signedOut)('redirects a page load with %s to /sign-in', async (_name, cookie) => {
    const { app, devices } = setup();
    await request(app)
      .get('/page')
      .set('Cookie', cookie(devices))
      .expect(302)
      .expect('Location', '/sign-in');
  });

  it.each(signedOut)('answers an API call with %s with 401', async (_name, cookie) => {
    const { app, devices } = setup();
    await request(app)
      .get('/api/thing')
      .set('Cookie', cookie(devices))
      .expect(401, { code: 'signed-out' });
  });

  it('lets a signed-in device through', async () => {
    const { app, devices } = setup();
    const cookie = devices.signIn();
    await request(app).get('/page').set('Cookie', cookie).expect(200, 'page');
    const res = await request(app).get('/api/thing').set('Cookie', cookie).expect(200);
    expect(devices.devices.has((res.body as { deviceId: string }).deviceId)).toBe(true);
  });
});

describe('requireSameOrigin', () => {
  const app = express();
  app.use(requireSameOrigin('http://localhost:8080'));
  app.all('/thing', (_req, res) => {
    res.json({ ok: true });
  });

  it('lets GET through from anywhere', async () => {
    await request(app).get('/thing').set('Origin', 'https://evil.example').expect(200);
  });

  it.each([
    ['no Origin', undefined],
    ['another Origin', 'https://evil.example'],
  ])('rejects a POST with %s', async (_name, origin) => {
    const req = request(app).post('/thing').send({ a: 1 });
    if (origin !== undefined) req.set('Origin', origin);
    await req.expect(403, { code: 'bad-origin' });
  });

  it('rejects an empty form from the app origin', async () => {
    await request(app)
      .post('/thing')
      .set('Origin', 'http://localhost:8080')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect(415, { code: 'json-required' });
  });

  it('rejects a form body from the app origin', async () => {
    await request(app)
      .post('/thing')
      .set('Origin', 'http://localhost:8080')
      .type('form')
      .send('a=1')
      .expect(415, { code: 'json-required' });
  });

  it.each(['post', 'put', 'delete'] as const)(
    'lets a %s with a JSON body from the app origin through',
    async (method) => {
      await request(app)
        [method]('/thing')
        .set('Origin', 'http://localhost:8080')
        .send({ a: 1 })
        .expect(200);
    },
  );

  it('lets a POST without a body from the app origin through', async () => {
    await request(app).post('/thing').set('Origin', 'http://localhost:8080').expect(200);
  });
});
