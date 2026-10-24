# AGENTS.md

Shared instructions for all AI agents (Claude, Gemini) working in this repo.
`CLAUDE.md` and `GEMINI.md` only point here — keep rules in this file.

## Project
brAIn — a JavaScript app. Stack and scope are not decided yet; see `docs/ROADMAP.md`.

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
- Ask the human before adding dependencies or making decisions listed under **Open decisions**.
