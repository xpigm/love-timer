function parseListParams(searchParams) {
  const requestedLimit = Number(searchParams.get("limit") || 20);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 50)
    : 20;
  const cursorValue = searchParams.get("cursor");
  const cursor = cursorValue == null || cursorValue === ""
    ? null
    : Number(cursorValue);

  if (cursor != null && !Number.isFinite(cursor)) {
    throw new Error("cursor 参数无效");
  }

  return {
    limit,
    cursor
  };
}

function validateAuthor(author) {
  if (author.length > 20) {
    throw new Error("署名不能超过 20 个字");
  }
}

function validateAvatar(avatarBase64, avatarUrl) {
  if (avatarBase64.length > 500000) {
    throw new Error("头像数据过大");
  }

  if (avatarUrl.length > 500) {
    throw new Error("头像地址过长");
  }
}

function parseCreateNotePayload(payload = {}) {
  const author = String(payload.author || "").trim() || "匿名";
  const avatarBase64 = String(payload.avatarBase64 || "").trim();
  const avatarUrl = String(payload.avatarUrl || "").trim();
  const content = String(payload.content || "").trim();
  const clientRequestId = String(payload.clientRequestId || "").trim();

  if (!content) {
    throw new Error("留言内容不能为空");
  }

  if (content.length > 300) {
    throw new Error("留言内容不能超过 300 字");
  }

  validateAuthor(author);
  validateAvatar(avatarBase64, avatarUrl);

  if (clientRequestId.length > 100) {
    throw new Error("请求标识过长");
  }

  return {
    author,
    avatarBase64,
    avatarUrl,
    content,
    clientRequestId
  };
}

function parseCreateReplyPayload(payload = {}) {
  const author = String(payload.author || "").trim() || "匿名";
  const avatarBase64 = String(payload.avatarBase64 || "").trim();
  const avatarUrl = String(payload.avatarUrl || "").trim();
  const content = String(payload.content || "").trim();

  if (!content) {
    throw new Error("回复内容不能为空");
  }

  if (content.length > 180) {
    throw new Error("回复内容不能超过 180 字");
  }

  validateAuthor(author);
  validateAvatar(avatarBase64, avatarUrl);

  return {
    author,
    avatarBase64,
    avatarUrl,
    content
  };
}

export {
  parseCreateNotePayload,
  parseCreateReplyPayload,
  parseListParams
};
