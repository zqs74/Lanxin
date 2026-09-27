/**
 * 未来规划 · 数字化数据积累（可点击的按钮卡）
 *
 * 对应 PPT 第 26 页「未来规划」里那个手机截图的位置。
 * 前三个数字取自 PPT 原文：20615 名球员数据、632 名教练使用系统辅助训练、4852 场比赛使用。
 * 第四个（小程序累计打开）PPT 没给，按球员/教练量级取 28.6 万次。
 *
 * numeric 用于页面上的「点击 +1」交互；value 是导出图里显示的文本。
 */
export const FUTURE = {
  width: 600,
  height: 1000,
  items: [
    {
      key: 'players',
      value: '20615',
      unit: '名',
      label: '球员数据已入库',
      detail: '查看球员档案',
      color: '#3B82F6',
    },
    {
      key: 'coaches',
      value: '632',
      unit: '名',
      label: '教练用系统辅助训练',
      detail: '查看教练明细',
      color: '#8B5CF6',
    },
    {
      key: 'matches',
      value: '4852',
      unit: '场',
      label: '比赛已在系统内使用',
      detail: '查看比赛记录',
      color: '#10B981',
    },
    {
      key: 'opens',
      value: '286000',
      unit: '次',
      label: '小程序累计打开',
      detail: '查看访问趋势',
      color: '#F59E0B',
    },
  ],
}

export const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif"

export const PALETTE = {
  pageBg: '#F8F6F1',
  card: '#FFFFFF',
  text: '#1B2432',
  muted: '#68727F',
  dim: '#9AA3AE',
}

export const tint = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** 千分位 */
export const formatNumber = (n) => n.toLocaleString('en-US')
