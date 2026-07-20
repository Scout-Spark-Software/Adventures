# Scouts Adventures Platform

A SvelteKit application for scouts to discover, submit, and manage hiking trails and camping sites.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Run database migrations:

```bash
npm run db:migrate
```

4. Start development server:

```bash
npm run dev
```

## Deployment

The app deploys to Cloudflare Workers. Deploys are triggered by pushing to two branches:

- **`preview`** → runs unit tests, runs DB migrations, deploys to `https://preview.adventurespark.org`, then runs e2e tests against it (`.github/workflows/deploy-preview.yml`)
- **`main`** → runs DB migrations, deploys to `https://adventurespark.org`, then deploys the scheduler Worker (`.github/workflows/deploy-prod.yml`)

Migrations run as their own CI job and gate the deploy job — a failed migration blocks the deploy. To ship a change:

```bash
git checkout preview
git merge feat/your-branch
git push                    # deploys to preview automatically

# once verified on preview:
git checkout main
git merge preview
git push                    # deploys to production automatically
```

### Manual deploy (fallback)

Only needed if CI is unavailable — requires `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` set locally and `npm run db:migrate` run against the target database first:

```bash
npm run deploy:preview      # npm run build && wrangler deploy --env preview
npm run deploy:prod         # npm run build && wrangler deploy
```

### Secrets

App secrets (WorkOS, R2, `CRON_SECRET`, etc.) are uploaded to the Worker separately from `.env`:

```bash
npm run secrets:upload:preview   # reads .env
npm run secrets:upload:prod      # reads .env.prod
```

The `adventures-scheduler` Worker (`workers/scheduler/`) has its own secrets (`APP_URL`, `CRON_SECRET`) set once per environment via `wrangler secret put` — see `CLAUDE.md` for the exact commands.
