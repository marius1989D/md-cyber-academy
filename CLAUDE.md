# MD Cyber Academy — Claude Code working brief

You are working in Claude Code on a self-built cyber security study platform:
Astro 5 + MDX static site, deployed as a Cloudflare Worker with D1-backed
cross-device progress sync.

**Your standing job:** turn the five empty courses into complete, basic-to-advanced
learning material, backed by reliable primary sources, matching the voice and depth
of the AI Security course (the reference). One course at a time, in the order below.

**Owner:** Marius Dumitru — UK, CEH v13 held, SecAI+ in progress, career-changing
into a Tier 1 SOC role from injection moulding. The site is both a study tool and
portfolio evidence, so accuracy and credible sourcing are not optional.

**Live:** https://md-cyber-academy.creion-m.workers.dev

---

## ⛔ DO NOT TOUCH

These are separate, finished, or load-bearing. Leave them exactly as they are.

**The career campaign (a separate body of work — do not read from, write to, or refactor it):**
- `src/content/track/**` — Track 6, 38 steps across 9 phases. **Complete.** Do not
  add, edit, reorder, or "improve" steps.
- `src/components/track/**` — track-only components. Never import these into course
  modules, never modify them.
- `docs/track-6.md` — its authoring guide.
- The `track` collection schema in `content.config.ts`. The `modules` and `track`
  collections have deliberately different schemas. **Do not merge them.**

**Infrastructure (breaking any of these breaks the live deploy):**
- `wrangler.toml`'s `database_id` — a live D1 resource id. Never change it.
- Do **not** add a `functions/` directory. This is a Worker, not Pages; API routes
  live in `src/worker.ts`.
- Do **not** reconnect the repo to Cloudflare's dashboard build system. Two deploy
  paths racing broke the original deployment.
- Do **not** run `npm audit fix --force`. The flagged issues are build-toolchain
  only; nothing ships to the site, and the upgrade breaks the build.
- Never commit `dist/` or `node_modules/`.

If a task seems to require touching anything above, stop and ask first.

---

## The mission

Six courses are defined in `src/content.config.ts`. Only one has content.

| Course id | Name | Modules written |
|---|---|---|
| `ceh` | CEH v13 Full Certification Prep | 0 (21 planned, M0–M20) |
| `network` | Network Security Fundamentals | 0 |
| `ai-security` | AI Security & LLM Red Teaming | **5 — the reference** |
| `detection` | Detection Engineering & SOAR | 0 |
| `secai` | CompTIA SecAI+ (CY0-001) | 0 |
| `forensics` | Incident Response & Forensics | 0 |

Writing the missing modules is the whole job. Everything else is built.

---

## Done and working — do not re-architect

- Astro 5 + MDX, static output, deployed as a Worker (`src/worker.ts`) serving
  static assets, with `/api/progress` backed by D1.
- GitHub Actions deploys on every push to `main` (`.github/workflows/deploy.yml`).
- Pagefind search, PWA manifest, service worker.
- **Progress store** — localStorage, local-first, with D1 sync via a shared key.
- **`/dashboard`** — stats, per-course progress, sync-key UI, and JSON
  export/import backup (import is a *merge*, not a replace).
- **`/review`** — spaced-repetition deck (Leitner boxes, due-scheduling).
  ⚠️ **Coupling to respect:** review works only because `Quiz.astro` caches a
  denormalised card payload `{q, opts, a, why, title}` into localStorage on first
  answer. If you refactor how the quiz writes to storage, you can break review
  **silently** — there is no build-time error for this. Leave that write intact.

---

## New requirement 1 — basic to advanced

The platform now spans the full range, not just analytical depth. This is a change
from the previous "rungs 2–3 only" guidance.

- **Each course is a self-contained ladder from basic to advanced.** Early modules
  lay foundations (rung 1–2); later modules reach analysis and lab work (rung 3–4).
  The `order` field sets the sequence; the `rung` field must honestly reflect depth.
- **Foundations are welcome and necessary.** A reader coming in cold needs the
  on-ramp. Do not assume prior knowledge that the course has not yet taught.
- **But the voice stays applied even when the content is basic.** A foundational
  module explains a concept the way a practitioner *uses* it — with a concrete
  example and, where relevant, what it looks like in a log or on the wire — not as
  a lifeless textbook definition. Basic ≠ shallow. Teach the thing, then show it.
- A finished course should let someone start from zero and arrive competent.

---

## New requirement 2 — reliable sources

Every module must be backed by authoritative primary sources. This is what makes
the platform credible as portfolio evidence and safe to study from.

**What counts as a reliable source (prefer these):**
- Frameworks & mappings: MITRE ATT&CK, MITRE ATLAS, MITRE D3FEND, NIST (CSF, AI
  RMF, SP 800-series), OWASP (LLM Top 10, Testing Guide, ASVS), CIS Controls.
- Networking & identity: IETF RFCs, Microsoft Learn (AD, Kerberos, Entra),
  Cisco/vendor documentation.
- Detection & SOC: SigmaHQ, Microsoft Sentinel / Defender docs, Elastic detection
  rules, Splunk docs, official Windows Event ID references (Microsoft Learn).
- Forensics & IR: NIST SP 800-61, SWGDE, Volatility docs, official artefact docs.
- Offensive & vulns: official tool docs (nmap, Metasploit, Burp), NVD/CVE records,
  vendor advisories.
- AI security: OWASP LLM Top 10, MITRE ATLAS, NIST AI RMF, the EU AI Act text,
  peer-reviewed or published papers (prefer published over preprint where possible).

**Not acceptable as authority:** SEO listicles, content farms, undated blogs,
other AI-generated summaries, forum posts. A forum or blog can be a *pointer*, never
the citation a claim rests on.

**The hard rules:**
1. **Never fabricate a citation.** If you have web access, verify every URL resolves
   and that the cited fact is actually on that page. If you cannot verify a source
   for a claim, do not invent one — write `<!-- TODO: source -->` at that point and
   list it in your end-of-task summary. A missing source flagged honestly is fine;
   a plausible-looking fake is a serious failure.
2. **Verify checkable specifics against a source before stating them as fact.**
   ATT&CK IDs, Windows Event IDs, RFC numbers, CVE IDs, port numbers, tool flags,
   protocol fields — these are exactly where errors and hallucinations hide, and
   exactly the "facts that can be checked" the house style demands. Do not write
   them from memory; confirm them.
3. **Cite the specific artifact, not a homepage.** Link the exact ATT&CK technique
   page, the exact RFC, the exact Microsoft Learn article — not `mitre.org`.

**How to record sources:** end every module with a `## Sources` section — a short
list of the primary sources actually used, each with a one-line note on what it
backs up. Example:

```markdown
## Sources

- [MITRE ATT&CK T1558.003 — Kerberoasting](https://attack.mitre.org/techniques/T1558/003/) — technique detail and detection guidance
- [RFC 4120 — The Kerberos Network Authentication Service (V5)](https://datatracker.ietf.org/doc/html/rfc4120) — TGS-REQ/TGS-REP exchange
- [Microsoft Learn — Event 4769](https://learn.microsoft.com/...) — the TGS-request event and the RC4 (0x17) tell
```

(Optional, only if the owner asks: a `sources` frontmatter array can be added, but
that needs a one-line addition to the Zod schema in `content.config.ts`. Default to
the body section, which needs no schema change.)

**Retrofit:** the five existing `ai-security` modules predate this rule and have no
`## Sources` section. Bring them up to standard — add verified sources to each — so
the reference actually matches the bar it sets. Do this before or alongside the
first new course.

---

## Content model

Modules live at `src/content/modules/<course>/NN-slug.mdx`. The cross-link `id` is
the path minus extension: `src/content/modules/network/02-active-directory.mdx` has
id `network/02-active-directory`.

### Frontmatter

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
# published: false           # optional — gates a draft out of the build
---
```

### Components (course modules only)

```jsx
import Quiz from '../../../components/Quiz.astro';
import Callout from '../../../components/Callout.astro';
import Lab from '../../../components/Lab.astro';
```

- `<Callout type="key|warn|detect">` — pull-out for a load-bearing point.
- `<Lab title host minutes>` — hands-on block. **Every lab ends with a bold
  `**Evidence of completion:**` line** stating what artifact counts as done. That
  line is what makes a lab a deliverable rather than a suggestion — keep it.
- `<Quiz mid="course/NN-slug" title="..." questions={[...]} />` — `mid` must equal
  the module id, and each question needs a `why` that *teaches*: explain the
  reasoning and why the distractors are wrong, not just name the answer.

Track-only components (`src/components/track/`) must never appear in course modules.

---

## House style — match `ai-security/02-prompt-injection.mdx` closely

Read that file before writing anything.

- **Ladder the depth, keep the voice applied.** Foundational where the course needs
  it (see requirement 1), but concrete throughout — teach what a thing *means in
  practice*, not just what it is.
- **State the uncomfortable thing plainly.** "There is no known prompt-level defence
  that reliably stops prompt injection." Don't hedge a true point into uselessness.
- **Pair attack with telemetry.** For any technique, say what it leaves behind — the
  event ID, the field, the log source. This pairing is the spine of the platform.
- **Name the trap.** Where a plausible answer is wrong, say so explicitly.
- **British English.** Analyse, behaviour, prioritise, defence.
- **No filler.** No "in today's evolving threat landscape". No adjective that can't
  be checked.
- **ASCII only in prose.** Em dashes and accented proper nouns are fine; homoglyphs
  and stray non-Latin characters are not — they have crept in before.

---

## Definition of done (per module)

A module is finished when all of these are true:

- 800–1,500 words of laddered, applied prose in the house voice.
- One or two `<Callout>` blocks on the load-bearing points.
- A `<Lab>` where hands-on work applies, ending in `**Evidence of completion:**`.
- A `<Quiz>` of 5–7 questions, every `why` teaching the reasoning.
- Correct frontmatter; `rung` honestly reflects the depth reached.
- Every checkable specific (ATT&CK/event/RFC/CVE ids, flags, ports) verified.
- A `## Sources` section listing the verified primary sources used.
- `npm run build` passes.
- It can answer: *what would an interviewer ask about this, and does this module
  prepare that answer?*

---

## Source material for the migration

The original single-file app, `md-cyber-academy-final.html`, holds 300+ questions
from v1 (each `submit()` handler carries the answer index and its explanation). Use
it for **topic coverage and raw Q&A to elevate**, never to port verbatim: that
content is rung-1 recall, which this platform explicitly moves beyond. Treat it as a
syllabus hint and a question seed — then rewrite to rung 2–3 depth, pair with
telemetry, and back with real sources. The AI Security course is the depth bar.

---

## Priority queue — work top to bottom

Track 6 steps cross-link to course modules via `academy:` frontmatter, filtered so
missing modules disappear silently. **Writing the linked ones first lights up
existing links**, so they lead each course. Ladder each course basic → advanced via
`order`.

**Do first: retrofit `## Sources` into the 5 `ai-security` modules.**

Then, in order:

1. **`network`** (foundational, unblocks the most). Track-6-linked, write first:
   `network/01-protocols`, `network/02-active-directory`,
   `network/03-cloud-identity`, `network/04-traffic-analysis`.
2. **`detection`** (largest, best-aligned with the portfolio direction):
   `01-detection-fundamentals`, `02-attack-mapping`, `03-log-pipelines`,
   `04-tuning`, `05-behavioural-detection`, `06-correlation`, `07-sentinel`,
   `08-threat-hunting`, `09-xdr`, `10-adversary-emulation`,
   `11-detection-engineering`, `12-sigma`, `13-soar`.
3. **`forensics`** — Track-6-linked first: `forensics/01-incident-response`,
   `forensics/03-malware-analysis`, `forensics/04-windows-artefacts`; then fill the
   gaps (`02`, and onward) into a coherent basic→advanced course.
4. **`ceh`** — Track-6-linked first: `ceh/06-system-hacking`,
   `ceh/09-social-engineering`; then the full M0–M20 ladder.
5. **`secai`** (CY0-001) — map to the exam objectives; can reuse depth from the
   AI Security course without duplicating it.

Do one module per turn unless told otherwise, working down the queue.

---

## Workflow

```bash
npm run dev      # localhost:4321, hot reload
npm run build    # MUST pass before committing — catches schema errors
```

**To ship:**

```bash
npm run build && git add -A && git commit -m "..." && git push
```

The push triggers GitHub Actions; live in ~35 seconds.

**Rules:** always `npm run build` before committing (schema errors only surface at
build time, and a broken build blocks the deploy); never commit `dist/` or
`node_modules/`; obey the ⛔ section without exception.

---

## Known cosmetic backlog (low priority, don't let it block content)

- Desktop home hero has dead space on the right — could hold a "recently updated"
  or coverage widget.
- Mobile bottom-nav icons are slightly cramped.

---

## Reference docs in this repo

- `docs/deployment.md` — deployment architecture, setup, troubleshooting.
- `docs/track-6.md` — Track 6 authoring guide (⛔ read-only context, don't act on it).
- `README.md` — project overview.
