import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from './config.js';

const valid = {
  NODE_ENV: 'production',
  PORT: '8080',
  PUBLIC_URL: 'https://brain.example.com',
};

describe('loadConfig', () => {
  it('reads valid variables', () => {
    expect(loadConfig(valid)).toEqual({
      nodeEnv: 'production',
      port: 8080,
      publicUrl: 'https://brain.example.com',
    });
  });

  it('drops a trailing slash from PUBLIC_URL', () => {
    expect(loadConfig({ ...valid, PUBLIC_URL: 'http://localhost:5173/' }).publicUrl).toBe(
      'http://localhost:5173',
    );
  });

  it.each([
    ['NODE_ENV', undefined, 'NODE_ENV must be one of development, test, production, got ""'],
    ['NODE_ENV', 'staging', 'got "staging"'],
    ['PORT', undefined, 'PORT must be an integer from 1 to 65535, got ""'],
    ['PORT', '', 'PORT must be an integer from 1 to 65535, got ""'],
    ['PORT', 'abc', 'got "abc"'],
    ['PORT', '0', 'got "0"'],
    ['PORT', '65536', 'got "65536"'],
    ['PORT', '80.5', 'got "80.5"'],
    [
      'PUBLIC_URL',
      undefined,
      'PUBLIC_URL must be an http(s) origin like https://example.com, got ""',
    ],
    ['PUBLIC_URL', 'not a url', 'got "not a url"'],
    ['PUBLIC_URL', 'ftp://example.com', 'got "ftp://example.com"'],
    ['PUBLIC_URL', 'https://example.com/app', 'got "https://example.com/app"'],
  ])('rejects %s=%s', (name, value, message) => {
    expect(() => loadConfig({ ...valid, [name]: value })).toThrow(ConfigError);
    expect(() => loadConfig({ ...valid, [name]: value })).toThrow(message);
  });

  it('lists every problem at once', () => {
    expect(() => loadConfig({})).toThrow(/NODE_ENV must[\s\S]*PORT must[\s\S]*PUBLIC_URL must/);
  });
});
