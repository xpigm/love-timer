const { STORAGE_KEYS, DEFAULT_NOTES } = require("./default-data");

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function readArray(key, fallback) {
  const value = wx.getStorageSync(key);
  return Array.isArray(value) ? value : clone(fallback);
}

function write(key, value) {
  wx.setStorageSync(key, value);
  return value;
}

function sortNotes(notes) {
  return notes.slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

function getNotes() {
  return sortNotes(readArray(STORAGE_KEYS.notes, DEFAULT_NOTES));
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

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getStableAvatarUrl(avatarUrl) {
  const value = String(avatarUrl || "").trim();
  return /^(data:|wxfile:)/i.test(value) ? "" : value;
}

function getUserInfo() {
  const userInfo = wx.getStorageSync(STORAGE_KEYS.userInfo) || null;
  if (!userInfo) {
    return null;
  }

  const cleaned = {
    nickName: userInfo.nickName || "",
    avatarUrl: getStableAvatarUrl(userInfo.avatarUrl)
  };

  if (cleaned.nickName !== userInfo.nickName || cleaned.avatarUrl !== userInfo.avatarUrl || Object.keys(userInfo).length !== 2) {
    return saveUserInfo(cleaned);
  }

  return cleaned;
}

function saveUserInfo(userInfo) {
  return write(STORAGE_KEYS.userInfo, {
    nickName: userInfo.nickName || "",
    avatarUrl: getStableAvatarUrl(userInfo.avatarUrl)
  });
}

function getClientId() {
  const existing = wx.getStorageSync(STORAGE_KEYS.clientId);
  if (existing) {
    return existing;
  }

  return write(STORAGE_KEYS.clientId, createId("client"));
}

module.exports = {
  getNotes,
  saveNotes,
  appendNote,
  deleteNote,
  clearNotes,
  createId,
  getUserInfo,
  saveUserInfo,
  getClientId
};
