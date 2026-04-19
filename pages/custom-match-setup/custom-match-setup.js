// custom-match-setup.js - 支持双方队伍
Page({
  data: {
    navHeight: 0,
    players: [],
    matchId: null,
    currentTeam: 'A',
    teamAPlayers: [],
    teamBPlayers: []
  },

  onLoad: function(options) {
    this.setNavHeight()
    this.setData({
      matchId: options.matchId || 'custom_' + Date.now()
    })

    this.initPlayers()
  },

  setNavHeight: function() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 44
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48
    this.setData({
      navHeight: (statusBarHeight + navBarHeight) * 2
    })
  },

  onShow: function() {
    this.checkUnfinishedMatch()
  },

  initPlayers: function() {
    const now = Date.now()
    // A队2人 + B队2人，带默认姓名和编号
    const defaultPlayers = [
      { id: now, name: 'A1-张三', number: '1', avatar: '', team: 'A', nameError: '', numberError: '' },
      { id: now + 1, name: 'A2-李四', number: '2', avatar: '', team: 'A', nameError: '', numberError: '' },
      { id: now + 2, name: 'B1-王五', number: '1', avatar: '', team: 'B', nameError: '', numberError: '' },
      { id: now + 3, name: 'B2-赵六', number: '2', avatar: '', team: 'B', nameError: '', numberError: '' }
    ]
    
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
    const matchData = {
      matchId: this.data.matchId,
      players: this.data.players.map(p => ({
        ...p,
        score: 0,
        fouls: [],
        warnings: [],
        freeThrows: [],
        violations: []
      })),
      startTime: new Date().toISOString(),
      status: 'in_progress',
      totalScore: 0,
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
  }
})
