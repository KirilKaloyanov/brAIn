# Roadmap

Hand-off file between sessions. Keep it current.

## Next step

Phase 3: `docs/PRD.md` — what the app does and for whom.

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
- 2026-10-29: Pre-commit hook via husky 9 (`.husky/pre-commit`, installed by the `prepare` script on `npm install`) runs lint-staged 17 (config in `package.json`): JS/TS files get `eslint --fix` then `prettier --write`; all other files get `prettier --write --ignore-unknown`. Typecheck and tests are left to CI to keep commits fast.
- 2026-10-30: CI is one GitHub Actions workflow (`.github/workflows/ci.yml`) on every PR and on pushes to `main`: Node from `.nvmrc`, `npm ci`, then `lint`, `format:check`, `typecheck`, `test`, `build` in one job. Read-only token; a newer run on the same ref cancels the older one.
- 2026-10-30: PR template at `.github/pull_request_template.md`: Summary, Roadmap item / issue, How tested, and a checklist only for what CI can't verify (one item per PR, docs, `CHANGELOG.md`, `ROADMAP.md`). `gh pr create --body` skips the template, so `AGENTS.md` tells agents to follow it.
- 2026-10-30: `main` is protected by a GitHub ruleset (`main protection`, set up in the UI, targets the default branch, no bypass, admins included): PR required with 0 approvals (solo repo; agents act under the owner's account, which cannot approve its own PRs); required status check `check` (the CI job ID) from GitHub Actions, branch must be up to date; linear history; conversation resolution required; deletion and force pushes blocked. Repo settings: merge commits off, squash and rebase merging on, head branches auto-deleted after merge.
- 2026-10-30: Shared agent permissions are checked in. `.claude/settings.json` has `allow` for reading/searching the repo (`Read(./**)` also covers the Grep and Glob tools), `cd` (`Set-Location` in PowerShell), the project's npm scripts, read-only git/`gh` commands, `git fetch`/`switch`/`add` and `npm ci`; `ask` for anything AGENTS.md says needs the human (`npm install`/`uninstall`, `git commit`/`push`/`reset`/`rebase`/`clean`, deleting branches, `gh pr create`/`merge`); and `deny` for reading or editing `.env` files (except `.env.example`), `--no-verify`, and force pushes. Shell `grep` is left out of `allow` because a Bash rule can't see which files it reads, so it would bypass the `.env` block. Agents search with Claude Code's built-in Grep tool instead, which obeys the `Read` rules. Each rule appears as both `Bash(...)` and `PowerShell(...)` because Claude Code on Windows uses both tools. `.gemini/settings.json` mirrors the allow list in `tools.allowed`. Gemini CLI has no working project-level ask/deny (`tools.exclude` is deprecated, and workspace policy files in `.gemini/policies/` don't work yet), so for Gemini those rules rely on AGENTS.md and the protections on `main`.
- 2026-10-30: Dependency auditing via Dependabot (`.github/dependabot.yml`: weekly grouped checks for npm and GitHub Actions, `chore(deps)` commit prefix) and CI (`npm run audit` running `npm audit --omit=dev --audit-level=high` in `.github/workflows/ci.yml`). Omitting devDependencies in CI audit prevents upstream dev tool advisories from freezing unrelated PRs.

## Phase 1 — Foundation

- [x] `package.json`, `.gitignore`, `.env.example`
- [x] Scaffold `apps/web` and `apps/server` workspaces (empty packages, no dependencies yet)
- [x] `CHANGELOG.md` (Keep a Changelog format) + rule in `AGENTS.md` to update it with every user-facing change
- [x] TypeScript config
- [x] ESLint + Prettier
- [x] Test runner (Vitest) with one passing test
- [x] Add install/test/lint/build commands to `AGENTS.md`

## Phase 2 — Guardrails

- [x] Pre-commit hooks (husky + lint-staged)
- [x] CI workflow: lint, typecheck, test, build on every PR
- [x] PR template
- [x] Branch protection on `main`
- [x] Agent permission allowlists (`.claude/settings.json`, `.gemini/settings.json`)
- [x] Dependency auditing (Dependabot or `npm audit` in CI)

## Phase 3 — Spec

- [ ] `docs/PRD.md` — what the app does and for whom
- [ ] `docs/architecture.md` — modules, data flow
- [ ] `docs/adr/` — first ADR(s) for stack choices
- [ ] Break PRD into small tasks with acceptance criteria, in the chosen task tracker
- [ ] Move the **Decisions** log into `docs/adr/`; keep this roadmap to phases and **Next step**

## Phase 4 — Build

- [ ] Implement tasks one per branch/PR, with tests
- [ ] Cross-review: one agent implements, the other reviews
