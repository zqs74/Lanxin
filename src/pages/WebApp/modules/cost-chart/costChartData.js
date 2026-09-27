/**
 * 办赛成本统计 · 数据层
 *
 * 四类成本按用户给的赛事资源报价表（中型比赛）的**单场用量 × 12 场**算，
 * 与副标题「粤BA 半决赛 · 12 场」同一个口径：
 *   人才 = 裁判 36×400 + 记录台 24×200 + 医护 36×500 + 安保 360×350 = 163,200
 *   物料 = 球衣 288 件（每场两队各 12 人 × 12 场）× 90 = 25,920
 *   媒体 = 自媒体直播 48×500 + 摄影 48×1000 + 表演人员 3×250 = 72,750
 *   场馆 = 报价表里没有，沿用资源调度清单的 120,000
 */
export const COST = {
  width: 760,
  height: 1264,
  title: '办赛成本统计',
  subtitle: '粤BA 半决赛 · 12 场 · 3 天 · 2 场馆 · 249 项资源',
  total: 381870,
  saved: 52000,
  note: '',
  /** 顶栏（小程序式）：居中品牌语 + 右侧注册商标 */
  topBar: {
    title: '昇梦一句话办赛',
    logoH: 48,
    logoW: 57,
  },
  /** 实景图：中型篮球馆内景（由 public/images/resources/venues/20.png 放大并转成的压缩 JPEG） */
  photo: '/images/resources/venues/venue-mid-2000.jpg',
  photoLabel: '中型篮球馆 · 2000 人 · 分赛场',
  /** 环形图中心：物料成本（球衣 288 件 × ¥90，与底部表格的物料资源一致） */
  center: {
    label: '物料成本',
    amount: 25920,
  },
  /** 人员板块：三位裁判（姓名/等级取自项目 hr/referees 档案） */
  referees: [
    { photo: '/images/resources/hr/referees/ref-1.jpg', name: '李建国', level: '国家级裁判' },
    { photo: '/images/resources/hr/referees/ref-10.png', name: '张明', level: '国际级裁判' },
    { photo: '/images/resources/hr/referees/ref-9.png', name: '刘存', level: '国际级裁判' },
  ],
  /** 裁判组汇总（沿用赛事资源调度清单） */
  refereeGroup: {
    count: 48,
    amount: 36000,
  },
  /**
   * 品牌 logo（顶栏右侧用）
   * logo 源图为透明底 PNG（D:\16037\Documents\Lanxin-UI\logo.png，3508×2480），
   * 裁出「圆环标 + 右上六角星」一带（源图 x1045 y318 起 1512×1284）缩放到高 320，
   * 只保留图形标，中文与英文名不在标内。
   */
  brand: {
    logo: '/images/brand/logo-mark-shenmeng.png',
  },

  /** 四大类成本（底部表格 + 环形图） */
  categories: [
    {
      key: 'talent',
      name: '人才资源',
      color: '#3B82F6',
      amount: 163200,
      pct: 42.7,
      brief: '裁判 36 · 记录台 24 · 医护 36 · 安保 360',
    },
    {
      key: 'venue',
      name: '场馆资源',
      color: '#10B981',
      amount: 120000,
      pct: 31.4,
      brief: '主比赛场馆 · 备用馆 · 热身场',
    },
    {
      key: 'material',
      name: '物料资源',
      color: '#F59E0B',
      amount: 25920,
      pct: 6.8,
      brief: '参赛服装（球衣） 288 件',
    },
    {
      key: 'media',
      name: '媒体宣发',
      color: '#8B5CF6',
      amount: 72750,
      pct: 19.1,
      brief: '自媒体直播 48 · 摄影 48 · 表演人员 3',
    },
  ],
  /**
   * 赛事资源报价表原值（用户给的报价表 · 中型比赛那一组，数值原值照抄）
   * 底部表格现在是四类成本表，这份表留着存档 —— 四类成本的金额就是照它算的（见文件头注释）。
   */
  quote: {
    title: '赛事资源报价表 · 中型比赛',
    columns: ['场次', '裁判员', '记录台', '医护', '安保', '球衣', '自媒体直播', '摄影', '表演人员', '总价'],
    unitRow: ['—', '400', '200', '500', '350', '90', '500', '1000', '250', '—'],
    rows: [
      { label: '1 场', values: ['1', '3', '2', '3', '30', '960', '4', '4', '3', '106,000'] },
      { label: '63 场', values: ['63', '189', '126', '189', '1890', '960', '252', '252', '3', '1,321,950'] },
    ],
    note: '单价（元/单位） × 用量 = 金额；球衣 960 件为整批采购，不随场次增加。',
  },
  /** 明细表（右列）—— 底部已换成报价表，这份留着备用 */
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
