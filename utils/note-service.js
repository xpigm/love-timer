const api = require("./api");
const serviceConfig = require("../config/service");
const storage = require("./storage");

function isCloudEnabled() {
  return Boolean(serviceConfig.notesApiBaseUrl);
}

function normalizeReply(reply = {}) {
  return {
    id: String(reply.id || ""),
    noteId: String(reply.noteId || ""),
    author: String(reply.author || "匿名"),
    avatarUrl: String(reply.avatarUrl || ""),
    content: String(reply.content || ""),
    city: String(reply.city || ""),
    createdAt: String(reply.createdAt || ""),
    timestamp: Number(reply.timestamp || 0)
  };
}

function normalizeNote(note = {}) {
  return {
    id: String(note.id || ""),
    author: String(note.author || "匿名"),
    avatarUrl: String(note.avatarUrl || ""),
    content: String(note.content || ""),
    city: String(note.city || ""),
    createdAt: String(note.createdAt || ""),
    timestamp: Number(note.timestamp || 0),
    likesCount: Number(note.likesCount || 0),
    likedByMe: Boolean(note.likedByMe),
    replies: (Array.isArray(note.replies) ? note.replies : []).map(normalizeReply)
  };
}

function normalizeNotes(notes) {
  return (Array.isArray(notes) ? notes : []).map(normalizeNote);
}

function buildClientHeaders() {
  return {
    "X-Client-Id": storage.getClientId()
  };
}

async function fetchNotes() {
  if (!isCloudEnabled()) {
    throw new Error("未配置留言服务地址");
  }

  const response = await api.request({
    path: "/api/notes",
    method: "GET",
    headers: buildClientHeaders()
  });
  return normalizeNotes(response && response.data ? response.data.items : []);
}

async function createNote(payload = {}) {
  const trimmedPayload = {
    author: String(payload.author || "").trim(),
    avatarUrl: String(payload.avatarUrl || "").trim(),
    content: String(payload.content || "").trim()
  };

  if (!isCloudEnabled()) {
    throw new Error("未配置留言服务地址");
  }

  const response = await api.request({
    path: "/api/notes",
    method: "POST",
    data: trimmedPayload,
    headers: buildClientHeaders()
  });
  return normalizeNote(response && response.data ? response.data : {});
}

async function toggleLike(noteId) {
  if (!isCloudEnabled()) {
    throw new Error("未配置留言服务地址");
  }

  const response = await api.request({
    path: `/api/notes/${encodeURIComponent(noteId)}/like`,
    method: "POST",
    headers: buildClientHeaders()
  });

  return response && response.data ? response.data : {};
}

async function createReply(noteId, payload = {}) {
  const trimmedPayload = {
    author: String(payload.author || "").trim(),
    avatarUrl: String(payload.avatarUrl || "").trim(),
    content: String(payload.content || "").trim()
  };

  if (!isCloudEnabled()) {
    throw new Error("未配置留言服务地址");
  }

  const response = await api.request({
    path: `/api/notes/${encodeURIComponent(noteId)}/replies`,
    method: "POST",
    data: trimmedPayload,
    headers: buildClientHeaders()
  });

  return normalizeReply(response && response.data ? response.data : {});
}

async function uploadAvatar(filePath) {
  if (!isCloudEnabled()) {
    throw new Error("未配置留言服务地址");
  }

  const response = await api.uploadFile({
    path: "/api/profile/avatar",
    filePath,
    headers: buildClientHeaders()
  });

  return response && response.data ? response.data : {};
}

module.exports = {
  fetchNotes,
  createNote,
  toggleLike,
  createReply,
  uploadAvatar,
  isCloudEnabled
};
