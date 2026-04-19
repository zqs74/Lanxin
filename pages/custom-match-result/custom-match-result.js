// custom-match-result.js
Page({
  data: {
    matchId: null,
    players: [],
    finalTotalScore: 0,
    actionLog: [],
    playerRanking: [],
    foulStats: {},
    allFouls: [],
    totalFouls: 0,
    matchDuration: '',
    totalActions: 0,
    avgEfficiency: '0',
    keyMoments: []
  },

  onLoad: function(options) {
    this.setData({ matchId: options.matchId })
    this.loadMatchResult()
  },

  loadMatchResult: function() {
    try {
      const matchData = wx.getStorageSync('custom_match_' + this.data.matchId)
      
      if (matchData && matchData.status === 'completed') {
        const players = matchData.players || []
        const actionLog = matchData.actionLog || []
        
        this.generateAnalysisData(players, actionLog)
        
        this.setData({
          players: players,
          actionLog: actionLog,
          finalTotalScore: matchData.finalTotalScore || 0
        })

        this.calculateMatchDuration(matchData.startTime, matchData.endTime)
      } else {
        wx.showToast({
          title: '比赛数据不存在',
          icon: 'error'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (e) {
      console.error('加载比赛结果失败:', e)
      wx.showToast({
        title: '数据加载失败',
        icon: 'error'
      })
    }
  },

  generateAnalysisData: function(players, actionLog) {
    const totalScore = players.reduce((sum, p) => sum + (p.score || 0), 0)
    
    const playerRanking = [...players]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(player => ({
        ...player,
        percentage: totalScore > 0 ? ((player.score / totalScore) * 100).toFixed(1) : '0.0',
        scorePercentage: totalScore > 0 ? ((player.score / totalScore) * 100).toFixed(1) : '0.0'
      }))

    let foulStats = { foul: 0, warning: 0, freeThrow: 0, violation: 0 }
    let allFouls = []

    players.forEach(player => {
      if (player.fouls && player.fouls.length > 0) {
        foulStats.foul += player.fouls.length
        player.fouls.forEach(f => {
          allFouls.push({
            type: 'foul',
            typeName: '犯规',
            playerName: player.name,
            time: f.time
          })
        })
      }

      if (player.warnings && player.warnings.length > 0) {
        foulStats.warning += player.warnings.length
        player.warnings.forEach(w => {
          allFouls.push({
            type: 'warning',
            typeName: '警告',
            playerName: player.name,
            time: w.time
          })
        })
      }

      if (player.freeThrows && player.freeThrows.length > 0) {
        foulStats.freeThrow += player.freeThrows.length
        player.freeThrows.forEach(ft => {
          allFouls.push({
            type: 'freeThrow',
            typeName: '罚球',
            playerName: player.name,
            time: ft.time
          })
        })
      }

      if (player.violations && player.violations.length > 0) {
        foulStats.violation += player.violations.length
        player.violations.forEach(v => {
          allFouls.push({
            type: 'violation',
            typeName: '违例',
            playerName: player.name,
            time: v.time
          })
        })
      }
    })

    allFouls.sort((a, b) => a.time.localeCompare(b.time))

    const totalFouls = Object.values(foulStats).reduce((sum, count) => sum + count, 0)

    const scoreActions = actionLog.filter(log => log.type === 'score')
    const totalActions = scoreActions.length
    const avgEfficiency = scoreActions.length > 0 
      ? ((totalScore / scoreActions.length) * 100).toFixed(1)
      : '0'

    const keyMoments = this.extractKeyMoments(actionLog, players)

    this.setData({
      playerRanking,
      foulStats,
      allFouls,
      totalFouls,
      totalActions,
      avgEfficiency,
      keyMoments
    })
  },

  extractKeyMoments: function(actionLog, players) {
    const moments = []
    let previousLeader = null

    actionLog.slice().reverse().forEach((action, index) => {
      if (action.type === 'score' && action.points >= 3) {
        moments.unshift({
          time: action.time,
          type: 'score',
          description: `${action.playerName} 高光时刻：${action.action}`
        })
      }

      if (action.type === 'foul') {
        moments.unshift({
          time: action.time,
          type: 'foul',
          description: `${action.playerName} 被判罚${action.action}`
        })
      }
    })

    return moments.slice(0, 10)
  },

  calculateMatchDuration: function(startTime, endTime) {
    if (!startTime || !endTime) {
      this.setData({ matchDuration: '--:--' })
      return
    }

    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end - start

    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    this.setData({
      matchDuration: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    })
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
    wx.navigateBack({
      delta: 2
    })
  },

  saveReport: function() {
    try {
      const reportData = {
        matchId: this.data.matchId,
        players: this.data.players,
        finalTotalScore: this.data.finalTotalScore,
        actionLog: this.data.actionLog,
        playerRanking: this.data.playerRanking,
        foulStats: this.data.foulStats,
        generatedAt: new Date().toISOString()
      }

      const savedReports = wx.getStorageSync('saved_custom_match_reports') || []
      savedReports.unshift(reportData)
      
      if (savedReports.length > 50) {
        savedReports.pop()
      }

      wx.setStorageSync('saved_custom_match_reports', savedReports)

      wx.showToast({
        title: '报告已保存',
        icon: 'success',
        duration: 1500
      })
    } catch (e) {
      console.error('保存报告失败:', e)
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'error'
      })
    }
  },

  shareResult: function() {
    const topPlayer = this.data.playerRanking[0]
    const shareContent = `🏀 自定义比赛赛果\n` +
      `总分: ${this.data.finalTotalScore}分\n` +
      `参赛人数: ${this.data.players.length}人\n` +
      `MVP: ${topPlayer ? topPlayer.name : '-'} (${topPlayer ? topPlayer.score : 0}分)\n` +
      `来自篮球数据统计小程序`

    wx.setClipboardData({
      data: shareContent,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 1500
        })
      }
    })
  },

  goHome: function() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})
