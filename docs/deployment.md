# Deployment

## Why the old setup served "Hello world"

Four problems compounding. The first is the one that actually caused it.

**1. The deploy command was `exit 0`.** Cloudflare's build ran, reported success,
and then deployed nothing. The starter Worker created when the project was first
made stayed live permanently. Every "successful build" was genuinely successful
and genuinely changed nothing — which is why the config edits appeared to have no
effect.

**2. The code was Pages-shaped, the project was a Worker.** `functions/api/progress.ts`
used the `functions/` directory convention, which is **Pages only**. Workers with
static assets never read that directory, so `/api/progress` would have 404'd even
after a working deploy.

**3. `database_id` was still `REPLACE_WITH_YOUR_D1_ID`.** `wrangler deploy` fails on
a placeholder id, so D1 was never going to bind.

**4. `not_found_handling = "single-page-application"`.** Astro emits a real HTML file
per route — it is a multi-page static site, not an SPA. SPA handling rewrites every
unmatched path to `index.html`, masking genuine 404s. There was also no `404.html`
to serve.

## What changed

| File | Change |
|---|---|
| `src/worker.ts` | **New.** Handles `/api/progress` against D1, falls through to `env.ASSETS` for everything else |
| `functions/` | **Deleted.** Dead in a Workers project; logic moved into the worker |
| `wrangler.toml` | Added `main`, added `binding = "ASSETS"`, fixed `not_found_handling` |
| `src/pages/404.astro` | **New.** So `404-page` handling has something to serve |
| `.github/workflows/deploy.yml` | **New.** Builds and deploys from Actions, bypassing Cloudflare's build system |
| `package.json` | `sync-preview` now `wrangler dev`; added `npm run deploy` |
| `astro.config.mjs` | `site` corrected off `.pages.dev` |

The server-side merge also now covers the track collections (`tasks`, `attempts`,
`evidence`, `applications`, `stories`). Previously only `answers`, `visited` and
`notes` merged per-record — the rest were whole-object overwrites, so a stale
device could have erased newer track progress.

## Setup

### 1. Clear the broken project

In the Cloudflare dashboard, **delete the existing `md-cyber-academy` Worker
project entirely.** Do not try to repair it. It holds a deployed Hello World
artifact and a build configuration containing `exit 0`, and starting clean is
faster than finding every wrong setting.

### 2. Create the D1 database

```bash
npx wrangler login
npx wrangler d1 create md-cyber-academy
```

Copy the printed `database_id` into `wrangler.toml`, replacing
`REPLACE_WITH_YOUR_D1_ID`.

Then apply the schema:

```bash
npx wrangler d1 execute md-cyber-academy --remote --file=./schema.sql
```

### 3. First deploy from your machine

Prove it works locally before wiring up automation:

```bash
npm ci
npm run deploy
```

That builds and calls `wrangler deploy`. It will create the Worker, upload
`dist/` as static assets, and print the live URL. **Open it — you should see the
site, not Hello world.**

Check the API responds:

```bash
curl -H "x-sync-key: test-key-1234" https://<your-url>/api/progress
# expect: {}
```

A 503 mentioning the DB binding means step 2's id was not pasted in.

### 4. Wire up GitHub auto-deploy

In Cloudflare: **My Profile → API Tokens → Create Token**, using the
*Edit Cloudflare Workers* template. You also need your Account ID, shown on the
Workers overview page.

In GitHub: **Settings → Secrets and variables → Actions**, add:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Push to `main`. The workflow builds, verifies `dist/index.html` and `dist/404.html`
exist, then deploys.

> **Do not connect the repo to Cloudflare's dashboard build system as well.** Two
> deploy paths racing each other is how this went wrong the first time. Actions is
> the only deployer.

## Local development

```bash
npm run dev            # Astro dev server, no Worker
npm run build          # produces dist/
npm run sync-preview   # wrangler dev — Worker + assets + local D1
```

`wrangler dev` uses a local D1 by default. To seed it:

```bash
npx wrangler d1 execute md-cyber-academy --local --file=./schema.sql
```

## Troubleshooting

**Still seeing Hello world.** The old Worker was not deleted, or a second
deployment path is still active. Check the deployment history in the dashboard —
if the live deployment predates today, something else deployed it.

**Site loads but `/api/progress` 404s.** `main` is missing from `wrangler.toml`, so
no Worker is running and every path resolves against assets only.

**`/api/progress` returns 503.** `database_id` is still the placeholder, or the
binding name is not `DB`.

**Deploy fails on the D1 binding.** The database was created in a different
Cloudflare account than the API token grants access to.

**Pages load but search is broken.** Pagefind runs as part of `npm run build`. If
you deployed a `dist/` built by `astro build` alone, `/pagefind/` is missing.
