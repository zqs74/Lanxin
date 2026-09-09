// custom-match-result.js - 按A队B队分组显示 + 修复比赛时长
const app = getApp()
const matchSync = require('../../utils/custom-match-sync')

Page({
  data: {
    themeClass: '',
    pageBg: '#f8f7f4',
    navHeight: 0,
    matchId: null,
    players: [],
    finalTotalScore: 0,
    actionLog: [],
    playerRanking: [],
    
    // A队B队分组数据
    teamAPlayers: [],
    teamBPlayers: [],
    teamARanking: [],
    teamBRanking: [],
    teamATotalScore: 0,
    teamBTotalScore: 0,
    winnerText: '',
    scoreDiff: 0,
    scoreDiffText: '平',
    mvpPlayer: null,
    topScorer: null,
    topScorerMeta: '-',
    mvpPlayerMeta: '-',
    statLeaders: [],
    statTotals: {},
    
    foulStats: {},
    allFouls: [],
    totalFouls: 0,
    teamAFouls: 0,
    teamBFouls: 0,
    
    matchDuration: '',
    totalActions: 0,
    avgEfficiency: '0',
    keyMoments: []
  },

  onLoad: function(options) {
    this.initTheme()
    this.setNavHeight()
    this.setData({ matchId: options.matchId })
    this.loadMatchResult()
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

  loadMatchResult: async function() {
    try {
      const local = matchSync.read(this.data.matchId)
      if (local && local.status === 'completed') this.applyMatchResult(local)
      const matchData = await matchSync.load(this.data.matchId)
      
      if (matchData && matchData.status === 'completed') {
        this.applyMatchResult(matchData)
      } else {
        wx.showToast({ title: '比赛数据不存在', icon: 'error' })
        setTimeout(() => { wx.navigateBack() }, 1500)
      }
    } catch (e) {
      console.error('加载比赛结果失败:', e)
      wx.showToast({ title: '数据加载失败', icon: 'error' })
    }
  },

  onHide: function() { return matchSync.sync(this.data.matchId) },
  onUnload: function() { return this.onHide() },

  applyMatchResult: function(matchData) {
        const players = this.normalizePlayers(matchData.players || [])
        const actionLog = matchData.actionLog || []
        const teamAFoulRecords = matchData.teamAFoulRecords || []
        const teamBFoulRecords = matchData.teamBFoulRecords || []
        
        // 分离A队和B队球员
        const enrichedPlayers = this.enrichPlayers(players)
        const teamAPlayers = enrichedPlayers.filter(p => p.team === 'A')
        const teamBPlayers = enrichedPlayers.filter(p => p.team === 'B')
        
        // 计算各队总分
        const teamATotalScore = teamAPlayers.reduce((sum, p) => sum + (p.score || 0), 0)
        const teamBTotalScore = teamBPlayers.reduce((sum, p) => sum + (p.score || 0), 0)
        
        this.setData({
          players: enrichedPlayers,
          teamAPlayers: teamAPlayers,
          teamBPlayers: teamBPlayers,
          actionLog: actionLog,
          finalTotalScore: matchData.finalTotalScore || 0,
          teamATotalScore: teamATotalScore,
          teamBTotalScore: teamBTotalScore,
          winnerText: this.getWinnerText(teamATotalScore, teamBTotalScore),
          scoreDiff: Math.abs(teamATotalScore - teamBTotalScore),
          scoreDiffText: Math.abs(teamATotalScore - teamBTotalScore) === 0 ? '平' : `${Math.abs(teamATotalScore - teamBTotalScore)}分`
        })

        // 生成各队排行
        this.generateTeamRankings(teamAPlayers, teamBPlayers, teamATotalScore, teamBTotalScore)
        
        // 计算比赛时长 - 修复显示问题
        this.calculateMatchDuration(matchData.startTime, matchData.endTime, matchData.duration)
        
        // 生成分析数据
        this.generateAnalysisData(enrichedPlayers, actionLog, teamAFoulRecords, teamBFoulRecords)
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

  statCount: function(player, field) {
    return (player[field] || []).length
  },

  enrichPlayers: function(players) {
    return players.map(player => {
      const rebounds = this.statCount(player, 'rebounds')
      const assists = this.statCount(player, 'assists')
      const steals = this.statCount(player, 'steals')
      const turnovers = this.statCount(player, 'turnovers')
      const blocks = this.statCount(player, 'blocks')
      const fouls = this.statCount(player, 'fouls')
      const efficiency = (player.score || 0) + rebounds + assists + steals + blocks - turnovers - fouls

      return {
        ...player,
        teamLabel: `${player.team}队`,
        reboundsCount: rebounds,
        assistsCount: assists,
        stealsCount: steals,
        turnoversCount: turnovers,
        blocksCount: blocks,
        foulsCount: fouls,
        efficiency
      }
    })
  },

  getWinnerText: function(teamATotal, teamBTotal) {
    if (teamATotal === teamBTotal) return '平局'
    return teamATotal > teamBTotal ? 'A队获胜' : 'B队获胜'
  },
  
  generateTeamRankings: function(teamAPlayers, teamBPlayers, teamATotal, teamBTotal) {
    // A队排行
    const teamARanking = [...teamAPlayers]
      .sort((a, b) => (b.score || 0) - (a.score || 0) || (b.efficiency || 0) - (a.efficiency || 0))
      .map(player => ({
        ...player,
        percentage: teamATotal > 0 ? ((player.score / teamATotal) * 100).toFixed(1) : '0.0'
      }))
    
    // B队排行
    const teamBRanking = [...teamBPlayers]
      .sort((a, b) => (b.score || 0) - (a.score || 0) || (b.efficiency || 0) - (a.efficiency || 0))
      .map(player => ({
        ...player,
        percentage: teamBTotal > 0 ? ((player.score / teamBTotal) * 100).toFixed(1) : '0.0'
      }))
    
    // 全场总排行
    const totalScore = teamATotal + teamBTotal
    const playerRanking = [...teamAPlayers, ...teamBPlayers]
      .sort((a, b) => (b.score || 0) - (a.score || 0) || (b.efficiency || 0) - (a.efficiency || 0))
      .map(player => ({
        ...player,
        percentage: totalScore > 0 ? ((player.score / totalScore) * 100).toFixed(1) : '0.0',
        scorePercentage: totalScore > 0 ? ((player.score / totalScore) * 100).toFixed(1) : '0.0'
      }))
    
    const topScorer = playerRanking[0] || null
    const mvpPlayer = [...playerRanking].sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0) || (b.score || 0) - (a.score || 0))[0] || null

    this.setData({
      teamARanking,
      teamBRanking,
      playerRanking,
      topScorer,
      mvpPlayer,
      topScorerMeta: topScorer ? `${topScorer.team}队 · ${topScorer.score}分` : '-',
      mvpPlayerMeta: mvpPlayer ? `${mvpPlayer.team}队 · 效率 ${mvpPlayer.efficiency}` : '-'
    })
  },

  calculateMatchDuration: function(startTime, endTime, savedDuration) {
    // 优先使用保存的duration
    if (savedDuration && savedDuration !== '---:--') {
      this.setData({ matchDuration: savedDuration })
      return
    }
    
    // 如果没有保存的duration，从时间戳计算
    if (!startTime || !endTime) {
      this.setData({ matchDuration: '00:00:00' })
      return
    }

    try {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const durationMs = end - start

      if (isNaN(durationMs) || durationMs < 0) {
        this.setData({ matchDuration: '00:00:00' })
        return
      }

      const hours = Math.floor(durationMs / 3600000)
      const minutes = Math.floor((durationMs % 3600000) / 60000)
      const seconds = Math.floor((durationMs % 60000) / 1000)

      const durationStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      
      console.log('计算比赛时长:', { startTime, endTime, durationMs, durationStr })
      
      this.setData({ matchDuration: durationStr })
    } catch (e) {
      console.error('计算比赛时长异常:', e)
      this.setData({ matchDuration: '00:00:00' })
    }
  },

  generateAnalysisData: function(players, actionLog, teamAFoulRecords = [], teamBFoulRecords = []) {
    let foulStats = { foul: 0 }
    let allFouls = []
    let teamAFouls = 0
    let teamBFouls = 0
    const statTotals = {
      rebounds: 0,
      steals: 0,
      assists: 0,
      turnovers: 0,
      blocks: 0
    }

    players.forEach(player => {
      const isTeamA = player.team === 'A'

      const foulCount = this.statCount(player, 'fouls')
      foulStats.foul += foulCount
      if (isTeamA) {
        teamAFouls += foulCount
      } else {
        teamBFouls += foulCount
      }

      ;(player.fouls || []).forEach(record => {
        allFouls.push({
          type: 'foul',
          typeName: '犯规',
          playerName: player.name,
          time: record.time,
          team: player.team
        })
      })

      Object.keys(statTotals).forEach(field => {
        statTotals[field] += this.statCount(player, field)
      })
    })

    teamAFoulRecords.forEach(record => {
      foulStats.foul += 1
      teamAFouls += 1
      allFouls.push({
        type: 'teamFoul',
        typeName: '团队犯规',
        playerName: 'A队',
        time: record.time,
        team: 'A'
      })
    })

    teamBFoulRecords.forEach(record => {
      foulStats.foul += 1
      teamBFouls += 1
      allFouls.push({
        type: 'teamFoul',
        typeName: '团队犯规',
        playerName: 'B队',
        time: record.time,
        team: 'B'
      })
    })

    const leaderConfig = [
      { field: 'reboundsCount', label: '篮板王' },
      { field: 'assistsCount', label: '助攻王' },
      { field: 'stealsCount', label: '抢断王' },
      { field: 'blocksCount', label: '盖帽王' }
    ]
    const statLeaders = leaderConfig.map(config => {
      const leader = [...players].sort((a, b) => (b[config.field] || 0) - (a[config.field] || 0) || (b.score || 0) - (a.score || 0))[0]
      return {
        label: config.label,
        name: leader ? leader.name : '-',
        team: leader ? leader.team : '',
        value: leader ? (leader[config.field] || 0) : 0
      }
    })

    const totalFouls = foulStats.foul
    allFouls.sort((a, b) => a.time.localeCompare(b.time))

    const scoreActions = actionLog.filter(log => log.type === 'score')
    const totalActions = scoreActions.length
    const avgEfficiency = scoreActions.length > 0
      ? (this.data.finalTotalScore / scoreActions.length).toFixed(1)
      : '0'

    const keyMoments = this.extractKeyMoments(actionLog, players)

    this.setData({
      foulStats,
      allFouls,
      totalFouls,
      teamAFouls,
      teamBFouls,
      totalActions,
      avgEfficiency,
      keyMoments,
      statTotals,
      statLeaders
    })
  },

  extractKeyMoments: function(actionLog, players) {
    const moments = []

    actionLog.slice().reverse().forEach((action) => {
      const player = players.find(p => p.id === action.playerId)
      const teamName = player?.team === 'A' ? 'A队' : 'B队'

      if (action.type === 'score' && Math.abs(action.points) >= 3) {
        moments.unshift({
          time: action.time,
          type: 'score',
          description: `${action.playerName} (${teamName}) ${action.action}`
        })
      }

      if (action.type === 'foul') {
        moments.unshift({
          time: action.time,
          type: 'foul',
          description: `${action.playerName} (${teamName}) ${action.action}`
        })
      }

      if (action.type === 'teamFoul') {
        moments.unshift({
          time: action.time,
          type: 'foul',
          description: `${action.team}队 团队犯规`
        })
      }

      if (action.type === 'stat' && ['steals', 'blocks', 'assists'].includes(action.statField)) {
        moments.unshift({
          time: action.time,
          type: 'stat',
          description: `${action.playerName} (${teamName}) ${action.action}`
        })
      }
    })

    return moments.slice(0, 10)
  },

  getPlayerFouls: function(player) {
    return {
      total: this.statCount(player, 'fouls'),
      foul: this.statCount(player, 'fouls')
    }
  },

  goBack: function() {
    wx.navigateBack({ delta: 2 })
  },

  saveReport: function() {
    try {
      const reportData = {
        matchId: this.data.matchId,
        players: this.data.players,
        finalTotalScore: this.data.finalTotalScore,
        teamATotalScore: this.data.teamATotalScore,
        teamBTotalScore: this.data.teamBTotalScore,
        actionLog: this.data.actionLog,
        playerRanking: this.data.playerRanking,
        teamARanking: this.data.teamARanking,
        teamBRanking: this.data.teamBRanking,
        foulStats: this.data.foulStats,
        matchDuration: this.data.matchDuration,
        generatedAt: new Date().toISOString()
      }

      const savedReports = wx.getStorageSync('saved_custom_match_reports') || []
      savedReports.unshift(reportData)
      
      if (savedReports.length > 50) {
        savedReports.pop()
      }

      wx.setStorageSync('saved_custom_match_reports', savedReports)

      wx.showToast({ title: '报告已保存', icon: 'success', duration: 1500 })
    } catch (e) {
      console.error('保存报告失败:', e)
      wx.showToast({ title: '保存失败', icon: 'error' })
    }
  },

  shareResult: function() {
    const topPlayerA = this.data.teamARanking[0]
    const topPlayerB = this.data.teamBRanking[0]
    
    const shareContent = `自定义比赛赛果\n` +
      `A队: ${this.data.teamATotalScore}分 | B队: ${this.data.teamBTotalScore}分\n` +
      `结果: ${this.data.winnerText}${this.data.scoreDiff ? `，分差${this.data.scoreDiff}分` : ''}\n` +
      `全场总分: ${this.data.finalTotalScore}分\n` +
      `比赛时长: ${this.data.matchDuration}\n` +
      `A队MVP: ${topPlayerA ? topPlayerA.name : '-'} (${topPlayerA ? topPlayerA.score : 0}分)\n` +
      `B队MVP: ${topPlayerB ? topPlayerB.name : '-'} (${topPlayerB ? topPlayerB.score : 0}分)\n` +
      `全场MVP: ${this.data.mvpPlayer ? this.data.mvpPlayer.name : '-'}\n` +
      `来自篮球数据统计小程序`

    wx.setClipboardData({
      data: shareContent,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success', duration: 1500 })
      }
    })
  },

  goHome: function() {
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
