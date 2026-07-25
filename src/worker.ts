/**
 * Cloudflare Worker entry point.
 *
 * Replaces the old `functions/api/progress.ts` Pages Function. Workers with
 * static assets do not read the `functions/` directory at all — that convention
 * is Pages-only — so the sync endpoint has to live in a fetch handler and
 * everything else falls through to the asset binding.
 */

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

const MAX_BODY = 512 * 1024; // A generous ceiling for a progress blob.

/**
 * Every collection the client stores. Each is a map of id -> record carrying an
 * `at` timestamp, so all of them merge by the same last-write-wins rule.
 * Anything missing here would be merged by whole-object overwrite instead,
 * which lets a stale device silently erase a newer one's data.
 */
const STAMPED_COLLECTIONS = [
  'answers',
  'visited',
  'notes',
  'tasks',
  'attempts',
  'evidence',
  'applications',
  'stories',
] as const;

async function keyHash(key: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function reject(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

async function identify(request: Request): Promise<string | null> {
  const key = request.headers.get('x-sync-key');
  // Short keys are trivially guessable and this endpoint is public.
  if (!key || key.length < 12) return null;
  return keyHash(key);
}

/** Same last-write-wins rule as the client, applied per record rather than per blob. */
function mergeState(a: any, b: any) {
  const out = { ...a, ...b };
  for (const field of STAMPED_COLLECTIONS) {
    out[field] = { ...(a?.[field] ?? {}) };
    for (const [k, v] of Object.entries<any>(b?.[field] ?? {})) {
      const prev = out[field][k];
      const stamp = (x: any) => (typeof x === 'number' ? x : (x?.at ?? 0));
      if (!prev || stamp(v) > stamp(prev)) out[field][k] = v;
    }
  }
  return out;
}

async function handleGet(request: Request, env: Env): Promise<Response> {
  const id = await identify(request);
  if (!id) return reject(401, 'Provide a sync key of at least 12 characters.');

  const row = await env.DB.prepare('SELECT payload FROM progress WHERE id = ?')
    .bind(id)
    .first<{ payload: string }>();

  return Response.json(row ? JSON.parse(row.payload) : {}, {
    headers: { 'cache-control': 'no-store' },
  });
}

async function handlePost(request: Request, env: Env): Promise<Response> {
  const id = await identify(request);
  if (!id) return reject(401, 'Provide a sync key of at least 12 characters.');

  const body = await request.text();
  if (body.length > MAX_BODY) return reject(413, 'Progress payload too large.');

  let incoming: Record<string, any>;
  try {
    incoming = JSON.parse(body);
  } catch {
    return reject(400, 'Body must be JSON.');
  }

  // Merge server-side too. Two devices can push concurrently, and whichever
  // lands second must not erase what the first one added.
  const existing = await env.DB.prepare('SELECT payload FROM progress WHERE id = ?')
    .bind(id)
    .first<{ payload: string }>();

  const merged = existing ? mergeState(JSON.parse(existing.payload), incoming) : incoming;

  await env.DB.prepare(
    `INSERT INTO progress (id, payload, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
  )
    .bind(id, JSON.stringify(merged), Date.now())
    .run();

  return Response.json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/progress') {
      // A missing binding is the most likely misconfiguration, and the default
      // failure is an opaque 500. Say what is actually wrong instead.
      if (!env.DB) {
        return reject(
          503,
          'D1 binding "DB" is not configured on this deployment. Check database_id in wrangler.toml.',
        );
      }
      if (request.method === 'GET') return handleGet(request, env);
      if (request.method === 'POST') return handlePost(request, env);
      return reject(405, 'Method not allowed.');
    }

    // Everything else is the statically built Astro site.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
