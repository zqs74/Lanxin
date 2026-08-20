# 🏀 篮芯 AI 分析平台 · Web 控制台（Lanxin-UI）

> 一站式篮球赛事智能运营中台：赛制编排 · 资源清单 · 应急预案 · 可视化日程 · 智能视频营销中台。
> 纯前端实现，零后端依赖，内置高仿真 Mock 数据，开箱即用。

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss)
![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?logo=reactrouter)
![Build](https://img.shields.io/badge/build-passing-success)
![Bundle](https://img.shields.io/badge/gzip%20bundle-193%20KB-informational)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ 项目特色

- **全 Mock 前端化**：`src/pages/WebApp/data` 下所有业务数据均为内置静态数据（资源/赛程/营销/应急/业绩），可直接本地预览，无接口调用
- **10 大功能模块统一 UI**：管理控制台 + 4 个赛事运营模块 + 智能视频营销中台 3 个 Tab + AI 分析平台 7 个 Tab，全部沿用同一套 CSS 变量主题（支持明/暗模式），无视觉割裂
- **原生 SVG 数据可视化**：折线 / 双折线 / 组合柱状 / 堆叠柱状 / 饼图 / ROI 气泡 / 资源热力图 / 篮球半场热区 / 雷达 / Donut 饼等均用纯 SVG + `useMemo` 手写，**无 echarts / chart.js 依赖**，压缩包体积稳定 <200KB gzip
- **真响应式**：兼容 375px（iPhone SE）→ 1920px（桌面宽屏），卡片、栅格、图表、表格在任意断点下不溢出、不抖动
- **可维护分层架构**：`pages/` → `modules/` → `components/` → `hooks/` → `data/`，业务模块解耦，可单独替换数据层对接真实 API

---

## 🧱 技术栈

| 层级         | 选型                                                       | 版本       |
| :----------- | :--------------------------------------------------------- | :--------- |
| UI 框架      | React + React Compiler 就绪                                | 19.1.x     |
| 路由         | React Router DOM（createBrowserRouter）                    | 7.14.x     |
| 构建工具     | Vite                                                       | 7.1.x      |
| 样式方案     | TailwindCSS 3 + CSS 自定义属性主题（明/暗双模式）          | 3.4.x      |
| PostCSS      | Autoprefixer                                               | 10.x       |
| 图标         | lucide-react（按需引入，无全量打包）                       | 0.552.x    |
| 辅助组件     | react-qr-code（预约二维码）、matter-js（物理演示 demo）    | /          |
| 代码质量     | ESLint 9 + `eslint-plugin-react-hooks` + `react-refresh`   | 9.36.x     |

---

## 🧭 功能模块总览

所有功能入口在顶栏「**管理控制台**」进入管理控制台：

```
┌────────────────────────────────────────────────────────────────────────┐
│  🧭 篮芯 AI 管理控制台（Dashboard）                                     │
│   ├── 🏟️ 赛制与赛程        · 4 赛制 Tab + 阶段甘特 + 对阵详情表          │
│   ├── 📦 资源使用清单      · 5 类资源筛选(联动计数) + 列表/热力图双视图    │
│   ├── 🚨 应急预案          · 5 类预案流程可视化 + 联系人 + 一键响应       │
│   ├── 🗓️ 可视化日程        · 拖拽排程 + 冲突高亮 + 多维度看板             │
│   ├── 🎬 智能视频营销中台  · 3 标签页                                    │
│   │       ├─ Tab1 视频营销   封面上传 + KPI 4宫格 + 播放趋势 + 画像 + AI建议
│   │       ├─ Tab2 业绩营收   森耐特品牌 + 4 高亮KPI + 15日曲线 + 21-26柱形
│   │       └─ Tab3 营销报表   30日追踪 + 近6月堆叠柱 + 占比排名 + Top5活动
│   └── 📊 篮芯 AI 分析平台  · 7 标签页（一场比赛的完整报告）               │
│           ├─ Tab1 数据统计        20 人15 列数据表 + 球队3档筛选           │
│           ├─ Tab2 进阶数据        队累计得分×ORtg双折线 + 6指标双对比条     │
│           ├─ Tab3 比赛报告(默认)  节切换chip + 攻防四要素 + 投篮分布 + 6指标
│           ├─ Tab4 球队进攻方式    4节得分构成堆叠柱 × 2队 + 占比Donut × 2
│           ├─ Tab5 球员进攻方式    Top6 堆叠柱 + 张伟 vs 孙明 6 维雷达 + 对比条
│           ├─ Tab6 比赛事件        3维筛选(队/节/类型) × 4节吸顶时间线 200+条
│           └─ Tab7 AI 热区渲染     SVG半场(三分线/三秒区/篮筐) + 82点散点热区
└────────────────────────────────────────────────────────────────────────┘
```

### 1) 🏟️ 赛制与赛程
- 循环赛 / 小组赛 / 单败淘汰 / 交叉淘汰，**4 种赛制一键切换**
- 赛程阶段甘特图 + 对阵详情表（裁判/场地/时间/比分状态）
- 关键词搜索 + 阶段筛选

### 2) 📦 资源使用清单
- **5 类资源**：人力 / 场地 / 物料 / 供应商外包 / 媒体宣传
- 左侧筛选：关键词 + 类别复选（**与筛选结果联动计数**） + 关联赛事下拉 + 状态单选 + 日期范围
- 右上双视图：**列表视图 / 热力图视图**（月历 30 天 × 5 类资源颜色块）

### 3) 🚨 应急预案
- 5 类预案：医疗急救 / 安保 / 消防 / 恶劣天气 / 设备故障
- 每类预案流程可视化（触发 → 响应 → 处置 → 复盘）+ 联系人 + 一键响应按钮

### 4) 🗓️ 可视化日程
- 场地 / 人力 / 活动多维度看板
- **原生 HTML5 Drag and Drop** 拖拽调整排程，冲突高亮红框提示
- 顶部日期滑动 + 详情抽屉

### 5) 🎬 智能视频营销中台 · 三 Tab
**Tab1 · 视频营销**
- 视频封面（默认 `/images/resources/main/fengmian.jpg`）+ 上传替换
- 互动 KPI 4 宫格（播放量 / 点赞 / 评论 / 分享）
- 播放趋势 7/30 日切换折线图 + 粉丝画像性别/年龄饼图
- AI 营销建议面板（一键复制到剪贴板）

**Tab2 · 森耐特 业绩与营收**
- 品牌介绍卡（里程碑时间轴 + 标签）+ 4 高亮超大号 KPI
- 3 大收益模式构成 + 近 15 日营业额 vs 净利润双折线
- 2021-2026 品牌营收结构（产品销售金 + 营销服务蓝，组合柱状图）

**Tab3 · 营销报表**
- 报表汇总 6 列 key figures（累计/月均/本月/环比/毛利率/曝光）
- 近 30 日增长追踪（营业额 vs 销量增长率双折线 35% 中枢）
- 近 6 月渠道月度营业额堆叠柱（抖音/视频号/B站/小红书/线下 5 层全可见 + 独立描边）
- 渠道占比排名卡（严格 Grid 对齐）+ Top5 营销 Campaign 表（5 列 Grid + 表头虚线分割）
- 每个标签页右上角提供「全屏展示」按钮（Web Fullscreen API）

### 6) 📊 篮芯 AI 分析平台 · 七 Tab 比赛报告（默认：东莞青年队 84 vs 广州青年队 68）

**Hero 比分卡**
- 双色 3px 顶栏：左深蓝 #0F2A5A / 右金 #D4AF37，两队列徽、战绩（4胜0负 / 1胜3负）
- 四节分表严格精确：Q1 22-15 / Q2 21-18 / Q3 23-19 / Q4 18-16；采集编号 LBX-AI-2026-0728-FRI
- `PLAYERS.dg.sum = 84`、`PLAYERS.gz.sum = 68`；EVENTS 每节得分事件精确对应节分

**Tab1 · 数据统计**
- 20 人 15 列数据表：位置/性别/时间/分/板/助/抢/帽/投篮%/三分%/罚球%/效率/+/-
- 3 档球队筛选（全部 / dg / gz），行 hover indigo 高亮，正负值红/绿区分

**Tab2 · 进阶数据**
- 2 张 DualLineChart：每节累计得分 vs 进攻效率 ORtg（东莞紫/绿，广州金/橙）
- 6 条对比条：Pace / ORtg / DRtg / eFG% / TOV% / ORB%，DG 深→靛渐变条、GZ 橙→金反向条

**Tab3 · 比赛报告（默认激活）**
- 全场/Q1-Q4 节切换 chip，攻防四要素 6 行百分位蓝橙 4 档色块（绿 4/蓝 3/橙 2/红 1）
- 投篮分布 6 行百分位表（3 区域 × 占比/命中率）+ 下方 2 张 6 指标球队横条对比卡（DG/GZ MVP 展示）

**Tab4 · 球队进攻方式**
- 2 张 StackedBarChart：各节得分 2 分 / 3 分 / 罚球构成
- 2 张 Donut 饼（3 区域占比）+ 2 × 3 命中率卡（篮下/中距离/三分，DG 紫底蓝字 / GZ 金底橙字）

**Tab5 · 球员进攻方式**
- Top6 得分手构成堆叠柱（2 分 / 3 分 / 罚球）
- 张伟 vs 孙明 6 维雷达图（归一化每维独立最大值）+ 右侧 6 项双条对比数值

**Tab6 · 比赛事件**
- 3 维筛选面板：球队（3 档）× 节次（5 档）× 事件类型（8 档：得分/篮板/传球/失误/犯规/换人/节间）
- 6 项事件分布计数卡；右侧吸顶 4 节时间线，得分 2 分紫 / 3 分绿 / 罚球黄，共 ≥ 200 事件

**Tab7 · AI 热区渲染**
- 560×520 SVG 半场：外框、三秒区、罚球半圆（实线+虚线）、三分线、篮筐、篮板、中线圆
- 队切换 dg/gz，过滤器：全部/命中/未中；命中点 DG 靛蓝/GZ 金实心圆，未中点灰空心圈
- 右侧 3 分区命中率卡（篮下/中距/三分 × 命中数/总数/进度条）+ 图例

---

## 🚀 快速开始

### 环境要求
- **Node.js** ≥ 18.17（Vite 7 要求）
- **npm** ≥ 9 或 pnpm ≥ 8 / yarn ≥ 1.22

### 安装 & 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/zqs74/Lanxin-UI.git
cd Lanxin-UI

# 2. 安装依赖（Vite 7 + React 19 + Tailwind 3）
npm install

# 3. 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

### 常用脚本

| 命令              | 说明                                              |
| :---------------- | :------------------------------------------------ |
| `npm run dev`     | 启动 Vite HMR 开发服务器                           |
| `npm run build`   | 生产构建到 `dist/`（Rollup Tree-Shaking + gzip 验证） |
| `npm run preview` | 本地预览生产构建产物（默认 http://localhost:4173）  |
| `npm run lint`    | ESLint 全量检查（React Hooks 规则 + Refresh 规则）  |

---

## 📁 目录结构

```
Lanxin-UI/
├─ index.html                          # Vite 入口（挂载点 #root）
├─ eslint.config.js                    # ESLint 9 Flat Config
├─ postcss.config.js                   # Autoprefixer
├─ tailwind.config.js                  # Tailwind content 配置 + 自定义
├─ vite.config.js                      # Vite 7 + @vitejs/plugin-react
├─ 开发文档.md / 开发要求说明.md        # 早期原始需求文档（保留存档）
├─ public/
│  ├─ logo.png
│  └─ images/
│     ├─ Matches/                      # 球员/赛事页占位图
│     └─ resources/                    # 资源模块图：venues/ suppliers/ media/ maps/ main/
└─ src/
   ├─ main.jsx                         # React 入口
   ├─ App.jsx + App.css
   ├─ index.css                        # 全局样式 + 主题 CSS 变量（明暗双模式）
   ├─ context/ThemeContext.jsx         # 主题切换 Context
   ├─ components/                      # 通用 UI：Navbar / Footer
   └─ pages/
      ├─ HomePage / PlayersPage / MatchesPage / ResourcesPage / DownloadPage   # 官网页
      └─ WebApp/                       # ⭐ 核心：管理控制台
         ├─ index.jsx                  # WebApp Router 出口（含面包屑）
         ├─ Dashboard.jsx              # KPI + 5 功能导航卡
         ├─ data/marketingMock.js      # 营销中台全部 Mock（含森耐特真实化数据）
         ├─ hooks/useMockApi.js        # 所有 Mock 的统一入口 Hook
         ├─ components/                # 图表/筛选/详情抽屉等可复用组件
         │   ├─ ComboBarChart.jsx      # 2021-2026 组合柱（产品销售金 + 营销服务蓝）
         │   ├─ StackedBarChart.jsx    # 近 6 月 5 渠道堆叠柱
         │   ├─ DualLineChart.jsx      # 双折线图（营业额 vs 净利润 / 增长中枢）
         │   ├─ TrendLineChart.jsx     # 播放趋势折线（7/30d 切换）
         │   ├─ RoiScatterChart.jsx    # 原气泡图（现横向排名卡，可随时切回）
         │   ├─ ResourceFilter.jsx     # 资源清单筛选面板（分类计数联动）
         │   ├─ ResourceTable.jsx      # 资源列表（排序/操作/抽屉）
         │   ├─ ResourceHeatmap.jsx    # 30 天 × 5 类资源月历热力图
         │   ├─ StatusPill.jsx         # 状态胶囊 + 颜色变量体系
         │   └─ DetailDrawer.jsx       # 通用详情抽屉
         └─ modules/                   # 6 大业务模块
             ├─ ScheduleModule.jsx      # 赛制与赛程
             ├─ ResourceUsage.jsx       # 资源使用清单（调用 Filter + Table + Heatmap）
             ├─ EmergencyPlan.jsx       # 应急预案
             ├─ VisualSchedule.jsx      # 可视化日程（含原生拖放）
             ├─ VideoMarketing.jsx      # 智能视频营销中台（3 Tab + 全屏按钮）
             ├─ AIAnalystPlatform.jsx   # 篮芯 AI 分析平台（7 Tab 比赛报告 + Hero比分卡）
             └─ original/
                 └─ AIVideoAnalysis.jsx # @deprecated 旧的 AI 上传页（已替代保留存档）
```

---

## 🎨 设计规范

### CSS 变量主题
`src/index.css` 中 `:root`（明）与 `[data-theme='dark']`（暗）定义了全部颜色变量，保证全站统一换肤：

```css
:root {
  --brand:       #D4AF37;   /* 森耐特金 / 品牌主色 */
  --ok:          #10B981;   /* 绿 / 成功、空闲 */
  --info:        #2563EB;   /* 蓝 / 信息、B站渠道 */
  --purple:      #7C3AED;   /* 紫 / 毛利率、线下渠道 */
  --warn:        #EA580C;   /* 橙 / 预警、小红书渠道 */
  --danger:      #DC2626;   /* 红 / 故障、供应商 */
  --text-primary / secondary / muted;
  --surface / surface-muted / border / card-base;
}
```

### 图表规范（SVG 原生）
- `preserveAspectRatio = 'xMidYMid meet'` + 外层 `aspect-ratio` 锁比例，**杜绝数字压扁**
- 所有渐变使用 `color-mix(in srgb, …)` 在 CSS 变量基础上做亮/暗混合，明/暗主题自动适配
- 数字一律 `tabular-nums`（等宽数字）+ 右对齐 Grid 列，严格不成「楼梯」

### 响应式断点
| 断点     | 典型设备        | 栅格布局策略                                  |
| :------- | :-------------- | :-------------------------------------------- |
| `<768px` | 手机竖屏        | 所有多列栅格 `col-span-12` 单列堆叠            |
| `≥768px` | 平板            | Dashboard 5 卡变 2~3 列；图表 2 列             |
| `≥1024px`| 笔记本          | 营销中台 2x2 KPI、报表 2 列图表主布局          |
| `≥1280px`| 桌面宽屏        | 列表视图 + 资源筛选 240px 侧栏固定              |

### 体积控制目标
- **生产主包 gzip ≤ 200KB**（长期维护红线，当前 193KB）
- 引入新库前先评估：能用原生 SVG / CSS / React 实现的就不引依赖

---

## 🧪 质量校验（本地必跑）

```bash
# 1. Lint（0 error / 0 warning 才能合入）
npm run lint

# 2. 生产构建成功 + 输出 bundle 大小
npm run build

# 3. 预览构建产物，人工过一遍 9 个模块主路径
npm run preview
```

---

## 📝 Git 提交规范（Conventional Commits）

本仓库使用 **Conventional Commits** 前缀规范：

```
<type>(<scope>): <subject>

<body 描述：做了什么、为什么、怎么验证>

<footer：破坏性变更 / 关联 ISSUE>
```

常用 type：
- `feat:` 新功能 / 新模块 / 新图表
- `fix:` 修复 bug（比如「筛选条一直显示 0 条」）
- `docs:` README、开发文档注释
- `style:` 纯 UI 美化、字号颜色、圆角统一
- `refactor:` 代码重构、无功能变更
- `perf:` 性能优化（体积、渲染）
- `build:` 构建脚本、依赖、Vite/Tailwind 配置
- `chore:` 杂项（.gitignore、临时文件清理）

示例（本次首个提交实际使用的格式）：

```
feat(webapp): 完成篮芯 AI 管理控制台 9 大功能模块
- 赛制与赛程：4 赛制切换 Tab + 阶段甘特 + 对阵详情表
- 资源使用清单：5 类资源筛选(联动计数) + 列表/热力图双视图
- 应急预案：5 类预案流程可视化 + 联系人
- 可视化日程：拖拽排程 + 冲突高亮 + 多维度看板
- 智能视频营销中台(3 Tab)：视频营销 / 森耐特业绩营收 / 营销报表
  - Tab2 2x2 高亮 KPI 居中放大、Tab3 报表严格 Grid 对齐
  - 全部 SVG 图表 preserveAspectRatio 等比 + aspect-ratio 外盒
  - 组合柱 / 堆叠柱独立描边+渐变，5 段 100% 可见无遮挡

build(perf): 主生产包 gzip 189KB，低于 200KB 红线
docs: 重写 README + 开发文档归档 + .gitignore 补齐 tmp 文件
```

---

## 🤝 贡献指南
1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交前必跑 `npm run lint && npm run build`
4. 发起 Pull Request，描述清楚「为什么做 / 怎么做 / 怎么验证」

---

## 📄 License
MIT © [zqs74](https://github.com/zqs74) · [1603712839@qq.com](mailto:1603712839@qq.com)
