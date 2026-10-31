# 0001. Record architecture decisions

- Status: Accepted
- Date: 2026-10-31

## Context

Decisions so far are one-line entries in the **Decisions** log in `docs/ROADMAP.md`. They say what
was chosen but rarely why, or what else was considered. Agents and the human start each session
cold, so a decision whose reasons are lost is easy to reopen by accident.

## Decision

Record significant architecture and stack decisions as ADRs in `docs/adr/`, one Markdown file
each, using the short Context / Decision / Consequences format in `template.md`. Files are
numbered in order and listed in `docs/adr/README.md`.

## Consequences

- The reason for a choice sits next to the choice, in the repo, and changes go through review.
- Changing a decision means a new ADR that supersedes the old one, so history is kept.
- The **Decisions** log in `docs/ROADMAP.md` was moved into ADR-0002 to 0016 and removed.
