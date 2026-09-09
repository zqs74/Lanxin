// match-detail.js - 昇梦体育 比赛详情
const app = getApp()
const matchSync = require('../../utils/custom-match-sync')
Page({
  data: {
    navHeight: 0,
    themeClass: '',
    pageBg: '#f8f7f4',
    activeTab: 0,
    selectedCount: 0,
    clips: [],
    score: { redTeam: 0, blueTeam: 0, time: '' },
    scoreTrend: {
      quarters: [],
      redTeam: [],
      blueTeam: []
    },
    performance: [
      { name: '得分', redTeam: 0, blueTeam: 0 },
      { name: '篮板', redTeam: 0, blueTeam: 0 },
      { name: '助攻', redTeam: 0, blueTeam: 0 },
      { name: '投篮命中率', redTeam: '', blueTeam: '' },
      { name: '三分命中率', redTeam: '', blueTeam: '' },
      { name: '三分', redTeam: 0, blueTeam: 0 },
      { name: '罚球', redTeam: 0, blueTeam: 0 }
    ],
    shootingData: {
      quarters: [],
      made: [],
      attempted: []
    }
  },

  onLoad: function(options) {
    this.initTheme()
    this.setNavHeight()
    this.matchId = options.matchId || options.id || null
  },

  _themeClass(ut) { return ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') },

  _syncTheme() {
    const ut = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this._themeClass(ut), pageBg })
    app.applyNavBarColor(app.getTheme())
  },

  initTheme() { this._syncTheme() },
  setTheme(t) { this._syncTheme() },

  onShow: function() {
    this._syncTheme()
    this.loadMatchDetail()
    wx.nextTick(() => this.drawActiveCharts())
  },

  setNavHeight: function() {
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {}
    const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {}
    const sh = windowInfo.statusBarHeight || 44
    const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
    const nh = menuButton ? ((menuButton.top - sh) * 2 + menuButton.height) : (deviceInfo.platform === 'ios' ? 44 : 48)
    this.setData({ navHeight: (sh + nh) * 2 })
  },

  goBack: function() { wx.navigateBack() },

  async loadMatchDetail() {
    if (!this.matchId) return
    try {
      if (String(this.matchId).startsWith('custom_')) {
        const match = await matchSync.load(this.matchId)
        if (match) this.applyCustomMatch(match)
        return
      }
      if (app.globalData.authReady) await app.globalData.authReady
      const api = app.api || app.globalData.api
      const detail = await api.get('/api/matches/' + encodeURIComponent(this.matchId) + '/insight')
      this.applyMatchDetail(detail)
    } catch (error) { wx.showToast({ title: error.message || '数据加载失败', icon: 'none' }) }
  },

  applyMatchDetail(detail) {
    const match = detail.match || {}
    const a = detail.teamAPerformance || {}, b = detail.teamBPerformance || {}
    const trend = (detail.scoreTrend || []).slice().sort((x, y) => x.quarterNo - y.quarterNo)
    const shooting = (detail.shootingData || []).slice().sort((x, y) => x.quarterNo - y.quarterNo)
    const quarter = no => ['第一节','第二节','第三节','第四节'][no - 1] || `第${no}节`
    const fields = ['points','rebounds','assists','fieldGoalPct','threePointPct','threePointMade','freeThrowMade']
    const value = (row, field) => field.endsWith('Pct') ? (row[field] == null ? '' : row[field] + '%') : (row[field] || 0)
    const selected = new Set(this.data.clips.filter(clip => clip.selected).map(clip => clip.id))
    const clips = (detail.clips || []).map(clip => ({ ...clip, time: clip.createdAt || '',
      type: clip.type || clip.title || '', result: clip.description || '', selected: selected.has(clip.id) }))
    this.setData({
      score: { redTeam: match.teamAScore || 0, blueTeam: match.teamBScore || 0,
        time: String(match.matchDate || '').slice(5, 16).replace('T', ' ').replace('-', '.') },
      scoreTrend: { quarters: trend.map(row => quarter(row.quarterNo)), redTeam: trend.map(row => row.teamAScore || 0), blueTeam: trend.map(row => row.teamBScore || 0) },
      performance: this.data.performance.map((row, index) => ({ ...row, redTeam: value(a, fields[index]), blueTeam: value(b, fields[index]) })),
      shootingData: { quarters: shooting.map(row => quarter(row.quarterNo)), made: shooting.map(row => row.makes || 0), attempted: shooting.map(row => row.attempts || 0) },
      clips, selectedCount: clips.filter(clip => clip.selected).length
    })
    wx.nextTick(() => this.drawActiveCharts())
  },

  applyCustomMatch(match) {
    const players = match.players || []
    const team = side => {
      const rows = players.filter(player => player.team === side)
      const ids = new Set(rows.map(player => player.id))
      const scores = (match.actionLog || []).filter(event => event.type === 'score' && ids.has(event.playerId))
      return { points: rows.reduce((sum, player) => sum + (player.score || 0), 0),
        rebounds: rows.reduce((sum, player) => sum + (player.rebounds || []).length, 0),
        assists: rows.reduce((sum, player) => sum + (player.assists || []).length, 0),
        threePointMade: scores.filter(event => event.points === 3).length,
        freeThrowMade: scores.filter(event => event.points === 1).length }
    }
    const a = team('A'), b = team('B')
    this.applyMatchDetail({ match: { teamAScore: a.points, teamBScore: b.points, matchDate: match.endTime || match.startTime },
      teamAPerformance: a, teamBPerformance: b })
  },

  switchTab: function(e) {
    this.setData({ activeTab: Number(e.currentTarget.dataset.index) }, () => {
      wx.nextTick(() => this.drawActiveCharts())
    })
  },

  playVideo: function() { console.log('播放视频') },

  selectClip: function(e) {
    const index = e.currentTarget.dataset.index
    const clips = this.data.clips
    clips[index].selected = !clips[index].selected
    this.setData({ clips, selectedCount: clips.filter(c => c.selected).length })
  },

  startEdit: function() {
    if (this.data.selectedCount > 0) { console.log('开始剪辑') }
  },

  startCustomMatch: function() {
    let unfinished
    try { unfinished = wx.getStorageSync('unfinished_custom_match') } catch (_) {}
    const id = unfinished && unfinished.matchId || 'custom_' + Date.now()
    wx.navigateTo({ url: `/pages/custom-match-setup/custom-match-setup?matchId=${encodeURIComponent(id)}` })
  },

  drawActiveCharts: function() {
    if (this.data.activeTab === 0) this.drawScoreTrend()
    if (this.data.activeTab === 2) this.drawShootingChart()
  },

  getChartRect: function(selector, callback) {
    wx.createSelectorQuery()
      .in(this)
      .select(selector)
      .boundingClientRect((rect) => {
        if (!rect || !rect.width || !rect.height) return
        callback(rect)
      })
      .exec()
  },

  drawSmoothLine: function(ctx, points) {
    ctx.beginPath()
    points.forEach((p, i) => {
      if (i === 0) {
        ctx.moveTo(p.x, p.y)
        return
      }
      const prev = points[i - 1]
      const midX = (prev.x + p.x) / 2
      ctx.quadraticCurveTo(prev.x, prev.y, midX, (prev.y + p.y) / 2)
      ctx.quadraticCurveTo(midX, (prev.y + p.y) / 2, p.x, p.y)
    })
    ctx.stroke()
  },

  drawRoundRect: function(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, Math.abs(height) / 2)
    const top = height >= 0 ? y : y + height
    const h = Math.abs(height)
    ctx.beginPath()
    ctx.moveTo(x + r, top)
    ctx.lineTo(x + width - r, top)
    ctx.quadraticCurveTo(x + width, top, x + width, top + r)
    ctx.lineTo(x + width, top + h - r)
    ctx.quadraticCurveTo(x + width, top + h, x + width - r, top + h)
    ctx.lineTo(x + r, top + h)
    ctx.quadraticCurveTo(x, top + h, x, top + h - r)
    ctx.lineTo(x, top + r)
    ctx.quadraticCurveTo(x, top, x + r, top)
    ctx.closePath()
    ctx.fill()
  },

  drawScoreTrend: function() {
    this.getChartRect('.score-trend-chart', (rect) => {
      const ctx = wx.createCanvasContext('scoreTrendCanvas')
      const d = this.data.scoreTrend
      const W = rect.width
      const H = rect.height
      const isDark = app.getTheme() === 'dark'
      const padding = { left: 36, right: 28, top: 26, bottom: 36 }
      const chartW = W - padding.left - padding.right
      const chartH = H - padding.top - padding.bottom
      const allScores = d.redTeam.concat(d.blueTeam)
      const maxScore = Math.ceil(Math.max(...allScores, 100) / 20) * 20
      const gridColor = isDark ? 'rgba(212,175,55,0.14)' : 'rgba(184,134,11,0.14)'
      const labelColor = isDark ? '#9f9684' : '#746d60'
      const redColor = '#D4AF37'
      const blueColor = '#4da3ff'
      const getX = (i) => padding.left + chartW / Math.max(1, d.quarters.length - 1) * i
      const getY = (score) => padding.top + chartH - score / maxScore * chartH

      ctx.clearRect(0, 0, W, H)
      ctx.setFontSize(10)
      ctx.setTextAlign('right')
      ctx.setFillStyle(labelColor)
      ctx.setStrokeStyle(gridColor)
      ctx.setLineWidth(1)

      for (let i = 0; i <= 4; i++) {
        const value = Math.round(maxScore / 4 * i)
        const y = padding.top + chartH - chartH / 4 * i
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(W - padding.right, y)
        ctx.stroke()
        ctx.fillText(String(value), padding.left - 8, y + 3)
      }

      ctx.setTextAlign('center')
      d.quarters.forEach((quarter, i) => {
        const x = getX(i)
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, padding.top + chartH)
        ctx.stroke()
        ctx.setFillStyle(labelColor)
        ctx.fillText(quarter.replace('第', 'Q').replace('节', ''), x, H - 12)
      })

      const redPoints = d.redTeam.map((score, i) => ({ x: getX(i), y: getY(score), score }))
      const bluePoints = d.blueTeam.map((score, i) => ({ x: getX(i), y: getY(score), score }))

      ctx.setStrokeStyle('rgba(212,175,55,0.18)')
      ctx.setLineWidth(8)
      this.drawSmoothLine(ctx, redPoints)
      ctx.setStrokeStyle(redColor)
      ctx.setLineWidth(3)
      this.drawSmoothLine(ctx, redPoints)

      ctx.setStrokeStyle('rgba(77,163,255,0.16)')
      ctx.setLineWidth(8)
      this.drawSmoothLine(ctx, bluePoints)
      ctx.setStrokeStyle(blueColor)
      ctx.setLineWidth(3)
      this.drawSmoothLine(ctx, bluePoints)

      redPoints.concat(bluePoints).forEach((p, index) => {
        const color = index < redPoints.length ? redColor : blueColor
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI)
        ctx.setFillStyle(color)
        ctx.fill()
        ctx.setStrokeStyle(isDark ? '#161616' : '#ffffff')
        ctx.setLineWidth(2)
        ctx.stroke()
      })

      ctx.setTextAlign('center')
      ctx.setFontSize(11)
      ;[redPoints[redPoints.length - 1], bluePoints[bluePoints.length - 1]].forEach((p, i) => {
        ctx.setFillStyle(i === 0 ? redColor : blueColor)
        ctx.fillText(String(p.score), p.x, p.y - 10)
      })
      ctx.draw()
    })
  },

  drawShootingChart: function() {
    this.getChartRect('.shooting-chart', (rect) => {
      const ctx = wx.createCanvasContext('shootingChartCanvas')
      const d = this.data.shootingData
      const W = rect.width
      const H = rect.height
      const isDark = app.getTheme() === 'dark'
      const padding = { left: 34, right: 22, top: 28, bottom: 38 }
      const chartW = W - padding.left - padding.right
      const chartH = H - padding.top - padding.bottom
      const maxValue = Math.ceil(Math.max(...d.attempted, 10) / 2) * 2
      const gridColor = isDark ? 'rgba(212,175,55,0.14)' : 'rgba(184,134,11,0.14)'
      const labelColor = isDark ? '#9f9684' : '#746d60'
      const madeColor = '#D4AF37'
      const attemptedColor = isDark ? '#4fc17b' : '#2f9e55'
      const groupWidth = chartW / Math.max(1, d.quarters.length)
      const barWidth = Math.min(18, groupWidth * 0.22)

      ctx.clearRect(0, 0, W, H)
      ctx.setFontSize(10)
      ctx.setTextAlign('right')
      ctx.setFillStyle(labelColor)
      ctx.setStrokeStyle(gridColor)
      ctx.setLineWidth(1)

      for (let i = 0; i <= 4; i++) {
        const value = Math.round(maxValue / 4 * i)
        const y = padding.top + chartH - chartH / 4 * i
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(W - padding.right, y)
        ctx.stroke()
        ctx.fillText(String(value), padding.left - 8, y + 3)
      }

      ctx.setTextAlign('center')
      d.quarters.forEach((quarter, i) => {
        const centerX = padding.left + groupWidth * i + groupWidth / 2
        const madeH = d.made[i] / maxValue * chartH
        const attemptedH = d.attempted[i] / maxValue * chartH
        const baseY = padding.top + chartH
        const madeX = centerX - barWidth - 5
        const attemptedX = centerX + 5

        ctx.setFillStyle(madeColor)
        this.drawRoundRect(ctx, madeX, baseY - madeH, barWidth, madeH, 5)
        ctx.setFillStyle(attemptedColor)
        this.drawRoundRect(ctx, attemptedX, baseY - attemptedH, barWidth, attemptedH, 5)

        ctx.setFontSize(10)
        ctx.setFillStyle(labelColor)
        ctx.fillText(String(d.made[i]), madeX + barWidth / 2, baseY - madeH - 8)
        ctx.fillText(String(d.attempted[i]), attemptedX + barWidth / 2, baseY - attemptedH - 8)
        ctx.fillText(quarter.replace('第', 'Q').replace('节', ''), centerX, H - 12)
      })

      ctx.draw()
    })
  }
})
