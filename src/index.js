import { isAuthorizedAdmin } from "./lib/admin-auth.js";
import { error, handleOptions, json } from "./lib/response.js";
import { parseCreateNotePayload, parseListParams } from "./lib/validation.js";

function formatDateTime(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  return formatter.format(date).replace(" ", " ");
}

function buildNoteId() {
  return `note-${Date.now()}-${crypto.randomUUID()}`;
}

function mapNote(row = {}) {
  return {
    id: row.id,
    author: row.author,
    avatarUrl: row.avatar_url || "",
    content: row.content,
    createdAt: row.created_at,
    timestamp: row.created_ts
  };
}

async function hashIp(request, env) {
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) {
    return null;
  }

  const salt = String(env.IP_SALT || "");
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function listNotes(request, env) {
  const url = new URL(request.url);
  const { limit, cursor } = parseListParams(url.searchParams);
  const bindings = [];
  let sql = "SELECT id, author, avatar_url, content, created_at, created_ts FROM notes WHERE status = 'published'";

  if (cursor != null) {
    sql += " AND created_ts < ?";
    bindings.push(cursor);
  }

  sql += " ORDER BY created_ts DESC LIMIT ?";
  bindings.push(limit);

  const statement = bindings.length ? env.DB.prepare(sql).bind(...bindings) : env.DB.prepare(sql);
  const result = await statement.all();
  const rows = Array.isArray(result.results) ? result.results : [];
  const items = rows.map(mapNote);

  return json({
    success: true,
    data: {
      items,
      nextCursor: rows.length === limit ? String(rows[rows.length - 1].created_ts) : null
    }
  });
}

async function createNote(request, env) {
  const payload = parseCreateNotePayload(await request.json());
  const now = new Date();
  const note = {
    id: buildNoteId(),
    author: payload.author,
    avatarUrl: payload.avatarUrl,
    content: payload.content,
    createdAt: formatDateTime(now),
    timestamp: now.getTime()
  };
  const ipHash = await hashIp(request, env);
  const userAgent = String(request.headers.get("User-Agent") || "").slice(0, 500);

  await env.DB.prepare(
    "INSERT INTO notes (id, author, avatar_url, content, status, created_at, created_ts, client_request_id, ip_hash, ua) VALUES (?, ?, ?, ?, 'published', ?, ?, ?, ?, ?)"
  )
    .bind(
      note.id,
      note.author,
      note.avatarUrl,
      note.content,
      note.createdAt,
      note.timestamp,
      payload.clientRequestId || null,
      ipHash,
      userAgent
    )
    .run();

  return json({
    success: true,
    data: note
  }, { status: 201 });
}

async function deleteNote(request, env, noteId) {
  if (!isAuthorizedAdmin(request, env)) {
    return error(401, "未授权的管理员请求");
  }

  const deletedAt = formatDateTime(new Date());
  const operator = "admin";
  const updateResult = await env.DB.prepare(
    "UPDATE notes SET status = 'deleted', deleted_at = ?, deleted_reason = ? WHERE id = ? AND status = 'published'"
  ).bind(deletedAt, "admin_delete", noteId).run();

  if (!updateResult.meta || !updateResult.meta.changes) {
    return error(404, "留言不存在或已删除");
  }

  await env.DB.prepare(
    "INSERT INTO note_admin_logs (note_id, action, operator, reason, created_at) VALUES (?, 'delete', ?, ?, ?)"
  ).bind(noteId, operator, "admin_delete", deletedAt).run();

  return json({
    success: true
  });
}

function getPathname(request) {
  return new URL(request.url).pathname.replace(/\/$/, "") || "/";
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return handleOptions();
    }

    const pathname = getPathname(request);

    try {
      if (request.method === "GET" && pathname === "/api/health") {
        return json({
          success: true,
          service: "love-timer-wall-api"
        });
      }

      if (request.method === "GET" && pathname === "/api/notes") {
        return await listNotes(request, env);
      }

      if (request.method === "POST" && pathname === "/api/notes") {
        return await createNote(request, env);
      }

      const adminMatch = pathname.match(/^\/api\/admin\/notes\/([^/]+)$/);
      if (request.method === "DELETE" && adminMatch) {
        return await deleteNote(request, env, decodeURIComponent(adminMatch[1]));
      }

      return error(404, "接口不存在");
    } catch (err) {
      if (err instanceof SyntaxError) {
        return error(400, "请求体不是有效的 JSON");
      }

      return error(400, err && err.message ? err.message : "请求处理失败");
    }
  }
};
