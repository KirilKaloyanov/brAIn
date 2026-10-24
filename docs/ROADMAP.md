# Roadmap

Hand-off file between sessions. Keep it current.

## Next step
Phase 1: `package.json`, `.gitignore`, `.env.example`.

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

## Phase 1 — Foundation
- [ ] `package.json`, `.gitignore`, `.env.example`
- [ ] `CHANGELOG.md` (Keep a Changelog format) + rule in `AGENTS.md` to update it with every user-facing change
- [ ] TypeScript config
- [ ] ESLint + Prettier
- [ ] Test runner (Vitest) with one passing test
- [ ] Add install/test/lint/build commands to `AGENTS.md`

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
