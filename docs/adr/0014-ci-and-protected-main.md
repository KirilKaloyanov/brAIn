# 0014. CI and a protected `main`

- Status: Accepted
- Date: 2026-10-30

## Context

Agents open the pull requests, and they act under the owner's GitHub account. Nothing should
reach `main` without passing the checks, even if an agent or the owner skips a step locally.
The repo has one owner, so a second person's approval is not possible.

## Decision

- **CI:** one GitHub Actions workflow (`.github/workflows/ci.yml`) on every PR and on pushes to
  `main`. One job, `check`: Node from `.nvmrc`, `npm ci`, then audit, lint, format check,
  typecheck, test and build. Read-only token; a newer run on the same ref cancels the older one.
- **Ruleset** `main protection` (set in the GitHub UI, targets the default branch, no bypass,
  admins included): PR required with 0 approvals; required status check `check`; branch must be up
  to date; linear history; conversation resolution required; deletion and force pushes blocked.
  Repo settings: merge commits off, squash and rebase merging on, head branches deleted after
  merge.
- **PR template** (`.github/pull_request_template.md`): Summary, Roadmap item / issue, How tested,
  and a checklist only for what CI can't check.
- **Dependencies:** Dependabot (`.github/dependabot.yml`) checks weekly for grouped minor/patch
  npm updates and GitHub Actions updates, ignores npm major bumps and uses the `chore(deps)`
  prefix. CI runs `npm audit --omit=dev --audit-level=high`.

## Consequences

- Every change to `main` is a reviewed PR that passed `check`; this also limits what an agent can
  do by mistake.
- 0 approvals because the owner cannot approve PRs made under their own account; review happens
  in the PR anyway, and resolved threads are required.
- The ruleset lives only in GitHub settings; this ADR is its record. Renaming the `check` job
  means updating the ruleset.
- Major dependency upgrades are done by hand, so breaking changes don't arrive unasked.
- The audit skips devDependencies, so an advisory in a dev tool doesn't block unrelated PRs. Dev
  tools still get Dependabot updates.
- `gh pr create --body` skips the template, so `AGENTS.md` tells agents to follow it.
