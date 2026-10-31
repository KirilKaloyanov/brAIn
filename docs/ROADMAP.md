# Roadmap

Hand-off file between sessions. Keep it current.

## Next step

Phase 4: #24 (server skeleton) and #25 (`@brain/shared`) are done; next is #26 (web skeleton); check it from the repo's public URL. Implement issues in order, one per branch/PR; each issue lists what it depends on.

## Open decisions

Referenced from `docs/PRD.md` and `docs/architecture.md` as `OD-n`. When one is resolved, record it as an ADR in `docs/adr/` and remove it here.

None right now.

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

- [x] `docs/PRD.md` — what the app does and for whom
- [x] `docs/architecture.md` — modules, data flow
- [x] Import a chat from a Markdown file — add it to `docs/PRD.md` and `docs/architecture.md`
- [x] `docs/adr/` — first ADR(s) for stack choices
- [x] Break PRD into small tasks with acceptance criteria, in the chosen task tracker (GitHub issues #24–#43, milestone `MVP`)
- [x] Move the **Decisions** log into `docs/adr/`; keep this roadmap to phases and **Next step**

## Phase 4 — Build

- [ ] Implement tasks one per branch/PR, with tests, in issue order (#24–#43, milestone `MVP`; each issue lists what it depends on)
- [ ] Cross-review: one agent implements, the other reviews
