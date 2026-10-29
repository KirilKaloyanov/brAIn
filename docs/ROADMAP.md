# Roadmap

Hand-off file between sessions. Keep it current.

## Next step

Phase 2: Pre-commit hooks (husky + lint-staged).

## Open decisions

None.

## Decisions

- 2026-10-24: `AGENTS.md` is the single source of agent instructions; `CLAUDE.md`/`GEMINI.md` point to it.
- 2026-10-24: Default branch is `main`; work happens on per-task branches.
- 2026-10-24: App type is full-stack.
- 2026-10-24: Language is TypeScript.
- 2026-10-24: No fixed work split between Claude and Gemini.
- 2026-10-24: Code is hosted on GitHub; tasks are tracked in GitHub Issues.
- 2026-10-24: Backend runs on Google Cloud Run.
- 2026-10-24: Frontend is React, served by the Cloud Run backend (single container, same origin). Revisit a CDN (e.g. Firebase Hosting) if needed later.
- 2026-10-24: Text files use LF line endings, in the repo and on disk, on every OS. Enforced by `.gitattributes` (`* text=auto eol=lf`).
- 2026-10-24: Monorepo with npm workspaces: `apps/web` (React), `apps/server` (backend), `packages/*` for shared code.
- 2026-10-24: Package manager is npm.
- 2026-10-24: Target Node 24 LTS (`.nvmrc`, `engines` in `package.json`).
- 2026-10-25: Workspace packages use the `@brain/` scope (`@brain/web`, `@brain/server`).
- 2026-10-25: `CHANGELOG.md` follows Keep a Changelog 1.1.0 and SemVer; only user-facing changes get entries. Foundation work so far is internal, so `[Unreleased]` starts empty.
- 2026-10-25: TypeScript 6.x (root devDependency). Shared strict options in `tsconfig.base.json`; each app extends it. Server uses `NodeNext` and compiles with `tsc` to `apps/server/dist` (run as `node dist/index.js`). Web uses `Bundler` resolution with `noEmit`, ready for Vite. `npm run typecheck` at the root checks every workspace.
- 2026-10-29: ESLint 10 with one root flat config (`eslint.config.js`): `@eslint/js` recommended + `typescript-eslint` recommended type-checked rules (`projectService` picks each file's nearest tsconfig). React lint plugins wait until React is added. `npm run lint` at the root.
- 2026-10-29: Prettier 3 formats every file (`.prettierrc.json`: single quotes, semicolons, trailing commas, print width 100). `eslint-config-prettier` turns off ESLint rules that clash with it. `npm run format` / `npm run format:check`.
- 2026-10-29: `@types/node` is also a root devDependency, for root-level config files like `eslint.config.js`.
- 2026-10-29: Vitest 5 runs tests from one root `vitest.config.js` with one project per workspace (`server` uses the Node environment). Tests sit next to code as `*.test.ts`; they are typechecked and linted, but `apps/server` builds with `tsconfig.build.json`, which leaves them out of `dist`. `apps/web` joins with jsdom + Testing Library when React is added. `npm test` (single run) / `npm run test:watch`.
- 2026-10-29: Root `npm run build` runs `build` in every workspace that has one (same pattern as `typecheck`). Agent-facing commands are listed under **Commands** in `AGENTS.md`.

## Phase 1 — Foundation

- [x] `package.json`, `.gitignore`, `.env.example`
- [x] Scaffold `apps/web` and `apps/server` workspaces (empty packages, no dependencies yet)
- [x] `CHANGELOG.md` (Keep a Changelog format) + rule in `AGENTS.md` to update it with every user-facing change
- [x] TypeScript config
- [x] ESLint + Prettier
- [x] Test runner (Vitest) with one passing test
- [x] Add install/test/lint/build commands to `AGENTS.md`

## Phase 2 — Guardrails

- [ ] Pre-commit hooks (husky + lint-staged)
- [ ] CI workflow: lint, typecheck, test, build on every PR
- [ ] PR template
- [ ] Branch protection on `main`
- [ ] Agent permission allowlists (`.claude/settings.json`, `.gemini/settings.json`)
- [ ] Dependency auditing (Dependabot or `npm audit` in CI)

## Phase 3 — Spec

- [ ] `docs/PRD.md` — what the app does and for whom
- [ ] `docs/architecture.md` — modules, data flow
- [ ] `docs/adr/` — first ADR(s) for stack choices
- [ ] Break PRD into small tasks with acceptance criteria, in the chosen task tracker
- [ ] Move the **Decisions** log into `docs/adr/`; keep this roadmap to phases and **Next step**

## Phase 4 — Build

- [ ] Implement tasks one per branch/PR, with tests
- [ ] Cross-review: one agent implements, the other reviews
