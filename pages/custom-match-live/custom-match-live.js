// custom-match-live.js - 优化版（含计时器、双方队伍支持）
Page({
  data: {
    matchId: null,
    players: [],
    totalScore: 0,
    selectedPlayer: null,
    selectedPlayerId: null,
    actionLog: [],
    showLog: false,
    
    // 计时器相关
    matchTime: '00:00:00',
    startTime: null,
    timerInterval: null,
    
    // 队伍统计
    teamACount: 0,
    teamBCount: 0
  },

  onLoad: function(options) {
    this.setData({ matchId: options.matchId })
    this.loadMatchData()
  },

  onShow: function() {
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
        const players = matchData.players || []
        
        // 计算队伍统计
        const teamACount = players.filter(p => p.team === 'A').length
        const teamBCount = players.filter(p => p.team === 'B').length
        
        this.setData({
          players: players,
          totalScore: this.calculateTotalScore(players),
          actionLog: matchData.actionLog || [],
          teamACount: teamACount,
          teamBCount: teamBCount,
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
    const playerId = this.data.selectedPlayer.id
    const players = this.data.players
    const playerIndex = players.findIndex(p => p.id === playerId)

    if (playerIndex !== -1) {
      const oldScore = players[playerIndex].score
      players[playerIndex].score += points

      this.recordAction({
        type: 'score',
        playerName: players[playerIndex].name,
        action: `+${points}分 (${oldScore} → ${players[playerIndex].score})`,
        playerId: playerId,
        points: points,
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

  subtractScore: function(e) {
    const points = parseInt(e.currentTarget.dataset.points)
    const playerId = this.data.selectedPlayer.id
    const players = this.data.players
    const playerIndex = players.findIndex(p => p.id === playerId)

    if (playerIndex !== -1) {
      if (players[playerIndex].score < points) {
        wx.showToast({
          title: '得分不能为负数',
          icon: 'none',
          duration: 1500
        })
        return
      }

      const oldScore = players[playerIndex].score
      players[playerIndex].score -= points

      this.recordAction({
        type: 'score',
        playerName: players[playerIndex].name,
        action: `-${points}分 (${oldScore} → ${players[playerIndex].score})`,
        playerId: playerId,
        points: -points,
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
    const foulType = e.currentTarget.dataset.type
    const playerId = this.data.selectedPlayer.id
    const players = this.data.players
    const playerIndex = players.findIndex(p => p.id === playerId)

    if (playerIndex !== -1) {
      const foulTypeNames = {
        foul: '犯规',
        warning: '警告',
        freeThrow: '罚球',
        violation: '违例'
      }

      const timestamp = new Date().toLocaleTimeString('zh-CN', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      const foulRecord = {
        type: foulType,
        time: timestamp
      }

      if (!players[playerIndex][foulType + 's']) {
        players[playerIndex][foulType + 's'] = []
      }
      players[playerIndex][foulType + 's'].push(foulRecord)

      this.recordAction({
        type: 'foul',
        playerName: players[playerIndex].name,
        action: `${foulTypeNames[foulType]}`,
        playerId: playerId,
        foulType: foulType,
        foulRecord: foulRecord
      })

      this.updateMatchData(players)
      
      wx.showToast({
        title: '判罚已记录',
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

  updateMatchData: function(players) {
    const totalScore = this.calculateTotalScore(players)
    
    this.setData({
      players: players,
      totalScore: totalScore
    })

    try {
      const matchData = {
        matchId: this.data.matchId,
        players: players,
        status: 'in_progress',
        totalScore: totalScore,
        actionLog: this.data.actionLog
      }

      wx.setStorageSync('custom_match_' + this.data.matchId, matchData)
      wx.setStorageSync('unfinished_custom_match', matchData)
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

    if (lastAction.type === 'score') {
      const playerIndex = players.findIndex(p => p.id === lastAction.playerId)
      if (playerIndex !== -1) {
        players[playerIndex].score = lastAction.oldScore
      }
    } else if (lastAction.type === 'foul') {
      const playerIndex = players.findIndex(p => p.id === lastAction.playerId)
      if (playerIndex !== -1 && players[playerIndex][lastAction.foulType + 's']) {
        players[playerIndex][lastAction.foulType + 's'].pop()
      }
    }

    const newActionLog = this.data.actionLog.slice(1)

    this.setData({
      actionLog: newActionLog
    })

    this.updateMatchData(players)

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
