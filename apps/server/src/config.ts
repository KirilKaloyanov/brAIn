// Reads and validates environment variables at startup (architecture §7).
// Later tasks add their variables here.

const NODE_ENVS = ['development', 'test', 'production'] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];

export interface Config {
  nodeEnv: NodeEnv;
  port: number;
  /** App origin, e.g. `https://brain.example.com`, without a trailing slash. */
  publicUrl: string;
  /** Google Cloud project that holds the Firestore database. */
  googleCloudProject: string;
  /** `host:port` of the Firestore emulator; development and tests only. */
  firestoreEmulatorHost: string | undefined;
}

export class ConfigError extends Error {
  override name = 'ConfigError';
}

/** Throws a `ConfigError` listing every missing or invalid variable. */
export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const problems: string[] = [];

  const nodeEnv = NODE_ENVS.find((value) => value === env.NODE_ENV);
  if (nodeEnv === undefined) {
    problems.push(`NODE_ENV must be one of ${NODE_ENVS.join(', ')}, got "${env.NODE_ENV ?? ''}"`);
  }

  // Digits only: Number() alone would accept "", " 80" or "1e3".
  const portNumber = Number(env.PORT);
  const port =
    /^\d+$/.test(env.PORT ?? '') && portNumber >= 1 && portNumber <= 65535 ? portNumber : undefined;
  if (port === undefined) {
    problems.push(`PORT must be an integer from 1 to 65535, got "${env.PORT ?? ''}"`);
  }

  // Only an origin: a path, query or hash would break the OAuth redirect URL and Origin check.
  const url = URL.parse(env.PUBLIC_URL ?? '');
  const publicUrl =
    url &&
    (url.protocol === 'http:' || url.protocol === 'https:') &&
    url.pathname === '/' &&
    !url.search &&
    !url.hash
      ? url.origin
      : undefined;
  if (publicUrl === undefined) {
    problems.push(
      `PUBLIC_URL must be an http(s) origin like https://example.com, got "${env.PUBLIC_URL ?? ''}"`,
    );
  }

  // Google's format: 6–30 lowercase letters, digits or hyphens, starting with a letter.
  const googleCloudProject = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(env.GOOGLE_CLOUD_PROJECT ?? '')
    ? env.GOOGLE_CLOUD_PROJECT
    : undefined;
  if (googleCloudProject === undefined) {
    problems.push(
      `GOOGLE_CLOUD_PROJECT must be a Google Cloud project ID, got "${env.GOOGLE_CLOUD_PROJECT ?? ''}"`,
    );
  }

  // Empty counts as unset. In production the data would go to the emulator instead of Firestore.
  const firestoreEmulatorHost = env.FIRESTORE_EMULATOR_HOST || undefined;
  if (firestoreEmulatorHost !== undefined && !/^[\w.-]+:\d+$/.test(firestoreEmulatorHost)) {
    problems.push(`FIRESTORE_EMULATOR_HOST must be host:port, got "${firestoreEmulatorHost}"`);
  } else if (firestoreEmulatorHost !== undefined && nodeEnv === 'production') {
    problems.push('FIRESTORE_EMULATOR_HOST must not be set in production');
  }

  // The undefined checks let TypeScript see that every value is defined below.
  if (
    problems.length > 0 ||
    nodeEnv === undefined ||
    port === undefined ||
    publicUrl === undefined ||
    googleCloudProject === undefined
  ) {
    throw new ConfigError(`Invalid configuration:\n${problems.map((p) => `- ${p}`).join('\n')}`);
  }
  return { nodeEnv, port, publicUrl, googleCloudProject, firestoreEmulatorHost };
}
