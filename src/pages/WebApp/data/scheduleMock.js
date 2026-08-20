export const TOURNAMENTS = [
  {
    id: 't1',
    name: 'CBA 夏季联赛（东莞赛区）',
    type: 'single_elim',
    slogan: '盛夏激战，谁与争锋',
    stages: [
      { id: 't1-s1', name: '小组赛', startDay: 1, endDay: 8, status: 'done' },
      { id: 't1-s2', name: '16强赛', startDay: 9, endDay: 12, status: 'done' },
      { id: 't1-s3', name: '八强赛', startDay: 13, endDay: 15, status: 'ongoing' },
      { id: 't1-s4', name: '半决赛', startDay: 16, endDay: 18, status: 'pending' },
      { id: 't1-s5', name: '决赛', startDay: 19, endDay: 20, status: 'pending' }
    ]
  },
  {
    id: 't2',
    name: 'WCBA 女篮热身赛',
    type: 'double_elim',
    slogan: '巾帼不让须眉，球场绽放光芒',
    stages: [
      { id: 't2-s1', name: 'A组循环', startDay: 1, endDay: 6, status: 'done' },
      { id: 't2-s2', name: 'B组循环', startDay: 1, endDay: 6, status: 'done' },
      { id: 't2-s3', name: '胜者组', startDay: 7, endDay: 10, status: 'ongoing' },
      { id: 't2-s4', name: '败者组', startDay: 7, endDay: 12, status: 'pending' },
      { id: 't2-s5', name: '总决赛', startDay: 13, endDay: 15, status: 'pending' }
    ]
  },
  {
    id: 't3',
    name: 'CUBAL 东莞赛区',
    type: 'league',
    slogan: '青春风暴，篮梦起航',
    stages: [
      { id: 't3-s1', name: 'R1常规赛', startDay: 1, endDay: 5, status: 'done' },
      { id: 't3-s2', name: 'R10常规赛', startDay: 6, endDay: 10, status: 'done' },
      { id: 't3-s3', name: 'R20常规赛', startDay: 11, endDay: 15, status: 'ongoing' },
      { id: 't3-s4', name: 'R30常规赛', startDay: 16, endDay: 20, status: 'pending' },
      { id: 't3-s5', name: 'R38常规赛', startDay: 21, endDay: 25, status: 'pending' },
      { id: 't3-s6', name: '季后赛', startDay: 26, endDay: 30, status: 'pending' }
    ]
  },
  {
    id: 't4',
    name: '东莞市青少年三人篮球公开赛',
    type: 'custom',
    slogan: '少年强则国强，三篮梦想飞扬',
    stages: [
      { id: 't4-s1', name: '预选赛', startDay: 1, endDay: 5, status: 'done' },
      { id: 't4-s2', name: '城市赛', startDay: 6, endDay: 10, status: 'done' },
      { id: 't4-s3', name: '大区赛', startDay: 11, endDay: 16, status: 'ongoing' },
      { id: 't4-s4', name: '全国总决赛', startDay: 17, endDay: 20, status: 'pending' }
    ]
  }
]

export const TEAMS = [
  { id: 'tm1', name: '广东华南虎', city: '东莞', logo: '广东', color: '#C8102E' },
  { id: 'tm2', name: '深圳猎豹', city: '深圳', logo: '深圳', color: '#003DA5' },
  { id: 'tm3', name: '广州龙狮', city: '广州', logo: '广州', color: '#D4AF37' },
  { id: 'tm4', name: '浙江稠州', city: '杭州', logo: '浙江', color: '#1D428A' },
  { id: 'tm5', name: '辽宁本钢', city: '沈阳', logo: '辽宁', color: '#002B5C' },
  { id: 'tm6', name: '北京首钢', city: '北京', logo: '北京', color: '#006B3F' },
  { id: 'tm7', name: '上海久事', city: '上海', logo: '上海', color: '#6B21A8' },
  { id: 'tm8', name: '浙江广厦', city: '杭州', logo: '广厦', color: '#E87722' },
  { id: 'tm9', name: '山东高速', city: '济南', logo: '山东', color: '#0051BA' },
  { id: 'tm10', name: '青岛国信水产', city: '青岛', logo: '青岛', color: '#00843D' },
  { id: 'tm11', name: '吉林九台农商', city: '长春', logo: '吉林', color: '#0066B3' },
  { id: 'tm12', name: '天津先行者', city: '天津', logo: '天津', color: '#8B2332' },
  { id: 'tm13', name: '南京头排苏酒', city: '南京', logo: '南京', color: '#4B0082' },
  { id: 'tm14', name: '福建浔兴股份', city: '晋江', logo: '福建', color: '#009B3A' },
  { id: 'tm15', name: '江苏肯帝亚', city: '苏州', logo: '江苏', color: '#C60B1E' },
  { id: 'tm16', name: '四川金强', city: '成都', logo: '四川', color: '#1E3A8A' },
  { id: 'tm17', name: '宁波町渥', city: '宁波', logo: '宁波', color: '#2563EB' },
  { id: 'tm18', name: '新疆伊力特', city: '乌鲁木齐', logo: '新疆', color: '#DC2626' },
  { id: 'tm19', name: '陕西信达', city: '西安', logo: '陕西', color: '#7C3AED' },
  { id: 'tm20', name: '广西威壮', city: '南宁', logo: '广西', color: '#F59E0B' }
]

export const VENUES = [
  { id: 'v1', name: '东莞篮球中心主馆', city: '东莞', capacity: 16000 },
  { id: 'v2', name: '东莞篮球中心副馆', city: '东莞', capacity: 4000 },
  { id: 'v3', name: '大朗体育馆', city: '东莞大朗', capacity: 3800 },
  { id: 'v4', name: '广东体育职业技术学院体育馆', city: '广州', capacity: 5000 },
  { id: 'v5', name: '厚街体育馆', city: '东莞厚街', capacity: 3500 },
  { id: 'v6', name: '深圳市体育中心体育馆', city: '深圳', capacity: 8000 },
  { id: 'v7', name: '广州天河体育馆', city: '广州', capacity: 9000 },
  { id: 'v8', name: '广州宝能观致文化中心', city: '广州', capacity: 12000 },
  { id: 'v9', name: '东莞市青少年活动中心篮球馆', city: '东莞', capacity: 2000 },
  { id: 'v10', name: '松山湖篮球公园', city: '东莞松山湖', capacity: 2500 }
]

const REFEREE_NAMES = [
  '张磊', '李晓光', '王建国', '陈志明', '刘文华', '赵文博', '孙浩然', '周德海',
  '吴建军', '郑远航', '冯志远', '黄俊杰', '朱国平', '林海峰', '何志强', '马晓东',
  '徐鹏飞', '罗晓峰', '梁文博', '宋雨辰', '唐建华', '许立军', '韩雪峰', '冯志刚',
  '邓伟明', '曹文轩', '彭海涛', '曾祥瑞', '肖博文', '田晓光', '董志勇', '袁建军',
  '潘文博', '于海洋', '蒋启明', '蔡志明', '余文杰', '杜海涛', '戴国强', '任俊豪',
  '姜文博', '范晓东', '石伟平', '姚建华', '谭志远', '廖文斌', '邹国栋', '熊海涛',
  '金哲宇', '陆文博'
]

function getRefereeTriplet(index) {
  const n = REFEREE_NAMES.length
  return [
    REFEREE_NAMES[index % n],
    REFEREE_NAMES[(index * 3 + 7) % n],
    REFEREE_NAMES[(index * 7 + 13) % n]
  ]
}

function pickVenue(matchIndex) {
  const weights = [25, 15, 10, 10, 10, 12, 10, 10, 8, 10]
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let target = (matchIndex * 17 + 5) % totalWeight
  for (let i = 0; i < weights.length; i++) {
    target -= weights[i]
    if (target <= 0) return 'v' + (i + 1)
  }
  return 'v1'
}

const MATCHES_RAW = []

let mId = 1

function addMatch(data) {
  MATCHES_RAW.push({ id: 'm' + mId++, ...data })
}

function addMatchesBatch(tournamentId, stageName, startDay, endDay, count, opts = {}) {
  const {
    forceDerby = false,
    forceDerbyOngoing = false,
    statusBias = 'balanced',
    stageOrder = 0
  } = opts

  const teamCount = TEAMS.length
  for (let i = 0; i < count; i++) {
    const dayRange = endDay - startDay + 1
    const date = startDay + ((i * 7 + 3) % dayRange)
    const times = ['09:00', '10:30', '14:00', '15:30', '19:00', '19:30', '20:00', '21:00', '21:30']
    const time = times[(i * 5 + 2) % times.length]

    let homeIdx, awayIdx
    if (forceDerby && i === 0) {
      homeIdx = 0
      awayIdx = 1
    } else {
      homeIdx = (i * 11 + 5) % teamCount
      awayIdx = (i * 17 + homeIdx + 3) % teamCount
      if (homeIdx === awayIdx) awayIdx = (awayIdx + 1) % teamCount
    }

    const venueId = pickVenue(MATCHES_RAW.length + i)

    let status
    if (forceDerbyOngoing && forceDerby && i === 0) {
      status = 'ongoing'
    } else {
      const globalIdx = MATCHES_RAW.length + i
      const statusRand = ((globalIdx * 13 + 7 + stageOrder * 29) % 100)
      if (statusBias === 'moreDone') {
        status = statusRand < 68 ? 'done' : statusRand < 78 ? 'ongoing' : 'pending'
      } else if (statusBias === 'morePending') {
        status = statusRand < 35 ? 'done' : statusRand < 45 ? 'ongoing' : 'pending'
      } else {
        status = statusRand < 52 ? 'done' : statusRand < 62 ? 'ongoing' : 'pending'
      }
    }

    let homeScore = null
    let awayScore = null

    if (status === 'done') {
      const maxScore = 65 + ((i * 19 + 11) % 56)
      const winMargin = 1 + ((i * 23 + 5) % 35)
      const minScore = Math.max(30, maxScore - winMargin)
      if ((i % 2) === 0) {
        homeScore = maxScore
        awayScore = minScore
      } else {
        homeScore = minScore
        awayScore = maxScore
      }
    } else if (status === 'ongoing') {
      homeScore = 40 + ((i * 7 + 11) % 45)
      awayScore = 35 + ((i * 11 + 17) % 45)
      if (homeScore === awayScore) awayScore = homeScore + 3
    }

    const referees = getRefereeTriplet(MATCHES_RAW.length + i + 1)

    addMatch({
      tournamentId,
      stage: stageName,
      date,
      time,
      homeId: TEAMS[homeIdx].id,
      awayId: TEAMS[awayIdx].id,
      venueId,
      homeScore,
      awayScore,
      status,
      referees
    })
  }
}

addMatchesBatch('t1', '小组赛', 1, 8, 24, { statusBias: 'moreDone', forceDerby: true, forceDerbyOngoing: false, stageOrder: 0 })
addMatchesBatch('t1', '16强赛', 9, 12, 12, { statusBias: 'moreDone', stageOrder: 1 })
addMatchesBatch('t1', '八强赛', 13, 15, 8, { statusBias: 'balanced', forceDerby: true, forceDerbyOngoing: true, stageOrder: 2 })
addMatchesBatch('t1', '半决赛', 16, 18, 4, { statusBias: 'morePending', stageOrder: 3 })
addMatchesBatch('t1', '决赛', 19, 20, 2, { statusBias: 'morePending', stageOrder: 4 })

addMatchesBatch('t2', 'A组循环', 1, 6, 8, { statusBias: 'moreDone', stageOrder: 0 })
addMatchesBatch('t2', 'B组循环', 1, 6, 6, { statusBias: 'moreDone', stageOrder: 1 })
addMatchesBatch('t2', '胜者组', 7, 10, 4, { statusBias: 'balanced', forceDerby: true, forceDerbyOngoing: false, stageOrder: 2 })
addMatchesBatch('t2', '败者组', 7, 12, 3, { statusBias: 'morePending', stageOrder: 3 })
addMatchesBatch('t2', '总决赛', 13, 15, 2, { statusBias: 'morePending', stageOrder: 4 })

addMatchesBatch('t3', 'R1常规赛', 1, 5, 6, { statusBias: 'moreDone', stageOrder: 0 })
addMatchesBatch('t3', 'R10常规赛', 6, 10, 6, { statusBias: 'moreDone', stageOrder: 1 })
addMatchesBatch('t3', 'R20常规赛', 11, 15, 6, { statusBias: 'balanced', stageOrder: 2 })
addMatchesBatch('t3', 'R30常规赛', 16, 20, 5, { statusBias: 'morePending', stageOrder: 3 })
addMatchesBatch('t3', 'R38常规赛', 21, 25, 4, { statusBias: 'morePending', stageOrder: 4 })
addMatchesBatch('t3', '季后赛', 26, 30, 3, { statusBias: 'morePending', stageOrder: 5 })

addMatchesBatch('t4', '预选赛', 1, 5, 6, { statusBias: 'moreDone', stageOrder: 0 })
addMatchesBatch('t4', '城市赛', 6, 10, 6, { statusBias: 'moreDone', stageOrder: 1 })
addMatchesBatch('t4', '大区赛', 11, 16, 6, { statusBias: 'balanced', stageOrder: 2 })
addMatchesBatch('t4', '全国总决赛', 17, 20, 4, { statusBias: 'morePending', stageOrder: 3 })

export const MATCHES = MATCHES_RAW

export default { TOURNAMENTS, TEAMS, VENUES, MATCHES }
