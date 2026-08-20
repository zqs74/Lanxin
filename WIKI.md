# 一句话办赛（LanXinBanSai）项目 Wiki

> 本文档是对「东莞篮球一句话约战」微信小程序演示版（V1）的完整项目说明。
> 相比同目录的 `README.md`，本 Wiki 侧重**技术实现细节、数据模型、模块职责与交互流程**，作为开发者/协作者的长期参考。
> 文档基于代码实际实现梳理，最后更新于 2026-08。

---

## 1. 项目概览

| 项 | 说明 |
| --- | --- |
| 项目名 | LanXinBanSai（篮芯办赛） |
| 形态 | 原生微信小程序（演示版） |
| 核心 Slogan | 一句话匹配整套方案 |
| 服务城市 | 东莞（固定，不可切换） |
| AppID | `wx913f36c951ffc973` |
| 基础库 | `trial`（见 `project.config.json`） |
| 组件框架 | `glass-easel`（见 `app.json`） |
| 当前版本 | V1 |

**定位**：一个围绕「用户一句话描述需求 → 小程序自动匹配整套办赛方案」的前台演示项目。当前版本聚焦**产品体验展示、资源编排演示、线索收集**三类目标，不接真实后端、不接支付、不做真实锁单，也不调用真实大模型（用本地规则引擎替代）。

**两条输出闭环**：
1. 生成分享海报（`pages/poster`，Canvas 导出图片）；
2. 填写预约信息（`pages/result` 的预约弹层，仅本地留存意向线索）。

---

## 2. 产品设计

### 2.1 用户场景（两种模式）

首页固定两种模式，决定后续推荐内容的「丰满度」：

| 模式 | 枚举值 | 典型场景 | 输出范围 |
| --- | --- | --- | --- |
| 半专业赛事 | `pro_event` | 企业赛、园区赛、社区联赛 | 场馆 + 裁判 + 物料 + 租赁 + 供应商 + 媒体（最完整） |
| 野球约球 | `casual_game` | 朋友组局、半场对抗、轻量约战 | 场馆 + 裁判 + 基础物料/租赁（轻量） |

> 供应商与媒体两类资源**只在「半专业赛事」模式下参与推荐**（见 `recommender.js` 的 `pickSuppliers` / `pickMedia`）。

### 2.2 核心用户旅程

```
[选模式] → [输入一句话需求] → [本地解析] → [缺项? 弹层补齐] → [生成推荐方案]
                                                                        ├→ 重新匹配需求
                                                                        ├→ 填写预约信息（留资）
                                                                        └→ 进入海报页（转发/保存）
```

- **首页**：先选模式，选中后中部上移并展开「一句话需求输入」；支持点击示例直接填充。
- **解析**：本地规则解析出镇区、日期、预算、人数/队伍、裁判/物料/媒体/执行需求、室内外偏好。
- **补齐**：若关键字段缺失，底部弹层（`van-popup`）继续追问，补齐后才进入结果页。
- **结果页**：主方案 + 重点项 + 分模块资源卡片 + 备选方向；可重新匹配、预约、进海报。

### 2.3 功能清单

| 功能 | 页面 | 说明 |
| --- | --- | --- |
| 一句话匹配方案 | `index` / `result` | 本地规则解析 + 规则打分推荐 |
| 缺失信息补齐 | `index` | 弹层追问镇区/日期/预算/人数/队伍 |
| 重新匹配需求 | `result` | 调整参数后即时重算方案 |
| 预约留资 | `result` | 联系人/手机号/微信/日期/备注，本地保存 |
| 生成分享海报 | `poster` | Canvas 绘制、保存相册、转发 |
| 历史方案预览 | `history` | 推荐/预约各显示前 4 条 |
| 更多记录 + 筛选 | `records` | 完整记录，按镇区/日期筛选 |
| 资源库浏览 | `library` | 六类资源分类浏览 + 镇区筛选 |

---

## 3. 技术架构

### 3.1 技术栈

- **原生微信小程序**（无框架，无 TypeScript）
- **Vant Weapp** `^1.11.7`（唯一 npm 依赖，用于搜索框、弹层、日历等 UI 组件）
- **本地规则引擎**（`parser.js` + `recommender.js`）
- **本地静态资源数据**（`utils/data/resources.js`）
- **本地 Storage**（历史记录/最近需求/分享载荷，不接云端）

### 3.2 目录结构

```text
LanXinBanSai
├─ app.js / app.json / app.wxss        小程序入口与全局配置
├─ sitemap.json                        索引配置
├─ project.config.json                 开发者工具项目配置
├─ WIKI.md                             本 Wiki
├─ README.md                           轻量说明文档
├─ assets/                             静态图片资源（本地兜底图）
├─ 四库/                               旧「四库」原始代码与素材（已忽略打包，仅作参考）
├─ components/
│  └─ glass-tabbar/                    玻璃拟态标签栏（业务组件版）
├─ custom-tab-bar/
│  └─ index.*                          自定义底部标签栏（app.json 的 tabBar 入口）
├─ pages/
│  ├─ index/                           首页（模式选择 + 一句话输入 + 补齐弹层）
│  ├─ result/                          推荐结果页（方案 + 重新匹配 + 预约 + 海报入口）
│  ├─ history/                         历史预览页
│  ├─ records/                         更多记录页（筛选）
│  ├─ library/                         资源库页
│  ├─ poster/                          海报页（Canvas 导出）
│  └─ logs/                            小程序模板生成的日志页（未在 app.json 注册）
├─ utils/
│  ├─ constants.js                     常量配置
│  ├─ parser.js                        一句话需求解析（规则匹配）
│  ├─ recommender.js                   推荐引擎（打分制）
│  ├─ storage.js                       本地存储封装
│  ├─ share.js                         分享载荷编解码
│  ├─ util.js                          通用工具（时间格式化）
│  └─ data/resources.js                资源数据（六类）
├─ miniprogram_npm/                    npm 构建产物（构建 npm 后生成）
├─ minitest/                           小程序测试配置（空）
└─ node_modules/                       npm 依赖（已忽略打包）
```

### 3.3 数据流

```
用户输入 sentence + mode
        │
        ▼
parser.parseDemand(mode, sentence)          —— 提取字段，生成 demand 对象
        │
        ▼
parser.getMissingFields(demand)             —— 判断缺哪些关键字段
        │ 缺项 → 首页弹层补齐，回填 demand
        ▼
recommender.createRecommendation(demand)    —— 打分推荐，生成 result 对象
        │
        ├─ storage.saveRecommendation(record)     —— 存历史 + 最近结果
        ├─ app.setLatestSharePayload(sharePayload)—— 存分享载荷
        │
        ▼
wx.navigateTo(/pages/result?payload=encoded)—— 经 share.encodePayload 编码传递
        │
        ├─ 重新匹配 → 再次 createRecommendation
        ├─ 预约    → storage.saveBooking
        └─ 海报    → navigateTo(/pages/poster?payload=encoded) → Canvas 绘制导出
```

**关键约定**：页面间通过 URL 的 `payload` 查询参数传递需求/方案，使用 `share.js` 的 `encodePayload`（`encodeURIComponent(JSON.stringify(...))`）编码、`decodePayload` 解码，避免直接把大对象塞进路由。

---

## 4. 核心模块详解

### 4.1 `utils/constants.js` —— 常量与选项

| 常量 | 值 | 用途 |
| --- | --- | --- |
| `APP_MODE` | `pro_event` / `casual_game` | 两种模式枚举 |
| `STORAGE_KEYS` | `lx_recommendations`、`lx_bookings`、`lx_latest_demand`、`lx_latest_result` | 本地存储键 |
| `MODE_OPTIONS` | 两种模式的展示文案 | 首页模式卡片 |
| `MODE_EXAMPLES` | 每模式 3 条示例句子 | 首页示例填充 |
| `TOWN_OPTIONS` | 10 个镇区 | 镇区解析 + 补齐选项 |
| `BUDGET_OPTIONS` | low / mid / high 三档 | 预算档位 |
| `VENUE_OPTIONS` | indoor / outdoor / flexible | 场地偏好 |
| `DATE_OPTIONS` | 5 个固定日期（2026-07-30 ~ 08-08） | 日期补齐选项 |

- 镇区列表：`南城、东城、莞城、松山湖、厚街、虎门、大朗、黄江、常平、寮步`。
- 预算档：`low`（约 500–3000）、`mid`（约 3000–12000）、`high`（约 12000+）。
- **注意**：`DATE_OPTIONS` 是**硬编码的演示期日期**，与 `parser.js` 里 `detectDate` 的固定映射一致，均假设「今天 = 2026-07-29」；真实上线需替换为动态日期计算。

### 4.2 `utils/parser.js` —— 一句话需求解析

**职责**：把自然语言句子解析为结构化 `demand` 对象。纯本地规则，不依赖大模型。

字段解析规则：

| 字段 | 函数 | 规则要点 |
| --- | --- | --- |
| `town` | `detectTown` | 句子是否包含镇区名（包含匹配） |
| `budgetLevel` | `detectBudget` | 关键词匹配：`1万/10000/高配/品牌`→high；`预算/企业赛/联赛/标准`→mid；`别太高/便宜/低预算/轻量`→low |
| `peopleCount` / `teamCount` | `detectPeopleCount` | 优先级：`(\d+)支`→teamCount=X、peopleCount=X×10；`XvY`→teamCount=2、peopleCount=X+Y；`(\d+)人`→peopleCount |
| `venuePreference` | `detectVenuePreference` | 含「室内」→indoor，含「室外」→outdoor，否则空 |
| `playDate` | `detectDate` | 关键词映射到固定日期：今天/明天/明晚/周五/本周六/周六/周日/下周六/月底 |
| `needReferee` | （内联） | 默认 true，含「不用裁判」则 false |
| `needMaterials` | （内联） | 含「物料/奖牌/球衣/计分」任一 |
| `needMedia` | （内联） | 仅 `pro_event` 且含「摄影/直播/媒体/曝光」 |
| `needSupplier` | （内联） | 仅 `pro_event` 且含「执行/主持/赛事」 |

`parseDemand(mode, sentence)` 返回的 `demand` 结构：

```js
{
  mode, sentence, city: "东莞",
  town, peopleCount, teamCount,
  budgetLevel, playDate, venuePreference,
  needReferee, needMaterials, needMedia, needSupplier
}
```

`getMissingFields(demand)` 返回缺失字段数组，判定规则：

- 必补字段：`town`、`playDate`、`budgetLevel`、`peopleCount`；
- **仅 `pro_event` 模式**额外要求 `teamCount`。

> 设计取舍：首轮补齐**不再强制追问「室内/室外」**（`venuePreference` 不在缺项判定里），因为当前资源多为室内馆，优先降低输入门槛；用户仍可在结果页「重新匹配」时调整场地偏好。

### 4.3 `utils/recommender.js` —— 推荐引擎

**职责**：根据 `demand` 生成完整的推荐 `result`。核心是**打分排序 + 按模式裁剪**。

#### 打分规则

- `scoreBudget(resourceBudget, demandBudget)`：
  - 需求预算为空或与资源同档 → **20**；
  - 否则按档位距离递减：`18 − 距离×6`，最低 **6**。
- `scoreTown(resourceTown, demandTown)`：需求镇区为空 → **10**；匹配 → **22**；不匹配 → **8**。
- `scoreVenue(venue, demand)` = 基础分 `venue.priority` + 预算分 + 镇区分，再叠加：
  - 室内/室外偏好匹配 → **+18**；
  - 人数落在 `venue.peopleRange` 内 → **+16**；
  - `venue.scene` 包含当前模式 → **+16**。
- `scoreReferee(referee, demand, targetTown)` = `priority` + 预算分 + 镇区分（以「主场馆镇区」优先）+ 场景匹配 **+18**；额外：`pro_event` 且国家级 **+14**，`casual_game` 且二级 **+8**。

#### 各资源挑选数量

| 资源 | 半专业赛事 | 野球约球 | 说明 |
| --- | --- | --- | --- |
| 场馆 | 1（最高分） | 1（最高分） | `getVenueCandidates` 取第 1 名 |
| 裁判 | 前 3 名 | 前 1 名 | `needReferee=false` 时返回空 |
| 物料 | 前 4 个 | 前 2 个 | 野球且无物料需求时兜底返回「定制球衣」 |
| 租赁 | 前 4 个 | 前 3 个 | 按 scene 过滤后切片 |
| 供应商 | 1–2 个 | 0 | 仅 pro；`needSupplier` 决定 2 或 1 |
| 媒体 | 1–2 个 | 0 | 仅 pro；`needMedia` 决定 2 或 1 |

#### 结果对象结构

`createRecommendation(demand)` 返回的 `result` 关键字段：

| 字段 | 含义 |
| --- | --- |
| `summary` | 摘要行，格式 `模式 · 镇区 · 日期` |
| `matchScore` | 匹配分，`min(98, round(venue.score / 2))` |
| `summaryLead` / `summaryTail` / `summaryNote` | 结果页主标题 / 副标题 / 说明 |
| `reasonLines` / `strategyLine` | 推荐理由三行 / 策略行 |
| `highlightPoints` | 重点项数组（主场馆、预算落点、裁判配置、配套重点，最多 4 项） |
| `sections` | 分模块资源卡片：`venue` / `referees` / `materials` / `rentals`（pro 追加 `suppliers` / `media`） |
| `alternatives` | 备选方向（候选场馆的第 2、3 名） |
| `budgetHint` / `budgetFocus` | 预算参考文案 / 预算落点标签 |
| `planTone` | 方案调性（如「室内馆 + 正式赛事链路」） |
| `posterPayload` | 海报页渲染所需数据 |
| `sharePayload` | 分享/还原所需数据（demand 精简版） |
| `demandMeta` | 预算标签、场地标签等展示辅助 |

#### 预算估算（`buildBudgetHint`）

以主场馆 `priceLevel` 为基数，按模式 + 预算档给出**预估区间文案**（演示用，非真实报价）：

- pro + high：`base + 9000`；pro + mid：`base + 4200`；pro + low：`base + 2500`；
- casual + high：`base + 1800`；casual + mid：`base + 800`；casual + low：`base` 起。

#### 空结果兜底

当没有任何场馆匹配（`venueCandidates` 为空）时，返回 `buildEmptyResult`，`sections` 为空、`matchScore=0`，并在结果页提示放宽条件。

### 4.4 `utils/data/resources.js` —— 资源数据

**职责**：六类资源的静态数据源，是推荐与资源库的单一数据来源。顶部集中维护远程图片地址常量。

#### 数据规模

| 集合 | 导出名 | 数量 |
| --- | --- | --- |
| 场馆 | `venues` | 6 |
| 裁判 | `referees` | 7 |
| 物料 | `materials` | 5 |
| 租赁 | `rentalItems` | 5 |
| 供应商 | `suppliers` | 3 |
| 媒体 | `mediaResources` | 5 |
| 资源库分类 | `libraryCategories` | 6（场馆/裁判/物料/租赁/供应商/媒体） |

#### 通用字段约定

不同集合字段略有差异，但**所有集合都具备**：`id`、`name`、`scene`（参与的 `mode` 数组）、`budgetLevel`、`priority`（基础优先级分）、`description`、`tags`（数组）。场馆/裁判另有 `town` 用于镇区匹配；场馆有 `priceLevel`（价格基数）、`capacity`、`peopleRange`（人数区间）、`indoor`（布尔）、`cover`、`fallbackHint`（备选提示语）；裁判有 `level`、`avatar`；物料/租赁/供应商/媒体有 `image`。

#### 图片地址策略

- 本地图：`assets/resources/...` 及 `四库/resources/...`（部分仍作兜底）；
- 远程图：域名 `bee-reg-ab.imagency.cn`，场馆 `cover` 与裁判 `avatar` 已切换为远程 `https` 地址（`remoteVenue` / `remoteReferee` 常量）。

> 场馆列表：南城·东莞篮球中心、松山湖·东莞理工学院体育馆、大朗体育馆、东城·东莞市体育中心、黄江体育馆、虎门·建博体育馆（唯一 `indoor: false`，且 `scene` 仅 `casual_game`）。

### 4.5 `utils/storage.js` —— 本地存储

**职责**：`wx.getStorageSync` / `wx.setStorageSync` 的安全封装，所有读写带 try-catch 兜底，失败仅 warn 不抛异常。

| 函数 | 说明 |
| --- | --- |
| `safeRead` / `safeWrite` | 底层安全读写 |
| `appendRecord(key, item, limit=20)` | 头插并截断到 20 条（新记录在前） |
| `saveRecommendation(record)` | 追加推荐记录 + 更新 `lx_latest_result` |
| `saveLatestDemand(demand)` | 保存最近一次需求 |
| `saveBooking(record)` | 追加预约记录 |
| `getRecommendations` / `getBookings` / `getLatestDemand` / `getLatestResult` | 对应读取 |

**记录结构**（推荐/预约统一）：`{ id, type, mode, createdAt, summary, payload }`，其中 `payload` 内含 `demand`、`result`（预约还含 `bookingForm`）。

### 4.6 `utils/share.js` —— 分享载荷编解码

- `encodePayload(payload)` → `encodeURIComponent(JSON.stringify(payload))`；
- `decodePayload(scene)` → 解码 + `JSON.parse`，异常返回 `null`。

用于路由传参与分享路径还原，是「方案可在不同设备/入口还原」的基础。

### 4.7 `app.js` —— 全局态

- `globalData`: `{ city: "东莞", latestSharePayload: null }`；
- `onLaunch` 时 `hydrateSharePayload()` 从 Storage 恢复最近分享载荷；
- `setLatestSharePayload(payload)` 同步写入 `globalData` 与 Storage（键 `latest_share_payload`，注意：此键**不在** `STORAGE_KEYS` 常量中，是 `app.js` 内硬编码）。

---

## 5. 页面详解

### 5.1 首页 `pages/index`

- **状态**：`mode`、`sentence`、`examples`、`popupVisible`、`missingPrompts`、`pendingDemand`、`formValues`。
- **流程**：
  1. `switchMode` 选择模式 → 更新示例列表；
  2. `handlePrimaryAction`：校验已选模式 + 非空句子 → `parseDemand` → `getMissingFields`；
  3. 有缺项 → 弹层显示 `buildMissingConfig(fields)`（按字段类型渲染 chips 或 number 输入框）；
  4. 无缺项或补齐完成 → `generateResult`。
- **`generateResult`**：`createRecommendation` → 构造记录 → `saveLatestDemand` + `saveRecommendation` → `setLatestSharePayload` → 编码 payload 跳转结果页。
- **分享还原**：`onLoad` 解析 `query.scene`（`JSON.parse(decodeURIComponent)`），调用 `restoreSharedDemand` 回填模式与句子。
- **弹层与 TabBar 联动**：弹层打开时隐藏自定义 tabBar（`getTabBar().setData({ hidden: true })`），关闭时恢复。

### 5.2 结果页 `pages/result`

- **数据来源**：`onLoad` 优先解码 `query.payload`，为空则回退 `getApp().globalData.latestSharePayload`，再经 `normalizeDemand`（带全量默认值）补齐后 `createRecommendation`。
- **重新匹配**：`openTunePanel` 打开调整弹层，修改 `demand` 字段后 `rematchResult` 重算，保存为一条「（调整后）」记录。
- **预约**：`openBooking` 打开预约弹层，字段 `contactName` / `phone` / `wechat` / `expectedDate` / `remark` / `acceptFallback`；日期用 **Vant Weapp Calendar** 选择（`bookingDateCalendarVisible`），`submitBooking` 校验联系人与手机号必填后 `saveBooking`。
- **日历边界**：`bookingCalendarMinDate = 今天`，`maxDate = 今天 + 6 个月`。
- **海报入口**：`openPoster` 编码 `sharePayload` 跳转海报页。

### 5.3 海报页 `pages/poster`

- **数据来源**：`onLoad` 解码 payload → `createRecommendation` → 取 `result.posterPayload`。
- **Canvas 导出**（核心难点，本版本已重做）：
  - 画布逻辑宽 **720**，按 `dpr = max(2, pixelRatio)` 放大；
  - `getPosterCanvasHeight` 按信息卡行数**动态计算画布高度**（`GRID_START_Y=1120` + 每行 `138+16` + 底部卡片）；
  - 封面图通过 `wx.getImageInfo` + `node.createImage()` 异步加载，**加载失败返回 null 并降级为纯色卡片**（不阻断导出）；
  - 使用 `wx.canvasToTempFilePath`（`canvas: node`）导出，成功后 `wx.saveImageToPhotosAlbum`；保存失败则回退 `wx.previewImage`。
- **绘制内容**：顶部渐变 hero（标题/模式/匹配分）→ 推荐场馆封面卡 → 方案摘要卡 → 方案重点卡 → 双列信息网格（预算落点/预算参考/裁判/物料/租赁/供应商/媒体）→ 底部引流卡片。
- **远程图约束**：封面图参与 Canvas 导出时，需满足「域名已在小程序后台配置 + `wx.getImageInfo` 可拉取」，否则导出会走降级。

### 5.4 历史页 `pages/history`

- 只展示推荐记录与预约记录的**前 4 条**预览（`previewRecommendations` / `previewBookings`）；
- 标题右侧「查看更多」→ 跳转 `pages/records`；
- `buildList` 按 `mode_summary` 去重，并展平出 `title` / `town` / `date` / `meta` / `brief` / `highlight` 等展示字段；
- 点击单条可 `reopenRecommendation` / `reopenBooking`（编码 `payload.demand` 跳结果页还原）。

### 5.5 记录页 `pages/records`

- `onLoad` 通过 `query.type`（`recommendation` / `booking`）决定列表来源与标题；
- 支持按**镇区**、**日期**筛选（`selectFilter` → `applyFilters`）；
- 筛选选项由现有数据动态生成（`pickFilterOptions`，去重后前置「全部」）。

### 5.6 资源库页 `pages/library`

- 六类资源分类浏览（`libraryCategories`），首项作为 `featuredItem` 大卡展示，其余为列表；
- 镇区筛选（`townFilter`），无结果时给出空态文案；
- `sourceMap` 将分类 key 映射到对应数据集合（注意 `rentals` key 对应 `rentalItems`）。

### 5.7 自定义标签栏 `custom-tab-bar`

- `app.json` 配置 `tabBar.custom: true`，三个 tab：`历史方案` / `首页`（居中突出）/ `资源库`；
- 主题色：`selectedColor: #1d5dff`，玻璃拟态风格，带切换动效；
- 点击用 `wx.switchTab` 或 `wx.redirectTo`（非 tab 页进入时），`switchingKey` 防重复触发；
- 各页面 `onShow` 通过 `getTabBar().setData({ active, hidden })` 同步当前 tab 与弹层遮罩状态。
- 另有 `components/glass-tabbar` 业务组件版本，二者职责相同、实现略有差异。

---

## 6. 数据模型汇总

### 6.1 `demand`（需求）

```js
{
  mode: "pro_event" | "casual_game",
  sentence: string,          // 原始输入
  city: "东莞",
  town: string,              // 镇区
  peopleCount: number | "",  // 人数
  teamCount: number | "",    // 队伍数
  budgetLevel: "low"|"mid"|"high"|"",
  playDate: "YYYY-MM-DD"|"",
  venuePreference: "indoor"|"outdoor"|"" ,
  needReferee: boolean,
  needMaterials: boolean,
  needMedia: boolean,        // 仅 pro 有意义
  needSupplier: boolean,     // 仅 pro 有意义
}
```

### 6.2 `result`（推荐结果）

见 `4.3` 结果对象结构；`sections` 每项为 `{ key, title, items: [...] }`，`items` 为资源对象。

### 6.3 记录 `record`

```js
{
  id: "rec_<timestamp>" | "book_<timestamp>",
  type: "recommendation" | "booking",
  mode, createdAt, summary,
  payload: { demand, result, bookingForm? }   // 预约多 bookingForm
}
```

### 6.4 `bookingForm`（预约表单）

```js
{
  contactName, phone, wechat, expectedDate, remark, acceptFallback: boolean
}
```

---

## 7. 关键实现细节与约定

1. **无真实大模型**：自然语言解析完全靠关键词/正则规则，`parser.js` 是当前「一句话理解」的全部能力边界。
2. **日期为演示硬编码**：`detectDate` 与 `DATE_OPTIONS` 假设固定演示期（2026-07 下旬至 08 月上旬），上线前必须改为动态日期。
3. **人数推断**：`X 支队伍` 默认按每队 10 人折算（`teamCount × 10`）；`XvY` 视为 2 队、总人数 `X+Y`。
4. **打分可解释性**：所有排序都基于 `priority`（静态基础分）+ 场景/预算/镇区/偏好等显式加分项，便于 demo 时解释「为什么推荐它」。
5. **字段缺失判定与产品取舍**：室内外偏好不在首轮强制补齐，降低输入门槛（见 `4.2`）。
6. **分享/还原链路**：页面间与分享均通过 `share.js` 编码 JSON 到 URL；`app.js` 维护 `latestSharePayload` 作兜底。
7. **本地存储上限**：推荐/预约各最多保留 20 条，头插新记录。
8. **远程图片**：场馆/裁判已切远程 `https`（`bee-reg-ab.imagency.cn`），本地图仍作后备；海报 Canvas 导出对远程图有额外域名/拉取约束。
9. **打包忽略**：`四库` 与 `node_modules` 已在 `project.config.json` 的 `packOptions.ignore` 中排除。
10. **注意历史遗留**：`pages/logs` 为模板生成页面，未注册到 `app.json`，属无效残留；`STORAGE_KEYS` 中未包含 `app.js` 硬编码的 `latest_share_payload` 键。

---

## 8. 开发与构建

### 8.1 环境要求

- 微信开发者工具（基础库 `trial`）；
- Node.js + npm（用于安装 Vant Weapp）。

### 8.2 安装与构建

```bash
npm install          # 安装 @vant/weapp
```

在微信开发者工具中：
1. 菜单「工具」→「构建 npm」；
2. 确认 `miniprogram_npm` 已生成（组件才能正常引用）。

### 8.3 远程图片白名单

要让远程图在真机稳定显示并参与海报导出，需在小程序后台将 `bee-reg-ab.imagency.cn` 加入 **request/downloadFile 合法域名**，并确认 `wx.getImageInfo` 可正常拉取。

### 8.4 发布注意

- 当前为**本地演示版**，不应直接用于生产发布；
- 发布体验版/正式版前，建议把关键资源图迁移到稳定对象存储并统一配置白名单。

---

## 9. 已知限制与后续规划

### 9.1 已知限制

- 无真实后端：资源、推荐、预约均为本地模拟，数据不跨设备同步；
- 无真实大模型：复杂/口语化需求解析能力有限，仅覆盖规则内的关键词；
- 日期硬编码，无法适应真实「今天」；
- 无支付、无真实锁单、无地图导航；
- 本地记录上限 20 条，无云端归档。

### 9.2 后续可优化方向（摘自 README）

- 接真实后台资源库；
- 接真实大模型做自然语言理解；
- 接服务端方案存档与分享还原；
- 接预约工单流转；
- 接地图、场馆位置与路线；
- 增加更多资源照片与详情页；
- 优化海报模板，支持更多品牌化样式。

---

## 10. 附录：术语表

| 术语 | 含义 |
| --- | --- |
| 一句话办赛 | 产品核心交互：一句话描述需求，自动匹配整套方案 |
| 半专业赛事 (`pro_event`) | 偏企业赛/园区赛/社区联赛，输出完整链路 |
| 野球约球 (`casual_game`) | 偏朋友组局/半场对抗，输出轻量配置 |
| 镇区 | 东莞下辖区域，是地点匹配的最小粒度 |
| 预算档 | low / mid / high 三档，驱动资源筛选与报价文案 |
| 补齐弹层 | 需求缺项时底部追问弹层（`van-popup`） |
| 重新匹配 | 结果页内调整参数后重算方案 |
| 海报导出 | Canvas 绘制方案海报并保存到相册 |
| 分享载荷 (sharePayload) | 用于页面传参与分享还原的精简 demand |
| 四库 | 旧版「四库」资源代码/素材目录，仅作内容结构参考，不直接复用 |
