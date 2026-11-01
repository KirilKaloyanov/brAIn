import express from 'express';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp, errorHandler } from './app.js';
import type { Config } from './config.js';
import { fakeGoogle, MemoryDeviceStore, testConfig as config } from './testing.js';

function deps() {
  return {
    devices: new MemoryDeviceStore(),
    google: fakeGoogle({ email: 'owner@example.com', emailVerified: true }),
  };
}

describe('createApp', () => {
  it('answers GET /api/health with 200 and status ok', async () => {
    const res = await request(createApp(config, deps())).get('/api/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('serves no web app without webDir', async () => {
    await request(createApp(config, deps())).get('/').expect(404);
  });

  it('answers an API call from a signed-out device with 401', async () => {
    await request(createApp(config, deps())).get('/api/unknown').expect(401);
  });

  it('rejects a POST from another origin', async () => {
    await request(createApp(config, deps()))
      .post('/api/unknown')
      .set('Origin', 'https://evil.example')
      .expect(403, { code: 'bad-origin' });
  });
});

describe('createApp with webDir', () => {
  let webDir: string;
  let app: express.Express;
  let session: string;

  beforeAll(() => {
    webDir = mkdtempSync(join(tmpdir(), 'brain-web-'));
    mkdirSync(join(webDir, 'assets'));
    writeFileSync(join(webDir, 'index.html'), '<!doctype html><title>brAIn</title>');
    writeFileSync(join(webDir, 'assets', 'app.js'), 'console.log(1);');
    const appDeps = deps();
    session = appDeps.devices.signIn();
    app = createApp(config, appDeps, { webDir });
  });

  afterAll(() => {
    rmSync(webDir, { recursive: true, force: true });
  });

  it('serves static files without a session', async () => {
    const res = await request(app).get('/assets/app.js').expect(200);
    expect(res.type).toBe('text/javascript');
    expect(res.text).toBe('console.log(1);');
  });

  it('returns index.html for GET /sign-in without a session', async () => {
    const res = await request(app).get('/sign-in').expect(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain('<title>brAIn</title>');
  });

  it.each(['/', '/c/abc123'])('returns index.html for GET %s when signed in', async (path) => {
    const res = await request(app).get(path).set('Cookie', session).expect(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain('<title>brAIn</title>');
  });

  it.each(['/', '/c/abc123'])('redirects GET %s to /sign-in when signed out', async (path) => {
    await request(app).get(path).expect(302).expect('Location', '/sign-in');
  });

  it.each(['/api/unknown', '/auth/unknown'])('keeps 404 for GET %s', async (path) => {
    await request(app).get(path).set('Cookie', session).expect(404);
  });

  it('keeps 404 for GET /auth/unknown when signed out', async () => {
    await request(app).get('/auth/unknown').expect(404);
  });

  it('still answers /api/health without a session', async () => {
    await request(app).get('/api/health').expect(200, { status: 'ok' });
  });
});

describe('errorHandler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function failingApp(nodeEnv: Config['nodeEnv']) {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = express();
    app.get('/boom', () => {
      throw new Error('secret detail');
    });
    app.use(errorHandler({ ...config, nodeEnv }));
    return app;
  }

  it('returns 500 with code internal and no details in production', async () => {
    const res = await request(failingApp('production')).get('/boom').expect(500);
    expect(res.body).toEqual({ code: 'internal', message: 'Internal server error' });
  });

  it('includes the message and stack outside production', async () => {
    const res = await request(failingApp('development')).get('/boom').expect(500);
    expect(res.body).toMatchObject({ code: 'internal', message: 'secret detail' });
    expect(res.body).toHaveProperty('stack');
  });
});
