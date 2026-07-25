# Track 6 — SOC Analyst: Zero to Hired

A campaign, not a course. Courses are subject libraries you dip into; a track is
a sequenced programme with gates, costs and a finish line (an offer). It lives in
its own content collection so neither schema has to compromise.

## Where things are

```
src/lib/roadmap.ts              Phases, pillars, and the full 38-step map
src/lib/track-store.ts          Tasks, attempts, evidence, applications, readiness
src/content/track/<phase>/*.mdx The steps
src/components/track/*.astro    Track-only components
src/pages/track/index.astro     The roadmap
src/pages/track/[...step].astro Step renderer
src/pages/track/evidence.astro  Evidence log + application tracker
```

Track progress rides on the same `State` object the courses use, so Cloudflare
D1 sync, export and import cover it with no second mechanism.

## Adding a step

1. Find it in `ROADMAP` in `src/lib/roadmap.ts`. Every planned step is already
   listed with its brief, week, pillar and cost — unwritten ones render on the
   map greyed out. **The `id` in the roadmap must match the MDX file path**
   relative to `src/content/track/`, minus the extension.
2. Create the MDX file at that path.
3. Frontmatter must satisfy the `track` schema in `src/content.config.ts`.
4. Build. The step lights up on the map automatically.

## Step template

```mdx
---
title: "Step Title"
phase: 2
order: 3
summary: "One line, written as a promise rather than a topic."
weeks: "Weeks 8–9"
minutes: 180
kind: learn          # learn | lab | exam | writing | campaign
pillar: triage       # fundamentals | siem | triage | evidence | interview
cost: 0
prereq: ["02-defensive-core/02-attack-framework"]
academy: ["ceh/06-system-hacking"]   # cross-links into the course library
attack: ["T1110.003"]
tags: ["..."]
updated: 2026-07-24
---

import Why from '../../../components/track/Why.astro';
import TaskList from '../../../components/track/TaskList.astro';
import Resources from '../../../components/track/Resources.astro';
import Scenario from '../../../components/track/Scenario.astro';
import Gate from '../../../components/track/Gate.astro';
import Quiz from '../../../components/Quiz.astro';
```

## The seven blocks

Every step follows the same anatomy. It is what makes the material usable both
at a desk and on a phone during a break.

| Block | Component | Purpose |
|---|---|---|
| 1. Why this matters | `<Why asked="...">` | Hiring consequence, plus the literal interview question |
| 2. Learn | prose | Rungs 2–3: applied and analysis, not definitions |
| 3. Read on the go | `<Resources>` | Mobile links, tagged with format, time and cost |
| 4. Do | `<TaskList>` / `<Lab>` | Named artifacts, not suggestions |
| 5. Test | `<Quiz>` `<Scenario>` `<QueryChallenge>` `<Drill>` | Recall, judgement, syntax, fluency |
| 6. Go deeper | `<Callout>` or prose | Optional advanced rung |
| 7. Gate | `<Gate>` | Self-assessed unlock checklist |

Not every step needs all seven. Every step needs 1, 3 and 7.

## Component reference

**`<Why asked="...">`** — opens the step. Three lines of hiring consequence. If a
step can't justify itself here, it doesn't belong in the track.

**`<Resources items={[...]}>`** — each item takes `title`, `url`, `type`
(`read`/`watch`/`do`/`ref`), and optionally `by`, `minutes`, `cost`, `note`,
`primary`. **State `cost` on anything paid.** Omitting it renders as free, and the
whole track's promise is that only exam fees cost money.

**`<TaskList step="..." group="do" tasks={[{text, detail}]}>`** — persistent
checkboxes. `group` namespaces ids within a step so you can have several lists.

**`<Scenario step id title>`** with `slot="brief"` and `slot="model"` — free-text
triage, then reveal and self-grade. Use for anything multiple choice can't test.
The brief should contain a real artifact: log excerpt, header, process tree.

**`<QueryChallenge step id title lang tables>`** with `slot="brief"` and
`slot="solution"` — write the query, then compare. Always explain the *common
wrong shape* in the solution; that's where the teaching is.

**`<Drill step id question seconds hits trap>`** — timed spoken answer with a
marking scheme. One or two per step maximum.

**`<Gate step conditions unlocks>`** — self-assessed, never enforced. Locking
content just teaches people to route around it.

**`<BlogBrief step number title words publish hook outline>`** — a commissioning
brief. Four exist, at steps 05-lab/01, 05-lab/03, 06-btl1-portfolio/03 and
07-campaign/04.

## Readiness model

`readiness()` scores five pillars. A step counts complete when all its tasks are
ticked; steps with no tasks count once visited. `readyToApply()` is deliberately
strict — fundamentals ≥ 80%, SIEM ≥ 70%, triage ≥ 50%, and at least three logged
evidence artifacts. Applying early with nothing to show burns the market.

## Cost policy

Everything is free to learn. The only unavoidable money is two exam fees:
SC-200 (~£165) and BTL1 (~£399), both in `ROADMAP` with `cost` set. Security+ is
deliberately excluded — CEH already clears the same ATS filter.
