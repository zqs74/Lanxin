/**
 * 多模态场景识别 · 数据层
 *
 * 对应 PPT 第 17 页「赛事高光智能识别技术拆解」里的「多模态场景识别」环节，单独成一页。
 * 结构：画面 / 音频 / 数据 三路模态 → 跨模态融合 → 场景标签输出。
 */
export const MULTIMODAL = {
  width: 1000,
  height: 625,
  title: '多模态场景识别',
  subtitle: '画面 · 音频 · 数据 三路并行识别，跨模态融合后输出赛场场景标签',
  /** 画面模态的实拍图（2499×1667，和「高光识别」那张不是同一张） */
  photo: '/images/showcase/case-game-action-02.jpeg',
  modalities: [
    {
      key: 'vision',
      name: '画面模态',
      color: '#3B82F6',
      metric: '28 fps',
      metricLabel: '推理帧率',
      tags: ['目标检测', '姿态估计', '轨迹追踪'],
    },
    {
      key: 'audio',
      name: '音频模态',
      color: '#8B5CF6',
      metric: '16 kHz',
      metricLabel: '采样率',
      tags: ['哨声识别', '解说识别', '环境噪声'],
      wave: [16, 30, 46, 34, 58, 78, 54, 66, 40, 52, 82, 62, 38, 50, 30, 42, 24, 34, 18, 28],
    },
    {
      key: 'data',
      name: '数据模态',
      color: '#10B981',
      metric: '秒级',
      metricLabel: '同步延迟',
      tags: ['实时比分', '回合数据', '球员统计'],
    },
  ],
  fusion: {
    title: '跨模态融合',
    detail: '注意力加权 · 时序对齐',
    latency: '28 ms',
  },
  scenes: [
    { name: '快攻上篮', score: '0.94', color: '#3B82F6' },
    { name: '跳起封盖', score: '0.89', color: '#8B5CF6' },
    { name: '篮下卡位', score: '0.91', color: '#10B981' },
    { name: '三分出手', score: '0.82', color: '#F59E0B' },
  ],
  note: '三路模态在 28ms 内完成单帧融合，场景标签直接驱动下游高光标记与自动剪辑',
}

export const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif"

export const PALETTE = {
  pageBg: '#F8F6F1',
  card: '#FFFFFF',
  cardBorder: 'rgba(27,36,50,0.14)',
  barBg: '#EEE9DF',
  headBg: '#F1EEE7',
  line: 'rgba(27,36,50,0.14)',
  track: 'rgba(27,36,50,0.07)',
  text: '#1B2432',
  muted: '#68727F',
  dim: '#9AA3AE',
  accent: '#B8791F',
  info: '#3B82F6',
}

export const tint = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
