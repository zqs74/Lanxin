import { VENUES, MATCHES, TEAMS } from './scheduleMock.js'

const VENUE_TYPES = ['主场馆', '副馆', '训练馆', '训练馆', '训练馆', '主场馆', '主场馆', '主场馆', '青少年馆', '户外场馆']

export const VENUE_ROWS = VENUES.map((v, i) => ({
  id: 'vrow' + (i + 1),
  venueId: v.id,
  name: v.name,
  capacity: v.capacity,
  type: VENUE_TYPES[i]
}))

export const HR_ROWS = [
  { id: 'hrow1', category: '裁判', name: '主裁判组 (张磊组)', headcount: 3 },
  { id: 'hrow2', category: '裁判', name: '第一副裁组 (李晓光组)', headcount: 3 },
  { id: 'hrow3', category: '记录台', name: '记录台A班', headcount: 8 },
  { id: 'hrow4', category: '技术代表', name: 'FIBA技术代表 (王建国)', headcount: 1 },
  { id: 'hrow5', category: '医疗', name: '场馆驻场医务组', headcount: 5 },
  { id: 'hrow6', category: '安保', name: '内场安保组 (1区)', headcount: 12 },
  { id: 'hrow7', category: '场馆运营', name: '场地维护组', headcount: 4 },
  { id: 'hrow8', category: '媒体', name: '场馆媒体运营组', headcount: 6 },
  { id: 'hrow9', category: 'MC/DJ', name: 'MC播报+DJ音响组', headcount: 2 },
  { id: 'hrow10', category: '拉拉队', name: '主场拉拉队 (巅峰舞队)', headcount: 16 }
]

export const ACTIVITY_TYPES = [
  { id: 'at1', name: '比赛', color: '--brand' },
  { id: 'at2', name: '训练', color: '--info' },
  { id: 'at3', name: '会议', color: '--purple' },
  { id: 'at4', name: '场馆维护', color: '--warn' },
  { id: 'at5', name: '开放运营', color: '--ok' }
]

const MATCH_TYPE = '比赛'
const TRAIN_TYPE = '训练'
const MEET_TYPE = '会议'
const MAINT_TYPE = '场馆维护'
const OPEN_TYPE = '开放运营'

const ALL_VROW_IDS = VENUE_ROWS.map(v => v.id)
const ALL_HROW_IDS = HR_ROWS.map(h => h.id)

function teamNameById(id) {
  const t = TEAMS.find(x => x.id === id)
  return t ? t.name : '球队'
}

function matchTitle(m) {
  return `${teamNameById(m.homeId)} vs ${teamNameById(m.awayId)} ${m.stage}`
}

const SCHEDULE_ITEMS_RAW = []
let siCounter = 0
function addItem(data) {
  siCounter++
  SCHEDULE_ITEMS_RAW.push({ id: 'si' + siCounter, ...data })
  return SCHEDULE_ITEMS_RAW[SCHEDULE_ITEMS_RAW.length - 1]
}

const CONFLICT_1A = addItem({
  title: '广东华南虎 vs 深圳猎豹 CBA夏联八强赛',
  type: MATCH_TYPE,
  dimension: 'venue',
  venueRowId: 'vrow1',
  hrRowId: null,
  dayOfWeek: 6,
  startHour: 19,
  durationHours: 2.5,
  assignedResourceIds: ['vrow1', 'hrow1', 'hrow2', 'hrow3', 'hrow4', 'hrow5', 'hrow6', 'hrow9', 'hrow10'],
  ownerName: '张磊',
  matchId: 'm53'
})

const CONFLICT_1B = addItem({
  title: '广东队加练三分投射专项训练',
  type: TRAIN_TYPE,
  dimension: 'venue',
  venueRowId: 'vrow1',
  hrRowId: null,
  dayOfWeek: 6,
  startHour: 20,
  durationHours: 2,
  assignedResourceIds: ['vrow1'],
  ownerName: '王芳',
  matchId: null
})

const CONFLICT_2A = addItem({
  title: '大朗体育馆 CUBAL常规赛 广东工大 vs 东莞理工',
  type: MATCH_TYPE,
  dimension: 'hr',
  venueRowId: null,
  hrRowId: 'hrow1',
  dayOfWeek: 3,
  startHour: 14,
  durationHours: 2,
  assignedResourceIds: ['vrow3', 'hrow1', 'hrow2', 'hrow3', 'hrow5'],
  ownerName: '张磊',
  matchId: 'm89'
})

const CONFLICT_2B = addItem({
  title: '厚街体育馆 青少年公开赛 半决赛第二场',
  type: MATCH_TYPE,
  dimension: 'hr',
  venueRowId: null,
  hrRowId: 'hrow1',
  dayOfWeek: 3,
  startHour: 15,
  durationHours: 2,
  assignedResourceIds: ['vrow5', 'hrow1', 'hrow2', 'hrow3', 'hrow5'],
  ownerName: '李晓光',
  matchId: 'm115'
})

const CONFLICT_3A = addItem({
  title: '青少年篮球夏令营 上午基础训练',
  type: TRAIN_TYPE,
  dimension: 'venue',
  venueRowId: 'vrow2',
  hrRowId: null,
  dayOfWeek: 1,
  startHour: 10,
  durationHours: 2,
  assignedResourceIds: ['vrow2'],
  ownerName: '陈志明',
  matchId: null
})

const CONFLICT_3B = addItem({
  title: '副馆地板全面翻新维护（打蜡+划线）',
  type: MAINT_TYPE,
  dimension: 'venue',
  venueRowId: 'vrow2',
  hrRowId: null,
  dayOfWeek: 1,
  startHour: 10,
  durationHours: 3,
  assignedResourceIds: ['vrow2', 'hrow7'],
  ownerName: '刘文华',
  matchId: null
})

const standardMatchResources = ['hrow1', 'hrow2', 'hrow3', 'hrow4', 'hrow5', 'hrow6', 'hrow9']

const MATCH_SLOTS = [
  [1, 9], [1, 10.5], [1, 14], [1, 15.5], [1, 19], [1, 20],
  [2, 8], [2, 9.5], [2, 14], [2, 15.5], [2, 19], [2, 19.5], [2, 21],
  [3, 9], [3, 10.5], [3, 19], [3, 20],
  [4, 9], [4, 10.5], [4, 14], [4, 15.5], [4, 19.5],
  [5, 9], [5, 14], [5, 15.5], [5, 19], [5, 20], [5, 21.5],
  [6, 8], [6, 9.5], [6, 10.5], [6, 14], [6, 15.5], [6, 21.5],
  [7, 8], [7, 9], [7, 10.5], [7, 14], [7, 15.5], [7, 19], [7, 20]
]

const MATCH_VENUES_FOR_BATCH = ['vrow1', 'vrow2', 'vrow3', 'vrow4', 'vrow5', 'vrow6', 'vrow7', 'vrow8', 'vrow9', 'vrow10', 'vrow1', 'vrow3', 'vrow5', 'vrow6', 'vrow7']
const MATCH_OWNERS = ['张磊', '李晓光', '王建国', '陈志明', '刘文华', '赵文博', '孙浩然', '周德海', '吴建军', '郑远航', '黄俊杰', '朱国平']

for (let slotIdx = 0; slotIdx < MATCH_SLOTS.length; slotIdx++) {
  const [dayOfWeek, startHour] = MATCH_SLOTS[slotIdx]
  let vrowIdx = slotIdx % MATCH_VENUES_FOR_BATCH.length
  let vrowId = MATCH_VENUES_FOR_BATCH[vrowIdx]

  if (dayOfWeek === 6 && Math.abs(startHour - 19) < 0.1 && vrowId === 'vrow1') {
    vrowIdx = (vrowIdx + 3) % MATCH_VENUES_FOR_BATCH.length
    vrowId = MATCH_VENUES_FOR_BATCH[vrowIdx]
  }

  const realMatchIdx = (slotIdx * 7 + 11) % MATCHES.length
  const m = MATCHES[realMatchIdx]

  addItem({
    title: matchTitle(m),
    type: MATCH_TYPE,
    dimension: 'venue',
    venueRowId: vrowId,
    hrRowId: null,
    dayOfWeek,
    startHour,
    durationHours: 2,
    assignedResourceIds: [vrowId, ...standardMatchResources],
    ownerName: MATCH_OWNERS[slotIdx % MATCH_OWNERS.length],
    matchId: m.id
  })
}

const TRAINING_TITLES_VENUE = [
  ['广东队赛前投篮训练', '王芳'],
  ['深圳猎豹 体能+战术合练', '李晓光'],
  ['广州龙狮 防守专项训练', '陈志明'],
  ['浙江稠州 快攻战术演练', '刘文华'],
  ['辽宁本钢 罚球训练课', '赵文博'],
  ['北京首钢 内线脚步训练', '孙浩然'],
  ['上海久事 三分投射特训', '周德海'],
  ['山东高速 篮板卡位训练', '吴建军'],
  ['青少年篮球基础班 周六上午', '黄俊杰'],
  ['青少年提高班 运球+传球', '朱国平'],
  ['三人篮球国家集训队 训练', '郑远航'],
  ['女篮热身训练 赛前适应性', '林海峰'],
  ['CUBAL东莞理工 日常训练', '何志强'],
  ['广东工业大学校队 合练', '马晓东'],
  ['公开选拔赛 新秀试训营', '徐鹏飞'],
  ['教练组战术沙盘演练（场地）', '罗晓峰']
]

const TRAINING_SLOTS_VENUE = [
  [1, 8], [1, 13], [1, 15],
  [2, 8], [2, 10], [2, 16],
  [3, 8], [3, 10], [3, 16],
  [4, 8], [4, 10], [4, 13],
  [5, 7], [5, 8], [5, 16],
  [6, 7], [6, 9], [6, 16],
  [7, 7], [7, 9], [7, 10]
]

let trainVIdx = 0
for (let i = 0; i < TRAINING_SLOTS_VENUE.length; i++) {
  const [dayOfWeek, startHour] = TRAINING_SLOTS_VENUE[i]

  if (dayOfWeek === 1 && Math.abs(startHour - 10) < 0.1) continue

  const tpl = TRAINING_TITLES_VENUE[trainVIdx % TRAINING_TITLES_VENUE.length]
  trainVIdx++
  let vrowId = ALL_VROW_IDS[(i * 3 + 2) % ALL_VROW_IDS.length]

  if (dayOfWeek === 6 && vrowId === 'vrow1' && startHour >= 19 && startHour < 22) {
    vrowId = ALL_VROW_IDS[(i * 3 + 7) % ALL_VROW_IDS.length]
  }

  const dur = startHour >= 16 ? 1.5 : (startHour <= 8 ? 2 : 2)
  addItem({
    title: tpl[0],
    type: TRAIN_TYPE,
    dimension: 'venue',
    venueRowId: vrowId,
    hrRowId: null,
    dayOfWeek,
    startHour,
    durationHours: dur,
    assignedResourceIds: [vrowId],
    ownerName: tpl[1],
    matchId: null
  })
}

const MAINT_TITLES = [
  ['主馆篮架设备巡检', 'hrow7'],
  ['副馆照明系统检测', 'hrow7'],
  ['大朗体育馆 看台座椅检修', 'hrow7'],
  ['厚街体育馆 音响系统调试', 'hrow7'],
  ['深圳市体育中心 空调维保', 'hrow7'],
  ['天河体育馆 地板日常清洁保养', 'hrow7'],
  ['宝能文化中心 电子屏校准', 'hrow7'],
  ['青少活动中心 篮筐高度校正', 'hrow7']
]

const MAINT_SLOTS = [
  [1, 14], [1, 15.5],
  [2, 8], [2, 22],
  [3, 8], [3, 22],
  [4, 22],
  [5, 22],
  [7, 14]
]

for (let i = 0; i < MAINT_SLOTS.length; i++) {
  const [dayOfWeek, startHour] = MAINT_SLOTS[i]
  const tpl = MAINT_TITLES[i % MAINT_TITLES.length]
  const vrowId = ALL_VROW_IDS[(i * 2 + 1) % ALL_VROW_IDS.length]
  addItem({
    title: tpl[0],
    type: MAINT_TYPE,
    dimension: 'venue',
    venueRowId: vrowId,
    hrRowId: null,
    dayOfWeek,
    startHour,
    durationHours: startHour >= 22 ? 1.5 : 2,
    assignedResourceIds: [vrowId, tpl[1]],
    ownerName: '刘文华',
    matchId: null
  })
}

const OPEN_TITLES = [
  ['场馆开放 球迷活动日', '孙浩然'],
  ['青少年篮球体验课（免费开放）', '黄俊杰'],
  ['社区篮球赛 居民开放场', '周德海'],
  ['亲子篮球嘉年华 开放时段', '赵文博'],
  ['企事业单位友谊赛 租借场', '吴建军'],
  ['松山湖夜场 市民开放运营', '郑远航']
]

const OPEN_SLOTS = [
  [1, 18], [2, 18], [3, 18], [5, 18],
  [6, 10], [6, 14], [6, 18],
  [7, 10], [7, 14], [7, 18]
]

for (let i = 0; i < OPEN_SLOTS.length; i++) {
  const [dayOfWeek, startHour] = OPEN_SLOTS[i]
  const tpl = OPEN_TITLES[i % OPEN_TITLES.length]
  const vrowId = ALL_VROW_IDS[(i * 3 + 4) % ALL_VROW_IDS.length]
  addItem({
    title: tpl[0],
    type: OPEN_TYPE,
    dimension: 'venue',
    venueRowId: vrowId,
    hrRowId: null,
    dayOfWeek,
    startHour,
    durationHours: startHour >= 18 ? 3 : 2.5,
    assignedResourceIds: [vrowId, 'hrow6'],
    ownerName: tpl[1],
    matchId: null
  })
}

const MEET_TITLES_VENUE = [
  ['裁判长赛前技术会议（场馆室）', 'hrow1', '张磊'],
  ['两队主教练 赛前联席会', 'hrow2', '李晓光'],
  ['场馆运营组 赛事复盘会议', 'hrow7', '刘文华'],
  ['媒体转播协调会', 'hrow8', '孙浩然']
]

const MEET_SLOTS_VENUE = [
  [2, 12], [3, 12], [4, 12], [5, 12], [6, 12], [7, 12], [1, 12]
]

for (let i = 0; i < MEET_SLOTS_VENUE.length; i++) {
  const [dayOfWeek, startHour] = MEET_SLOTS_VENUE[i]
  const tpl = MEET_TITLES_VENUE[i % MEET_TITLES_VENUE.length]
  const vrowId = ALL_VROW_IDS[(i + 1) % ALL_VROW_IDS.length]
  addItem({
    title: tpl[0],
    type: MEET_TYPE,
    dimension: 'venue',
    venueRowId: vrowId,
    hrRowId: null,
    dayOfWeek,
    startHour,
    durationHours: 1,
    assignedResourceIds: [vrowId, tpl[1]],
    ownerName: tpl[2],
    matchId: null
  })
}

const HR_TRAINING_TITLES = [
  ['裁判组 规则培训课（新规则解读）', 'hrow1', '张磊', 2],
  ['副裁组 执裁手势统一培训', 'hrow2', '李晓光', 2],
  ['记录台A班 24秒计时器实操演练', 'hrow3', '陈志明', 2.5],
  ['FIBA技术代表 赛前规则宣讲会', 'hrow4', '王建国', 1.5],
  ['场馆驻场医务组 运动损伤急救演练', 'hrow5', '刘文华', 3],
  ['内场安保组 人群疏散预案演习', 'hrow6', '赵文博', 2.5],
  ['场地维护组 篮球架拆装培训', 'hrow7', '孙浩然', 2],
  ['场馆媒体运营组 转播机位协调会', 'hrow8', '周德海', 1.5],
  ['MC播报+DJ音响组 赛前流程彩排', 'hrow9', '吴建军', 2],
  ['主场拉拉队 赛前舞蹈排练', 'hrow10', '郑远航', 2.5],
  ['裁判组 录像复盘 执裁回顾会', 'hrow1', '张磊', 2],
  ['副裁组 体能训练课', 'hrow2', '李晓光', 1.5],
  ['记录台 统计软件升级培训', 'hrow3', '陈志明', 2],
  ['技术代表 赛事监督总结会', 'hrow4', '王建国', 1],
  ['医疗组 反兴奋剂检测流程学习', 'hrow5', '刘文华', 2],
  ['安保组 危险品识别专项培训', 'hrow6', '赵文博', 2],
  ['拉拉队 新舞蹈编排会议', 'hrow10', '郑远航', 2]
]

const HR_TRAINING_DAYS = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 4, 4, 5, 5, 6, 7]
const HR_TRAINING_HOURS = [8, 9.5, 13, 14.5, 16, 8, 9.5, 13, 15, 17, 9, 9, 14, 9, 16, 10, 10]

for (let i = 0; i < HR_TRAINING_TITLES.length; i++) {
  const [title, hrowId, owner, dur] = HR_TRAINING_TITLES[i]
  const dayOfWeek = HR_TRAINING_DAYS[i]
  const startHour = HR_TRAINING_HOURS[i]

  if (hrowId === 'hrow1' && dayOfWeek === 3) {
    if ((startHour >= 14 && startHour < 16) || (startHour >= 15 && startHour < 17)) continue
  }

  addItem({
    title,
    type: TRAIN_TYPE,
    dimension: 'hr',
    venueRowId: null,
    hrRowId: hrowId,
    dayOfWeek,
    startHour,
    durationHours: dur,
    assignedResourceIds: [hrowId],
    ownerName: owner,
    matchId: null
  })
}

const HR_MEETING_TITLES = [
  ['主裁+副裁 赛前联合技术会议', ['hrow1', 'hrow2'], '张磊', 1.5],
  ['记录台+技术代表 数据对接会', ['hrow3', 'hrow4'], '王建国', 1],
  ['医疗+安保 应急联动协调会', ['hrow5', 'hrow6'], '赵文博', 1.5],
  ['全组别 赛事总结周会（周一）', ['hrow1', 'hrow2', 'hrow3', 'hrow4'], '张磊', 2],
  ['运营组 周末赛事准备会', ['hrow7', 'hrow8', 'hrow9'], '孙浩然', 1.5]
]

const HR_MEET_SLOTS = [
  [2, 11], [3, 11], [4, 11], [1, 17], [5, 17]
]

for (let i = 0; i < HR_MEETING_TITLES.length; i++) {
  const [title, hrowIds, owner, dur] = HR_MEETING_TITLES[i]
  const [dayOfWeek, startHour] = HR_MEET_SLOTS[i]
  const primaryHrow = hrowIds[0]
  addItem({
    title,
    type: MEET_TYPE,
    dimension: 'hr',
    venueRowId: null,
    hrRowId: primaryHrow,
    dayOfWeek,
    startHour,
    durationHours: dur,
    assignedResourceIds: [...hrowIds],
    ownerName: owner,
    matchId: null
  })
}

while (SCHEDULE_ITEMS_RAW.length < 65) {
  const extraDay = SCHEDULE_ITEMS_RAW.length % 7 + 1
  const extraStart = 8 + ((SCHEDULE_ITEMS_RAW.length * 2) % 12)
  const isHr = SCHEDULE_ITEMS_RAW.length % 3 === 0
  if (isHr) {
    const hrowId = ALL_HROW_IDS[SCHEDULE_ITEMS_RAW.length % ALL_HROW_IDS.length]
    addItem({
      title: `${HR_ROWS.find(h => h.id === hrowId)?.name || '人力组'} 机动备勤安排`,
      type: MEET_TYPE,
      dimension: 'hr',
      venueRowId: null,
      hrRowId: hrowId,
      dayOfWeek: extraDay,
      startHour: extraStart,
      durationHours: 1,
      assignedResourceIds: [hrowId],
      ownerName: MATCH_OWNERS[SCHEDULE_ITEMS_RAW.length % MATCH_OWNERS.length],
      matchId: null
    })
  } else {
    const vrowId = ALL_VROW_IDS[(SCHEDULE_ITEMS_RAW.length + 5) % ALL_VROW_IDS.length]
    addItem({
      title: `${VENUE_ROWS.find(v => v.id === vrowId)?.name || '场馆'} 临时训练预约`,
      type: TRAIN_TYPE,
      dimension: 'venue',
      venueRowId: vrowId,
      hrRowId: null,
      dayOfWeek: extraDay,
      startHour: extraStart,
      durationHours: 1.5,
      assignedResourceIds: [vrowId],
      ownerName: MATCH_OWNERS[(SCHEDULE_ITEMS_RAW.length + 2) % MATCH_OWNERS.length],
      matchId: null
    })
  }
}

export const SCHEDULE_ITEMS = SCHEDULE_ITEMS_RAW

export const CONFLICTS = [
  {
    id: 'c1',
    type: 'Venue Overlap',
    severity: 'high',
    itemIds: [CONFLICT_1A.id, CONFLICT_1B.id],
    description: '周六晚东莞主馆同时排了广东德比和训练，严重冲突需立即改期'
  },
  {
    id: 'c2',
    type: 'HR Conflict',
    severity: 'high',
    itemIds: [CONFLICT_2A.id, CONFLICT_2B.id],
    description: '张磊主裁组周三下午双场跨馆，无法同时到达'
  },
  {
    id: 'c3',
    type: 'Maintenance',
    severity: 'medium',
    itemIds: [CONFLICT_3A.id, CONFLICT_3B.id],
    description: '副馆周一维修期间不对外开放训练，请改期训练或换馆'
  }
]

export default { VENUE_ROWS, HR_ROWS, ACTIVITY_TYPES, SCHEDULE_ITEMS, CONFLICTS }
