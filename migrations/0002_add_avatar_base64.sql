ALTER TABLE notes ADD COLUMN avatar_base64 TEXT NOT NULL DEFAULT '';

UPDATE notes
SET avatar_base64 = avatar_url
WHERE avatar_base64 = '' AND avatar_url LIKE 'data:image/%';
