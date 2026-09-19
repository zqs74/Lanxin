/**
 * 基层赛事数据积累 · 数据层
 *
 * 对应 PPT 第 27 页「区域深耕」右侧第三张卡片。
 * 数字取自 PPT 原文：28 个本土 IP、服务东莞赛事 1021 场、覆盖 26 个镇街、服务球员 20615 人次、人才库 543 名。
 */
export const REGION = {
  width: 760,
  height: 660,
  title: '基层赛事数据积累',
  subtitle: '28 个本土 IP 参与 · 深耕东莞 · 群众篮球生态',
  kpis: [
    { value: '28', unit: '个', label: '本土赛事 IP' },
    { value: '1021', unit: '场', label: '服务东莞赛事' },
    { value: '26', unit: '个', label: '覆盖东莞镇街' },
    { value: '20615', unit: '人次', label: '服务球员' },
  ],
  rows: [
    { name: '赛事执行记录', value: '1021 场', detail: '含大学期间执行的赛事', color: '#3B82F6' },
    { name: '球员参与', value: '20,615 人次', detail: '基层赛事报名与上场记录', color: '#8B5CF6' },
    { name: '镇街覆盖', value: '26 个', detail: '东莞全市 32 个镇街中的 26 个', color: '#10B981' },
    { name: '本土赛事 IP', value: '28 个', detail: '东莞理工 UBA / 石龙三人赛 / 寮步 BA / 莞篮 BA / 莞篮新星', color: '#F59E0B' },
    { name: '裁判教练人才库', value: '543 名', detail: '裁判 / 教练 / 医疗 / DJ 四类人才', color: '#EC4899' },
  ],
  note: '数据来源：昇梦体育基层赛事执行记录 · 持续更新',
}

export const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif"

export const PALETTE = {
  pageBg: '#F8F6F1',
  card: '#FFFFFF',
  cardBorder: 'rgba(27,36,50,0.14)',
  headBg: '#F1EEE7',
  barBg: '#EEE9DF',
  line: 'rgba(27,36,50,0.14)',
  track: 'rgba(27,36,50,0.07)',
  text: '#1B2432',
  muted: '#68727F',
  dim: '#9AA3AE',
  accent: '#B8791F',
}
