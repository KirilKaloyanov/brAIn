# AGENTS.md

Shared instructions for all AI agents (Claude, Gemini) working in this repo.
`CLAUDE.md` and `GEMINI.md` only point here — keep rules in this file.

## Project
brAIn — a full-stack TypeScript app: React frontend served by a Node backend on Google Cloud Run.
npm workspaces monorepo (`apps/*`, `packages/*`), Node 24 (see `.nvmrc`). Scope is not defined yet; see `docs/ROADMAP.md`.

## Start of every session
1. Read this file.
2. Read `docs/ROADMAP.md` and work on the item under **Next step** only.
3. When done, tick it off, update **Next step**, and record any decision made.

## Rules
- Keep each session/PR small: one roadmap item at a time.
- Never commit, amend, or push without the human's explicit approval. Show the proposed message and changed files first.
- Never commit directly to `main`. Branch per task: `claude/<topic>` or `gemini/<topic>`.
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:` …).
- Update docs in the same change as the code they describe.
- Add an entry under `## [Unreleased]` in `CHANGELOG.md` for every user-facing change, in the same change. Internal work (tooling, refactors, docs for agents) needs no entry.
- Ask the human before adding dependencies or making decisions listed under **Open decisions**.
