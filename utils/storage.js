const { STORAGE_KEYS } = require("./default-data");

function write(key, value) {
  wx.setStorageSync(key, value);
  return value;
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
  createId,
  getUserInfo,
  saveUserInfo,
  getClientId
};
