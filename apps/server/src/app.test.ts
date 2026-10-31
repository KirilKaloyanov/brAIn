import express from 'express';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp, errorHandler } from './app.js';
import type { Config } from './config.js';

const config: Config = { nodeEnv: 'test', port: 8080, publicUrl: 'http://localhost:8080' };

describe('createApp', () => {
  it('answers GET /healthz with 200 and status ok', async () => {
    const res = await request(createApp(config)).get('/healthz').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('serves no web app without webDir', async () => {
    await request(createApp(config)).get('/').expect(404);
  });
});

describe('createApp with webDir', () => {
  let webDir: string;
  let app: express.Express;

  beforeAll(() => {
    webDir = mkdtempSync(join(tmpdir(), 'brain-web-'));
    mkdirSync(join(webDir, 'assets'));
    writeFileSync(join(webDir, 'index.html'), '<!doctype html><title>brAIn</title>');
    writeFileSync(join(webDir, 'assets', 'app.js'), 'console.log(1);');
    app = createApp(config, { webDir });
  });

  afterAll(() => {
    rmSync(webDir, { recursive: true, force: true });
  });

  it('serves static files', async () => {
    const res = await request(app).get('/assets/app.js').expect(200);
    expect(res.type).toBe('text/javascript');
    expect(res.text).toBe('console.log(1);');
  });

  it.each(['/', '/sign-in', '/c/abc123'])('returns index.html for GET %s', async (path) => {
    const res = await request(app).get(path).expect(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain('<title>brAIn</title>');
  });

  it.each(['/api/unknown', '/auth/unknown'])('keeps 404 for GET %s', async (path) => {
    await request(app).get(path).expect(404);
  });

  it('still answers /healthz', async () => {
    await request(app).get('/healthz').expect(200, { status: 'ok' });
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
