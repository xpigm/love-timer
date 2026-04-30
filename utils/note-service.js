const api = require("./api");
const serviceConfig = require("../config/service");
const storage = require("./storage");
const time = require("./time");

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

function buildLocalNote(payload = {}) {
  return {
    id: storage.createId("note"),
    author: payload.author || "匿名",
    avatarUrl: payload.avatarUrl || "",
    content: payload.content || "",
    createdAt: time.formatDateTime(new Date()),
    timestamp: Date.now()
  };
}

async function fetchNotes() {
  if (!isCloudEnabled()) {
    return storage.getNotes();
  }

  try {
    const response = await api.request({
      path: "/api/notes",
      method: "GET"
    });
    const notes = normalizeNotes(response && response.data ? response.data.items : []);
    storage.saveNotes(notes);
    return notes;
  } catch (error) {
    const cachedNotes = storage.getNotes();
    if (cachedNotes.length) {
      return cachedNotes;
    }
    throw error;
  }
}

async function createNote(payload = {}) {
  const trimmedPayload = {
    author: String(payload.author || "").trim(),
    avatarUrl: String(payload.avatarUrl || ""),
    content: String(payload.content || "").trim()
  };

  if (!isCloudEnabled()) {
    return storage.appendNote(buildLocalNote(trimmedPayload))[0];
  }

  const response = await api.request({
    path: "/api/notes",
    method: "POST",
    data: trimmedPayload
  });
  const note = normalizeNote(response && response.data ? response.data : {});
  storage.appendNote(note);
  return note;
}

module.exports = {
  fetchNotes,
  createNote,
  isCloudEnabled
};
