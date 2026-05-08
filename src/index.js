import { isAuthorizedAdmin } from "./lib/admin-auth.js";
import { corsHeaders, error, handleOptions, json } from "./lib/response.js";
import { parseCreateNotePayload, parseCreateReplyPayload, parseListParams } from "./lib/validation.js";

const AVATAR_MAX_BYTES = 512 * 1024;
const AVATAR_CONTENT_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);

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

function buildReplyId() {
  return `reply-${Date.now()}-${crypto.randomUUID()}`;
}

function buildAvatarId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

function mapReply(row = {}) {
  return {
    id: row.id,
    noteId: row.note_id,
    author: row.author,
    avatarUrl: row.avatar_url || "",
    content: row.content,
    city: row.city || "",
    createdAt: row.created_at,
    timestamp: row.created_ts
  };
}

function mapNote(row = {}, replies = []) {
  return {
    id: row.id,
    author: row.author,
    avatarUrl: row.avatar_url || "",
    content: row.content,
    city: row.city || "",
    createdAt: row.created_at,
    timestamp: row.created_ts,
    likesCount: Number(row.likes_count || 0),
    likedByMe: Boolean(row.liked_by_me),
    replies
  };
}

async function hashValue(value, env, scope) {
  const salt = String(env.IP_SALT || "");
  const data = new TextEncoder().encode(`${scope}:${salt}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashIp(request, env) {
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) {
    return null;
  }

  return hashValue(ip, env, "ip");
}

async function getClientHash(request, env, required = false) {
  const clientId = String(request.headers.get("X-Client-Id") || "").trim();
  if (!clientId) {
    if (required) {
      throw new Error("缺少客户端标识");
    }

    return null;
  }

  if (clientId.length > 120) {
    throw new Error("客户端标识过长");
  }

  return hashValue(clientId, env, "client");
}

function getCity(request) {
  return String((request.cf && request.cf.city) || request.headers.get("CF-IPCity") || "").trim().slice(0, 50);
}

function assertAvatarBucket(env) {
  if (!env.AVATARS) {
    throw new Error("头像存储未配置");
  }
}

function buildAvatarUrl(request, key) {
  const url = new URL(request.url);
  return `${url.origin}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function normalizeAvatarContentType(value) {
  const contentType = String(value || "").split(";")[0].trim().toLowerCase();
  return AVATAR_CONTENT_TYPES.has(contentType) ? contentType : "";
}

function inferAvatarContentType(file, bytes) {
  const contentType = normalizeAvatarContentType(file && file.type);
  if (contentType) {
    return contentType;
  }

  const name = String((file && file.name) || "").toLowerCase();
  if (name.endsWith(".png")) {
    return "image/png";
  }

  if (name.endsWith(".webp")) {
    return "image/webp";
  }

  if (name.endsWith(".gif")) {
    return "image/gif";
  }

  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  const signature = new Uint8Array(bytes || new ArrayBuffer(0));
  if (signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff) {
    return "image/jpeg";
  }

  if (signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4e && signature[3] === 0x47) {
    return "image/png";
  }

  if (signature[0] === 0x47 && signature[1] === 0x49 && signature[2] === 0x46) {
    return "image/gif";
  }

  if (signature[0] === 0x52 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x46 && signature[8] === 0x57 && signature[9] === 0x45 && signature[10] === 0x42 && signature[11] === 0x50) {
    return "image/webp";
  }

  return "";
}

async function putAvatarObject(request, env, bytes, contentType) {
  assertAvatarBucket(env);

  if (!bytes || !bytes.byteLength) {
    throw new Error("头像文件为空");
  }

  if (bytes.byteLength > AVATAR_MAX_BYTES) {
    throw new Error("头像文件不能超过 512KB");
  }

  const ext = AVATAR_CONTENT_TYPES.get(contentType);
  if (!ext) {
    throw new Error("头像只支持 JPG、PNG、WebP 或 GIF");
  }

  const key = `a/${buildAvatarId()}.${ext}`;
  await env.AVATARS.put(key, bytes, {
    httpMetadata: {
      contentType
    }
  });

  return {
    avatarKey: key,
    avatarUrl: buildAvatarUrl(request, key)
  };
}

async function uploadAvatar(request, env) {
  await getClientHash(request, env, true);
  const form = await request.formData();
  const file = form.get("file");

  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("缺少头像文件");
  }

  const bytes = await file.arrayBuffer();
  const contentType = inferAvatarContentType(file, bytes);
  if (!contentType) {
    throw new Error("头像只支持 JPG、PNG、WebP 或 GIF");
  }

  const avatar = await putAvatarObject(request, env, bytes, contentType);

  return json({
    success: true,
    data: avatar
  }, { status: 201 });
}

async function getAvatar(request, env, key) {
  assertAvatarBucket(env);

  const object = await env.AVATARS.get(key);
  if (!object) {
    return error(404, "头像不存在");
  }

  const headers = new Headers(corsHeaders);
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);

  return new Response(object.body, {
    headers
  });
}

async function loadReplies(env, noteIds) {
  if (!noteIds.length) {
    return new Map();
  }

  const placeholders = noteIds.map(() => "?").join(", ");
  const result = await env.DB.prepare(
    `SELECT id, note_id, author, avatar_url, content, city, created_at, created_ts
     FROM note_replies
     WHERE status = 'published' AND note_id IN (${placeholders})
     ORDER BY created_ts ASC`
  ).bind(...noteIds).all();
  const rows = Array.isArray(result.results) ? result.results : [];
  const replyMap = new Map();

  rows.forEach((row) => {
    const replies = replyMap.get(row.note_id) || [];
    replies.push(mapReply(row));
    replyMap.set(row.note_id, replies);
  });

  return replyMap;
}

async function listNotes(request, env) {
  const url = new URL(request.url);
  const { limit, cursor } = parseListParams(url.searchParams);
  const clientHash = await getClientHash(request, env);
  const bindings = [];
  let sql = `SELECT id, author, avatar_url, content, city, created_at, created_ts,
    (SELECT COUNT(*) FROM note_likes WHERE note_id = notes.id) AS likes_count`;

  if (clientHash) {
    sql += ", EXISTS(SELECT 1 FROM note_likes WHERE note_id = notes.id AND client_hash = ?) AS liked_by_me";
    bindings.push(clientHash);
  } else {
    sql += ", 0 AS liked_by_me";
  }

  sql += " FROM notes WHERE status = 'published'";

  if (cursor != null) {
    sql += " AND created_ts < ?";
    bindings.push(cursor);
  }

  sql += " ORDER BY created_ts DESC LIMIT ?";
  bindings.push(limit);

  const statement = bindings.length ? env.DB.prepare(sql).bind(...bindings) : env.DB.prepare(sql);
  const result = await statement.all();
  const rows = Array.isArray(result.results) ? result.results : [];
  const replyMap = await loadReplies(env, rows.map((row) => row.id));
  const items = rows.map((row) => mapNote(row, replyMap.get(row.id) || []));

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
    city: getCity(request),
    createdAt: formatDateTime(now),
    timestamp: now.getTime(),
    likesCount: 0,
    likedByMe: false,
    replies: []
  };
  const ipHash = await hashIp(request, env);
  const userAgent = String(request.headers.get("User-Agent") || "").slice(0, 500);

  await env.DB.prepare(
    "INSERT INTO notes (id, author, avatar_url, content, city, status, created_at, created_ts, client_request_id, ip_hash, ua) VALUES (?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?)"
  )
    .bind(
      note.id,
      note.author,
      note.avatarUrl,
      note.content,
      note.city,
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

async function assertPublishedNote(env, noteId) {
  const result = await env.DB.prepare(
    "SELECT id FROM notes WHERE id = ? AND status = 'published'"
  ).bind(noteId).first();

  if (!result) {
    throw new Error("留言不存在或已删除");
  }
}

async function toggleLike(request, env, noteId) {
  await assertPublishedNote(env, noteId);

  const clientHash = await getClientHash(request, env, true);
  const existing = await env.DB.prepare(
    "SELECT note_id FROM note_likes WHERE note_id = ? AND client_hash = ?"
  ).bind(noteId, clientHash).first();
  let likedByMe = false;

  if (existing) {
    await env.DB.prepare(
      "DELETE FROM note_likes WHERE note_id = ? AND client_hash = ?"
    ).bind(noteId, clientHash).run();
  } else {
    const now = new Date();
    await env.DB.prepare(
      "INSERT INTO note_likes (note_id, client_hash, created_at, created_ts) VALUES (?, ?, ?, ?)"
    ).bind(noteId, clientHash, formatDateTime(now), now.getTime()).run();
    likedByMe = true;
  }

  const countRow = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM note_likes WHERE note_id = ?"
  ).bind(noteId).first();

  return json({
    success: true,
    data: {
      likedByMe,
      likesCount: Number(countRow && countRow.count ? countRow.count : 0)
    }
  });
}

async function createReply(request, env, noteId) {
  await assertPublishedNote(env, noteId);

  const payload = parseCreateReplyPayload(await request.json());
  const now = new Date();
  const reply = {
    id: buildReplyId(),
    noteId,
    author: payload.author,
    avatarUrl: payload.avatarUrl,
    content: payload.content,
    city: getCity(request),
    createdAt: formatDateTime(now),
    timestamp: now.getTime()
  };
  const ipHash = await hashIp(request, env);
  const userAgent = String(request.headers.get("User-Agent") || "").slice(0, 500);

  await env.DB.prepare(
    "INSERT INTO note_replies (id, note_id, author, avatar_url, content, city, status, created_at, created_ts, ip_hash, ua) VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?)"
  )
    .bind(
      reply.id,
      reply.noteId,
      reply.author,
      reply.avatarUrl,
      reply.content,
      reply.city,
      reply.createdAt,
      reply.timestamp,
      ipHash,
      userAgent
    )
    .run();

  return json({
    success: true,
    data: reply
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

      if (request.method === "POST" && pathname === "/api/profile/avatar") {
        return await uploadAvatar(request, env);
      }

      const avatarMatch = pathname.match(/^\/a\/([^/]+)$/);
      if (request.method === "GET" && avatarMatch) {
        return await getAvatar(request, env, `a/${decodeURIComponent(avatarMatch[1])}`);
      }

      if (request.method === "GET" && pathname === "/api/notes") {
        return await listNotes(request, env);
      }

      if (request.method === "POST" && pathname === "/api/notes") {
        return await createNote(request, env);
      }

      const likeMatch = pathname.match(/^\/api\/notes\/([^/]+)\/like$/);
      if (request.method === "POST" && likeMatch) {
        return await toggleLike(request, env, decodeURIComponent(likeMatch[1]));
      }

      const replyMatch = pathname.match(/^\/api\/notes\/([^/]+)\/replies$/);
      if (request.method === "POST" && replyMatch) {
        return await createReply(request, env, decodeURIComponent(replyMatch[1]));
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
