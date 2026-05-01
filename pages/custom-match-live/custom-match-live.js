// custom-match-live.js - 优化版（含计时器、双方队伍支持）
const app = getApp()

Page({
  data: {
    themeClass: '',
    pageBg: '#f8f7f4',
    navHeight: 0,
    matchId: null,
    players: [],
    totalScore: 0,
    selectedPlayer: null,
    selectedPlayerId: null,
    actionLog: [],
    showLog: false,
    teamAPlayers: [],
    teamBPlayers: [],

    // 计时器相关
    matchTime: '00:00:00',
    startTime: null,
    timerInterval: null,

    // 队伍统计
    teamACount: 0,
    teamBCount: 0,
    teamAScore: 0,
    teamBScore: 0,
    teamAFouls: 0,
    teamBFouls: 0,
    teamAFoulRecords: [],
    teamBFoulRecords: []
  },

  onLoad: function(options) {
    this.initTheme()
    this.setNavHeight()
    this.setData({ matchId: options.matchId })
    this.loadMatchData()
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
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 44
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48
    this.setData({
      navHeight: (statusBarHeight + navBarHeight) * 2
    })
  },

  onShow: function() {
    this._syncTheme()
    if (this.data.matchId) {
      this.loadMatchData()
      this.startTimer()
    }
  },

  onHide: function() {
    this.stopTimer()
  },

  onUnload: function() {
    this.stopTimer()
  },

  loadMatchData: function() {
    try {
      const matchData = wx.getStorageSync('custom_match_' + this.data.matchId)

      if (matchData && matchData.status === 'in_progress') {
        const players = this.normalizePlayers(matchData.players || [])
        const teamAFoulRecords = matchData.teamAFoulRecords || []
        const teamBFoulRecords = matchData.teamBFoulRecords || []
        const teamStats = this.calculateTeamStats(players, teamAFoulRecords, teamBFoulRecords)

        this.setData({
          players: players,
          teamAPlayers: players.filter(p => p.team === 'A'),
          teamBPlayers: players.filter(p => p.team === 'B'),
          totalScore: this.calculateTotalScore(players),
          actionLog: matchData.actionLog || [],
          teamACount: teamStats.teamACount,
          teamBCount: teamStats.teamBCount,
          teamAScore: teamStats.teamAScore,
          teamBScore: teamStats.teamBScore,
          teamAFouls: teamStats.teamAFouls,
          teamBFouls: teamStats.teamBFouls,
          teamAFoulRecords,
          teamBFoulRecords,
          startTime: new Date(matchData.startTime)
        })
      } else {
        wx.showToast({
          title: '比赛数据加载失败',
          icon: 'error'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (e) {
      console.error('加载比赛数据失败:', e)
      wx.showToast({
        title: '数据加载异常',
        icon: 'error'
      })
    }
  },

  // ===== 计时器功能 =====
  startTimer: function() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval)
    }

    if (!this.data.startTime) {
      this.setData({ startTime: new Date() })
    }

    this.updateMatchTime()

    this.data.timerInterval = setInterval(() => {
      this.updateMatchTime()
    }, 1000)
  },

  stopTimer: function() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval)
      this.data.timerInterval = null
    }
  },

  updateMatchTime: function() {
    if (!this.data.startTime) return

    const now = new Date()
    const diff = now - this.data.startTime

    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

    this.setData({ matchTime: timeStr })
  },

  calculateTotalScore: function(players) {
    return players.reduce((total, player) => total + (player.score || 0), 0)
  },

  normalizePlayers: function(players) {
    return players.map(player => ({
      ...player,
      score: player.score || 0,
      fouls: player.fouls || [],
      rebounds: player.rebounds || [],
      steals: player.steals || [],
      assists: player.assists || [],
      turnovers: player.turnovers || [],
      blocks: player.blocks || []
    }))
  },

  calculateTeamStats: function(players, teamAFoulRecords = this.data.teamAFoulRecords, teamBFoulRecords = this.data.teamBFoulRecords) {
    const teamAPlayers = players.filter(p => p.team === 'A')
    const teamBPlayers = players.filter(p => p.team === 'B')
    return {
      teamACount: teamAPlayers.length,
      teamBCount: teamBPlayers.length,
      teamAScore: teamAPlayers.reduce((sum, p) => sum + (p.score || 0), 0),
      teamBScore: teamBPlayers.reduce((sum, p) => sum + (p.score || 0), 0),
      teamAFouls: teamAPlayers.reduce((sum, p) => sum + ((p.fouls || []).length), 0) + teamAFoulRecords.length,
      teamBFouls: teamBPlayers.reduce((sum, p) => sum + ((p.fouls || []).length), 0) + teamBFoulRecords.length
    }
  },

  selectPlayer: function(e) {
    const player = e.currentTarget.dataset.player
    this.setData({
      selectedPlayer: player,
      selectedPlayerId: player.id
    })
  },

  closePlayerAction: function() {
    this.setData({
      selectedPlayer: null,
      selectedPlayerId: null
    })
  },

  addScore: function(e) {
    const points = parseInt(e.currentTarget.dataset.points)
    const scoreType = e.currentTarget.dataset.scoreType || `${points}分`
    const playerId = this.data.selectedPlayer.id
    const players = this.data.players
    const playerIndex = players.findIndex(p => p.id === playerId)

    if (playerIndex !== -1) {
      const oldScore = players[playerIndex].score
      players[playerIndex].score += points

      this.recordAction({
        type: 'score',
        playerName: players[playerIndex].name,
        action: `${scoreType} +${points}分 (${oldScore} → ${players[playerIndex].score})`,
        playerId: playerId,
        points: points,
        scoreType: scoreType,
        oldScore: oldScore,
        newScore: players[playerIndex].score
      })

      this.updateMatchData(players)

      wx.showToast({
        title: '操作成功',
        icon: 'success',
        duration: 800
      })
    }

    this.closePlayerAction()
  },

  recordFoul: function(e) {
    const playerId = this.data.selectedPlayer.id
    const players = this.data.players
    const playerIndex = players.findIndex(p => p.id === playerId)

    if (playerIndex !== -1) {
      const timestamp = new Date().toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      const foulRecord = {
        type: 'foul',
        time: timestamp
      }

      players[playerIndex].fouls = players[playerIndex].fouls || []
      players[playerIndex].fouls.push(foulRecord)

      this.recordAction({
        type: 'foul',
        playerName: players[playerIndex].name,
        action: `个人犯规 ${players[playerIndex].fouls.length}次`,
        playerId: playerId,
        statField: 'fouls',
        foulRecord: foulRecord
      })

      this.updateMatchData(players)

      wx.showToast({
        title: '犯规已记录',
        icon: 'success',
        duration: 800
      })
    }

    this.closePlayerAction()
  },

  recordTeamFoul: function(e) {
    const team = e.currentTarget.dataset.team || this.data.selectedPlayer?.team
    if (!team) return

    const timestamp = new Date().toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    const foulRecord = {
      type: 'teamFoul',
      team,
      time: timestamp
    }
    const teamAFoulRecords = [...this.data.teamAFoulRecords]
    const teamBFoulRecords = [...this.data.teamBFoulRecords]

    if (team === 'A') {
      teamAFoulRecords.push(foulRecord)
    } else {
      teamBFoulRecords.push(foulRecord)
    }

    this.recordAction({
      type: 'teamFoul',
      playerName: `${team}队`,
      action: '团队犯规',
      team,
      foulRecord
    })

    this.setData({ teamAFoulRecords, teamBFoulRecords })
    this.updateMatchData(this.data.players, teamAFoulRecords, teamBFoulRecords)

    wx.showToast({
      title: `${team}队团队犯规+1`,
      icon: 'success',
      duration: 800
    })

    this.closePlayerAction()
  },

  recordStat: function(e) {
    const statField = e.currentTarget.dataset.stat
    const statName = e.currentTarget.dataset.statName
    const playerId = this.data.selectedPlayer.id
    const players = this.data.players
    const playerIndex = players.findIndex(p => p.id === playerId)

    if (playerIndex !== -1) {
      const timestamp = new Date().toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      const statRecord = {
        type: statField,
        time: timestamp
      }

      players[playerIndex][statField] = players[playerIndex][statField] || []
      players[playerIndex][statField].push(statRecord)

      this.recordAction({
        type: 'stat',
        playerName: players[playerIndex].name,
        action: `${statName} +1`,
        playerId: playerId,
        statField: statField,
        statName: statName,
        statRecord: statRecord
      })

      this.updateMatchData(players)

      wx.showToast({
        title: `${statName}+1`,
        icon: 'success',
        duration: 800
      })
    }

    this.closePlayerAction()
  },

  recordAction: function(actionData) {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const logEntry = {
      ...actionData,
      timestamp: now.toISOString(),
      time: timeStr,
      id: Date.now()
    }

    this.setData({
      actionLog: [logEntry, ...this.data.actionLog]
    })
  },

  updateMatchData: function(players, teamAFoulRecords = this.data.teamAFoulRecords, teamBFoulRecords = this.data.teamBFoulRecords) {
    const totalScore = this.calculateTotalScore(players)
    const teamStats = this.calculateTeamStats(players, teamAFoulRecords, teamBFoulRecords)
    const matchData = wx.getStorageSync('custom_match_' + this.data.matchId) || {}

    this.setData({
      players: players,
      teamAPlayers: players.filter(p => p.team === 'A'),
      teamBPlayers: players.filter(p => p.team === 'B'),
      totalScore: totalScore,
      teamACount: teamStats.teamACount,
      teamBCount: teamStats.teamBCount,
      teamAScore: teamStats.teamAScore,
      teamBScore: teamStats.teamBScore,
      teamAFouls: teamStats.teamAFouls,
      teamBFouls: teamStats.teamBFouls,
      teamAFoulRecords,
      teamBFoulRecords
    })

    try {
      const nextMatchData = {
        ...matchData,
        matchId: this.data.matchId,
        players: players,
        status: 'in_progress',
        totalScore: totalScore,
        teamAScore: teamStats.teamAScore,
        teamBScore: teamStats.teamBScore,
        teamAFouls: teamStats.teamAFouls,
        teamBFouls: teamStats.teamBFouls,
        teamAFoulRecords,
        teamBFoulRecords,
        actionLog: this.data.actionLog
      }

      wx.setStorageSync('custom_match_' + this.data.matchId, nextMatchData)
      wx.setStorageSync('unfinished_custom_match', nextMatchData)
    } catch (e) {
      console.error('保存比赛数据失败:', e)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  undoLastAction: function() {
    if (this.data.actionLog.length === 0) {
      return
    }

    const lastAction = this.data.actionLog[0]
    const players = this.data.players
    let teamAFoulRecords = this.data.teamAFoulRecords
    let teamBFoulRecords = this.data.teamBFoulRecords

    if (lastAction.type === 'score') {
      const playerIndex = players.findIndex(p => p.id === lastAction.playerId)
      if (playerIndex !== -1) {
        players[playerIndex].score = lastAction.oldScore
      }
    } else if (lastAction.type === 'foul') {
      const playerIndex = players.findIndex(p => p.id === lastAction.playerId)
      if (playerIndex !== -1 && players[playerIndex].fouls) {
        players[playerIndex].fouls.pop()
      }
    } else if (lastAction.type === 'stat') {
      const playerIndex = players.findIndex(p => p.id === lastAction.playerId)
      if (playerIndex !== -1 && players[playerIndex][lastAction.statField]) {
        players[playerIndex][lastAction.statField].pop()
      }
    } else if (lastAction.type === 'teamFoul') {
      if (lastAction.team === 'A') {
        teamAFoulRecords = teamAFoulRecords.slice(0, -1)
      } else {
        teamBFoulRecords = teamBFoulRecords.slice(0, -1)
      }
    }

    const newActionLog = this.data.actionLog.slice(1)

    this.setData({
      actionLog: newActionLog
    })

    this.updateMatchData(players, teamAFoulRecords, teamBFoulRecords)

    wx.showToast({
      title: '已撤销',
      icon: 'success',
      duration: 800
    })
  },

  toggleLog: function() {
    this.setData({
      showLog: !this.data.showLog
    })
  },

  exitMatch: function() {
    this.stopTimer()

    wx.showModal({
      title: '退出比赛',
      content: '是否退出比赛？未结束的比赛数据将临时保存，可从原入口恢复继续比赛',
      confirmText: '确认退出',
      cancelText: '继续比赛',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        } else {
          this.startTimer()
        }
      }
    })
  },

  endMatch: function() {
    this.stopTimer()

    wx.showModal({
      title: '结束比赛',
      content: `是否确认结束本场比赛？\n比赛时长：${this.data.matchTime}\n结束后将生成最终赛果与分析报告，不可修改`,
      confirmText: '确认结束',
      confirmColor: '#D4AF37',
      success: (res) => {
        if (res.confirm) {
          this.confirmEndMatch()
        } else {
          this.startTimer()
        }
      }
    })
  },

  confirmEndMatch: function() {
    try {
      const matchData = wx.getStorageSync('custom_match_' + this.data.matchId)

      matchData.status = 'completed'
      matchData.endTime = new Date().toISOString()
      matchData.finalTotalScore = this.data.totalScore
      matchData.teamAScore = this.data.teamAScore
      matchData.teamBScore = this.data.teamBScore
      matchData.teamAFouls = this.data.teamAFouls
      matchData.teamBFouls = this.data.teamBFouls
      matchData.teamAFoulRecords = this.data.teamAFoulRecords
      matchData.teamBFoulRecords = this.data.teamBFoulRecords
      matchData.duration = this.data.matchTime

      wx.setStorageSync('custom_match_' + this.data.matchId, matchData)
      wx.removeStorageSync('unfinished_custom_match')

      const finishedMatches = wx.getStorageSync('finished_custom_matches') || []
      finishedMatches.push({
        matchId: this.data.matchId,
        endTime: matchData.endTime,
        totalScore: matchData.finalTotalScore,
        playerCount: this.data.players.length,
        duration: matchData.duration
      })
      wx.setStorageSync('finished_custom_matches', finishedMatches)

      wx.navigateTo({
        url: `/pages/custom-match-result/custom-match-result?matchId=${this.data.matchId}`
      })
    } catch (e) {
      console.error('结束比赛失败:', e)
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'error'
      })
    }
  }
})
