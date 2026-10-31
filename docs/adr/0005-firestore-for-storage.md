# 0005. Firestore for storage

- Status: Accepted
- Date: 2026-10-31

## Context

The app stores chats, their messages, signed-in device records and the PIN hash for one user.
Data volume is small. Cloud Run instances are stateless and scale to zero (ADR-0003), so storage
must live outside the container and should cost nothing when idle.

## Decision

Store all app data in Google Cloud Firestore. The server reaches it with the Cloud Run service
account's default credentials; local development uses the Firestore emulator.

## Consequences

- Serverless and billed per operation, with a free tier that covers a single user.
- No connection pool, migrations or database server to run.
- Chats and messages map naturally to documents and subcollections; see
  `docs/architecture.md` §3.
- Queries are limited compared with SQL (no joins, indexes must be declared), so the data model is
  shaped around the screens' reads.
- Firestore vector search can hold post-MVP memories in the same database.
- Tests use the emulator or an in-memory fake repository, never the real database.
