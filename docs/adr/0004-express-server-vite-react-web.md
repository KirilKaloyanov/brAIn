# 0004. Express server, Vite + React web app

- Status: Accepted
- Date: 2026-10-31

## Context

The server needs a small set of routes, cookie sessions, a request guard, static file hosting
and long-lived Server-Sent Events responses. The web app is a single-page app with a handful of
screens (sign-in, PIN, chat list, chat) that fetch and stream data from that API. React was chosen
earlier (2026-10-24); the tools around it were not.

## Decision

- **Server:** Express 5.
- **Web:** React, built with Vite, with React Router for screens and TanStack Query for server
  data.
- Dependencies are added by the first task that needs them, not up front.

## Consequences

- Express is widely known (by people and agents), has middleware for everything we need, and
  Express 5 handles rejected promises from async handlers.
- Writing SSE on a plain Node response is straightforward in Express.
- Express is slower than Fastify or Hono, which does not matter for one user.
- Vite gives fast local reloads and proxies `/api` and `/auth` to the server in development.
- TanStack Query handles caching, refetching and invalidation of chats, so the app needs no
  separate global state library.
- No server-side rendering; the app is behind sign-in, so SEO does not matter.
