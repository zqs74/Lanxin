# 昇梦体育 · 技术优势三 — 5张UI图设计方案与 opencode 提示词（v2 基于实际项目代码）

> 用途：技术优势三"智能视频营销系统"页面中，评估相关UI图 + 技术底座四步骤UI图，共5张。
> 接入位置：管理控制台 → 智能视频营销中台（VideoMarketing.jsx）→ 新增第4个 Tab「集锦追踪与评估」。
> 风格全部复用项目既有金色主题设计系统，自动适配亮色/深色模式。

---

## 一、项目实际设计系统（从代码提炼，必须严格遵循）

### 技术栈

- **React 19** + Vite + Tailwind CSS 3 + react-router v7
- **图标**：lucide-react（禁止用 emoji 或其他图标库）
- **图表**：纯 SVG 手写（项目无 ECharts，参照 `SkillRadarChart.jsx` 的 SVG 实现模式）
- **QR码**：react-qr-code（已安装）
- **主题**：`data-theme="dark|light"` 属性切换，全部用 CSS 变量

### CSS 变量系统（亮/深色自动适配，禁止硬编码颜色）

| 变量 | 深色模式值 | 亮色模式值 | 语义 |
|:---|:---|:---|:---|
| `--brand` | `#D4AF37` 金 | `#B8941F` 暗金 | 品牌主色/强调 |
| `--ok` | `#10B981` 绿 | `#059669` | 成功/正向 |
| `--warn` | `#F59E0B` 琥珀 | `#D97706` | 警告/提示 |
| `--danger` | `#EF4444` 红 | `#DC2626` | 错误/拦截 |
| `--info` | `#3B82F6` 蓝 | `#2563EB` | 信息/链接 |
| `--purple` | `#8B5CF6` 紫 | `#7C3AED` | 辅助分类 |
| `--text-primary` | `#ffffff` | `#1a1a1a` | 正文主色 |
| `--text-muted` | `#6b7280` | `#9ca3af` | 次要文字 |
| `--surface` | `#1a1610` | `#ffffff` | 卡片面 |
| `--surface-muted` | `#2a2418` | `#f0ede6` | 卡片次面/输入框 |
| `--border` | `rgba(212,175,55,0.2)` | `rgba(184,148,31,0.2)` | 边框 |
| `--bg-primary` | `#0a0a0a` | `#f5f3ee` | 页面背景 |

> **核心规则**：所有颜色必须用 `var(--xxx)`，禁止写死 `#D4AF37` 等值。这样亮/深色模式自动切换。

### 复用组件清单

| 组件 | 用法 | 说明 |
|:---|:---|:---|
| `card-base` | `<div className="card-base p-5">` | 渐变背景卡片 |
| `card-solid` | `<div className="card-base card-solid p-5">` | 纯色背景卡片（更常用） |
| `btn-accent` | `<button className="btn btn-accent">` | 金色主按钮 |
| `btn-ghost` | `<button className="btn btn-ghost">` | 幽灵按钮 |
| `StatusPill` | `<StatusPill variant="ok">生效中</StatusPill>` | 状态胶囊，variant: ok/warn/danger/info/purple/brand |
| `KpiStrip` | `<KpiStrip title="播放量" value="126.4" unit="万" trendDir="up" accent="brand" trend="↑8%" />` | KPI 卡片 |
| `input-base` | `<input className="input-base" />` | 输入框 |

### Tailwind 用法约定

- 间距用 Tailwind 原生：`gap-4`、`p-5`、`space-y-4`
- 网格：`grid grid-cols-1 lg:grid-cols-12 gap-4`，用 `col-span-X` 分栏
- 颜色一律 `text-[var(--brand)]`、`bg-[var(--surface-muted)]`、`border-[var(--border)]`
- 圆角：`rounded-2xl`（卡片）、`rounded-xl`（内部元素）、`rounded-full`（标签）
- 字号：`text-sm`（正文）、`text-xs`（说明）、`text-2xl font-bold`（标题）、`text-lg font-black tabular-nums`（数字）
- hover：`hover:border-[var(--brand)]/60`、`hover:bg-[var(--surface-muted)]`

### SVG 图表实现模式（参照 SkillRadarChart.jsx）

项目所有图表都是纯 SVG 手写，模式如下：
```
<svg viewBox="0 0 W H" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
  <defs><linearGradient id="xxx">...</linearGradient></defs>
  {/* 网格线：stroke="var(--border)" strokeDasharray="4 4" */}
  {/* 数据：fill="var(--brand)" stroke="var(--brand)" */}
  {/* 文字：fill="var(--text-muted)" fontSize="12" */}
</svg>
```
不用 ECharts、Chart.js 等库。tooltip 用 React state + 绝对定位 div 实现。

---

## 二、接入架构（5张图的代码组织）

### 文件规划

```
src/pages/WebApp/
├── modules/
│   └── HighlightTracking.jsx      ← 新建：集锦追踪与评估模块（含5个子页面 + 步骤导航）
├── components/
│   ├── TrackingRadarChart.jsx      ← 新建：五维评估雷达图
│   ├── TrackingTrendChart.jsx      ← 新建：传播趋势折线图
│   ├── SourceDonutChart.jsx        ← 新建：来源渠道环形图
│   ├── FlowSankeyChart.jsx         ← 新建：流量路径流向图
│   ├── QualityGaugeChart.jsx       ← 新建：数据质量仪表盘
│   ├── FunnelChart.jsx             ← 新建：转化漏斗图
│   └── RelationGraph.jsx           ← 新建：传播关系图谱
├── data/
│   └── trackingMock.js             ← 新建：5个页面的 mock 数据
├── hooks/
│   └── useMockApi.js               ← 修改：新增 useTrackingMock()
└── modules/
    └── VideoMarketing.jsx          ← 修改：TABS 新增第4项，渲染 HighlightTracking
```

### VideoMarketing.jsx 修改点

1. TABS 数组新增第4项：
```jsx
const TABS = [
  { key: 'video', label: '🎬 视频营销' },
  { key: 'brand', label: '🏀 森耐特 业绩与营收' },
  { key: 'report', label: '📊 营销报表' },
  { key: 'tracking', label: '🎯 集锦追踪与评估' }  // 新增
];
```
2. 主组件新增渲染分支：
```jsx
{tab === 'tracking' && <HighlightTracking />}
```
3. 顶部 import 新模块。

### HighlightTracking.jsx 内部结构

该模块含一个**步骤导航条**（评估 + Step1-4），通过内部 state 切换5个子页面：

```
[🎯 集锦价值评估] → [① 短链生成] → [② 来源追踪] → [③ 数据采集] → [④ 数据关联分析]
```

步骤条样式参照现有 TopTabs：圆角胶囊容器 + `btn-accent` 高亮当前步 + `btn-ghost` 未选中。

---

## 三、5张图设计思路速览

| 图 | 定位 | 核心布局 | 关键内容 |
|:---|:---|:---|:---|
| 评估看板 | 数据看板（只读+洞察） | 左雷达图 + 右趋势曲线 + 五维评分卡 + 底部建议 | 综合评分86、五维得分、传播趋势、智能建议 |
| Step1 短链生成 | 操作型界面 | 左集锦列表 + 右生成区（短链+二维码+渠道） | 选集锦→生成短链→绑定赛事球员→选渠道 |
| Step2 来源追踪 | 流量分析界面 | 左渠道环形图 + 中桑基图 + 右设备地域 + 底日志表 | 渠道占比、302跳转、点击日志 |
| Step3 数据采集 | 实时监控界面 | 左实时日志流 + 右质量指标卡 + 过滤规则 + 趋势图 | 实时回传、爬虫过滤、异常IP拦截 |
| Step4 数据关联与分析 | 洞察界面 | 左关系图谱 + 右四元组卡 + 转化漏斗 + 热度榜 | 传播数据链、关联图谱、漏斗、报告生成 |

---

## 四、opencode 提示词（每条独立可复制）

> 以下每条提示词生成一个 **React JSX 组件文件**，直接放入项目 `src/pages/WebApp/components/` 或 `modules/` 目录。
> 所有提示词已内嵌项目设计规范，无需额外补充上下文。

---

### 通用前置提示词（每次先发这条，让 opencode 了解项目上下文）

```
我有一个 React 19 + Vite + Tailwind CSS 3 项目（篮球赛事智慧运营平台"篮芯AI"），需要你帮我写新的 UI 组件。

【项目设计系统 - 必须严格遵循】
1. 主题：data-theme="dark|light" 切换，全部用 CSS 变量，禁止硬编码颜色
2. CSS 变量：
   --brand(#D4AF37金)、--ok(#10B981绿)、--warn(#F59E0B)、--danger(#EF4444红)、--info(#3B82F6蓝)、--purple(#8B5CF6紫)
   --text-primary、--text-muted、--surface、--surface-muted、--border、--bg-primary
3. 卡片类名：card-base（渐变）、card-solid（纯色），hover 自动变边框色
4. 按钮：btn btn-accent（金色主按钮）、btn btn-ghost（幽灵按钮）
5. 图标：从 lucide-react 导入，如 import { Copy, Check, Sparkles } from 'lucide-react'
6. 图表：纯 SVG 手写，不用 ECharts。用 var(--brand) 等变量着色，stroke="var(--border)" 画网格线
7. 状态胶囊组件 StatusPill：<StatusPill variant="ok">生效中</StatusPill>，variant 可选 ok/warn/danger/info/purple/brand
8. KPI卡片组件 KpiStrip：<KpiStrip title="播放量" value="126" unit="万" trendDir="up" accent="brand" trend="↑8%" />
9. Tailwind：grid grid-cols-1 lg:grid-cols-12 gap-4 分栏，col-span-X 占位
10. 颜色在 Tailwind 中写法：text-[var(--brand)]、bg-[var(--surface-muted)]、border-[var(--border)]
11. 文件中已有这些组件可导入：StatusPill(../components/StatusPill.jsx)、KpiStrip(../components/KpiStrip.jsx)

请基于以上规范生成代码。每个组件用 export default 导出。
```

---

### 提示词 1：评估看板（集锦价值多维评估）

```
基于项目设计系统，创建组件 HighlightEvaluation.jsx（集锦价值多维评估看板）。

这是一个篮球赛事视频营销系统后台页面，展示某条集锦视频的多维价值评估。

【数据来源】
从 props 接收 data 对象，包含：
- radarData: [{label:'基础流量',value:92},{label:'用户画像',value:78},{label:'行为深度',value:85},{label:'时间发布',value:90},{label:'传播路径',value:81}]
- overallScore: 86
- trend7: [{day:1,plays:3200,completion:58,interaction:3.2},...7天数据]
- dimensions: [{key:'traffic',label:'基础流量',icon:'Users',value:92,trend:'up',pct:15,advice:'播放量12.8万，传播广度优秀'},...5个维度]
- suggestions: ['建议发布时间：周五 20:00-22:00（历史完播率峰值时段）','建议优先分发渠道：抖音 / 微信视频号（当前渗透率不足）']

【布局结构】
1. 顶部栏：左侧标题"集锦价值多维评估"（text-xl font-bold），右侧集锦选择下拉（显示"粤BA半决赛·张子轩三分绝杀"）+ 时间选择下拉（近7天）+ btn-accent 按钮"导出报告"（FileDown图标）
2. 主体左侧 col-span-5：雷达图卡片（card-solid p-5）
   - 卡片标题"价值评估雷达" + StatusPill variant="brand" 显示"综合评分"
   - SVG 雷达图：5维，网格用 var(--border) 虚线，数据多边形 fill="var(--brand)" opacity=0.2 stroke="var(--brand)"，顶点圆点
   - 雷达图中心叠加 div 绝对定位：大数字 86（text-5xl font-black text-[var(--brand)]）+ "综合评分"小字
   - 底部5个维度数值网格 grid-cols-5，每个显示 label + value
3. 主体右侧 col-span-7：上半趋势图 + 下半评分卡
   - 趋势图卡片 card-solid p-5：标题"传播效果趋势"，SVG 折线图3条线（播放量 var(--info)、完播率 var(--ok)、互动率 var(--brand)），带数据点圆点，底部图例
   - 5维评分卡 grid-cols-5 gap-2：每张 card-solid p-3，结构：
     顶部 lucide 图标（Users/FileText/Clock/Calendar/Share2）+ 维度名（text-xs text-muted）
     中间大数字（text-2xl font-black tabular-nums，颜色用 var(--对应色)）
     趋势箭头（TrendingUp 绿 / TrendingDown 红）+ pct%
     底部 advice 文字（text-[11px] text-muted leading-snug）
4. 底部建议条：card-solid p-4，左侧 Lightbulb 图标 + "智能优化建议"标题，右侧两行建议文字，左侧 border-l-4 border-[var(--brand)]

【SVG 雷达图实现要点】
参照以下模式（viewBox 0 0 320 320，中心 160,160）：
- 5层网格多边形（20/40/60/80/100），stroke="var(--border)" strokeDasharray="4 4"
- 5条轴线从中心到顶点
- 数据多边形：fill="var(--brand)" fillOpacity="0.2" stroke="var(--brand)" strokeWidth="2.5"
- 顶点圆点：circle r="5" fill="var(--brand)" + 内圈 r="2" fill="white"
- 维度标签文字：fill="var(--text-muted)" fontSize="12"

【SVG 折线图实现要点】
- viewBox 0 0 480 200
- Y轴左侧刻度线 stroke="var(--border)"
- 3条 polyline，strokeWidth="2" fill="none"，每条不同颜色
- 数据点 circle r="3"
- X轴标签 fill="var(--text-muted)" fontSize="10"

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 2：Step1 短链生成

```
基于项目设计系统，创建组件 ShortLinkGenerator.jsx（短链生成操作界面）。

这是篮球赛事视频营销系统功能页，运营人员选择集锦并生成可追踪短链。

【数据来源】
从 props 接收：
- highlights: 6条集锦列表，每条 {id,title,tournament,player,duration,selected}
  数据：粤BA半决赛·张子轩三分绝杀(选中)、粤BA半决赛·李明超扣篮集锦、莞篮新星·决赛十佳球、省青赛·王伟压哨三分、城联赛·快攻反击配合、村BA·绝杀时刻
- generatedLinks: 3条已生成短链 {shortUrl,highlight,channel,status,clicks,createdAt}
- currentLink: {url:'https://smty.tv/s/8K2x9',channels:['抖音','微信']}

【顶部】
- 左：Link2 图标(lucide) + "短链生成"标题（text-xl font-bold）+ 副标题"为每条集锦生成唯一可溯源短链"（text-sm text-muted）
- 右：步骤进度条——5个圆点横排（评估→短链生成(高亮)→来源追踪→数据采集→数据分析），当前步用 bg-[var(--brand)] 圆点，未到步用 bg-[var(--surface-muted)]，圆点间 w-8 h-px bg-[var(--border)] 连线

【主体 - 左右两栏，左 col-span-5 右 col-span-7】

左栏 card-solid p-5：集锦选择列表
- 标题行：flex justify-between，左"选择集锦"（font-bold），右"共6条"（text-xs text-muted）
- 6条列表，每条是一个 div className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)] hover:border-[var(--brand)]/60 transition-all cursor-pointer"
  选中态额外加 className="border-[var(--brand)] bg-[var(--brand)]/8"
  内容：左侧 64x40 深色渐变方块（bg-gradient-to-br from-[var(--surface-muted)] to-[var(--bg-primary)]）内放 Play 图标；中间标题（text-sm font-medium）+ 标签行（StatusPill variant="info" 赛事名 + StatusPill variant="purple" 球员名）+ 时长（text-xs text-muted）；右侧复选框（选中用 Check 图标 var(--brand) 圆形，未选中用空圆圈 border）
- 底部 flex justify-between：左"全选"text 按钮，右 btn-ghost "批量生成"

右栏：生成区
- 上方 card-solid p-4：已选集锦信息
  flex items-center gap-3：左缩略图方块 + 标题 + 右侧4个绑定标签（每个 px-2.5 py-1 rounded-lg bg-[var(--info)]/15 text-[var(--info)] text-xs）：赛事:粤BA / 球员:张子轩#23 / 球队:东莞宏远 / 日期:2026-08-03
- 中间 card-solid p-6：生成结果（核心）
  居中布局：
  - react-qr-code 二维码组件，size=120，bgColor="var(--surface)" fgColor="var(--text-primary)"
    import QRCode from 'react-qr-code'
    <QRCode value="https://smty.tv/s/8K2x9" size={120} bgColor="var(--surface)" fgColor="var(--text-primary)" />
  - 二维码下方：短链地址行 flex items-center gap-2：span className="font-mono text-sm text-[var(--text-primary)]" 显示 https://smty.tv/s/8K2x9 + btn-ghost 按钮（Copy图标，点击变 Check 图标 var(--ok)）
  - 渠道选择标签横排 flex flex-wrap gap-2：微信/微博/抖音/小红书/视频号/直接分享，选中的用 bg-[var(--brand)] text-black px-3 py-1.5 rounded-full text-xs，未选中用 border border-[var(--border)] text-[var(--text-muted)]
  - 底部居中两按钮：btn-accent "生成短链"（Sparkles图标）+ btn-ghost "批量生成全部"
- 下方 card-solid p-5：已生成短链列表
  表头 grid-cols-[1fr_1.5fr_0.8fr_0.8fr_0.8fr_0.8fr] text-xs text-muted font-bold border-b
  3行数据，每行同 grid 布局，hover:bg-[var(--surface-muted)]/40
  状态列用 StatusPill：生效中 variant="ok"，已暂停 variant="pending"
  点击数列用 text-[var(--brand)] font-bold tabular-nums

所有交互用 React useState 管理状态（选中集锦、渠道多选、复制按钮反馈）。
组件用 export default 导出。
```

---

### 提示词 3：Step2 来源追踪

```
基于项目设计系统，创建组件 SourceTracking.jsx（来源追踪流量分析界面）。

这是篮球赛事视频营销系统后台，展示用户点击短链后的来源渠道、设备、地域及302重定向日志。

【数据来源】
从 props 接收：
- channels: [{name:'微信',pct:35,color:'ok'},{name:'抖音',pct:28,color:'danger'},{name:'微博',pct:18,color:'info'},{name:'直链',pct:12,color:'brand'},{name:'其他',pct:7,color:'purple'}]
- totalClicks: 12847
- flowData: 桑基图节点和连线（来源→302重定向→结果）
- deviceSplit: [{name:'移动端',pct:78},{name:'PC端',pct:22}]
- regions: [{rank:1,city:'东莞',clicks:3892},{rank:2,city:'广州',clicks:2541},{rank:3,city:'深圳',clicks:1873},{rank:4,city:'中山',clicks:956},{rank:5,city:'珠海',clicks:624}]
- clickLogs: 6条点击日志 {time,channel,device,ip,region,status,latency}

【顶部】
- 左：Navigation 图标 + "来源追踪"标题 + 副标题"追踪每一次点击的来源、设备与跳转路径"
- 右：短链下拉 + 时间下拉"近7天" + btn-accent "导出追踪报告"（Download图标）
- 下方步骤进度条：当前步=来源追踪高亮

【主体布局】

第一行 grid-cols-3 gap-4：
1. 左卡 card-solid p-5：来源渠道分布
   - 标题"来源渠道分布"
   - SVG 环形图（viewBox 0 0 200 200）：用 path 画环形扇区，每段不同 var(--xxx) 颜色，内圈半径70外圈95
   - 环中心绝对定位 div：大数字 12,847（text-3xl font-black tabular-nums）+ "总点击"text-xs text-muted
   - 底部图例列表：每行 圆点+渠道名+百分比，5行

2. 中卡 card-solid p-5：流量路径桑基图
   - 标题"点击→302跳转→播放 路径流向"
   - SVG 简化桑基图（viewBox 0 0 400 200）：
     左侧4个来源节点矩形（不同颜色），中间2个动作节点（点击短链、302重定向），右侧2个结果节点（成功播放 var(--ok)、跳转失败 var(--danger)）
     节点间用贝塞尔曲线连接，strokeWidth 按流量大小，stroke 用 var(--对应色) opacity=0.3
     "302重定向"节点高亮：加金色边框 stroke="var(--brand)" strokeWidth="2"
   - 底部小字说明"302重定向：用户无感知跳转，中间完成埋点采集"

3. 右卡 card-solid p-5：设备与地域
   - 上半：标题"设备分布" + SVG 迷你环形图（移动端78% var(--info) / PC端22% var(--surface-muted)）
   - 下半：标题"地域 TOP5" + 5行列表
     每行 grid-cols-[24px_1fr_60px]：排名数字 + 城市名 + 进度条（div h-1.5 rounded-full bg-[var(--surface-muted)] 内嵌 div bg-[var(--info)] width=百分比）+ 点击数

第二行 card-solid p-5：实时点击日志表
- 标题行 flex justify-between：左"点击日志"（font-bold）+ 右侧"实时"绿点（w-2 h-2 rounded-full bg-[var(--ok)] + animate-pulse）+ 筛选标签（全部/微信/抖音/微博/异常，全部选中态）
- 表格 grid-cols-[80px_80px_100px_1fr_120px_80px]：
  表头 text-xs text-muted font-bold border-b
  6行数据，每行 hover:bg-[var(--surface-muted)]/40
  - 时间列 font-mono text-xs
  - 渠道列用 StatusPill 对应颜色
  - 跳转状态：成功 "302→播放" 前加 Check 图标 var(--ok)，失败"跳转超时"前加 X 图标 var(--danger)
  - 响应耗时：正常白字 font-mono，超时(5000ms)用 text-[var(--danger)]
  - 第2行整行高亮：bg-[var(--brand)]/8 border-l-4 border-[var(--brand)]

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 4：Step3 数据采集

```
基于项目设计系统，创建组件 DataCollection.jsx（数据采集实时监控界面）。

这是篮球赛事视频营销系统后台，监控点击日志实时回传、爬虫与异常IP过滤、数据质量。

【数据来源】
从 props 接收：
- stats: {totalClicks:12847, validClicks:11932, validPct:93, spiderBlocked:682, spiderUA:537, spiderFreq:145, ipBlocked:233, ipHighFreq:189, ipGeoJump:44}
- liveLogs: 约15条实时日志 {time,src,dev,ip,status,reason}
  其中2条是拦截：一条爬虫(Bot/spider)，一条异常IP(异常高频)
- filterRules: {spider:['UA黑名单(Googlebot/Bingbot等)','请求频率>60次/分钟','无Referer头检测'], ip:['同IP高频点击>100次/小时','IP地域突变检测','代理池特征识别']}
- trend24h: 24小时数据 [{hour,raw,cleaned},...]

【顶部】
- 左：Activity 图标 + "数据采集"标题 + 副标题"实时回传·智能清洗·保证数据真实有效"
- 右：实时状态——w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse + "采集中"文字 + "今日累计 12,847 条"text-sm text-muted
- 步骤进度条：当前步=数据采集高亮

【主体 - 左右两栏，左 col-span-4 右 col-span-8】

左栏 card-solid p-4：实时数据流（终端风格）
- 标题行：左"实时数据流"（text-sm font-bold）+ 右"●LIVE"（w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse + text-[10px] text-[var(--danger)]）
- 日志区 div className="bg-[var(--bg-primary)] rounded-xl p-3 font-mono text-[11px] leading-relaxed max-h-[400px] overflow-y-auto"
  约15行，每行格式：[时间] src:来源 dev:设备 ip:IP → 状态
  - 时间用 text-[var(--text-muted)]
  - src 用 text-[var(--info)]
  - ip 用 text-[var(--text-muted)]
  - "有效✓" 用 text-[var(--ok)]
  - "拦截✗" 用 text-[var(--danger)]
  - 拦截原因用 text-[var(--warn)] 括号标注
  示例行：[20:23:10] src:未知 ua:Bot/spider ip:66.249.x.x → 拦截✗(爬虫)
- 底部 text-[10px] text-muted："仅显示最近15条 · 自动滚动"

右栏上半 grid-cols-4 gap-3：4个质量指标卡（card-solid p-4）
- 卡1：总点击数 12,847（text-3xl font-black text-[var(--text-primary)] tabular-nums）+ "今日总点击" + 右上 TrendingUp var(--ok) "↑8.3%"。左侧 border-l-4 border-[var(--info)]
- 卡2：有效点击 11,932（text-[var(--ok)]）+ "有效数据·占比93%" + 进度条93%绿色。左侧 border-l-4 border-[var(--ok)]
- 卡3：爬虫过滤 682（text-[var(--danger)]）+ "已过滤爬虫" + 小字"UA黑名单537 / 频率异常145"。左侧 border-l-4 border-[var(--danger)]
- 卡4：异常IP 233（text-[var(--warn)]）+ "异常IP拦截" + 小字"高频189 / 地域突变44"。左侧 border-l-4 border-[var(--warn)]

右栏中部 card-solid p-4：过滤规则面板
- 标题行 flex justify-between：左 ShieldCheck 图标 + "智能过滤规则"，右 StatusPill variant="ok" "规则生效中"
- grid-cols-2 gap-4：
  左列标题"爬虫识别"（text-xs font-bold text-muted）+ 3条规则，每条 flex items-center gap-2：Check 图标 var(--ok) + 规则名 text-sm
  右列标题"异常IP识别" + 3条规则，同上

右栏底部 card-solid p-5：数据采集趋势
- 标题"24小时回传趋势" + 图例（灰色方块"原始数据" + 绿色方块"清洗后有效"）
- SVG 柱状+折线组合图（viewBox 0 0 480 160）：
  X轴 00:00-23:00 每3小时刻度
  灰色柱状（fill var(--surface-muted)）= 原始回传量
  绿色折线（stroke var(--ok)）+ 面积渐变（fill var(--ok) opacity 0.1）= 清洗后有效量
  底部 X 轴标签 fill="var(--text-muted)" fontSize="9"

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 5：Step4 数据关联与分析

```
基于项目设计系统，创建组件 DataAnalysis.jsx（数据关联与分析洞察界面）。

这是篮球赛事视频营销系统后台，将点击数据与赛事/球员信息融合，形成"视频→谁在看→从哪来→哪个球员"完整传播数据链。

【数据来源】
从 props 接收：
- graphNodes: [{id:'video',label:'张子轩三分绝杀',type:'video',r:40},{id:'player',label:'张子轩#23',type:'player',r:30},{id:'team',label:'东莞宏远',type:'team',r:28},{id:'event',label:'粤BA半决赛',type:'event',r:28},{id:'aud1',label:'18-25岁男性',type:'audience',r:20},...]
- graphLinks: [{source:'video',target:'player',value:100},{source:'video',target:'team',value:80},...]
- dataChain: [{icon:'Film',label:'视频',value:'12,847次播放',sub:'张子轩三分绝杀',color:'brand'},{icon:'User',label:'谁在看',value:'18-25岁 62%',sub:'男性为主·学生群体',color:'info'},{icon:'MapPin',label:'从哪来',value:'微信 45%',sub:'抖音28%·微博18%',color:'ok'},{icon:'Trophy',label:'哪个球员',value:'张子轩 热度↑',sub:'传播力排名#1',color:'danger'}]
- funnel: [{stage:'曝光',value:52300,pct:100},{stage:'点击',value:12847,pct:24.6},{stage:'播放',value:11204,pct:21.5},{stage:'完播',value:8179,pct:15.6},{stage:'互动',value:4134,pct:7.9},{stage:'分享',value:987,pct:1.9}]
- hotPlayers: [{rank:1,name:'张子轩',heat:9820,trend:'up',pct:12},{rank:2,name:'李明超',heat:6541,trend:'up',pct:8},{rank:3,name:'陈浩',heat:4203,trend:'up',pct:5},{rank:4,name:'王伟',heat:2876,trend:'down',pct:-3},{rank:5,name:'赵磊',heat:1549,trend:'up',pct:2}]

【顶部】
- 左：Share2 图标 + "数据关联与分析"标题 + 副标题"融合赛事球员数据，还原完整传播链路"
- 右：分析视角标签组（按赛事/按球员(选中)/按渠道，选中态 btn-accent，其余 btn-ghost）+ btn-accent "生成传播力分析报告"（FileText图标）
- 步骤进度条：当前步=数据分析高亮

【主体 - 左右两栏，左 col-span-5 右 col-span-7】

左栏 card-solid p-5：传播关系图谱
- 标题"传播关系图谱" + 副标题"视频-球员-球队-赛事-观众 多维关联"（text-xs text-muted）
- SVG 力导向关系图（viewBox 0 0 400 360）：
  节点类型颜色映射：video→var(--brand)、player→var(--info)、team→var(--ok)、event→var(--danger)、audience→var(--purple)
  中心节点"张子轩三分绝杀"放中央（cx=200 cy=180 r=40），其余节点环绕分布
  节点用 circle + text 标签，连线用 line stroke="var(--brand)" strokeOpacity="0.3" strokeWidth 按 value
  节点 hover 时高亮（React state 控制 stroke 加粗）
  底部图例横排：5个圆点+类型名
- 卡片左侧 border-l-4 border-[var(--brand)]

右栏上半：传播数据链四元组
- 标题"传播数据链"（text-sm font-bold mb-3）
- 4张卡片横排 grid-cols-4 gap-2，卡片间用 ArrowRight 图标（lucide）连接
  每张 card-solid p-3 text-center：
  顶部 lucide 图标（从 dataChain.icon 映射）+ label（text-xs text-muted）
  中间 value（text-lg font-black tabular-nums，颜色用 var(--对应color)）
  底部 sub（text-[10px] text-muted）
  卡片顶部 border-t-2（颜色对应 color）

右栏中部 card-solid p-5：转化漏斗
- 标题"传播转化漏斗"
- SVG 漏斗图（viewBox 0 0 400 240）：
  6层梯形从上到下递减，颜色从 var(--brand) 渐变到 var(--info)
  每层右侧标注数值和百分比
  每层间标注转化率（如"87.2%"）用 text-[var(--text-muted)] fontSize="10"
- 底部说明"从曝光到分享，完整还原传播转化路径"

右栏底部 card-solid p-5：球员传播热度榜
- 标题行 flex justify-between：左 Trophy 图标 + "球员传播热度 TOP5"，右 text-xs text-muted "近7天"
- 5行列表，每行 grid-cols-[32px_1fr_80px_60px_1fr] items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-muted)]/40：
  - 排名：rank<=3 用奖牌emoji替代（🥇🥈🥉），其余用数字圆圈
  - 球员名（text-sm font-semibold）
  - 热度值（text-sm font-black tabular-nums text-[var(--brand)]）
  - 趋势：trend='up' 用 TrendingUp var(--ok) + "+pct%"，down 用 TrendingDown var(--danger)
  - 迷你进度条：div h-2 rounded-full bg-[var(--surface-muted)] 内嵌 div bg-gradient-to-r from-[var(--brand)] to-[var(--ok)] width=heat/maxHeat*100%

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 6：HighlightTracking 主模块 + Mock数据（组装5个子页面）

```
基于项目设计系统，创建两个文件：

## 文件1：src/pages/WebApp/data/trackingMock.js

导出5个子页面所需的 mock 数据：
- EVALUATION_DATA：评估看板数据（radarData 5维、overallScore 86、trend7 7天趋势、dimensions 5个维度详情、suggestions 2条建议）
- HIGHLIGHTS：6条集锦列表
- GENERATED_LINKS：3条已生成短链
- SOURCE_DATA：来源追踪数据（channels 5渠道、flowData 桑基图、deviceSplit、regions 5城市、clickLogs 6条）
- COLLECTION_DATA：数据采集数据（stats 4指标、liveLogs 15条、filterRules、trend24h 24小时）
- ANALYSIS_DATA：数据分析数据（graphNodes 8节点、graphLinks、dataChain 4元组、funnel 6层、hotPlayers 5球员）

球员用：张子轩#23/李明超/陈浩/王伟/赵磊
赛事用：粤BA半决赛/莞篮新星/省青赛/城联赛/村BA
球队用：东莞宏远
数据数值要合理自洽（如总点击12847 = 各渠道加总、有效11932 = 总数-爬虫682-异常IP233）

## 文件2：src/pages/WebApp/modules/HighlightTracking.jsx

集锦追踪与评估主模块，包含：
1. 步骤导航条（参照 VideoMarketing 的 TopTabs 模式）：
   5个步骤标签横排：🎯 集锦价值评估 → ① 短链生成 → ② 来源追踪 → ③ 数据采集 → ④ 数据关联分析
   用 useState 管理当前步骤，选中态 btn-accent，其余 btn-ghost
   容器 className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]"
2. 全屏按钮（Maximize2/Minimize2 图标，参照 VideoMarketing 的 toggleFullscreen 实现）
3. 根据 useState step 渲染对应子组件：
   step='evaluate' → <HighlightEvaluation data={EVALUATION_DATA} />
   step='shortlink' → <ShortLinkGenerator highlights={HIGHLIGHTS} generatedLinks={GENERATED_LINKS} />
   step='source' → <SourceTracking data={SOURCE_DATA} />
   step='collection' → <DataCollection data={COLLECTION_DATA} />
   step='analysis' → <DataAnalysis data={ANALYSIS_DATA} />
4. import 子组件路径：../components/HighlightEvaluation.jsx 等
5. import mock 数据：from '../data/trackingMock.js'

同时修改 VideoMarketing.jsx：
1. TABS 数组新增 { key: 'tracking', label: '🎯 集锦追踪与评估' }
2. import HighlightTracking
3. 渲染分支新增 {tab === 'tracking' && <HighlightTracking />}

同时修改 useMockApi.js：
新增 export const useTrackingMock = () => { return { evaluation, highlights, generatedLinks, sourceData, collectionData, analysisData } }

组件用 export default 导出 HighlightTracking。
```

---

## 五、使用说明

1. **先发"通用前置提示词"**给 opencode，让它了解项目设计系统。
2. 然后依次发提示词1-5生成5个子组件，最后发提示词6生成主模块+mock数据+修改接入。
3. 生成的文件放入对应目录：
   - 子组件 → `src/pages/WebApp/components/`
   - 主模块 → `src/pages/WebApp/modules/`
   - mock数据 → `src/pages/WebApp/data/`
4. 修改 `VideoMarketing.jsx` 的 TABS 和渲染分支，`useMockApi.js` 新增 hook。
5. 所有组件自动适配亮色/深色模式（因为用 CSS 变量）。
6. 图表是纯 SVG，无额外依赖。二维码用已安装的 react-qr-code。
7. 若 opencode 生成的 SVG 图表不够精确，可追问"把XX图的坐标/比例调整一下"。

### 与 v1 方案的关键差异

| 维度 | v1（旧） | v2（基于实际代码） |
|:---|:---|:---|
| 配色 | 深蓝黑+橙 #0a0e1a+#f5a623 | 金色主题 var(--brand) #D4AF37 |
| 主题 | 仅深色 | 亮/深色自动切换（CSS变量） |
| 图表 | ECharts CDN | 纯 SVG 手写 |
| 组件 | 自定义 | 复用 card-solid/btn-accent/StatusPill/KpiStrip |
| 图标 | emoji | lucide-react |
| 产物 | 独立HTML文件 | React JSX 组件，直接集成项目 |
| 接入 | 独立页面 | VideoMarketing 第4个 Tab |
| 二维码 | CSS模拟 | react-qr-code（已安装） |
