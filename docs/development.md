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

## Firestore emulator

- `npm run emulator` starts it on port 8081 (set in `firebase.json`) and leaves it running; start
  it before `npm run dev`. The Emulator UI it prints (port 4000) shows the stored documents. Data
  is lost when it stops.
- `npm run test:emulator` starts the emulator, runs `npm test` against it and stops it. This is
  what CI runs. Plain `npm test` skips the tests that need the emulator.

The first start downloads the emulator to `~/.cache/firebase/emulators`.
