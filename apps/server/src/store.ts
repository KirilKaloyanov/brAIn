// Creates the Firestore client (architecture §2.1): the emulator in development and tests, the real
// database on Cloud Run, reached with the service account's default credentials.
import { Firestore } from '@google-cloud/firestore';
import type { Config } from './config.js';

export function createFirestore(
  config: Pick<Config, 'googleCloudProject' | 'firestoreEmulatorHost'>,
): Firestore {
  // The client also reads FIRESTORE_EMULATOR_HOST itself; passing it keeps the config the source.
  // Without SSL the client sends the emulator's admin token, so no credentials are needed.
  const emulator =
    config.firestoreEmulatorHost === undefined
      ? {}
      : { host: config.firestoreEmulatorHost, ssl: false };
  return new Firestore({ projectId: config.googleCloudProject, ...emulator });
}
