export const STUDIO_STORAGE_KEY = 'webapp-ppt-studio-v1'
export const STUDIO_DOCUMENT_VERSION = 2
export const STUDIO_CANVAS = {
  width: 1600,
  height: 900,
  background: '#f8fafc',
  gridSize: 8,
}

const PLAYER_PHOTO =
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80'

function createId(prefix = 'el') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function createBaseElement(type, name, frame, extra = {}) {
  return {
    id: createId(type),
    type,
    name,
    frame,
    zIndex: extra.zIndex ?? 1,
    style: extra.style ?? {},
    data: extra.data ?? {},
    subLayout: extra.subLayout ?? {},
  }
}

function createPageId() {
  return createId('page')
}

export function cloneStudioDocument(document) {
  return JSON.parse(JSON.stringify(document))
}

export function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function getStudioTimestamp() {
  return new Date().toISOString()
}

function playerCardElement() {
  return createBaseElement(
    'playerCard',
    '球员信息卡',
    { x: 72, y: 120, w: 720, h: 260 },
    {
      zIndex: 3,
      style: {
        background: '#ffffff',
        borderColor: '#d7dbe3',
        borderWidth: 2,
        radius: 28,
        opacity: 1,
        shadow: '0 18px 38px rgba(15,23,42,0.12)',
        textColor: '#161616',
        accentColor: '#0f2a5a',
        secondaryColor: '#d7b45f',
        mutedColor: '#64748b',
      },
      data: {
        name: '张子轩',
        number: '#23',
        role: '后卫',
        age: '15岁',
        height: '175cm',
        hometown: '北京',
        team: '昕梦 U15',
        enrolledAt: '2023-09',
        footerTag: '资质挖掘培养',
        badge: 'U15',
        roleEn: 'GUARD',
        photoUrl: PLAYER_PHOTO,
      },
      subLayout: {
        photoFrame: { x: 0, y: 0, visible: true },
        nameBlock: { x: 0, y: 0, visible: true, fontSize: 42, color: '#161616' },
        numberBlock: { x: 0, y: 0, visible: true, fontSize: 40, color: '#161616' },
        infoBlock: { x: 0, y: 0, visible: true, fontSize: 18, color: '#1f2937' },
        footerTag: { x: 0, y: 0, visible: true, fontSize: 16, color: '#d7b45f' },
      },
    }
  )
}

function growthChartElement() {
  return createBaseElement(
    'growthChart',
    '成长曲线',
    { x: 72, y: 416, w: 516, h: 340 },
    {
      zIndex: 2,
      style: {
        background: '#ffffff',
        borderColor: '#d8dee8',
        borderWidth: 0,
        radius: 26,
        opacity: 1,
        textColor: '#334155',
        accentColor: '#2f79c8',
        secondaryColor: '#76a84e',
        gridColor: 'rgba(148,163,184,0.22)',
        shadow: '0 0 0 rgba(0,0,0,0)',
      },
      data: {
        title: '成长曲线',
        labels: ['1月', '3月', '6月', '9月', '12月'],
        series: [
          { name: '爆发成长', color: '#2f79c8', values: [13, 35, 55, 85, 100] },
          { name: '基础能力', color: '#76a84e', values: [25, 28, 45, 45, 41] },
        ],
      },
      subLayout: {
        title: { x: 0, y: 0, visible: true, fontSize: 26, color: '#0f172a' },
        valueLabels: { x: 0, y: 0, visible: true, fontSize: 14, color: '#334155' },
        monthLabels: { x: 0, y: 0, visible: true, fontSize: 14, color: '#475569' },
      },
    }
  )
}

function radarChartElement() {
  return createBaseElement(
    'radarChart',
    '技能雷达图',
    { x: 624, y: 416, w: 424, h: 340 },
    {
      zIndex: 2,
      style: {
        background: '#ffffff',
        borderColor: '#d8dee8',
        borderWidth: 0,
        radius: 26,
        opacity: 1,
        textColor: '#1f2937',
        accentColor: '#2f79c8',
        secondaryColor: '#d4af37',
        gridColor: 'rgba(59,130,246,0.2)',
      },
      data: {
        title: '技能雷达图',
        metrics: [
          { label: '投篮', current: 85, previous: 28 },
          { label: '篮板', current: 70, previous: 24 },
          { label: '防守', current: 75, previous: 22 },
          { label: '控球', current: 80, previous: 20 },
          { label: '体能', current: 90, previous: 26 },
        ],
        legendPrevious: '以前能力值',
        legendCurrent: '学员当前能力值',
      },
      subLayout: {
        title: { x: 0, y: 0, visible: true, fontSize: 28, color: '#0f172a' },
        metricLabels: { x: 0, y: 0, visible: true, fontSize: 22, color: '#1f2937' },
        valueLabels: { x: 0, y: 0, visible: true, fontSize: 18, color: '#334155' },
        legend: { x: 0, y: 0, visible: true, fontSize: 14, color: '#334155' },
      },
    }
  )
}

function barChartElement() {
  return createBaseElement(
    'barChart',
    '数据对比',
    { x: 1084, y: 416, w: 444, h: 340 },
    {
      zIndex: 2,
      style: {
        background: '#ffffff',
        borderColor: '#d8dee8',
        borderWidth: 0,
        radius: 26,
        opacity: 1,
        textColor: '#1f2937',
        accentColor: '#2f79c8',
        secondaryColor: '#f26a4b',
        mutedColor: '#76a84e',
      },
      data: {
        title: '数据对比',
        categories: ['场均得分', '场均篮板', '场均助攻'],
        legends: ['张子轩 #23', '班级平均', '优秀组别'],
        groups: [
          { label: '场均得分', values: [15.2, 10.5, 18.0], max: 20 },
          { label: '场均篮板', values: [8.1, 5.5, 10.0], max: 12 },
          { label: '场均助攻', values: [4.3, 4.5, 9.1], max: 10 },
        ],
      },
      subLayout: {
        title: { x: 0, y: 0, visible: true, fontSize: 26, color: '#0f172a' },
        valueLabels: { x: 0, y: 0, visible: true, fontSize: 14, color: '#334155' },
        categoryLabels: { x: 0, y: 0, visible: true, fontSize: 15, color: '#1f2937' },
        legend: { x: 0, y: 0, visible: true, fontSize: 14, color: '#475569' },
      },
    }
  )
}

function dataTableElement() {
  return createBaseElement(
    'dataTable',
    '基础数据表',
    { x: 832, y: 120, w: 696, h: 260 },
    {
      zIndex: 2,
      style: {
        background: '#ffffff',
        borderColor: '#d7dbe3',
        borderWidth: 1,
        radius: 24,
        opacity: 1,
        textColor: '#1f2937',
        accentColor: '#f8fafc',
        secondaryColor: '#475569',
        mutedColor: '#94a3b8',
      },
      data: {
        title: '基础数据表',
        columns: ['球员', '得分', '篮板', '助攻', '效率值'],
        rows: [
          ['张子轩', '24', '8', '6', '31'],
          ['赵启航', '18', '9', '4', '24'],
          ['李景灿', '15', '5', '7', '20'],
        ],
      },
      subLayout: {
        title: { x: 0, y: 0, visible: true, fontSize: 22, color: '#0f172a' },
        header: { x: 0, y: 0, visible: true, fontSize: 14, color: '#475569' },
        body: { x: 0, y: 0, visible: true, fontSize: 16, color: '#1f2937' },
      },
    }
  )
}

function titleTextElement() {
  return createBaseElement(
    'titleText',
    '主标题',
    { x: 72, y: 48, w: 480, h: 56 },
    {
      zIndex: 5,
      style: {
        background: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        radius: 0,
        opacity: 1,
        textColor: '#0f172a',
        fontSize: 38,
        fontWeight: 900,
        textAlign: 'left',
      },
      data: {
        text: '青训球员成长页',
      },
      subLayout: {
        text: { x: 0, y: 0, visible: true, fontSize: 38, color: '#0f172a' },
      },
    }
  )
}

function bodyTextElement() {
  return createBaseElement(
    'bodyText',
    '说明文本',
    { x: 72, y: 100, w: 420, h: 32 },
    {
      zIndex: 5,
      style: {
        background: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        radius: 0,
        opacity: 1,
        textColor: '#64748b',
        fontSize: 18,
        fontWeight: 600,
        textAlign: 'left',
      },
      data: {
        text: '机构 / 教练端单页素材 · 编辑模式',
      },
      subLayout: {
        text: { x: 0, y: 0, visible: true, fontSize: 18, color: '#64748b' },
      },
    }
  )
}

function badgeElement() {
  return createBaseElement(
    'badge',
    '徽章标签',
    { x: 1350, y: 54, w: 120, h: 38 },
    {
      zIndex: 5,
      style: {
        background: '#0f2a5a',
        borderColor: '#0f2a5a',
        borderWidth: 1,
        radius: 999,
        opacity: 1,
        textColor: '#ffffff',
        fontSize: 15,
        fontWeight: 700,
        textAlign: 'center',
      },
      data: {
        text: '重点培养',
      },
      subLayout: {
        text: { x: 0, y: 0, visible: true, fontSize: 15, color: '#ffffff' },
      },
    }
  )
}

function colorBlockElement() {
  return createBaseElement(
    'colorBlock',
    '色块',
    { x: 1230, y: 64, w: 92, h: 12 },
    {
      zIndex: 1,
      style: {
        background: '#d4af37',
        borderColor: '#d4af37',
        borderWidth: 0,
        radius: 999,
        opacity: 1,
        textColor: '#ffffff',
      },
      data: {
        text: '',
      },
      subLayout: {
        text: { x: 0, y: 0, visible: false, fontSize: 12, color: '#ffffff' },
      },
    }
  )
}

function dividerElement() {
  return createBaseElement(
    'divider',
    '分隔线',
    { x: 72, y: 394, w: 1456, h: 2 },
    {
      zIndex: 1,
      style: {
        background: '#e2e8f0',
        borderColor: '#e2e8f0',
        borderWidth: 0,
        radius: 999,
        opacity: 1,
      },
      data: {
        direction: 'horizontal',
      },
      subLayout: {},
    }
  )
}

function imageFrameElement() {
  return createBaseElement(
    'imageFrame',
    '图片框',
    { x: 1320, y: 48, w: 160, h: 180 },
    {
      zIndex: 2,
      style: {
        background: '#ffffff',
        borderColor: '#cbd5e1',
        borderWidth: 2,
        radius: 24,
        opacity: 1,
        textColor: '#64748b',
      },
      data: {
        imageUrl: PLAYER_PHOTO,
        caption: '主视觉球员照',
      },
      subLayout: {
        caption: { x: 0, y: 0, visible: true, fontSize: 14, color: '#64748b' },
        image: { x: 0, y: 0, visible: true },
      },
    }
  )
}

export const STUDIO_TEMPLATE_BUILDERS = {
  playerCard: playerCardElement,
  growthChart: growthChartElement,
  radarChart: radarChartElement,
  barChart: barChartElement,
  dataTable: dataTableElement,
  titleText: titleTextElement,
  bodyText: bodyTextElement,
  badge: badgeElement,
  colorBlock: colorBlockElement,
  divider: dividerElement,
  imageFrame: imageFrameElement,
}

export const STUDIO_ASSET_LIBRARY = [
  {
    title: '图表 / 卡片',
    items: [
      { type: 'playerCard', label: '球员信息卡', description: '大卡片 · 人物主信息' },
      { type: 'growthChart', label: '成长曲线', description: '折线图 · 近阶段趋势' },
      { type: 'radarChart', label: '技能雷达图', description: '能力五维 · 当前 / 以前' },
      { type: 'barChart', label: '数据对比', description: '柱状图 · 三组对比' },
      { type: 'dataTable', label: '基础数据表', description: '表格 · 多字段明细' },
    ],
  },
  {
    title: '基础组件',
    items: [
      { type: 'titleText', label: '主标题', description: '大字标题' },
      { type: 'bodyText', label: '说明文本', description: '小段说明' },
      { type: 'badge', label: '徽章标签', description: '圆角标签' },
      { type: 'colorBlock', label: '色块', description: '纯色装饰块' },
      { type: 'divider', label: '分隔线', description: '横 / 竖线条' },
      { type: 'imageFrame', label: '图片框', description: '可换图的容器' },
    ],
  },
]

export function createStudioElement(type) {
  const builder = STUDIO_TEMPLATE_BUILDERS[type]
  if (!builder) {
    throw new Error(`Unknown studio element type: ${type}`)
  }
  return builder()
}

function createDefaultElements() {
  return [
    titleTextElement(),
    bodyTextElement(),
    colorBlockElement(),
    badgeElement(),
    dividerElement(),
    playerCardElement(),
    dataTableElement(),
    growthChartElement(),
    radarChartElement(),
    barChartElement(),
  ].map((element, index) => ({
    ...element,
    zIndex: index + 1,
  }))
}

export function sortElementsByZIndex(elements) {
  return [...elements].sort((left, right) => left.zIndex - right.zIndex)
}

export function normalizeElementOrder(elements) {
  return sortElementsByZIndex(elements).map((element, index) => ({
    ...element,
    zIndex: index + 1,
  }))
}

export function getNextZIndex(elements) {
  return elements.reduce((max, element) => Math.max(max, element.zIndex), 0) + 1
}

export function createDefaultStudioPage(name = '画布 1') {
  return {
    id: createPageId(),
    name,
    canvas: {
      ...STUDIO_CANVAS,
    },
    elements: createDefaultElements(),
  }
}

export function createEmptyStudioPage(name = '新建画布') {
  return {
    id: createPageId(),
    name,
    canvas: {
      ...STUDIO_CANVAS,
    },
    elements: [],
  }
}

export function createDefaultStudioDocument() {
  const page = createDefaultStudioPage('画布 1')
  return {
    documentMeta: {
      version: STUDIO_DOCUMENT_VERSION,
      name: 'PPT 内容绘制区草稿',
      updatedAt: getStudioTimestamp(),
      mode: 'edit',
    },
    pages: [page],
    activePageId: page.id,
  }
}

export function getActivePage(studio) {
  return studio.pages.find((page) => page.id === studio.activePageId) ?? studio.pages[0] ?? null
}

export function insertElementAtCenter(page, type) {
  const element = createStudioElement(type)
  element.zIndex = getNextZIndex(page.elements)
  element.frame.x = Math.round((page.canvas.width - element.frame.w) / 2)
  element.frame.y = Math.round((page.canvas.height - element.frame.h) / 2)
  return element
}

function migrateLegacyDocument(document) {
  const defaultState = createDefaultStudioDocument()
  const page = {
    id: createPageId(),
    name: '画布 1',
    canvas: {
      ...STUDIO_CANVAS,
      ...(document.canvas ?? {}),
    },
    elements: normalizeElementOrder(document.elements ?? []),
  }

  return {
    ...defaultState,
    documentMeta: {
      ...defaultState.documentMeta,
      name: document.documentMeta?.name ?? defaultState.documentMeta.name,
      updatedAt: document.documentMeta?.updatedAt ?? defaultState.documentMeta.updatedAt,
      mode: document.documentMeta?.mode ?? defaultState.documentMeta.mode,
    },
    pages: [page],
    activePageId: page.id,
  }
}

export function ensureDocumentCompatibility(document) {
  if (!document) {
    return createDefaultStudioDocument()
  }

  if (document.documentMeta?.version === 1 && Array.isArray(document.elements)) {
    return migrateLegacyDocument(document)
  }

  if (document.documentMeta?.version !== STUDIO_DOCUMENT_VERSION || !Array.isArray(document.pages)) {
    return createDefaultStudioDocument()
  }

  const pages = document.pages
    .filter((page) => page && page.id)
    .map((page, index) => ({
      id: page.id,
      name: page.name || `画布 ${index + 1}`,
      canvas: {
        ...STUDIO_CANVAS,
        ...(page.canvas ?? {}),
      },
      elements: normalizeElementOrder(page.elements ?? []),
    }))

  if (!pages.length) {
    return createDefaultStudioDocument()
  }

  const activePageId = pages.some((page) => page.id === document.activePageId)
    ? document.activePageId
    : pages[0].id

  return {
    documentMeta: {
      version: STUDIO_DOCUMENT_VERSION,
      name: document.documentMeta?.name ?? 'PPT 内容绘制区草稿',
      updatedAt: document.documentMeta?.updatedAt ?? getStudioTimestamp(),
      mode: document.documentMeta?.mode ?? 'edit',
    },
    pages,
    activePageId,
  }
}
