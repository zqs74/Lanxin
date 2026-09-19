/**
 * 球员交付海报 · 数据层
 *
 * 画布 0.7:1（宽 700 / 高 1000）。
 * 照片取项目里的真实球员照，logo 是从品牌板抠出来的昇梦体育标识。
 */
export const POSTER = {
  width: 700,
  height: 1000,
  photo: '/images/showcase/case-brand-zhang.png',
  logo: '/images/poster/logo-shenmeng.png',
  league: '东莞市篮球联赛 · 2026 赛季',
  player: { name: '张宇辰', number: '8', team: '大朗' },
  badge: 'MVP',
  main: [
    { value: '36', label: '得分' },
    { value: '10', label: '篮板' },
    { value: '8', label: '助攻' },
  ],
  extra: [
    { value: '57.5%', label: '投篮命中率' },
    { value: '42.9%', label: '三分命中率' },
    { value: '32', label: '效率值' },
  ],
  footer: '球员 / 球队交付海报',
}

export const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif"

export const PALETTE = {
  bgFrom: '#0B1A2E',
  bgTo: '#03060C',
  text: '#FFFFFF',
  muted: '#93A9C8',
  accent: '#E8A33D',
  accentLight: '#F5C451',
  accentDeep: '#C0761C',
  panel: 'rgba(6,14,26,0.72)',
  line: 'rgba(232,163,61,0.30)',
}
