/**
 * 资源智能匹配 · Mock 数据（核心业务一：极速办赛资源中台）
 * 暂含页面1（输入需求）所需数据；页面2/3 数据后续追加。
 * 数值自洽：四库 count 加总 = 2800（230+257+1956+357）
 */

/** 四库概览（匹配数据源） */
export const DATABASES = [
  {
    id: 'talent',
    name: '人才库',
    icon: 'Users',
    count: 230,
    unit: '名',
    detail: '裁判115 / 教练46 / 记录台后勤69',
    color: 'info',
    scoreRecords: '3,257条评分记录'
  },
  {
    id: 'venue',
    name: '场馆资源库',
    icon: 'Building2',
    count: 257,
    unit: '个',
    detail: '覆盖东莞25个镇街·村村有球场',
    color: 'ok',
    scoreRecords: '含场地设施评分'
  },
  {
    id: 'material',
    name: '体育用品库',
    icon: 'Package',
    count: 1956,
    unit: '条',
    detail: '合作38家供应商',
    color: 'warn',
    scoreRecords: '历史采购1,956单'
  },
  {
    id: 'media',
    name: '宣发媒体库',
    icon: 'Megaphone',
    count: 357,
    unit: '家',
    detail: '地方媒体357家 + 篮球社群55个',
    color: 'purple',
    scoreRecords: '含传播效果数据'
  }
];

/** 三级赛事体系（匹配可选赛事） */
export const TOURNAMENTS = [
  { id: 't1', name: '粤BA半决赛', level: 'Ⅰ级', levelLabel: '省市级' },
  { id: 't2', name: '东莞镇BA', level: 'Ⅱ级', levelLabel: '区县级' },
  { id: 't3', name: '莞篮村BA', level: 'Ⅲ级', levelLabel: '村级' }
];

/** 办赛需求表单模板（默认值） */
export const REQUIREMENT_TEMPLATE = {
  tournamentId: 't1',
  date: '2026-08-20',
  days: 3,
  matchesPerDay: 4,
  venueType: '室内',
  venueCount: 2,
  minCapacity: 500,
  region: '东城',
  amenities: ['更衣室', '停车场'],
  specialReq: '',
  staff: {
    referee: { count: 6, level: '不限' },
    scoreTable: { count: 4, level: '不限' },
    medical: { count: 3, level: '不限' },
    security: { count: 10, level: '不限' },
    volunteer: { count: 20, level: '不限' }
  },
  materials: {
    ball: 24,
    scoreboard: 4,
    stand: 2,
    trophy: 12,
    jersey: 60,
    water: 200
  },
  media: {
    live: '官方直播',
    photo: '专业摄影',
    social: ['微信公众号', '抖音'],
    invite: 5
  },
  budget: ''
};

/** 4库匹配进度（页面2：自动匹配） */
export const MATCH_PROGRESS = [
  { id: 'talent', name: '人才库匹配', icon: 'Users', status: 'done', matched: 48, total: 48, duration: '2.3s', color: 'info' },
  { id: 'venue', name: '场馆资源库匹配', icon: 'Building2', status: 'done', matched: 3, total: 3, duration: '1.1s', color: 'ok' },
  { id: 'material', name: '体育用品库匹配', icon: 'Package', status: 'done', matched: 186, total: 200, duration: '3.8s', color: 'warn' },
  { id: 'media', name: '宣发媒体库匹配', icon: 'Megaphone', status: 'done', matched: 12, total: 12, duration: '1.5s', color: 'purple' }
];

/** 4库匹配结果详情（页面2：自动匹配） */
export const MATCH_RESULTS = {
  talent: [
    { role: '主裁判', name: '李建国', level: '国家级', rating: 4.8, experience: 156, status: 'matched', score: 96 },
    { role: '第一副裁', name: '王志强', level: '一级', rating: 4.6, experience: 98, status: 'matched', score: 92 },
    { role: '记录台长', name: '张秀芳', level: '一级', rating: 4.7, experience: 120, status: 'matched', score: 94 },
    { role: '医护负责人', name: '陈医生', level: '执业医师', rating: 4.9, experience: 80, status: 'matched', score: 95 },
    { role: '安保队长', name: '刘铁柱', level: '高级安保', rating: 4.5, experience: 200, status: 'matched', score: 90 }
  ],
  venue: [
    { name: '东莞市篮球中心主馆', type: '室内', capacity: 8000, location: '东城', facilities: ['热身场', '更衣室', '媒体室', '停车场'], rating: 4.9, status: 'matched', score: 98 },
    { name: '东城体育公园篮球馆', type: '室内', capacity: 2000, location: '东城', facilities: ['热身场', '更衣室', '停车场'], rating: 4.6, status: 'matched', score: 91 },
    { name: '莞城体育馆', type: '室内', capacity: 1500, location: '莞城', facilities: ['更衣室', '停车场'], rating: 4.3, status: 'alternative', score: 85 }
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
};

/** 冲突与异常预警（页面2：自动匹配） */
export const CONFLICTS = [
  { type: 'time', desc: '主裁判李建国 8月20日 14:00 已有粤BA另一场执法任务', severity: 'warn', solution: '推荐备选：赵国华（一级·评分4.7·经验89场）' },
  { type: 'shortage', desc: 'Gatorade补给套装库存仅150份，缺口50份', severity: 'danger', solution: '推荐替代：宝矿力水特运动饮料（库存充足·价格相近）' }
];

/** 匹配统计（页面2：自动匹配） */
export const MATCH_STATS = { totalMatched: 249, totalRequired: 263, matchRate: 94.7, avgScore: 92.3, duration: '8.7s' };

/** 赛事信息（页面3：输出清单） */
export const EVENT_INFO = {
  tournament: '粤BA半决赛',
  level: 'Ⅰ级·省市级',
  date: '2026-08-20 ~ 2026-08-22',
  totalMatches: 12,
  venues: 2,
  days: 3
};

/** 输出汇总（页面3：输出清单） */
export const OUTPUT_SUMMARY = {
  totalResources: 249,
  totalCost: 386500,
  costSaved: 52000,
  matchRate: 94.7,
  categories: 4
};

/** 四库分类清单（页面3：输出清单） status: confirmed/partial */
export const CATEGORY_SUMMARY = [
  {
    id: 'talent',
    name: '人才资源',
    icon: 'Users',
    count: 48,
    cost: 86000,
    color: 'info',
    items: [
      { role: '裁判组', detail: '主裁1+副裁2+技术代表1 ×12场', count: 48, unit: '人次', cost: 36000, contact: '李建国 138xxxx', status: 'confirmed' },
      { role: '记录台', detail: '记录台长1+记录员2+计时员1 ×12场', count: 48, unit: '人次', cost: 18000, contact: '张秀芳 139xxxx', status: 'confirmed' },
      { role: '医护组', detail: '执业医师1+急救员2 ×3天', count: 9, unit: '人次', cost: 12000, contact: '陈医生 137xxxx', status: 'confirmed' },
      { role: '安保组', detail: '安保队长1+安保10 ×3天', count: 33, unit: '人次', cost: 15000, contact: '刘铁柱 135xxxx', status: 'confirmed' },
      { role: '志愿者', detail: '引导10+后勤10 ×3天', count: 60, unit: '人次', cost: 5000, contact: '团委协调', status: 'partial' }
    ]
  },
  {
    id: 'venue',
    name: '场馆资源',
    icon: 'Building2',
    count: 3,
    cost: 120000,
    color: 'ok',
    items: [
      { role: '主比赛场馆', detail: '东莞市篮球中心主馆 · 8000人 · 室内', count: 1, unit: '馆', cost: 80000, contact: '场馆管理中心 222xxxx', status: 'confirmed' },
      { role: '备用场馆', detail: '东城体育公园篮球馆 · 2000人 · 室内', count: 1, unit: '馆', cost: 25000, contact: '东城文体局 223xxxx', status: 'partial' },
      { role: '热身场地', detail: '莞城体育馆副馆 · 500人', count: 1, unit: '馆', cost: 15000, contact: '莞城文体局 224xxxx', status: 'confirmed' }
    ]
  },
  {
    id: 'material',
    name: '物料资源',
    icon: 'Package',
    count: 186,
    cost: 95600,
    color: 'warn',
    items: [
      { role: '比赛用球', detail: '斯伯丁TF-500 ×24个', count: 24, unit: '个', cost: 7200, contact: '东莞文体供应 228xxxx', status: 'confirmed' },
      { role: '记分系统', detail: '专业记分牌+24秒器 ×4套', count: 4, unit: '套', cost: 8000, contact: '恒天体育 229xxxx', status: 'confirmed' },
      { role: '奖杯奖牌', detail: '冠军奖杯+MVP+12套奖牌', count: 13, unit: '套', cost: 18000, contact: '金鼎工艺 230xxxx', status: 'confirmed' },
      { role: '参赛服装', detail: '速干定制印花 ×60件', count: 60, unit: '件', cost: 12000, contact: '速干体育 231xxxx', status: 'confirmed' },
      { role: '餐饮补给', detail: 'Gatorade 150份 + 宝矿力 50份', count: 200, unit: '份', cost: 8000, contact: '佳得乐代理 232xxxx', status: 'partial' },
      { role: '其他物料', detail: '篮架/篮网/胶带/号码布等', count: 85, unit: '件', cost: 42400, contact: '多供应商', status: 'partial' }
    ]
  },
  {
    id: 'media',
    name: '媒体宣发',
    icon: 'Megaphone',
    count: 12,
    cost: 84900,
    color: 'purple',
    items: [
      { role: '官方直播', detail: '东莞广播电视台体育频道 ×3天', count: 1, unit: '项', cost: 45000, contact: '广电中心 233xxxx', status: 'confirmed' },
      { role: '自媒体直播', detail: '篮芯AI矩阵(抖音+视频号+B站)', count: 1, unit: '项', cost: 12000, contact: '内部团队', status: 'confirmed' },
      { role: '摄影团队', detail: '专业摄影2人 ×3天 赛事跟拍', count: 6, unit: '人天', cost: 9000, contact: '光影工作室 234xxxx', status: 'partial' },
      { role: '媒体报道', detail: '东莞日报+南方都市报+3家地方媒体', count: 5, unit: '家', cost: 8900, contact: '媒体联络组', status: 'partial' },
      { role: '社媒推广', detail: '抖音篮球大V3人 + 微信公众号2个', count: 5, unit: '个', cost: 10000, contact: '运营团队', status: 'confirmed' }
    ]
  }
];

/** 成本分布（页面3：输出清单） */
export const COST_BREAKDOWN = [
  { category: '人才资源', amount: 86000, pct: 22.3, color: 'info' },
  { category: '场馆资源', amount: 120000, pct: 31.0, color: 'ok' },
  { category: '物料资源', amount: 95600, pct: 24.7, color: 'warn' },
  { category: '媒体宣发', amount: 84900, pct: 22.0, color: 'purple' }
];

/** 赛事时间轴（页面3：输出清单） status: prepare/match/wrapup */
export const TIMELINE = [
  { day: 'Day 1 (8/20)', phase: '赛前准备', items: '场馆布置/物料入场/人员到位', status: 'prepare' },
  { day: 'Day 1 (8/20)', phase: '小组赛 ×4场', items: '裁判4组/记录台4组/直播1场', status: 'match' },
  { day: 'Day 2 (8/21)', phase: '小组赛 ×4场', items: '裁判4组/记录台4组/直播1场', status: 'match' },
  { day: 'Day 3 (8/22)', phase: '淘汰赛 ×4场', items: '裁判4组/记录台4组/直播2场/颁奖', status: 'match' },
  { day: 'Day 3 (8/22)', phase: '赛后收尾', items: '物料清点/场馆恢复/数据归档', status: 'wrapup' }
];