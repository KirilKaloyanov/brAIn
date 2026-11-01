import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from './config.js';

const valid = {
  NODE_ENV: 'production',
  PORT: '8080',
  PUBLIC_URL: 'https://brain.example.com',
  GOOGLE_CLOUD_PROJECT: 'brain-kk',
};

describe('loadConfig', () => {
  it('reads valid variables', () => {
    expect(loadConfig(valid)).toEqual({
      nodeEnv: 'production',
      port: 8080,
      publicUrl: 'https://brain.example.com',
      googleCloudProject: 'brain-kk',
      firestoreEmulatorHost: undefined,
    });
  });

  it('reads FIRESTORE_EMULATOR_HOST outside production', () => {
    const env = { ...valid, NODE_ENV: 'development', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8081' };
    expect(loadConfig(env).firestoreEmulatorHost).toBe('127.0.0.1:8081');
  });

  it('treats an empty FIRESTORE_EMULATOR_HOST as unset', () => {
    expect(loadConfig({ ...valid, FIRESTORE_EMULATOR_HOST: '' }).firestoreEmulatorHost).toBe(
      undefined,
    );
  });

  it('rejects FIRESTORE_EMULATOR_HOST in production', () => {
    expect(() => loadConfig({ ...valid, FIRESTORE_EMULATOR_HOST: 'localhost:8081' })).toThrow(
      'FIRESTORE_EMULATOR_HOST must not be set in production',
    );
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
    [
      'GOOGLE_CLOUD_PROJECT',
      undefined,
      'GOOGLE_CLOUD_PROJECT must be a Google Cloud project ID, got ""',
    ],
    ['GOOGLE_CLOUD_PROJECT', 'Brain-KK', 'got "Brain-KK"'],
    ['GOOGLE_CLOUD_PROJECT', 'brain', 'got "brain"'],
    ['GOOGLE_CLOUD_PROJECT', 'brain-', 'got "brain-"'],
    ['FIRESTORE_EMULATOR_HOST', 'http://localhost:8081', 'must be host:port'],
    ['FIRESTORE_EMULATOR_HOST', 'localhost', 'got "localhost"'],
  ])('rejects %s=%s', (name, value, message) => {
    expect(() => loadConfig({ ...valid, [name]: value })).toThrow(ConfigError);
    expect(() => loadConfig({ ...valid, [name]: value })).toThrow(message);
  });

  it('lists every problem at once', () => {
    expect(() => loadConfig({})).toThrow(
      /NODE_ENV must[\s\S]*PORT must[\s\S]*PUBLIC_URL must[\s\S]*GOOGLE_CLOUD_PROJECT must/,
    );
  });
});
