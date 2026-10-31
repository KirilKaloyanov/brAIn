# Architecture Decision Records

One file per significant decision: what was decided, why, and what follows from it. How the app
is built today is in `docs/architecture.md`; ADRs record the reasons behind it.

## Writing an ADR

- Copy `template.md` to `NNNN-short-title.md`, using the next free number.
- Keep it short. Status is `Proposed`, `Accepted`, or `Superseded by ADR-NNNN`.
- An accepted ADR is not rewritten. To change a decision, add a new ADR and mark the old one
  superseded.
- Add a line to the index below in the same change.

## Index

| ADR                                                | Title                                    | Status   |
| -------------------------------------------------- | ---------------------------------------- | -------- |
| [0001](0001-record-architecture-decisions.md)      | Record architecture decisions            | Accepted |
| [0002](0002-typescript-npm-workspaces-monorepo.md) | TypeScript in an npm workspaces monorepo | Accepted |
| [0003](0003-single-container-on-cloud-run.md)      | One container on Google Cloud Run        | Accepted |
| [0004](0004-express-server-vite-react-web.md)      | Express server, Vite + React web app     | Accepted |
| [0005](0005-firestore-for-storage.md)              | Firestore for storage                    | Accepted |
| [0006](0006-gemini-via-google-genai-sdk.md)        | Gemini through the `@google/genai` SDK   | Accepted |
