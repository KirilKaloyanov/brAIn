# 0016. Working with AI agents

- Status: Accepted
- Date: 2026-10-24

## Context

brAIn is built by one person working with two AI agents, Claude and Gemini. Each agent session
starts cold, and either agent may pick up any task. Instructions, progress and tasks must live
where both agents and the owner can find them.

## Decision

- `AGENTS.md` is the single source of agent instructions. `CLAUDE.md` and `GEMINI.md` only point
  to it.
- There is no fixed split of work between Claude and Gemini.
- Code is hosted on GitHub, and tasks are tracked in GitHub Issues. Each issue has a spec
  reference, a **Depends on** line, acceptance criteria as checkboxes and the dependencies it is
  expected to add (still confirmed with the owner when the task starts). The MVP tasks are issues
  #24–#43 in the `MVP` milestone, labelled `server`, `web` and/or `infra`.
- Agents draft issues; the owner creates and manages them in the GitHub UI.
- `docs/ROADMAP.md` holds the phases, the **Next step** and the open decisions. Decisions with
  lasting reasons are ADRs (ADR-0001).

## Consequences

- One set of rules for both agents; a rule changed in `AGENTS.md` applies to both at once.
- Any agent can take the next task, and one can review the other's work.
- An issue states what "done" means, so a cold session can start without a long hand-off.
- Tasks live outside the repo, so agents need `gh` (read-only by default) to see them.
- The owner keeps control of what gets built, since only they create issues and merge PRs.
