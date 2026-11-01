// Google OAuth for sign-in (architecture §4.1): the consent screen URL, then the code exchange and
// ID token check. Behind an interface so tests use a fake instead of calling Google.
import { OAuth2Client } from 'google-auth-library';
import type { Config } from '../config.js';

export const CALLBACK_PATH = '/auth/google/callback';

export interface GoogleAccount {
  email: string;
  emailVerified: boolean;
}

export interface GoogleSignIn {
  /** URL of Google's consent screen; Google sends `state` back to the callback. */
  authUrl(state: string): string;
  /** Exchanges the callback's code and returns the account from the verified ID token. */
  account(code: string): Promise<GoogleAccount>;
}

export function createGoogleSignIn(
  config: Pick<Config, 'publicUrl' | 'googleClientId' | 'googleClientSecret'>,
): GoogleSignIn {
  const client = new OAuth2Client({
    clientId: config.googleClientId,
    clientSecret: config.googleClientSecret,
    redirectUri: config.publicUrl + CALLBACK_PATH,
  });

  return {
    // select_account lets the owner pick another account after an "access denied".
    authUrl: (state) =>
      client.generateAuthUrl({ scope: ['openid', 'email'], state, prompt: 'select_account' }),

    async account(code) {
      const { tokens } = await client.getToken(code);
      if (!tokens.id_token) throw new Error('Google returned no ID token');
      // Checks the signature, issuer, expiry and that the token was issued to this client.
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.googleClientId,
      });
      const payload = ticket.getPayload();
      return { email: payload?.email ?? '', emailVerified: payload?.email_verified === true };
    },
  };
}
