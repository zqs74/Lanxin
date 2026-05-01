// custom-match-result.js - 按A队B队分组显示 + 修复比赛时长
const app = getApp()

Page({
  data: {
    themeClass: '',
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

  initTheme: function() {
    const ut = app.getUserTheme()
    this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') })
  },

  setTheme: function(theme) {
    const ut = app.getUserTheme()
    this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') })
  },

  setNavHeight: function() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 44
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48
    this.setData({
      navHeight: (statusBarHeight + navBarHeight) * 2
    })
  },

  loadMatchResult: function() {
    try {
      const matchData = wx.getStorageSync('custom_match_' + this.data.matchId)
      
      if (matchData && matchData.status === 'completed') {
        const players = matchData.players || []
        const actionLog = matchData.actionLog || []
        
        // 分离A队和B队球员
        const teamAPlayers = players.filter(p => p.team === 'A')
        const teamBPlayers = players.filter(p => p.team === 'B')
        
        // 计算各队总分
        const teamATotalScore = teamAPlayers.reduce((sum, p) => sum + (p.score || 0), 0)
        const teamBTotalScore = teamBPlayers.reduce((sum, p) => sum + (p.score || 0), 0)
        
        this.setData({
          players: players,
          teamAPlayers: teamAPlayers,
          teamBPlayers: teamBPlayers,
          actionLog: actionLog,
          finalTotalScore: matchData.finalTotalScore || 0,
          teamATotalScore: teamATotalScore,
          teamBTotalScore: teamBTotalScore
        })

        // 生成各队排行
        this.generateTeamRankings(teamAPlayers, teamBPlayers, teamATotalScore, teamBTotalScore)
        
        // 计算比赛时长 - 修复显示问题
        this.calculateMatchDuration(matchData.startTime, matchData.endTime, matchData.duration)
        
        // 生成分析数据
        this.generateAnalysisData(players, actionLog)
      } else {
        wx.showToast({ title: '比赛数据不存在', icon: 'error' })
        setTimeout(() => { wx.navigateBack() }, 1500)
      }
    } catch (e) {
      console.error('加载比赛结果失败:', e)
      wx.showToast({ title: '数据加载失败', icon: 'error' })
    }
  },
  
  generateTeamRankings: function(teamAPlayers, teamBPlayers, teamATotal, teamBTotal) {
    // A队排行
    const teamARanking = [...teamAPlayers]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(player => ({
        ...player,
        percentage: teamATotal > 0 ? ((player.score / teamATotal) * 100).toFixed(1) : '0.0'
      }))
    
    // B队排行
    const teamBRanking = [...teamBPlayers]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(player => ({
        ...player,
        percentage: teamBTotal > 0 ? ((player.score / teamBTotal) * 100).toFixed(1) : '0.0'
      }))
    
    // 全场总排行
    const totalScore = teamATotal + teamBTotal
    const playerRanking = [...teamAPlayers, ...teamBPlayers]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(player => ({
        ...player,
        percentage: totalScore > 0 ? ((player.score / totalScore) * 100).toFixed(1) : '0.0',
        scorePercentage: totalScore > 0 ? ((player.score / totalScore) * 100).toFixed(1) : '0.0'
      }))
    
    this.setData({
      teamARanking,
      teamBRanking,
      playerRanking
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

  generateAnalysisData: function(players, actionLog) {
    let foulStats = { foul: 0, warning: 0, freeThrow: 0, violation: 0 }
    let allFouls = []
    let teamAFouls = 0
    let teamBFouls = 0

    players.forEach(player => {
      const isTeamA = player.team === 'A'
      
      ['fouls', 'warnings', 'freeThrows', 'violations'].forEach(foulType => {
        const typeMap = { fouls: 'foul', warnings: 'warning', freeThrows: 'freeThrow', violations: 'violation' }
        const typeNameMap = { fouls: '犯规', warnings: '警告', freeThrows: '罚球', violations: '违例' }
        
        if (player[foulType] && player[foulType].length > 0) {
          foulStats[typeMap[foulType]] += player[foulType].length
          
          if (isTeamA) {
            teamAFouls += player[foulType].length
          } else {
            teamBFouls += player[foulType].length
          }
          
          player[foulType].forEach(record => {
            allFouls.push({
              type: typeMap[foulType],
              typeName: typeNameMap[foulType],
              playerName: player.name,
              time: record.time,
              team: player.team
            })
          })
        }
      })
    })

    allFouls.sort((a, b) => a.time.localeCompare(b.time))

    const totalFouls = Object.values(foulStats).reduce((sum, count) => sum + count, 0)

    const scoreActions = actionLog.filter(log => log.type === 'score')
    const totalActions = scoreActions.length
    const avgEfficiency = scoreActions.length > 0 
      ? ((this.data.finalTotalScore / scoreActions.length) * 100).toFixed(1)
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
      keyMoments
    })
  },

  extractKeyMoments: function(actionLog, players) {
    const moments = []

    actionLog.slice().reverse().forEach((action) => {
      if (action.type === 'score' && Math.abs(action.points) >= 3) {
        moments.unshift({
          time: action.time,
          type: 'score',
          description: `${action.playerName} (${action.playerId && players.find(p=>p.id===action.playerId)?.team === 'A' ? 'A队' : 'B队'}) 高光：${action.action}`
        })
      }

      if (action.type === 'foul') {
        moments.unshift({
          time: action.time,
          type: 'foul',
          description: `${action.playerName} (${action.playerId && players.find(p=>p.id===action.playerId)?.team === 'A' ? 'A队' : 'B队'}) 判罚${action.action}`
        })
      }
    })

    return moments.slice(0, 10)
  },

  getPlayerFouls: function(player) {
    return {
      total: (player.fouls?.length || 0) + 
             (player.warnings?.length || 0) + 
             (player.freeThrows?.length || 0) + 
             (player.violations?.length || 0),
      foul: player.fouls?.length || 0,
      warning: player.warnings?.length || 0,
      freeThrow: player.freeThrows?.length || 0,
      violation: player.violations?.length || 0
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
    
    const shareContent = `🏀 自定义比赛赛果\n` +
      `🔴 A队: ${this.data.teamATotalScore}分 | 🔵 B队: ${this.data.teamBTotalScore}分\n` +
      `全场总分: ${this.data.finalTotalScore}分\n` +
      `比赛时长: ${this.data.matchDuration}\n` +
      `A队MVP: ${topPlayerA ? topPlayerA.name : '-'} (${topPlayerA ? topPlayerA.score : 0}分)\n` +
      `B队MVP: ${topPlayerB ? topPlayerB.name : '-'} (${topPlayerB ? topPlayerB.score : 0}分)\n` +
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
