const teams = {
  dg: {
    id: 'dg',
    shortName: 'DG',
    name: '东莞青训联队',
    record: '4胜0负',
    color: '#0F2A5A',
    accent: 'var(--info)',
  },
  gz: {
    id: 'gz',
    shortName: 'GZ',
    name: '广州精英队',
    record: '1胜3负',
    color: '#D4AF37',
    accent: 'var(--brand)',
  },
}

const quarterScores = {
  dg: [22, 21, 23, 18],
  gz: [15, 18, 19, 16],
}

const playerStats = [
  { id: 'dg-7', teamId: 'dg', number: 7, name: '林启航', position: 'PG', minutes: '31:24', pts: 18, reb: 5, ast: 8, stl: 2, blk: 0, fgPct: 50.0, tpPct: 42.9, ftPct: 80.0, fgMade: 7, fgAttempt: 14, tpMade: 3, tpAttempt: 7, ftMade: 1, ftAttempt: 2, offReb: 1, defReb: 4, tov: 3, fouls: 2, plusMinus: 14, eff: 23, shotMix: { rim: 0.22, mid: 0.28, three: 0.5 } },
  { id: 'dg-11', teamId: 'dg', number: 11, name: '陈泽昊', position: 'SG', minutes: '28:40', pts: 14, reb: 4, ast: 3, stl: 1, blk: 0, fgPct: 46.2, tpPct: 37.5, ftPct: 100.0, fgMade: 6, fgAttempt: 13, tpMade: 3, tpAttempt: 8, ftMade: 1, ftAttempt: 1, offReb: 0, defReb: 4, tov: 2, fouls: 1, plusMinus: 9, eff: 16, shotMix: { rim: 0.18, mid: 0.24, three: 0.58 } },
  { id: 'dg-23', teamId: 'dg', number: 23, name: '周宇诚', position: 'SF', minutes: '29:55', pts: 12, reb: 7, ast: 4, stl: 2, blk: 1, fgPct: 45.5, tpPct: 33.3, ftPct: 75.0, fgMade: 5, fgAttempt: 11, tpMade: 2, tpAttempt: 6, ftMade: 0, ftAttempt: 0, offReb: 2, defReb: 5, tov: 1, fouls: 2, plusMinus: 11, eff: 18, shotMix: { rim: 0.31, mid: 0.26, three: 0.43 } },
  { id: 'dg-35', teamId: 'dg', number: 35, name: '吴景川', position: 'PF', minutes: '26:10', pts: 11, reb: 9, ast: 2, stl: 1, blk: 2, fgPct: 55.6, tpPct: 0.0, ftPct: 60.0, fgMade: 5, fgAttempt: 9, tpMade: 0, tpAttempt: 1, ftMade: 1, ftAttempt: 2, offReb: 4, defReb: 5, tov: 2, fouls: 4, plusMinus: 8, eff: 17, shotMix: { rim: 0.48, mid: 0.39, three: 0.13 } },
  { id: 'dg-14', teamId: 'dg', number: 14, name: '李骏哲', position: 'C', minutes: '24:36', pts: 9, reb: 10, ast: 1, stl: 0, blk: 3, fgPct: 57.1, tpPct: 0.0, ftPct: 50.0, fgMade: 4, fgAttempt: 7, tpMade: 0, tpAttempt: 0, ftMade: 1, ftAttempt: 2, offReb: 5, defReb: 5, tov: 2, fouls: 3, plusMinus: 10, eff: 18, shotMix: { rim: 0.66, mid: 0.26, three: 0.08 } },
  { id: 'dg-5', teamId: 'dg', number: 5, name: '许朗', position: 'SG', minutes: '19:12', pts: 8, reb: 2, ast: 2, stl: 1, blk: 0, fgPct: 40.0, tpPct: 40.0, ftPct: 100.0, fgMade: 3, fgAttempt: 8, tpMade: 2, tpAttempt: 5, ftMade: 0, ftAttempt: 0, offReb: 0, defReb: 2, tov: 1, fouls: 1, plusMinus: 4, eff: 8, shotMix: { rim: 0.16, mid: 0.14, three: 0.7 } },
  { id: 'dg-2', teamId: 'dg', number: 2, name: '黄至臻', position: 'PG', minutes: '13:42', pts: 7, reb: 2, ast: 4, stl: 1, blk: 0, fgPct: 42.9, tpPct: 33.3, ftPct: 100.0, fgMade: 3, fgAttempt: 7, tpMade: 1, tpAttempt: 3, ftMade: 0, ftAttempt: 0, offReb: 0, defReb: 2, tov: 1, fouls: 1, plusMinus: 5, eff: 9, shotMix: { rim: 0.2, mid: 0.33, three: 0.47 } },
  { id: 'dg-18', teamId: 'dg', number: 18, name: '邵天瑞', position: 'SF', minutes: '11:08', pts: 5, reb: 3, ast: 1, stl: 0, blk: 0, fgPct: 50.0, tpPct: 50.0, ftPct: 0.0, fgMade: 2, fgAttempt: 4, tpMade: 1, tpAttempt: 2, ftMade: 0, ftAttempt: 0, offReb: 1, defReb: 2, tov: 0, fouls: 1, plusMinus: 3, eff: 6, shotMix: { rim: 0.14, mid: 0.23, three: 0.63 } },
  { id: 'gz-3', teamId: 'gz', number: 3, name: '赵沐阳', position: 'PG', minutes: '32:05', pts: 17, reb: 4, ast: 7, stl: 2, blk: 0, fgPct: 47.1, tpPct: 40.0, ftPct: 75.0, fgMade: 6, fgAttempt: 13, tpMade: 2, tpAttempt: 5, ftMade: 3, ftAttempt: 4, offReb: 0, defReb: 4, tov: 4, fouls: 3, plusMinus: -8, eff: 17, shotMix: { rim: 0.2, mid: 0.31, three: 0.49 } },
  { id: 'gz-9', teamId: 'gz', number: 9, name: '卢皓宇', position: 'SG', minutes: '29:48', pts: 13, reb: 3, ast: 3, stl: 1, blk: 0, fgPct: 43.8, tpPct: 36.4, ftPct: 100.0, fgMade: 5, fgAttempt: 11, tpMade: 4, tpAttempt: 11, ftMade: 0, ftAttempt: 0, offReb: 1, defReb: 2, tov: 2, fouls: 2, plusMinus: -6, eff: 12, shotMix: { rim: 0.12, mid: 0.16, three: 0.72 } },
  { id: 'gz-21', teamId: 'gz', number: 21, name: '程一凡', position: 'SF', minutes: '28:30', pts: 10, reb: 6, ast: 2, stl: 1, blk: 1, fgPct: 41.7, tpPct: 25.0, ftPct: 80.0, fgMade: 4, fgAttempt: 10, tpMade: 1, tpAttempt: 4, ftMade: 1, ftAttempt: 2, offReb: 2, defReb: 4, tov: 2, fouls: 2, plusMinus: -4, eff: 11, shotMix: { rim: 0.28, mid: 0.31, three: 0.41 } },
  { id: 'gz-34', teamId: 'gz', number: 34, name: '何俊凯', position: 'PF', minutes: '27:18', pts: 8, reb: 8, ast: 2, stl: 0, blk: 2, fgPct: 50.0, tpPct: 0.0, ftPct: 66.7, fgMade: 3, fgAttempt: 6, tpMade: 0, tpAttempt: 1, ftMade: 2, ftAttempt: 3, offReb: 4, defReb: 4, tov: 3, fouls: 3, plusMinus: -2, eff: 12, shotMix: { rim: 0.51, mid: 0.35, three: 0.14 } },
  { id: 'gz-16', teamId: 'gz', number: 16, name: '徐天泽', position: 'C', minutes: '23:55', pts: 7, reb: 9, ast: 1, stl: 0, blk: 2, fgPct: 50.0, tpPct: 0.0, ftPct: 50.0, fgMade: 3, fgAttempt: 6, tpMade: 0, tpAttempt: 0, ftMade: 1, ftAttempt: 2, offReb: 3, defReb: 6, tov: 2, fouls: 4, plusMinus: -5, eff: 11, shotMix: { rim: 0.7, mid: 0.22, three: 0.08 } },
  { id: 'gz-12', teamId: 'gz', number: 12, name: '潘奕辰', position: 'SG', minutes: '18:10', pts: 5, reb: 2, ast: 2, stl: 1, blk: 0, fgPct: 37.5, tpPct: 33.3, ftPct: 0.0, fgMade: 2, fgAttempt: 6, tpMade: 1, tpAttempt: 3, ftMade: 0, ftAttempt: 0, offReb: 0, defReb: 2, tov: 1, fouls: 1, plusMinus: -3, eff: 5, shotMix: { rim: 0.17, mid: 0.19, three: 0.64 } },
  { id: 'gz-6', teamId: 'gz', number: 6, name: '苏柏言', position: 'PG', minutes: '14:26', pts: 4, reb: 1, ast: 3, stl: 0, blk: 0, fgPct: 40.0, tpPct: 50.0, ftPct: 0.0, fgMade: 2, fgAttempt: 5, tpMade: 1, tpAttempt: 2, ftMade: 0, ftAttempt: 0, offReb: 0, defReb: 1, tov: 1, fouls: 1, plusMinus: -1, eff: 5, shotMix: { rim: 0.13, mid: 0.27, three: 0.6 } },
  { id: 'gz-18', teamId: 'gz', number: 18, name: '谭嘉睿', position: 'SF', minutes: '9:48', pts: 4, reb: 2, ast: 1, stl: 0, blk: 0, fgPct: 50.0, tpPct: 0.0, ftPct: 100.0, fgMade: 1, fgAttempt: 2, tpMade: 0, tpAttempt: 1, ftMade: 2, ftAttempt: 2, offReb: 1, defReb: 1, tov: 0, fouls: 1, plusMinus: -1, eff: 5, shotMix: { rim: 0.43, mid: 0.39, three: 0.18 } },
]

const growthProfiles = {
  'dg-7': {
    playerId: 'dg-7',
    playerName: '林启航',
    role: '控场核心',
    focus: ['决策速度', '后场压迫破解', '强侧挡拆终结'],
    tags: ['持球组织提升', '三分稳定', '终结可继续强化'],
    advice: '建议增加高位挡拆后左侧抛投和弱侧分球训练，维持外线出手选择质量。',
    radar: [
      { label: '终结', value: 82 },
      { label: '投射', value: 79 },
      { label: '控运', value: 88 },
      { label: '决策', value: 85 },
      { label: '防守', value: 71 },
    ],
    trend: [
      { game: 'G1', efficiency: 16, shotQuality: 68 },
      { game: 'G2', efficiency: 18, shotQuality: 72 },
      { game: 'G3', efficiency: 19, shotQuality: 75 },
      { game: 'G4', efficiency: 21, shotQuality: 78 },
      { game: 'G5', efficiency: 23, shotQuality: 82 },
    ],
  },
  'dg-23': {
    playerId: 'dg-23',
    playerName: '周宇诚',
    role: '锋线支点',
    focus: ['弱侧切入', '持球后三威胁', '对抗下终结'],
    tags: ['篮板积极', '无球跑动好', '中距离波动'],
    advice: '建议在二次进攻后增加直接终结选择，减少长两分犹豫出手。',
    radar: [
      { label: '终结', value: 76 },
      { label: '投射', value: 68 },
      { label: '控运', value: 62 },
      { label: '决策', value: 74 },
      { label: '防守', value: 81 },
    ],
    trend: [
      { game: 'G1', efficiency: 12, shotQuality: 61 },
      { game: 'G2', efficiency: 14, shotQuality: 63 },
      { game: 'G3', efficiency: 15, shotQuality: 66 },
      { game: 'G4', efficiency: 16, shotQuality: 69 },
      { game: 'G5', efficiency: 18, shotQuality: 72 },
    ],
  },
  'gz-3': {
    playerId: 'gz-3',
    playerName: '赵沐阳',
    role: '主控发动机',
    focus: ['失误压缩', '高压下出球', '转换推进效率'],
    tags: ['持球突破强', '出球量高', '失误偏高'],
    advice: '建议强化高压防守下的第一拍保护和弱侧提前观察，降低被夹击失误。',
    radar: [
      { label: '终结', value: 74 },
      { label: '投射', value: 72 },
      { label: '控运', value: 84 },
      { label: '决策', value: 69 },
      { label: '防守', value: 63 },
    ],
    trend: [
      { game: 'G1', efficiency: 14, shotQuality: 63 },
      { game: 'G2', efficiency: 15, shotQuality: 66 },
      { game: 'G3', efficiency: 13, shotQuality: 61 },
      { game: 'G4', efficiency: 16, shotQuality: 67 },
      { game: 'G5', efficiency: 17, shotQuality: 70 },
    ],
  },
}

const eventStream = [
  { id: 'e1', quarter: 'Q4', time: '00:42', teamId: 'dg', playerId: 'dg-7', type: 'score', label: '林启航 挡拆后三分命中', score: '82-66' },
  { id: 'e2', quarter: 'Q4', time: '00:18', teamId: 'dg', playerId: 'dg-35', type: 'rebound', label: '吴景川 前场篮板后二次补篮', score: '84-66' },
  { id: 'e3', quarter: 'Q4', time: '00:05', teamId: 'gz', playerId: 'gz-18', type: 'score', label: '谭嘉睿 快攻上篮', score: '84-68' },
  { id: 'e4', quarter: 'Q4', time: '02:14', teamId: 'gz', playerId: 'gz-3', type: 'assist', label: '赵沐阳 突分助攻底角三分', score: '79-64' },
  { id: 'e5', quarter: 'Q4', time: '03:22', teamId: 'dg', playerId: 'dg-23', type: 'steal', label: '周宇诚 协防抢断后推进', score: '77-60' },
  { id: 'e6', quarter: 'Q4', time: '04:48', teamId: 'dg', playerId: 'dg-14', type: 'block', label: '李骏哲 护框封盖', score: '73-58' },
  { id: 'e7', quarter: 'Q3', time: '00:34', teamId: 'dg', playerId: 'dg-11', type: 'score', label: '陈泽昊 侧翼定点三分', score: '66-52' },
  { id: 'e8', quarter: 'Q3', time: '01:20', teamId: 'gz', playerId: 'gz-21', type: 'score', label: '程一凡 中距离急停', score: '63-52' },
  { id: 'e9', quarter: 'Q3', time: '03:11', teamId: 'dg', playerId: 'dg-35', type: 'score', label: '吴景川 低位背打得手', score: '59-46' },
  { id: 'e10', quarter: 'Q3', time: '04:03', teamId: 'dg', playerId: 'dg-7', type: 'assist', label: '林启航 反击长传助攻', score: '55-43' },
  { id: 'e11', quarter: 'Q3', time: '06:42', teamId: 'gz', playerId: 'gz-34', type: 'rebound', label: '何俊凯 前场篮板造成补防收缩', score: '49-39' },
  { id: 'e12', quarter: 'Q3', time: '08:18', teamId: 'dg', playerId: 'dg-23', type: 'score', label: '周宇诚 弱侧空切上篮', score: '46-35' },
  { id: 'e13', quarter: 'Q2', time: '00:28', teamId: 'gz', playerId: 'gz-3', type: 'score', label: '赵沐阳 压哨突破抛投', score: '43-33' },
  { id: 'e14', quarter: 'Q2', time: '01:35', teamId: 'dg', playerId: 'dg-5', type: 'score', label: '许朗 追身三分命中', score: '43-31' },
  { id: 'e15', quarter: 'Q2', time: '03:20', teamId: 'gz', playerId: 'gz-9', type: 'score', label: '卢皓宇 顶弧三分', score: '36-29' },
  { id: 'e16', quarter: 'Q2', time: '05:58', teamId: 'dg', playerId: 'dg-14', type: 'rebound', label: '李骏哲 连续保护后场篮板', score: '32-22' },
  { id: 'e17', quarter: 'Q2', time: '07:12', teamId: 'dg', playerId: 'dg-7', type: 'score', label: '林启航 挡拆后中投', score: '28-20' },
  { id: 'e18', quarter: 'Q1', time: '00:48', teamId: 'dg', playerId: 'dg-11', type: 'score', label: '陈泽昊 底角接应三分', score: '22-15' },
  { id: 'e19', quarter: 'Q1', time: '02:06', teamId: 'gz', playerId: 'gz-16', type: 'score', label: '徐天泽 顺下吃饼', score: '19-15' },
  { id: 'e20', quarter: 'Q1', time: '04:10', teamId: 'dg', playerId: 'dg-23', type: 'score', label: '周宇诚 弧顶持球突破', score: '15-9' },
  { id: 'e21', quarter: 'Q1', time: '06:12', teamId: 'gz', playerId: 'gz-3', type: 'score', label: '赵沐阳 反击上篮', score: '11-7' },
  { id: 'e22', quarter: 'Q1', time: '08:44', teamId: 'dg', playerId: 'dg-35', type: 'score', label: '吴景川 顺下终结', score: '7-2' },
]

const teamShotProfile = {
  dg: {
    rimShare: 38,
    rimPct: 63,
    midShare: 27,
    midPct: 44,
    threeShare: 35,
    threePct: 38,
    pace: 72,
    ortg: 116.7,
    drtg: 94.4,
    efg: 56.9,
    tov: 12.5,
    orb: 34.0,
    ftRate: 22.4,
  },
  gz: {
    rimShare: 34,
    rimPct: 49,
    midShare: 31,
    midPct: 37,
    threeShare: 35,
    threePct: 31,
    pace: 72,
    ortg: 94.4,
    drtg: 116.7,
    efg: 47.2,
    tov: 16.8,
    orb: 27.0,
    ftRate: 18.5,
  },
}

const heatmapPoints = {
  dg: [
    [0.52, 0.78, true, 'rim', 'dg-14'], [0.48, 0.8, true, 'rim', 'dg-35'], [0.57, 0.72, false, 'mid', 'dg-23'],
    [0.36, 0.42, true, 'three', 'dg-11'], [0.67, 0.39, true, 'three', 'dg-7'], [0.51, 0.55, true, 'mid', 'dg-7'],
    [0.43, 0.63, false, 'mid', 'dg-35'], [0.24, 0.34, false, 'three', 'dg-5'], [0.77, 0.34, true, 'three', 'dg-5'],
    [0.58, 0.85, true, 'rim', 'dg-14'], [0.39, 0.68, true, 'mid', 'dg-23'], [0.61, 0.64, false, 'mid', 'dg-11'],
    [0.18, 0.52, false, 'three', 'dg-2'], [0.83, 0.5, true, 'three', 'dg-18'], [0.54, 0.49, true, 'mid', 'dg-7'],
    [0.47, 0.83, true, 'rim', 'dg-35'], [0.32, 0.58, false, 'mid', 'dg-5'], [0.69, 0.61, true, 'mid', 'dg-11'],
  ],
  gz: [
    [0.51, 0.79, true, 'rim', 'gz-16'], [0.45, 0.74, false, 'mid', 'gz-34'], [0.63, 0.41, true, 'three', 'gz-3'],
    [0.38, 0.46, true, 'three', 'gz-9'], [0.55, 0.58, false, 'mid', 'gz-21'], [0.71, 0.67, false, 'mid', 'gz-3'],
    [0.27, 0.37, true, 'three', 'gz-12'], [0.8, 0.36, false, 'three', 'gz-9'], [0.5, 0.86, true, 'rim', 'gz-16'],
    [0.41, 0.63, false, 'mid', 'gz-34'], [0.58, 0.49, true, 'mid', 'gz-3'], [0.23, 0.51, false, 'three', 'gz-6'],
    [0.76, 0.51, true, 'three', 'gz-9'], [0.48, 0.7, true, 'rim', 'gz-21'], [0.61, 0.74, false, 'mid', 'gz-18'],
    [0.35, 0.58, false, 'mid', 'gz-12'], [0.68, 0.57, true, 'mid', 'gz-3'], [0.53, 0.82, true, 'rim', 'gz-16'],
  ],
}

function buildShotMap(rawPoints) {
  return Object.fromEntries(
    Object.entries(rawPoints).map(([teamId, points]) => {
      const shots = points.map(([x, y, made, zone, playerId], index) => ({
        id: `${teamId}-shot-${index + 1}`,
        x,
        y,
        made,
        zone,
        playerId,
      }))
      const players = [...new Set(shots.map((shot) => shot.playerId))]
      return [teamId, { shots, players }]
    })
  )
}

function sumTeamStat(teamId, statKey) {
  return playerStats
    .filter((player) => player.teamId === teamId)
    .reduce((sum, player) => sum + player[statKey], 0)
}

const teamSummary = {
  dg: {
    score: 84,
    rebounds: sumTeamStat('dg', 'reb'),
    assists: sumTeamStat('dg', 'ast'),
    steals: sumTeamStat('dg', 'stl'),
    blocks: sumTeamStat('dg', 'blk'),
    turnovers: sumTeamStat('dg', 'tov'),
    highlight: '第三节 8 比 0 攻势拉开差距',
    edge: '挡拆发起与二次进攻',
  },
  gz: {
    score: 68,
    rebounds: sumTeamStat('gz', 'reb'),
    assists: sumTeamStat('gz', 'ast'),
    steals: sumTeamStat('gz', 'stl'),
    blocks: sumTeamStat('gz', 'blk'),
    turnovers: sumTeamStat('gz', 'tov'),
    highlight: '后卫线推进维持比赛节奏',
    edge: '外线第一波投射',
  },
}

const quarterTrend = [
  { day: 1, label: 'Q1', seriesA: 22, seriesB: 15 },
  { day: 2, label: 'Q2', seriesA: 21, seriesB: 18 },
  { day: 3, label: 'Q3', seriesA: 23, seriesB: 19 },
  { day: 4, label: 'Q4', seriesA: 18, seriesB: 16 },
]

const topPerformers = ['dg-7', 'dg-23', 'gz-3']

export const ANALYSIS_REPORT = {
  matchMeta: {
    title: '运动数据分析中台',
    tags: ['单场复盘', '机构/教练端', '视频识别生成'],
    eventName: '湾区青训对抗赛',
    groupName: 'U17 男子组',
    date: '2026-07-28 19:00',
    venue: '东莞市体育中心训练馆',
    reportId: 'LBX-REPORT-20260728-017',
    sourceLabel: '视频识别生成',
    teams,
    quarterScores,
    bestPlayerId: 'dg-7',
    swingQuarter: '第三节',
    keyEdge: '挡拆后的投篮质量与前场篮板',
  },
  heroNotes: [
    { label: '最佳球员', value: '林启航 18+8+5' },
    { label: '胜负转折', value: '第三节 23:19' },
    { label: '关键优势项', value: '东莞二次进攻 13分' },
  ],
  teamSummary,
  quarterTrend,
  teamShotProfile,
  playerStats,
  growthProfiles,
  topPerformers,
  eventStream,
  shotMap: buildShotMap(heatmapPoints),
  keyMoments: [
    {
      title: '第三节 8:0 拉开分差',
      body: '东莞连续利用高位挡拆制造错位，弱侧锋线补位切入连续得分，比赛在这一段被真正拉开。',
    },
    {
      title: '广州外线效率波动',
      body: '广州第一节外线回应不错，但后两节在对抗提升后出现持球三分质量下降的问题。',
    },
    {
      title: '成长信号清晰',
      body: '林启航的决策速度和周宇诚的无球切入效率都呈持续上升，适合作为下一阶段重点培养样本。',
    },
  ],
}
