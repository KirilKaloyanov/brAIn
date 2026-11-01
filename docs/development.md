# Development

Setting up a machine to run the app and its tests. Commands are listed in `AGENTS.md`; design in
`docs/architecture.md` §8.

## Tools

- **Node** from `.nvmrc`, then `npm install`.
- **Java 21 or newer**, for the Firestore emulator, e.g. Eclipse Temurin from
  <https://adoptium.net>. Check with `java -version`.
- **Firebase CLI**, which runs the emulator: `npm install -g firebase-tools`. It is installed
  globally, not as a project dependency (ADR-0018). No Firebase sign-in is needed, because the
  project ID `demo-brain` is an emulator-only demo project.

## Environment

Copy `.env.example` to `.env`. Its `GOOGLE_CLOUD_PROJECT=demo-brain` and
`FIRESTORE_EMULATOR_HOST=127.0.0.1:8081` point the server at the emulator.

Set `ALLOWED_EMAIL` to your Google account, and `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from
the OAuth client below. The server refuses to start without all three; the placeholders in
`.env.example` let it start, but sign-in then fails at Google.

## Google sign-in

Sign-in needs an OAuth client in the Google Cloud project (`brain-kk`, see `docs/deploy.md`). One
client serves development and production. In the Google Cloud console, ☰ → **APIs & Services** →
**Google Auth Platform** (<https://console.cloud.google.com/auth/overview>):

1. **Branding:** app name `brAIn`, your email as the support and developer contact.
2. **Audience:** user type **External** (the only choice without an organization), left in
   **Testing**. Add the `ALLOWED_EMAIL` account under **Test users**: Google then blocks every
   other account before it reaches the app. Testing mode's 7-day token expiry doesn't matter,
   because the app uses Google only at sign-in and keeps its own session.
3. **Clients** → **Create client** → **Web application**. Under **Authorized redirect URIs** add
   `http://localhost:5173/auth/google/callback` (Vite in development) and
   `https://brain-955911433585.europe-west1.run.app/auth/google/callback` (Cloud Run). No
   JavaScript origins are needed.
4. Copy the client ID and secret into `.env`. The secret goes into Secret Manager for production
   (`docs/deploy.md`).

A new client or a change to it can take from a few minutes to a few hours to take effect; until
then Google shows `invalid_client` or `redirect_uri_mismatch`.

Locally, run `npm run dev` and `npm run dev:web` and sign in at
<http://localhost:5173/auth/google>. `PUBLIC_URL` must be Vite's origin, as in `.env.example`:
Google redirects back to it, and the `Origin` check compares against it.

## Firestore emulator

- `npm run emulator` starts it on port 8081 (set in `firebase.json`) and leaves it running; start
  it before `npm run dev`. The Emulator UI it prints (port 4000) shows the stored documents. Data
  is lost when it stops.
- `npm run test:emulator` starts the emulator, runs `npm test` against it and stops it. This is
  what CI runs. Plain `npm test` skips the tests that need the emulator.

The first start downloads the emulator to `~/.cache/firebase/emulators`.
