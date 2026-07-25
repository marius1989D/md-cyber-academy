/**
 * Progress store.
 *
 * Local-first: every answer lands in localStorage synchronously so the app
 * works offline and never blocks on the network. Sync to D1 is an additive
 * merge on top, keyed per-answer with a timestamp, so answering on the phone
 * and on the Mac in the same session cannot clobber each other — only a
 * genuine re-answer of the same question wins, and the later one takes it.
 */

const KEY = 'md-cyber-state-v2';
const SYNC_KEY = 'md-cyber-sync-key';

export interface Answer {
  /** Letter the user picked, e.g. "B". */
  picked: string;
  correct: boolean;
  /** Epoch ms — the merge tiebreaker. */
  at: number;
  /** Leitner box 1–5 for spaced repetition. Wrong answers reset to 1. */
  box: number;
  /** Epoch ms when this question is next due for review. */
  due: number;
  /**
   * Denormalised copy of the question, written on first answer.
   *
   * Questions live inside MDX as component props, so there is no build-time
   * index to query. Caching them here is what lets the review deck work
   * entirely offline instead of fetching every module a card comes from.
   */
  card?: { q: string; opts: string[]; a: number; why: string; mid: string; title: string };
}

/** A tickable item: a lab task, a reading, a gate condition. */
export interface Task {
  done: boolean;
  at: number;
}

/** A produced artifact — the thing that becomes a CV bullet. */
export interface Evidence {
  id: string;
  step: string;
  title: string;
  url: string;
  note: string;
  at: number;
}

/** One row of the job-application tracker. */
export interface Application {
  id: string;
  company: string;
  role: string;
  applied: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'ghosted';
  note: string;
  at: number;
}

/** A self-graded free-text answer — scenario cards and query challenges. */
export interface Attempt {
  text: string;
  /** Self-rating after seeing the model answer: 0 missed, 1 partial, 2 solid. */
  grade: 0 | 1 | 2 | null;
  at: number;
}

export interface State {
  answers: Record<string, Answer>;
  /** moduleId -> epoch ms last opened. */
  visited: Record<string, number>;
  notes: Record<string, { text: string; at: number }>;
  lastModule: string | null;
  theme: 'day' | 'night' | 'auto';

  /* ── Track 6 ─────────────────────────────────────────────────────── */
  /** taskId -> completion. Keyed `stepId::group::index`. */
  tasks: Record<string, Task>;
  /** Free-text attempts at scenarios and query challenges. */
  attempts: Record<string, Attempt>;
  evidence: Record<string, Evidence>;
  applications: Record<string, Application>;
  /** STAR interview stories, keyed by prompt id. */
  stories: Record<string, { text: string; at: number }>;
}

const EMPTY: State = {
  answers: {},
  visited: {},
  notes: {},
  lastModule: null,
  theme: 'auto',
  tasks: {},
  attempts: {},
  evidence: {},
  applications: {},
  stories: {},
};

/** Leitner intervals in days, indexed by box 1–5. */
const INTERVALS = [0, 1, 3, 7, 21, 60];

export function load(): State {
  if (typeof localStorage === 'undefined') return structuredClone(EMPTY);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY);
    return { ...structuredClone(EMPTY), ...JSON.parse(raw) };
  } catch {
    return structuredClone(EMPTY);
  }
}

export function save(state: State): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Private browsing or quota — the session still works, it just won't persist. */
  }
  queueSync();
}

/** Record an answer and schedule its next review. */
export function recordAnswer(
  qid: string,
  picked: string,
  correct: boolean,
  card?: Answer['card'],
): State {
  const state = load();
  const prev = state.answers[qid];
  const box = correct ? Math.min((prev?.box ?? 0) + 1, 5) : 1;
  const now = Date.now();
  state.answers[qid] = {
    picked,
    correct,
    at: now,
    box,
    due: now + INTERVALS[box] * 86_400_000,
    card: card ?? prev?.card,
  };
  save(state);
  return state;
}

export function markVisited(moduleId: string): void {
  const state = load();
  state.visited[moduleId] = Date.now();
  state.lastModule = moduleId;
  save(state);
}

export function saveNote(moduleId: string, text: string): void {
  const state = load();
  if (text.trim()) state.notes[moduleId] = { text, at: Date.now() };
  else delete state.notes[moduleId];
  save(state);
}

/** Questions whose review date has passed, hardest boxes first. */
export function dueForReview(state = load()): string[] {
  const now = Date.now();
  return Object.entries(state.answers)
    .filter(([, a]) => a.due <= now)
    .sort((a, b) => a[1].box - b[1].box || a[1].due - b[1].due)
    .map(([qid]) => qid);
}

/** Per-module tally used by progress rings and the dashboard. */
export function moduleScore(moduleId: string, state = load()) {
  const entries = Object.entries(state.answers).filter(([qid]) =>
    qid.startsWith(moduleId + '::'),
  );
  const correct = entries.filter(([, a]) => a.correct).length;
  return { answered: entries.length, correct };
}

/* ── Merge ──────────────────────────────────────────────────────────── */

export function merge(local: State, remote: Partial<State>): State {
  const out: State = structuredClone(local);

  for (const [qid, r] of Object.entries(remote.answers ?? {})) {
    const l = out.answers[qid];
    if (!l || r.at > l.at) out.answers[qid] = r;
  }
  for (const [mid, at] of Object.entries(remote.visited ?? {})) {
    if (!out.visited[mid] || at > out.visited[mid]) out.visited[mid] = at;
  }
  for (const [mid, n] of Object.entries(remote.notes ?? {})) {
    const l = out.notes[mid];
    if (!l || n.at > l.at) out.notes[mid] = n;
  }

  /* Track collections all use the same last-write-wins rule on `at`. */
  const stamped = ['tasks', 'attempts', 'evidence', 'applications', 'stories'] as const;
  for (const key of stamped) {
    const src = (remote[key] ?? {}) as Record<string, { at: number }>;
    const dst = out[key] as Record<string, { at: number }>;
    for (const [id, r] of Object.entries(src)) {
      if (!dst[id] || r.at > dst[id].at) dst[id] = r as never;
    }
  }
  return out;
}

/* ── Sync ───────────────────────────────────────────────────────────── */

export function getSyncKey(): string | null {
  try {
    return localStorage.getItem(SYNC_KEY);
  } catch {
    return null;
  }
}

export function setSyncKey(key: string): void {
  localStorage.setItem(SYNC_KEY, key.trim());
}

let timer: ReturnType<typeof setTimeout> | null = null;

/** Debounced push. Answering five questions in a row costs one request. */
function queueSync(): void {
  if (!getSyncKey() || typeof fetch === 'undefined') return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void push(), 2500);
}

export async function push(): Promise<boolean> {
  const key = getSyncKey();
  if (!key) return false;
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-sync-key': key },
      body: JSON.stringify(load()),
    });
    return res.ok;
  } catch {
    return false; /* Offline. The next write will retry. */
  }
}

export async function pull(): Promise<boolean> {
  const key = getSyncKey();
  if (!key) return false;
  try {
    const res = await fetch('/api/progress', { headers: { 'x-sync-key': key } });
    if (!res.ok) return false;
    const remote = (await res.json()) as Partial<State>;
    const merged = merge(load(), remote);
    localStorage.setItem(KEY, JSON.stringify(merged));
    return true;
  } catch {
    return false;
  }
}

/** Full round trip: pull remote, merge, push the union back. */
export async function syncNow(): Promise<boolean> {
  const ok = await pull();
  if (ok) await push();
  return ok;
}

export function exportJSON(): string {
  return JSON.stringify(load(), null, 2);
}

export function importJSON(raw: string): boolean {
  try {
    const merged = merge(load(), JSON.parse(raw));
    localStorage.setItem(KEY, JSON.stringify(merged));
    return true;
  } catch {
    return false;
  }
}
