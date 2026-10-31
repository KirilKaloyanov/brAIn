# 0008. Stream answers as Server-Sent Events on a POST

- Status: Accepted
- Date: 2026-10-31

## Context

Gemini answers arrive in chunks, and the app should show them as they come (PRD). The user may
switch chats, lock the app or close the tab while an answer is still coming, and should find the
full answer when they return. The server runs on Cloud Run (ADR-0003).

## Decision

- Sending a message is a `POST` whose response is a `text/event-stream`. The server writes
  events (`chat`, `delta`, `sources`, `done`, `title`, `error`) as the answer arrives.
- The server finishes reading the Gemini stream and saves the answer even if the browser
  disconnects.
- Cloud Run stays on request-based billing (CPU only during requests).

## Consequences

- One request both sends the message and receives the answer, so there is no message ID to
  correlate and no second connection to open.
- SSE is plain HTTP: no WebSocket server, and it passes through Cloud Run as is. The browser's
  `EventSource` only does `GET`, so the web app reads the stream with `fetch`.
- On request-based billing, an instance may be throttled once the browser disconnects, which can
  stall the rest of an answer. Accepted for one user: such an answer shows as a failed answer with
  a retry. If this happens often, switch the service to instance-based billing; no code changes.
- The title call (ADR-0010) runs at the end of the same request, so the same risk applies to it
  when the browser leaves early. The chat then keeps the first-message title, which is fine.
- Details: `docs/architecture.md` §5 and §9.
