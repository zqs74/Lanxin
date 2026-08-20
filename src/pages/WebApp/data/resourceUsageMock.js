import { MATCHES } from './scheduleMock.js'

export const RESOURCE_CATEGORIES = [
  { id: 'cat1', name: '人力资源', icon: 'Users', unit: '人', desc: '裁判/记录台/医护/志愿者/安保/保洁/运营等赛事工作人员' },
  { id: 'cat2', name: '场地资源', icon: 'Building2', unit: '间', desc: '篮球馆/副馆/训练场/发布会场/媒体室/热身场/更衣室等' },
  { id: 'cat3', name: '物料资源', icon: 'Package', unit: '件', desc: '篮球/记分牌/24秒器/篮架/奖杯/奖牌/球衣/T恤/矿泉水/Gatorade补给等' },
  { id: 'cat4', name: '供应商/外包', icon: 'Truck', unit: '项', desc: '直播方/转播车/摄影团队/灯光音响/保洁/安保外包/医疗外包/餐饮等' },
  { id: 'cat5', name: '媒体/宣传', icon: 'Megaphone', unit: '家', desc: '电视台/报纸/官网/微信公众号/抖音/B站/微博/KOL/摄影记者/文字记者' }
]

const OWNER_NAMES = [
  '张伟', '王芳', '李娜', '刘强', '陈静', '杨勇', '赵敏', '黄磊',
  '周杰', '吴婷', '徐亮', '孙丽', '马俊', '朱琳', '胡斌', '郭超',
  '何勇', '罗琳', '梁晨', '宋佳', '唐磊', '韩雪', '冯涛', '董明',
  '萧然', '程亮', '曹阳', '袁鹏', '邓辉', '许莉', '傅强', '沈悦',
  '曾磊', '彭娟', '吕刚', '苏敏', '蒋文', '蔡琴', '贾斌', '丁宁',
  '魏宁', '薛梅', '叶青', '阎鑫', '余波', '潘艳', '杜健', '戴莉',
  '钟鸣', '田甜'
]

function randomPhone() {
  const prefixes = ['138', '139', '150', '151', '152', '158', '159', '182', '183', '186', '187', '188', '189', '198', '199']
  const p = prefixes[Math.floor(Math.random() * prefixes.length)]
  const mid = String(Math.floor(1000 + Math.random() * 9000))
  const suf = String(Math.floor(1000 + Math.random() * 9000))
  return `${p} ${mid} ${suf}`
}

function randomOwner() {
  return OWNER_NAMES[Math.floor(Math.random() * OWNER_NAMES.length)]
}

function randomDateRecent() {
  const now = new Date('2025-10-26T10:00:00Z')
  const offsetDays = Math.floor(Math.random() * 7)
  const offsetHours = Math.floor(Math.random() * 12)
  const offsetMins = Math.floor(Math.random() * 60)
  const d = new Date(now.getTime() - offsetDays * 86400000 - offsetHours * 3600000 - offsetMins * 60000)
  return d.toISOString()
}

function pad(n, w = 3) {
  return String(n).padStart(w, '0')
}

const RESOURCES = []
let rid = 1

function pushResource(cat) {
  const r = { ...cat }
  r.id = 'r' + rid++
  RESOURCES.push(r)
  return r
}

const CAT1_HR_NAMES = [
  '主裁判', '第一副裁', '第二副裁', '技术代表', '记录台长', '计时员', '24秒计时员A', '24秒计时员B',
  '记录员', '记分员', '宣告员', '医生A', '医生B', '医生C', '医生D', '医生E', '医生F', '医生G', '医生H',
  '护士A', '护士B', '护士C', '护士D', '护士E', '护士F', '救护车司机A', '急救员A', '急救员B', '急救员C',
  '志愿者领队A', '志愿者领队B', '志愿者领队C', '志愿者领队D',
  '志愿者1', '志愿者2', '志愿者3', '志愿者4', '志愿者5', '志愿者6', '志愿者7', '志愿者8', '志愿者9', '志愿者10',
  '志愿者11', '志愿者12', '志愿者13', '志愿者14', '志愿者15', '志愿者16', '志愿者17', '志愿者18', '志愿者19', '志愿者20',
  '志愿者21', '志愿者22', '志愿者23', '志愿者24', '志愿者25', '志愿者26', '志愿者27', '志愿者28', '志愿者29', '志愿者30',
  '保安队长A', '安保1', '安保2', '安保3', '安保4', '安保5', '安保6', '安保7', '安保8', '安保9', '安保10',
  '安保11', '安保12', '安保13', '安保14', '安保15', '安保16', '安保17', '安保18', '安保19', '安保20',
  '保洁1', '保洁2', '保洁3', '保洁4', '保洁5', '保洁6', '保洁7', '保洁8', '保洁9', '保洁10', '保洁11', '保洁12',
  '餐饮后勤A', '餐饮后勤B', '餐饮后勤C', '餐饮后勤D', '餐饮后勤E',
  '物料仓管A', '物料仓管B',
  '场地协调1', '场地协调2', '场地协调3', '场地协调4', '场地协调5',
  '媒体联络1', '媒体联络2', '媒体联络3',
  '运营专员1', '运营专员2', '运营专员3', '运营专员4', '运营专员5', '运营专员6', '运营专员7', '运营专员8'
]

for (let i = 0; i < CAT1_HR_NAMES.length; i++) {
  const ratioRoll = Math.random()
  let totalQty = 1
  if (CAT1_HR_NAMES[i].startsWith('志愿者') && !CAT1_HR_NAMES[i].startsWith('志愿者领队')) totalQty = 5 + Math.floor(Math.random() * 6)
  else if (CAT1_HR_NAMES[i].startsWith('安保') && CAT1_HR_NAMES[i] !== '保安队长A') totalQty = 3 + Math.floor(Math.random() * 4)
  else if (CAT1_HR_NAMES[i].startsWith('保洁')) totalQty = 2 + Math.floor(Math.random() * 3)

  let usedQty, status
  if (ratioRoll < 0.27) { usedQty = totalQty; status = 'busy' }
  else if (ratioRoll < 0.37) { usedQty = 0; status = 'free' }
  else if (ratioRoll < 0.96) { usedQty = Math.max(1, Math.floor(totalQty * (0.3 + Math.random() * 0.6))); status = 'partial' }
  else { usedQty = 0; status = 'reserved' }
  if (usedQty > totalQty) usedQty = totalQty

  pushResource({
    categoryId: 'cat1',
    name: CAT1_HR_NAMES[i],
    code: 'HR-' + pad(i + 1),
    totalQty,
    usedQty,
    status,
    location: ['赛事运营部', '竞赛部', '安保部', '后勤部', '志愿者部', '医疗站'][Math.floor(Math.random() * 6)],
    owner: randomOwner(),
    contact: randomPhone(),
    lastUpdated: randomDateRecent()
  })
}

const CAT2_VENUE_NAMES = [
  { name: '东莞篮球中心主馆(主场馆)', addr: '东莞市寮步镇松山湖大道1号' },
  { name: '东莞篮球中心副馆', addr: '东莞市寮步镇松山湖大道3号' },
  { name: '大朗体育馆', addr: '东莞市大朗镇美景中路228号' },
  { name: '厚街体育馆', addr: '东莞市厚街镇体育路18号' },
  { name: '松山湖篮球公园A场', addr: '东莞市松山湖高新区新城大道88号' },
  { name: '松山湖篮球公园B场', addr: '东莞市松山湖高新区新城大道88号B区' },
  { name: '松山湖篮球公园C场', addr: '东莞市松山湖高新区新城大道88号C区' },
  { name: '训练馆1', addr: '东莞市南城区体育路5号训练中心1楼' },
  { name: '训练馆2', addr: '东莞市南城区体育路5号训练中心2楼' },
  { name: '热身场1', addr: '东莞市寮步镇篮球中心热身区A' },
  { name: '热身场2', addr: '东莞市寮步镇篮球中心热身区B' },
  { name: '主队更衣室A', addr: '东莞篮球中心主馆首层东区' },
  { name: '客队更衣室B', addr: '东莞篮球中心主馆首层西区' },
  { name: '裁判员休息室', addr: '东莞篮球中心主馆首层北区' },
  { name: '新闻发布厅', addr: '东莞篮球中心主馆二层发布区' },
  { name: '媒体中心', addr: '东莞篮球中心主馆三层媒体区' },
  { name: '混合采访区', addr: '东莞篮球中心主馆球员通道旁' },
  { name: 'VIP贵宾室1', addr: '东莞篮球中心主馆四层VIP-01' },
  { name: 'VIP贵宾室2', addr: '东莞篮球中心主馆四层VIP-02' },
  { name: 'VIP贵宾室3', addr: '东莞篮球中心主馆四层VIP-03' },
  { name: '球员通道', addr: '东莞篮球中心主馆首层通道区' },
  { name: '医疗站1', addr: '东莞篮球中心主馆首层东角' },
  { name: '医疗站2', addr: '大朗体育馆首层医疗区' },
  { name: '东莞理工学院体育馆', addr: '东莞市松山湖大学路1号' },
  { name: '东莞市体育中心训练场', addr: '东莞市南城区体育路3号训练场' },
  { name: '塘厦体育馆副场', addr: '东莞市塘厦镇塘龙西路79号副馆' }
]

for (let i = 0; i < CAT2_VENUE_NAMES.length; i++) {
  const ratioRoll = Math.random()
  const totalQty = 1
  let usedQty, status
  if (ratioRoll < 0.28) { usedQty = totalQty; status = 'busy' }
  else if (ratioRoll < 0.38) { usedQty = 0; status = 'free' }
  else if (ratioRoll < 0.97) { usedQty = Math.max(0, Math.floor(totalQty * (0.2 + Math.random() * 0.7))); status = usedQty === 0 ? 'free' : (usedQty === totalQty ? 'busy' : 'partial') }
  else { usedQty = 0; status = 'reserved' }
  if (usedQty > totalQty) usedQty = totalQty
  if (status === 'partial' && totalQty === 1) { status = usedQty === 1 ? 'busy' : 'free' }

  pushResource({
    categoryId: 'cat2',
    name: CAT2_VENUE_NAMES[i].name,
    code: 'VEN-' + pad(i + 1),
    totalQty,
    usedQty,
    status,
    location: CAT2_VENUE_NAMES[i].addr,
    owner: randomOwner(),
    contact: randomPhone(),
    lastUpdated: randomDateRecent()
  })
}

const CAT3_MAT_BASE = [
  '比赛用球(摩腾GG7X)', '训练用球', '备用球',
  '主记分牌', '24秒计时器(主场端)', '24秒计时器(客场端)',
  '替补席长凳', '篮架主架(主队)', '篮架主架(客队)',
  '篮网(主队)', '篮网(客队)', '篮网(训练1)', '篮网(训练2)',
  '扣篮计时器', '球队席桌(主队)', '球队席桌(客队)',
  '冠军奖杯', '亚军奖杯', 'MVP奖杯'
]

const CAT3_MAT_NAMES = []
CAT3_MAT_BASE.forEach(n => CAT3_MAT_NAMES.push(n))
for (let i = 1; i <= 50; i++) CAT3_MAT_NAMES.push(`荣誉证书${i}`)
CAT3_MAT_NAMES.push('主队球衣(白色套装)', '客队球衣(蓝色套装)', '裁判服(灰色)')
for (let i = 1; i <= 100; i++) CAT3_MAT_NAMES.push(`工作人员T恤${i}`)
for (let i = 1; i <= 200; i++) CAT3_MAT_NAMES.push(`工作证吊牌${i}`)
for (let i = 1; i <= 500; i++) CAT3_MAT_NAMES.push(`矿泉水${i}箱`)
CAT3_MAT_NAMES.push('Gatorade运动饮料', '能量棒补给')
for (let i = 1; i <= 200; i++) CAT3_MAT_NAMES.push(`毛巾${i}`)
CAT3_MAT_NAMES.push('冰袋补给', '急救箱1', '急救箱2', '急救箱3', '急救箱4', '急救箱5')

let cat3Count = 0
for (let i = 0; i < CAT3_MAT_NAMES.length && cat3Count < 58; i++) {
  const ratioRoll = Math.random()
  const name = CAT3_MAT_NAMES[i]
  let totalQty
  if (name.startsWith('矿泉水')) totalQty = 10
  else if (name.startsWith('工作人员T恤') || name.startsWith('工作证吊牌') || name.startsWith('毛巾')) totalQty = 20
  else if (name.startsWith('荣誉证书')) totalQty = 30
  else if (name.includes('用球')) totalQty = 10 + Math.floor(Math.random() * 15)
  else totalQty = 1 + Math.floor(Math.random() * 6)

  let usedQty, status
  if (ratioRoll < 0.28) { usedQty = totalQty; status = 'busy' }
  else if (ratioRoll < 0.38) { usedQty = 0; status = 'free' }
  else if (ratioRoll < 0.97) { usedQty = Math.max(1, Math.floor(totalQty * (0.25 + Math.random() * 0.65))); status = 'partial' }
  else { usedQty = 0; status = 'reserved' }
  if (usedQty > totalQty) usedQty = totalQty

  pushResource({
    categoryId: 'cat3',
    name,
    code: 'MAT-' + pad(cat3Count + 1),
    totalQty,
    usedQty,
    status,
    location: ['主仓库A区', '主仓库B区', '主仓库C区', '物料分发中心', '场边物料间'][Math.floor(Math.random() * 5)],
    owner: randomOwner(),
    contact: randomPhone(),
    lastUpdated: randomDateRecent()
  })
  cat3Count++
}

const CAT4_SUP_NAMES = [
  'CCTV5直播团队', '广东体育频道转播车', '咪咕视频摄制组', '腾讯体育直播团队',
  '东莞本地摄影团队A', '东莞本地摄影团队B',
  '专业灯光团队(主场馆)', '专业音响团队(主场馆)', 'LED大屏运维团队',
  '安保外包A(80人)', '安保外包B(50人)',
  '保洁外包A(30人)', '保洁外包B(20人)',
  '医疗外包A(驻场10人)', '医疗外包B(应急机动5人)',
  '餐饮供应A(球员餐)', '餐饮供应B(工作餐)', '餐饮供应C(贵宾餐)',
  '礼品定制供应商', '奖杯奖牌制作商',
  '物流运输A(器材)', '物流运输B(物资)',
  '洗衣服务(球衣毛巾)', '运动地板维护团队', '草坪/训练场维护',
  '网络通信保障', '电力保障团队', '特种设备检测'
]

for (let i = 0; i < CAT4_SUP_NAMES.length; i++) {
  const ratioRoll = Math.random()
  const totalQty = 1
  let usedQty, status
  if (ratioRoll < 0.28) { usedQty = totalQty; status = 'busy' }
  else if (ratioRoll < 0.38) { usedQty = 0; status = 'free' }
  else if (ratioRoll < 0.97) { usedQty = Math.floor(totalQty * (0.2 + Math.random() * 0.7)); status = usedQty === 0 ? 'free' : (usedQty === totalQty ? 'busy' : 'partial') }
  else { usedQty = 0; status = 'reserved' }
  if (usedQty > totalQty) usedQty = totalQty
  if (status === 'partial' && totalQty === 1) { status = usedQty === 1 ? 'busy' : 'free' }

  pushResource({
    categoryId: 'cat4',
    name: CAT4_SUP_NAMES[i],
    code: 'SUP-' + pad(i + 1),
    totalQty,
    usedQty,
    status,
    location: ['供应商办公室', '赛事指挥部', '现场保障区'][Math.floor(Math.random() * 3)],
    owner: randomOwner(),
    contact: randomPhone(),
    lastUpdated: randomDateRecent()
  })
}

const CAT5_MED_BASE = [
  '新华社', '人民日报体育部', '中国体育报', '篮球先锋报',
  '东莞日报', '南方都市报', '广东电视台体育频道', '深圳卫视体育',
  'CCTV体育频道官网', 'CBA官方网站', '篮芯赛事官网',
  '篮芯微信公众号', '篮芯官方微博', '篮芯抖音号', '篮芯B站号', '篮芯小红书号',
  '体育大生意公众号', '篮球评论员杨毅(KOL)', '篮球评论员苏群(KOL)'
]
const CAT5_MED_NAMES = [...CAT5_MED_BASE]
for (let i = 1; i <= 10; i++) CAT5_MED_NAMES.push(`摄影记者${i}`)
for (let i = 1; i <= 12; i++) CAT5_MED_NAMES.push(`文字记者${i}`)
CAT5_MED_NAMES.push('短视频达人A(篮球)', '短视频达人B(战术分析)', '短视频达人C(CBA花絮)', '短视频达人D(街头采访)')

for (let i = 0; i < CAT5_MED_NAMES.length; i++) {
  const ratioRoll = Math.random()
  const totalQty = 1
  let usedQty, status
  if (ratioRoll < 0.28) { usedQty = totalQty; status = 'busy' }
  else if (ratioRoll < 0.38) { usedQty = 0; status = 'free' }
  else if (ratioRoll < 0.97) { usedQty = Math.floor(totalQty * (0.2 + Math.random() * 0.7)); status = usedQty === 0 ? 'free' : (usedQty === totalQty ? 'busy' : 'partial') }
  else { usedQty = 0; status = 'reserved' }
  if (usedQty > totalQty) usedQty = totalQty
  if (status === 'partial' && totalQty === 1) { status = usedQty === 1 ? 'busy' : 'free' }

  pushResource({
    categoryId: 'cat5',
    name: CAT5_MED_NAMES[i],
    code: 'MED-' + pad(i + 1),
    totalQty,
    usedQty,
    status,
    location: ['媒体中心', '新闻发布厅', '混合采访区', '场边摄影位'][Math.floor(Math.random() * 4)],
    owner: randomOwner(),
    contact: randomPhone(),
    lastUpdated: randomDateRecent()
  })
}

function ensureAtLeastPerCategory(list, key, targetCount, minPerCat) {
  const counts = { cat1: 0, cat2: 0, cat3: 0, cat4: 0, cat5: 0 }
  list.forEach(x => { if (x[key] === targetCount || (typeof targetCount === 'string' && x[key] === targetCount)) counts[x.categoryId]++ })
  Object.keys(counts).forEach(cat => {
    if (counts[cat] < minPerCat) {
      const idx = list.findIndex(x => x.categoryId === cat && x[key] !== targetCount && x[key] !== 'reserved')
      if (idx >= 0) {
        list[idx][key] = targetCount
        if (key === 'status') {
          if (targetCount === 'busy') list[idx].usedQty = list[idx].totalQty
          if (targetCount === 'free') { list[idx].usedQty = 0 }
          if (targetCount === 'reserved') list[idx].usedQty = 0
        }
      }
    }
  })
}

ensureAtLeastPerCategory(RESOURCES, 'status', 'busy', 1)
ensureAtLeastPerCategory(RESOURCES, 'status', 'free', 1)
ensureAtLeastPerCategory(RESOURCES, 'status', 'partial', 1)
ensureAtLeastPerCategory(RESOURCES, 'status', 'reserved', 1)

const MATCH_IDS = MATCHES.map(m => m.id)
const EVENT_TYPES = ['比赛日', '训练日', '发布会', '开幕式', '颁奖典礼', '采访录制', '其他活动']
const DEPARTMENTS = ['赛事运营部', '竞赛部', '媒体部', '安保部', '后勤部', '商务部', '志愿者部']
const ALLOC_STATUSES = ['pending', 'ongoing', 'done', 'cancelled']
const NOTES_SAMPLES = [
  '需提前一天到场布置', '主裁判有临时调整，需协调替补', '需额外增加安保人员10名',
  '贵宾区需额外布置物料', '球员餐饮食谱已确认', '媒体席位需要增加电源接口',
  '救护车需提前30分钟就位', '需要与场馆方确认使用时间', '志愿者分组已完成',
  '奖杯奖牌已到位需签收', '转播车车位已预留', '灯光调试安排在比赛前3小时'
]

const ALLOCATIONS = []
let aid = 1

const resourceIds = RESOURCES.map(r => r.id)
const allocCountByResource = {}
resourceIds.forEach(id => { allocCountByResource[id] = 0 })

function pickWeightedEventType() {
  const r = Math.random()
  if (r < 0.50) return '比赛日'
  if (r < 0.63) return '训练日'
  if (r < 0.73) return '发布会'
  if (r < 0.80) return '开幕式'
  if (r < 0.87) return '颁奖典礼'
  if (r < 0.94) return '采访录制'
  return '其他活动'
}

function pickWeightedAllocStatus() {
  const r = Math.random()
  if (r < 0.40) return 'pending'
  if (r < 0.55) return 'ongoing'
  if (r < 0.95) return 'done'
  return 'cancelled'
}

function randomTime(start = '08:00', end = '22:00') {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const totalMin = (eh * 60 + em) - (sh * 60 + sm)
  const pick = Math.floor(Math.random() * totalMin)
  const h = Math.floor(pick / 60) + sh
  const m = pick % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function addAllocation(resourceId) {
  const matchId = MATCH_IDS[Math.floor(Math.random() * MATCH_IDS.length)]
  const eventType = pickWeightedEventType()
  const startDay = 1 + Math.floor(Math.random() * 28)
  const endDay = Math.random() < 0.85 ? startDay : Math.min(30, startDay + 1 + Math.floor(Math.random() * 2))
  let startTime = randomTime()
  let endTime = randomTime(startTime, '23:00')
  if (startTime >= endTime) {
    const [h, m] = startTime.split(':').map(Number)
    const eh = Math.min(23, h + 1 + Math.floor(Math.random() * 3))
    endTime = `${String(eh).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  const res = RESOURCES.find(r => r.id === resourceId)
  const qty = 1 + Math.floor(Math.random() * Math.max(1, Math.min(res.totalQty, res.categoryId === 'cat1' ? 15 : 10)))
  const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)]
  const status = pickWeightedAllocStatus()
  const notes = Math.random() < 0.30 ? NOTES_SAMPLES[Math.floor(Math.random() * NOTES_SAMPLES.length)] : null

  ALLOCATIONS.push({
    id: 'a' + aid++,
    resourceId,
    matchId,
    eventType,
    startDay,
    endDay,
    startTime,
    endTime,
    qty,
    department,
    status,
    notes
  })
  allocCountByResource[resourceId]++
}

resourceIds.forEach(id => { addAllocation(id) })

const totalAllocWanted = 230
while (ALLOCATIONS.length < totalAllocWanted) {
  const rid = resourceIds[Math.floor(Math.random() * resourceIds.length)]
  addAllocation(rid)
}

const multiAllocNeeded = Math.ceil(resourceIds.length * 0.10)
let multiCount = Object.values(allocCountByResource).filter(c => c >= 3).length
let guard = 0
while (multiCount < multiAllocNeeded && guard < 500) {
  const candidates = resourceIds.filter(id => allocCountByResource[id] < 3)
  if (candidates.length === 0) break
  const rid = candidates[Math.floor(Math.random() * candidates.length)]
  addAllocation(rid)
  multiCount = Object.values(allocCountByResource).filter(c => c >= 3).length
  guard++
}

const etCount = {}
EVENT_TYPES.forEach(et => { etCount[et] = ALLOCATIONS.filter(a => a.eventType === et).length })
EVENT_TYPES.forEach(et => {
  if (etCount[et] === 0) {
    const idx = ALLOCATIONS.findIndex(a => a.eventType === '比赛日')
    if (idx >= 0) ALLOCATIONS[idx].eventType = et
  }
})

export { RESOURCES, ALLOCATIONS }
export default { RESOURCE_CATEGORIES, RESOURCES, ALLOCATIONS }
