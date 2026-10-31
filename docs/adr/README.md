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

| ADR                                                        | Title                                                    | Status   |
| ---------------------------------------------------------- | -------------------------------------------------------- | -------- |
| [0001](0001-record-architecture-decisions.md)              | Record architecture decisions                            | Accepted |
| [0002](0002-typescript-npm-workspaces-monorepo.md)         | TypeScript in an npm workspaces monorepo                 | Accepted |
| [0003](0003-single-container-on-cloud-run.md)              | One container on Google Cloud Run                        | Accepted |
| [0004](0004-express-server-vite-react-web.md)              | Express server, Vite + React web app                     | Accepted |
| [0005](0005-firestore-for-storage.md)                      | Firestore for storage                                    | Accepted |
| [0006](0006-gemini-via-google-genai-sdk.md)                | Gemini through the `@google/genai` SDK                   | Accepted |
| [0007](0007-google-sign-in-device-sessions-pin-lock.md)    | Google sign-in with device sessions and a PIN lock       | Accepted |
| [0008](0008-stream-answers-as-sse-on-post.md)              | Stream answers as Server-Sent Events on a POST           | Accepted |
| [0009](0009-import-chats-from-gemini-markdown-export.md)   | Import chats from a Gemini Markdown export only          | Accepted |
| [0010](0010-chat-titles-from-first-message-then-gemini.md) | Chat titles: the first message, then a title from Gemini | Accepted |
| [0011](0011-web-search-per-message.md)                     | Web search is per message                                | Accepted |
| [0012](0012-spending-limits-in-google-cloud.md)            | Spending limits in Google Cloud, not in the app          | Accepted |
| [0013](0013-code-quality-tooling.md)                       | Code-quality tooling                                     | Accepted |
| [0014](0014-ci-and-protected-main.md)                      | CI and a protected `main`                                | Accepted |
| [0015](0015-agent-permission-allowlists.md)                | Agent permission allowlists                              | Accepted |
| [0016](0016-working-with-ai-agents.md)                     | Working with AI agents                                   | Accepted |
| [0017](0017-deploy-by-hand-with-cloud-build.md)            | Deploy by hand with Cloud Build                          | Accepted |
