# Deployment

How to build the container and deploy it to Google Cloud Run. Background: `docs/architecture.md`
§8, ADR 0003 and ADR 0017.

The image is built by Cloud Build from the `Dockerfile`, so deploying needs no local Docker. The
deployment itself is the check that the image runs: Cloud Run starts it and serves the app from it.

## Tools

- **Google Cloud CLI** (`gcloud`): install it with the Windows installer from
  <https://cloud.google.com/sdk/docs/install>, then sign in when `gcloud init` opens the browser.

## This deployment

- Project ID `brain-kk`, project number `955911433585`, region `europe-west1`.
- Service `brain` at <https://brain-955911433585.europe-west1.run.app>.

## One-time setup

In the Google Cloud console (<https://console.cloud.google.com>):

1. Create a project (no organization) and note its **project ID** and **project number**
   (Dashboard → **Project info**).
2. Link a billing account to it (☰ → **Billing**).

Then in a terminal:

```sh
# Defaults for later commands; stored for your user, not in the repo.
gcloud config set project <project-id>
gcloud config set run/region europe-west1

# APIs for deploying from source.
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# The app's own service account. Roles (Firestore, secrets) are granted as features need them.
gcloud iam service-accounts create brain-run --display-name "brAIn Cloud Run"
```

### Spending limits

Values and reasons are in `docs/architecture.md` §8.

- **Budget alert:** ☰ → **Billing** → **Budgets & alerts**. A budget scoped to all projects on
  the billing account covers this one; otherwise create one for the project with alerts at 50%,
  90% and 100% of actual spend.
- **Gemini API quotas:** enable the API, then lower its request quotas. The quota command is in
  gcloud's `alpha` group; `--force` confirms a cut of more than 10%. Single quotes keep
  PowerShell from reading `{project}` as code.

```sh
gcloud services enable generativelanguage.googleapis.com
gcloud components install alpha

# Per minute, project-wide, every model.
gcloud alpha services quota update --service=generativelanguage.googleapis.com --consumer=projects/<project-id> --metric=generativelanguage.googleapis.com/generate_content_requests --unit='1/min/{project}/{region}' --value=10 --force

# Per day, per model: repeat for a new GEMINI_MODEL.
gcloud alpha services quota update --service=generativelanguage.googleapis.com --consumer=projects/<project-id> --metric=generativelanguage.googleapis.com/generate_requests_per_model_per_day --unit='1/d/{project}/{model}' --dimensions=model=gemini-3.8-flash --value=300 --force
```

## Deploy

Deploy only from an up-to-date `main` with no local changes. `--source .` uploads the working
folder as it is on disk (minus what `.gcloudignore` excludes), so anything else would run code
that CI never checked.

```sh
git switch main
git pull
git status   # must show a clean working tree
gcloud run deploy brain --source . --service-account brain-run@<project-id>.iam.gserviceaccount.com --allow-unauthenticated --min-instances 0 --max-instances 2 --cpu-throttling --timeout 300 --set-env-vars PUBLIC_URL=https://brain-<project-number>.europe-west1.run.app
```

- `--allow-unauthenticated`: the service is public; the app does its own Google sign-in.
- `--min-instances 0`: scale to zero when idle. `--max-instances 2` caps cost if something loops.
- `--cpu-throttling`: request-based billing (CPU only during requests, architecture §9).
- `--timeout 300`: 5 minutes, so long answers can finish.
- `PUBLIC_URL`: the service's fixed URL, `https://<service>-<project-number>.<region>.run.app`.

The first deploy asks to create an Artifact Registry repository (`cloud-run-source-deploy`) for
the built images; answer yes. Later deploys keep the flags set before, so a plain
`gcloud run deploy brain --source .` is enough unless a setting changes.

Then open the service URL and check the web app and `<url>/api/health` (`{"status":"ok"}`).

## Roll back

Every deploy creates a new revision. If one is broken: Cloud Run console → service `brain` →
**Revisions** → **Manage traffic** → send 100% to the previous revision. No rebuild is needed.

## Run the image without deploying (optional)

Any machine with Docker can build and run the image, for example Cloud Shell in the Google Cloud
console, which has Docker installed. From the repo root:

```sh
docker build -t brain .
docker run --rm -p 8080:8080 -e PUBLIC_URL=http://localhost:8080 brain
```

The web app is then on port 8080 (Cloud Shell: **Web Preview** → port 8080), and `/api/health`
answers `{"status":"ok"}`.
