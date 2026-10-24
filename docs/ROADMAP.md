# Roadmap

Hand-off file between sessions. Keep it current.

## Next step
Resolve the **Open decisions** below with the human, record the answers in **Decisions**, then start Phase 1.

## Open decisions
- [ ] App type: web frontend, Node backend, full-stack, CLI, other?
- [ ] TypeScript or plain JavaScript? (recommended: TypeScript)
- [ ] Hosting: GitHub? (needed for CI / PR workflow)
- [ ] How Claude and Gemini split work: by role (build/review), by area, or free?
- [ ] Task tracking: GitHub Issues or a `docs/tasks/` folder?

## Decisions
- 2026-10-24: `AGENTS.md` is the single source of agent instructions; `CLAUDE.md`/`GEMINI.md` point to it.
- 2026-10-24: Default branch is `main`; work happens on per-task branches.

## Phase 1 — Foundation
- [ ] `package.json`, `.gitignore`, `.env.example`
- [ ] `CHANGELOG.md` (Keep a Changelog format) + rule in `AGENTS.md` to update it with every user-facing change
- [ ] TypeScript config (if chosen)
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
