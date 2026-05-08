ALTER TABLE notes ADD COLUMN city TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS note_likes (
  note_id TEXT NOT NULL,
  client_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_ts INTEGER NOT NULL,
  PRIMARY KEY (note_id, client_hash)
);

CREATE INDEX IF NOT EXISTS idx_note_likes_note_id
ON note_likes(note_id);

CREATE TABLE IF NOT EXISTS note_replies (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  author TEXT NOT NULL,
  avatar_url TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL,
  created_ts INTEGER NOT NULL,
  ip_hash TEXT,
  ua TEXT
);

CREATE INDEX IF NOT EXISTS idx_note_replies_note_created_ts
ON note_replies(note_id, status, created_ts ASC);
