# 恋爱纪念册小程序

基于 `https://love.xpigm.com/` 的核心体验重新实现了微信小程序版，并针对小程序场景做了适配与迭代。

## 当前 UI 风格 (Glassmorphism & Neon Glow)

当前分支采用了基于 **Apple Event** 及 **Microsoft Fluent Design** 的流体动画（Fluid Motion）和玻璃态（Glassmorphism）质感设计。

**核心设计提示词 / Prompt 规范：**
- **背景系统**: 深色极光底座 `#09090b`，配合底层绝对定位的呼吸光晕 (`ambient-orb`) 以及大半径的高斯模糊 (`filter: blur(80px)`) 产生叠加光影效果。
- **玻璃卡片**: 核心组件使用 `backdrop-filter: blur(24px)` 或更高，搭配带有 1px 高光的顶部半透明白色内阴影，实现极致通透感。
- **动效与交互 (Fluid Motion)**:
  - 使用高维缓动曲线 (如 `cubic-bezier(0.25, 1, 0.5, 1)`) 替代线性或普通 ease 过渡。
  - 组件入场自带错峰渐浮动画 (Staggered fade-in-up, `animate-enter`)。
  - 主要模块拥有 8~10 秒周期的微幅呼吸悬浮 (Subtle float)。
  - 按钮包含真实的压感回弹 (`transform: scale(0.96)`)。
- **排版与文案**: 使用 Bento Grid 结构控制信息密度；文案以“星海、碎片、宇宙、刻印、光年”为主题，富有诗意及沉浸感。

## 当前功能

- 沉浸式首页：保留“恋爱计时器 + 情话 + 节日氛围”的核心体验
- 资料配置化：情侣昵称、精确恋爱开始时间、城市、主题等改为 [config/profile.js](./config/profile.js) 管理
- 记忆储藏室：使用本地存储保存双人星空留言，适合微信端轻量使用
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
