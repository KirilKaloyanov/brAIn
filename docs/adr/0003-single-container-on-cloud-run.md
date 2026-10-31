# 0003. One container on Google Cloud Run

- Status: Accepted
- Date: 2026-10-24

## Context

The app has one user, so traffic is low and comes in bursts. It needs to call Gemini and
Firestore, both Google Cloud services, and keep the API key and OAuth secret off the browser.
Hosting should cost close to nothing when idle and need no server upkeep.

## Decision

Run the app as a single container on Google Cloud Run. The Node server serves both the JSON/SSE
API and the built React app, on the same origin. Minimum instances is 0.

## Consequences

- No CORS setup, and the session cookie stays first-party.
- One thing to build, deploy and roll back.
- Scale to zero keeps cost near nothing; the first request after idle pays a cold start, which the
  PRD's performance target allows.
- Secrets come from Secret Manager and Firestore is reached with the service account's default
  credentials, with no keys in the image.
- The server must be stateless between requests, since any instance may answer.
- Static files are served by Node, not a CDN. Revisit (e.g. Firebase Hosting) if load times need
  it.
- By default Cloud Run throttles CPU outside requests, which can stall an answer after the browser
  disconnects; see `docs/architecture.md` §9.
