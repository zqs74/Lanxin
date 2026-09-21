# CompTrain 参赛方小程序（昇梦体育）

> 参赛方端微信小程序，基于原生小程序 + TDesign 开发，面向篮球爱好者、训练者与参赛球队，提供**智能剪辑、赛事资讯报名、个人成长分析、商城**四大模块，并内置 MCBA 赛事方案规划 AI 助手与自定义比赛工具。

## 项目简介

CompTrain 是昇梦体育（2026 赛季安踏小篮球联赛 MCBA 承办方）参赛方端小程序，共四个一级模块：

| 模块 | 页面 | 说明 |
| --- | --- | --- |
| 智能剪辑 | `pages/index` | 上传比赛视频 → 选择精彩片段 → AI 模拟生成集锦；顶部问候语按时段显示用户名（早上好/下午好/晚上好，姓名取自本地资料），右上角头像进入个人中心（编辑资料/主题切换/AI 助手/创建比赛） |
| 赛事资讯报名 | `pages/match` | 赛事资讯列表、可报名赛事列表（组别/时间/地点/费用/名额）、参赛报名（本地存储） |
| 个人成长分析 | `pages/training` | 生涯数据、技能雷达图、本周训练计划、训练记录、快速训练 |
| 商城 | `pages/profile` | 商品分类（球服/篮球/护具/配件）、商品详情、模拟下单、我的订单 |

当前项目以前端小程序为主，业务数据保存在微信小程序本地存储中；AI 聊天功能通过 DeepSeek 官方 API（OpenAI 兼容接口）实现流式对话，默认模型为 `deepseek-v4-flash`。

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

### 智能剪辑（首页 `pages/index`）

- 上传比赛视频：从相册或拍摄（`wx.chooseVideo`），支持"云端视频"入口（开发中）。
- 顶部问候语：按当前时段自动切换「早上好 / 下午好 / 晚上好」，并把本地资料的姓名接在后面（如「晚上好，张淇森」）；未填姓名时回退为「篮球爱好者」。姓名在编辑资料页修改，回到首页即生效。
- 选择精彩片段：预设比赛片段列表，支持多选，选中态金色高亮。
- AI 生成集锦：模拟生成流程（前端演示，2 秒后返回结果），展示集锦时长与保存/分享/重新剪辑操作。
- **个人中心入口**：右上角头像弹出半屏面板，集成编辑资料（`pages/profile-edit`）、主题切换（跟随系统/浅色/深色）、AI 助手（`pages/chat`）、创建比赛（`pages/custom-match-setup`）。

### 赛事资讯报名（`pages/match`）

- 赛事资讯：官方公告、赛事解读、赛程、回顾、报名指南、保障说明（本地静态数据）。
- 可报名赛事：U8/U10/U12 小篮球联赛与企业联赛等，展示组别、日期、地点、费用、剩余名额与报名状态（报名中/即将截止/名额已满）。
- 参赛报名：姓名 + 手机号（正则校验）+ 组别选择 + 队伍/备注，提交后存入本地 `event_registrations`，已报名赛事显示"已报名"且不可重复提交。
- 支持按关键字搜索、按日期筛选赛事。

### 个人成长分析（`pages/training`）

- 生涯数据：得分、篮板、助攻、命中率、场次（读 `careerStats`，从原首页迁入）。
- 演示档案：17 岁高中校队小前锋（186cm / 75kg，区高中生联赛），生涯累计 22 场 / 264 分 / 132 篮板 / 66 助攻 / 命中率 46.2%（场均 12.0 分 6.0 篮板 3.0 助攻）。默认值定义在 `app.js` 的 `DEFAULT_CAREER_STATS`，由 `seedCareerStats()` 在首启时写入本地缓存。
- 技能雷达图：六维能力（投篮/身体素质/突破上篮/组织/控球/防守），Canvas 2D 绘制。
- 今日训练概览：当日训练时长 / 项目数 / 强度，取 `todaySummary`（当天队内对抗课：90 分钟 / 5 项目 / 高强度）。
- 本周训练计划：按当前日期推算本周课表（周一至周六），已过日期自动标记「已完成」、当天标记「今日」、其余标记「待进行」。
- 训练记录：最近三次训练记录（标题/时长/强度/亮点），日期相对当天生成（今天/昨天/前天），支持手动添加记录。
- 快速训练：投篮/力量/体能/技巧一键开始。

### 商城（`pages/profile`）

- 商品分类：全部 / 球服 / 篮球 / 护具 / 配件。
- 商品列表：12 个演示商品（emoji 图 + 名称 + 价格 + 标签）。
- 商品详情：大图、描述、数量步进器、合计金额。
- 模拟下单：提交后存入本地 `mall_orders`，支持"我的订单"列表查看与清空。

### MCBA 赛事方案规划助手（`pages/chat`）

- 角色定位：2026 赛季安踏小篮球联赛（MCBA）官方认证的「赛事方案规划助手」。
- 调用 DeepSeek 官方 API `deepseek-v4-flash` / `deepseek-v4-pro` 进行流式对话（OpenAI 兼容 Chat Completions + stream: true）。
- 小程序端使用 `wx.request` 的 `enableChunked: true` 与 `onChunkReceived` 回调，结合 SSE Buffer 逐行解析 `data:` 事件，实现边接收边渲染；内置手动 UTF-8 解码器兼容缺失 TextDecoder 的环境。
- 当用户提供「日期 + 预计队伍数」后，按 8 大模块输出《赛事承办/参赛方案》：方案概要、场地与时间安排、报名与费用明细、赞助商权益落地、竞赛组织配置、后勤保障清单、风险预案、下一步行动建议。
- 若未提供日期或队伍数会先主动询问；费用标注「价格依据 2026 赛季安踏官方招商手册」；时段表受 08:00-22:00 场馆营业时间约束。
- 前端 UI 内置基础 Markdown 渲染：标题、列表、表格、代码块、引用、粗体、斜体、删除线、流程图式节点图与链接。

### 自定义比赛（`pages/custom-match-setup/live/result`）

- 支持 A 队 / B 队球员配置：添加、删除球员，选择头像，校验姓名与球衣号码（同队不可重复）。
- 球员配置页顶部提供「一键示例赛果」入口：生成一场数据完整的演示比赛（A 86 : 79 B，4 节 × 12 分钟，比赛时长 01:09:00），直接跳转赛果报告页，不影响当前正在填写的球员名单。
- 示例数据由 `custom-match-setup.js` 的 `buildDemoMatchData()` 生成：12 名球员（A/B 队各 6 人，真实姓名 + 球衣号）、298 条动作记录（得分 84 / 技术统计 179 / 个人犯规 28 / 团队犯规 7），得分由投篮构成（三分球 / 两分球 / 罚球）自动累加，采用固定随机种子，重复生成结果一致。
- 实时比赛页支持计时、得分、篮板、抢断、助攻、失误、盖帽、个人犯规、团队犯规、操作日志和撤销。
- 结束比赛后生成赛果报告，包含胜负、分差、球员排名、MVP、单项王、犯规统计和关键时刻。
- 赛果报告支持保存到本地和复制分享文本。

### 个人资料（`pages/profile-edit`）

- 支持头像选择、姓名、位置选择、身高/体重/球龄/技术特点等基础字段编辑，保存在本地 `profile`。
- 头像选中后先经 `wx.getFileSystemManager().saveFile()` 存到小程序本地用户目录，再把**持久路径**写进 `profile`（避免临时路径重启后失效；保存失败时退回临时路径兜底）。
- 姓名为必填，保存后在首页问候语与个人中心弹层同步显示。

### 个人中心（首页右上角头像弹层）

- 入口在智能剪辑页右上角头像，弹层内展示头像、姓名、「位置 · 身高 · 体重」摘要。
- 集成编辑资料（`pages/profile-edit`）、主题切换（跟随系统/浅色/深色）、AI 助手（`pages/chat`）、创建比赛（`pages/custom-match-setup`）。

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
├── custom-tab-bar/                # 自定义底部 tabBar（智能剪辑/赛事资讯报名/个人成长分析/商城）
├── images/                        # 图标与 tabBar 图片资源
├── miniapp/                       # 当前为空，预留多端构建资源目录
├── miniprogram_npm/               # 微信开发者工具构建后的 npm 包
├── pages/
│   ├── index/                     # 智能剪辑（首页，右上角头像=个人中心入口）
│   ├── match/                     # 赛事资讯报名
│   ├── match-detail/              # 比赛详情（保留备用，暂无入口）
│   ├── training/                  # 个人成长分析
│   ├── profile/                   # 商城
│   ├── profile-edit/              # 个人资料编辑
│   ├── chat/                      # MCBA 赛事方案规划助手（DeepSeek 官方 API + SSE）
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
4. 调用 `seedCareerStats()`：若本地缓存 `careerStats` 为空（首启或清缓存后），把默认生涯数据写入本地，避免个人成长分析页读到空值显示为 0。
5. 调用 `loadTheme()` 读取本地主题配置 `app_theme`。
6. 调用 `listenSystemTheme()` 监听系统主题变化。
7. 根据 `app.json` 注册的页面路由进入智能剪辑页 `pages/index/index`。
8. 各 tab 页通过自定义 tabBar 同步当前选中项。
9. 进入赛事方案规划页（`pages/chat/chat`）后，用户发送「帮我预定联赛方案 + 日期 + 队伍数」即可触发 DeepSeek 官方流式对话。

## 页面路由

`app.json` 当前注册的页面如下：

- `pages/index/index`
- `pages/match/match`
- `pages/training/training`
- `pages/profile/profile`
- `pages/match-detail/match-detail`
- `pages/chat/chat`
- `pages/profile-edit/profile-edit`
- `pages/custom-match-setup/custom-match-setup`
- `pages/custom-match-live/custom-match-live`
- `pages/custom-match-result/custom-match-result`

自定义 tabBar 当前包含 4 个一级页面：

- 智能剪辑：`pages/index/index`
- 赛事资讯报名：`pages/match/match`
- 个人成长分析：`pages/training/training`
- 商城：`pages/profile/profile`

## 本地存储键

- `app_theme`：用户主题设置，支持 `auto`、`light`、`dark`
- `careerStats`：生涯统计（首页迁移至个人成长分析页展示；首启由 `app.js` 的 `seedCareerStats()` 写入默认演示数据）
- `profile`：个人资料
- `event_registrations`：参赛报名记录（赛事资讯报名页，最多保留 50 条）
- `mall_orders`：商城模拟下单订单（最多保留 50 条）
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
- **WXML 数据绑定不支持 `indexOf()` 等方法调用**，选中态等布尔判断须用对象映射（如 `registeredMap[item.id]`）。
- 弹层（modal/panel）的 `z-index` 需高于自定义 tabBar 的 `9999`，否则会被遮挡。
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
8. `pages/create`（原 AI 创作页）已在 v4.0.0 移除，其功能并入首页智能剪辑工作台。
9. `pages/match-detail` 当前保留但无入口（原"今日比赛"区块已移除），后续如需比赛数据查看可恢复入口。

---

**版本信息**：v4.3.0（首页问候语按时段显示本地资料姓名；编辑资料页头像改为持久化保存路径）
**最后更新**：2026-09-21
