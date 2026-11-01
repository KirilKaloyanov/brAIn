import { describe, expect, it } from 'vitest';
import { createFirestore } from './store.js';

// Set by `npm run test:emulator`. Plain `npm test` skips these tests, except in CI, where they
// must run (architecture §8).
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || undefined;

describe.skipIf(emulatorHost === undefined && !process.env.CI)('createFirestore', () => {
  it('writes and reads a document in the emulator', async () => {
    expect(emulatorHost, 'FIRESTORE_EMULATOR_HOST must be set in CI').toBeDefined();
    const db = createFirestore({
      googleCloudProject: 'demo-brain',
      firestoreEmulatorHost: emulatorHost,
    });
    try {
      const ref = db.collection('storeTest').doc();
      await ref.set({ text: 'hello' });
      expect((await ref.get()).data()).toEqual({ text: 'hello' });
    } finally {
      await db.terminate();
    }
  });
});
