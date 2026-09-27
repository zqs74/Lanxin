/**
 * 视频素材库 · 数据层
 *
 * 对应 PPT「比赛视频 | 赛事影像覆盖 1000+ 场」那一页，做成**桌面软件操作界面**的样子
 * （与「多平台宣发」那张同一套窗口外观：标题栏 + 菜单栏 + 工具栏 + 左导航 + 内容区 + 状态栏）。
 *
 * 数字口径：素材总量 8740+ 条、宣发 10+ 主流平台取自 PPT 原文（"累计沉淀8740+条""宣发至10+主流平台"）；
 * 播放量、收藏数、存储占用等为**界面演示值**，换真实数改下面的 detail.stats 即可。
 * 9 张封面全部来自项目现有真实素材（见 items[].photo）。
 */
export const LIBRARY_CANVAS = { width: 1200, height: 700 }

export const LIBRARY_UI = {
  app: {
    name: '昇梦影像库',
    version: 'v3.1',
    user: '素材管理员账号已登录......',
  },
  menus: ['文件', '编辑', '素材', '收藏', '分发', '数据', '帮助'],
  tools: ['上传素材', '新建合辑', '加入宣发', '批量下载', '打标签'],
  search: '搜索标题 / 赛事 / 人物 / 标签',
  nav: [
    { name: '全部素材', count: '8740' },
    { name: '精彩集锦', count: '1268' },
    { name: '全场录像', count: '3120' },
    { name: '训练素材', count: '964' },
    { name: '采访花絮', count: '486', active: true },
    { name: '收藏夹', count: '128' },
    { name: '回收站', count: '36' },
  ],
  filters: ['全部', '粤BA', '村BA', '青少年', '女篮', '训练营'],
  sort: '按拍摄时间 ↓',
  items: [
    { photo: '/images/library/lib-01.jpg', title: '张宇辰 36 分全场高光', duration: '03:24', event: '粤BA', favorite: true, selected: true },
    { photo: '/images/library/lib-02.jpg', title: '绝杀三分 15 秒竖版', duration: '00:15', event: '粤BA', favorite: true },
    { photo: '/images/library/lib-03.jpg', title: '村BA 东莞赛区决赛', duration: '12:08', event: '村BA', favorite: false },
    { photo: '/images/library/lib-04.jpg', title: '青少年锦标赛半决赛', duration: '08:42', event: '青少年', favorite: false },
    { photo: '/images/library/lib-05.jpg', title: '女子锦标赛四川赛区', duration: '06:18', event: '女篮', favorite: true },
    { photo: '/images/library/lib-06.jpg', title: '主馆场地空镜', duration: '01:32', event: '场馆', favorite: false },
    { photo: '/images/library/lib-07.jpg', title: '颁奖仪式全景', duration: '04:05', event: '颁奖', favorite: true },
    { photo: '/images/library/lib-08.jpg', title: 'CBA 焦点战 现场机位', duration: '09:51', event: '职业', favorite: false },
    { photo: '/images/library/lib-09.jpg', title: '赛前发布会 主教练', duration: '05:37', event: '采访', favorite: false },
  ],
  detail: {
    title: '张宇辰 36 分全场高光',
    photo: '/images/library/lib-01.jpg',
    meta: '03:24 · 3840×2160 · 60 fps · H.265',
    tags: ['粤BA', '高光集锦', '张宇辰', '已调色'],
    stats: [
      { label: '播放', value: '6.8w' },
      { label: '收藏', value: '1,240' },
      { label: '已宣发', value: '8 平台' },
    ],
    favorite: true,
    primaryAction: '加入宣发',
    relatedTitle: '同类素材',
    related: ['张宇辰 末节 11 分 剪辑版', '粤BA 半决赛 G2 全场录像'],
  },
  status: {
    left: '共 8740 条素材 · 已选 1 条',
    right: '存储 2.4 TB · 今日新增 126 条',
  },
}
