CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  avatar_url TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL,
  created_ts INTEGER NOT NULL,
  client_request_id TEXT,
  ip_hash TEXT,
  ua TEXT,
  deleted_at TEXT,
  deleted_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_notes_status_created_ts
ON notes(status, created_ts DESC);

CREATE INDEX IF NOT EXISTS idx_notes_created_ts
ON notes(created_ts DESC);

CREATE TABLE IF NOT EXISTS note_admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id TEXT NOT NULL,
  action TEXT NOT NULL,
  operator TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL
);
