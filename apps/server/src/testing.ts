// Shared test helpers and in-memory fakes; excluded from the build.
import { vi } from 'vitest';
import { deviceId, newSessionToken, type Device, type DeviceStore } from './auth/devices.js';
import type { GoogleAccount, GoogleSignIn } from './auth/google.js';
import type { Config } from './config.js';

export const testConfig: Config = {
  nodeEnv: 'test',
  port: 8080,
  publicUrl: 'http://localhost:8080',
  googleCloudProject: 'demo-brain',
  firestoreEmulatorHost: undefined,
  allowedEmail: 'owner@example.com',
  googleClientId: 'test.apps.googleusercontent.com',
  googleClientSecret: 'test-secret',
};

export class MemoryDeviceStore implements DeviceStore {
  readonly devices = new Map<string, Device>();

  create(id: string, device: Device): Promise<void> {
    if (this.devices.has(id)) return Promise.reject(new Error(`Device ${id} exists`));
    this.devices.set(id, device);
    return Promise.resolve();
  }

  get(id: string): Promise<Device | undefined> {
    return Promise.resolve(this.devices.get(id));
  }

  /** Stores a device and returns its session cookie header. */
  signIn(device: Partial<Device> = {}): string {
    const token = newSessionToken();
    const now = new Date();
    this.devices.set(deviceId(token), {
      createdAt: now,
      expiresAt: new Date(now.getTime() + 60_000),
      lastActiveAt: now,
      failedPins: 0,
      userAgent: 'test',
      ...device,
    });
    return `__Host-session=${token}`;
  }
}

/** Google sign-in that returns `result` for the code `good-code` and fails for any other. */
export function fakeGoogle(result: GoogleAccount | Error) {
  return {
    authUrl: vi.fn((state: string) => `https://accounts.example/auth?state=${state}`),
    account: vi.fn((code: string) =>
      code === 'good-code' && !(result instanceof Error)
        ? Promise.resolve(result)
        : Promise.reject(result instanceof Error ? result : new Error('bad code')),
    ),
  } satisfies GoogleSignIn;
}
