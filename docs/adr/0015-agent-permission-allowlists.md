# 0015. Agent permission allowlists

- Status: Accepted
- Date: 2026-10-30

## Context

Claude Code and Gemini CLI ask before running a tool unless a rule allows it. Too many prompts
slow the owner down; too broad rules let an agent do what `AGENTS.md` says needs the human, or
read secrets. The rules should be shared through the repo so every machine behaves the same.

## Decision

- Shared rules are checked in: `.claude/settings.json` and `.gemini/settings.json`. Personal
  overrides go in `.claude/settings.local.json` (gitignored) or user-level settings.
- **Claude Code:**
  - `allow`: reading and searching the repo (`Read(./**)` also covers the Grep and Glob tools),
    the project's npm scripts, read-only `git`/`gh` commands, `git fetch`/`switch`/`add` and
    `npm ci`.
  - `ask`: anything `AGENTS.md` says needs the human: `npm install`/`uninstall`,
    `git commit`/`push`/`reset`/`rebase`/`clean`, deleting branches, `gh pr create`/`merge`.
  - `deny`: reading or editing `.env` files (except `.env.example`), `--no-verify`, and force
    pushes.
  - Each shell rule appears as both `Bash(...)` and `PowerShell(...)`, because Claude Code on
    Windows uses both tools.
- Shell `grep` is not allowed. A Bash rule can't see which files a command reads, so it would get
  around the `.env` block. Agents search with Claude Code's Grep tool, which obeys the `Read`
  rules.
- `cd` is not allowed by a rule (changed 2026-10-31). A `Bash(cd *)` rule approved a `cd` to any
  directory. Claude Code already runs a `cd` into its working directory without a prompt, so
  without a rule a `cd` inside the repo still runs freely and one outside it asks first.
- **Gemini CLI:** `tools.allowed` mirrors the Claude allow list. Gemini has no working
  project-level ask/deny (`tools.exclude` is deprecated, and workspace policy files in
  `.gemini/policies/` don't work yet), and `tools.allowed` only matches command prefixes, so
  `cd` / `Set-Location` always ask.

## Consequences

- Routine reads, checks and tests run without prompts; commits, pushes, installs and PRs always
  reach the owner.
- The two settings files must be kept in step by hand (rule in `AGENTS.md`).
- For Gemini, the ask and deny rules rely on `AGENTS.md` and on the protections on `main`
  (ADR-0014).
- Gemini rarely needs `cd`, because `run_shell_command` takes a `dir_path` argument.
- Revisit when Gemini CLI's workspace policies work.
