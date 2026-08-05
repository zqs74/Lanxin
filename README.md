# 篮球数据统计小程序 / MCBA 赛事方案规划助手

## 项目简介

篮球数据统计小程序是一个基于微信小程序原生开发的篮球综合管理工具，面向篮球爱好者、训练者、球队管理者以及 2026 赛季安踏小篮球联赛（MCBA）的承办方与参赛队伍，提供比赛记录、训练管理、个人资料、**MCBA 官方赛事方案规划**和自定义即时计分等能力。

当前项目以前端小程序为主，业务数据主要保存在微信小程序本地存储中；AI 聊天功能通过 DeepSeek 官方 API（OpenAI 兼容接口）实现流式对话，默认模型为 `deepseek-v4-flash`。

## 技术栈

- **运行平台**：微信小程序
- **开发方式**：原生小程序 `Page` / `Component`
- **语言与文件**：JavaScript、WXML、WXSS、JSON
- **UI 组件库**：`tdesign-miniprogram@^1.13.0`
- **图表绘制**：Canvas 2D API
- **数据存储**：微信小程序本地存储 `wx.getStorageSync` / `wx.setStorageSync`
- **AI 能力**：DeepSeek 官方 API（`https://api.deepseek.com/chat/completions`），默认模型 `deepseek-v4-flash`，通过 `wx.request + enableChunked + onChunkReceived` 手动解析 SSE 事件流实现流式输出，并内置手动 UTF-8 解码应对 chunk 中文边界。
- **后端接口**：`app.js` 中保留基础 GET 请求封装，默认地址为 `http://192.168.43.233:8080`

## 功能模块

### 首页

- 展示当前日期、生涯统计数据和快捷操作入口。
- 从本地存储读取 `careerStats`，用于展示得分、篮板、助攻、命中率和场次。
- 快捷入口支持创建/查看内容、进入训练中心、AI 助手和个人中心。

### 赛事中心

- 默认选择当天日期。
- 提供比赛列表/详情入口。
- 比赛详情页展示静态比分、表现数据、精彩片段、比分趋势和投篮统计。
- 比赛详情页可进入自定义比赛配置流程。

### 训练中心

- 展示技能雷达图、训练总评分、周训练计划、近期训练记录和快速训练入口。
- 支持添加训练记录，当前新增记录保存在页面状态中。
- 雷达图通过 Canvas 绘制。

### MCBA 赛事方案规划助手（原 AI 训练顾问）

- 角色定位：2026 赛季安踏小篮球联赛（MCBA）官方认证的「赛事方案规划助手」。
- 调用 DeepSeek 官方 API `deepseek-v4-flash` / `deepseek-v4-pro` 进行流式对话（OpenAI 兼容 Chat Completions + stream: true）。
- 小程序端使用 `wx.request` 的 `enableChunked: true` 与 `onChunkReceived` 回调，结合 SSE Buffer 逐行解析 `data:` 事件，实现边接收边渲染；内置手动 UTF-8 解码器兼容缺失 TextDecoder 的环境。
- 当用户提供「日期 + 预计队伍数」后，按 8 大模块输出《赛事承办/参赛方案》：方案概要、场地与时间安排、报名与费用明细、赞助商权益落地、竞赛组织配置、后勤保障清单、风险预案、下一步行动建议。
- 若未提供日期或队伍数会先主动询问；费用标注「价格依据 2026 赛季安踏官方招商手册」；时段表受 08:00-22:00 场馆营业时间约束。
- 前端 UI 内置基础 Markdown 渲染：标题、列表、表格、代码块、引用、粗体、斜体、删除线、流程图式节点图与链接。

### AI 创作

- 支持从相册或相机选择视频。
- 支持选择预设精彩片段。
- 当前 AI 生成集锦为前端模拟流程，云端视频功能仍显示为开发中。

### 自定义比赛

- 支持 A 队 / B 队球员配置。
- 支持添加、删除球员，选择头像，校验姓名与球衣号码。
- 球衣号码允许跨队重复，但同队内不可重复。
- 实时比赛页支持计时、得分、篮板、抢断、助攻、失误、盖帽、个人犯规、团队犯规、操作日志和撤销。
- 结束比赛后生成赛果报告，包含胜负、分差、球员排名、MVP、单项王、犯规统计和关键时刻。
- 赛果报告支持保存到本地和复制分享文本。

### 个人中心

- 展示个人资料和基础统计。
- 支持主题切换：跟随系统、浅色模式、深色模式。
- 支持跳转资料编辑页和 AI 训练顾问。
- 资料编辑页支持头像选择、位置选择和基础字段保存。

## 目录结构

```text
CompReain/
├── app.js                         # 小程序入口：云开发、主题、全局状态、API GET 封装
├── app.json                       # 页面路由、窗口配置、自定义 tabBar、全局组件
├── app.wxss                       # 全局样式与主题样式
├── package.json                   # npm 元数据与 TDesign 依赖
├── package-lock.json              # npm 锁定文件
├── project.config.json            # 微信开发者工具项目配置
├── project.private.config.json    # 微信开发者工具本地私有配置
├── project.miniapp.json           # 多端 miniapp 配置
├── app.miniapp.json               # miniapp 适配配置
├── sitemap.json                   # 小程序 sitemap 规则
├── theme.json                     # 明暗主题颜色配置
├── API_登录接口说明.md             # 后端微信登录接口对接说明
├── components/
│   ├── float-ai-button/           # 可拖拽悬浮 AI 按钮
│   └── nav-bar/                   # 自定义导航栏组件
├── custom-tab-bar/                # 自定义底部 tabBar
├── images/                        # 图标与 tabBar 图片资源
├── miniapp/                       # 当前为空，预留多端构建资源目录
├── miniprogram_npm/               # 微信开发者工具构建后的 npm 包
├── pages/
│   ├── index/                     # 首页
│   ├── match/                     # 赛事中心
│   ├── match-detail/              # 比赛详情
│   ├── training/                  # 训练中心
│   ├── profile/                   # 个人中心
│   ├── profile-edit/              # 个人资料编辑
│   ├── chat/                      # MCBA 赛事方案规划助手（DeepSeek 官方 API + SSE）
│   ├── create/                    # AI 创作
│   ├── custom-match-setup/        # 自定义比赛球员配置
│   ├── custom-match-live/         # 自定义比赛实时计分
│   └── custom-match-result/       # 自定义比赛赛果报告
└── static/
    └── fonts/                     # 字体资源
```

## 启动流程

1. 微信小程序启动后进入 `app.js` 的 `onLaunch`。
2. `app.js` 调用 `wx.cloud.init` 初始化云开发环境（当前聊天功能已直接走 DeepSeek 官方 API，云环境主要供后续云函数扩展）：

   ```javascript
   wx.cloud.init({
     env: "cloud1-d8gg26do45365a017"
   })
   ```

3. 初始化 `globalData`，包含用户信息、主题状态、tabBar 实例、悬浮 AI 按钮实例和默认生涯数据。
4. 调用 `loadTheme()` 读取本地主题配置 `app_theme`。
5. 调用 `listenSystemTheme()` 监听系统主题变化。
6. 根据 `app.json` 注册的页面路由进入首页 `pages/index/index`。
7. 首页和 tab 页通过自定义 tabBar 同步当前选中项。
8. 进入赛事方案规划页（`pages/chat/chat`）后，用户发送「帮我预定联赛方案 + 日期 + 队伍数」即可触发 DeepSeek 官方流式对话。

## 页面路由

`app.json` 当前注册的页面如下：

- `pages/index/index`
- `pages/match/match`
- `pages/training/training`
- `pages/profile/profile`
- `pages/create/create`
- `pages/match-detail/match-detail`
- `pages/chat/chat`
- `pages/profile-edit/profile-edit`
- `pages/custom-match-setup/custom-match-setup`
- `pages/custom-match-live/custom-match-live`
- `pages/custom-match-result/custom-match-result`

自定义 tabBar 当前包含 4 个一级页面：

- 首页：`pages/index/index`
- 赛事中心：`pages/match/match`
- 训练中心：`pages/training/training`
- 个人中心：`pages/profile/profile`

## 本地存储键

- `app_theme`：用户主题设置，支持 `auto`、`light`、`dark`
- `careerStats`：首页生涯统计
- `profile`：个人资料
- `custom_match_<matchId>`：单场自定义比赛数据
- `unfinished_custom_match`：未完成的自定义比赛
- `finished_custom_matches`：已完成自定义比赛摘要列表
- `saved_custom_match_reports`：已保存的赛果报告

## API 与环境配置

### DeepSeek 官方 API（赛事规划助手）

`pages/chat/chat.js` 中的 `callDeepSeekAPI` 封装了整个流式调用链：

```javascript
const CONFIG = {
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-xxx',                    // 替换为实际 Key
  model: 'deepseek-v4-flash'           // 或 deepseek-v4-pro
}

wx.request({
  url: `${CONFIG.baseURL}/chat/completions`,
  method: 'POST',
  header: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CONFIG.apiKey}`
  },
  data: {
    model: CONFIG.model,
    messages,
    stream: true,
    temperature: 0.7
  },
  enableChunked: true,
  timeout: 120000,
  success: (res) => { /* success 收尾 + flush SSE Buffer */ },
  fail: (err) => { /* 错误提示 */ }
})
```

核心机制：

1. 使用 `enableChunked: true` 开启分块传输。
2. 通过 `requestTask.onChunkReceived` 拿到 ArrayBuffer，`Uint8Array` 转字节后走 `_utf8Decode`（优先 `TextDecoder`，缺失则手动 UTF-8 → UTF-16，兼容 emoji 的 4 字节代理对）。
3. 拼入 `sseBuffer`，按 `\n\n` 切事件；逐行剥离 `data:` 前缀，支持多行 data 合并；遇到 `[DONE]` 或全量接收完成则 `finishStream`。
4. 每次增量 `choices[0].delta.reasoning_content` 同步思考态，`content` 重新全文解析 Markdown 并 `setData` 渲染，达到流式效果。

部署前必做：

1. 登录微信公众平台 → 小程序后台 → 开发管理 → 开发设置 → 服务器域名 → **request 合法域名**，添加：
   ```
   https://api.deepseek.com
   ```
2. 开发者工具调试时可以勾选「详情 → 本地设置 → 不校验合法域名」临时跳过，但真机和线上必须配置。
3. API Key 硬编码在小程序包内仅适合个人/演示用途；上线前建议改为通过自建后端代理转发，把 Key 放在服务端并加签名/白名单防止泄露。
4. 切换模型时仅需修改 `CONFIG.model`：
   - `deepseek-v4-flash`：默认，响应更快、价格更优
   - `deepseek-v4-pro`：能力更强，适合复杂赛制方案

### 微信云开发 AI（旧实现，已被替代）

> 当前聊天页已迁移至 DeepSeek 官方 API，云环境主要保留用于云函数扩展。旧调用方式参考提交历史中的 `callCloudAI`。

旧实现的调用方式（历史参考）：

```javascript
const res = await wx.cloud.extend.AI.createModel("deepseek").streamText({
  data: { model: "deepseek-r1-0528", messages }
})
```

如需切回云开发：
1. 确认云环境 ID 与 `app.js` 中 `cloud1-d8gg26do45365a017` 一致，或按实际修改。
2. 恢复 `callCloudAI` 并把 `sendMessage` 里的调用切回 `this.callCloudAI(message)`。
3. 确认当前小程序具备调用微信云开发 AI 能力的权限。

### 后端登录接口

根目录的 `API_登录接口说明.md` 记录了微信登录换取业务 Token 的接口：

- 请求方式：`POST`
- 接口路径：`/api/auth/wx-login`
- 鉴权：不需要登录
- 请求体包含 `code`，可选 `nickname`、`avatarUrl`

当前代码中尚未实现该 POST 登录流程；`app.js` 只包含一个基础 GET 请求封装。

### 环境变量

项目根目录未发现 `.env.example` 或 `.env` 示例文件。当前重要配置直接写在代码或项目配置中：

- 云开发环境 ID：`app.js` 中的 `cloud1-d8gg26do45365a017`
- 后端基础地址：`app.js` 中的 `http://192.168.43.233:8080`
- 小程序 AppID：`project.config.json` 中的 `wx913f36c951ffc973`

## 安装与运行

### 前提条件

- 安装微信开发者工具。
- 注册微信小程序账号。
- （可选）开通微信云开发服务，当前主要 AI 聊天功能已改为 DeepSeek 官方 API，云环境仅作扩展预留。
- 如使用赛事方案规划助手的流式对话功能，需在 DeepSeek 官网申请 API Key 并配置到 `pages/chat/chat.js` 的 `CONFIG.apiKey`。
- 如需使用 TDesign 组件，确保微信开发者工具已构建 npm。
- **真机/线上必做**：微信公众平台后台将 `https://api.deepseek.com` 加入 request 合法域名白名单。

### 步骤

1. 克隆或打开本项目目录。
2. 使用微信开发者工具导入项目。
3. 检查 `project.config.json` 中的 AppID 是否符合当前账号。
4. 在微信开发者工具中执行“工具 - 构建 npm”。
5. （可选）检查 `app.js` 中的云环境 ID 是否可用，若不使用云开发可跳过。
6. 打开 `pages/chat/chat.js`，确认 `CONFIG.apiKey` 已填入可使用的 DeepSeek Key，并按需切换 `deepseek-v4-flash` / `deepseek-v4-pro`。
7. 编译并运行小程序；真机调试前，确保已在公众平台后台配置合法域名 `https://api.deepseek.com`。

### npm 脚本

当前 `package.json` 仅包含默认测试脚本：

```bash
npm test
```

该脚本当前会输出 `Error: no test specified` 并以失败状态退出，项目暂未配置自动化测试命令。

## 代码风格与开发约定

- 页面使用微信小程序原生 `Page({ ... })`。
- 组件使用微信小程序原生 `Component({ ... })`。
- JavaScript 命名以 camelCase 为主。
- 页面文件通常按同名四件套组织：`.js`、`.json`、`.wxml`、`.wxss`。
- 主题逻辑由 `app.js` 统一维护，各页面通过 `app.getUserTheme()`、`app.getThemeColors()` 和 `setTheme()` 同步。
- tabBar 状态由 `app.js` 和 `custom-tab-bar/index.js` 协同维护。
- 当前未发现 ESLint、Prettier 或其他格式化配置。
- 当前未发现独立 `src/`、`lib/`、`services/`、`models/` 目录，业务逻辑主要写在各页面 JS 文件中。

## 注意事项

1. 代码内存在局域网后端地址，换环境时需要同步修改。
2. AI 聊天依赖 DeepSeek 官方 API（baseURL: `https://api.deepseek.com`），公众平台后台需将其加入 request 合法域名白名单；未配置时真机/线上会拦截请求。
3. API Key 当前硬编码在 `pages/chat/chat.js` 中，仅适用于个人/演示用途；正式上线请务必改为后端代理转发并在服务端保存 Key，避免被抓包/反编译后泄露。
4. 多数业务数据保存在本地，清缓存或卸载小程序后可能丢失。
5. `README.md` 中提到 MIT 许可证，但项目根目录当前未发现 `LICENSE` 文件。
6. `miniapp/` 目录当前为空，`project.miniapp.json` 更像是多端构建预留配置。
7. 若流式对话出现中文乱码，可检查 `_utf8Decode` 是否被跳过；在个别不支持 `new Uint8Array(res.data)` 的基础库版本中可改为 `wx.arrayBufferToBase64 + atob` 的降级路径。

---

**版本信息**：v3.1.0（MCBA 赛事方案规划助手接入）
**最后更新**：2026-08-05
