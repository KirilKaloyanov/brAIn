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
gcloud config set project brain-kk
gcloud config set run/region europe-west1

# APIs for deploying from source.
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# The app's own service account. Roles (Firestore, secrets) are granted as features need them.
gcloud iam service-accounts create brain-run --display-name "brAIn Cloud Run"
```

### Firestore

One Firestore database in Native mode, named `(default)`, in the service's region. The service
account reads and writes it with `roles/datastore.user` (architecture §8).

```sh
gcloud services enable firestore.googleapis.com
gcloud firestore databases create --location=europe-west1
gcloud projects add-iam-policy-binding brain-kk --member=serviceAccount:brain-run@brain-kk.iam.gserviceaccount.com --role=roles/datastore.user
```

### Google sign-in

The OAuth client is created as in `docs/development.md` (**Google sign-in**), with the Cloud Run
redirect URI. Its secret lives in Secret Manager, which the service reads at startup:

1. Enable the API: `gcloud services enable secretmanager.googleapis.com`.
2. ☰ → **Security** → **Secret Manager** → **Create secret**: name `google-client-secret`, value
   the client secret. Pasting it in the console avoids a stray newline from the shell.
3. Let the service account read it:

```sh
gcloud secrets add-iam-policy-binding google-client-secret --member=serviceAccount:brain-run@brain-kk.iam.gserviceaccount.com --role=roles/secretmanager.secretAccessor
```

The service already deployed without sign-in needs the new settings before the first deploy
that includes it, or the new revision fails to start (the config check stops it) and traffic
stays on the old one. Keep the quotes: PowerShell turns an unquoted `a,b` into `a b`, which
puts both variables into the first one.

```sh
gcloud run services update brain --update-env-vars "ALLOWED_EMAIL=<your email>,GOOGLE_CLIENT_ID=<client id>" --set-secrets GOOGLE_CLIENT_SECRET=google-client-secret:latest
```

Check that each variable is a separate entry:

```sh
gcloud run services describe brain --format="yaml(spec.template.spec.containers[0].env)"
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
gcloud alpha services quota update --service=generativelanguage.googleapis.com --consumer=projects/brain-kk --metric=generativelanguage.googleapis.com/generate_content_requests --unit='1/min/{project}/{region}' --value=10 --force

# Per day, per model: repeat for a new GEMINI_MODEL.
gcloud alpha services quota update --service=generativelanguage.googleapis.com --consumer=projects/brain-kk --metric=generativelanguage.googleapis.com/generate_requests_per_model_per_day --unit='1/d/{project}/{model}' --dimensions=model=gemini-3.8-flash --value=300 --force
```

## Deploy

Deploy only from an up-to-date `main` with no local changes. `--source .` uploads the working
folder as it is on disk (minus what `.gcloudignore` excludes), so anything else would run code
that CI never checked.

```sh
git switch main
git pull
git status   # must show a clean working tree
gcloud run deploy brain --source . --service-account brain-run@brain-kk.iam.gserviceaccount.com --allow-unauthenticated --min-instances 0 --max-instances 2 --cpu-throttling --timeout 300 --set-env-vars "PUBLIC_URL=https://brain-955911433585.europe-west1.run.app,GOOGLE_CLOUD_PROJECT=brain-kk,ALLOWED_EMAIL=<your email>,GOOGLE_CLIENT_ID=<client id>" --set-secrets GOOGLE_CLIENT_SECRET=google-client-secret:latest
```

- `--allow-unauthenticated`: the service is public; the app does its own Google sign-in.
- `--min-instances 0`: scale to zero when idle. `--max-instances 2` caps cost if something loops.
- `--cpu-throttling`: request-based billing (CPU only during requests, architecture §9).
- `--timeout 300`: 5 minutes, so long answers can finish.
- `PUBLIC_URL`: the service's fixed URL, `https://<service>-<project-number>.<region>.run.app`.
- `GOOGLE_CLOUD_PROJECT`: the project that holds Firestore. Cloud Run doesn't set it.
- `ALLOWED_EMAIL`, `GOOGLE_CLIENT_ID`: the owner's Google account and the OAuth client.
- `--set-secrets`: `GOOGLE_CLIENT_SECRET` from Secret Manager; `latest` is read when an instance
  starts, so a new secret version needs a new revision (any deploy or `services update`).
- The quotes around the `--set-env-vars` list keep PowerShell from splitting it at the commas.
- `--set-env-vars` replaces every variable on the service. To add or change one on a deployed
  service, use `gcloud run services update brain --update-env-vars NAME=value`.

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
docker run --rm -p 8080:8080 -e PUBLIC_URL=http://localhost:8080 -e GOOGLE_CLOUD_PROJECT=demo-brain -e ALLOWED_EMAIL=you@example.com -e GOOGLE_CLIENT_ID=test.apps.googleusercontent.com -e GOOGLE_CLIENT_SECRET=test brain
```

`/api/health` then answers `{"status":"ok"}` on port 8080 (Cloud Shell: **Web Preview** → port
8080), and `/sign-in` serves the web app. Without Firestore and a real OAuth client, signing in
doesn't work there.
