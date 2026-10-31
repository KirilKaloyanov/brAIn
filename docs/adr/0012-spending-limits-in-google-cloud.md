# 0012. Spending limits in Google Cloud, not in the app

- Status: Accepted
- Date: 2026-10-31

## Context

The app pays for Gemini calls with the owner's API key. A bug, a loop or a leaked key could run
up a bill (PRD §6 Cost). The limit could be built into the app or set on the Google Cloud side
(was OD-5).

## Decision

No in-app spending cap. In the Google Cloud console:

- a monthly budget on the billing account with email alerts, which only warns;
- lowered requests-per-minute and requests-per-day quotas on the Gemini API for the project,
  which is the hard stop.

Quota errors show as ordinary chat errors (FR-7).

## Consequences

- No code, storage or extra Firestore reads for a counter.
- The quota also holds if the API key leaks and is used outside the app, which an in-app cap
  could not stop.
- The limits live in the console, not the repo. Their values are recorded in
  `docs/architecture.md` §8 once set.
- The quota counts requests, not tokens or money, so it is a coarse limit.
- An in-app daily counter can be added later if a clearer limit is wanted.
