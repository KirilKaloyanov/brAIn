# 0017. Deploy by hand with Cloud Build

- Status: Accepted
- Date: 2026-10-31

## Context

The app runs as one container on Cloud Run (ADR-0003). The image has to be built and deployed
somehow. The owner works on Windows and prefers not to install Docker. Deploying from CI on
every merge would need GitHub to hold Google Cloud credentials (e.g. Workload Identity
Federation), which is more setup than one user's occasional releases need.

## Decision

- Deploy by hand with `gcloud run deploy --source .`. Cloud Build builds the `Dockerfile` in the
  cloud, so no local Docker is needed.
- Deploy only from an up-to-date `main` with a clean working tree, after CI has passed. `--source`
  uploads the folder as it is on disk, so anything else would ship code CI never checked.
- The image is not built in CI. The deployment itself is the check that the image runs.
- Steps, flags and rollback are in `docs/deploy.md`.

## Consequences

- The only local tool is the Google Cloud CLI; no cloud credentials live in GitHub.
- A release is a deliberate step by the owner, not a side effect of a merge.
- A broken `Dockerfile` shows up when a deploy fails, not on the PR that broke it. The previous
  revision keeps serving, and rolling back is a traffic switch in the console.
- Deploying from a branch or a dirty tree is possible and is prevented only by the written steps.
- Deploying from CI, or building the image in CI, can be added later with a new ADR.
