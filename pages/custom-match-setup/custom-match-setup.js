// custom-match-setup.js - 支持双方队伍
const app = getApp()

// ===== 一键示例赛果（演示数据） =====
// 示例档案：高中联队 4 节 × 12 分钟，A 86 : 79 B，赛果页完整呈现得分 / 犯规 / 关键球员 / 球员数据表
// 每个球员给出投篮构成（three 三分球 / two 两分球 / ft 罚球）与其余技术统计，得分由投篮构成自动累加
const DEMO_ROSTER = [
  // A 队（86 分）
  { team: 'A', name: '张浩然', number: '7', three: 3, two: 2, ft: 2, rebounds: 4, assists: 9, steals: 2, blocks: 0, turnovers: 3, fouls: 2 },
  { team: 'A', name: '李俊杰', number: '11', three: 4, two: 4, ft: 2, rebounds: 5, assists: 3, steals: 2, blocks: 1, turnovers: 2, fouls: 3 },
  { team: 'A', name: '王梓豪', number: '23', three: 2, two: 5, ft: 2, rebounds: 8, assists: 4, steals: 2, blocks: 1, turnovers: 2, fouls: 2 },
  { team: 'A', name: '陈子轩', number: '15', three: 1, two: 4, ft: 2, rebounds: 10, assists: 2, steals: 1, blocks: 2, turnovers: 2, fouls: 3 },
  { team: 'A', name: '刘博文', number: '33', three: 0, two: 5, ft: 2, rebounds: 13, assists: 1, steals: 0, blocks: 3, turnovers: 2, fouls: 2 },
  { team: 'A', name: '赵天宇', number: '5', three: 1, two: 1, ft: 1, rebounds: 2, assists: 4, steals: 1, blocks: 0, turnovers: 1, fouls: 1 },
  // B 队（79 分）
  { team: 'B', name: '周奕辰', number: '3', three: 3, two: 2, ft: 3, rebounds: 3, assists: 8, steals: 2, blocks: 0, turnovers: 4, fouls: 3 },
  { team: 'B', name: '吴泽楷', number: '8', three: 3, two: 4, ft: 2, rebounds: 4, assists: 2, steals: 3, blocks: 0, turnovers: 3, fouls: 2 },
  { team: 'B', name: '郑一鸣', number: '21', three: 2, two: 3, ft: 3, rebounds: 7, assists: 3, steals: 1, blocks: 1, turnovers: 5, fouls: 4 },
  { team: 'B', name: '孙立诚', number: '32', three: 1, two: 3, ft: 2, rebounds: 9, assists: 1, steals: 0, blocks: 2, turnovers: 2, fouls: 3 },
  { team: 'B', name: '何俊熙', number: '41', three: 0, two: 4, ft: 2, rebounds: 12, assists: 2, steals: 1, blocks: 3, turnovers: 3, fouls: 2 },
  { team: 'B', name: '林嘉豪', number: '6', three: 2, two: 0, ft: 2, rebounds: 2, assists: 3, steals: 0, blocks: 0, turnovers: 1, fouls: 1 }
]

// 比赛时间轴：4 节 × 12 分钟，节间休息 3 分钟，半场休息 15 分钟
const DEMO_QUARTER_OFFSET = [0, 900, 2520, 3420]
const DEMO_QUARTER_SECONDS = 720
const DEMO_TOTAL_SECONDS = 4140
const DEMO_DURATION_TEXT = '01:09:00'
const DEMO_TEAM_FOULS = { A: 3, B: 4 }
// 各节比分起伏（得分动作数按节分配），其余统计按节均分
const DEMO_SCORE_WEIGHTS = { A: [0.26, 0.21, 0.28, 0.25], B: [0.24, 0.29, 0.22, 0.25] }
const DEMO_EVEN_WEIGHTS = [0.25, 0.25, 0.25, 0.25]
const DEMO_STAT_FIELDS = ['rebounds', 'assists', 'steals', 'blocks', 'turnovers', 'fouls']
const DEMO_STAT_NAMES = { rebounds: '篮板', assists: '助攻', steals: '抢断', blocks: '盖帽', turnovers: '失误' }

function demoPad2(n) { return String(n).padStart(2, '0') }

function demoClock(totalSeconds) {
  const s = totalSeconds % 86400
  return `${demoPad2(Math.floor(s / 3600))}:${demoPad2(Math.floor((s % 3600) / 60))}:${demoPad2(s % 60)}`
}

// 固定种子伪随机：同一套示例数据每次生成结果一致，便于反复演示
function demoRng(seed) {
  let state = seed >>> 0
  return function () {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function demoSplitByWeights(total, weights) {
  const exact = weights.map(w => total * w)
  const counts = exact.map(Math.floor)
  let rest = total - counts.reduce((a, b) => a + b, 0)
  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
  let k = 0
  while (rest > 0) {
    counts[order[k % order.length].i] += 1
    rest -= 1
    k += 1
  }
  return counts
}

function demoShuffle(list, rng) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = list[i]
    list[i] = list[j]
    list[j] = tmp
  }
  return list
}

// 把 n 个事件按权重分到 4 节
function demoDistributeByQuarter(items, weights, rng) {
  const counts = demoSplitByWeights(items.length, weights)
  demoShuffle(items, rng)
  const byQuarter = [[], [], [], []]
  let cursor = 0
  counts.forEach((count, q) => {
    for (let i = 0; i < count; i++) byQuarter[q].push(items[cursor++])
  })
  return byQuarter
}

// 生成一场数据完整的示例比赛（status: completed，可直接进赛果页）
function buildDemoMatchData(matchId) {
  const rng = demoRng(20260919)
  const now = new Date()
  const baseMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startWallSec = 19 * 3600 + 30 * 60
  let idSeed = Date.now()

  const players = []
  const events = []

  DEMO_ROSTER.forEach(cfg => {
    const player = {
      id: ++idSeed,
      name: cfg.name,
      number: cfg.number,
      avatar: '',
      team: cfg.team,
      score: 0,
      fouls: [],
      rebounds: [],
      steals: [],
      assists: [],
      turnovers: [],
      blocks: []
    }
    players.push(player)

    const scoreItems = []
    for (let i = 0; i < cfg.three; i++) scoreItems.push({ kind: 'score', points: 3, scoreType: '三分球' })
    for (let i = 0; i < cfg.two; i++) scoreItems.push({ kind: 'score', points: 2, scoreType: '投篮' })
    for (let i = 0; i < cfg.ft; i++) scoreItems.push({ kind: 'score', points: 1, scoreType: '罚球' })

    demoDistributeByQuarter(scoreItems, DEMO_SCORE_WEIGHTS[cfg.team], rng).forEach((list, q) => {
      list.forEach(item => events.push({ ...item, player, quarter: q }))
    })

    DEMO_STAT_FIELDS.forEach(field => {
      const items = Array.from({ length: cfg[field] }, () => ({ kind: field, player }))
      demoDistributeByQuarter(items, DEMO_EVEN_WEIGHTS, rng).forEach((list, q) => {
        list.forEach(item => events.push({ ...item, quarter: q }))
      })
    })
  })

  ;['A', 'B'].forEach(team => {
    const items = Array.from({ length: DEMO_TEAM_FOULS[team] }, () => ({ kind: 'teamFoul', team }))
    demoDistributeByQuarter(items, DEMO_EVEN_WEIGHTS, rng).forEach((list, q) => {
      list.forEach(item => events.push({ ...item, quarter: q }))
    })
  })

  events.forEach(ev => { ev.pos = rng() })
  events.sort((a, b) => a.quarter - b.quarter || a.pos - b.pos)

  const teamAFoulRecords = []
  const teamBFoulRecords = []
  const actionLogAsc = []

  events.forEach(ev => {
    const elapsed = startWallSec + DEMO_QUARTER_OFFSET[ev.quarter] + Math.floor(ev.pos * DEMO_QUARTER_SECONDS)
    const timeStr = demoClock(elapsed)
    const timestamp = new Date(baseMs + elapsed * 1000).toISOString()
    const logId = ++idSeed

    if (ev.kind === 'score') {
      const player = ev.player
      const oldScore = player.score
      player.score += ev.points
      actionLogAsc.push({
        type: 'score',
        playerName: player.name,
        action: `${ev.scoreType} +${ev.points}分 (${oldScore} → ${player.score})`,
        playerId: player.id,
        points: ev.points,
        scoreType: ev.scoreType,
        oldScore,
        newScore: player.score,
        timestamp,
        time: timeStr,
        id: logId
      })
      return
    }

    if (ev.kind === 'teamFoul') {
      const record = { type: 'teamFoul', team: ev.team, time: timeStr }
      if (ev.team === 'A') {
        teamAFoulRecords.push(record)
      } else {
        teamBFoulRecords.push(record)
      }
      actionLogAsc.push({
        type: 'teamFoul',
        playerName: `${ev.team}队`,
        action: '团队犯规',
        team: ev.team,
        foulRecord: record,
        timestamp,
        time: timeStr,
        id: logId
      })
      return
    }

    const player = ev.player

    if (ev.kind === 'fouls') {
      const foulRecord = { type: 'foul', time: timeStr }
      player.fouls.push(foulRecord)
      actionLogAsc.push({
        type: 'foul',
        playerName: player.name,
        action: `个人犯规 ${player.fouls.length}次`,
        playerId: player.id,
        statField: 'fouls',
        foulRecord,
        timestamp,
        time: timeStr,
        id: logId
      })
      return
    }

    const statRecord = { type: ev.kind, time: timeStr }
    player[ev.kind].push(statRecord)
    actionLogAsc.push({
      type: 'stat',
      playerName: player.name,
      action: `${DEMO_STAT_NAMES[ev.kind]} +1`,
      playerId: player.id,
      statField: ev.kind,
      statName: DEMO_STAT_NAMES[ev.kind],
      statRecord,
      timestamp,
      time: timeStr,
      id: logId
    })
  })

  const sumScore = team => players.filter(p => p.team === team).reduce((sum, p) => sum + p.score, 0)
  const sumFouls = team => players.filter(p => p.team === team).reduce((sum, p) => sum + p.fouls.length, 0)
  const teamAScore = sumScore('A')
  const teamBScore = sumScore('B')

  return {
    matchId,
    players,
    startTime: new Date(baseMs + startWallSec * 1000).toISOString(),
    endTime: new Date(baseMs + (startWallSec + DEMO_TOTAL_SECONDS) * 1000).toISOString(),
    status: 'completed',
    totalScore: teamAScore + teamBScore,
    finalTotalScore: teamAScore + teamBScore,
    teamAScore,
    teamBScore,
    teamAFouls: sumFouls('A') + teamAFoulRecords.length,
    teamBFouls: sumFouls('B') + teamBFoulRecords.length,
    teamAFoulRecords,
    teamBFoulRecords,
    actionLog: actionLogAsc.reverse(),
    duration: DEMO_DURATION_TEXT
  }
}

Page({
  data: {
    themeClass: '',
    pageBg: '#f8f7f4',
    navHeight: 0,
    players: [],
    matchId: null,
    currentTeam: 'A',
    teamAPlayers: [],
    teamBPlayers: []
  },

  onLoad: function(options) {
    this.initTheme()
    this.setNavHeight()
    this.setData({
      matchId: options.matchId || 'custom_' + Date.now()
    })

    this.initPlayers()
  },

  _syncTheme: function() {
    const ut = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark'), pageBg })
    app.applyNavBarColor(app.getTheme())
  },

  initTheme: function() { this._syncTheme() },

  setTheme: function(theme) { this._syncTheme() },

  setNavHeight: function() {
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {}
    const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {}
    const statusBarHeight = windowInfo.statusBarHeight || 44
    const navBarHeight = deviceInfo.platform === 'ios' ? 44 : 48
    this.setData({
      navHeight: (statusBarHeight + navBarHeight) * 2
    })
  },

  onShow: function() {
    this._syncTheme()
    this.checkUnfinishedMatch()
  },

  initPlayers: function() {
    const now = Date.now()
    const teamA = Array.from({ length: 5 }, (_, index) => ({
      id: now + index,
      name: `A${index + 1}号`,
      number: String(index + 1),
      avatar: '',
      team: 'A',
      nameError: '',
      numberError: ''
    }))
    const teamB = Array.from({ length: 5 }, (_, index) => ({
      id: now + 5 + index,
      name: `B${index + 1}号`,
      number: String(index + 1),
      avatar: '',
      team: 'B',
      nameError: '',
      numberError: ''
    }))
    const defaultPlayers = [...teamA, ...teamB]
    
    this.setData({ 
      players: defaultPlayers 
    })
    this.updateTeamPlayers()
  },

  updateTeamPlayers: function() {
    const players = this.data.players
    const teamAPlayers = players
      .filter(p => p.team === 'A')
      .map((p, index) => ({ ...p, _originalIndex: players.indexOf(p) }))
    
    const teamBPlayers = players
      .filter(p => p.team === 'B')
      .map((p, index) => ({ ...p, _originalIndex: players.indexOf(p) }))
    
    this.setData({
      teamAPlayers,
      teamBPlayers
    })
  },

  checkUnfinishedMatch: function() {
    try {
      const unfinishedMatch = wx.getStorageSync('unfinished_custom_match')
      if (unfinishedMatch && unfinishedMatch.matchId === this.data.matchId) {
        wx.showModal({
          title: '恢复比赛',
          content: '检测到未完成的比赛，是否恢复继续？',
          confirmText: '恢复比赛',
          cancelText: '重新开始',
          success: (res) => {
            if (res.confirm) {
              this.resumeMatch(unfinishedMatch)
            } else {
              wx.removeStorageSync('unfinished_custom_match')
              this.initPlayers()
            }
          }
        })
      }
    } catch (e) {
      console.log('检查未完成比赛失败:', e)
    }
  },

  resumeMatch: function(matchData) {
    this.setData({ 
      players: matchData.players || [] 
    })
    this.updateTeamPlayers()
    wx.navigateTo({
      url: `/pages/custom-match-live/custom-match-live?matchId=${this.data.matchId}`
    })
  },

  goBack: function() {
    wx.navigateBack()
  },

  switchTeam: function(e) {
    const team = e.currentTarget.dataset.team
    this.setData({ currentTeam: team })
  },

  onNameInput: function(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const value = e.detail.value.trim()
    const players = this.data.players
    players[index].name = value
    
    if (value.length > 0 && (value.length < 2 || value.length > 10)) {
      players[index].nameError = '姓名需2-10个字符'
    } else {
      players[index].nameError = ''
    }
    
    this.setData({ players })
    this.updateTeamPlayers()
  },

  onNumberInput: function(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const value = e.detail.value.trim()
    const players = this.data.players
    const currentTeam = players[index].team  // 获取当前球员所属队伍
    players[index].number = value
    
    if (value.length > 0) {
      if (!/^\d{1,3}$/.test(value) || parseInt(value) < 1 || parseInt(value) > 999) {
        players[index].numberError = '请输入1-999的数字'
      } else if (this.checkDuplicateNumber(index, value, currentTeam)) {
        players[index].numberError = `${currentTeam}队${value}号球衣编号已存在，请修改`
      } else {
        players[index].numberError = ''
      }
    } else {
      players[index].numberError = ''
    }
    
    this.setData({ players })
    this.updateTeamPlayers()
  },

  // 检查同队内编号是否重复（跨队可相同）
  checkDuplicateNumber: function(currentIndex, number, team) {
    const players = this.data.players
    for (let i = 0; i < players.length; i++) {
      // 只检查同队且不是当前球员的
      if (i !== currentIndex && 
          players[i].team === team && 
          players[i].number === number) {
        return true
      }
    }
    return false
  },

  chooseAvatar: function(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        const players = this.data.players
        players[index].avatar = tempFilePath
        this.setData({ players })
        this.updateTeamPlayers()
      }
    })
  },

  addPlayerToTeam: function(e) {
    const team = e.currentTarget.dataset.team
    
    if (this.data.players.length >= 30) {
      wx.showToast({
        title: '单场比赛最多支持30名参赛球员',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const newPlayer = {
      id: Date.now(),
      name: '',
      number: '',
      avatar: '',
      team: team,
      nameError: '',
      numberError: ''
    }

    this.setData({
      players: [...this.data.players, newPlayer]
    })

    this.updateTeamPlayers()

    wx.showToast({
      title: `已添加到${team}队`,
      icon: 'success',
      duration: 1000
    })
  },

  deletePlayer: function(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    
    if (this.data.players.length <= 2) {
      wx.showToast({
        title: '比赛最少需2名参赛球员',
        icon: 'none',
        duration: 2000
      })
      return
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除该球员吗？`,
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          const players = this.data.players
          players.splice(index, 1)
          this.setData({ players })
          this.updateTeamPlayers()
          
          wx.showToast({
            title: '已删除球员',
            icon: 'success',
            duration: 1000
          })
        }
      }
    })
  },

  validateForm: function() {
    const players = this.data.players
    let isValid = true
    let errorMessage = ''

    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      
      if (!player.name || player.name.trim().length < 2 || player.name.trim().length > 10) {
        players[i].nameError = '姓名需2-10个字符'
        isValid = false
      } else {
        players[i].nameError = ''
      }

      if (!player.number || !/^\d{1,3}$/.test(player.number)) {
        players[i].numberError = '请输入有效的球衣编号'
        isValid = false
      } else if (this.checkDuplicateNumber(i, player.number, player.team)) {
        players[i].numberError = `${player.team}队${player.number}号已存在`
        isValid = false
        if (!errorMessage) {
          errorMessage = `${player.team}队${player.number}号球衣编号重复，请修改`
        }
      } else {
        players[i].numberError = ''
      }
    }

    this.setData({ players })
    this.updateTeamPlayers()

    if (!isValid && !errorMessage) {
      errorMessage = '请完善所有球员信息'
    }

    return { isValid, errorMessage }
  },

  startMatch: function() {
    const validation = this.validateForm()
    
    if (!validation.isValid) {
      wx.showToast({
        title: validation.errorMessage,
        icon: 'none',
        duration: 2500
      })
      return
    }

    const teamACount = this.data.players.filter(p => p.team === 'A').length
    const teamBCount = this.data.players.filter(p => p.team === 'B').length

    if (teamACount === 0 || teamBCount === 0) {
      wx.showToast({
        title: 'A队和B队至少各需1名球员',
        icon: 'none',
        duration: 2500
      })
      return
    }

    wx.showModal({
      title: '确认开始比赛',
      content: `是否确认开始比赛？\nA队：${teamACount}人\nB队：${teamBCount}人\n开赛后不可修改球员名单`,
      confirmText: '确认开始',
      confirmColor: '#D4AF37',
      success: (res) => {
        if (res.confirm) {
          this.confirmStartMatch()
        }
      }
    })
  },

  confirmStartMatch: function() {
    const initStatFields = (player) => ({
      ...player,
      score: 0,
      fouls: [],
      rebounds: [],
      steals: [],
      assists: [],
      turnovers: [],
      blocks: []
    })

    const matchData = {
      matchId: this.data.matchId,
      players: this.data.players.map(initStatFields),
      startTime: new Date().toISOString(),
      status: 'in_progress',
      totalScore: 0,
      teamAScore: 0,
      teamBScore: 0,
      teamAFouls: 0,
      teamBFouls: 0,
      actionLog: []
    }

    try {
      wx.setStorageSync('custom_match_' + this.data.matchId, matchData)
      wx.setStorageSync('unfinished_custom_match', matchData)

      wx.navigateTo({
        url: `/pages/custom-match-live/custom-match-live?matchId=${this.data.matchId}`
      })
    } catch (e) {
      console.error('保存比赛数据失败:', e)
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'error'
      })
    }
  },

  // 一键示例赛果：生成一场数据完整的比赛，直接进入赛果报告页（不影响当前填写的球员名单）
  viewDemoResult: function() {
    try {
      const matchId = 'demo_' + Date.now()
      const matchData = buildDemoMatchData(matchId)

      wx.setStorageSync('custom_match_' + matchId, matchData)

      const finishedMatches = wx.getStorageSync('finished_custom_matches') || []
      finishedMatches.push({
        matchId,
        endTime: matchData.endTime,
        totalScore: matchData.finalTotalScore,
        playerCount: matchData.players.length,
        duration: matchData.duration
      })
      wx.setStorageSync('finished_custom_matches', finishedMatches)

      wx.navigateTo({
        url: `/pages/custom-match-result/custom-match-result?matchId=${matchId}`
      })
    } catch (e) {
      console.error('生成示例赛果失败:', e)
      wx.showToast({
        title: '示例数据生成失败',
        icon: 'error'
      })
    }
  }
})
