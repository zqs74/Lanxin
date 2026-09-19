/**
 * 赛事数据服务 · 四张数据表
 *
 * 用途：PPT「核心业务三 赛事数据服务」中间四个窗口的数据表。
 * 字段严格对齐 PPT 上四个窗口的说明：
 *   基础五项   → 前板 / 后板 / 篮板 / 助攻 / 抢断 / 盖帽 / 失误 / 犯规
 *   投篮分布   → 出手 / 命中 / 命中率 / 频率（篮下、中短距离、三分）
 *   综合影响力 → 累计获胜贡献水平 VORP / 原始 BPM / 原始 OBPM / 原始 DBPM
 *   攻防综合   → 修正百回合净胜分 / 百回合得分 / 百回合失分 / 进攻效率 / 防守效率
 *
 * 表格样式复用「运动数据分析中台」的表卡：深色卡片 + 标题左侧金色条 +
 * 表头略亮底白粗体 + 列间竖线贯穿 + 数值列白色粗体 + 第一列灰蓝。
 */

/** 画布：统一 1.66:1（宽 1000 / 高 602），内容左右各留 24 内边距 */
export const TABLE_WIDTH = 1000
export const TABLE_HEIGHT = 602
export const PAD = 24
export const CONTENT_W = TABLE_WIDTH - PAD * 2
export const HEAD_TOP = 100
export const HEAD_H = 56
export const FOOT_PAD = 24

/** 行高按行数铺满画布，这样每张表都正好是 1.66:1 */
export function rowHeight(table) {
  return (TABLE_HEIGHT - FOOT_PAD - HEAD_TOP - HEAD_H) / table.rows.length
}

/** 配色：浅色（对齐控制台浅色模式），白色表卡直接贴 PPT 深蓝底 */
export const PALETTE = {
  card: '#FFFFFF',
  cardBorder: 'rgba(26,26,26,0.16)',
  headBg: '#F1EEE7',
  line: 'rgba(26,26,26,0.16)',
  text: '#1A1A1A',
  label: '#6C6C6C',
  muted: '#8C8C8C',
  accent: '#B8941F',
}

export const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif"

export function tableHeight() {
  return TABLE_HEIGHT
}

/**
 * @typedef {{ key:string, title:string, caption:string, columns:string[],
 *             colWidths:number[], rows:string[][] }} DataTable
 * colWidths 之和必须等于 CONTENT_W（952）
 */

/** 1. 基础五项 —— 记录赛场表现 */
export const BASIC_TABLE = {
  key: 'basic',
  title: '基础五项',
  caption: '记录赛场表现',
  columns: ['球员', '前板', '后板', '篮板', '助攻', '抢断', '盖帽', '失误', '犯规'],
  colWidths: [172, 90, 90, 104, 104, 96, 96, 100, 100],
  rows: [
    ['张宇辰', '1.8', '4.2', '6.0', '3.4', '1.6', '0.4', '1.9', '1.7'],
    ['陈俊豪', '1.2', '3.6', '4.8', '5.1', '1.9', '0.2', '2.3', '2.1'],
    ['李昊然', '2.4', '5.1', '7.5', '2.2', '1.1', '1.3', '1.5', '2.4'],
    ['周宇诚', '0.9', '2.8', '3.7', '4.6', '2.2', '0.3', '1.4', '1.9'],
  ],
}

/** 2. 投篮分布 —— 评估发挥水平 */
export const SHOOTING_TABLE = {
  key: 'shooting',
  title: '投篮分布',
  caption: '评估发挥水平',
  columns: ['出手位置', '出手', '命中', '命中率', '频率'],
  colWidths: [272, 170, 170, 170, 170],
  rows: [
    ['篮下', '6.2', '4.1', '66.1%', '42.6%'],
    ['中短距离', '6.2', '2.1', '33.9%', '26.2%'],
    ['三分', '5.8', '2.1', '36.2%', '31.2%'],
    ['罚球', '4.2', '3.4', '81.0%', '—'],
  ],
}

/** 3. 综合影响力分析 —— 明确提升方向 */
export const IMPACT_TABLE = {
  key: 'impact',
  title: '综合影响力分析',
  caption: '明确提升方向',
  columns: ['指标', '数值', '水平'],
  colWidths: [420, 190, 342],
  rows: [
    ['累计获胜贡献水平 VORP', '2.8', '赛区前 12%'],
    ['原始 BPM', '+4.6', '高于平均'],
    ['原始 OBPM', '+3.1', '进攻端贡献'],
    ['原始 DBPM', '+1.5', '防守端贡献'],
  ],
}

/** 4. 攻防综合 —— 发现球队强项 */
export const TWOWAY_TABLE = {
  key: 'twoway',
  title: '攻防综合',
  caption: '发现球队强项',
  columns: ['指标', '数值', '赛区排名'],
  colWidths: [420, 190, 342],
  rows: [
    ['修正百回合净胜分', '+8.4', '第 3'],
    ['百回合得分', '112.6', '第 5'],
    ['百回合失分', '104.2', '第 4'],
    ['进攻效率', '112.6', '第 5'],
    ['防守效率', '104.2', '第 4'],
  ],
}

export const TABLES = [BASIC_TABLE, SHOOTING_TABLE, IMPACT_TABLE, TWOWAY_TABLE]
