# 篮球数据统计小程序

## 项目简介

篮球数据统计小程序是一个基于微信小程序原生开发的篮球数据管理工具，面向篮球爱好者、训练者和球队管理者，提供比赛记录、训练管理、个人资料、AI 训练顾问和自定义即时计分等能力。

当前项目以前端小程序为主，业务数据主要保存在微信小程序本地存储中；AI 聊天功能依赖微信云开发的 DeepSeek 模型能力。

## 技术栈

- **运行平台**：微信小程序
- **开发方式**：原生小程序 `Page` / `Component`
- **语言与文件**：JavaScript、WXML、WXSS、JSON
- **UI 组件库**：`tdesign-miniprogram@^1.13.0`
- **图表绘制**：Canvas 2D API
- **数据存储**：微信小程序本地存储 `wx.getStorageSync` / `wx.setStorageSync`
- **AI 能力**：微信云开发 `wx.cloud.extend.AI.createModel("deepseek")`
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

### AI 训练顾问

- 使用微信云开发 DeepSeek 模型进行流式对话。
- 支持流式输出、思考状态展示和基础 Markdown 渲染。
- 已实现对标题、列表、表格、代码块、引用、粗体、斜体、删除线和链接等内容的解析展示。

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
│   ├── chat/                      # AI 训练顾问
│   ├── create/                    # AI 创作
│   ├── custom-match-setup/        # 自定义比赛球员配置
│   ├── custom-match-live/         # 自定义比赛实时计分
│   └── custom-match-result/       # 自定义比赛赛果报告
└── static/
    └── fonts/                     # 字体资源
```

## 启动流程

1. 微信小程序启动后进入 `app.js` 的 `onLaunch`。
2. `app.js` 调用 `wx.cloud.init` 初始化云开发环境：

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

### 微信云开发 AI

AI 聊天页调用方式：

```javascript
const res = await wx.cloud.extend.AI.createModel("deepseek").streamText({
  data: {
    model: "deepseek-r1-0528",
    messages
  }
})
```

使用前需要：

1. 在微信开发者工具中开通云开发。
2. 确认云环境 ID 与 `app.js` 中的 `cloud1-d8gg26do45365a017` 一致，或按实际环境修改。
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
- 开通微信云开发服务。
- 如需使用 TDesign 组件，确保微信开发者工具已构建 npm。

### 步骤

1. 克隆或打开本项目目录。
2. 使用微信开发者工具导入项目。
3. 检查 `project.config.json` 中的 AppID 是否符合当前账号。
4. 在微信开发者工具中执行“工具 - 构建 npm”。
5. 检查 `app.js` 中的云环境 ID 是否可用。
6. 编译并运行小程序。

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
2. AI 聊天依赖微信云开发和 DeepSeek 模型能力，未开通时会提示服务不可用。
3. 多数业务数据保存在本地，清缓存或卸载小程序后可能丢失。
4. `README.md` 中提到 MIT 许可证，但项目根目录当前未发现 `LICENSE` 文件。
5. `miniapp/` 目录当前为空，`project.miniapp.json` 更像是多端构建预留配置。

---

**版本信息**：v3.0.0  
**最后更新**：2026-07-29
