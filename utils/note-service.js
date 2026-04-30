const api = require("./api");
const serviceConfig = require("../config/service");

function isCloudEnabled() {
  return Boolean(serviceConfig.notesApiBaseUrl);
}

function normalizeNote(note = {}) {
  return {
    id: String(note.id || ""),
    author: String(note.author || "匿名"),
    avatarUrl: String(note.avatarUrl || ""),
    content: String(note.content || ""),
    createdAt: String(note.createdAt || ""),
    timestamp: Number(note.timestamp || 0)
  };
}

function normalizeNotes(notes) {
  return (Array.isArray(notes) ? notes : []).map(normalizeNote);
}

async function fetchNotes() {
  if (!isCloudEnabled()) {
    throw new Error("未配置留言服务地址");
  }

  const response = await api.request({
    path: "/api/notes",
    method: "GET"
  });
  return normalizeNotes(response && response.data ? response.data.items : []);
}

async function createNote(payload = {}) {
  const trimmedPayload = {
    author: String(payload.author || "").trim(),
    avatarUrl: String(payload.avatarUrl || ""),
    content: String(payload.content || "").trim()
  };

  if (!isCloudEnabled()) {
    throw new Error("未配置留言服务地址");
  }

  const response = await api.request({
    path: "/api/notes",
    method: "POST",
    data: trimmedPayload
  });
  return normalizeNote(response && response.data ? response.data : {});
}

module.exports = {
  fetchNotes,
  createNote,
  isCloudEnabled
};
