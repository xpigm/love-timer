# 留言迁移到 Cloudflare 方案

## 目标

- 替换原网页时代依赖 LeanCloud / Valine 的在线留言形态
- 为小程序提供可控、可迁移、可扩展的留言数据层
- 保留当前本地存储作为降级方案，避免云端异常时不可用

## 推荐架构

- `Cloudflare Workers`：提供留言读写 API
- `Cloudflare D1`：保存留言正文、作者、时间、状态
- `Cloudflare KV`：缓存热门留言与限流计数
- `微信登录态`：通过 `wx.login` + 服务端换取用户身份，避免前端明文密钥

## 数据模型

### messages

- `id`
- `author`
- `content`
- `created_at`
- `updated_at`
- `status`
- `openid`
- `source`

### message_audit_logs

- `id`
- `message_id`
- `action`
- `operator`
- `created_at`

## API 设计

### `GET /api/messages`

- 按时间倒序返回留言
- 支持分页与简单缓存

### `POST /api/messages`

- 校验登录态
- 限制内容长度
- 写入 D1

### `DELETE /api/messages/:id`

- 仅允许白名单用户删除
- 写入审计日志

### `POST /api/auth/wx`

- 用小程序 `code` 向微信接口换取 `openid`
- 服务端生成短期会话

## 小程序接入策略

1. 抽象 `noteRepository`
2. 保留 `local` 与 `cloudflare` 两种适配器
3. 开发阶段默认 `local`
4. 云端稳定后切换到 `cloudflare`
5. 云端失败时自动回退到本地只读或本地缓存

## 数据迁移步骤

1. 从 LeanCloud 导出历史留言
2. 清洗字段并统一时间格式
3. 批量导入 D1
4. 抽样校验作者、内容、时间是否一致
5. 小程序灰度切换到新接口

## 风险点

- 微信身份接入需要服务端安全保存密钥
- D1 适合中小规模留言，后续若扩展多媒体需考虑 R2
- 删除权限必须收口到服务端，不能交给前端控制

## 当前状态

- 已完成方案设计
- 当前代码仍使用本地存储
- 暂未接入 Cloudflare API

