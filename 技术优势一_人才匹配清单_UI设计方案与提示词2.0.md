# 昇梦体育 · 技术优势一 — 手机端人员匹配清单UI设计方案与 opencode 提示词（v2 对话版）

> 用途：技术优势一"智能人才匹配"PPT页面右侧手机区域，以**AI对话形式**展示：用户输入赛事需求 → AI输出整场比赛匹配的人员名单（含照片、信息、推荐排序）。
> 接入位置：管理控制台 → 新增功能入口「人才匹配清单」（Dashboard 新增 FeatureCard + index.jsx 新增 view）。
> 展示形式：手机框（PhoneFrame）内嵌**聊天对话界面**，用户消息+AI回复（含人员清单），可直接截图用于PPT。
> v2变更：①改为对话形式（用户输入需求→AI输出清单）②全部18人有真实照片。

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

### 图片资源清单（全部已有，18人全部有真实照片）

| 类型 | 路径前缀 | 数量 | 文件格式 | 来源 |
|:---|:---|:---|:---|:---|
| 裁判照片 | `/images/resources/hr/referees/ref-{id}.jpg` 或 `.png` | 17张 | ref-1~6.jpg, ref-7~17.png | 项目已有 |
| 教练照片 | `/images/resources/hr/coaches/coach-{id}.jpg` 或 `.png` | 19张 | coach-1~6.jpg, coach-7~19.png | 项目已有 |
| 记录台照片 | `/images/resources/hr/scorer/scorer-{id}.jpg` | 4张 | scorer-1~4.jpg | **新增（见zip包）** |
| 医护照片 | `/images/resources/hr/medical/medical-{id}.jpg` | 2张 | medical-1~2.jpg | **新增（见zip包）** |
| 安保照片 | `/images/resources/hr/security/security-{id}.jpg` | 3张 | security-1~3.jpg | **新增（见zip包）** |

> 新增的9张照片已打包在 `人员照片_记录台_医护_安保.zip` 中，解压后放入 `public/images/resources/hr/` 对应子目录即可。

### 复用组件清单

| 组件 | 用法 | 说明 |
|:---|:---|:---|
| `card-base` | `<div className="card-base p-5">` | 渐变背景卡片 |
| `card-solid` | `<div className="card-base card-solid p-5">` | 纯色背景卡片 |
| `StatusPill` | `<StatusPill variant="ok">已匹配</StatusPill>` | 状态胶囊 |

---

## 二、设计决策（v2 对话形式）

### 为什么用对话形式

原始PPT右侧手机区域展示的就是"昇梦AI"对话界面（用户发消息→AI回复）。老师的修改要求是：
- **保留对话形式**：用户输入需求 → AI输出人员清单
- 对话内容从"赛事方案"改为"人员匹配清单"
- 体现"信息输入输出"的交互过程

### 对话流程设计

```
┌─────────────────────────────────┐
│ ← 昇梦AI            ⋯           │  App头部（金色渐变）
│ 赛事人员匹配助手                  │
├─────────────────────────────────┤
│                                 │
│                 ┌─────────────┐ │
│                 │ 📋 用户需求  │ │  用户消息（右对齐，金色气泡）
│                 │             │ │
│                 │ 粤BA半决赛   │ │
│                 │ 8月20-22日   │ │
│                 │ 裁判6/指导3  │ │
│                 │ 记录4/医护2  │ │
│                 │ 安保3 共18人 │ │
│                 └─────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🤖 已为您匹配完成！          │ │  AI消息（左对齐，白色气泡）
│ │ 匹配率97.7%·36h到岗         │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👨 闫军  主裁判   98%   │ │ │  人员卡片（嵌在AI消息内）
│ │ │ 👨 郭楠  第一副裁 95%   │ │ │
│ │ │ ...                      │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ 💬 输入需求...           发送   │  底部输入栏
└─────────────────────────────────┘
```

---

## 三、接入架构

### 文件规划

```
src/pages/WebApp/
├── modules/
│   └── TalentMatchRoster.jsx              ← 新建：主页面（含手机框 + 页面标题）
├── components/
│   ├── PhoneFrame.jsx                     ← 新建：通用手机框组件
│   └── PersonnelRoster.jsx                ← 新建：手机内对话+人员清单内容
├── data/
│   └── talentMatchMock.js                 ← 新建：人员匹配mock数据（18人全有照片）
├── components/
│   └── FeatureCard.jsx                    ← 修改：新增 'roster' variant
├── Dashboard.jsx                          ← 修改：功能导航新增 'roster' 入口
└── index.jsx                              ← 修改：新增 case 'roster' 渲染分支
```

### index.jsx / Dashboard.jsx / FeatureCard.jsx 修改点

同v1方案，不再赘述。

---

## 四、组件设计

### 4.1 PhoneFrame.jsx（通用手机框）

同v1方案，不再赘述。宽度375px，高度760px，灵动岛+状态栏+Home条。

### 4.2 PersonnelRoster.jsx（手机内对话+人员清单）★v2核心改动

**功能**：在手机屏幕内展示**AI对话界面**——用户发送赛事需求消息，AI回复包含整场比赛匹配的人员清单（含照片、信息、匹配度、推荐排序）。

**布局结构（从上到下）**：

#### 1. App头部（固定，金色渐变背景）
- 高度：52px
- `style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}`
- flex items-center justify-between px-4 h-[52px]
- 左：ChevronLeft 图标 text-white size=20
- 中（text-center）：
  - "昇梦AI"（text-sm font-bold text-white）
  - "赛事人员匹配助手"（text-[10px] text-white/80）
- 右：MoreHorizontal 图标 text-white size=18

#### 2. 对话区域（核心，可滚动，flex-1 overflow-y-auto）

**背景**：`bg-[var(--bg-primary)]`，padding: px-3 py-3 space-y-4

##### 2a. 用户消息（右对齐）

容器：`flex justify-end`
- 头像（右侧）：w-8 h-8 rounded-full bg-[var(--brand)]/20 flex items-center justify-center
  内放 User 图标 size=16 text-[var(--brand)]
- 消息气泡（紧挨头像左侧）：
  - max-w-[260px] rounded-2xl rounded-tr-md px-3.5 py-2.5
  - 背景：`style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}`
  - 文字颜色：text-white
  - 内容结构（space-y-1.5）：
    - 第一行：flex items-center gap-1.5
      ClipboardList 图标 size=11 text-white + "赛事人员需求"（text-[11px] font-bold text-white）
    - 分隔线：h-px bg-white/20
    - 需求内容（text-[11px] text-white/90 leading-relaxed）：
      ```
      赛事：粤BA半决赛（Ⅰ级·省市级）
      时间：2026年8月20-22日
      场次：共12场 / 3天

      人员需求：
      · 裁判 6人（主裁+副裁+技术代表）
      · 技术指导 3人
      · 记录台 4人
      · 医护 2人
      · 安保运营 3人
      共计 18人
      ```
    - 底部时间戳：text-[9px] text-white/50 text-right "13:59"

##### 2b. AI消息（左对齐，紧接用户消息下方）

容器：`flex justify-start`
- 头像（左侧）：w-8 h-8 rounded-full flex items-center justify-center
  背景：`style={{ background: 'linear-gradient(135deg, var(--info), var(--purple))' }}`
  内放 Bot/Sparkles 图标 size=16 text-white
- 消息气泡（紧挨头像右侧，flex-1 max-w-[290px]）：
  - rounded-2xl rounded-tl-md px-3.5 py-3
  - 背景：bg-[var(--surface)] border border-[var(--border)]
  - 内容结构（space-y-2.5）：

  **AI文字回复**（消息开头）：
  - flex items-center gap-1.5
    CheckCircle2 图标 size=12 style={{color:'var(--ok)'}} + "已为您匹配完成！"（text-xs font-bold text-[var(--text-primary)]）
  - text-[11px] text-[var(--text-muted)] leading-relaxed：
    "基于1168人人才库，AI智能匹配率97.7%，36小时内全部到岗。以下是整场赛事人员匹配清单："
  - 底部时间戳：text-[9px] text-[var(--text-muted)] text-right "14:00"

  **AI匹配摘要条**（在文字回复下方）：
  - flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--brand)]/8
  - Sparkles size=11 style={{color:'var(--brand)'}} + "匹配率97.7%"（text-[10px] font-bold text-[var(--brand)]）
  - "· 36h到岗 · 18/18人"（text-[10px] text-[var(--text-muted)]）
  - 右侧ml-auto：Trophy size=11 style={{color:'var(--brand)'}}

  **排序切换条**：
  - flex items-center justify-between py-1
  - 左：text-[10px] text-[var(--text-muted)] "共5组 · 18人"
  - 右：两个排序标签（useState sortBy，默认 'position'）
    - "按职位"选中：bg-[var(--brand)] text-black px-2 py-0.5 rounded-full text-[9px] font-bold
    - "按匹配度"未选中：border border-[var(--border)] text-[var(--text-muted)] px-2 py-0.5 rounded-full text-[9px]

  **人员清单卡片**（嵌在AI消息气泡内）：

  【按职位模式 sortBy='position'】

  遍历5个职位组，每组渲染：

  组标题行：
  - flex items-center justify-between px-1 py-1.5
  - 左：flex items-center gap-1.5
    图标圆角方块 w-5 h-5 rounded-md flex items-center justify-center（背景色/图标色按组color映射）
    组名（text-[11px] font-bold text-[var(--text-primary)]）
  - 右：text-[9px] text-[var(--text-muted)] "{total}人"

  组内人员卡片（每人一个，紧凑版）：
  - flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-[var(--surface-muted)]/30
  - 左侧头像（w-10 h-10 rounded-full object-cover border-2 shrink-0）：
    **全部使用 `<img>` 标签**（18人全有真实照片）
    border颜色按匹配度：95+→var(--ok), 85-94→var(--brand), <85→var(--warn)
  - 中间信息（flex-1 min-w-0）：
    - 第一行 flex items-center gap-1：
      姓名（text-xs font-bold text-[var(--text-primary)]）
      如果 isRecommended：
        <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-[var(--brand)] text-black text-[8px] font-bold">
          <Star size={7} fill="currentColor" />推荐
        </span>
    - 第二行（text-[10px] text-[var(--text-muted)]）：
      "{role} · {level}"
    - 第三行 flex items-center gap-1.5 text-[9px] text-[var(--text-muted)]：
      "{years}年" · 如果matches>0："{matches}场" · Star size=7 style={{color:'var(--brand)'}} + "{rating}"
  - 右侧匹配度（shrink-0 text-center w-10）：
    - 百分比（text-sm font-black tabular-nums，颜色按匹配度）
    - "匹配"（text-[8px] text-[var(--text-muted)]）

  【按匹配度模式 sortBy='score'】
  所有人员展开按 matchScore 降序排列，不分组
  每张卡片在头像左上角加组名小标签

  职位组颜色映射：
  - 裁判组→info蓝 / 技术指导→purple紫 / 记录台→ok绿 / 医护→danger红 / 安保运营→warn琥珀

  **AI底部操作按钮**（在人员清单下方）：
  - flex items-center gap-2 pt-2 border-t border-[var(--border)]/50
  - btn-accent 小按钮 "确认名单"（Check size=11 + text-[10px]，px-3 py-1 rounded-full）
  - btn-ghost 小按钮 "查看详情"（Eye size=11 + text-[10px]）

#### 3. 底部输入栏（固定在手机内容底部）

- flex items-center gap-2 px-3 py-2.5 bg-[var(--surface)] border-t border-[var(--border)]
- 左：input placeholder="输入需求..." className="flex-1 bg-[var(--surface-muted)] border border-[var(--border)] rounded-full px-3 py-1.5 text-xs text-[var(--text-primary)]"（ readOnly，仅展示）
- 右：button 圆形 w-8 h-8 rounded-full flex items-center justify-center
  style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}
  Send 图标 size=14 text-white

---

## 五、数据结构设计（v2：18人全部有照片）

### talentMatchMock.js

```js
export const MATCH_EVENT = {
  tournament: '粤BA半决赛',
  level: 'Ⅰ级',
  date: '2026-08-20 ~ 08-22',
  totalMatches: 12,
  totalStaff: 18,
  matchRate: 97.7,
  deployHours: 36
}

// 用户输入的需求消息（对话形式）
export const USER_MESSAGE = {
  text: `赛事：粤BA半决赛（Ⅰ级·省市级）
时间：2026年8月20-22日
场次：共12场 / 3天

人员需求：
· 裁判 6人（主裁+副裁+技术代表）
· 技术指导 3人
· 记录台 4人
· 医护 2人
· 安保运营 3人
共计 18人`,
  time: '13:59'
}

// AI回复的开场文字
export const AI_REPLY_HEADER = {
  text: '基于1168人人才库，AI智能匹配率97.7%，36小时内全部到岗。以下是整场赛事人员匹配清单：',
  time: '14:00'
}

export const PERSONNEL_GROUPS = [
  {
    id: 'referee',
    name: '裁判组',
    icon: 'Whistle',
    color: 'info',
    total: 6,
    members: [
      {
        id: 'ref-1', name: '闫军',
        avatar: '/images/resources/hr/referees/ref-1.jpg',
        hasPhoto: true, role: '主裁判', level: '国际级',
        years: 22, matches: 156, rating: 4.9, matchScore: 98,
        isRecommended: true,
        recommendReason: '资质最高·粤BA执裁经验丰富',
        tags: ['CBA', '国际级', '十佳裁判']
      },
      {
        id: 'ref-2', name: '郭楠',
        avatar: '/images/resources/hr/referees/ref-2.jpg',
        hasPhoto: true, role: '第一副裁', level: '国际级',
        years: 15, matches: 98, rating: 4.6, matchScore: 95,
        isRecommended: false, tags: ['CBA', '国际级', '十佳裁判']
      },
      {
        id: 'ref-6', name: '巫志威',
        avatar: '/images/resources/hr/referees/ref-6.jpg',
        hasPhoto: true, role: '第二副裁', level: '国际级',
        years: 12, matches: 72, rating: 4.5, matchScore: 93,
        isRecommended: false, tags: ['广东篮协', '国际级', '粤BA']
      },
      {
        id: 'ref-8', name: '潘荣远',
        avatar: '/images/resources/hr/referees/ref-8.png',
        hasPhoto: true, role: '技术代表', level: '国家级',
        years: 23, matches: 200, rating: 4.8, matchScore: 91,
        isRecommended: false, tags: ['广东篮协', '国家级', '东莞']
      },
      {
        id: 'ref-10', name: '张明',
        avatar: '/images/resources/hr/referees/ref-10.png',
        hasPhoto: true, role: '裁判长', level: '国家级',
        years: 40, matches: 300, rating: 4.7, matchScore: 90,
        isRecommended: false, tags: ['广东篮协', '东莞', '裁委会主任']
      },
      {
        id: 'ref-9', name: '刘存',
        avatar: '/images/resources/hr/referees/ref-9.png',
        hasPhoto: true, role: '备用裁判', level: '国家级',
        years: 13, matches: 85, rating: 4.4, matchScore: 89,
        isRecommended: false, tags: ['广东篮协', '国家级', '东莞']
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
        id: 'coach-9', name: '丹尼',
        avatar: '/images/resources/hr/coaches/coach-9.png',
        hasPhoto: true, role: '技术指导', level: '国家二级运动员',
        years: 9, matches: 0, rating: 4.5, matchScore: 92,
        isRecommended: true,
        recommendReason: '广东本地·青训经验丰富',
        tags: ['广东', '国家二级运动员', '10年经验']
      },
      {
        id: 'coach-17', name: '曲绍斌',
        avatar: '/images/resources/hr/coaches/coach-17.png',
        hasPhoto: true, role: '战术指导', level: 'CBA总冠军教练',
        years: 10, matches: 0, rating: 4.7, matchScore: 90,
        isRecommended: false, tags: ['后卫', 'CBA联赛总冠军', '广东宏远']
      },
      {
        id: 'coach-16', name: '王怀玉',
        avatar: '/images/resources/hr/coaches/coach-16.png',
        hasPhoto: true, role: '青训顾问', level: '高级教练',
        years: 27, matches: 0, rating: 4.6, matchScore: 87,
        isRecommended: false, tags: ['广东宏远', '青训教父']
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
        id: 'sc-1', name: '张秀芳',
        avatar: '/images/resources/hr/scorer/scorer-1.jpg',
        hasPhoto: true, role: '记录台长', level: '一级',
        years: 15, matches: 120, rating: 4.7, matchScore: 94,
        isRecommended: true,
        recommendReason: '经验丰富·记录台管理能力强',
        tags: ['一级', '120场经验']
      },
      {
        id: 'sc-2', name: '李伟明',
        avatar: '/images/resources/hr/scorer/scorer-2.jpg',
        hasPhoto: true, role: '记录员', level: '二级',
        years: 8, matches: 60, rating: 4.3, matchScore: 88,
        isRecommended: false, tags: ['二级', '东莞']
      },
      {
        id: 'sc-3', name: '陈小红',
        avatar: '/images/resources/hr/scorer/scorer-3.jpg',
        hasPhoto: true, role: '计时员', level: '二级',
        years: 6, matches: 45, rating: 4.2, matchScore: 85,
        isRecommended: false, tags: ['二级', '粤BA']
      },
      {
        id: 'sc-4', name: '黄志强',
        avatar: '/images/resources/hr/scorer/scorer-4.jpg',
        hasPhoto: true, role: '24秒计时员', level: '三级',
        years: 4, matches: 30, rating: 4.0, matchScore: 82,
        isRecommended: false, tags: ['三级', '东莞']
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
        id: 'med-1', name: '陈志远',
        avatar: '/images/resources/hr/medical/medical-1.jpg',
        hasPhoto: true, role: '医护负责人', level: '执业医师',
        years: 12, matches: 80, rating: 4.8, matchScore: 95,
        isRecommended: true,
        recommendReason: '执业资质·赛事医疗保障经验丰富',
        tags: ['执业医师', '急救认证', '80场']
      },
      {
        id: 'med-2', name: '林晓雯',
        avatar: '/images/resources/hr/medical/medical-2.jpg',
        hasPhoto: true, role: '急救员', level: '急救员证书',
        years: 5, matches: 35, rating: 4.4, matchScore: 86,
        isRecommended: false, tags: ['急救员', 'AED认证']
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
        id: 'sec-1', name: '刘铁柱',
        avatar: '/images/resources/hr/security/security-1.jpg',
        hasPhoto: true, role: '安保队长', level: '高级安保',
        years: 10, matches: 200, rating: 4.5, matchScore: 90,
        isRecommended: true,
        recommendReason: '安保经验丰富·大型赛事200+场',
        tags: ['高级安保', '200场']
      },
      {
        id: 'sec-2', name: '赵勇',
        avatar: '/images/resources/hr/security/security-2.jpg',
        hasPhoto: true, role: '安保员', level: '中级安保',
        years: 5, matches: 80, rating: 4.2, matchScore: 84,
        isRecommended: false, tags: ['中级安保', '东莞']
      },
      {
        id: 'sec-3', name: '孙丽',
        avatar: '/images/resources/hr/security/security-3.jpg',
        hasPhoto: true, role: '运营协调', level: '运营专员',
        years: 6, matches: 50, rating: 4.3, matchScore: 83,
        isRecommended: false, tags: ['运营', '粤BA']
      }
    ]
  }
]
```

> **v2数据要点**：
> - 18人**全部有真实照片**（hasPhoto: true），全部用 `<img>` 标签
> - 裁判6人复用项目已有照片（referees目录）
> - 教练3人复用项目已有照片（coaches目录）
> - 记录台4人用新增照片（scorer目录 scorer-1~4.jpg）
> - 医护2人用新增照片（medical目录 medical-1~2.jpg）
> - 安保3人用新增照片（security目录 security-1~3.jpg）
> - 新增照片已打包在zip中，放入 `public/images/resources/hr/` 对应子目录

---

## 六、opencode 提示词

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
5. 图标：从 lucide-react 导入，如 import { ChevronLeft, MoreHorizontal, Star, CheckCircle2, Send, Bot, User } from 'lucide-react'
6. 状态胶囊组件 StatusPill：<StatusPill variant="ok">已匹配</StatusPill>
7. 颜色在 Tailwind 中写法：text-[var(--brand)]、bg-[var(--surface-muted)]、border-[var(--border)]
8. 已有图片资源路径（18人全部有真实照片）：
   - 裁判：/images/resources/hr/referees/ref-{id}.jpg 或 .png
   - 教练：/images/resources/hr/coaches/coach-{id}.jpg 或 .png
   - 记录台：/images/resources/hr/scorer/scorer-{id}.jpg
   - 医护：/images/resources/hr/medical/medical-{id}.jpg
   - 安保：/images/resources/hr/security/security-{id}.jpg
9. 禁止用 emoji，所有图标从 lucide-react 导入

请基于以上规范生成代码。每个组件用 export default 导出。
```

---

### 提示词 1：PhoneFrame.jsx（手机框组件）

```
基于项目设计系统，创建组件 PhoneFrame.jsx（通用手机外框组件）。

可复用的手机外框组件，用于在网页中展示移动端UI，截图后可直接用于PPT。

【视觉规格】
- 外框宽度：375px，高度：760px
- 外框圆角：rounded-[2.5rem]
- 外框边框：6px solid #1a1a1a
- 外框阴影：shadow-2xl
- 外框背景色：var(--bg-primary)

【结构】
1. 状态栏（absolute top-0 z-20，高32px）：
   - 左侧：时间"9:41"（text-[11px] font-semibold text-white）
   - 中间：灵动岛——w-24 h-6 rounded-full bg-black，absolute居中 top-2
   - 右侧：3个 lucide 图标（Signal size=11 / Wifi size=11 / BatteryFull size=13），text-white
   - 整行 padding: px-6 pt-2

2. 内容区（overflow-y-auto，padding-top: 32px，padding-bottom: 24px）：
   - 直接渲染 props.children
   - 隐藏滚动条：style={{ scrollbarWidth: 'none' }} + <style>{`::-webkit-scrollbar{display:none;}`}</style>

3. Home指示条（absolute bottom-1.5 z-20）：
   - w-28 h-1 rounded-full bg-[var(--text-muted)] opacity-40，居中

【Props】
- children: React.ReactNode
- statusBarColor: 'light' | 'dark'（默认 'light'）

组件用 export default 导出。
```

---

### 提示词 2：PersonnelRoster.jsx（对话形式人员清单）★v2核心

```
基于项目设计系统，创建组件 PersonnelRoster.jsx（赛事人员匹配——AI对话界面）。

这是技术优势一"智能人才匹配"的手机端展示页面，以AI对话形式展示：用户发送赛事人员需求 → AI回复包含整场赛事匹配的人员清单（含照片、信息、匹配度、推荐排序）。

【数据来源】
从 props 接收 data 对象，包含：
- event: { tournament, level, date, totalStaff, matchRate, deployHours }
- userMessage: { text: '多行需求文字', time: '13:59' }
- aiHeader: { text: 'AI回复开场文字', time: '14:00' }
- groups: 5个职位组数组，每组 { id, name, icon, color, total, members: [...] }
  每个 member: { id, name, avatar(图片路径), hasPhoto(true), role, level, years, matches, rating, matchScore, isRecommended, recommendReason, tags }

18人全部有真实照片：
1. 裁判组(info,6人)：闫军(ref-1.jpg,主裁判,国际级,22年,156场,4.9,98%,推荐) / 郭楠(ref-2.jpg,第一副裁,国际级,15年,98场,4.6,95%) / 巫志威(ref-6.jpg,第二副裁,国际级,12年,72场,4.5,93%) / 潘荣远(ref-8.png,技术代表,国家级,23年,200场,4.8,91%) / 张明(ref-10.png,裁判长,国家级,40年,300场,4.7,90%) / 刘存(ref-9.png,备用裁判,国家级,13年,85场,4.4,89%)
2. 技术指导组(purple,3人)：丹尼(coach-9.png,技术指导,国家二级运动员,9年,4.5,92%,推荐) / 曲绍斌(coach-17.png,战术指导,CBA总冠军教练,10年,4.7,90%) / 王怀玉(coach-16.png,青训顾问,高级教练,27年,4.6,87%)
3. 记录台组(ok,4人)：张秀芳(scorer-1.jpg,记录台长,一级,15年,120场,4.7,94%,推荐) / 李伟明(scorer-2.jpg,记录员,二级,8年,60场,4.3,88%) / 陈小红(scorer-3.jpg,计时员,二级,6年,45场,4.2,85%) / 黄志强(scorer-4.jpg,24秒计时员,三级,4年,30场,4.0,82%)
4. 医护组(danger,2人)：陈志远(medical-1.jpg,医护负责人,执业医师,12年,80场,4.8,95%,推荐) / 林晓雯(medical-2.jpg,急救员,急救员证书,5年,35场,4.4,86%)
5. 安保运营组(warn,3人)：刘铁柱(security-1.jpg,安保队长,高级安保,10年,200场,4.5,90%,推荐) / 赵勇(security-2.jpg,安保员,中级安保,5年,80场,4.2,84%) / 孙丽(security-3.jpg,运营协调,运营专员,6年,50场,4.3,83%)

【布局结构（从上到下）】

1. App头部（高52px，金色渐变背景）：
   style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}
   flex items-center justify-between px-4 h-[52px] shrink-0
   - 左：ChevronLeft text-white size=20
   - 中：text-center → "昇梦AI"（text-sm font-bold text-white）+ "赛事人员匹配助手"（text-[10px] text-white/80）
   - 右：MoreHorizontal text-white size=18

2. 对话区域（flex-1 overflow-y-auto，bg-[var(--bg-primary)]，px-3 py-3 space-y-4）：

   【用户消息——右对齐】
   容器：flex justify-end
   - 右侧头像：w-8 h-8 rounded-full bg-[var(--brand)]/20 flex items-center justify-center，内放 User size=16 text-[var(--brand)]
   - 消息气泡（max-w-[260px] rounded-2xl rounded-tr-md px-3.5 py-2.5 ml-2）：
     style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}
     内容（text-white，space-y-1.5）：
     - 第一行：flex items-center gap-1.5 → ClipboardList size=11 + "赛事人员需求"（text-[11px] font-bold）
     - h-px bg-white/20 分隔线
     - 需求正文（text-[11px] text-white/90 leading-relaxed，whitespace-pre-line）：
       显示 userMessage.text 的多行内容
     - 时间戳（text-[9px] text-white/50 text-right）：userMessage.time

   【AI消息——左对齐】
   容器：flex justify-start
   - 左侧头像：w-8 h-8 rounded-full flex items-center justify-center shrink-0
     style={{ background: 'linear-gradient(135deg, var(--info), var(--purple))' }}
     内放 Bot size=16 text-white
   - 消息气泡（flex-1 max-w-[290px] rounded-2xl rounded-tl-md px-3.5 py-3 ml-2）：
     bg-[var(--surface)] border border-[var(--border)]
     内容（space-y-2.5）：

     a) AI文字回复：
     - flex items-center gap-1.5 → CheckCircle2 size=12 style={{color:'var(--ok)'}} + "已为您匹配完成！"（text-xs font-bold）
     - text-[11px] text-[var(--text-muted)] leading-relaxed：aiHeader.text
     - 时间戳 text-[9px] text-[var(--text-muted)] text-right：aiHeader.time

     b) 匹配摘要条：
     flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--brand)]/8
     Sparkles size=11 style={{color:'var(--brand)'}} + "匹配率97.7%"（text-[10px] font-bold text-[var(--brand)]）
     + "· 36h到岗 · 18/18人"（text-[10px] text-muted）
     右侧ml-auto：Trophy size=11 style={{color:'var(--brand)'}}

     c) 排序切换条：
     flex items-center justify-between py-0.5
     左：text-[10px] text-muted "共5组 · 18人"
     右：两个排序标签（useState sortBy，默认 'position'）
     选中：bg-[var(--brand)] text-black px-2 py-0.5 rounded-full text-[9px] font-bold
     未选中：border border-[var(--border)] text-muted px-2 py-0.5 rounded-full text-[9px]

     d) 人员清单（嵌在AI气泡内）：

     【按职位模式 sortBy='position'】
     遍历 groups，每组：
     - 组标题行：flex items-center justify-between px-1 py-1
       左：图标方块(w-5 h-5 rounded-md 按组色/15) + 组名(text-[11px] font-bold)
       右：text-[9px] text-muted "{total}人"
     - 组内人员卡片（每人）：
       flex items-center gap-2 px-1 py-1.5
       左：img w-10 h-10 rounded-full object-cover border-2（border色按匹配度：95+→ok, 85-94→brand, <85→warn）
       中（flex-1 min-w-0）：
         行1：姓名(text-xs font-bold) + 推荐徽章(if isRecommended: bg-brand text-black text-[8px] + Star size=7)
         行2：text-[10px] text-muted "{role} · {level}"
         行3：text-[9px] text-muted "{years}年" · "{matches}场"(if>0) · Star size=7 brand + "{rating}"
       右(w-10 text-center)：
         matchScore%（text-sm font-black tabular-nums，颜色按匹配度）
         "匹配"(text-[8px] text-muted)

     【按匹配度模式 sortBy='score'】
     所有members展开按matchScore降序
     每张卡片头像左上角加组名小标签：absolute -top-1 -left-1 px-1 py-0.5 rounded text-[7px] font-bold（组色背景/文字）

     e) AI底部操作按钮：
     flex items-center gap-2 pt-2 border-t border-[var(--border)]/50
     btn-accent "确认名单"（Check size=11 + text-[10px] px-3 py-1 rounded-full）
     btn-ghost "查看详情"（Eye size=11 + text-[10px]）

3. 底部输入栏（shrink-0，bg-[var(--surface)] border-t border-[var(--border)]）：
   flex items-center gap-2 px-3 py-2.5
   - input readOnly placeholder="输入需求..." className="flex-1 bg-[var(--surface-muted)] border border-[var(--border)] rounded-full px-3 py-1.5 text-xs"
   - 发送按钮：w-8 h-8 rounded-full flex items-center justify-center
     style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}
     Send size=14 text-white

【交互】
- useState 管理 sortBy（'position' | 'score'），点击切换
- 18人全部用 <img> 标签显示真实照片，不用首字头像

所有文字用中文。组件用 export default 导出。
```

---

### 提示词 3：TalentMatchRoster.jsx + Mock数据 + 项目接入

```
基于项目设计系统，创建以下文件并修改现有文件：

## 文件1：src/pages/WebApp/data/talentMatchMock.js

导出人员匹配所需 mock 数据（18人全部有真实照片路径）：

export const MATCH_EVENT = {
  tournament: '粤BA半决赛', level: 'Ⅰ级', date: '2026-08-20 ~ 08-22',
  totalMatches: 12, totalStaff: 18, matchRate: 97.7, deployHours: 36
}

export const USER_MESSAGE = {
  text: `赛事：粤BA半决赛（Ⅰ级·省市级）
时间：2026年8月20-22日
场次：共12场 / 3天

人员需求：
· 裁判 6人（主裁+副裁+技术代表）
· 技术指导 3人
· 记录台 4人
· 医护 2人
· 安保运营 3人
共计 18人`,
  time: '13:59'
}

export const AI_REPLY_HEADER = {
  text: '基于1168人人才库，AI智能匹配率97.7%，36小时内全部到岗。以下是整场赛事人员匹配清单：',
  time: '14:00'
}

export const PERSONNEL_GROUPS = [5组18人，全部hasPhoto:true]
裁判组(info,6人)：闫军(ref-1.jpg,98%,推荐) / 郭楠(ref-2.jpg,95%) / 巫志威(ref-6.jpg,93%) / 潘荣远(ref-8.png,91%) / 张明(ref-10.png,90%) / 刘存(ref-9.png,89%)
技术指导组(purple,3人)：丹尼(coach-9.png,92%,推荐) / 曲绍斌(coach-17.png,90%) / 王怀玉(coach-16.png,87%)
记录台组(ok,4人)：张秀芳(scorer-1.jpg,94%,推荐) / 李伟明(scorer-2.jpg,88%) / 陈小红(scorer-3.jpg,85%) / 黄志强(scorer-4.jpg,82%)
医护组(danger,2人)：陈志远(medical-1.jpg,95%,推荐) / 林晓雯(medical-2.jpg,86%)
安保运营组(warn,3人)：刘铁柱(security-1.jpg,90%,推荐) / 赵勇(security-2.jpg,84%) / 孙丽(security-3.jpg,83%)

图片路径规则：
- 裁判：/images/resources/hr/referees/ref-{id}.jpg（ref-1~6）或 .png（ref-7~17）
- 教练：/images/resources/hr/coaches/coach-{id}.jpg（coach-1~6）或 .png（coach-7~19）
- 记录台：/images/resources/hr/scorer/scorer-{id}.jpg（scorer-1~4）
- 医护：/images/resources/hr/medical/medical-{id}.jpg（medical-1~2）
- 安保：/images/resources/hr/security/security-{id}.jpg（security-1~3）

每个人员字段：{ id, name, avatar, hasPhoto:true, role, level, years, matches, rating, matchScore, isRecommended, recommendReason(仅推荐), tags:[] }

## 文件2：src/pages/WebApp/modules/TalentMatchRoster.jsx

主页面，包含：

1. 页面标题区（flex items-center justify-between mb-6）：
   左：Smartphone 图标 + "人才匹配清单"（text-xl font-bold）+ 副标题"AI对话式人员匹配 · 输入需求→输出清单"（text-sm text-muted）
   右：btn-ghost "导出名单"（Download）+ btn-ghost "打印"（Printer）

2. 说明条（card-solid p-3 mb-6）：
   flex items-center gap-3
   Sparkles var(--brand) + "技术优势一 · 智能人才匹配"（text-sm font-bold）+ "对话形式展示 · 18人全部有照片档案"（text-xs text-muted）
   右：StatusPill variant="brand" "PPT展示页"

3. 主体（flex justify-center）：
   <PhoneFrame>
     <PersonnelRoster data={{ event: MATCH_EVENT, userMessage: USER_MESSAGE, aiHeader: AI_REPLY_HEADER, groups: PERSONNEL_GROUPS }} />
   </PhoneFrame>

4. 右侧说明面板（lg:grid-cols-2 gap-8，仅lg以上显示）：
   4个说明卡 space-y-3：
   a) "对话交互"：用户输入赛事需求→AI智能匹配→输出人员清单，体现信息输入输出全流程
   b) "全岗位覆盖"：裁判6+技术指导3+记录台4+医护2+安保3=18人，覆盖整场赛事全部岗位
   c) "真实照片档案"：18人全部有真实照片，裁判/教练来自项目数据库，记录台/医护/安保为新增档案
   d) "推荐排序"：每组第一推荐人加金色推荐徽章+推荐理由，支持按职位/按匹配度切换

import PhoneFrame, PersonnelRoster, mock数据, lucide图标, StatusPill
组件用 export default 导出。

## 修改 index.jsx / Dashboard.jsx / FeatureCard.jsx
同v1方案。
```

---

## 七、使用说明

### 照片部署

1. 解压 `人员照片_记录台_医护_安保.zip`
2. 将 `hr/scorer/`、`hr/medical/`、`hr/security/` 三个文件夹放入项目 `public/images/resources/hr/` 目录
3. 最终目录结构：
   ```
   public/images/resources/hr/
   ├── referees/     ← 已有（裁判照片）
   ├── coaches/      ← 已有（教练照片）
   ├── scorer/       ← 新增（记录台4张）
   ├── medical/      ← 新增（医护2张）
   └── security/     ← 新增（安保3张）
   ```

### opencode 使用

1. 先发"通用前置提示词"
2. 依次发提示词1（PhoneFrame）→ 提示词2（PersonnelRoster对话版）→ 提示词3（主模块+mock+接入）
3. 生成后在Dashboard可看到「人才匹配清单」入口

### PPT截图

进入页面 → 切换深色模式 → 对手机框区域截图 → 贴入PPT技术优势一右侧手机区域

### v1→v2 变更总结

| 维度 | v1 | v2 |
|:---|:---|:---|
| 展示形式 | 静态人员列表 | **AI对话形式**（用户消息→AI回复含人员清单） |
| 交互流程 | 直接看列表 | **用户输入需求→AI输出清单**（体现信息输入输出） |
| 照片覆盖 | 9人有照片+9人首字头像 | **18人全部有真实照片** |
| 新增照片 | 无 | 记录台4张+医护2张+安保3张（zip包） |
| 底部栏 | 操作栏（确认名单） | **聊天输入栏**（输入框+发送按钮） |
| 视觉风格 | 管理后台列表 | **聊天App界面**（气泡+头像+时间戳） |
