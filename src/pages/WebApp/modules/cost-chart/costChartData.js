/**
 * 办赛成本统计 · 数据层
 *
 * 数据全部取自项目里已有的资源调度数据（src/pages/WebApp/data/resourceMatchingMock.js）：
 * 粤BA 半决赛一场 12 场的资源清单与成本分布，没有另编数字。
 */
export const COST = {
  width: 760,
  height: 1180,
  title: '办赛成本统计',
  subtitle: '粤BA 半决赛 · 12 场 · 3 天 · 2 场馆 · 249 项资源',
  total: 386500,
  saved: 52000,
  note: '数据来源：赛事资源智能调度系统 · 资源清单自动归集',
  /** 实景图：东莞市篮球中心主馆（本项目 venues 素材） */
  photo: '/images/resources/venues/dgcenter-1.jpg',
  photoLabel: '东莞市篮球中心主馆 · 8000 人 · 主赛场',
  /** 人员板块：裁判证件照（本项目 hr/referees 素材） */
  referee: {
    photo: '/images/resources/hr/referees/ref-1.jpg',
    name: '李建国',
    level: '国家级裁判',
    experience: 156,
    count: 48,
    amount: 36000,
  },
  /** 四大类成本（左列卡片） */
  categories: [
    {
      key: 'talent',
      name: '人才资源',
      color: '#3B82F6',
      amount: 86000,
      pct: 22.3,
      brief: '裁判组 · 记录台 · 医护 · 安保 · 志愿者',
    },
    {
      key: 'venue',
      name: '场馆资源',
      color: '#10B981',
      amount: 120000,
      pct: 31.0,
      brief: '主比赛场馆 · 备用馆 · 热身场',
    },
    {
      key: 'material',
      name: '物料资源',
      color: '#F59E0B',
      amount: 95600,
      pct: 24.7,
      brief: '参赛服装（球衣） · 奖杯奖牌 · 用球 · 补给',
    },
    {
      key: 'media',
      name: '媒体宣发',
      color: '#8B5CF6',
      amount: 84900,
      pct: 22.0,
      brief: '官方直播 · 自媒体直播 · 社媒 · 摄影',
    },
  ],
  /** 明细表（右列） */
  rows: [
    { cat: 'talent', name: '裁判组 · 记录台', detail: '裁判 48 人次 · 记录台 48 人次', amount: 54000, pct: 14.0 },
    { cat: 'talent', name: '医护 · 安保 · 志愿者', detail: '医护 9 · 安保 33 · 志愿者 60 人次', amount: 32000, pct: 8.3 },
    { cat: 'venue', name: '主比赛场馆', detail: '东莞市篮球中心主馆 · 8000 人', amount: 80000, pct: 20.7 },
    { cat: 'venue', name: '备用馆 · 热身场', detail: '东城体育公园馆 · 莞城体育馆副馆', amount: 40000, pct: 10.3 },
    { cat: 'material', name: '参赛服装（球衣）', detail: '速干定制印花 ×60 件', amount: 12000, pct: 3.1 },
    { cat: 'material', name: '奖杯奖牌 · 用球 · 记分', detail: '奖杯 13 套 · 用球 24 个 · 记分 4 套', amount: 41200, pct: 10.7 },
    { cat: 'material', name: '其他物料', detail: '篮架 / 篮网 / 号码布 / 补给', amount: 42400, pct: 11.0 },
    { cat: 'media', name: '官方直播 · 自媒体直播', detail: '广电体育频道 · 篮芯 AI 矩阵', amount: 57000, pct: 14.7 },
    { cat: 'media', name: '社媒 · 摄影 · 报道', detail: '大 V 3 人 · 摄影 6 人天 · 5 家媒体', amount: 27900, pct: 7.2 },
  ],
}

export const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif"

export const PALETTE = {
  pageBg: '#F8F6F1',
  card: '#FFFFFF',
  cardBorder: 'rgba(27,36,50,0.14)',
  headBg: '#F1EEE7',
  line: 'rgba(27,36,50,0.14)',
  track: 'rgba(27,36,50,0.07)',
  text: '#1B2432',
  muted: '#68727F',
  dim: '#9AA3AE',
  total: '#B8791F',
}
