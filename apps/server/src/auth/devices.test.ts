import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createFirestore } from '../store.js';
import { createFirestoreDeviceStore, deviceId, newSessionToken } from './devices.js';

describe('newSessionToken', () => {
  it('returns 256 random bits, base64url-encoded', () => {
    const token = newSessionToken();
    expect(token).toMatch(/^[\w-]{43}$/);
    expect(Buffer.from(token, 'base64url')).toHaveLength(32);
    expect(newSessionToken()).not.toBe(token);
  });
});

describe('deviceId', () => {
  it('is the hex SHA-256 of the token', () => {
    expect(deviceId('abc')).toBe(createHash('sha256').update('abc').digest('hex'));
  });
});

// Same rule as store.test.ts: skipped under plain `npm test`, required in CI.
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || undefined;

describe.skipIf(emulatorHost === undefined && !process.env.CI)('createFirestoreDeviceStore', () => {
  it('stores a device and reads it back with Dates', async () => {
    expect(emulatorHost, 'FIRESTORE_EMULATOR_HOST must be set in CI').toBeDefined();
    const db = createFirestore({
      googleCloudProject: 'demo-brain',
      firestoreEmulatorHost: emulatorHost,
    });
    try {
      const devices = createFirestoreDeviceStore(db);
      const id = deviceId(newSessionToken());
      const device = {
        createdAt: new Date('2026-11-01T10:00:00Z'),
        expiresAt: new Date('2026-11-16T10:00:00Z'),
        lastActiveAt: new Date('2026-11-01T10:00:00Z'),
        failedPins: 0,
        userAgent: 'Test Browser',
      };
      await devices.create(id, device);
      expect(await devices.get(id)).toEqual(device);
      expect(await devices.get(deviceId('unknown'))).toBeUndefined();
      await expect(devices.create(id, device)).rejects.toThrow();
    } finally {
      await db.terminate();
    }
  });
});
