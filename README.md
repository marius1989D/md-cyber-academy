# MD Cyber Academy v2.0

A study platform for advanced cyber security material — rebuilt from a single 530 KB HTML file into an Astro + MDX static site with offline support, spaced-repetition review, and cross-device progress sync.

The design goal was depth. Every module carries a **rung** on a four-step depth ladder (Concept → Applied → Analysis → Lab), so at a glance you know whether a topic is still definitions or has been taken through to hands-on work in your cyber range.

---

## Quick start

```bash
npm install
npm run dev          # local dev server at http://localhost:4321
npm run build        # production build + search index into dist/
npm run preview      # serve the built site locally
```

You need Node 20 or newer (this was built on Node 22). On the Mac: `brew install node`.

---

## How it's built

| Piece | Choice | Why |
|-------|--------|-----|
| Framework | Astro 5 | Ships static HTML; only the quiz widgets hydrate. Fast on a phone. |
| Content | MDX | Prose with `<Quiz />`, `<Lab />`, `<Callout />` dropped inline. Code blocks highlight at build time. |
| Styling | Tailwind v4 | Design tokens carried from v1 (parchment / ink / vermilion) with a true warm-dark night mode. |
| Search | Pagefind | Full-text index built from the modules at build time; loaded on demand. |
| Progress | localStorage + Cloudflare D1 | Local-first, so it works offline. Syncs across devices via a shared key. |
| Hosting | Cloudflare Pages | Free tier, global edge, and Pages Functions host the sync API. |

### Project layout

```
src/
  content/modules/<course>/NN-slug.mdx   the study material
  content.config.ts                       course registry + module schema (the depth ladder lives here)
  components/   Quiz, RungGauge, Callout, Lab
  layouts/Base.astro                       sidebar, mobile nav, theme handling, PWA registration
  pages/        index, courses, dashboard, review, search, module/[...id]
  lib/store.ts                             progress state, spaced repetition, sync
functions/api/progress.ts                  Cloudflare Pages Function — the sync endpoint
schema.sql                                 D1 table definition
wrangler.toml                              Cloudflare config (needs your D1 id)
public/        manifest, service worker, icons
```

---

## Writing a new module

Create `src/content/modules/<course>/NN-slug.mdx`. The frontmatter is validated against the schema in `content.config.ts` — if a field is wrong the build tells you exactly what and where.

```mdx
---
title: "Kerberoasting"
course: ceh                 # ceh | network | ai-security | detection | secai | forensics
order: 6                    # position within the course
summary: "One-line promise of what you'll be able to do after this."
rung: 3                     # 1 Concept · 2 Applied · 3 Analysis · 4 Lab
minutes: 18
attack: ["T1558.003"]       # MITRE ATT&CK ids (optional)
atlas: []                   # MITRE ATLAS ids for AI material (optional)
objectives: ["CEH v13 M06"] # cert objective refs (optional)
tags: ["kerberos", "active-directory"]
published: true             # set false to keep a draft out of the build
---

import Quiz from '../../../components/Quiz.astro';
import Callout from '../../../components/Callout.astro';
import Lab from '../../../components/Lab.astro';

Prose in Markdown. Use ## headings — they become the "on this page" index.

<Callout type="key">A point worth pulling out. Types: key, warn, detect.</Callout>

<Quiz mid="ceh/06-kerberoasting" title="Kerberoasting" questions={[
  {
    q: "Question text, supports `code` and **bold**.",
    opts: ["A", "B", "C", "D"],
    a: 1,                    // zero-based index of the correct option
    why: "The explanation — this is the part that teaches. Make it earn its place."
  }
]} />

<Lab title="Do it in the range" host="2018 MBP attack box" minutes={40}>
Numbered steps, then a bold **Evidence of completion:** line stating what counts as done.
</Lab>
---
```

Two things to keep consistent:

- **`mid` must match the module path** (`<course>/<slug>` without the number-less filename extension) — it namespaces quiz answers in storage. If it drifts, progress for that module won't line up.
- **Rung is a promise.** Don't mark a module rung 4 unless it actually ends in a lab with evidence. The whole platform's value is that the rung is honest.

---

## Deploying to Cloudflare Pages

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "MD Cyber Academy v2.0"
git branch -M main
git remote add origin git@github.com:<you>/md-cyber-academy.git
git push -u origin main
```

### 2. Connect the repo to Pages

In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick the repo, and set:

- Build command: `npm run build`
- Build output directory: `dist`

The first deploy gives you `https://md-cyber-academy.pages.dev` (or your custom domain). At this point the site works fully — content, quizzes, offline, local progress. Sync is the only thing that needs the next step.

### 3. Set up the D1 database for sync

```bash
npx wrangler login
npx wrangler d1 create md-cyber-academy
```

That prints a `database_id`. Paste it into `wrangler.toml`, replacing `REPLACE_WITH_YOUR_D1_ID`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "md-cyber-academy"
database_id = "your-id-here"
```

Create the table:

```bash
npx wrangler d1 execute md-cyber-academy --remote --file schema.sql
```

Commit the updated `wrangler.toml` and push. Cloudflare picks up the D1 binding on the next deploy, and `functions/api/progress.ts` starts serving `/api/progress`.

### 4. Turn on sync (on each device)

Open the site → **Progress** → under *Sync & backup*, enter the **same** long, private key on your Mac, your phone, and anywhere else. Tap **Sync now** once on each. From then on, answering a quiz on one device shows up on the others.

The key is your only credential — there are no accounts. Choose something long. It's hashed before it touches the database, so a D1 dump never reveals the key itself, but a short or guessable key would still let someone read your progress. Twelve characters is the enforced minimum; use more.

---

## Installing it on your phone

Open the deployed URL in Safari (iOS) or Chrome (Android) → **Share → Add to Home Screen**. It installs as a standalone app, works offline once you've opened the modules, and syncs whenever it has a connection.

---

## Backup without sync

Even without D1, **Progress → Export backup** downloads your whole state as JSON, and **Import backup** merges a file back in. Import is a merge, not a replace, so pulling in an old backup never loses newer answers.

---

## What's here vs. what's next

**Built and verified — the AI Security course is complete (5 modules):**

1. OWASP LLM Top 10 — 2025 (rung 3)
2. Prompt Injection in Depth (rung 3)
3. Adversarial ML: The Four Attack Categories (rung 3)
4. AI Supply Chain Security (rung 4)
5. AI Governance & Risk (rung 2)

This course is the **reference standard** — every rung, artifact analysis at rung 3, quizzes with teaching explanations, and range labs tied to your attack box. Match it when building the rest.

**To migrate:** the remaining ~39 modules from the v1 HTML file (CEH, Network, Detection, SecAI+). The original questions and explanations are extractable from `md-cyber-academy-final.html` (the `submit()` handlers carry the answer index and explanation text). Each becomes an MDX file following the pattern above.

**Optional polish noted during the build:** the desktop home hero has empty space on the right that could take a small "recently updated" or coverage widget, and the mobile bottom-nav icons are a touch cramped.
