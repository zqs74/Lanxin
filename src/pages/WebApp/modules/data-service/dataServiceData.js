/**
 * 赛事数据服务 · 数据层
 *
 * 用途：为 PPT「业务三 赛事数据服务」生成配图 —— 一个赛事数据后台的界面示意。
 * 球队名取东莞市篮球联赛常见镇街代表队，数值为示意数据。
 */

/** 画布尺寸：16:9 */
export const CANVAS = { width: 1600, height: 900 }

/** 字体栈（导出 PNG 走系统字体） */
export const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif"

/** 配色：沿用联动商家图的浅色米白 */
export const PALETTE = {
  pageBg: '#F8F6F1',
  topBar: '#FFFFFF',
  sideBar: '#FFFFFF',
  panel: '#FFFFFF',
  panelBorder: 'rgba(27,36,50,0.12)',
  rowAlt: 'rgba(27,36,50,0.032)',
  text: '#1B2432',
  muted: '#68727F',
  dim: '#9AA3AE',
  accent: '#B8941F',
}

/** 顶部 KPI */
export const KPIS = [
  { label: '赛事覆盖人次', value: '10.7', unit: 'w', trend: '较上赛季 +18.2%' },
  { label: '累计服务赛事', value: '5243', unit: '场', trend: '本赛季新增 312 场' },
  { label: '球员数据档案', value: '12,860', unit: '人', trend: '本月新增 1,204 人' },
  { label: '单场数据服务', value: '800', unit: '元', trend: '含采集 / 分析 / 报表' },
]

/** 侧栏菜单 */
export const MENU = ['数据总览', '球员数据', '球队数据', '赛事数据', '报表中心']

/** 球队数据排行 */
export const TEAM_TABLE = {
  columns: ['排名', '球队', '场次', '场均得分', '投篮命中率', '场均篮板', '场均助攻'],
  rows: [
    ['1', '大朗', '18', '84.6', '48.2%', '38.4', '19.2'],
    ['2', '长安', '18', '82.1', '46.8%', '36.9', '18.4'],
    ['3', '南城', '18', '79.4', '45.1%', '35.2', '17.6'],
    ['4', '常平', '17', '77.8', '44.3%', '34.1', '16.9'],
    ['5', '厚街', '17', '75.2', '43.0%', '33.4', '16.2'],
    ['6', '塘厦', '17', '73.6', '42.1%', '32.8', '15.7'],
  ],
}

/** 球员成长曲线（3—9 月） */
export const GROWTH = {
  months: ['3月', '4月', '5月', '6月', '7月', '8月', '9月'],
  scoring: [12.4, 13.6, 14.2, 13.8, 16.4, 18.9, 21.8],
  accuracy: [38.2, 40.1, 39.4, 42.8, 43.6, 45.2, 47.3],
  player: '张宇辰 · 大朗',
}

/** 近期赛事数据档 */
export const RECENT_MATCHES = [
  { date: '09-18', home: '大朗', away: '长安', score: '84:76', status: '数据已入档' },
  { date: '09-17', home: '南城', away: '常平', score: '79:73', status: '分析进行中' },
  { date: '09-15', home: '厚街', away: '塘厦', score: '71:68', status: '报表已出' },
]

/** 球员数据榜（场均得分） */
export const PLAYER_TOP = [
  { rank: 1, name: '张宇辰', team: '大朗', value: '21.8', unit: '分' },
  { rank: 2, name: '陈俊豪', team: '长安', value: '19.4', unit: '分' },
  { rank: 3, name: '李昊然', team: '南城', value: '17.6', unit: '分' },
]

/** 数据沉淀 */
export const DATA_ASSETS = [
  { label: '视频素材', value: '12.4', unit: '万条' },
  { label: '运动轨迹点', value: '3.2', unit: '亿点' },
  { label: '分析报表', value: '8,640', unit: '份' },
]
