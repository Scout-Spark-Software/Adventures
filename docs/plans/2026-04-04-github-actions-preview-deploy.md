# GitHub Actions Preview/Prod Deploy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Push to `preview` branch deploys to Cloudflare Pages preview. Push/merge to `main` runs DB migrations first, then deploys to production — migrations failing blocks the deploy. No E2E tests run against production.

**Architecture:** Replace the existing two workflow files (`test-and-deploy.yml`, `migrate.yml`) with two purpose-built files: `deploy-preview.yml` (preview branch, deploy only) and `deploy-prod.yml` (main branch, migrate → deploy with hard dependency). Splitting into two files avoids messy conditional `needs:` logic and makes each workflow's intent obvious.

**Tech Stack:** GitHub Actions, Wrangler CLI (`npx wrangler pages deploy`), Neon PostgreSQL (`npm run migrate all`)

---

## Context

### Files being replaced

| File | Action |
|------|--------|
| `.github/workflows/test-and-deploy.yml` | **Delete** — replaced by `deploy-prod.yml` |
| `.github/workflows/migrate.yml` | **Delete** — absorbed into `deploy-prod.yml` |

### Files being created

| File | Purpose |
|------|---------|
| `.github/workflows/deploy-preview.yml` | Triggers on `preview` branch push, builds and deploys to CF Pages preview |
| `.github/workflows/deploy-prod.yml` | Triggers on `main` push, runs migrations then deploys to CF Pages production |

### Why absorb `migrate.yml` into `deploy-prod.yml`?

`migrate.yml` currently runs independently with a `paths` filter (only when schema files change). This means a push to `main` that touches app code but not schema files will deploy without running migrations — even if a previous migration was never applied. Putting migrate as a `needs:` dependency in the deploy workflow guarantees it always runs before deploy on `main`, and a migration failure hard-blocks the deploy job.

### Relevant npm scripts

```
"migrate":        "tsx scripts/migrate.ts"        # runs as: npm run migrate all
"deploy:prod":    "npm run build && wrangler pages deploy"
"deploy:preview": "npm run build && wrangler pages deploy --branch preview"
```

The workflows do build and deploy as separate steps (not via these npm scripts) to keep each step visible in the Actions UI.

### GitHub environments

- `production` — already exists, has `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `DATABASE_URL`
- `preview` — needs to exist with `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (no DATABASE_URL needed — no migrations run on preview)

> If you don't want a separate `preview` GitHub environment, hardcode `environment: production` in `deploy-preview.yml` — the Cloudflare target is controlled by the `--branch preview` wrangler flag, not the GitHub environment name.

---

## Task 1: Create `deploy-preview.yml`

**Files:**
- Create: `.github/workflows/deploy-preview.yml`

### Step 1: Write the file

```yaml
name: Deploy (Preview)

on:
  push:
    branches:
      - preview

jobs:
  deploy:
    name: Deploy to Cloudflare Pages (preview)
    runs-on: ubuntu-latest
    environment: preview

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NODE_ENV: preview

      - name: Deploy to Cloudflare Pages
        run: npx wrangler pages deploy --branch preview
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
```

### Step 2: Commit

```bash
git add .github/workflows/deploy-preview.yml
git commit -m "ci: add preview branch deploy workflow"
```

---

## Task 2: Create `deploy-prod.yml`

**Files:**
- Create: `.github/workflows/deploy-prod.yml`

### Step 1: Write the file

The `deploy` job declares `needs: migrate`. GitHub Actions will refuse to run `deploy` if `migrate` exits with a non-zero status — this is the hard block.

```yaml
name: Deploy (Production)

on:
  push:
    branches:
      - main

jobs:
  migrate:
    name: Run DB migrations
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run migrate all
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  deploy:
    name: Deploy to Cloudflare Pages (production)
    runs-on: ubuntu-latest
    environment: production
    needs: migrate

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to Cloudflare Pages
        run: npx wrangler pages deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
```

### Step 2: Commit

```bash
git add .github/workflows/deploy-prod.yml
git commit -m "ci: add prod deploy workflow with migrate-first dependency"
```

---

## Task 3: Delete the old workflow files

**Files:**
- Delete: `.github/workflows/test-and-deploy.yml`
- Delete: `.github/workflows/migrate.yml`

### Step 1: Delete both files

```bash
git rm .github/workflows/test-and-deploy.yml
git rm .github/workflows/migrate.yml
```

### Step 2: Commit

```bash
git commit -m "ci: remove old test-and-deploy and standalone migrate workflows"
```

---

## Task 4: Verify GitHub environments have the right secrets

In your repo: **Settings → Environments**

**`production` environment** (already exists — verify these are present):
- Secret: `CLOUDFLARE_API_TOKEN`
- Secret: `DATABASE_URL`
- Var: `CLOUDFLARE_ACCOUNT_ID`

**`preview` environment** (create if it doesn't exist):
- Secret: `CLOUDFLARE_API_TOKEN`
- Var: `CLOUDFLARE_ACCOUNT_ID`
- *(No DATABASE_URL needed — no migrations run on preview)*

No commit needed for this task.

---

## Task 5: Smoke test both flows

### Step 1: Test the preview flow

Push to the `preview` branch (create it if it doesn't exist):

```bash
git checkout -b preview
git push origin preview
```

Go to **Actions tab** → `Deploy (Preview)` workflow should run → single `deploy` job → Cloudflare Pages dashboard should show a deployment on the `preview` branch/environment.

### Step 2: Test the prod flow (migrations succeed)

Push to `main`:

```bash
git checkout main
git push origin main
```

Go to **Actions tab** → `Deploy (Production)` workflow → `migrate` job runs first → on success, `deploy` job runs → both green.

### Step 3: Verify migration failure blocks deploy

You can verify the blocking behavior by temporarily introducing a bad migration (e.g., rename a migration file so it fails), pushing to main, and confirming the `deploy` job shows "skipped" or "cancelled" after `migrate` fails. Revert after confirming.

---

## Summary of changes

| Old | New |
|-----|-----|
| `test-and-deploy.yml` (main only, E2E + deploy) | Deleted |
| `migrate.yml` (main only, paths-filtered) | Deleted |
| *(new)* `deploy-preview.yml` | Preview branch: build → deploy:preview |
| *(new)* `deploy-prod.yml` | Main branch: migrate → deploy:prod (hard dependency) |
