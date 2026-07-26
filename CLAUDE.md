# MD Cyber Academy — working brief

A self-built cyber security study platform. Astro + MDX static site, deployed as a
Cloudflare Worker with D1-backed cross-device progress sync.

**Owner:** Marius Dumitru — UK, CEH v13 held, SecAI+ in progress, career-changing
into a Tier 1 SOC role from injection moulding. The site is both a study tool and
portfolio evidence.

**Live:** https://md-cyber-academy.creion-m.workers.dev

---

## Current state

**Done and working — do not re-architect any of this:**

- Astro 5 + MDX, static output, 51 pages
- Deployed as a Cloudflare Worker (`src/worker.ts`) serving static assets, with
  `/api/progress` backed by D1
- GitHub Actions deploys on every push to `main` (`.github/workflows/deploy.yml`)
- Pagefind search, PWA manifest, service worker, localStorage progress + D1 sync
- **Track 6** — a 38-step career campaign, complete across 9 phases

**Outstanding — this is the work:**

Six courses are defined in `src/content.config.ts`. Only one has content.

| Course id | Name | Modules written |
|---|---|---|
| `ceh` | CEH v13 Full Certification Prep | 0 (21 planned, M0–M20) |
| `network` | Network Security Fundamentals | 0 |
| `ai-security` | AI Security & LLM Red Teaming | **5 — the style reference** |
| `detection` | Detection Engineering & SOAR | 0 |
| `secai` | CompTIA SecAI+ (CY0-001) | 0 |
| `forensics` | Incident Response & Forensics | 0 |

---

## Priority: modules Track 6 already links to

Track 6 steps carry `academy:` frontmatter cross-linking to course modules. The
step page filters these against modules that actually exist, so missing ones
disappear silently rather than 404ing. **Writing these first makes existing links
light up:**

```
network/01-protocols              network/02-active-directory
network/03-cloud-identity         network/04-traffic-analysis

detection/01-detection-fundamentals    detection/02-attack-mapping
detection/03-log-pipelines             detection/04-tuning
detection/05-behavioural-detection     detection/06-correlation
detection/07-sentinel                  detection/08-threat-hunting
detection/09-xdr                       detection/10-adversary-emulation
detection/11-detection-engineering     detection/12-sigma
detection/13-soar

forensics/01-incident-response    forensics/03-malware-analysis
forensics/04-windows-artefacts

ceh/06-system-hacking             ceh/09-social-engineering
```

**Sensible order:** `network` first (4 modules, foundational, unblocks the most),
then `detection` (13 modules, the largest and best-aligned with the owner's
portfolio direction), then `forensics`, then `ceh`, then `secai`.

---

## Content model

Two separate collections, defined in `src/content.config.ts`:

- **`modules`** (`src/content/modules/<course>/NN-slug.mdx`) — the course library.
  Subject matter you dip into.
- **`track`** (`src/content/track/<phase>/NN-slug.mdx`) — the career campaign.
  Sequenced, gated, with a finish line. **Complete — do not add steps unless asked.**

They deliberately have different schemas. Don't merge them.

### Module frontmatter

```yaml
---
title: "Kerberos and Domain Authentication"
course: network              # ceh | network | ai-security | detection | secai | forensics
order: 2                     # position within the course; 0 for a foundations module
summary: "One line, written as a promise rather than a topic."
rung: 3                      # 1 Concept · 2 Applied · 3 Analysis · 4 Lab
minutes: 25                  # realistic working time including the quiz
attack: ["T1558.003"]        # MITRE ATT&CK ids — powers the coverage heatmap
atlas: []                    # MITRE ATLAS ids, AI security modules only
objectives: ["CEH v13 M06"]  # certification objective refs
tags: ["kerberos", "ad"]
updated: 2026-07-25
---
```

The `id` used in cross-links is the path minus extension: a file at
`src/content/modules/network/02-active-directory.mdx` has id
`network/02-active-directory`.

### Components available in modules

```jsx
import Quiz from '../../../components/Quiz.astro';
import Callout from '../../../components/Callout.astro';
import Lab from '../../../components/Lab.astro';
```

- `<Callout type="key|warn|detect">` — the pull-out for a load-bearing point
- `<Lab title host minutes>` — hands-on exercise block
- `<Quiz mid="course/NN-slug" title questions={[...]} />` — every question needs a
  `why` explaining the reasoning, not just naming the answer

Track-only components live in `src/components/track/` and should not be used in
course modules.

---

## House style — match this closely

Read `src/content/modules/ai-security/02-prompt-injection.mdx` before writing
anything. The voice is consistent and deliberate:

- **Rungs 2–3, not rung 1.** Applied and analytical, not definitional. Assume the
  reader can look up a definition; teach them what it means in practice.
- **State the uncomfortable thing plainly.** "There is no known prompt-level
  defence that reliably stops prompt injection" — not hedged into uselessness.
- **Pair attack with telemetry.** For any technique, say what it leaves behind:
  the event ID, the field, the log source. This pairing is the spine of the whole
  platform.
- **Name the trap.** Where a plausible-sounding answer is wrong, say so explicitly.
- **British English.** Analyse, behaviour, prioritise, defence.
- **No filler.** No "in today's evolving threat landscape". No adjectives that
  cannot be checked.
- **Quiz `why` fields teach.** They should explain the reasoning and why the
  distractors are wrong, not restate the correct option.
- **ASCII only in prose.** Em dashes and accented words in proper nouns are fine;
  homoglyphs and stray non-Latin characters are not — they have crept in before.

---

## Workflow

```bash
npm run dev      # localhost:4321, hot reload
npm run build    # MUST pass before committing — catches schema errors
npm run deploy   # manual deploy, bypassing Actions (rarely needed)
```

**To ship:**

```bash
npm run build && git add -A && git commit -m "..." && git push
```

The push triggers GitHub Actions, which builds and deploys. Live in ~35 seconds.

### Rules

1. **Always run `npm run build` before committing.** Content collection schema
   errors only surface at build time, and a broken build blocks the deploy.
2. **Never commit `dist/` or `node_modules/`.** Both are gitignored.
3. **Never touch `wrangler.toml`'s `database_id`** — it is a live resource id.
4. **Do not add `functions/`.** This is a Worker, not Pages; that directory is
   never read. API routes go in `src/worker.ts`.
5. **Do not reconnect the repo to Cloudflare's dashboard build system.** Two
   deploy paths racing is what broke the original deployment.
6. **Don't run `npm audit fix --force`.** The reported vulnerabilities are in the
   build toolchain, nothing ships to the site, and the upgrade breaks the build.

---

## Reference docs in this repo

- `docs/deployment.md` — deployment architecture, setup and troubleshooting
- `docs/track-6.md` — Track 6 authoring guide and component reference
- `README.md` — project overview

---

## What good output looks like

A completed module is roughly 800–1,500 words of rung 2–3 prose, one or two
`<Callout>` blocks, a `<Lab>` where hands-on work applies, and a `<Quiz>` of 5–7
questions with teaching `why` fields. It should be able to answer: *what would an
interviewer ask about this, and does this module prepare that answer?*
