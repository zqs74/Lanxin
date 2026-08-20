/**
 * 集锦追踪与评估模块 Mock 数据
 * 对应 5 张 UI：评估看板 / 短链生成 / 来源追踪 / 数据采集 / 数据关联分析
 * 数据自洽约定：总点击 12847 = 各渠道加总；有效 11932 = 12847 - 爬虫682 - 异常IP233
 */

export const EVALUATION_DATA = {
  videoTitle: '粤BA半决赛·张子轩三分绝杀',
  overallScore: 86,
  radarData: [
    { label: '基础流量', value: 92 },
    { label: '用户画像', value: 78 },
    { label: '行为深度', value: 85 },
    { label: '时间发布', value: 90 },
    { label: '传播路径', value: 81 }
  ],
  trend7: [
    { day: 1, plays: 15200, completion: 52, interaction: 2.8 },
    { day: 2, plays: 17400, completion: 55, interaction: 3.1 },
    { day: 3, plays: 16800, completion: 54, interaction: 2.9 },
    { day: 4, plays: 20600, completion: 58, interaction: 3.4 },
    { day: 5, plays: 22400, completion: 61, interaction: 3.8 },
    { day: 6, plays: 18900, completion: 60, interaction: 3.6 },
    { day: 7, plays: 17100, completion: 59, interaction: 3.5 }
  ],
  dimensions: [
    { key: 'traffic', label: '基础流量', icon: 'Users', value: 92, trend: 'up', pct: 15, advice: '播放量12.8万，传播广度优秀' },
    { key: 'persona', label: '用户画像', icon: 'FileText', value: 78, trend: 'up', pct: 6, advice: '18-25岁男性为主，画像清晰' },
    { key: 'behavior', label: '行为深度', icon: 'Clock', value: 85, trend: 'up', pct: 9, advice: '完播率61%，人均播放2.3次' },
    { key: 'timing', label: '时间发布', icon: 'Calendar', value: 90, trend: 'up', pct: 4, advice: '周五20点发布，命中时段峰值' },
    { key: 'path', label: '传播路径', icon: 'Share2', value: 81, trend: 'down', pct: 3, advice: '微信渗透强，抖音渠道待加强' }
  ],
  suggestions: [
    '建议发布时间：周五 20:00-22:00（历史完播率峰值时段）',
    '建议优先分发渠道：抖音 / 微信视频号（当前渗透率不足）'
  ]
};

export const HIGHLIGHTS = [
  { id: 'h1', title: '粤BA半决赛·张子轩三分绝杀', tournament: '粤BA', player: '张子轩#23', team: '东莞宏远', date: '2026-08-03', duration: '01:24', selected: true },
  { id: 'h2', title: '粤BA半决赛·李明超扣篮集锦', tournament: '粤BA', player: '李明超#7', team: '东莞宏远', date: '2026-08-03', duration: '00:58', selected: false },
  { id: 'h3', title: '莞篮新星·决赛十佳球', tournament: '莞篮新星', player: '陈浩#11', team: '广州猎豹', date: '2026-08-01', duration: '02:10', selected: false },
  { id: 'h4', title: '省青赛·王伟压哨三分', tournament: '省青赛', player: '王伟#5', team: '深圳先锋', date: '2026-07-30', duration: '00:46', selected: false },
  { id: 'h5', title: '城联赛·快攻反击配合', tournament: '城联赛', player: '赵磊#9', team: '中山雄狮', date: '2026-07-28', duration: '01:05', selected: false },
  { id: 'h6', title: '村BA·绝杀时刻', tournament: '村BA', player: '刘洋#3', team: '佛山龙腾', date: '2026-07-26', duration: '00:39', selected: false }
];

export const GENERATED_LINKS = [
  { id: 'g1', shortUrl: 'https://smty.tv/s/8K2x9', highlight: '粤BA半决赛·张子轩三分绝杀', channel: '微信 / 抖音', status: 'active', clicks: 12847, createdAt: '2026-08-03 20:12' },
  { id: 'g2', shortUrl: 'https://smty.tv/s/7Hq2p', highlight: '粤BA半决赛·李明超扣篮集锦', channel: '抖音', status: 'active', clicks: 8654, createdAt: '2026-08-03 20:15' },
  { id: 'g3', shortUrl: 'https://smty.tv/s/3Fn8m', highlight: '莞篮新星·决赛十佳球', channel: '视频号', status: 'paused', clicks: 3210, createdAt: '2026-08-01 19:40' }
];

export const SOURCE_DATA = {
  totalClicks: 12847,
  channels: [
    { name: '微信', pct: 35, color: 'ok' },
    { name: '抖音', pct: 28, color: 'danger' },
    { name: '微博', pct: 18, color: 'info' },
    { name: '直链', pct: 12, color: 'brand' },
    { name: '其他', pct: 7, color: 'purple' }
  ],
  flowData: {
    sources: [
      { id: 'wechat', label: '微信', value: 4496, color: 'ok' },
      { id: 'douyin', label: '抖音', value: 3597, color: 'danger' },
      { id: 'weibo', label: '微博', value: 2312, color: 'info' },
      { id: 'direct', label: '直链', value: 2442, color: 'brand' }
    ],
    actions: [
      { id: 'click', label: '点击短链' },
      { id: 'redirect', label: '302重定向', highlight: true }
    ],
    results: [
      { id: 'success', label: '成功播放', color: 'ok' },
      { id: 'fail', label: '跳转失败', color: 'danger' }
    ]
  },
  deviceSplit: [
    { name: '移动端', pct: 78 },
    { name: 'PC端', pct: 22 }
  ],
  regions: [
    { rank: 1, city: '东莞', clicks: 3892 },
    { rank: 2, city: '广州', clicks: 2541 },
    { rank: 3, city: '深圳', clicks: 1873 },
    { rank: 4, city: '中山', clicks: 956 },
    { rank: 5, city: '珠海', clicks: 624 }
  ],
  clickLogs: [
    { time: '20:23:10', channel: '微信', device: 'iPhone 15', ip: '113.118.5.24', region: '东莞', status: 'success', latency: 186 },
    { time: '20:23:08', channel: '抖音', device: 'Android', ip: '66.249.65.33', region: '广州', status: 'fail', latency: 5000 },
    { time: '20:23:05', channel: '微博', device: 'iPhone 14', ip: '120.231.8.12', region: '深圳', status: 'success', latency: 203 },
    { time: '20:23:02', channel: '直链', device: 'PC · Chrome', ip: '14.215.66.9', region: '东莞', status: 'success', latency: 312 },
    { time: '20:22:58', channel: '微信', device: 'Android', ip: '183.14.30.77', region: '中山', status: 'success', latency: 154 },
    { time: '20:22:54', channel: '抖音', device: 'iPhone 13', ip: '61.140.12.66', region: '珠海', status: 'success', latency: 242 }
  ]
};

export const COLLECTION_DATA = {
  stats: {
    totalClicks: 12847,
    validClicks: 11932,
    validPct: 93,
    spiderBlocked: 682,
    spiderUA: 537,
    spiderFreq: 145,
    ipBlocked: 233,
    ipHighFreq: 189,
    ipGeoJump: 44
  },
  liveLogs: [
    { time: '20:23:10', src: '微信', dev: 'iPhone 15', ip: '113.118.5.24', status: 'valid' },
    { time: '20:23:08', src: '未知', dev: 'Bot/spider', ip: '66.249.65.33', status: 'blocked', reason: '爬虫' },
    { time: '20:23:05', src: '微博', dev: 'iPhone 14', ip: '120.231.8.12', status: 'valid' },
    { time: '20:23:02', src: '直链', dev: 'PC·Chrome', ip: '14.215.66.9', status: 'valid' },
    { time: '20:22:58', src: '微信', dev: 'Android', ip: '183.14.30.77', status: 'valid' },
    { time: '20:22:54', src: '抖音', dev: 'iPhone 13', ip: '61.140.12.66', status: 'valid' },
    { time: '20:22:51', src: '小红书', dev: 'Android', ip: '210.32.77.18', status: 'valid' },
    { time: '20:22:47', src: '微信', dev: 'iPhone 12', ip: '113.66.22.101', status: 'valid' },
    { time: '20:22:43', src: '视频号', dev: 'Android', ip: '120.230.5.54', status: 'valid' },
    { time: '20:22:39', src: '抖音', dev: 'PC·Edge', ip: '183.12.209.7', status: 'valid' },
    { time: '20:22:35', src: '微信', dev: 'Android', ip: '36.152.88.91', status: 'valid' },
    { time: '20:22:31', src: '抖音', dev: 'iPhone 11', ip: '115.44.15.3', status: 'blocked', reason: '异常高频' },
    { time: '20:22:27', src: '微博', dev: 'PC·Chrome', ip: '220.181.108.91', status: 'valid' },
    { time: '20:22:23', src: '直链', dev: 'Android', ip: '120.244.88.2', status: 'valid' },
    { time: '20:22:19', src: '微信', dev: 'iPhone 15', ip: '14.215.177.38', status: 'valid' }
  ],
  filterRules: {
    spider: ['UA黑名单(Googlebot/Bingbot等)', '请求频率>60次/分钟', '无Referer头检测'],
    ip: ['同IP高频点击>100次/小时', 'IP地域突变检测', '代理池特征识别']
  },
  trend24h: [
    { hour: 0, raw: 260, cleaned: 242 },
    { hour: 1, raw: 170, cleaned: 158 },
    { hour: 2, raw: 115, cleaned: 107 },
    { hour: 3, raw: 78, cleaned: 73 },
    { hour: 4, raw: 62, cleaned: 58 },
    { hour: 5, raw: 55, cleaned: 51 },
    { hour: 6, raw: 76, cleaned: 71 },
    { hour: 7, raw: 122, cleaned: 113 },
    { hour: 8, raw: 262, cleaned: 244 },
    { hour: 9, raw: 460, cleaned: 428 },
    { hour: 10, raw: 590, cleaned: 549 },
    { hour: 11, raw: 525, cleaned: 488 },
    { hour: 12, raw: 681, cleaned: 633 },
    { hour: 13, raw: 566, cleaned: 526 },
    { hour: 14, raw: 624, cleaned: 580 },
    { hour: 15, raw: 698, cleaned: 649 },
    { hour: 16, raw: 755, cleaned: 702 },
    { hour: 17, raw: 854, cleaned: 794 },
    { hour: 18, raw: 1050, cleaned: 977 },
    { hour: 19, raw: 1190, cleaned: 1107 },
    { hour: 20, raw: 1306, cleaned: 1215 },
    { hour: 21, raw: 1116, cleaned: 1038 },
    { hour: 22, raw: 788, cleaned: 733 },
    { hour: 23, raw: 444, cleaned: 413 }
  ]
};

export default {
  EVALUATION_DATA,
  HIGHLIGHTS,
  GENERATED_LINKS,
  SOURCE_DATA,
  COLLECTION_DATA
};
