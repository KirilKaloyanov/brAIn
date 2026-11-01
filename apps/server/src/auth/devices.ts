// Signed-in devices (architecture §3): `devices/{sha256(sessionToken)}` in Firestore. Only the hash
// is stored, so reading the database doesn't give anyone a working session cookie.
import type { Firestore, FirestoreDataConverter, Timestamp } from '@google-cloud/firestore';
import { createHash, randomBytes } from 'node:crypto';

export interface Device {
  createdAt: Date;
  /** `createdAt` + 15 days (FR-3); from then on the device counts as signed out. */
  expiresAt: Date;
  /** For the 30-minute lock (FR-3a). */
  lastActiveAt: Date;
  /** Wrong PINs in a row (FR-3a). */
  failedPins: number;
  /** To tell devices apart. */
  userAgent: string;
}

export interface DeviceStore {
  create(id: string, device: Device): Promise<void>;
  get(id: string): Promise<Device | undefined>;
}

/** A random 256-bit session token for the cookie. */
export function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/** The ID of the device a session token belongs to. */
export function deviceId(sessionToken: string): string {
  return createHash('sha256').update(sessionToken).digest('hex');
}

type StoredDevice = Omit<Device, 'createdAt' | 'expiresAt' | 'lastActiveAt'> & {
  createdAt: Timestamp;
  expiresAt: Timestamp;
  lastActiveAt: Timestamp;
};

// Firestore stores a Date as a Timestamp; this turns them back into Dates on read.
const converter: FirestoreDataConverter<Device> = {
  toFirestore: (device) => device,
  fromFirestore: (snapshot) => {
    const data = snapshot.data() as StoredDevice;
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      expiresAt: data.expiresAt.toDate(),
      lastActiveAt: data.lastActiveAt.toDate(),
    };
  },
};

export function createFirestoreDeviceStore(db: Firestore): DeviceStore {
  const devices = db.collection('devices').withConverter(converter);
  return {
    async create(id, device) {
      await devices.doc(id).create(device);
    },
    async get(id) {
      return (await devices.doc(id).get()).data();
    },
  };
}
