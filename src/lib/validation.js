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

function validateStableImageUrl(value, label) {
  if (value.length > 500) {
    throw new Error(`${label}地址过长`);
  }

  if (/^(data:|wxfile:)/i.test(value)) {
    throw new Error(`${label}地址必须是已上传后的稳定地址`);
  }
}

function validateAvatarUrl(avatarUrl) {
  validateStableImageUrl(avatarUrl, "头像");
}

function validateImageUrl(imageUrl) {
  validateStableImageUrl(imageUrl, "图片");
}

function parseCreateNotePayload(payload = {}) {
  const author = String(payload.author || "").trim() || "匿名";
  const avatarUrl = String(payload.avatarUrl || "").trim();
  const imageUrl = String(payload.imageUrl || "").trim();
  const content = String(payload.content || "").trim();
  const clientRequestId = String(payload.clientRequestId || "").trim();

  if (!content && !imageUrl) {
    throw new Error("留言内容或图片不能为空");
  }

  if (content.length > 300) {
    throw new Error("留言内容不能超过 300 字");
  }

  validateAuthor(author);
  validateAvatarUrl(avatarUrl);
  validateImageUrl(imageUrl);

  if (clientRequestId.length > 100) {
    throw new Error("请求标识过长");
  }

  return {
    author,
    avatarUrl,
    imageUrl,
    content,
    clientRequestId
  };
}

function parseCreateReplyPayload(payload = {}) {
  const author = String(payload.author || "").trim() || "匿名";
  const avatarUrl = String(payload.avatarUrl || "").trim();
  const imageUrl = String(payload.imageUrl || "").trim();
  const content = String(payload.content || "").trim();

  if (!content && !imageUrl) {
    throw new Error("回复内容或图片不能为空");
  }

  if (content.length > 180) {
    throw new Error("回复内容不能超过 180 字");
  }

  validateAuthor(author);
  validateAvatarUrl(avatarUrl);
  validateImageUrl(imageUrl);

  return {
    author,
    avatarUrl,
    imageUrl,
    content
  };
}

export {
  parseCreateNotePayload,
  parseCreateReplyPayload,
  parseListParams
};
