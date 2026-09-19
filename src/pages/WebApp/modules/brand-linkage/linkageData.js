/**
 * 联动商家图谱 · 数据层
 *
 * 用途：为 PPT「业务概述」页「业务二 · 赛事营销服务」生成可替换的配图。
 * Logo 均为外部矢量源下载（Simple Icons / WorldVectorLogo），见 logoData.js。
 */

/** 画布尺寸：宽:高 ≈ 1.65:1 */
export const CANVAS = { width: 1600, height: 970 }

/** 统一字体栈（导出 PNG 走系统字体，不用 web font） */
export const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif"

/**
 * 背景主题：卡片一律白底，只有底色 / 文字 / 装饰线随主题变化
 */
export const BACKDROPS = {
  deep: {
    key: 'deep',
    name: '深蓝聚光',
    from: '#04122A',
    to: '#0A2A54',
    glow: '#F5C451',
    glowOpacity: 0.22,
    text: '#EAF2FF',
    muted: '#9DB6D6',
    line: 'rgba(140,190,255,0.22)',
    card: '#FFFFFF',
    cardText: '#0A2A54',
    cardMuted: '#5A6E8C',
    accent: '#F5C451',
    accentText: '#0A2A54',
  },
  ink: {
    key: 'ink',
    name: '墨黑金',
    from: '#0B0B0C',
    to: '#1A1509',
    glow: '#D4AF37',
    glowOpacity: 0.20,
    text: '#F6F2E7',
    muted: '#B6AC93',
    line: 'rgba(212,175,55,0.28)',
    card: '#F8F5ED',
    cardText: '#1A1509',
    cardMuted: '#6E6450',
    accent: '#D4AF37',
    accentText: '#1A1509',
  },
  light: {
    key: 'light',
    name: '浅色米白',
    from: '#F8F6F1',
    to: '#E8E2D6',
    glow: '#D4AF37',
    glowOpacity: 0.16,
    text: '#1B2432',
    muted: '#68727F',
    line: 'rgba(27,36,50,0.14)',
    card: '#FFFFFF',
    cardText: '#1B2432',
    cardMuted: '#68727F',
    accent: '#B8941F',
    accentText: '#FFFFFF',
  },
}

/** 商家品类 */
export const CATEGORIES = [
  { key: 'gear', name: '运动装备', color: '#F5C451', mode: '装备赞助' },
  { key: 'ball', name: '篮球器材', color: '#38BDF8', mode: '器材供应' },
  { key: 'guard', name: '运动防护', color: '#A78BFA', mode: '防护物资' },
  { key: 'drink', name: '运动饮品', color: '#34D399', mode: '补给赞助' },
  { key: 'style', name: '运动潮流', color: '#F472B6', mode: '潮流联名' },
]

/**
 * 联动商家（logo = logoData.js 里的 key）
 * @typedef {{ key: string, cn: string, en: string, category: string }} Merchant
 */
export const MERCHANTS = [
  { key: 'nike', cn: '耐克', en: 'Nike', category: 'gear', mode: '装备赞助' },
  { key: 'adidas', cn: '阿迪达斯', en: 'adidas', category: 'gear', mode: '球衣冠名' },
  { key: 'anta', cn: '安踏', en: 'ANTA', category: 'gear', mode: '训练装备' },
  { key: 'lining', cn: '李宁', en: 'LI-NING', category: 'gear', mode: '赛事用装' },
  { key: 'puma', cn: '彪马', en: 'PUMA', category: 'gear', mode: '潮流联名' },
  { key: 'underarmour', cn: '安德玛', en: 'Under Armour', category: 'gear', mode: '专业护装' },
  { key: 'molten', cn: '摩腾', en: 'molten', category: 'ball', mode: '比赛用球' },
  { key: 'spalding', cn: '斯伯丁', en: 'Spalding', category: 'ball', mode: '训练用球' },
  { key: 'wilson', cn: '威尔胜', en: 'Wilson', category: 'ball', mode: '器材供应' },
  { key: 'mcdavid', cn: '迈克达威', en: 'McDavid', category: 'guard', mode: '防护物资' },
  { key: 'redbull', cn: '红牛', en: 'Red Bull', category: 'drink', mode: '能量补给' },
  { key: 'gatorade', cn: '佳得乐', en: 'Gatorade', category: 'drink', mode: '场边补给' },
  { key: 'monster', cn: '魔爪', en: 'Monster', category: 'drink', mode: '赛事定制' },
  { key: 'converse', cn: '匡威', en: 'Converse', category: 'style', mode: '场外潮流' },
  { key: 'newbalance', cn: '新百伦', en: 'New Balance', category: 'style', mode: '跑训装备' },
]

export const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((item) => [item.key, item]))

export function merchantsOf(categoryKey) {
  return MERCHANTS.filter((item) => item.category === categoryKey)
}

export function categoryColor(merchant) {
  return CATEGORY_BY_KEY[merchant.category]?.color ?? '#F5C451'
}

/** 方案 B 环绕展示的 8 个代表 */
export const ORBIT_MERCHANTS = [
  'nike',
  'adidas',
  'anta',
  'lining',
  'molten',
  'mcdavid',
  'redbull',
  'puma',
]

/** 方案 C 展示的 6 个代表 */
export const FEATURED_MERCHANTS = ['nike', 'adidas', 'anta', 'molten', 'redbull', 'wilson']

/** 方案 B / C 的流量入口（文案取自 PPT 业务二原文） */
export const FLOW_SOURCES = [
  { title: '现场多机位直播', desc: '赛事短视频实时推送' },
  { title: '达人二次传播', desc: '头部 KOL 带话题 · 腰部 KOC 铺量' },
  { title: '私域社群触达', desc: '52 万私域用户' },
  { title: '智能剪辑分发', desc: '单场产出 200+ 条' },
]

/** 四条联动通道 */
export const LINKAGE_CHANNELS = ['品牌植入曝光', '直播口播下单', '商品链接挂载', '现场展位体验']

/** 商家反哺赛事 */
export const FEEDBACK_ITEMS = ['品牌冠名赞助', '装备物料支持', '奖品福利供给', '场地流量置换']

/** 标题栏统计 */
export const HEADLINE_STATS = [
  { value: '25', unit: '家', label: '长期合作品牌' },
  { value: '10.7w', unit: '人次', label: '赛事覆盖人次' },
  { value: '52', unit: '万', label: '私域流量池' },
]

export function merchantByKey(key) {
  return MERCHANTS.find((item) => item.key === key) ?? null
}
