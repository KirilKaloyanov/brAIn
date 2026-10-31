import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, errorHandler } from './app.js';
import type { Config } from './config.js';

const config: Config = { nodeEnv: 'test', port: 8080, publicUrl: 'http://localhost:8080' };

describe('createApp', () => {
  it('answers GET /healthz with 200 and status ok', async () => {
    const res = await request(createApp(config)).get('/healthz').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
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
