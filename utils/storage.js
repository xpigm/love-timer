const {
  STORAGE_KEYS,
  DEFAULT_PROFILE,
  DEFAULT_NOTES,
  DEFAULT_MEMORIES
} = require("./default-data");

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function read(key, fallback) {
  const value = wx.getStorageSync(key);

  if (Array.isArray(fallback)) {
    if (Array.isArray(value)) {
      return value;
    }
    return clone(fallback);
  }

  if (value && typeof value === "object") {
    return value;
  }

  return clone(fallback);
}

function write(key, value) {
  wx.setStorageSync(key, value);
  return value;
}

function sortMemories(memories) {
  return memories.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function sortNotes(notes) {
  return notes.slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

function getProfile() {
  return {
    ...clone(DEFAULT_PROFILE),
    ...read(STORAGE_KEYS.profile, DEFAULT_PROFILE)
  };
}

function saveProfile(profile) {
  return write(STORAGE_KEYS.profile, {
    ...clone(DEFAULT_PROFILE),
    ...profile
  });
}

function getNotes() {
  return sortNotes(read(STORAGE_KEYS.notes, DEFAULT_NOTES));
}

function saveNotes(notes) {
  return write(STORAGE_KEYS.notes, sortNotes(notes));
}

function appendNote(note) {
  const notes = getNotes();
  notes.unshift(note);
  return saveNotes(notes);
}

function deleteNote(id) {
  const notes = getNotes().filter((item) => item.id !== id);
  return saveNotes(notes);
}

function clearNotes() {
  return saveNotes([]);
}

function getMemories() {
  return sortMemories(read(STORAGE_KEYS.memories, DEFAULT_MEMORIES));
}

function saveMemories(memories) {
  return write(STORAGE_KEYS.memories, sortMemories(memories));
}

function appendMemory(memory) {
  const memories = getMemories();
  memories.unshift(memory);
  return saveMemories(memories);
}

function deleteMemory(id) {
  const memories = getMemories().filter((item) => item.id !== id);
  return saveMemories(memories);
}

function restoreDefaultMemories() {
  return saveMemories(clone(DEFAULT_MEMORIES));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

module.exports = {
  getProfile,
  saveProfile,
  getNotes,
  saveNotes,
  appendNote,
  deleteNote,
  clearNotes,
  getMemories,
  saveMemories,
  appendMemory,
  deleteMemory,
  restoreDefaultMemories,
  createId
};
