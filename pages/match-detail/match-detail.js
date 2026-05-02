// match-detail.js - 昇梦体育 比赛详情
const app = getApp()
Page({
  data: {
    navHeight: 0,
    themeClass: '',
    pageBg: '#f8f7f4',
    activeTab: 0,
    selectedCount: 0,
    clips: [
      { id: 1, time: '第一节 08:24', type: '两分跳投', result: '命中', selected: false },
      { id: 2, time: '第一节 06:12', type: '突破上篮', result: '命中', selected: false },
      { id: 3, time: '第二节 10:05', type: '三分远投', result: '命中', selected: false }
    ],
    score: { redTeam: 109, blueTeam: 105, time: '03.13 21:05' },
    scoreTrend: {
      quarters: ['第一节','第二节','第三节','第四节'],
      redTeam: [25,50,78,109],
      blueTeam: [23,48,76,105]
    },
    performance: [
      { name: '得分', redTeam: 109, blueTeam: 105 },
      { name: '篮板', redTeam: 57, blueTeam: 45 },
      { name: '助攻', redTeam: 19, blueTeam: 27 },
      { name: '投篮命中率', redTeam: '39.4%', blueTeam: '35.9%' },
      { name: '三分命中率', redTeam: '24.0%', blueTeam: '29.7%' },
      { name: '三分', redTeam: 12, blueTeam: 11 },
      { name: '罚球', redTeam: 19, blueTeam: 11 }
    ],
    shootingData: {
      quarters: ['第一节','第二节','第三节','第四节'],
      made: [3,4,2,5],
      attempted: [6,8,7,9]
    }
  },

  onLoad: function(options) {
    this.initTheme()
    this.setNavHeight()
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
    wx.navigateTo({ url: `/pages/custom-match-setup/custom-match-setup?matchId=custom_${Date.now()}` })
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
      const getX = (i) => padding.left + chartW / (d.quarters.length - 1) * i
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
      const groupWidth = chartW / d.quarters.length
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
