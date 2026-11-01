# 0018. The Firestore emulator in tests and CI

- Status: Accepted
- Date: 2026-11-01

## Context

The server stores its data in Firestore (ADR-0005), and tests must never touch the real database.
An in-memory fake is fast but only behaves like Firestore as far as the fake gets right
(queries, ordering, transactions, `recursiveDelete`). The official emulator behaves like the real
database, but it is a Java program started by the Firebase CLI.

## Decision

- The server uses `@google-cloud/firestore`, the server-only client, not `firebase-admin`.
- Local development and tests use the Firestore emulator with the demo project `demo-brain` on
  port 8081 (`firebase.json`; 8080 is the app's port).
- `npm run test:emulator` runs the whole test suite inside `firebase emulators:exec`. CI runs it
  instead of `npm test`, after installing Java 21 (Temurin) and a pinned Firebase CLI; the
  downloaded emulator is cached between runs.
- Tests that need the emulator skip under plain `npm test`, except when `CI` is set, where they
  fail instead.
- The Firebase CLI is installed globally (`npm install -g firebase-tools`), not as a
  devDependency.

## Consequences

- Repository tests check real Firestore behaviour, and CI cannot pass by skipping them.
- CI takes longer: a Java setup, a global CLI install and an emulator start.
- `npm install`, the Docker build and the lockfile stay free of the Firebase CLI's large
  dependency tree. In exchange its version is pinned only in `.github/workflows/ci.yml`, is not
  updated by Dependabot, and may differ from the one installed locally.
- Running every test locally needs Java and the Firebase CLI (`docs/development.md`); without them,
  `npm test` still runs everything else.
- A `demo-` project ID can't reach real Google Cloud resources, so a misconfigured test cannot
  write to production.
