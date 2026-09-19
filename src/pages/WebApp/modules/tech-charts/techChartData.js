/**
 * 技术优势配图 · 数据层
 *
 * 两张图分别对应 PPT 的标识文字，做成「真实系统界面」的样子：
 *   1. 技术优势二 →「赛事高光智能识别技术拆解」：实时识别界面（画面 + 检测框 + 高光标记列表 + 多模态状态）
 *   2. 技术优势三 →「Step4 数据产出」：三个产物窗口（数据看板 / 训练建议 / 成长档案）
 * 文案与数字取自 PPT 原文（昇梦体育9.18整合.pdf 第 17、18 页），人名沿用项目里的球员/裁判。
 */

/** 图 1（高光识别实时界面）横版 */
export const HIGHLIGHT_CANVAS = { width: 1000, height: 660 }
/** 图 2（Step4 数据产出）竖版 —— 对应 PPT 里那个竖长的框 */
export const OUTPUT_CANVAS = { width: 700, height: 1000 }

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
  ok: '#0E9F6E',
  info: '#3B82F6',
  purple: '#8B5CF6',
  videoBg: '#0E1B2C',
}

/** 图 1 · 赛事高光智能识别（实时界面） */
export const HIGHLIGHT_UI = {
  title: '赛事高光智能识别技术拆解',
  subtitle: '多模态场景识别 → 高光时刻标记，全流程实时完成',
  panel: '赛事高光智能识别 · 实时监控',
  video: '/images/showcase/case-game-action-01.png',
  videoTag: '东莞 vs 长安 · 第三节',
  timecode: '03:24 / 48:00',
  detection: { label: '三分球', score: '0.94' },
  modalities: [
    { name: '画面识别', value: '28 fps', ok: true },
    { name: '音频识别', value: '哨声/解说', ok: true },
    { name: '数据同步', value: '比分 62:58', ok: true },
  ],
  events: [
    { time: '03:24', type: '三分球', player: '张宇辰', score: '0.94', status: '已标记' },
    { time: '07:51', type: '抢断', player: '陈俊豪', score: '0.91', status: '已标记' },
    { time: '12:08', type: '盖帽', player: '李昊然', score: '0.88', status: '已标记' },
    { time: '18:33', type: '助攻', player: '周宇诚', score: '0.86', status: '已标记' },
    { time: '24:05', type: '扣篮', player: '张宇辰', score: '0.83', status: '标记中' },
  ],
  stats: [
    { value: '4379', unit: '场', label: '真实赛场视频' },
    { value: '1.2', unit: '亿帧', label: '标注画面素材' },
    { value: '10', unit: '万条', label: '篮球爆款视频' },
    { value: '5', unit: '亿+', label: '累计曝光' },
  ],
  note: '高光剪辑耗时：人工逐帧回看 60 分钟 → AI 识别定位 3 分钟',
}

/** 图 2 · Step4 数据产出（三个产物窗口） */
export const OUTPUT_UI = {
  title: 'Step4 · 数据产出',
  subtitle: '全链路自动化，一键生成视频与分析，耗时仅 10 分钟',
  windows: [
    {
      key: 'dashboard',
      name: '可视化数据看板',
      color: '#3B82F6',
      kpis: [
        { label: '得分', value: '36' },
        { label: '命中率', value: '57.5%' },
        { label: '效率值', value: '32' },
      ],
      bars: [
        { label: '得分', value: 36, max: 40 },
        { label: '篮板', value: 10, max: 40 },
        { label: '助攻', value: 8, max: 40 },
        { label: '抢断', value: 3, max: 40 },
      ],
      rows: [
        { name: '张宇辰', value: '36 分 · 57.5%' },
        { name: '陈俊豪', value: '24 分 · 51.2%' },
      ],
      footer: '17 类高光事件 · 得分 / 命中率核心效率统计',
    },
    {
      key: 'advice',
      name: '个性化训练建议',
      color: '#8B5CF6',
      items: [
        { name: '投篮稳定性', cycle: '4 周 · 每周 3 次', tag: '优先' },
        { name: '核心力量', cycle: '6 周 · 每周 2 次', tag: '进行中' },
        { name: '脚步移动', cycle: '3 周 · 每周 2 次', tag: '待开始' },
        { name: '体能耐力', cycle: '8 周 · 每周 4 次', tag: '待开始' },
        { name: '对抗终结', cycle: '4 周 · 每周 3 次', tag: '待开始' },
      ],
      footer: '对标中国篮协技术与体能测试标准',
    },
    {
      key: 'archive',
      name: '球员长期个人成长档案',
      color: '#10B981',
      series: [
        { label: '3月', value: 12.4 },
        { label: '4月', value: 13.6 },
        { label: '5月', value: 14.2 },
        { label: '6月', value: 13.8 },
        { label: '7月', value: 16.4 },
        { label: '8月', value: 18.9 },
      ],
      footer: '一赛季一档案 · 每年订阅人数超 500',
    },
  ],
  stats: [
    { value: '10w+', unit: '分钟', label: '赛事视频分析' },
    { value: '8.2w', unit: '人', label: '服务球员数量' },
  ],
  note: '数据准确度提升至 95% · 评估模型对标《中国篮球协会 2025 年技术与体能测试数据分析报告》',
}
