CREATE TABLE IF NOT EXISTS progress (
  id         TEXT PRIMARY KEY,   -- SHA-256 of the sync key
  payload    TEXT NOT NULL,      -- JSON state blob
  updated_at INTEGER NOT NULL
);
