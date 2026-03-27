const appConfig = require("./app.json");

App({
  globalData: {
    appName: appConfig.window.navigationBarTitleText
  }
});
