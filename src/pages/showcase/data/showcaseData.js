/**
 * Showcase Homepage Data
 * Source: 昇梦体育8.17整合(1).pptx
 */

export const heroData = {
  logo: '/test.png',
  title: '昇梦体育',
  subtitle: '大众篮球赛事生态智慧运营领航者',
  description: '以AI技术为赛事各方提供服务 — 数字化办赛 · 球员成长规划 · 赛事流量运营',
  stats: [
    { label: '累计营收', value: '4557', unit: '万元' },
    { label: '服务赛事', value: '4852', unit: '场' },
    { label: '专业人员合作', value: '3162', unit: '人' },
    { label: '全平台曝光量', value: '50', unit: '亿+' },
    { label: '服务球员', value: '26', unit: '万人次' },
    { label: '球员成长档案', value: '16', unit: '万' },
  ],
};

export const galleryImages = [
  { src: '/images/showcase/case-game-action-01.png', alt: '赛事实拍', caption: '赛事实拍' },
  { src: '/images/showcase/case-villageba-ceremony.png', alt: '莞篮村BA', caption: '莞篮村BA' },
  { src: '/images/showcase/case-yueba-champion.png', alt: '粤BA联赛', caption: '粤BA联赛' },
  { src: '/images/showcase/case-game-action-02.jpeg', alt: '室内篮球赛', caption: '赛事实拍' },
  { src: '/images/showcase/case-brand-sandknit.png', alt: '森耐特品牌合作', caption: '品牌合作' },
  { src: '/images/showcase/case-youth-championship.jpeg', alt: '青少年冠军赛', caption: '青少年冠军赛' },
  { src: '/images/showcase/case-serbia-trip.jpeg', alt: '塞尔维亚国际交流', caption: '国际交流' },
];

export const businesses = [
  {
    id: 'competition',
    title: '三级赛事执行',
    subtitle: 'AI赋能高效精准办赛',
    image: '/images/showcase/map-guangdong-3d.png',
    imageAlt: '广东省3D地图',
    description: '省市级联赛 → 区县级联赛 → 村级联赛，以办赛服务为核心，建立标准化SOP 53项，联动赛事品牌28家',
    stats: [
      { label: '累计办赛', value: '4852', unit: '场' },
      { label: '办赛SOP', value: '53', unit: '项' },
      { label: '全网曝光', value: '50', unit: '亿+' },
      { label: '区县年办赛密度', value: '300', unit: '场+' },
    ],
    resources: [
      { label: '场馆资源库', value: '237个篮球场地' },
      { label: '赛事活动资源库', value: '新赛事方案采用率80%' },
      { label: '体育用品库', value: '1956张采购单，38家供应商' },
      { label: '人才库', value: '230名注册专业人员' },
    ],
    link: '/web?view=schedule',
    linkText: '了解赛事执行',
  },
  {
    id: 'growth',
    title: '球员成长规划',
    subtitle: '从赛场提取成长数据，科学规划',
    image: '/images/showcase/business-growth-coach.jpeg',
    imageAlt: '篮球训练营教练',
    description: '能力评估 → 赛事数据分析 → 规划导师团队 → 集训对接 → 个性化训练 → 效果跟踪 → 赛事推荐，打造高附加值成长服务',
    stats: [
      { label: '覆盖学员', value: '755', unit: '人' },
      { label: '人才输送率', value: '75', unit: '%' },
      { label: '复购转化率', value: '65', unit: '%' },
      { label: '人均收费', value: '1.21', unit: '万元' },
    ],
    resources: [
      { label: '合作训练基地', value: '巨人体育篮球中心、薪火阵营篮球训练中心' },
      { label: '合作赛事平台', value: '广东省青少年篮球冠军赛、莞篮新星、U系列篮球赛、宏远青少年篮球训练营' },
    ],
    link: '/web?view=ai',
    linkText: '了解成长规划',
  },
  {
    id: 'marketing',
    title: '赛事流量运营',
    subtitle: '品牌下沉基层赛事，兑现商业价值',
    image: '/images/showcase/partner-brand-board.png',
    imageAlt: '合作品牌展示板',
    description: '线上曝光造势 + 线下专题活动策划，多社媒平台同时宣发，KOL/KOC达人二次传播，品牌曝光与带货双轨并行',
    stats: [
      { label: '长期合作品牌', value: '28', unit: '家' },
      { label: 'KOL达人', value: '42', unit: '位' },
      { label: 'KOC达人', value: '730', unit: '+位' },
      { label: '单场平均曝光', value: '100', unit: '万+' },
      { label: '综合销售转化率', value: '6.8', unit: '%' },
      { label: '品牌营销额增长', value: '35', unit: '%' },
    ],
    resources: [
      { label: 'TOP3合作品牌营收', value: '森耐特512万、准者362万、强盟篮球架215万' },
    ],
    link: '/web?view=timeline',
    linkText: '了解流量运营',
  },
];

export const techSection = {
  architecture: {
    title: '大众篮球赛事全链路垂类大模型',
    image: '/images/showcase/tech-architecture.png',
    imageAlt: '全链路垂类大模型架构图',
    description: '输入即分析、分析即输出 — 业务应用层 → 数据处理层 → 平台支撑层 → 模型调用层',
    techStack: ['YOLO 11s', 'ByteTrack', 'RTMPose', 'Spring Boot', 'DeepSeek-V3', 'FFmpeg'],
    stats: [
      { label: '累计匹配', value: '8900', unit: '+人次' },
      { label: '累计输出报告', value: '3.2', unit: '万份' },
    ],
  },
  advantages: [
    {
      id: 'talent-match',
      title: '专业人才匹配库',
      subtitle: '为每场比赛提供最适配人员',
      description: '一人一档案，9个结构化标签，基础标签过滤 + 深度标签加权，36小时完成到岗',
      stats: [
        { label: '已入库', value: '1168', unit: '人' },
        { label: '匹配准确度', value: '97.7', unit: '%' },
      ],
      link: '/web?view=roster',
      linkText: '体验人才匹配',
    },
    {
      id: 'data-analysis',
      title: '运动数据分析中台',
      subtitle: '全链路赛事解析与球员智慧成长引擎',
      image: '/images/showcase/tech-ai-tracking.gif',
      imageAlt: 'AI多目标追踪演示',
      description: '多机位采集 → 目标检测 → 多目标追踪 → 动作识别 → 多维评估分析 → 数据产出，17类高光事件毫秒级识别',
      stats: [
        { label: '多目标追踪准确率', value: '98', unit: '%+' },
        { label: '累计服务球员', value: '2136', unit: '名' },
        { label: '数据采样率', value: '60', unit: '次/秒' },
      ],
      link: '/web?view=ai',
      linkText: '体验数据分析',
    },
    {
      id: 'video-marketing',
      title: '智能视频生产与营销中台',
      subtitle: '高光识别 → 自动剪辑 → 智能宣发 → 数据反哺',
      description: '自动检测进球/抢断/三分等关键动作，多版本自适应输出（横板/竖版/15s/30s/60s），自动叠加品牌水印，一键批量分发',
      comparison: [
        { metric: '个人集锦生成时间', before: '10分钟（人工）', after: '20秒（智能系统）' },
        { metric: '单场视频产出', before: '<10条', after: '200+条' },
      ],
      link: '/web?view=timeline',
      linkText: '体验视频营销',
    },
  ],
  barriers: {
    title: '技术壁垒',
    items: [
      { label: '软件著作权', value: '5项' },
      { label: '发明专利', value: '3项' },
      { label: '商标', value: '3个' },
      { label: '累计研发投入', value: '超440万' },
    ],
  },
};

export const cases = [
  {
    id: 'youth-championship',
    title: '广东省青少年篮球冠军赛',
    image: '/images/showcase/case-youth-championship.jpeg',
    imageAlt: '青少年篮球冠军赛现场',
    description: '广东省篮协主办，全省21个地市49支队伍，两周内108场比赛',
    highlights: [
      '创始人翁嘉祥主持现场，省篮协会长杜锋亲临指导',
      '资源统筹：36h输出Top3人选',
      '人才选拔：2分钟生成数据报告',
      '流量曝光：30min全量交付2862条视频，全域曝光破50亿',
    ],
    source: 'PPT Slide 27',
  },
  {
    id: 'yueba',
    title: '粤BA — 广东省城市篮球联赛',
    image: '/images/showcase/case-yueba-champion.png',
    imageAlt: '粤BA总冠军庆典',
    description: '28场比赛覆盖广东七个赛区，7天赛程',
    stats: [
      { label: '赛程', value: '7', unit: '天' },
      { label: '工作人员', value: '3696', unit: '名' },
      { label: '全网曝光', value: '1.2', unit: '亿' },
      { label: '赛事收入', value: '326', unit: '万元' },
    ],
    source: 'PPT Slide 29',
  },
  {
    id: 'sandknit',
    title: '赋能森耐特运动装备',
    image: '/images/showcase/case-brand-sandknit.png',
    imageAlt: '森耐特品牌篮球照',
    description: '1986-1990年NBA官方装备品牌，球员着赞助球服上场并拍摄锦集',
    stats: [
      { label: '品牌销量增长', value: '512', unit: '万元(+35%)' },
      { label: '全网品牌曝光', value: '超4.8', unit: '亿' },
      { label: '毛利率', value: '48.32', unit: '%' },
    ],
    source: 'PPT Slide 30',
  },
  {
    id: 'villageba',
    title: '莞篮村BA — 扎根基层',
    image: '/images/showcase/case-villageba-ceremony.png',
    imageAlt: '莞篮村BA颁奖典礼',
    description: '从村级赛事起步，累计服务赛事1021场，覆盖26个镇街',
    stats: [
      { label: '累计服务赛事', value: '1021', unit: '场' },
      { label: '覆盖镇街', value: '26', unit: '个' },
      { label: '服务球员', value: '20615', unit: '人次' },
    ],
    source: 'PPT Slide 24',
  },
  {
    id: 'national-coverage',
    title: '全国36城轻量化服务',
    description: '七年时间业务落地全国36座城市',
    highlights: [
      '3日定制合同 · 7天派遣落地',
      '派遣6852人次，服务1523场次',
      '典型赛事：2021-2022赛季NYBO青少年篮球公开赛、2026全国女子篮球锦标赛、2026第十届粤澳杯男子篮球赛',
    ],
    source: 'PPT Slide 25',
  },
  {
    id: 'zhang-yuchen',
    title: '张宇辰球员成长案例',
    description: 'CHBL男子组最有价值成员',
    highlights: [
      '2019青协杯AI筛选锁定',
      '2022塞尔维亚集训',
      '2023 U17世界杯，500余名球员中通过数据分析中台锁定',
      '入选U17国家男篮集训队',
      'U17世界杯三分12投6中砍下20分6篮板6助攻',
    ],
    source: 'PPT Slide 28',
  },
];

export const recognitionData = {
  title: '行业认可',
  image: '/images/showcase/recognition-villageba.jpeg',
  imageAlt: '行业专家认可',
  experts: [
    { name: '杜锋', title: '广东省篮协会长', quote: '深入一线观摩，指导团队优化赛事落地模式' },
    { name: '朱芳雨', title: '广东宏远俱乐部总经理', quote: '亲切交流指导，寄语团队深耕群众篮球赛道' },
    { name: '宋涛', title: '中国篮球NBA第一人', quote: '携手共谋发展，为项目落地纾困' },
    { name: '万圣伟、李群', title: '前CBA球员', quote: '亲临赛场助阵，助力团队激活大众篮球赛事生态' },
  ],
};

export const mediaData = {
  title: '主流媒体报道',
  images: [
    { src: '/images/showcase/media-gdtv.jpeg', alt: '广东体育频道转播粤BA开幕式' },
    { src: '/images/showcase/media-people-daily.png', alt: '人民日报客户端报道粤BA' },
  ],
  highlights: [
    'CCTV1、CCTV5聚焦粤BA地方城市篮球联赛',
    '人民日报、新华社、央视体育等中央主流媒体报道，累计超500次主流媒体报道',
    '累计超10亿次自媒体传播',
    '省委书记黄坤明、广东省副省长李运出席粤BA现场',
  ],
};

export const partnerData = {
  title: '合作伙伴',
  subtitle: '28家长期合作品牌',
  mainImage: '/images/showcase/partner-brand-board.png',
  mainImageAlt: '合作品牌展示板',
  logos: [
    '/images/resources/media/media-sina.png',
    '/images/resources/media/media-xinhua.png',
    '/images/resources/media/media-qq.png',
    '/images/resources/media/media-yangshipin.png',
    '/images/resources/media/media-nfplus.png',
    '/images/resources/media/media-lizhi.png',
  ],
};
