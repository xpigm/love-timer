const serviceConfig = require("../config/service");

function joinUrl(path) {
  const baseUrl = String(serviceConfig.notesApiBaseUrl || "").replace(/\/$/, "");
  const suffix = String(path || "").startsWith("/") ? path : `/${path || ""}`;
  return `${baseUrl}${suffix}`;
}

function resolveErrorMessage(payload, fallback) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }

  return fallback;
}

function request(options = {}) {
  const url = joinUrl(options.path);

  if (!serviceConfig.notesApiBaseUrl) {
    return Promise.reject(new Error("未配置留言服务地址"));
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: options.method || "GET",
      data: options.data,
      timeout: options.timeout || serviceConfig.notesRequestTimeout,
      header: {
        "content-type": "application/json",
        ...(options.headers || {})
      },
      success: (response) => {
        const { statusCode, data } = response;

        if (statusCode >= 200 && statusCode < 300) {
          resolve(data);
          return;
        }

        reject(new Error(resolveErrorMessage(data, `请求失败（${statusCode}）`)));
      },
      fail: (error) => {
        reject(new Error((error && error.errMsg) || "网络请求失败"));
      }
    });
  });
}

module.exports = {
  request
};
