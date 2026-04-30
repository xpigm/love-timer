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

function parseCreateNotePayload(payload = {}) {
  const author = String(payload.author || "").trim() || "匿名";
  const avatarUrl = String(payload.avatarUrl || "").trim();
  const content = String(payload.content || "").trim();
  const clientRequestId = String(payload.clientRequestId || "").trim();

  if (!content) {
    throw new Error("留言内容不能为空");
  }

  if (content.length > 300) {
    throw new Error("留言内容不能超过 300 字");
  }

  if (author.length > 20) {
    throw new Error("署名不能超过 20 个字");
  }

  if (avatarUrl.length > 500) {
    throw new Error("头像地址过长");
  }

  if (clientRequestId.length > 100) {
    throw new Error("请求标识过长");
  }

  return {
    author,
    avatarUrl,
    content,
    clientRequestId
  };
}

export {
  parseCreateNotePayload,
  parseListParams
};
