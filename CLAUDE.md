# Project notes for Claude Code agents

- The WeChat mini program frontend is developed on the `miniprogram-fresh-ui` branch. Key files are under `pages/`, `utils/`, `config/`, and the upload script is `scripts/upload.js`.
- The Cloudflare Worker + D1 backend is developed on the separate `cloudflare-d1-worker-only` branch. Worker entry is `src/index.js`, validation lives in `src/lib/validation.js`, migrations live in `migrations/`, and deployment config is `wrangler.jsonc`.
- Do not assume Worker files exist on the frontend branch. Inspect or edit the Worker branch explicitly when API, D1, R2, migration, or Worker deployment behavior is involved.
- The note wall API is server-backed. Frontend calls go through `utils/note-service.js` and `utils/api.js`, using `config/service.js` for the API base URL.
- Avatar design direction: WeChat `wxfile://tmp_` paths are temporary only. Do not persist them as avatars. Do not add base64 avatar payloads. Store durable avatar files through the Worker/R2 flow and persist stable avatar URLs with each note/reply so historical comments keep the avatar used when they were created.
