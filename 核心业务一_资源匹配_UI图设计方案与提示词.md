# 昇梦体育 · 核心业务一 — 资源匹配全流程3张UI图设计方案与 opencode 提示词

> 用途：核心业务一"极速办赛资源中台"中，资源匹配全流程的3张UI图：输入需求 → 自动匹配 → 输出清单。
> 接入位置：管理控制台 → 新增功能入口「资源智能匹配」（Dashboard 新增 FeatureCard + index.jsx 新增 view）。
> 风格全部复用项目既有金色主题设计系统，自动适配亮色/深色模式。

---

## 一、项目实际设计系统（从代码提炼，必须严格遵循）

### 技术栈

- **React 19** + Vite + Tailwind CSS 3 + react-router v7
- **图标**：lucide-react（禁止用 emoji 或其他图标库）
- **图表**：纯 SVG 手写（项目无 ECharts，参照 `SkillRadarChart.jsx` 的 SVG 实现模式）
- **主题**：`data-theme="dark|light"` 属性切换，全部用 CSS 变量

### CSS 变量系统（亮/深色自动适配，禁止硬编码颜色）

| 变量 | 深色模式值 | 亮色模式值 | 语义 |
|:---|:---|:---|:---|
| `--brand` | `#D4AF37` 金 | `#B8941F` 暗金 | 品牌主色/强调 |
| `--ok` | `#10B981` 绿 | `#059669` | 成功/正向 |
| `--warn` | `#F59E0B` 琥珀 | `#D97706` | 警告/提示 |
| `--danger` | `#EF4444` 红 | `#DC2626` | 错误/风险 |
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
| `StatusPill` | `<StatusPill variant="ok">已匹配</StatusPill>` | 状态胶囊，variant: ok/warn/danger/info/purple/brand |
| `KpiStrip` | `<KpiStrip title="匹配资源" value="126" unit="项" trendDir="up" accent="brand" trend="↑8%" />` | KPI 卡片 |
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

### 现有资源模块结构

项目已有 `ResourceUsage.jsx`（资源使用清单），含列表视图和热力图视图，左侧固定筛选面板。资源分类5类：
- cat1 人力资源（info蓝）— 对应PPT「人才库」
- cat2 场地资源（ok绿）— 对应PPT「场馆资源库」
- cat3 物料资源（warn琥珀）— 对应PPT「体育用品库」
- cat4 供应商/外包（danger红）
- cat5 媒体/宣传（purple紫）— 对应PPT「宣发媒体库」

**资源匹配全流程是全新模块**，与现有资源清单互补：资源清单是"查看管理已有分配"，资源匹配是"输入需求→AI匹配→输出清单"的办赛前置流程。

---

## 二、PPT核心内容（从图片提取）

### 四库数据（匹配的数据源）

| 库名 | 数量 | 详情 |
|:---|:---|:---|
| 宣发媒体库 | 357家媒体 + 55个社群 | 地方媒体资源、篮球爱好者社群 |
| 场馆资源库 | 257个球场 | 覆盖东莞25个镇街，村村有球场 |
| 体育用品库 | 1,956条采购记录 | 合作38家供应商 |
| 人才库 | 230名注册人员 | 裁判115 / 教练46 / 记录台后勤69，历史评分3,257条 |

### 资源匹配全流程

```
输入需求 → 自动匹配 → 输出清单
```

最终清单 = 整场赛事各种资源的整合（PPT文案组反馈）

### 三级赛事体系

| 级别 | 层级 | 占比 | 示例 |
|:---|:---|:---|:---|
| Ⅰ级 | 省市级 | 23% | 粤BA |
| Ⅱ级 | 区县级 | 27% | 东莞镇BA |
| Ⅲ级 | 村级 | 50% | 莞篮村BA |

### 传统 vs 昇梦对比

| 维度 | 传统办赛 | 昇梦办赛 |
|:---|:---|:---|
| 排程 | 人工3-5天 | AI 10分钟 |
| 人员选派 | 电话经验选人 | AI标签精准匹配 |
| 内容制作 | 人工撰写剪辑 | AI自动剪辑撰写 |

---

## 三、接入架构（3张图的代码组织）

### 接入位置决策

**新增独立模块**，不嵌入现有 ResourceUsage。原因：
1. 资源匹配是办赛前置流程（赛前），资源清单是赛中/赛后管理
2. 两者面向角色不同：匹配面向"赛事组织者"，清单面向"资源管理员"
3. 功能定位不同：匹配是"AI生成"，清单是"查看管理"

### 文件规划

```
src/pages/WebApp/
├── modules/
│   └── ResourceMatching.jsx              ← 新建：资源智能匹配主模块（含3步流程 + 步骤导航）
├── components/
│   ├── RequirementInput.jsx              ← 新建：图1 输入需求
│   ├── AutoMatching.jsx                  ← 新建：图2 自动匹配
│   └── ResourceOutputList.jsx            ← 新建：图3 输出清单
├── data/
│   └── resourceMatchingMock.js           ← 新建：3个页面的 mock 数据
├── hooks/
│   └── useMockApi.js                     ← 修改：新增 useResourceMatchingMock()
├── components/
│   └── FeatureCard.jsx                   ← 修改：新增 'matching' variant
├── Dashboard.jsx                         ← 修改：功能导航新增 'matching' 入口
└── index.jsx                             ← 修改：新增 case 'matching' 渲染分支
```

### index.jsx 修改点

1. VIEW_NAME 新增：
```jsx
const VIEW_NAME = {
  dashboard: '总览',
  ai: '运动数据分析中台',
  schedule: '赛制与赛程',
  resource: '资源使用清单',
  emergency: '应急预案',
  visual: '可视化日程',
  timeline: '智能视频营销中台',
  ppt: 'PPT 内容绘制区',
  matching: '资源智能匹配'  // 新增
};
```

2. import 新模块：
```jsx
import ResourceMatching from './modules/ResourceMatching.jsx';
```

3. renderView 新增分支：
```jsx
case 'matching':
  return <ResourceMatching />;
```

### Dashboard.jsx 修改点

功能导航网格新增 'matching' 卡片：
```jsx
{['ai', 'schedule', 'resource', 'emergency', 'visual', 'timeline', 'matching'].map((v) => (
  <FeatureCard key={v} variant={v} onClick={() => onNavigate(v)} />
))}
```

### FeatureCard.jsx 修改点

1. import 新图标：
```jsx
import { Video, Trophy, Package, ShieldAlert, CalendarPlus, Megaphone, PanelsTopLeft, Wand2 } from 'lucide-react';
```

2. FEATURE_META 新增：
```jsx
matching: {
  Icon: Wand2,
  title: '资源智能匹配',
  summary: '',
  isNew: true,
},
```

3. renderPreview 新增 `case 'matching'` 分支（画一个3步流程缩略图：输入→匹配→输出）

### ResourceMatching.jsx 内部结构

该模块含一个**步骤导航条**（3步流程），通过内部 state 切换3个子页面：

```
[① 输入需求] → [② 自动匹配] → [③ 输出清单]
```

步骤条样式参照现有 TopTabs 模式：圆角胶囊容器 + `btn-accent` 高亮当前步 + `btn-ghost` 未选中。
步骤间用 ArrowRight 图标连接。步骤进度可前进不可后退跳转（Step1完成→可进Step2→完成→可进Step3，但可回看）。

---

## 四、3张图设计思路速览

| 图 | 定位 | 核心布局 | 关键内容 |
|:---|:---|:---|:---|
| 输入需求 | 操作型表单界面 | 左四库概览卡 + 右分步需求表单 + 底部需求摘要 | 赛事信息/场馆/人员/物料/媒体5模块表单 |
| 自动匹配 | AI匹配过程界面 | 左匹配进度时间轴 + 右四库匹配结果卡 + 底部冲突预警 | 匹配进度动画、匹配率、冲突检测、替代推荐 |
| 输出清单 | 资源整合看板 | 顶部汇总KPI + 四库分类清单 + 右侧成本时间统计 + 底部导出 | 整场赛事资源整合清单、成本汇总、时间轴 |

---

## 五、opencode 提示词（每条独立可复制）

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
5. 图标：从 lucide-react 导入，如 import { Wand2, ArrowRight, Check, AlertTriangle } from 'lucide-react'
6. 图表：纯 SVG 手写，不用 ECharts。用 var(--brand) 等变量着色，stroke="var(--border)" 画网格线
7. 状态胶囊组件 StatusPill：<StatusPill variant="ok">已匹配</StatusPill>，variant 可选 ok/warn/danger/info/purple/brand
8. KPI卡片组件 KpiStrip：<KpiStrip title="匹配资源" value="126" unit="项" trendDir="up" accent="brand" trend="↑8%" />
9. Tailwind：grid grid-cols-1 lg:grid-cols-12 gap-4 分栏，col-span-X 占位
10. 颜色在 Tailwind 中写法：text-[var(--brand)]、bg-[var(--surface-muted)]、border-[var(--border)]
11. 文件中已有这些组件可导入：StatusPill(../components/StatusPill.jsx)、KpiStrip(../components/KpiStrip.jsx)
12. 禁止用 emoji，所有图标从 lucide-react 导入
13. 输入框类名：input-base，下拉用原生 select 加 input-base 样式

请基于以上规范生成代码。每个组件用 export default 导出。
```

---

### 提示词 1：输入需求（RequirementInput.jsx）

```
基于项目设计系统，创建组件 RequirementInput.jsx（资源匹配-输入需求界面）。

这是篮球赛事智慧运营平台"极速办赛资源中台"的第一步：赛事组织者输入办赛需求，系统从四库（人才库/场馆库/物料库/媒体库）中匹配资源。

【数据来源】
从 props 接收 data 对象，包含：
- databases: [
    { id: 'talent', name: '人才库', icon: 'Users', count: 230, detail: '裁判115 / 教练46 / 记录台后勤69', color: 'info', scoreRecords: '3,257条评分记录' },
    { id: 'venue', name: '场馆资源库', icon: 'Building2', count: 257, detail: '覆盖东莞25个镇街·村村有球场', color: 'ok', scoreRecords: '含场地设施评分' },
    { id: 'material', name: '体育用品库', icon: 'Package', count: 1956, detail: '合作38家供应商', color: 'warn', scoreRecords: '历史采购1,956单' },
    { id: 'media', name: '宣发媒体库', icon: 'Megaphone', count: 357, detail: '地方媒体357家 + 篮球社群55个', color: 'purple', scoreRecords: '含传播效果数据' }
  ]
- tournaments: [
    { id: 't1', name: '粤BA半决赛', level: 'Ⅰ级', levelLabel: '省市级' },
    { id: 't2', name: '东莞镇BA', level: 'Ⅱ级', levelLabel: '区县级' },
    { id: 't3', name: '莞篮村BA', level: 'Ⅲ级', levelLabel: '村级' }
  ]
- requirement: 当前已填需求对象（受控表单）

【顶部步骤导航条】
- 容器 className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]"
- 3个步骤横排，步骤间用 ArrowRight 图标（lucide）连接：
  ① 输入需求（当前高亮 btn-accent）→ ② 自动匹配（btn-ghost 禁用态 opacity-50）→ ③ 输出清单（btn-ghost 禁用态）
- 每个步骤前加数字圆圈：当前步 bg-[var(--brand)] text-black，未到步 bg-[var(--surface-muted)] text-muted

【布局结构 - 左右两栏，左 col-span-4 右 col-span-8】

左栏：四库概览（space-y-3）
- 标题行：Database 图标 + "四库资源总览"（text-sm font-bold）+ text-xs text-muted "AI匹配数据源"
- 4张数据库卡片，每张 card-solid p-4：
  顶部行 flex items-center gap-2：lucide图标（从databases.icon映射：Users/Building2/Package/Megaphone）圆角方块 bg-[var(--对应color)]/15 + 图标颜色 var(--对应color) + 库名（text-sm font-bold）
  中间大数字（text-2xl font-black tabular-nums 颜色用var(--对应color)）+ 单位"个/条/家"
  下方 detail 文字（text-xs text-muted leading-snug）
  底部 scoreRecords 文字（text-[10px] text-muted）前加 Star 图标 var(--brand)
  左侧 border-l-3（颜色对应 color）
- 底部汇总卡 card-solid p-3 text-center：
  "四库总资源"（text-xs text-muted）+ "2,800+"（text-2xl font-black text-[var(--brand)] tabular-nums）+ "可匹配资源项"（text-xs text-muted）

右栏：分步需求表单（card-solid p-5 space-y-5）
- 标题行 flex justify-between：左 ClipboardList 图标 + "办赛需求录入"（text-base font-bold），右 StatusPill variant="brand" "Step 1 / 3"

- 模块1：基本信息（border-b border-[var(--border)] pb-4）
  标题"赛事基本信息"（text-sm font-bold mb-3）+ Calendar 图标
  grid-cols-2 gap-3：
  - 赛事选择：select input-base，选项 粤BA半决赛/东莞镇BA/莞篮村BA
  - 赛事级别：自动联动显示，如选"粤BA半决赛"则显示"Ⅰ级 · 省市级"（StatusPill variant="brand"）
  - 比赛日期：input type="date" input-base
  - 比赛天数：input type="number" input-base，默认值3
  - 每日比赛场数：input type="number" input-base，默认值4
  - 总比赛场数：自动计算显示（如"共12场"），text-[var(--brand)] font-bold

- 模块2：场馆需求（border-b border-[var(--border)] pb-4）
  标题"场馆需求"（text-sm font-bold mb-3）+ Building2 图标
  grid-cols-2 gap-3：
  - 场馆类型：标签组（室内/室外/综合），选中态 bg-[var(--brand)] text-black px-3 py-1.5 rounded-full text-xs
  - 需要场地数：input type="number" 默认2
  - 最小容量：input type="number" 默认500 + 单位"人"
  - 区域偏好：select（莞城/南城/东城/万江/松山湖/不限）
  - 配套需求：多选标签组（热身场/更衣室/媒体室/发布会厅/停车场/医疗室），选中态同上
  - 特殊要求：input-base 文本框（placeholder="如需要直播转播车通道"）

- 模块3：人员需求（border-b border-[var(--border)] pb-4）
  标题"人员需求"（text-sm font-bold mb-3）+ Users 图标
  grid-cols-3 gap-3，每行一个角色：
  | 角色 | 人数input | 级别select |
  裁判 | input默认6 | 国家级/一级/二级/不限
  记录台 | input默认4 | 不限
  医护人员 | input默认3 | 执业医师/急救员/不限
  安保人员 | input默认10 | 不限
  志愿者 | input默认20 | 不限
  每个角色行：grid-cols-[100px_1fr_1fr] items-center gap-3
  角色名 text-sm，人数 input-base w-20，级别 select input-base text-xs

- 模块4：物料需求（border-b border-[var(--border)] pb-4）
  标题"物料需求"（text-sm font-bold mb-3）+ Package 图标
  grid-cols-2 gap-3，6项：
  - 比赛用球：input默认24 + 单位"个"
  - 记分牌/24秒器：input默认4 + 单位"套"
  - 篮架/篮筐：input默认2 + 单位"副"
  - 奖杯奖牌：input默认12 + 单位"套"
  - 球衣/参赛服：input默认60 + 单位"件"
  - 饮用水/补给：input默认200 + 单位"份"
  每项：flex items-center gap-2，标签 text-sm w-32，input input-base w-20，单位 text-xs text-muted

- 模块5：媒体宣发需求
  标题"媒体宣发需求"（text-sm font-bold mb-3）+ Megaphone 图标
  grid-cols-2 gap-3：
  - 直播需求：标签组（官方直播/自媒体直播/无需直播），选中态同上
  - 摄影团队：标签组（专业摄影/赛事跟拍/无需），选中态同上
  - 社媒推广：多选标签（微信公众号/抖音/B站/微博/小红书/视频号）
  - 媒体邀请：input默认5 + 单位"家" + text-xs text-muted "地方媒体邀请数"

- 底部操作栏（flex justify-between items-center pt-2）：
  左：预算上限 input-base w-32 + text-xs text-muted "元"（placeholder="不限"）
  右：btn-accent "开始智能匹配"（Wand2图标 + ArrowRight图标）+ btn-ghost "保存草稿"（Save图标）

所有表单用 React useState 管理状态。所有文字用中文。组件用 export default 导出。
```

---

### 提示词 2：自动匹配（AutoMatching.jsx）

```
基于项目设计系统，创建组件 AutoMatching.jsx（资源匹配-自动匹配界面）。

这是篮球赛事智慧运营平台"极速办赛资源中台"的第二步：AI根据输入的需求，从四库中自动匹配最优资源，检测冲突并推荐替代方案。

【数据来源】
从 props 接收 data 对象，包含：
- matchProgress: [
    { id: 'talent', name: '人才库匹配', icon: 'Users', status: 'done', matched: 48, total: 48, duration: '2.3s', color: 'info' },
    { id: 'venue', name: '场馆资源库匹配', icon: 'Building2', status: 'done', matched: 3, total: 3, duration: '1.1s', color: 'ok' },
    { id: 'material', name: '体育用品库匹配', icon: 'Package', status: 'done', matched: 186, total: 200, duration: '3.8s', color: 'warn' },
    { id: 'media', name: '宣发媒体库匹配', icon: 'Megaphone', status: 'done', matched: 12, total: 12, duration: '1.5s', color: 'purple' }
  ]
- matchResults: {
    talent: [
      { role: '主裁判', name: '李建国', level: '国家级', rating: 4.8, experience: 156, status: 'matched', score: 96 },
      { role: '第一副裁', name: '王志强', level: '一级', rating: 4.6, experience: 98, status: 'matched', score: 92 },
      { role: '记录台长', name: '张秀芳', level: '一级', rating: 4.7, experience: 120, status: 'matched', score: 94 },
      { role: '医护负责人', name: '陈医生', level: '执业医师', rating: 4.9, experience: 80, status: 'matched', score: 95 },
      { role: '安保队长', name: '刘铁柱', level: '高级安保', rating: 4.5, experience: 200, status: 'matched', score: 90 }
    ],
    venue: [
      { name: '东莞市篮球中心主馆', type: '室内', capacity: 8000, location: '东城', facilities: ['热身场','更衣室','媒体室','停车场'], rating: 4.9, status: 'matched', score: 98 },
      { name: '东城体育公园篮球馆', type: '室内', capacity: 2000, location: '东城', facilities: ['热身场','更衣室','停车场'], rating: 4.6, status: 'matched', score: 91 },
      { name: '莞城体育馆', type: '室内', capacity: 1500, location: '莞城', facilities: ['更衣室','停车场'], rating: 4.3, status: 'alternative', score: 85 }
    ],
    material: [
      { name: '斯伯丁TF-500比赛用球', qty: 24, unit: '个', supplier: '东莞文体供应', status: 'matched', score: 95 },
      { name: '专业记分系统(含24秒)', qty: 4, unit: '套', supplier: '恒天体育', status: 'matched', score: 93 },
      { name: '冠军奖杯+奖牌套装', qty: 12, unit: '套', supplier: '金鼎工艺', status: 'matched', score: 90 },
      { name: '参赛服(定制印花)', qty: 60, unit: '件', supplier: '速干体育', status: 'matched', score: 88 },
      { name: 'Gatorade补给套装', qty: 200, unit: '份', supplier: '佳得乐代理', status: 'shortage', shortageQty: 50, score: 76 }
    ],
    media: [
      { name: '东莞广播电视台体育频道', type: '官方直播', reach: '50万+', status: 'matched', score: 94 },
      { name: '篮芯AI自媒体矩阵', type: '自媒体直播', reach: '30万+', status: 'matched', score: 90 },
      { name: '东莞日报体育版', type: '文字报道', reach: '20万+', status: 'matched', score: 87 },
      { name: '抖音篮球大V(3人)', type: '社媒推广', reach: '100万+', status: 'matched', score: 92 }
    ]
  }
- conflicts: [
    { type: 'time', desc: '主裁判李建国 8月20日 14:00 已有粤BA另一场执法任务', severity: 'warn', solution: '推荐备选：赵国华（一级·评分4.7·经验89场）' },
    { type: 'shortage', desc: 'Gatorade补给套装库存仅150份，缺口50份', severity: 'danger', solution: '推荐替代：宝矿力水特运动饮料（库存充足·价格相近）' }
  ]
- stats: { totalMatched: 249, totalRequired: 263, matchRate: 94.7, avgScore: 92.3, duration: '8.7s' }

【顶部步骤导航条】
同输入需求页，当前高亮第2步"自动匹配"。步骤1显示已完成（Check图标 + 绿色）。

【布局结构 - 左右两栏，左 col-span-5 右 col-span-7】

左栏：匹配进度与统计（space-y-4）

1. 匹配进度卡 card-solid p-5：
   - 标题行 flex justify-between：左 Cpu 图标 var(--brand) + "AI匹配进度"（text-sm font-bold），右 StatusPill variant="ok" "匹配完成"
   - 4个数据库匹配进度条，每个 space-y-1.5：
     顶部行 flex justify-between：
       左：lucide图标（对应color圆角方块 w-7 h-7）+ 库名（text-xs font-bold）
       右：matched/total（text-xs tabular-nums）+ Check图标 var(--ok)
     进度条：div h-2 rounded-full bg-[var(--surface-muted)]，内嵌 div width=matched/total% rounded-full bg-[var(--对应color)]
     底部行：text-[10px] text-muted "耗时 {duration}"
   - 底部分隔线 border-t pt-3：
     4格 grid-cols-4 gap-2 text-center：
     总匹配 249(brand) | 总需求 263(muted) | 匹配率 94.7%(ok) | 平均分 92.3(brand)
     每格上方 text-[10px] text-muted，下方 text-lg font-black tabular-nums
     "总耗时 8.7秒"text-xs text-muted text-center mt-2

2. 冲突预警卡 card-solid p-4：
   - 标题行：AlertTriangle 图标 var(--warn) + "冲突与异常预警"（text-sm font-bold）+ StatusPill variant="warn" "2项需处理"
   - 2条冲突项 space-y-3：
     每条 border-l-3 pl-3（warn用var(--warn)，danger用var(--danger)）：
     顶部行 flex items-center gap-2：
       图标（AlertTriangle/Clock）对应颜色 + desc 文字（text-xs）
     底部行：Lightbulb 图标 var(--brand) + solution 文字（text-xs text-muted）
   - 无冲突时显示空态：Check 图标 var(--ok) + "无冲突，全部资源匹配成功"

右栏：四库匹配结果（space-y-4）

1. 匹配结果标签切换：
   容器 className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
   4个标签（人才库/场馆库/物料库/媒体库），用 useState 管理当前选中
   选中态：style={{ color: 'white', background: 'var(--对应color)' }} className="rounded-lg px-3 py-1.5 text-xs font-bold"
   未选中：className="rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--text-muted)]"
   每个标签后括号显示匹配数

2. 当前库匹配结果 card-solid p-5（根据选中标签渲染不同内容）：

   【人才库选中时】
   标题行 flex justify-between：左"人才匹配结果"（text-sm font-bold），右 text-xs text-muted "按匹配分排序"
   5行人员列表，每行 grid-cols-[60px_1fr_60px_50px_50px_60px] items-center gap-2 p-2.5 rounded-xl hover:bg-[var(--surface-muted)]/40 border-b border-[var(--border)]：
   - 角色标签（StatusPill variant="info"）
   - 姓名（text-sm font-semibold）+ 级别（text-[10px] text-muted）
   - 评分（text-sm font-bold tabular-nums text-[var(--brand)] + Star图标）
   - 经验场数（text-xs tabular-nums text-muted）
   - 状态（matched→StatusPill ok"已匹配" / alternative→StatusPill warn"备选"）
   - 匹配分（text-lg font-black tabular-nums，95+用var(--ok)，90+用var(--brand)，85以下用var(--warn)）
   匹配分用迷你进度条可视化：div h-1 rounded-full bg-[var(--surface-muted)] 内嵌 div width=score% bg-[var(--brand)]

   【场馆库选中时】
   3行场馆列表，每行 p-3 rounded-xl border border-[var(--border)]：
   - 顶部行 flex justify-between：场馆名（text-sm font-bold）+ 状态标签
   - 中间行 grid-cols-4 gap-2 text-xs：类型 | 容量8000人 | 位置东城 | 评分4.9
   - 底部行：配套设施标签横排（每个 px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[10px] text-muted）
   - 右上角匹配分大数字

   【物料库选中时】
   5行物料列表，每行 grid-cols-[1fr_60px_80px_60px_50px] items-center gap-2 p-2.5 border-b：
   - 物料名（text-sm）+ 供应商（text-xs text-muted）
   - 数量（text-sm tabular-nums）
   - 供应商名（text-xs text-muted）
   - 状态（matched→ok / shortage→danger"缺货{shortageQty}"）
   - 匹配分

   【媒体库选中时】
   4行媒体列表，每行 grid-cols-[1fr_80px_80px_50px] items-center gap-2 p-2.5 border-b：
   - 媒体名（text-sm font-semibold）+ 类型（text-xs text-muted）
   - 类型标签（StatusPill）
   - 触达量（text-sm tabular-nums text-[var(--brand)]）
   - 匹配分

3. 底部操作栏 card-solid p-4 flex justify-between items-center：
   左：Check 图标 var(--ok) + "匹配完成 · 249/263项已匹配" + text-xs text-muted "2项需人工确认"
   右：btn-ghost "返回修改需求"（ArrowLeft图标）+ btn-accent "确认匹配·生成清单"（ArrowRight图标）

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 3：输出清单（ResourceOutputList.jsx）

```
基于项目设计系统，创建组件 ResourceOutputList.jsx（资源匹配-输出清单界面）。

这是篮球赛事智慧运营平台"极速办赛资源中台"的第三步：将匹配结果整合为整场赛事的完整资源清单，按四库分类展示，含成本汇总和时间安排，可导出。

【数据来源】
从 props 接收 data 对象，包含：
- eventInfo: { tournament: '粤BA半决赛', level: 'Ⅰ级·省市级', date: '2026-08-20 ~ 2026-08-22', totalMatches: 12, venues: 2, days: 3 }
- summary: { totalResources: 249, totalCost: 386500, costSaved: 52000, matchRate: 94.7, categories: 4 }
- categorySummary: [
    { id: 'talent', name: '人才资源', icon: 'Users', count: 48, cost: 86000, color: 'info', items: [
      { role: '裁判组', detail: '主裁1+副裁2+技术代表1 ×12场', count: 48, unit: '人次', cost: 36000, contact: '李建国 138xxxx', status: 'confirmed' },
      { role: '记录台', detail: '记录台长1+记录员2+计时员1 ×12场', count: 48, unit: '人次', cost: 18000, contact: '张秀芳 139xxxx', status: 'confirmed' },
      { role: '医护组', detail: '执业医师1+急救员2 ×3天', count: 9, unit: '人次', cost: 12000, contact: '陈医生 137xxxx', status: 'confirmed' },
      { role: '安保组', detail: '安保队长1+安保10 ×3天', count: 33, unit: '人次', cost: 15000, contact: '刘铁柱 135xxxx', status: 'confirmed' },
      { role: '志愿者', detail: '引导10+后勤10 ×3天', count: 60, unit: '人次', cost: 5000, contact: '团委协调', status: 'confirmed' }
    ]},
    { id: 'venue', name: '场馆资源', icon: 'Building2', count: 3, cost: 120000, color: 'ok', items: [
      { role: '主比赛场馆', detail: '东莞市篮球中心主馆 · 8000人 · 室内', count: 1, unit: '馆', cost: 80000, contact: '场馆管理中心 222xxxx', status: 'confirmed' },
      { role: '备用场馆', detail: '东城体育公园篮球馆 · 2000人 · 室内', count: 1, unit: '馆', cost: 25000, contact: '东城文体局 223xxxx', status: 'confirmed' },
      { role: '热身场地', detail: '莞城体育馆副馆 · 500人', count: 1, unit: '馆', cost: 15000, contact: '莞城文体局 224xxxx', status: 'confirmed' }
    ]},
    { id: 'material', name: '物料资源', icon: 'Package', count: 186, cost: 95600, color: 'warn', items: [
      { role: '比赛用球', detail: '斯伯丁TF-500 ×24个', count: 24, unit: '个', cost: 7200, contact: '东莞文体供应 228xxxx', status: 'confirmed' },
      { role: '记分系统', detail: '专业记分牌+24秒器 ×4套', count: 4, unit: '套', cost: 8000, contact: '恒天体育 229xxxx', status: 'confirmed' },
      { role: '奖杯奖牌', detail: '冠军奖杯+MVP+12套奖牌', count: 13, unit: '套', cost: 18000, contact: '金鼎工艺 230xxxx', status: 'confirmed' },
      { role: '参赛服装', detail: '速干定制印花 ×60件', count: 60, unit: '件', cost: 12000, contact: '速干体育 231xxxx', status: 'confirmed' },
      { role: '餐饮补给', detail: 'Gatorade 150份 + 宝矿力 50份', count: 200, unit: '份', cost: 8000, contact: '佳得乐代理 232xxxx', status: 'partial' },
      { role: '其他物料', detail: '篮架/篮网/胶带/号码布等', count: 85, unit: '件', cost: 42400, contact: '多供应商', status: 'confirmed' }
    ]},
    { id: 'media', name: '媒体宣发', icon: 'Megaphone', count: 12, cost: 84900, color: 'purple', items: [
      { role: '官方直播', detail: '东莞广播电视台体育频道 ×3天', count: 1, unit: '项', cost: 45000, contact: '广电中心 233xxxx', status: 'confirmed' },
      { role: '自媒体直播', detail: '篮芯AI矩阵(抖音+视频号+B站)', count: 1, unit: '项', cost: 12000, contact: '内部团队', status: 'confirmed' },
      { role: '摄影团队', detail: '专业摄影2人 ×3天 赛事跟拍', count: 6, unit: '人天', cost: 9000, contact: '光影工作室 234xxxx', status: 'confirmed' },
      { role: '媒体报道', detail: '东莞日报+南方都市报+3家地方媒体', count: 5, unit: '家', cost: 8900, contact: '媒体联络组', status: 'confirmed' },
      { role: '社媒推广', detail: '抖音篮球大V3人 + 微信公众号2个', count: 5, unit: '个', cost: 10000, contact: '运营团队', status: 'confirmed' }
    ]}
  ]
- costBreakdown: [
    { category: '人才资源', amount: 86000, pct: 22.3, color: 'info' },
    { category: '场馆资源', amount: 120000, pct: 31.0, color: 'ok' },
    { category: '物料资源', amount: 95600, pct: 24.7, color: 'warn' },
    { category: '媒体宣发', amount: 84900, pct: 22.0, color: 'purple' }
  ]
- timeline: [
    { day: 'Day 1 (8/20)', phase: '赛前准备', items: '场馆布置/物料入场/人员到位', status: 'prepare' },
    { day: 'Day 1 (8/20)', phase: '小组赛 ×4场', items: '裁判4组/记录台4组/直播1场', status: 'match' },
    { day: 'Day 2 (8/21)', phase: '小组赛 ×4场', items: '裁判4组/记录台4组/直播1场', status: 'match' },
    { day: 'Day 3 (8/22)', phase: '淘汰赛 ×4场', items: '裁判4组/记录台4组/直播2场/颁奖', status: 'match' },
    { day: 'Day 3 (8/22)', phase: '赛后收尾', items: '物料清点/场馆恢复/数据归档', status: 'wrapup' }
  ]

【顶部步骤导航条】
同前两页，当前高亮第3步"输出清单"。步骤1、2显示已完成（Check图标 + 绿色）。

【布局结构】

1. 顶部赛事信息卡 card-solid p-4：
   flex items-center justify-between
   左侧 flex items-center gap-4：
   - Trophy 图标 var(--brand) 圆角方块 w-10 h-10
   - 赛事名"粤BA半决赛"（text-lg font-bold）+ StatusPill variant="brand" "Ⅰ级·省市级"
   - 分隔线 |
   - CalendarDays 图标 + "2026-08-20 ~ 08-22"（text-sm text-muted）
   - 分隔线 |
   - "12场 / 3天 / 2馆"（text-sm text-muted）
   右侧：btn-ghost "返回匹配"（ArrowLeft图标）+ btn-accent "导出完整清单"（Download图标）+ btn-ghost "打印"（Printer图标）

2. 汇总KPI条 grid-cols-4 gap-4：
   4张 KpiStrip 卡片：
   - 总资源项 249 项 accent="brand" trend="覆盖4大资源库"
   - 总预算 ¥386,500 accent="info" trend="↓节省¥52,000"
   - 匹配率 94.7 % accent="ok" trend="249/263项已匹配"
   - 确认率 97.6 % accent="purple" trend="仅6项待确认"

3. 主体左右两栏 grid-cols-12 gap-4：

左栏 col-span-8：四库分类清单（space-y-4）

每个库一个 card-solid p-5：
- 卡片标题行 flex justify-between：
  左：lucide图标（对应color圆角方块 w-8 h-8）+ 库名（text-base font-bold）+ 资源数（StatusPill 对应color "{count}项"）
  右：小计金额（text-lg font-black tabular-nums text-[var(--对应color)]）+ "元"
- 库内清单表：
  表头 grid-cols-[1.5fr_2fr_60px_80px_1fr_50px] text-xs text-muted font-bold border-b border-[var(--border)] pb-2：
  项目 | 详情 | 数量 | 费用 | 联系人 | 状态
  每行同 grid 布局 py-2.5 border-b border-[var(--border)]/50 hover:bg-[var(--surface-muted)]/30：
  - 项目名（text-sm font-semibold）
  - 详情（text-xs text-muted）
  - 数量（text-sm tabular-nums）
  - 费用（text-sm font-bold tabular-nums text-[var(--text-primary)]）
  - 联系人（text-xs text-muted）
  - 状态（confirmed→StatusPill ok"已确认" / partial→StatusPill warn"部分确认"）
- 卡片底部行 flex justify-between border-t pt-3 mt-2：
  左：text-xs text-muted "共{count}项 · {confirmedCount}项已确认"
  右：text-xs text-muted "小计 ¥{cost}"

4个库卡片用不同左侧 border-l-3 颜色区分（info/ok/warn/purple）

右栏 col-span-4：成本分布 + 时间轴（space-y-4）

1. 成本分布卡 card-solid p-5：
   - 标题行 flex justify-between：左 PieChart 图标 + "成本分布"（text-sm font-bold），右 text-xs text-muted "总预算 ¥386,500"
   - SVG 环形图（viewBox 0 0 180 180）：
     用 path 画4段环形扇区，每段不同 var(--对应color) 颜色
     内圈半径55 外圈75
     环中心绝对定位 div：大数字"38.6万"（text-2xl font-black tabular-nums text-[var(--brand)]）+ "总预算"text-xs text-muted
   - 底部图例列表 4行：
     每行 flex items-center justify-between：
     左：圆点(对应color) + 类别名（text-xs）
     右：金额（text-xs font-bold tabular-nums）+ 占比（text-[10px] text-muted）
   - 底部节省提示 div mt-3 p-2 rounded-lg bg-[var(--ok)]/10：
     TrendingDown 图标 var(--ok) + "AI匹配较传统采购节省 ¥52,000（↓11.9%）"（text-xs text-[var(--ok)]）

2. 赛事时间轴卡 card-solid p-5：
   - 标题行 flex justify-between：左 CalendarDays 图标 + "赛事资源时间轴"（text-sm font-bold），右 text-xs text-muted "3天 / 5个阶段"
   - 5个时间节点竖排 space-y-0：
     每个节点 flex gap-3 items-start：
     左侧竖线+圆点：圆点 w-3 h-3 rounded-full
       prepare→var(--info) / match→var(--brand) / wrapup→var(--purple)
     右侧内容：
       day（text-xs font-bold text-[var(--text-primary)]）
       phase（text-sm font-semibold）
       items（text-xs text-muted leading-snug）
     节点间用 w-px h-8 bg-[var(--border)] 竖线连接

4. 底部确认条 card-solid p-4：
   flex items-center justify-between
   左侧 flex items-center gap-3：
   CheckCircle2 图标 var(--ok) + "资源清单已生成"（text-base font-bold）+ text-xs text-muted "整场赛事资源整合完成 · 可导出Excel/PDF"
   右侧：btn-accent "确认清单·下发执行"（Check图标 + Send图标）

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 4：ResourceMatching 主模块 + Mock数据（组装3个子页面）

```
基于项目设计系统，创建两个文件：

## 文件1：src/pages/WebApp/data/resourceMatchingMock.js

导出3个子页面所需的 mock 数据：
- DATABASES：四库概览数据（人才库230/场馆库257/用品库1956/媒体库357）
- TOURNAMENTS：3个赛事选项（粤BAⅠ级/东莞镇BAⅡ级/莞篮村BAⅢ级）
- REQUIREMENT_TEMPLATE：需求表单模板（含默认值）
- MATCH_PROGRESS：4库匹配进度（talent 48/48 done / venue 3/3 done / material 186/200 done / media 12/12 done）
- MATCH_RESULTS：4库匹配结果详情（talent 5人 / venue 3馆 / material 5类 / media 4项，每项含score）
- CONFLICTS：2条冲突（1条时间冲突warn + 1条物料缺货danger，含solution）
- MATCH_STATS：统计（totalMatched 249 / totalRequired 263 / matchRate 94.7 / avgScore 92.3 / duration 8.7s）
- EVENT_INFO：赛事信息（粤BA半决赛 / Ⅰ级 / 2026-08-20~22 / 12场 / 3天 / 2馆）
- OUTPUT_SUMMARY：输出汇总（totalResources 249 / totalCost 386500 / costSaved 52000 / matchRate 94.7）
- CATEGORY_SUMMARY：4库分类清单（每库含5-6项资源，每项含role/detail/count/unit/cost/contact/status）
  人才库48项86000元 / 场馆库3项120000元 / 物料库186项95600元 / 媒体库12项84900元
  各项status：大部分confirmed，1项partial（餐饮补给）
- COST_BREAKDOWN：4库成本占比（人才22.3%/场馆31.0%/物料24.7%/媒体22.0%）
- TIMELINE：5个时间节点（Day1准备/Day1小组赛/Day2小组赛/Day3淘汰赛/Day3收尾）

数据数值要合理自洽：
- 各库cost加总 = totalCost (86000+120000+95600+84900 = 386500)
- 各库count加总 = totalResources (48+3+186+12 = 249)
- costSaved = 传统预算 - totalCost (438500 - 386500 = 52000)

## 文件2：src/pages/WebApp/modules/ResourceMatching.jsx

资源智能匹配主模块，包含：

1. 顶部栏：
   - 左：Wand2 图标(lucide-react) + "资源智能匹配"标题（text-xl font-bold）+ 副标题"输入需求 → AI自动匹配 → 输出整场赛事资源清单"（text-sm text-muted）
   - 右：btn-ghost "查看历史匹配记录"（History图标）+ btn-ghost "匹配设置"（Settings图标）

2. 步骤导航条（核心交互）：
   3个步骤横排，用 useState 管理当前步骤（'input'|'matching'|'output'）：
   ① 输入需求 → ② 自动匹配 → ③ 输出清单
   容器 className="flex flex-wrap items-center gap-3 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]"
   每个步骤按钮 flex items-center gap-2：
   - 数字圆圈 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
     当前步：bg-[var(--brand)] text-black
     已完成步：bg-[var(--ok)] text-white + Check图标
     未到步：bg-[var(--surface-muted)] text-[var(--text-muted)]
   - 步骤名 text-sm font-bold
   - 当前步文字 text-[var(--text-primary)]，已完成 text-[var(--ok)]，未到 text-[var(--text-muted)]
   - 步骤间用 ArrowRight 图标 text-[var(--text-muted)]
   - 点击已完成步骤可回看，未到步骤不可点击（cursor-not-allowed opacity-50）
   - 全屏按钮（Maximize2/Minimize2 图标，参照 VideoMarketing 的 toggleFullscreen 实现）

3. 四库概念提示条 card-solid p-3（仅步骤1显示）：
   flex items-center gap-3，左侧 Database 图标 var(--brand)
   "极速办赛资源中台 · 四库驱动"（text-sm font-bold）+ "人才库230 / 场馆库257 / 用品库1956 / 媒体库357"（text-xs text-muted）
   右侧 StatusPill variant="brand" "AI精准匹配"

4. 根据 useState step 渲染对应子组件：
   step='input' → <RequirementInput data={{ databases: DATABASES, tournaments: TOURNAMENTS }} />
   step='matching' → <AutoMatching data={{ matchProgress: MATCH_PROGRESS, matchResults: MATCH_RESULTS, conflicts: CONFLICTS, stats: MATCH_STATS }} />
   step='output' → <ResourceOutputList data={{ eventInfo: EVENT_INFO, summary: OUTPUT_SUMMARY, categorySummary: CATEGORY_SUMMARY, costBreakdown: COST_BREAKDOWN, timeline: TIMELINE }} />

5. 步骤间数据传递：
   - 步骤1完成时，将表单需求存入 useState requirement，传给步骤2
   - 步骤2完成时，将匹配结果存入 useState matchResult，传给步骤3
   - 子组件通过 props.onNext 回调推进步骤，props.onPrev 回退步骤

6. import 子组件路径：
   import RequirementInput from '../components/RequirementInput.jsx'
   import AutoMatching from '../components/AutoMatching.jsx'
   import ResourceOutputList from '../components/ResourceOutputList.jsx'
7. import mock 数据：from '../data/resourceMatchingMock.js'

同时修改 Dashboard.jsx：
功能导航网格新增 'matching'：
```jsx
{['ai', 'schedule', 'resource', 'emergency', 'visual', 'timeline', 'matching'].map((v) => (
  <FeatureCard key={v} variant={v} onClick={() => onNavigate(v)} />
))}
```

同时修改 FeatureCard.jsx：
1. import 新增 Wand2 图标
2. FEATURE_META 新增 matching: { Icon: Wand2, title: '资源智能匹配', summary: '', isNew: true }
3. renderPreview 新增 case 'matching'：画3步流程缩略图（3个小方块用箭头连接，左输入/中匹配齿轮/右清单列表）

同时修改 index.jsx：
1. VIEW_NAME 新增 matching: '资源智能匹配'
2. import ResourceMatching from './modules/ResourceMatching.jsx'
3. renderView 新增 case 'matching': return <ResourceMatching />

同时修改 useMockApi.js：
新增 export const useResourceMatchingMock = () => { return { databases, tournaments, matchProgress, matchResults, conflicts, stats, eventInfo, outputSummary, categorySummary, costBreakdown, timeline } }

组件用 export default 导出 ResourceMatching。
```

---

## 六、使用说明

1. **先发"通用前置提示词"**给 opencode，让它了解项目设计系统。
2. 然后依次发提示词1-3生成3个子组件，最后发提示词4生成主模块+mock数据+修改接入。
3. 生成的文件放入对应目录：
   - 子组件 → `src/pages/WebApp/components/`
   - 主模块 → `src/pages/WebApp/modules/`
   - mock数据 → `src/pages/WebApp/data/`
4. 修改 `Dashboard.jsx`（新增功能入口）、`FeatureCard.jsx`（新增卡片变体）、`index.jsx`（新增路由分支）、`useMockApi.js`（新增 hook）。
5. 所有组件自动适配亮色/深色模式（因为用 CSS 变量）。
6. 图表是纯 SVG，无额外依赖。
7. 若 opencode 生成的表单交互或 SVG 环形图不够精确，可追问微调。

### 与现有资源模块的关系

| 维度 | 资源使用清单（已有） | 资源智能匹配（新增） |
|:---|:---|:---|
| 模块 | ResourceUsage.jsx | ResourceMatching.jsx |
| 定位 | 赛中/赛后资源管理 | 赛前资源匹配生成 |
| 面向角色 | 资源管理员 | 赛事组织者 |
| 核心功能 | 查看/筛选/热力图 | 输入需求→AI匹配→输出清单 |
| 数据流向 | 查看已有分配 | 生成新分配方案 |
| 入口 | Dashboard「资源使用清单」 | Dashboard「资源智能匹配」 |
| 关系 | 互补——匹配生成的清单可导入资源使用清单进行后续管理 |

### 与技术优势二、三方案的关键差异

| 维度 | 技术优势二（生物力学） | 技术优势三（视频营销） | 核心业务一（资源匹配） |
|:---|:---|:---|:---|
| 接入位置 | AIAnalystPlatform 第6Tab | VideoMarketing 第4Tab | Dashboard 新增独立入口 |
| 页面数 | 5张（5个分析维度） | 5张（评估+4步流程） | 3张（输入→匹配→输出） |
| 核心可视化 | 人体骨架/时序/轨迹/对称/衰减 | 雷达/桑基/漏斗/关系图谱 | 表单/匹配进度/环形图/时间轴 |
| 导航方式 | 维度平级切换 | 步骤进度条 | 步骤流程（可回看） |
| 面向角色 | 教练/体能师 | 运营/营销人员 | 赛事组织者 |
| 数据特征 | 生物力学指标 | 营销传播指标 | 资源匹配/成本/时间 |
