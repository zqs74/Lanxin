/**
 * 多平台宣发 · 数据层
 *
 * 对应 PPT「赛事宣发」页右侧「多平台宣发」那一格，做成**桌面软件操作界面**的样子
 * （左边那格是剪辑系统截图，这张就照那个路数：标题栏 + 菜单栏 + 工具栏 + 左导航 + 表格 + 账号栏 + 状态栏）。
 *
 * 数字口径：播放量沿用 tech-charts 里那套演示数据（张宇辰高光 6.8w 触达等）；
 * 各平台粉丝数为**界面演示值**，换真实数据改下面的 accounts 即可。
 */
export const PROMO_CANVAS = { width: 1200, height: 700 }

export const PROMO_UI = {
  app: {
    name: '昇梦宣发助手',
    version: 'v2.4',
    user: '运营者账号已登录......',
  },
  menus: ['文件', '编辑', '素材', '账号', '发布', '数据', '帮助'],
  tools: ['新建发布任务', '一键分发', '定时发布', '内容模板', '水印设置'],
  search: '搜索内容 / 任务 / 账号',
  nav: [
    { name: '内容库', count: '128' },
    { name: '发布任务', count: '12', active: true },
    { name: '账号矩阵', count: '8' },
    { name: '素材中心', count: '36' },
    { name: '数据看板', count: '' },
    { name: '系统设置', count: '' },
  ],
  columns: ['内容标题', '渠道', '状态', '发布时间', '播放量'],
  tasks: [
    { title: '张宇辰 36 分全场高光', channels: '6 个', state: '已发布', tone: 'ok', time: '08-20 20:00', views: '6.8w' },
    { title: '粤BA 半决赛 G2 集锦', channels: '5 个', state: '已发布', tone: 'ok', time: '08-21 12:00', views: '4.2w' },
    { title: '绝杀三分 15 秒竖版', channels: '8 个', state: '发布中', tone: 'doing', time: '08-21 19:30', views: '-', selected: true },
    { title: '赛后采访 · 主教练', channels: '4 个', state: '排期中', tone: 'wait', time: '08-22 10:00', views: '—' },
    { title: '决赛预告片 30 秒', channels: '8 个', state: '草稿', tone: 'dim', time: '—', views: '—' },
  ],
  detail: {
    title: '发布详情 · 绝杀三分 15 秒竖版',
    progress: '5 / 8 已投递',
    percent: 62,
    chips: [
      { name: '抖音', done: true },
      { name: '视频号', done: true },
      { name: '小红书', done: true },
      { name: 'B 站', done: true },
      { name: '微博', done: true },
      { name: '快手', done: false },
      { name: '公众号', done: false },
      { name: '淘宝逛逛', done: false },
    ],
  },
  accounts: [
    { name: '抖音', handle: '@昇梦体育', fans: '12.4w', color: '#111827', online: true },
    { name: '视频号', handle: '昇梦体育', fans: '8.6w', color: '#12A150', online: true },
    { name: '小红书', handle: '@昇梦体育', fans: '3.2w', color: '#E23B3B', online: true },
    { name: 'B 站', handle: '@昇梦体育', fans: '1.8w', color: '#2A9BD8', online: true },
    { name: '微博', handle: '@昇梦体育', fans: '5.4w', color: '#E08A1E', online: true },
    { name: '快手', handle: '@昇梦体育', fans: '2.1w', color: '#E4572E', online: true },
    { name: '公众号', handle: '昇梦体育', fans: '6.8w', color: '#1AAD19', online: true },
    { name: '淘宝逛逛', handle: '昇梦体育', fans: '9000', color: '#FF6A00', online: false },
  ],
  status: {
    left: '就绪 · 上次同步 12 秒前',
    right: '8 个渠道在线 · 队列 3 个任务',
  },
}
