const APP_MODE = {
  PRO_EVENT: "pro_event",
  CASUAL_GAME: "casual_game",
};

const STORAGE_KEYS = {
  RECOMMENDATIONS: "lx_recommendations",
  BOOKINGS: "lx_bookings",
  LATEST_DEMAND: "lx_latest_demand",
  LATEST_RESULT: "lx_latest_result",
};

// 客服与开通引导配置（A1/A2）
// 上线前请替换为真实客服信息：qrCode 指向客服微信二维码本地图片，phone/wechat 为真实联系方式
const CONTACT = {
  name: "客服未配置",
  qrCode: "",
  phone: "",
  wechat: "",
};

const MODE_OPTIONS = [
  {
    value: APP_MODE.PRO_EVENT,
    label: "半专业赛事",
    subtitle: "企业赛、园区赛、社区联赛",
    accent: "场馆、裁判、物料、执行一次配齐",
  },
  {
    value: APP_MODE.CASUAL_GAME,
    label: "野球约球",
    subtitle: "朋友组局、半场对抗、轻量约战",
    accent: "就近找馆，快速成局",
  },
];

const MODE_EXAMPLES = {
  [APP_MODE.PRO_EVENT]: [
    "东莞南城本周六 8 支企业篮球赛，预算 1 万，要室内馆、裁判和摄影",
    "松山湖下周六做一场 3v3 园区赛，预算 8000，要主持、奖牌和直播",
    "厚街月底办社区篮球决赛夜，要正式场馆、主裁边裁和电子计分",
  ],
  [APP_MODE.CASUAL_GAME]: [
    "周日下午东城打 4v4 半场，室内场，不用裁判",
    "明晚南城约一场 5v5 全场，预算别太高，想租计分牌",
    "周五晚上松山湖组局 3v3，想要空调室内馆，最好配一个裁判",
  ],
};

const TOWN_OPTIONS = [
  "南城",
  "东城",
  "莞城",
  "松山湖",
  "厚街",
  "虎门",
  "大朗",
  "黄江",
  "常平",
  "寮步",
];

const BUDGET_OPTIONS = [
  { label: "轻量预算", value: "low", hint: "约 500 - 3000" },
  { label: "标准预算", value: "mid", hint: "约 3000 - 12000" },
  { label: "高配预算", value: "high", hint: "约 12000 以上" },
];

const VENUE_OPTIONS = [
  { label: "室内优先", value: "indoor" },
  { label: "室外优先", value: "outdoor" },
  { label: "都可以", value: "flexible" },
];

const DATE_OPTIONS = [
  { label: "7月30日 周四", value: "2026-07-30" },
  { label: "7月31日 周五", value: "2026-07-31" },
  { label: "8月1日 周六", value: "2026-08-01" },
  { label: "8月2日 周日", value: "2026-08-02" },
  { label: "8月8日 周六", value: "2026-08-08" },
];

module.exports = {
  APP_MODE,
  STORAGE_KEYS,
  CONTACT,
  MODE_OPTIONS,
  MODE_EXAMPLES,
  TOWN_OPTIONS,
  BUDGET_OPTIONS,
  VENUE_OPTIONS,
  DATE_OPTIONS,
};
