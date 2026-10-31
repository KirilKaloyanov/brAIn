# 0002. TypeScript in an npm workspaces monorepo

- Status: Accepted
- Date: 2026-10-24

## Context

brAIn is a full-stack app: a React frontend and a Node backend that share API request and
response shapes. It is built by one person with AI agents, so one language, one toolchain and one
place to run checks keep the cost of each change low.

## Decision

- TypeScript everywhere, with strict options shared from `tsconfig.base.json`.
- One repo using npm workspaces: `apps/web` (`@brain/web`), `apps/server` (`@brain/server`) and
  `packages/*` for shared code, starting with `packages/shared` (`@brain/shared`) for API types.
- npm as the package manager, targeting Node 24 LTS (`.nvmrc`, `engines`).
- Root scripts (`build`, `typecheck`, `lint`, `test`, …) run across every workspace.

## Consequences

- Frontend and backend use the same types, so a change to an API body breaks the typecheck on
  both sides at once.
- One lockfile, one CI job and one set of lint/format rules.
- npm workspaces have no task graph or caching (unlike Turborepo or Nx); fine at this size.
- `packages/shared` must stay free of runtime dependencies, so the browser never pulls in server
  code.
