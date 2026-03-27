# 恋爱纪念册小程序

基于 `https://love.xpigm.com/` 的核心体验重新实现了微信小程序版，并针对小程序场景做了适配与迭代。

## 当前版本

- 沉浸式首页：保留“恋爱计时器 + 情话 + 节日氛围”的核心体验
- 资料配置化：情侣昵称、精确恋爱开始时间、城市、主题等改为 [config/profile.js](./config/profile.js) 管理
- 留言墙：使用本地存储保存双人留言，适合微信端轻量使用
- 特殊日期特效：内置周年纪念日、情人节、520、521 和关键天数氛围切换
- 分享文案：支持小程序分享标题和首页纪念文案复制

## 结构

- `config/profile.js`：情侣资料与特殊日期配置
- `pages/index`：首页
- `pages/wall`：留言墙
- `utils/profile-config.js`：配置文件封装
- `utils/storage.js`：留言本地存储
- `utils/time.js`：时间计算与节日场景逻辑
- `docs/cloudflare-message-plan.md`：留言迁移到 Cloudflare 的方案草案

## 使用方式

1. 用微信开发者工具打开当前目录
2. 修改 `config/profile.js` 中的情侣资料
3. 预览首页和留言墙效果
4. 如需上线，可继续沿用本地留言，或后续接入 Cloudflare 方案

## 说明

- 当前版本不再提供在线资料编辑
- 纪念片段与时间节点模块已移除
- 留言云端同步暂未实现，仍以本地存储为准
