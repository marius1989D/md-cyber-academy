/**
 * Track 6 progress API.
 *
 * Sits on top of the same State object the courses use, so Cloudflare sync,
 * export and import all cover the track without a second mechanism. Nothing
 * here talks to the network — writes go through `save()` and the existing
 * debounced push handles the rest.
 */

import { load, save, type Attempt, type Evidence, type Application } from './store';
import { ROADMAP, type PillarId } from './roadmap';

/* ── Tasks ──────────────────────────────────────────────────────────── */

export function toggleTask(taskId: string, done: boolean): void {
  const state = load();
  state.tasks[taskId] = { done, at: Date.now() };
  save(state);
}

export function isDone(taskId: string): boolean {
  return load().tasks[taskId]?.done === true;
}

/** Completion for every task whose id starts with the given prefix. */
export function taskProgress(prefix: string) {
  const { tasks } = load();
  const entries = Object.entries(tasks).filter(([id]) => id.startsWith(prefix));
  const done = entries.filter(([, t]) => t.done).length;
  return { done, total: entries.length };
}

/* ── Free-text attempts ─────────────────────────────────────────────── */

export function saveAttempt(id: string, text: string, grade: Attempt['grade'] = null): void {
  const state = load();
  state.attempts[id] = { text, grade, at: Date.now() };
  save(state);
}

export function getAttempt(id: string): Attempt | undefined {
  return load().attempts[id];
}

/* ── Evidence log ───────────────────────────────────────────────────── */

export function addEvidence(e: Omit<Evidence, 'id' | 'at'>): Evidence {
  const state = load();
  const item: Evidence = { ...e, id: crypto.randomUUID(), at: Date.now() };
  state.evidence[item.id] = item;
  save(state);
  return item;
}

export function removeEvidence(id: string): void {
  const state = load();
  delete state.evidence[id];
  save(state);
}

export function listEvidence(): Evidence[] {
  return Object.values(load().evidence).sort((a, b) => b.at - a.at);
}

/* ── Application tracker ────────────────────────────────────────────── */

export function addApplication(a: Omit<Application, 'id' | 'at'>): Application {
  const state = load();
  const item: Application = { ...a, id: crypto.randomUUID(), at: Date.now() };
  state.applications[item.id] = item;
  save(state);
  return item;
}

export function updateApplication(id: string, patch: Partial<Application>): void {
  const state = load();
  const prev = state.applications[id];
  if (!prev) return;
  state.applications[id] = { ...prev, ...patch, at: Date.now() };
  save(state);
}

export function removeApplication(id: string): void {
  const state = load();
  delete state.applications[id];
  save(state);
}

export function listApplications(): Application[] {
  return Object.values(load().applications).sort((a, b) => b.at - a.at);
}

/* ── Readiness ──────────────────────────────────────────────────────── */

/**
 * A step counts as complete when every task on its page is ticked. Steps that
 * have no tasks yet count as complete once visited — otherwise reading-only
 * steps would sandbag the gauge forever.
 */
export function stepComplete(stepId: string): boolean {
  const state = load();
  const tasks = Object.entries(state.tasks).filter(([id]) => id.startsWith(stepId + '::'));
  if (tasks.length === 0) return Boolean(state.visited[stepId]);
  return tasks.every(([, t]) => t.done);
}

/** Percentage complete per readiness pillar, for the dashboard gauges. */
export function readiness(): Record<PillarId, { done: number; total: number; pct: number }> {
  const out = {} as Record<PillarId, { done: number; total: number; pct: number }>;
  for (const step of ROADMAP) {
    const p = (out[step.pillar] ??= { done: 0, total: 0, pct: 0 });
    p.total += 1;
    if (stepComplete(step.id)) p.done += 1;
  }
  for (const p of Object.values(out)) {
    p.pct = p.total === 0 ? 0 : Math.round((p.done / p.total) * 100);
  }
  return out;
}

export function overallProgress() {
  const done = ROADMAP.filter((s) => stepComplete(s.id)).length;
  return { done, total: ROADMAP.length, pct: Math.round((done / ROADMAP.length) * 100) };
}

/**
 * Apply-readiness gate. The honest answer to "am I ready to apply hard yet?"
 * Deliberately strict: fundamentals and SIEM near-complete, plus real evidence
 * on the page, because applying early with nothing to show burns the market.
 */
export function readyToApply(): { ready: boolean; blockers: string[] } {
  const r = readiness();
  const blockers: string[] = [];
  if (r.fundamentals.pct < 80) blockers.push('Fundamentals below 80%');
  if (r.siem.pct < 70) blockers.push('SIEM & Query below 70%');
  if (r.triage.pct < 50) blockers.push('Triage below 50%');
  if (listEvidence().length < 3) blockers.push('Fewer than 3 evidence artifacts logged');
  return { ready: blockers.length === 0, blockers };
}
