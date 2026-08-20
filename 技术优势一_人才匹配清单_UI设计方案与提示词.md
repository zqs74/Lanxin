# 昇梦体育 · 技术优势一 — 手机端人员匹配清单UI设计方案与 opencode 提示词

> 用途：技术优势一"智能人才匹配"PPT页面右侧手机区域，替换原有的AI对话截图，展示**赛事人员匹配清单**——用户输入需求后，系统输出整场比赛匹配的人员名单（含照片、信息、推荐排序）。
> 接入位置：管理控制台 → 新增功能入口「人才匹配清单」（Dashboard 新增 FeatureCard + index.jsx 新增 view）。
> 展示形式：手机框（PhoneFrame）内嵌移动端风格的人员清单页面，可直接截图用于PPT。
> 风格复用项目金色主题设计系统，自动适配亮色/深色模式。

---

## 一、项目实际设计系统（从代码提炼，必须严格遵循）

### 技术栈

- **React 19** + Vite + Tailwind CSS 3 + react-router v7
- **图标**：lucide-react（禁止用 emoji 或其他图标库）
- **主题**：`data-theme="dark|light"` 属性切换，全部用 CSS 变量

### CSS 变量系统（亮/深色自动适配，禁止硬编码颜色）

| 变量 | 深色模式值 | 亮色模式值 | 语义 |
|:---|:---|:---|:---|
| `--brand` | `#D4AF37` 金 | `#B8941F` 暗金 | 品牌主色/强调 |
| `--ok` | `#10B981` 绿 | `#059669` | 成功/高匹配 |
| `--warn` | `#F59E0B` 琥珀 | `#D97706` | 警告/中匹配 |
| `--danger` | `#EF4444` 红 | `#DC2626` | 错误/低匹配 |
| `--info` | `#3B82F6` 蓝 | `#2563EB` | 信息/裁判组 |
| `--purple` | `#8B5CF6` 紫 | `#7C3AED` | 辅助/教练组 |
| `--text-primary` | `#ffffff` | `#1a1a1a` | 正文主色 |
| `--text-muted` | `#6b7280` | `#9ca3af` | 次要文字 |
| `--surface` | `#1a1610` | `#ffffff` | 卡片面 |
| `--surface-muted` | `#2a2418` | `#f0ede6` | 卡片次面/输入框 |
| `--border` | `rgba(212,175,55,0.2)` | `rgba(184,148,31,0.2)` | 边框 |
| `--bg-primary` | `#0a0a0a` | `#f5f3ee` | 页面背景 |

### 已有图片资源（直接复用，无需额外生成）

项目中 `ResourcesPage.jsx` 已有完整的人员数据，图片路径格式：

| 类型 | 路径前缀 | 数量 | 文件格式 |
|:---|:---|:---|:---|
| 裁判照片 | `/images/resources/hr/referees/ref-{id}.jpg` 或 `.png` | 17张 | ref-1~6.jpg, ref-7~17.png |
| 教练照片 | `/images/resources/hr/coaches/coach-{id}.jpg` 或 `.png` | 19张 | coach-1~6.jpg, coach-7~19.png |

> 图片存放在 `public/images/resources/hr/` 目录，前端通过绝对路径引用。

### 复用组件清单

| 组件 | 用法 | 说明 |
|:---|:---|:---|
| `card-base` | `<div className="card-base p-5">` | 渐变背景卡片 |
| `card-solid` | `<div className="card-base card-solid p-5">` | 纯色背景卡片 |
| `StatusPill` | `<StatusPill variant="ok">已匹配</StatusPill>` | 状态胶囊 |

### Tailwind 用法约定

- 颜色一律 `text-[var(--brand)]`、`bg-[var(--surface-muted)]`、`border-[var(--border)]`
- 圆角：`rounded-2xl`（卡片）、`rounded-xl`（内部元素）、`rounded-full`（头像/标签）
- 字号：`text-sm`（正文）、`text-xs`（说明）、`text-lg font-bold`（标题）、`text-xl font-black tabular-nums`（数字）

---

## 二、PPT背景与需求分析

### PPT原始内容（技术优势一）

技术优势一展示"智能人才匹配"全流程，包含三部分：
1. **左**：专业人才筛选与引进（人才库1168人，9个结构化标签）
2. **中**：筛选流程与标签体系（资质核验→能力测评→背景调查 + 基础标签/深度标签）
3. **右**：智能匹配全流程（需求输入→解析标签→算法匹配→结果输出），含手机mockup

### 老师修改要求

将右侧手机区域原有的AI对话截图替换为**人员匹配清单**：
- 用户输入需求后，系统给出整场比赛匹配的人员
- 包含不同职位（裁判/技术人员/记录台/医护/安保等）
- 每人有照片和信息
- 加推荐程度排序（匹配程度最高排在前面）
- 小程序没有教练照片，网页端有，所以在网页端实现

### 设计决策

**手机框 + 移动端UI**，原因：
1. PPT右侧原本就是手机mockup位置，保持视觉一致
2. 手机框形式截图后直接贴入PPT，美观清晰
3. 移动端竖屏布局适合展示人员列表卡片
4. 与PPT"匹配结果输出：Top推荐候选人"文案呼应

---

## 三、接入架构

### 文件规划

```
src/pages/WebApp/
├── modules/
│   └── TalentMatchRoster.jsx              ← 新建：人才匹配清单主页面（含手机框 + 页面标题）
├── components/
│   ├── PhoneFrame.jsx                     ← 新建：通用手机框组件（可复用）
│   └── PersonnelRoster.jsx                ← 新建：手机内人员清单内容
├── data/
│   └── talentMatchMock.js                 ← 新建：人员匹配mock数据（复用ResourcesPage裁判/教练数据）
├── components/
│   └── FeatureCard.jsx                    ← 修改：新增 'roster' variant
├── Dashboard.jsx                          ← 修改：功能导航新增 'roster' 入口
└── index.jsx                              ← 修改：新增 case 'roster' 渲染分支
```

### index.jsx 修改点

```jsx
// VIEW_NAME 新增
roster: '人才匹配清单'

// import 新模块
import TalentMatchRoster from './modules/TalentMatchRoster.jsx';

// renderView 新增
case 'roster':
  return <TalentMatchRoster />;
```

### Dashboard.jsx 修改点

功能导航网格新增 'roster' 卡片。

### FeatureCard.jsx 修改点

1. import 新增 `Smartphone` 图标
2. FEATURE_META 新增 `roster: { Icon: Smartphone, title: '人才匹配清单', summary: '', isNew: true }`
3. renderPreview 新增 `case 'roster'`：画一个手机框缩略图 + 里面几个人头圆点

---

## 四、组件设计

### 4.1 PhoneFrame.jsx（通用手机框）

**功能**：渲染一个逼真的智能手机外框，内嵌 children 内容。

**视觉规格**：
- 外框宽度：375px（标准移动端宽度）
- 外框圆角：rounded-[2.5rem]
- 外框背景：bg-[var(--surface)] + border-8 border-[var(--bg-primary)]（深色模式下边框接近黑色，亮色模式下接近深灰）
- 顶部刘海/灵动岛：居中黑色圆角条 w-24 h-6 rounded-full bg-black，absolute top-2
- 底部Home条：居中 w-28 h-1 rounded-full bg-[var(--text-muted)] opacity-40，absolute bottom-2
- 状态栏（刘海两侧）：左 9:41 时间文字 text-[10px]，右 信号/WiFi/电池 小图标（用 lucide Signal/Wifi/BatteryFull，size=10）
- 内部内容区：overflow-y-auto，高度固定 720px（可滚动），padding-top 28px（避开刘海）

**Props**：
```jsx
<PhoneFrame statusBarColor="light">
  {children}
</PhoneFrame>
```
- `statusBarColor`: 'light'(深色背景白字) | 'dark'(浅色背景黑字)，默认 'light'
- `children`: 手机屏幕内容

**实现要点**：
```jsx
export default function PhoneFrame({ children, statusBarColor = 'light' }) {
  return (
    <div className="relative mx-auto" style={{ width: '375px' }}>
      {/* 手机外框 */}
      <div className="relative rounded-[2.5rem] border-[6px] border-[#1a1a1a] bg-[var(--bg-primary)] overflow-hidden shadow-2xl"
           style={{ height: '760px' }}>
        {/* 状态栏 */}
        <div className="absolute top-0 left-0 right-0 h-8 z-20 flex items-center justify-between px-6 pt-2">
          <span className={`text-[11px] font-semibold ${statusBarColor === 'light' ? 'text-white' : 'text-black'}`}>9:41</span>
          {/* 灵动岛 */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-24 h-6 rounded-full bg-black" />
          <div className="flex items-center gap-1">
            <Signal size={11} className={statusBarColor === 'light' ? 'text-white' : 'text-black'} />
            <Wifi size={11} className={statusBarColor === 'light' ? 'text-white' : 'text-black'} />
            <BatteryFull size={13} className={statusBarColor === 'light' ? 'text-white' : 'text-black'} />
          </div>
        </div>
        {/* 内容区 */}
        <div className="h-full overflow-y-auto pt-8 pb-6 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {children}
        </div>
        {/* Home条 */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-[var(--text-muted)] opacity-40 z-20" />
      </div>
    </div>
  );
}
```

### 4.2 PersonnelRoster.jsx（手机内人员清单内容）

**功能**：在手机屏幕内展示赛事人员匹配清单，按职位分组，每人含照片+信息+匹配分，支持按匹配度排序。

**布局结构（从上到下）**：

#### 1. App头部（固定高度，金色渐变背景）
- 高度：52px
- 背景：`linear-gradient(135deg, var(--brand), #B8941F)`（金色渐变）
- 左：ChevronLeft 图标（白色 size=20）
- 中：标题"昇梦AI"（text-sm font-bold text-white）+ 副标题"赛事人员匹配清单"（text-[10px] text-white/80）
- 右：MoreHorizontal 图标（白色 size=18）

#### 2. 赛事信息条（紧贴头部下方）
- 背景：`bg-[var(--surface)]`
- flex items-center justify-between px-4 py-2.5
- 左：Trophy 图标 var(--brand) size=14 + "粤BA半决赛"（text-xs font-bold）+ StatusPill variant="brand" "Ⅰ级"
- 中：CalendarDays size=12 text-muted + "08.20-22"（text-[10px] text-muted）
- 右：Users size=12 text-muted + "48人"（text-[10px] text-muted font-bold tabular-nums）
- 底部细线 border-b border-[var(--border)]

#### 3. AI匹配摘要条（金色高亮）
- 背景：`bg-[var(--brand)]/10`
- flex items-center gap-2 px-4 py-2
- Sparkles 图标 var(--brand) size=14
- "AI已完成匹配"（text-xs font-bold text-[var(--brand)]）
- "· 匹配率97.7% · 36小时到岗"（text-[10px] text-muted）
- 右侧 CheckCircle2 图标 var(--ok) size=14

#### 4. 排序切换条
- flex items-center justify-between px-4 py-2
- 左：text-[11px] text-muted "共5组 · 18人"
- 右：排序切换按钮组（两个小标签）
  - "按职位"（默认选中：bg-[var(--brand)] text-black px-2.5 py-1 rounded-full text-[10px] font-bold）
  - "按匹配度"（未选中：border border-[var(--border)] text-muted px-2.5 py-1 rounded-full text-[10px]）
  - 用 useState 管理 sortBy ('position' | 'score')
  - 点击切换时，列表重新排序

#### 5. 人员列表（核心区域，可滚动）

**按职位模式（sortBy='position'）**：按职位分组展示

每个职位组结构：
```
┌─────────────────────────────────┐
│ [图标] 裁判组            6人     │  ← 组标题行
├─────────────────────────────────┤
│ ┌────┐ 闫军           ⭐推荐    │  ← 人员卡片
│ │照片│ 主裁判 · 国际级          │
│ │    │ 22年经验 · 156场 · ★4.9  │
│ └────┘              匹配度 98%  │
├─────────────────────────────────┤
│ ┌────┐ 郭楠                     │
│ │照片│ 第一副裁 · 国际级         │
│ │    │ 15年经验 · 98场 · ★4.6   │
│ └────┘              匹配度 95%  │
└─────────────────────────────────┘
```

组标题行：
- flex items-center justify-between px-4 py-2 bg-[var(--surface-muted)]/50
- 左：lucide图标（圆角方块 w-6 h-6 bg-[var(--对应色)]/15）+ 组名（text-xs font-bold）+ 人数标签（StatusPill 对应color "{count}人"）
- 职位组颜色映射：裁判→info蓝 / 教练→purple紫 / 记录台→ok绿 / 医护→danger红 / 安保→warn琥珀 / 运营→brand金

人员卡片（每人一个）：
- flex items-start gap-3 px-4 py-3 border-b border-[var(--border)]/30
- 左：头像 img w-12 h-12 rounded-full object-cover border-2（border颜色按匹配度：95+→var(--ok), 85-94→var(--brand), <85→var(--warn)）
  - 如果有照片用 `<img src={avatar} />`
  - 如果无照片用 `<div className="w-12 h-12 rounded-full bg-[var(--对应组色)]/20 flex items-center justify-center text-sm font-bold text-[var(--对应组色)]">{name[0]}</div>`
- 中（flex-1 min-w-0）：
  - 第一行 flex items-center gap-1.5：
    - 姓名（text-sm font-bold text-[var(--text-primary)]）
    - 如果是推荐第一名：Badge "推荐"（px-1.5 py-0.5 rounded bg-[var(--brand)] text-black text-[9px] font-bold + Star图标 size=8）
  - 第二行：职位 · 级别（text-[11px] text-muted）
    - 如"主裁判 · 国际级" / "记录台长 · 一级" / "执业医师"
  - 第三行 flex items-center gap-2 text-[10px] text-muted：
    - 经验："{years}年经验"
    - 执裁场次："{matches}场"（裁判/教练有此项）
    - 评分：Star图标 size=9 var(--brand) + "{rating}"
  - 第四行（标签）：flex flex-wrap gap-1
    - 每个标签：px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[9px] text-muted
    - 最多显示3个标签
- 右（匹配度）：
  - 上：百分比大数字（text-lg font-black tabular-nums，颜色按匹配度）
  - 下："匹配度"（text-[9px] text-muted text-center）
  - 匹配度颜色：95+→var(--ok), 85-94→var(--brand), <85→var(--warn)
  - 匹配度下方迷你环形进度条：SVG circle r=10，strokeWidth=2，背景stroke="var(--border)"，前景stroke=对应色，strokeDasharray按百分比

**按匹配度模式（sortBy='score'）**：不分组，所有人员按匹配分从高到低排列
- 顶部加一个说明条："按匹配度排序 · 最高98%"
- 每张卡片左侧头像下方加一个小标签显示所属职位组（如"裁判组"），颜色用对应组色
- 排序：matchScore 降序

#### 6. 底部操作栏（固定在手机内容底部）
- flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-t border-[var(--border)]
- 左：text-[10px] text-muted "18人已匹配 · 待确认"
- 右：btn-accent 小按钮 "确认名单"（Check图标 size=12 + 文字 text-xs）

---

## 五、数据结构设计

### talentMatchMock.js

```js
// 复用 ResourcesPage 的裁判和教练数据，增加匹配相关字段

export const MATCH_EVENT = {
  tournament: '粤BA半决赛',
  level: 'Ⅰ级',
  date: '2026-08-20 ~ 08-22',
  totalMatches: 12,
  totalStaff: 18,
  matchRate: 97.7,
  deployHours: 36
}

export const PERSONNEL_GROUPS = [
  {
    id: 'referee',
    name: '裁判组',
    icon: 'Whistle',        // lucide图标名（运行时映射）
    color: 'info',
    total: 6,
    members: [
      {
        id: 'ref-1',
        name: '闫军',
        avatar: '/images/resources/hr/referees/ref-1.jpg',
        hasPhoto: true,
        role: '主裁判',
        level: '国际级',
        years: 22,
        matches: 156,
        rating: 4.9,
        matchScore: 98,
        isRecommended: true,
        recommendReason: '资质最高·粤BA执裁经验丰富',
        tags: ['CBA', '国际级', '十佳裁判']
      },
      {
        id: 'ref-2',
        name: '郭楠',
        avatar: '/images/resources/hr/referees/ref-2.jpg',
        hasPhoto: true,
        role: '第一副裁',
        level: '国际级',
        years: 15,
        matches: 98,
        rating: 4.6,
        matchScore: 95,
        isRecommended: false,
        tags: ['CBA', '国际级', '十佳裁判']
      },
      {
        id: 'ref-6',
        name: '巫志威',
        avatar: '/images/resources/hr/referees/ref-6.jpg',
        hasPhoto: true,
        role: '第二副裁',
        level: '国际级',
        years: 12,
        matches: 72,
        rating: 4.5,
        matchScore: 93,
        isRecommended: false,
        tags: ['广东篮协', '国际级', '粤BA']
      },
      {
        id: 'ref-9',
        name: '刘存',
        avatar: '/images/resources/hr/referees/ref-9.png',
        hasPhoto: true,
        role: '备用裁判',
        level: '国家级',
        years: 13,
        matches: 85,
        rating: 4.4,
        matchScore: 89,
        isRecommended: false,
        tags: ['广东篮协', '国家级', '东莞']
      },
      {
        id: 'ref-8',
        name: '潘荣远',
        avatar: '/images/resources/hr/referees/ref-8.png',
        hasPhoto: true,
        role: '技术代表',
        level: '国家级',
        years: 23,
        matches: 200,
        rating: 4.8,
        matchScore: 91,
        isRecommended: false,
        tags: ['广东篮协', '国家级', '东莞']
      },
      {
        id: 'ref-10',
        name: '张明',
        avatar: '/images/resources/hr/referees/ref-10.png',
        hasPhoto: true,
        role: '裁判长',
        level: '国家级',
        years: 40,
        matches: 300,
        rating: 4.7,
        matchScore: 90,
        isRecommended: false,
        tags: ['广东篮协', '东莞', '裁委会主任']
      }
    ]
  },
  {
    id: 'coach',
    name: '技术指导组',
    icon: 'ClipboardList',
    color: 'purple',
    total: 3,
    members: [
      {
        id: 'coach-9',
        name: '丹尼',
        avatar: '/images/resources/hr/coaches/coach-9.png',
        hasPhoto: true,
        role: '技术指导',
        level: '国家二级运动员',
        years: 9,
        matches: 0,
        rating: 4.5,
        matchScore: 92,
        isRecommended: true,
        recommendReason: '广东本地·青训经验丰富',
        tags: ['广东', '国家二级运动员', '10年经验']
      },
      {
        id: 'coach-17',
        name: '曲绍斌',
        avatar: '/images/resources/hr/coaches/coach-17.png',
        hasPhoto: true,
        role: '战术指导',
        level: 'CBA总冠军教练',
        years: 10,
        matches: 0,
        rating: 4.7,
        matchScore: 90,
        isRecommended: false,
        tags: ['后卫', 'CBA联赛总冠军', '广东宏远']
      },
      {
        id: 'coach-16',
        name: '王怀玉',
        avatar: '/images/resources/hr/coaches/coach-16.png',
        hasPhoto: true,
        role: '青训顾问',
        level: '高级教练',
        years: 27,
        matches: 0,
        rating: 4.6,
        matchScore: 87,
        isRecommended: false,
        tags: ['广东宏远', '青训教父']
      }
    ]
  },
  {
    id: 'scorer',
    name: '记录台组',
    icon: 'ClipboardList',
    color: 'ok',
    total: 4,
    members: [
      {
        id: 'sc-1',
        name: '张秀芳',
        avatar: null,
        hasPhoto: false,
        role: '记录台长',
        level: '一级',
        years: 15,
        matches: 120,
        rating: 4.7,
        matchScore: 94,
        isRecommended: true,
        recommendReason: '经验丰富·记录台管理能力强',
        tags: ['一级', '120场经验']
      },
      {
        id: 'sc-2',
        name: '李伟明',
        avatar: null,
        hasPhoto: false,
        role: '记录员',
        level: '二级',
        years: 8,
        matches: 60,
        rating: 4.3,
        matchScore: 88,
        isRecommended: false,
        tags: ['二级', '东莞']
      },
      {
        id: 'sc-3',
        name: '陈小红',
        avatar: null,
        hasPhoto: false,
        role: '计时员',
        level: '二级',
        years: 6,
        matches: 45,
        rating: 4.2,
        matchScore: 85,
        isRecommended: false,
        tags: ['二级', '粤BA']
      },
      {
        id: 'sc-4',
        name: '黄志强',
        avatar: null,
        hasPhoto: false,
        role: '24秒计时员',
        level: '三级',
        years: 4,
        matches: 30,
        rating: 4.0,
        matchScore: 82,
        isRecommended: false,
        tags: ['三级', '东莞']
      }
    ]
  },
  {
    id: 'medical',
    name: '医护组',
    icon: 'HeartPulse',
    color: 'danger',
    total: 2,
    members: [
      {
        id: 'med-1',
        name: '陈医生',
        avatar: null,
        hasPhoto: false,
        role: '医护负责人',
        level: '执业医师',
        years: 12,
        matches: 80,
        rating: 4.8,
        matchScore: 95,
        isRecommended: true,
        recommendReason: '执业资质·赛事医疗保障经验丰富',
        tags: ['执业医师', '急救认证', '80场']
      },
      {
        id: 'med-2',
        name: '林护士',
        avatar: null,
        hasPhoto: false,
        role: '急救员',
        level: '急救员证书',
        years: 5,
        matches: 35,
        rating: 4.4,
        matchScore: 86,
        isRecommended: false,
        tags: ['急救员', 'AED认证']
      }
    ]
  },
  {
    id: 'security',
    name: '安保运营组',
    icon: 'ShieldCheck',
    color: 'warn',
    total: 3,
    members: [
      {
        id: 'sec-1',
        name: '刘铁柱',
        avatar: null,
        hasPhoto: false,
        role: '安保队长',
        level: '高级安保',
        years: 10,
        matches: 200,
        rating: 4.5,
        matchScore: 90,
        isRecommended: true,
        recommendReason: '安保经验丰富·大型赛事执裁200+场',
        tags: ['高级安保', '200场']
      },
      {
        id: 'sec-2',
        name: '赵勇',
        avatar: null,
        hasPhoto: false,
        role: '安保员',
        level: '中级安保',
        years: 5,
        matches: 80,
        rating: 4.2,
        matchScore: 84,
        isRecommended: false,
        tags: ['中级安保', '东莞']
      },
      {
        id: 'sec-3',
        name: '孙丽',
        avatar: null,
        hasPhoto: false,
        role: '运营协调',
        level: '运营专员',
        years: 6,
        matches: 50,
        rating: 4.3,
        matchScore: 83,
        isRecommended: false,
        tags: ['运营', '粤BA']
      }
    ]
  }
]
```

> **数据要点**：
> - 裁判组6人 + 技术指导组3人 + 记录台组4人 + 医护组2人 + 安保运营组3人 = 共18人
> - 有照片的（裁判6人 + 教练3人 = 9人）使用 `<img>` 标签引用真实图片路径
> - 无照片的（记录台4人 + 医护2人 + 安保3人 = 9人）使用姓名首字符圆形头像
> - 匹配分从98到82递减，分布合理
> - 每组有1个 isRecommended=true 的推荐人选

---

## 六、opencode 提示词

> 以下提示词生成3个文件 + 修改4个文件。所有提示词已内嵌项目设计规范。

---

### 通用前置提示词（每次先发这条）

```
我有一个 React 19 + Vite + Tailwind CSS 3 项目（篮球赛事智慧运营平台"篮芯AI"），需要你帮我写新的 UI 组件。

【项目设计系统 - 必须严格遵循】
1. 主题：data-theme="dark|light" 切换，全部用 CSS 变量，禁止硬编码颜色
2. CSS 变量：
   --brand(#D4AF37金)、--ok(#10B981绿)、--warn(#F59E0B)、--danger(#EF4444红)、--info(#3B82F6蓝)、--purple(#8B5CF6紫)
   --text-primary、--text-muted、--surface、--surface-muted、--border、--bg-primary
3. 卡片类名：card-base（渐变）、card-solid（纯色）
4. 按钮：btn btn-accent（金色主按钮）、btn btn-ghost（幽灵按钮）
5. 图标：从 lucide-react 导入，如 import { ChevronLeft, MoreHorizontal, Star, CheckCircle2 } from 'lucide-react'
6. 状态胶囊组件 StatusPill：<StatusPill variant="ok">已匹配</StatusPill>，variant 可选 ok/warn/danger/info/purple/brand
7. 颜色在 Tailwind 中写法：text-[var(--brand)]、bg-[var(--surface-muted)]、border-[var(--border)]
8. 已有图片资源路径：
   - 裁判照片：/images/resources/hr/referees/ref-{id}.jpg 或 .png（ref-1~6是.jpg，ref-7~17是.png）
   - 教练照片：/images/resources/hr/coaches/coach-{id}.jpg 或 .png（coach-1~6是.jpg，coach-7~19是.png）
9. 禁止用 emoji，所有图标从 lucide-react 导入

请基于以上规范生成代码。每个组件用 export default 导出。
```

---

### 提示词 1：PhoneFrame.jsx（手机框组件）

```
基于项目设计系统，创建组件 PhoneFrame.jsx（通用手机外框组件）。

这是一个可复用的手机外框组件，用于在网页中展示移动端UI，截图后可直接用于PPT。

【视觉规格】
- 外框宽度：375px
- 外框高度：760px
- 外框圆角：rounded-[2.5rem]
- 外框边框：6px solid #1a1a1a（深色边框模拟手机外壳）
- 外框阴影：shadow-2xl
- 外框背景色：var(--bg-primary)

【结构】
1. 状态栏（absolute top-0 z-20，高32px）：
   - 左侧：时间"9:41"（text-[11px] font-semibold text-white）
   - 中间：灵动岛——w-24 h-6 rounded-full bg-black，absolute居中 top-2
   - 右侧：3个 lucide 图标横排（Signal size=11 / Wifi size=11 / BatteryFull size=13），text-white
   - 整行 padding: px-6 pt-2

2. 内容区（overflow-y-auto，padding-top: 32px 避开状态栏，padding-bottom: 24px 避开Home条）：
   - 直接渲染 props.children
   - 隐藏滚动条：style={{ scrollbarWidth: 'none' }} + className 中加 scrollbar-hide
   - 加一个 <style>{`::-webkit-scrollbar { display: none; }`}</style> 隐藏 webkit 滚动条

3. Home指示条（absolute bottom-1.5 z-20）：
   - w-28 h-1 rounded-full bg-[var(--text-muted)] opacity-40
   - 居中：left-1/2 -translate-x-1/2

【Props】
- children: React.ReactNode（手机屏幕内容）
- statusBarColor: 'light' | 'dark'（默认 'light'，light=白字用于深色背景，dark=黑字用于浅色背景）

【实现要点】
- 外层 div className="relative mx-auto" style={{ width: '375px' }}
- 内层 div 包含所有手机元素
- 状态栏文字颜色根据 statusBarColor 切换
- 组件用 export default 导出
```

---

### 提示词 2：PersonnelRoster.jsx（手机内人员清单）

```
基于项目设计系统，创建组件 PersonnelRoster.jsx（赛事人员匹配清单——手机端内容）。

这是技术优势一"智能人才匹配"的手机端展示页面：用户输入需求后，系统输出整场比赛匹配的人员名单，按职位分组，含照片和信息，支持按匹配度排序。

【数据来源】
从 props 接收 data 对象，包含：
- event: { tournament: '粤BA半决赛', level: 'Ⅰ级', date: '08.20-22', totalStaff: 18, matchRate: 97.7, deployHours: 36 }
- groups: 5个职位组数组，每组 { id, name, icon, color, total, members: [...] }
  每个 member: { id, name, avatar(图片路径或null), hasPhoto(bool), role, level, years, matches, rating, matchScore, isRecommended(bool), recommendReason, tags:[] }

职位组数据（共5组18人）：
1. 裁判组(info蓝, 6人)：
   - 闫军 ref-1.jpg 主裁判 国际级 22年 156场 ★4.9 匹配98% [推荐] tags:[CBA,国际级,十佳裁判]
   - 郭楠 ref-2.jpg 第一副裁 国际级 15年 98场 ★4.6 匹配95%
   - 巫志威 ref-6.jpg 第二副裁 国际级 12年 72场 ★4.5 匹配93%
   - 潘荣远 ref-8.png 技术代表 国家级 23年 200场 ★4.8 匹配91%
   - 张明 ref-10.png 裁判长 国家级 40年 300场 ★4.7 匹配90%
   - 刘存 ref-9.png 备用裁判 国家级 13年 85场 ★4.4 匹配89%
2. 技术指导组(purple紫, 3人)：
   - 丹尼 coach-9.png 技术指导 国家二级运动员 9年 ★4.5 匹配92% [推荐] tags:[广东,国家二级运动员,10年经验]
   - 曲绍斌 coach-17.png 战术指导 CBA总冠军教练 10年 ★4.7 匹配90%
   - 王怀玉 coach-16.png 青训顾问 高级教练 27年 ★4.6 匹配87%
3. 记录台组(ok绿, 4人)：
   - 张秀芳(无照片) 记录台长 一级 15年 120场 ★4.7 匹配94% [推荐]
   - 李伟明(无照片) 记录员 二级 8年 60场 ★4.3 匹配88%
   - 陈小红(无照片) 计时员 二级 6年 45场 ★4.2 匹配85%
   - 黄志强(无照片) 24秒计时员 三级 4年 30场 ★4.0 匹配82%
4. 医护组(danger红, 2人)：
   - 陈医生(无照片) 医护负责人 执业医师 12年 80场 ★4.8 匹配95% [推荐]
   - 林护士(无照片) 急救员 急救员证书 5年 35场 ★4.4 匹配86%
5. 安保运营组(warn琥珀, 3人)：
   - 刘铁柱(无照片) 安保队长 高级安保 10年 200场 ★4.5 匹配90% [推荐]
   - 赵勇(无照片) 安保员 中级安保 5年 80场 ★4.2 匹配84%
   - 孙丽(无照片) 运营协调 运营专员 6年 50场 ★4.3 匹配83%

【布局结构（从上到下）】

1. App头部（高52px，金色渐变背景）：
   style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}
   flex items-center justify-between px-4 h-[52px]
   - 左：ChevronLeft 图标 text-white size=20
   - 中（text-center）：
     "昇梦AI"（text-sm font-bold text-white）
     "赛事人员匹配清单"（text-[10px] text-white/80）
   - 右：MoreHorizontal 图标 text-white size=18

2. 赛事信息条（bg-[var(--surface)]）：
   flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]
   - 左：Trophy size=14 style={{color:'var(--brand)'}} + "粤BA半决赛"（text-xs font-bold）+ StatusPill variant="brand" "Ⅰ级"
   - 中：CalendarDays size=12 text-muted + "08.20-22"（text-[10px] text-muted）
   - 右：Users size=12 text-muted + "18人"（text-[10px] font-bold tabular-nums text-muted）

3. AI匹配摘要条（bg-[var(--brand)]/10）：
   flex items-center gap-2 px-4 py-2
   - Sparkles size=14 style={{color:'var(--brand)'}} + "AI已完成匹配"（text-xs font-bold text-[var(--brand)]）
   - "· 匹配率97.7% · 36h到岗"（text-[10px] text-muted）
   - 右侧ml-auto：CheckCircle2 size=14 style={{color:'var(--ok)'}}

4. 排序切换条：
   flex items-center justify-between px-4 py-2
   - 左：text-[11px] text-muted "共5组 · 18人"
   - 右：两个排序标签按钮（用 useState sortBy 管理，默认 'position'）
     "按职位"：选中时 className="bg-[var(--brand)] text-black px-2.5 py-1 rounded-full text-[10px] font-bold"
     "按匹配度"：选中时同上样式，未选中时 className="border border-[var(--border)] text-[var(--text-muted)] px-2.5 py-1 rounded-full text-[10px]"
     两个按钮间 gap-1.5

5. 人员列表区域：

  【当 sortBy='position' 时——按职位分组】

  遍历 groups 数组，每组渲染：

  a) 组标题行：
     flex items-center justify-between px-4 py-2 bg-[var(--surface-muted)]/50
     - 左：flex items-center gap-2
       图标圆角方块 w-6 h-6 rounded-lg flex items-center justify-center
       背景色和图标色按组 color 映射：
       info→bg-[var(--info)]/15 + text-[var(--info)]
       purple→bg-[var(--purple)]/15 + text-[var(--purple)]
       ok→bg-[var(--ok)]/15 + text-[var(--ok)]
       danger→bg-[var(--danger)]/15 + text-[var(--danger)]
       warn→bg-[var(--warn)]/15 + text-[var(--warn)]
       图标用 lucide：裁判组用 Whistle（如无则用 Users），技术指导用 ClipboardList，记录台用 ClipboardList，医护用 HeartPulse，安保用 ShieldCheck
       组名（text-xs font-bold text-[var(--text-primary)]）
     - 右：StatusPill variant={color} "{total}人"

  b) 组内人员卡片（遍历 members）：
     每人一个 div，flex items-start gap-3 px-4 py-3 border-b border-[var(--border)]/30

     - 左侧头像（w-12 h-12 shrink-0）：
       如果 hasPhoto=true：
         <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border-2"
              style={{ borderColor: 匹配度对应色 }} />
       如果 hasPhoto=false：
         <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2"
              style={{ backgroundColor: 'color-mix(in srgb, var(--对应组色) 15%, transparent)',
                       color: 'var(--对应组色)',
                       borderColor: 匹配度对应色 }}>
           {name[0]}
         </div>
       匹配度对应色：matchScore>=95→var(--ok)，85-94→var(--brand)，<85→var(--warn)

     - 中间信息区（flex-1 min-w-0）：
       第一行 flex items-center gap-1.5：
         姓名（text-sm font-bold text-[var(--text-primary)]）
         如果 isRecommended=true：
           <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--brand)] text-black text-[9px] font-bold">
             <Star size={8} fill="currentColor" /> 推荐
           </span>
       第二行（text-[11px] text-[var(--text-muted)]）：
         "{role} · {level}"
       第三行 flex items-center gap-2 text-[10px] text-[var(--text-muted)]：
         "{years}年经验"
         如果 matches>0：· "{matches}场"
         Star size=9 style={{color:'var(--brand)'}} + "{rating}"
       第四行标签（flex flex-wrap gap-1 mt-1）：
         每个 tag：px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[9px] text-[var(--text-muted)]
         最多显示3个
       如果 isRecommended=true 且有 recommendReason：
         在标签下方加一行：text-[9px] text-[var(--brand)] italic "推荐理由：{recommendReason}"

     - 右侧匹配度（shrink-0 text-center w-12）：
       百分比（text-lg font-black tabular-nums，颜色按匹配度）
       "匹配度"（text-[9px] text-[var(--text-muted)]）
       下方迷你环形进度条（SVG w-6 h-6）：
         <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto mt-0.5">
           <circle cx="12" cy="12" r="10" fill="none" stroke="var(--border)" strokeWidth="2" />
           <circle cx="12" cy="12" r="10" fill="none" stroke="{匹配度色}" strokeWidth="2"
                   strokeDasharray="{2*PI*10}" strokeDashoffset="{2*PI*10*(1-score/100)}"
                   strokeLinecap="round" transform="rotate(-90 12 12)" />
         </svg>

  【当 sortBy='score' 时——按匹配度全局排序】

  将所有组的 members 展开为一个数组，按 matchScore 降序排列
  顶部加一个说明条：
    flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-muted)]/50
    ArrowDownWideNarrow size=12 text-muted + "按匹配度排序 · 最高{maxScore}%"（text-[10px] text-muted）

  每张人员卡片结构同上，但在左侧头像上方加一个小标签显示所属组名：
    在头像 div/img 外面包一层 relative div
    absolute -top-1 -left-1 px-1 py-0.5 rounded text-[8px] font-bold
    背景色用对应组色/15，文字色用对应组色
    内容为组名简称（裁判/指导/记录/医护/安保）

6. 底部操作栏（sticky bottom-0 bg-[var(--surface)] border-t border-[var(--border)] z-10）：
   flex items-center justify-between px-4 py-3
   - 左：text-[10px] text-[var(--text-muted)] "18人已匹配 · 待确认"
   - 右：button className="btn btn-accent flex items-center gap-1.5 text-xs px-4 py-1.5"
     Check size=12 + "确认名单"

【交互】
- 用 useState 管理 sortBy（'position' | 'score'）
- 点击排序标签切换模式，列表立即重新渲染
- 人员卡片点击时可选：展开更多信息（用 useState 记录展开的 id）——此功能可选，如实现则展开时显示 experience 详细描述

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 3：TalentMatchRoster.jsx + Mock数据 + 项目接入

```
基于项目设计系统，创建以下文件并修改现有文件：

## 文件1：src/pages/WebApp/data/talentMatchMock.js

导出人员匹配所需 mock 数据（复用项目已有的裁判/教练图片路径）：

export const MATCH_EVENT = {
  tournament: '粤BA半决赛', level: 'Ⅰ级', date: '08.20-22',
  totalStaff: 18, matchRate: 97.7, deployHours: 36
}

export const PERSONNEL_GROUPS = [5个职位组，共18人]
裁判组(info,6人)：闫军(ref-1.jpg,主裁判,国际级,22年,156场,4.9,98%,推荐) / 郭楠(ref-2.jpg,第一副裁,国际级,15年,98场,4.6,95%) / 巫志威(ref-6.jpg,第二副裁,国际级,12年,72场,4.5,93%) / 潘荣远(ref-8.png,技术代表,国家级,23年,200场,4.8,91%) / 张明(ref-10.png,裁判长,国家级,40年,300场,4.7,90%) / 刘存(ref-9.png,备用裁判,国家级,13年,85场,4.4,89%)
技术指导组(purple,3人)：丹尼(coach-9.png,技术指导,国家二级运动员,9年,4.5,92%,推荐) / 曲绍斌(coach-17.png,战术指导,CBA总冠军教练,10年,4.7,90%) / 王怀玉(coach-16.png,青训顾问,高级教练,27年,4.6,87%)
记录台组(ok,4人)：张秀芳(无照片,记录台长,一级,15年,120场,4.7,94%,推荐) / 李伟明(无照片,记录员,二级,8年,60场,4.3,88%) / 陈小红(无照片,计时员,二级,6年,45场,4.2,85%) / 黄志强(无照片,24秒计时员,三级,4年,30场,4.0,82%)
医护组(danger,2人)：陈医生(无照片,医护负责人,执业医师,12年,80场,4.8,95%,推荐) / 林护士(无照片,急救员,急救员证书,5年,35场,4.4,86%)
安保运营组(warn,3人)：刘铁柱(无照片,安保队长,高级安保,10年,200场,4.5,90%,推荐) / 赵勇(无照片,安保员,中级安保,5年,80场,4.2,84%) / 孙丽(无照片,运营协调,运营专员,6年,50场,4.3,83%)

每个人员对象字段：{ id, name, avatar(图片路径或null), hasPhoto(bool), role, level, years, matches(数字,非裁判教练为0), rating, matchScore(数字), isRecommended(bool), recommendReason(仅推荐人员有), tags:[] }

裁判图片路径规则：ref-1~6用.jpg后缀，ref-7~17用.png后缀
教练图片路径规则：coach-1~6用.jpg后缀，coach-7~19用.png后缀

## 文件2：src/pages/WebApp/modules/TalentMatchRoster.jsx

人才匹配清单主页面，包含：

1. 页面标题区（非手机框内，是网页页面顶部）：
   - flex items-center justify-between mb-6
   - 左：Smartphone 图标(lucide) + "人才匹配清单"标题（text-xl font-bold）+ 副标题"输入需求 → AI智能匹配 → 输出整场赛事人员名单"（text-sm text-muted）
   - 右：btn-ghost "导出名单"（Download图标）+ btn-ghost "打印"（Printer图标）

2. 页面说明条（card-solid p-3 mb-6）：
   flex items-center gap-3
   左：Sparkles 图标 var(--brand)
   "技术优势一 · 智能人才匹配"（text-sm font-bold）+ "匹配率97.7% · 36小时完成到岗 · 1168人人才库"（text-xs text-muted）
   右：StatusPill variant="brand" "PPT展示页"

3. 主体区域（flex justify-center）：
   居中渲染手机框：
   import PhoneFrame from '../components/PhoneFrame.jsx'
   import PersonnelRoster from '../components/PersonnelRoster.jsx'

   <PhoneFrame>
     <PersonnelRoster data={{ event: MATCH_EVENT, groups: PERSONNEL_GROUPS }} />
   </PhoneFrame>

4. 手机框右侧可选信息面板（grid-cols-1 lg:grid-cols-2 gap-8，左侧手机框，右侧说明文字）：
   仅在 lg 以上屏幕显示右侧面板：
   - 标题"匹配说明"（text-base font-bold mb-3）
   - 4个说明卡 space-y-3：
     a) "职位覆盖"：整场比赛覆盖裁判、技术指导、记录台、医护、安保5大职位组，共18人
     b) "智能推荐"：AI根据需求标签（资质等级/地域/赛事级别/经验场次）综合评分，每组推荐匹配度最高的人选
     c) "照片档案"：裁判和教练有真实照片档案，其他职位显示姓名首字头像
     d) "排序切换"：支持"按职位分组"和"按匹配度排序"两种视图切换
   每个说明卡 card-solid p-4，左侧 border-l-3 border-[var(--brand)]

5. import：
   import PhoneFrame from '../components/PhoneFrame.jsx'
   import PersonnelRoster from '../components/PersonnelRoster.jsx'
   import { MATCH_EVENT, PERSONNEL_GROUPS } from '../data/talentMatchMock.js'
   import { Smartphone, Download, Printer, Sparkles } from 'lucide-react'
   import StatusPill from '../components/StatusPill.jsx'

组件用 export default 导出。

## 修改文件3：src/pages/WebApp/index.jsx

1. VIEW_NAME 新增：roster: '人才匹配清单'
2. import：import TalentMatchRoster from './modules/TalentMatchRoster.jsx'
3. renderView 新增分支：case 'roster': return <TalentMatchRoster />

## 修改文件4：src/pages/WebApp/Dashboard.jsx

功能导航网格新增 'roster'：
将 'matching' 和 'roster' 一起放入功能卡网格：
{['ai', 'schedule', 'resource', 'emergency', 'visual', 'timeline', 'matching', 'roster'].map((v) => (
  <FeatureCard key={v} variant={v} onClick={() => onNavigate(v)} />
))}

## 修改文件5：src/pages/WebApp/components/FeatureCard.jsx

1. import 新增 Smartphone 图标：
   import { Video, Trophy, Package, ShieldAlert, CalendarPlus, Megaphone, PanelsTopLeft, Wand2, Smartphone } from 'lucide-react'

2. FEATURE_META 新增：
   roster: { Icon: Smartphone, title: '人才匹配清单', summary: '', isNew: true }

3. renderPreview 新增 case 'roster'：
   画一个手机框缩略图：外层 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-1.5
   内部画3-4个横排卡片缩略：每行一个圆形头像(w-3 h-3 rounded-full bg-[var(--brand)]/40) + 右侧两根灰条
   最顶部一个金色横条模拟App头部
```

---

## 七、使用说明

1. **先发"通用前置提示词"**给 opencode。
2. 依次发提示词1（PhoneFrame）→ 提示词2（PersonnelRoster）→ 提示词3（主模块+mock+接入）。
3. 生成文件放入对应目录后，启动项目即可在 Dashboard 看到「人才匹配清单」入口。
4. 进入页面后，手机框居中展示人员清单，可切换"按职位/按匹配度"排序。
5. **PPT截图方式**：进入页面后，切换到深色模式（data-theme="dark"），对手机框区域截图，贴入PPT技术优势一右侧手机区域即可。
6. 若手机框尺寸需要调整（如PPT中需要更大/更小），修改 PhoneFrame 的 width 和 height 即可。
7. 裁判和教练照片已存在于项目 `public/images/resources/hr/` 目录，无需额外下载。

### 设计亮点

| 亮点 | 说明 |
|:---|:---|
| 手机框逼真 | 灵动岛+状态栏+Home条，截图后可直接当手机UI用 |
| 真实照片 | 裁判6人+教练3人使用项目已有照片，其余用姓名首字头像 |
| 推荐标记 | 每组第一推荐人加金色"推荐"徽章+推荐理由 |
| 匹配度可视化 | 每人右侧大字百分比+迷你环形进度条，颜色按分值分级 |
| 双排序模式 | 按职位分组 / 按匹配度全局排序，一键切换 |
| PPT就绪 | 金色App头部+AI匹配摘要条，呼应PPT"97.7%匹配率·36h到岗"文案 |

### 与其他方案的关系

| 方案 | 定位 | 本方案关系 |
|:---|:---|:---|
| 核心业务一·资源匹配 | 3步全流程（输入→匹配→输出清单） | 本方案是资源匹配中"人才"部分的**手机端展示版**，聚焦人员匹配结果 |
| 技术优势二·生物力学 | 5张运动分析UI | 独立模块，无直接关联 |
| 技术优势三·视频营销 | 5张营销追踪UI | 独立模块，无直接关联 |
| 本方案·人才匹配清单 | 1张手机端人员清单UI | PPT技术优势一的配套展示页面 |
