# AGENTS.md

Shared instructions for all AI agents (Claude, Gemini) working in this repo.
`CLAUDE.md` and `GEMINI.md` only point here — keep rules in this file.

## Project

brAIn — a full-stack TypeScript app: React frontend served by a Node backend on Google Cloud Run.
npm workspaces monorepo (`apps/*`, `packages/*`), Node 24 (see `.nvmrc`). Product scope is in `docs/PRD.md`; progress is in `docs/ROADMAP.md`.

## Commands

Run from the repo root. Each runs across all workspaces.

| Task      | Command                                        |
| --------- | ---------------------------------------------- |
| Install   | `npm install`                                  |
| Build     | `npm run build` (server → `apps/server/dist`)  |
| Typecheck | `npm run typecheck`                            |
| Lint      | `npm run lint`                                 |
| Format    | `npm run format` / `npm run format:check`      |
| Test      | `npm test` (single run) / `npm run test:watch` |
| Audit     | `npm run audit`                                |

Before proposing a commit, run `typecheck`, `lint`, `format:check`, `test` and `audit`.
A pre-commit hook (husky + lint-staged) also runs ESLint `--fix` and Prettier on staged files; it does not run typecheck or tests. Do not bypass it with `--no-verify`.

## Start of every session

1. Read this file.
2. Read `docs/ROADMAP.md` and work on the item under **Next step** only.
3. When done, tick it off, update **Next step**, and record any decision made.

## Rules

- Keep each session/PR small: one roadmap item at a time.
- Never commit, amend, or push without the human's explicit approval. Show the proposed message, PR description as markdown and changed files first.
- Never commit directly to `main`. Branch per task: `claude/<topic>` or `gemini/<topic>`.
  `main` is protected: direct pushes and force pushes are rejected, and a PR merges (squash or rebase) only when the CI job `check` passes, the branch is up to date with `main` and all review threads are resolved. Renaming the `check` job requires updating the ruleset in GitHub settings.
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:` …).
- Write PR descriptions using `.github/pull_request_template.md` (`gh pr create --body` skips it).
- Update docs in the same change as the code they describe.
- Add an entry under `## [Unreleased]` in `CHANGELOG.md` for every user-facing change, in the same change. Internal work (tooling, refactors, docs for agents) needs no entry.
- Ask the human before adding dependencies or making decisions listed under **Open decisions**.
- Shared permission allowlists live in `.claude/settings.json` and `.gemini/settings.json`; keep them in step when one changes. Personal overrides go in `.claude/settings.local.json` (gitignored) or user-level settings.
