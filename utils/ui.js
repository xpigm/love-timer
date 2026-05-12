const NAVIGATION_THEME = {
  midnight: {
    frontColor: "#ffffff",
    backgroundColor: "#151327"
  },
  blush: {
    frontColor: "#000000",
    backgroundColor: "#fff7f4"
  }
};

function tapFeedback() {
  if (wx.vibrateShort) {
    wx.vibrateShort({ type: "light" });
  }
}

function syncNavigationBar(theme) {
  if (!wx.setNavigationBarColor) {
    return;
  }

  const systemInfo = wx.getSystemInfoSync();
  if (systemInfo.theme === "dark") {
    wx.setNavigationBarColor(NAVIGATION_THEME.midnight);
    return;
  }

  wx.setNavigationBarColor(NAVIGATION_THEME[theme] || NAVIGATION_THEME.blush);
}

function bindThemeChange(page, handler) {
  if (!wx.onThemeChange) {
    return;
  }

  unbindThemeChange(page);
  page.themeChangeHandler = handler;
  wx.onThemeChange(handler);
}

function unbindThemeChange(page) {
  if (!page.themeChangeHandler || !wx.offThemeChange) {
    page.themeChangeHandler = null;
    return;
  }

  wx.offThemeChange(page.themeChangeHandler);
  page.themeChangeHandler = null;
}

module.exports = {
  bindThemeChange,
  syncNavigationBar,
  tapFeedback,
  unbindThemeChange
};
