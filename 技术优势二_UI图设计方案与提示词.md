# 昇梦体育 · 技术优势二 — 5张UI图设计方案与 opencode 提示词

> 用途：技术优势二"视频数据分析系统"中，多维评估分析的5个生物力学分析模块UI图。
> 接入位置：管理控制台 → 运动数据分析中台（AIAnalystPlatform.jsx）→ 新增第6个 Tab「生物力学分析」。
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
| `StatusPill` | `<StatusPill variant="ok">优秀</StatusPill>` | 状态胶囊，variant: ok/warn/danger/info/purple/brand |
| `KpiStrip` | `<KpiStrip title="投篮命中率" value="48.2" unit="%" trendDir="up" accent="brand" trend="↑3.2%" />` | KPI 卡片 |
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

### AIAnalystPlatform.jsx 现有结构

当前 TABS 有5个标签（比赛总览/球队分析/球员表现/成长分析/事件热区），Tab 切换样式为紫色高亮（`background: 'var(--purple)'`）。技术优势二的5张UI作为第6个 Tab「生物力学分析」接入。

---

## 二、5张图对应内容（从图片提取）

技术优势二的核心是 **视频数据分析系统**，通过4步流程（数据采集→智能识别→多维评估分析→数据产出）将赛事视频转化为教练的"决策仪表盘"。5张UI图聚焦于 **Step 3 多维评估分析** 中的5个生物力学分析模块：

| 图 | 模块名称 | 分析内容 | 核心可视化 |
|:---|:---|:---|:---|
| 图1 | 关节角度链 | 投篮出手时肘/腕/肩关节角度；防守时髋/膝关节屈曲角度 | 人体骨架图 + 角度标注 + 理想区间对比 |
| 图2 | 发力时序 | "下肢蹬伸→躯干传导→上肢出手"发力顺序与各阶段时间分配 | 三阶段时序条形图 + 力-时间曲线 |
| 图3 | 重心轨迹 | 运球突破重心高度变化、起跳上升曲线、落地稳定性 | 球场俯视图 + 重心轨迹路径 + 高度曲线 |
| 图4 | 动作对称性 | 左右侧肢体发力均衡度（预防过度使用性损伤） | 左右对称对比图 + 对称性雷达图 |
| 图5 | 疲劳衰减曲线 | 第四节vs第一节跑动速度下降率、投篮出手角度变化率 | 多指标衰减折线图 + 四节对比柱图 |

---

## 三、接入架构（5张图的代码组织）

### 文件规划

```
src/pages/WebApp/
├── modules/
│   └── BiomechanicsAnalysis.jsx         ← 新建：生物力学分析模块（含5个子页面 + 维度导航）
├── components/
│   ├── JointAngleChain.jsx              ← 新建：图1 关节角度链分析
│   ├── ForceTimingChart.jsx             ← 新建：图2 发力时序分析
│   ├── CogTrajectoryChart.jsx           ← 新建：图3 重心轨迹分析
│   ├── MovementSymmetry.jsx             ← 新建：图4 动作对称性分析
│   └── FatigueDecayCurve.jsx            ← 新建：图5 疲劳衰减曲线分析
├── data/
│   └── biomechanicsMock.js              ← 新建：5个页面的 mock 数据
├── hooks/
│   └── useMockApi.js                    ← 修改：新增 useBiomechanicsMock()
└── modules/
    └── AIAnalystPlatform.jsx            ← 修改：TABS 新增第6项，渲染 BiomechanicsAnalysis
```

### AIAnalystPlatform.jsx 修改点

1. TABS 数组新增第6项：
```jsx
const TABS = [
  { key: 'overview', label: '比赛总览' },
  { key: 'team', label: '球队分析' },
  { key: 'players', label: '球员表现' },
  { key: 'growth', label: '成长分析' },
  { key: 'events', label: '事件热区' },
  { key: 'biomechanics', label: '生物力学分析' }  // 新增
];
```
2. Tab 渲染区域新增：
```jsx
{activeTab === 'biomechanics' ? <BiomechanicsAnalysis /> : null}
```
3. 顶部 import 新模块：
```jsx
import BiomechanicsAnalysis from './BiomechanicsAnalysis.jsx';
```

### BiomechanicsAnalysis.jsx 内部结构

该模块含一个**维度导航条**（5个生物力学维度），通过内部 state 切换5个子页面：

```
[① 关节角度链] → [② 发力时序] → [③ 重心轨迹] → [④ 动作对称性] → [⑤ 疲劳衰减曲线]
```

导航条样式参照 AIAnalystPlatform 现有 Tab 风格：圆角胶囊容器 + 当前步紫色高亮（`background: 'var(--purple)'`），未选中用 `text-[var(--text-muted)]`。

同时提供球员选择下拉（张子轩#23/李明超#7/陈浩#15/王伟#9/赵磊#31）和赛事选择下拉，供用户切换分析对象。

---

## 四、5张图设计思路速览

| 图 | 定位 | 核心布局 | 关键内容 |
|:---|:---|:---|:---|
| 关节角度链 | 技术分析看板 | 左人体骨架SVG + 右角度数据表 + 底部动作时间轴 | 投篮5关节角度、理想区间对比、偏差评估 |
| 发力时序 | 序列分析界面 | 左三阶段时序条 + 右力-时间曲线SVG + 底部效率评分 | 下肢→躯干→上肢时间分配、重叠率、效率得分 |
| 重心轨迹 | 运动轨迹分析 | 左球场俯视轨迹SVG + 右高度变化曲线 + 底部三阶段分析卡 | 突破/起跳/落地三阶段重心数据、稳定性指数 |
| 动作对称性 | 对称性评估界面 | 左左右对比人体图 + 右对称性雷达图 + 底部风险预警 | 左右肢发力对比、对称指数、损伤风险等级 |
| 疲劳衰减曲线 | 疲劳监控看板 | 左多指标衰减折线 + 右四节对比柱图 + 底部换人建议 | Q1-Q4速度/角度衰减率、疲劳指数、联赛均值对比 |

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
5. 图标：从 lucide-react 导入，如 import { Activity, TrendingDown, AlertTriangle } from 'lucide-react'
6. 图表：纯 SVG 手写，不用 ECharts。用 var(--brand) 等变量着色，stroke="var(--border)" 画网格线
7. 状态胶囊组件 StatusPill：<StatusPill variant="ok">优秀</StatusPill>，variant 可选 ok/warn/danger/info/purple/brand
8. KPI卡片组件 KpiStrip：<KpiStrip title="投篮命中率" value="48" unit="%" trendDir="up" accent="brand" trend="↑3.2%" />
9. Tailwind：grid grid-cols-1 lg:grid-cols-12 gap-4 分栏，col-span-X 占位
10. 颜色在 Tailwind 中写法：text-[var(--brand)]、bg-[var(--surface-muted)]、border-[var(--border)]
11. 文件中已有这些组件可导入：StatusPill(../components/StatusPill.jsx)、KpiStrip(../components/KpiStrip.jsx)
12. 禁止用 emoji，所有图标从 lucide-react 导入

请基于以上规范生成代码。每个组件用 export default 导出。
```

---

### 提示词 1：关节角度链（JointAngleChain.jsx）

```
基于项目设计系统，创建组件 JointAngleChain.jsx（关节角度链分析界面）。

这是篮球运动数据分析中台的生物力学分析页面，展示球员投篮和防守动作中各关节的角度数据，与理想生物力学区间对比。

【数据来源】
从 props 接收 data 对象，包含：
- player: { name: '张子轩', number: 23, team: '东莞宏远', position: '得分后卫' }
- action: '投篮出手'  // 当前分析动作
- joints: [
    { name: '肩关节', currentAngle: 132, idealMin: 120, idealMax: 145, status: 'ok', phase: '出手阶段', advice: '肩关节外展角度理想，发力充分' },
    { name: '肘关节', currentAngle: 89, idealMin: 85, idealMax: 95, status: 'ok', phase: '出手阶段', advice: '肘关节屈曲角度标准，出手稳定' },
    { name: '腕关节', currentAngle: 45, idealMin: 40, idealMax: 55, status: 'ok', phase: '拨球阶段', advice: '腕关节角度合理，拨球充分' },
    { name: '髋关节', currentAngle: 108, idealMin: 90, idealMax: 120, status: 'warn', phase: '防守阶段', advice: '髋关节屈曲略大，建议加强下盘稳定性训练' },
    { name: '膝关节', currentAngle: 72, idealMin: 60, idealMax: 85, status: 'ok', phase: '防守阶段', advice: '膝关节屈曲角度良好，防守姿势标准' }
  ]
- timeline: [
    { time: 0, label: '准备', shoulder: 45, elbow: 30, wrist: 15, hip: 20, knee: 30 },
    { time: 100, label: '屈膝', shoulder: 60, elbow: 45, wrist: 20, hip: 60, knee: 65 },
    { time: 200, label: '蹬伸', shoulder: 85, elbow: 60, wrist: 25, hip: 95, knee: 72 },
    { time: 300, label: '举球', shoulder: 110, elbow: 75, wrist: 35, hip: 85, knee: 55 },
    { time: 400, label: '出手', shoulder: 132, elbow: 89, wrist: 45, hip: 70, knee: 40 },
    { time: 500, label: '随摆', shoulder: 95, elbow: 120, wrist: 60, hip: 55, knee: 35 }
  ]
- overallScore: 87

【布局结构】

1. 顶部栏（flex justify-between items-center）：
   - 左：Activity 图标 + "关节角度链分析"标题（text-xl font-bold）+ 副标题"投篮·防守动作关节角度生物力学评估"（text-sm text-muted）
   - 右：球员选择下拉（显示"#23 张子轩"）+ 动作切换标签组（投篮出手(选中)/防守滑步/运球突破，选中态 bg-[var(--brand)] text-black px-3 py-1.5 rounded-full text-xs）+ btn-accent "导出分析报告"（FileDown图标）

2. 主体左右两栏 grid-cols-1 lg:grid-cols-12 gap-4：

左栏 col-span-5：人体骨架角度图（card-solid p-5）
- 卡片标题行：flex justify-between，左"人体关节角度示意图"（text-sm font-bold），右 StatusPill variant="brand" "综合评分 87"
- SVG 人体骨架图（viewBox 0 0 280 380）：
  用线条和圆点画一个简化的正面人体骨架（火柴人风格），包括头、躯干、左右上臂/前臂/手、左右大腿/小腿/脚
  骨架线条：stroke="var(--text-muted)" strokeWidth="2"
  关节点：circle r="6"，颜色按 status 映射（ok→var(--ok)、warn→var(--warn)、danger→var(--danger)）
  每个标注的关节旁画一段弧线（path 弧线）表示角度范围，弧线颜色对应 status 颜色
  每个关节点旁标注角度值：text fontSize="11" fill="var(--text-primary)" fontWeight="bold"
  标注位置用绝对定位或 SVG text 标签
- 底部图例横排：3个圆点+文字（绿色"理想区间"、琥珀色"需关注"、红色"偏差较大"）

右栏 col-span-7：角度数据详情
- 上方：5个关节角度卡片 grid-cols-5 gap-2（紧凑版）
  每张 card-solid p-3，结构：
  顶部关节名（text-xs text-muted）+ 阶段标签（text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-muted）
  中间大数字 currentAngle°（text-2xl font-black tabular-nums，颜色按 status）
  底部理想区间"85°-95°"（text-[10px] text-muted）
  顶部 border-t-2（颜色按 status）
  如果 status='warn' 加 border-l-2 border-[var(--warn)]
- 下方 card-solid p-5：角度变化时间轴
  标题"关节角度变化曲线"（text-sm font-bold）+ 副标题"投篮动作 0-500ms 全程关节角度追踪"（text-xs text-muted）
  SVG 多折线图（viewBox 0 0 480 200）：
  - X轴 0-500ms，每100ms刻度，stroke="var(--border)"
  - Y轴 0-150°，每30°刻度线 stroke="var(--border)" strokeDasharray="4 4"
  - 5条折线，分别对应5个关节，颜色映射：肩→var(--brand)、肘→var(--info)、腕→var(--purple)、髋→var(--ok)、膝→var(--warn)
  - 每条线带数据点 circle r="3"
  - 底部图例横排：5个圆点+关节名
  - X轴标签 fill="var(--text-muted)" fontSize="10"（准备/屈膝/蹬伸/举球/出手/随摆）

3. 底部建议条 card-solid p-4：
- flex items-start gap-3，左侧 border-l-4 border-[var(--brand)] pl-4
- 左 Lightbulb 图标 var(--brand) + "教练建议"标题（text-sm font-bold）
- 右侧逐条列出5个关节的 advice 文字，每条前加对应颜色圆点

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 2：发力时序（ForceTimingChart.jsx）

```
基于项目设计系统，创建组件 ForceTimingChart.jsx（发力时序分析界面）。

这是篮球运动数据分析中台的生物力学分析页面，分析球员投篮动作中"下肢蹬伸→躯干传导→上肢出手"的发力顺序是否合理，各阶段时间分配是否科学。

【数据来源】
从 props 接收 data 对象，包含：
- player: { name: '张子轩', number: 23 }
- phases: [
    { id: 'lower', name: '下肢蹬伸', startMs: 0, durationMs: 120, power: 85, color: 'ok', detail: '膝关节伸展+踝关节跖屈，产生向上蹬地力', idealRange: '100-140ms', status: 'ok' },
    { id: 'trunk', name: '躯干传导', startMs: 100, durationMs: 100, power: 72, color: 'brand', detail: '核心肌群稳定，力量从下肢传导至上肢', idealRange: '90-120ms', status: 'ok' },
    { id: 'upper', name: '上肢出手', startMs: 180, durationMs: 100, power: 91, color: 'info', detail: '肩-肘-腕依次发力，完成出手动作', idealRange: '80-120ms', status: 'ok' }
  ]
- overlap: { lowerTrunk: 20, trunkUpper: 20, totalOverlap: 40, ideal: '30-50ms', status: 'ok' }
- forceCurve: 28个数据点 [{ t: 0, f: 20 }, { t: 20, f: 35 }, ... { t: 540, f: 10 }]，模拟力-时间曲线
- efficiency: { score: 88, grade: 'A', assessment: '发力链路完整，各阶段衔接流畅，力量传导效率优秀' }
- comparison: { player: '张子轩', score: 88, teamAvg: 76, leagueAvg: 72 }

【布局结构】

1. 顶部栏：
   - 左：Zap 图标 + "发力时序分析"标题 + 副标题"下肢→躯干→上肢 动力链顺序与时间分配评估"
   - 右：球员下拉 + btn-accent "导出报告"（FileDown图标）

2. 主体左右两栏 grid-cols-12：

左栏 col-span-7：三阶段时序图（card-solid p-5）
- 标题"发力链时序图"（text-sm font-bold）+ 副标题"下肢蹬伸 → 躯干传导 → 上肢出手"（text-xs text-muted）
- SVG 时序条形图（viewBox 0 0 520 200）：
  横轴为时间 0-540ms，底部刻度线每60ms一格 stroke="var(--border)"
  3个水平条形（圆角矩形 rx=6），从上到下排列，间距 gap=20：
  - 条1 "下肢蹬伸"：x=startMs比例, width=durationMs比例, fill="var(--ok)" opacity=0.7, 条内左侧标注阶段名+持续时间
  - 条2 "躯干传导"：fill="var(--brand)" opacity=0.7
  - 条3 "上肢出手"：fill="var(--info)" opacity=0.7
  重叠区域用斜线纹理或更高 opacity 标注
  每个条形上方标注开始时间和持续时间"120ms"
  底部时间轴标签 fill="var(--text-muted)" fontSize="10"
- 时序条下方 grid-cols-3 gap-3：3个阶段卡片
  每张 card-solid p-3，顶部 border-t-2（对应颜色），内容：
  阶段名（text-sm font-bold）+ StatusPill（ok/warn/danger）
  "持续时间 120ms"（text-lg font-black tabular-nums 对应颜色）
  "理想区间 100-140ms"（text-xs text-muted）
  "功率输出 85%"（text-sm）
  底部 detail 说明文字（text-[10px] text-muted leading-snug）

右栏 col-span-5：力-时间曲线 + 效率评分
- 上方 card-solid p-5：力-时间曲线
  标题"力-时间曲线"（text-sm font-bold）
  SVG 曲线图（viewBox 0 0 380 180）：
  X轴 0-540ms, Y轴 0-100N
  网格线 stroke="var(--border)" strokeDasharray="4 4"
  曲线：path d="M..." fill="none" stroke="var(--brand)" strokeWidth="2.5"
  曲线下面积填充：fill="url(#forceGradient)" opacity=0.15（渐变 var(--brand) → transparent）
  3个阶段分界垂直虚线（x=120, x=200, x=280），stroke="var(--border)" strokeDasharray="3 3"
  分界处标注阶段名 fill="var(--text-muted)" fontSize="9"
  Y轴标签 fill="var(--text-muted)" fontSize="9"
- 下方 card-solid p-5：效率评分卡
  居中大字母"A"（text-6xl font-black text-[var(--brand)]）+ "发力效率评分"（text-sm text-muted）
  下方分数"88分"（text-3xl font-black tabular-nums）
  对比行 grid-cols-3：
    张子轩 88 | 队内均值 76 | 联赛均值 72
    每列上方文字 text-xs text-muted，下方数字 text-lg font-black tabular-nums
    张子轩列用 text-[var(--brand)]，其余用 text-[var(--text-primary)]
  底部 assessment 文字（text-xs text-muted leading-relaxed，border-t pt-3）

3. 底部衔接分析条 card-solid p-4：
- flex items-center gap-4
- 左侧 border-l-4 border-[var(--brand)] pl-4
- 内容：Check 图标 var(--ok) + "阶段衔接重叠 40ms（理想区间 30-50ms）" + "下肢与躯干重叠20ms / 躯干与上肢重叠20ms" text-xs text-muted

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 3：重心轨迹（CogTrajectoryChart.jsx）

```
基于项目设计系统，创建组件 CogTrajectoryChart.jsx（重心轨迹分析界面）。

这是篮球运动数据分析中台的生物力学分析页面，展示球员运球突破、投篮起跳、落地三个阶段的重心高度变化与运动轨迹。

【数据来源】
从 props 接收 data 对象，包含：
- player: { name: '张子轩', number: 23 }
- action: '运球突破→急停跳投'  // 当前分析动作序列
- courtPath: [
    { x: 80, y: 300, h: 95, phase: 'start', label: '起步' },
    { x: 130, y: 260, h: 92, phase: 'dribble', label: '运球推进' },
    { x: 180, y: 220, h: 90, phase: 'dribble', label: '变向' },
    { x: 220, y: 180, h: 88, phase: 'dribble', label: '加速突破' },
    { x: 250, y: 150, h: 95, phase: 'stop', label: '急停' },
    { x: 260, y: 130, h: 120, phase: 'jump', label: '起跳上升' },
    { x: 265, y: 110, h: 135, phase: 'jump', label: '最高点' },
    { x: 268, y: 125, h: 108, phase: 'jump', label: '出手' },
    { x: 270, y: 145, h: 92, phase: 'land', label: '落地' },
    { x: 272, y: 160, h: 94, phase: 'land', label: '稳定' }
  ]
- heightCurve: 30个数据点 [{ t, h }]，对应重心高度随时间变化曲线
- phases: [
    { name: '运球突破', duration: '1.2s', heightRange: '88-95cm', stability: 92, desc: '重心控制稳定，变向流畅', status: 'ok' },
    { name: '起跳阶段', duration: '0.4s', heightRange: '95-135cm', stability: 88, desc: '起跳高度充分，垂直速度优秀', status: 'ok' },
    { name: '落地阶段', duration: '0.3s', heightRange: '92-108cm', stability: 76, desc: '落地略有前倾，建议加强落地缓冲训练', status: 'warn' }
  ]
- metrics: { maxHeight: 135, jumpHeight: 40, landingStability: 76, cogControl: 89 }

【布局结构】

1. 顶部栏：
   - 左：Move 图标 + "重心轨迹分析"标题 + 副标题"运球突破→急停跳投 重心运动学追踪"
   - 右：球员下拉 + 动作序列下拉 + btn-accent "导出报告"

2. 主体左右两栏 grid-cols-12：

左栏 col-span-7：球场俯视轨迹图（card-solid p-5）
- 标题行 flex justify-between：左"球场重心轨迹"（text-sm font-bold），右4个指标小卡（grid-cols-4 gap-2，每个 text-center）：
  最高重心 135cm | 起跳高度 40cm | 落地稳定 76% | 重心控制 89%
  数字用 text-lg font-black tabular-nums，颜色依次 brand/ok/warn/info
- SVG 球场半场俯视图（viewBox 0 0 300 350）：
  球场背景：rect fill="var(--surface-muted)" opacity=0.3，stroke="var(--border)"
  球场标线：三分线弧线、罚球线、禁区矩形，stroke="var(--border)" strokeWidth="1.5" fill="none"
  篮筐：circle r=8 fill="none" stroke="var(--brand)" strokeWidth="2" + 中心小圆 r=2 fill="var(--brand)"
  轨迹路径：polyline points= courtPath各点x,y，fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round"
  轨迹颜色按阶段渐变：用3段不同颜色 polyline 分别画
    运球阶段 stroke="var(--info)" / 起跳阶段 stroke="var(--brand)" / 落地阶段 stroke="var(--warn)"
  关键点标注：每个 courtPath 点画 circle r="4"
    起步点 fill="var(--info)" / 最高点 fill="var(--brand)" r=6 + 外圈光环 / 落地点 fill="var(--warn)" r=6
  关键点旁标注 label 文字 fill="var(--text-muted)" fontSize="9"
  重心高度用颜色深浅或圆点大小表示
- 底部图例横排：3段圆点+阶段名（蓝色运球/金色起跳/琥珀落地）

右栏 col-span-5：重心高度曲线 + 三阶段分析
- 上方 card-solid p-5：重心高度变化曲线
  标题"重心高度-时间曲线"（text-sm font-bold）
  SVG 曲线图（viewBox 0 0 360 200）：
  X轴 时间0-2.0s, Y轴 高度80-140cm
  网格线 stroke="var(--border)" strokeDasharray="4 4"
  曲线：polyline 连接 heightCurve 数据点，fill="none" stroke="var(--brand)" strokeWidth="2.5"
  曲线下填充：path fill="url(#cogGradient)" opacity=0.1
  3个阶段分界垂直虚线 + 阶段名标注 fill="var(--text-muted)" fontSize="9"
  最高点标注：circle r=5 fill="var(--brand)" + text "135cm" fill="var(--brand)" fontSize="10" fontWeight="bold"
  Y轴标签 fill="var(--text-muted)" fontSize="9"
- 下方 card-solid p-4：三阶段分析卡 space-y-3
  每个阶段一个 div：
  flex items-center gap-3 + 左侧竖条 border-l-3（按 status 颜色）pl-3
  内容：阶段名（text-sm font-bold）+ StatusPill + "时长 1.2s | 重心 88-95cm"（text-xs text-muted）
  下方 desc 文字（text-xs text-muted leading-snug）
  稳定性进度条：div h-1.5 rounded-full bg-[var(--surface-muted)] 内嵌 div width=stability%（颜色按 status）

3. 底部建议条 card-solid p-4：
- flex items-start gap-3 + border-l-4 border-[var(--warn)] pl-4
- AlertTriangle 图标 var(--warn) + "落地稳定性预警" + "落地阶段重心略有前倾（稳定度76%），建议增加落地缓冲与单腿稳定训练，降低ACL损伤风险"

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 4：动作对称性（MovementSymmetry.jsx）

```
基于项目设计系统，创建组件 MovementSymmetry.jsx（动作对称性分析界面）。

这是篮球运动数据分析中台的生物力学分析页面，评估球员左右侧肢体发力均衡度，作为预防过度使用性损伤的关键指标。

【数据来源】
从 props 接收 data 对象，包含：
- player: { name: '张子轩', number: 23 }
- symmetryData: [
    { metric: '下肢蹬伸力', left: 425, right: 460, unit: 'N', symmetry: 92, status: 'ok' },
    { metric: '上肢推力', left: 185, right: 198, unit: 'N', symmetry: 93, status: 'ok' },
    { metric: '侧向移动速度', left: 3.2, right: 3.5, unit: 'm/s', symmetry: 91, status: 'ok' },
    { metric: '单腿起跳高度', left: 42, right: 48, unit: 'cm', symmetry: 88, status: 'warn' },
    { metric: '落地缓冲稳定性', left: 82, right: 91, unit: '%', symmetry: 90, status: 'ok' }
  ]
- radarData: [
    { label: '蹬伸力', value: 92 }, { label: '上肢推力', value: 93 },
    { label: '移动速度', value: 91 }, { label: '起跳高度', value: 88 },
    { label: '落地稳定', value: 90 }
  ]
- overallSymmetry: 90.8
- riskLevel: { level: '低风险', color: 'ok', desc: '左右侧发力基本均衡，单腿起跳高度差异略大，建议加强弱侧腿训练' }
- history: [
    { date: '07-05', value: 84 }, { date: '07-12', value: 86 }, { date: '07-19', value: 87 },
    { date: '07-26', value: 88 }, { date: '08-02', value: 90 }, { date: '08-05', value: 90.8 }
  ]

【布局结构】

1. 顶部栏：
   - 左：Scale 图标 + "动作对称性分析"标题 + 副标题"左右侧肢体发力均衡度 · 损伤风险评估"
   - 右：球员下拉 + btn-accent "导出报告"

2. 主体三列布局 grid-cols-12 gap-4：

左栏 col-span-4：左右对比人体图（card-solid p-5）
- 标题"左右侧发力对比"（text-sm font-bold）
- SVG 人体正面对称图（viewBox 0 0 260 360）：
  中线：vertical line x=130 stroke="var(--border)" strokeDasharray="4 4"
  人体骨架：左右对称的火柴人，stroke="var(--text-muted)" strokeWidth="2"
  左侧标注（x<130区域）：5个发力数据点，用圆形大小表示力的大小
    下肢蹬伸力：circle r=18 fill="var(--info)" opacity=0.6 + text "425N" fill="var(--text-primary)" fontSize="10"
    上肢推力：circle r=12 fill="var(--info)" opacity=0.6 + text "185N"
    侧向移动速度、起跳高度、落地稳定 类似
  右侧标注（x>130区域）：对应右侧数据
    下肢蹬伸力：circle r=20 fill="var(--ok)" opacity=0.6 + text "460N"
    上肢推力：circle r=13 fill="var(--ok)" opacity=0.6 + text "198N"
    单腿起跳高度（差异大的项）：左侧 r=14 fill="var(--warn)" opacity=0.6 右侧 r=16 fill="var(--ok)" opacity=0.6
  差异较大的指标用 var(--warn) 高亮，其他用左蓝右绿
  顶部标注"← 左侧"和"右侧 →"fill="var(--text-muted)" fontSize="11"
- 底部图例：左蓝点"左侧" / 右绿点"右侧" / 琥珀点"差异关注"

中栏 col-span-4：对称性雷达图（card-solid p-5）
- 标题"对称性雷达图"（text-sm font-bold）+ StatusPill variant="ok" "总对称度 90.8%"
- SVG 雷达图（viewBox 0 0 280 280，中心 140,140，半径 100）：
  5层网格五边形（20/40/60/80/100），stroke="var(--border)" strokeDasharray="4 4"
  5条轴线从中心到顶点 stroke="var(--border)"
  数据多边形：fill="var(--brand)" fillOpacity="0.2" stroke="var(--brand)" strokeWidth="2.5"
  顶点圆点：circle r="5" fill="var(--brand)" + 内圈 r="2" fill="white"
  维度标签文字：fill="var(--text-muted)" fontSize="11"
  对称度低于90的顶点用 var(--warn) 标注
- 底部5维度数值 grid-cols-5 gap-1：
  每个显示 维度简称 + 对称度%（颜色按 status）

右栏 col-span-4：对称性数据表 + 趋势
- 上方 card-solid p-4：对称性数据表
  标题"对称性指标明细"（text-sm font-bold）
  5行数据，每行结构（border-b border-[var(--border)] py-2.5）：
  grid-cols-[1fr_50px_50px_60px]
  指标名（text-xs text-primary）| 左侧值（text-xs font-mono text-muted）| 右侧值（text-xs font-mono text-muted）| 对称度（text-sm font-bold tabular-nums，颜色按status）
  对称度后加状态标识：ok→Check var(--ok) / warn→AlertTriangle var(--warn)
  单腿起跳高度行整行 bg-[var(--warn)]/8 高亮
- 下方 card-solid p-4：对称性趋势
  标题行 flex justify-between：左"对称度趋势"（text-sm font-bold），右 text-xs text-muted "近6周"
  SVG 趋势折线图（viewBox 0 0 280 100）：
  6个数据点，polyline fill="none" stroke="var(--ok)" strokeWidth="2"
  数据点 circle r="3" fill="var(--ok)"
  底部 X轴日期标签 fill="var(--text-muted)" fontSize="9"
  Y轴范围 80-95，最右侧点标注 "90.8%" fill="var(--ok)" fontSize="10" fontWeight="bold"

3. 底部风险预警条 card-solid p-4：
- flex items-center gap-4
- 左侧大图标 ShieldCheck var(--ok)，右侧内容：
  "损伤风险评估：低风险"（text-base font-bold text-[var(--ok)]）+ StatusPill variant="ok" "低风险"
  desc 文字（text-xs text-muted）"左右侧发力基本均衡，单腿起跳高度差异略大（左42cm/右48cm），建议加强弱侧腿训练"
- 整条左侧 border-l-4 border-[var(--ok)]

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 5：疲劳衰减曲线（FatigueDecayCurve.jsx）

```
基于项目设计系统，创建组件 FatigueDecayCurve.jsx（疲劳衰减曲线分析界面）。

这是篮球运动数据分析中台的生物力学分析页面，追踪球员第四节相比第一节的跑动速度下降率、投篮出手角度变化率等疲劳指标。

【数据来源】
从 props 接收 data 对象，包含：
- player: { name: '张子轩', number: 23, minutes: 32 }
- quarterData: [
    { quarter: 'Q1', speed: 5.8, shotAngle: 52.3, sprintCount: 12, jumpHeight: 48, heartRate: 165 },
    { quarter: 'Q2', speed: 5.5, shotAngle: 51.8, sprintCount: 10, jumpHeight: 46, heartRate: 172 },
    { quarter: 'Q3', speed: 5.1, shotAngle: 50.1, sprintCount: 8, jumpHeight: 43, heartRate: 178 },
    { quarter: 'Q4', speed: 4.6, shotAngle: 47.5, sprintCount: 6, jumpHeight: 39, heartRate: 185 }
  ]
- decayMetrics: [
    { metric: '跑动速度', q1: 5.8, q4: 4.6, decay: 20.7, unit: 'm/s', status: 'warn', ideal: '<15%' },
    { metric: '投篮角度', q1: 52.3, q4: 47.5, decay: 9.2, unit: '°', status: 'ok', ideal: '<10%' },
    { metric: '冲刺次数', q1: 12, q4: 6, decay: 50.0, unit: '次', status: 'danger', ideal: '<40%' },
    { metric: '起跳高度', q1: 48, q4: 39, decay: 18.8, unit: 'cm', status: 'warn', ideal: '<15%' },
    { metric: '心率', q1: 165, q4: 185, decay: 12.1, unit: 'bpm', status: 'ok', ideal: '<15%' }
  ]
- fatigueIndex: { score: 68, grade: 'C+', level: '中度疲劳', desc: '第四节速度与冲刺次数显著下降，建议第四节中段安排轮换休息' }
- comparison: { player: '张子轩', fatigueScore: 68, teamAvg: 75, leagueAvg: 78 }
- suggestion: '建议第四节 8分钟时换下休息，当前Q4速度衰减20.7%已超警戒线15%，冲刺能力下降50%为重度衰减'

【布局结构】

1. 顶部栏：
   - 左：TrendingDown 图标 + "疲劳衰减曲线"标题 + 副标题"四节比赛疲劳追踪 · 衰减率分析与轮换建议"
   - 右：球员下拉 + 比赛下拉 + btn-accent "导出报告"

2. 主体左右两栏 grid-cols-12 gap-4：

左栏 col-span-8：多指标衰减折线图（card-solid p-5）
- 标题行 flex justify-between：左"四节比赛指标衰减趋势"（text-sm font-bold），右图例横排（4个圆点+指标名：速度brand/角度ok/冲刺danger/起跳warn）
- SVG 多折线图（viewBox 0 0 560 280）：
  X轴 Q1/Q2/Q3/Q4（等间距，4个刻度位置）
  Y轴左 0-100%（归一化百分比，Q1=100%基准线）+ Y轴右可选实际值
  网格线 stroke="var(--border)" strokeDasharray="4 4"
  Q1=100% 基准水平线 stroke="var(--border)" strokeWidth="1.5"（虚线）
  4条折线，每条归一化到Q1=100%：
  - 跑动速度：stroke="var(--brand)" strokeWidth="2.5" + 数据点 circle r="4"
  - 投篮角度：stroke="var(--ok)" strokeWidth="2.5"
  - 冲刺次数：stroke="var(--danger)" strokeWidth="2.5"
  - 起跳高度：stroke="var(--warn)" strokeWidth="2.5"
  每条线在Q4点旁标注衰减率"↓20.7%" fill对应颜色 fontSize="10" fontWeight="bold"
  X轴标签 fill="var(--text-muted)" fontSize="11" fontWeight="bold"（Q1/Q2/Q3/Q4）
  Y轴标签 fill="var(--text-muted)" fontSize="9"（100%/80%/60%/40%）
  警戒线：Y=85%处水平线 stroke="var(--warn)" strokeDasharray="6 3" + 标注"警戒线 85%"
- 底部5个衰减指标卡片 grid-cols-5 gap-2：
  每张 card-solid p-2.5，顶部 border-t-2（按 status 颜色）：
  指标名（text-[10px] text-muted）+ 大数字衰减率（text-lg font-black tabular-nums，颜色按status）+ "↓"箭头
  下方"Q1 5.8 → Q4 4.6"（text-[9px] text-muted font-mono）+ "警戒 <15%"（text-[9px] text-muted）

右栏 col-span-4：疲劳指数 + 四节对比 + 建议
- 上方 card-solid p-5：疲劳指数评分卡
  居中布局：
  "疲劳指数"（text-xs text-muted uppercase tracking-wider）
  大数字"68"（text-5xl font-black tabular-nums）+ "分"（text-lg text-muted）
  等级"C+ · 中度疲劳"（StatusPill variant="warn"）
  对比行 grid-cols-3 mt-4：
    张子轩 68(brand) | 队内 75(muted) | 联赛 78(muted)
    每列 text-center，上方 text-[10px] text-muted，下方 text-base font-black tabular-nums
- 中间 card-solid p-4：四节指标对比柱图
  标题"四节跑动速度对比"（text-sm font-bold）
  SVG 柱状图（viewBox 0 0 260 120）：
  4个柱子（Q1-Q4），每个 width=40 gap=16
  Q1: height=100% fill="var(--ok)"
  Q2: height=94.8% fill="var(--ok)" opacity=0.8
  Q3: height=87.9% fill="var(--warn)"
  Q4: height=79.3% fill="var(--danger)"
  柱顶标注速度值"5.8"/"5.5"/"5.1"/"4.6" fill="var(--text-primary)" fontSize="10" fontWeight="bold"
  底部标签 Q1-Q4 fill="var(--text-muted)" fontSize="10"
  右侧标注"↓20.7%" fill="var(--danger)" fontSize="11" fontWeight="bold"
- 下方 card-solid p-4：轮换建议
  flex items-start gap-3 + border-l-4 border-[var(--warn)] pl-3
  Clock 图标 var(--warn) + "轮换建议"（text-sm font-bold text-[var(--warn)]）
  suggestion 文字（text-xs text-muted leading-relaxed）

3. 底部总结条 card-solid p-4：
- flex items-center justify-between
- 左侧：Activity 图标 + "综合疲劳评估" + fatigueIndex.desc
- 右侧3个 StatusPill：速度衰减 warn / 冲刺衰减 danger / 角度衰减 ok

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 6：BiomechanicsAnalysis 主模块 + Mock数据（组装5个子页面）

```
基于项目设计系统，创建两个文件：

## 文件1：src/pages/WebApp/data/biomechanicsMock.js

导出5个子页面所需的 mock 数据：
- JOINT_ANGLE_DATA：关节角度链数据（joints 5关节、timeline 6个时间点、overallScore 87）
  关节包含：肩关节132°(ok)、肘关节89°(ok)、腕关节45°(ok)、髋关节108°(warn)、膝关节72°(ok)
  每个关节含 idealMin/idealMax/status/phase/advice
  timeline 包含6个阶段：准备/屈膝/蹬伸/举球/出手/随摆，每个含5个关节角度值
- FORCE_TIMING_DATA：发力时序数据（phases 3阶段、overlap、forceCurve 28点、efficiency score=88 grade=A、comparison）
  三阶段：下肢蹬伸0-120ms(ok) / 躯干传导100-200ms(ok) / 上肢出手180-280ms(ok)
  overlap totalOverlap=40ms(ok)
- COG_TRAJECTORY_DATA：重心轨迹数据（courtPath 10个点、heightCurve 30点、phases 3阶段、metrics）
  三阶段：运球突破stability=92(ok) / 起跳stability=88(ok) / 落地stability=76(warn)
- SYMMETRY_DATA：动作对称性数据（symmetryData 5指标、radarData 5维、overallSymmetry=90.8、riskLevel、history 6周）
  5指标：蹬伸力92%(ok) / 上肢推力93%(ok) / 移动速度91%(ok) / 起跳高度88%(warn) / 落地稳定90%(ok)
  riskLevel: 低风险
- FATIGUE_DATA：疲劳衰减数据（quarterData 4节、decayMetrics 5指标、fatigueIndex score=68 grade=C+、comparison、suggestion）
  5指标衰减率：速度20.7%(warn) / 角度9.2%(ok) / 冲刺50%(danger) / 起跳18.8%(warn) / 心率12.1%(ok)

球员统一用：张子轩#23 / 李明超#7 / 陈浩#15 / 王伟#9 / 赵磊#31
球队统一用：东莞宏远
赛事统一用：粤BA半决赛 vs 广州龙狮
数据数值要合理自洽（如Q1速度5.8→Q4速度4.6，衰减率=(5.8-4.6)/5.8*100=20.7%）

## 文件2：src/pages/WebApp/modules/BiomechanicsAnalysis.jsx

生物力学分析主模块，包含：

1. 顶部栏：
   - 左：Dna 图标(lucide-react) + "生物力学分析"标题（text-xl font-bold）+ 副标题"关节角度·发力时序·重心轨迹·动作对称性·疲劳衰减"（text-sm text-muted）
   - 右：球员选择下拉（显示"#23 张子轩"）+ 赛事选择下拉（显示"粤BA半决赛"）+ btn-accent "导出完整报告"（FileDown图标）

2. 维度导航条：
   5个分析维度标签横排，用 useState 管理当前维度：
   ① 关节角度链 → ② 发力时序 → ③ 重心轨迹 → ④ 动作对称性 → ⑤ 疲劳衰减曲线
   容器 className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
   当前选中态：style={{ color: 'white', background: 'var(--purple)' }} className="rounded-xl px-4 py-1.5 text-xs font-bold"
   未选中：className="rounded-xl px-4 py-1.5 text-xs font-bold text-[var(--text-muted)] transition-colors"
   每个标签前加对应数字圆圈或 lucide 图标

3. 认证标准提示条（card-solid p-3）：
   flex items-center gap-3，左侧 Award 图标 var(--brand)
   "评估模型对标《中国篮球协会2025年技术与体能测试数据分析报告》"（text-sm）
   右侧 StatusPill variant="brand" "国家级权威标准"

4. 根据 useState dimension 渲染对应子组件：
   dimension='joint' → <JointAngleChain data={JOINT_ANGLE_DATA} />
   dimension='force' → <ForceTimingChart data={FORCE_TIMING_DATA} />
   dimension='cog' → <CogTrajectoryChart data={COG_TRAJECTORY_DATA} />
   dimension='symmetry' → <MovementSymmetry data={SYMMETRY_DATA} />
   dimension='fatigue' → <FatigueDecayCurve data={FATIGUE_DATA} />

5. import 子组件路径：from '../components/JointAngleChain.jsx' 等
6. import mock 数据：from '../data/biomechanicsMock.js'

同时修改 AIAnalystPlatform.jsx：
1. TABS 数组新增 { key: 'biomechanics', label: '生物力学分析' }
2. import BiomechanicsAnalysis from './BiomechanicsAnalysis.jsx'
3. 渲染区域新增 {activeTab === 'biomechanics' ? <BiomechanicsAnalysis /> : null}

同时修改 useMockApi.js：
新增 export const useBiomechanicsMock = () => { return { jointAngle, forceTiming, cogTrajectory, symmetry, fatigue } }

组件用 export default 导出 BiomechanicsAnalysis。
```

---

## 六、使用说明

1. **先发"通用前置提示词"**给 opencode，让它了解项目设计系统。
2. 然后依次发提示词1-5生成5个子组件，最后发提示词6生成主模块+mock数据+修改接入。
3. 生成的文件放入对应目录：
   - 子组件 → `src/pages/WebApp/components/`
   - 主模块 → `src/pages/WebApp/modules/`
   - mock数据 → `src/pages/WebApp/data/`
4. 修改 `AIAnalystPlatform.jsx` 的 TABS（新增第6项）和渲染分支，`useMockApi.js` 新增 hook。
5. 所有组件自动适配亮色/深色模式（因为用 CSS 变量）。
6. 图表是纯 SVG，无额外依赖。
7. 若 opencode 生成的 SVG 图表不够精确（如人体骨架比例、球场标线位置），可追问"把XX图的坐标/比例调整一下"。
8. 人体骨架图和球场图建议生成后检查视觉效果，必要时追问微调。

### 与技术优势三方案的关键差异

| 维度 | 技术优势三（营销系统） | 技术优势二（生物力学分析） |
|:---|:---|:---|
| 接入位置 | VideoMarketing.jsx 第4个Tab | AIAnalystPlatform.jsx 第6个Tab |
| 领域 | 视频营销·传播追踪 | 运动生物力学·技术分析 |
| 核心可视化 | 雷达图/桑基图/漏斗图/关系图谱 | 人体骨架图/时序条/球场轨迹/对称对比/衰减曲线 |
| 数据特征 | 营销指标（播放/点击/转化） | 生物力学指标（角度/力量/轨迹/对称度/疲劳） |
| 导航方式 | 步骤进度条（评估+4步流程） | 维度切换条（5个分析维度平级） |
| 标准认证 | 无 | CBA 2025技术体能测试标准对标 |
| 面向角色 | 运营/营销人员 | 教练/体能师/运动分析师 |
