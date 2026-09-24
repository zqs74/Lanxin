// training.js - 昇梦体育 个人成长分析
const app = getApp()

Page({
  // 微信要求页面实现 onShareAppMessage 才允许转发，否则右上角菜单置灰并提示「当前页面不可转发」
  onShareAppMessage() {
    return { title: '昇梦体育 · AI 篮球赛训助手', path: '/pages/training/training' }
  },

  // 「分享到朋友圈」由 onShareTimeline 提供（仅 Android 微信支持该入口）
  onShareTimeline() {
    return { title: '昇梦体育 · AI 篮球赛训助手' }
  },

  data: {
    navHeight: 0,
    themeClass: '',
    pageBg: '#f8f7f4',
    todayDate: '',
    overallScore: '',
    todaySummary: { durationMinutes: 0, count: 0, intensity: '' },
    careerStats: { points: 0, rebounds: 0, assists: 0, shootingPercentage: '0%', totalGames: 0 },
    showAddModal: false,
    newRecord: { title: '', duration: '', intensity: '中等强度', highlightsText: '' },
    radarData: {
      dimensions: ['投篮','身体素质','突破/上篮','组织','控球/运球','防守'],
      values: [null, null, null, null, null, null],
      colors: ['rgba(212,175,55,0.9)','rgba(255,215,0,0.9)','rgba(244,196,48,0.9)','rgba(218,165,32,0.9)','rgba(184,134,11,0.85)','rgba(255,193,37,0.9)']
    },
    weeklyPlans: [],
    recentRecords: [],
    quickTrain: [
      { id: 1, iconName: 'pen-ball', title: '投篮练习', duration: '30分钟', bgColor: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)' },
      { id: 2, iconName: 'activity', title: '力量训练', duration: '20分钟', bgColor: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' },
      { id: 3, iconName: 'flashlight', title: '体能训练', duration: '25分钟', bgColor: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)' },
      { id: 4, iconName: 'chart-radar', title: '技巧训练', duration: '35分钟', bgColor: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' }
    ]
  },

  onLoad() {
    this.initTheme()
    this.setNavHeight()
    this.setTodayDate()
    this.calculateOverallScore()
    wx.nextTick(() => this.drawRadarChart())
  },

  initTheme() { this._syncTheme() },
  setTheme(t) { this._syncTheme(); wx.nextTick(() => this.drawRadarChart()) },

  _syncTheme() {
    const ut = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark'), pageBg })
    app.applyNavBarColor(app.getTheme())
  },

  applyNavBarColor() { app.applyNavBarColor(app.getTheme()) },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) { this.getTabBar().updateSelected(2) }
    this._syncTheme()
    this.loadTrainingData()
    wx.nextTick(() => this.drawRadarChart())
  },

  setNavHeight() {
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {}
    const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {}
    const statusBarHeight = windowInfo.statusBarHeight || 44
    const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
    const navBarHeight = menuButton ? ((menuButton.top - statusBarHeight) * 2 + menuButton.height) : (deviceInfo.platform === 'ios' ? 44 : 48)
    this.setData({ navHeight: (statusBarHeight + navBarHeight) * 2 })
  },
  setTodayDate() { const n = new Date(); this.setData({ todayDate: `${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}` }) },
  calculateOverallScore() {
    const v = this.data.radarData.values
    this.setData({ overallScore: v.length && v.every(Number.isFinite) ? Math.round(v.reduce((a,b)=>a+b,0)/v.length) : '' })
  },

  async getApi() {
    if (app.globalData.authReady) await app.globalData.authReady
    const api = app.api || app.globalData.api
    await api.ensureLogin()
    return api
  },

  localDate() {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`
  },

  mapRecord(record) {
    const date = String(record.trainingDate || '')
    return { ...record, day: date.slice(8, 10), month: date ? date.slice(5, 7) + '月' : '',
      duration: record.durationMinutes, highlights: Array.isArray(record.highlights) ? record.highlights : [] }
  },

  applyRecords(records) {
    const rows = Array.isArray(records) ? records : []
    const today = rows.filter(row => row.trainingDate === this.localDate())
    this.setData({ recentRecords: rows.map(row => this.mapRecord(row)), todaySummary: {
      durationMinutes: today.reduce((sum, row) => sum + (Number(row.durationMinutes) || 0), 0),
      count: today.length, intensity: today.length ? today[0].intensity || '' : ''
    } })
  },

  async loadTrainingData() {
    const revision = this._recordsRevision || 0
    const request = this._loadRequest = (this._loadRequest || 0) + 1
    try {
      const api = await this.getApi()
      const results = await Promise.allSettled([
        api.get('/api/training/overview'), api.get('/api/training/records'), api.get('/api/home/overview')
      ])
      if (request !== this._loadRequest) return
      const [overview, records, home] = results
      if (overview.status === 'fulfilled') {
        const data = overview.value || {}
        const radar = Array.isArray(data.radarData) ? data.radarData : []
        // Match labels, never reinterpret points/rebounds as physical ability.
        const values = this.data.radarData.dimensions.map(label => {
          const item = radar.find(row => row.label === label)
          return item && Number.isFinite(item.value) && item.max > 0 ? Math.max(0, Math.min(100, item.value / item.max * 100)) : null
        })
        const plans = Array.isArray(data.plans) ? data.plans : (data.upcomingSchedule || [])
        this.setData({ 'radarData.values': values, weeklyPlans: plans.map(plan => {
          const date = String(plan.startDate || '')
          const completed = String(plan.status || '').toUpperCase() === 'COMPLETED' || plan.progress === 100
          const status = completed ? 'completed' : date === this.localDate() ? 'today' : 'upcoming'
          const dayIndex = date ? new Date(date + 'T00:00:00').getDay() : -1
          return { ...plan, day: ['周日','周一','周二','周三','周四','周五','周六'][dayIndex] || '',
            date: date.slice(5), description: plan.goal || '', status,
            statusText: completed ? '已完成' : status === 'today' ? '今日' : '待进行' }
        }) })
        this.calculateOverallScore()
        wx.nextTick(() => this.drawRadarChart())
      }
      if (revision === (this._recordsRevision || 0)) {
        if (records.status === 'fulfilled') this.applyRecords(records.value)
        else if (overview.status === 'fulfilled') this.applyRecords(overview.value.recentRecords)
      }
      if (home.status === 'fulfilled') this.applyCareerStats(home.value.careerStats)
      const failed = results.find(result => result.status === 'rejected')
      if (failed) wx.showToast({ title: failed.reason.message || '加载失败', icon: 'none' })
    } catch (error) { wx.showToast({ title: error.message || '加载失败', icon: 'none' }) }
  },

  // 生涯数据（从原首页迁入）
  applyCareerStats(stats = {}) {
    stats = stats || {}
    this.setData({
      careerStats: {
        points: stats.points || 0,
        rebounds: stats.rebounds || 0,
        assists: stats.assists || 0,
        shootingPercentage: (stats.shootingPercentage || 0) + '%',
        totalGames: stats.totalGames || 0
      }
    })
  },

  drawRadarChart() {
    wx.createSelectorQuery()
      .in(this)
      .select('.radar-chart')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvasInfo = res && res[0]
        if (!canvasInfo || !canvasInfo.node || !canvasInfo.width || !canvasInfo.height) return

        const canvas = canvasInfo.node
        const ctx = canvas.getContext('2d')
        const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {}
        const dpr = windowInfo.pixelRatio || 1
        const d = this.data.radarData
        const W = canvasInfo.width
        const H = canvasInfo.height

        canvas.width = W * dpr
        canvas.height = H * dpr
        ctx.scale(dpr, dpr)

        const isDark = app.getTheme() === 'dark'
        const cx = W / 2
        const cy = H / 2 + 4
        const R = Math.min(W, H) / 2 - 52
        const gridStroke = isDark ? 'rgba(212,175,55,0.20)' : 'rgba(184,134,11,0.20)'
        const axisStroke = isDark ? 'rgba(255,215,0,0.20)' : 'rgba(184,134,11,0.22)'
        const labelColor = isDark ? '#d8d1bd' : '#4f4a3f'

        ctx.clearRect(0, 0, W, H)
        for (let i = 5; i >= 1; i--) {
          const r = R * i / 5
          ctx.beginPath()
          d.dimensions.forEach((_, j) => {
            const a = j * 2 * Math.PI / d.dimensions.length - Math.PI / 2
            const x = cx + r * Math.cos(a)
            const y = cy + r * Math.sin(a)
            j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          })
          ctx.closePath()
          ctx.fillStyle = isDark ? `rgba(212,175,55,${0.07 + i * 0.008})` : `rgba(212,175,55,${0.045 + i * 0.006})`
          ctx.strokeStyle = gridStroke
          ctx.lineWidth = 1
          ctx.fill()
          ctx.stroke()
        }

        d.dimensions.forEach((_, i) => {
          const a = i * 2 * Math.PI / d.dimensions.length - Math.PI / 2
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a))
          ctx.strokeStyle = axisStroke
          ctx.lineWidth = 1
          ctx.stroke()
        })

        const pointList = d.values.map((value, i) => {
          const a = i * 2 * Math.PI / d.dimensions.length - Math.PI / 2
          const r = R * value / 100
          return Number.isFinite(value) ? { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), value } : null
        }).filter(Boolean)

        ctx.beginPath()
        pointList.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y) })
        ctx.closePath()
        ctx.fillStyle = isDark ? 'rgba(212,175,55,0.26)' : 'rgba(212,175,55,0.20)'
        ctx.fill()
        ctx.strokeStyle = '#D4AF37'
        ctx.lineWidth = 3
        ctx.stroke()

        pointList.forEach((p) => {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI)
          ctx.fillStyle = '#FFD700'
          ctx.fill()
          ctx.strokeStyle = isDark ? '#6b5415' : '#ffffff'
          ctx.lineWidth = 2
          ctx.stroke()
        })

        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillStyle = labelColor
        d.dimensions.forEach((label, i) => {
          const a = i * 2 * Math.PI / d.dimensions.length - Math.PI / 2
          const x = cx + (R + 30) * Math.cos(a)
          const y = cy + (R + 30) * Math.sin(a) + 4
          ctx.fillText(label, x, y)
        })

        ctx.beginPath()
        ctx.arc(cx, cy, 3, 0, 2 * Math.PI)
        ctx.fillStyle = '#D4AF37'
        ctx.fill()
      })
  },

  selectPlan(e) { wx.showToast({ title: `选择计划 ${e.currentTarget.dataset.id}`, icon: 'none' }) },
  addRecord() { this.setData({ showAddModal: true, newRecord: { title:'',duration:'',intensity:'中等强度',highlightsText:'' } }) },
  closeAddModal() { this.setData({ showAddModal: false }) },
  stopPropagation() {},
  onRecordTitleInput(e) { this.setData({ 'newRecord.title': e.detail.value }) },
  onRecordDurationInput(e) { this.setData({ 'newRecord.duration': e.detail.value }) },
  onRecordHighlightsInput(e) { this.setData({ 'newRecord.highlightsText': e.detail.value }) },
  selectIntensity(e) { this.setData({ 'newRecord.intensity': e.currentTarget.dataset.intensity }) },

  async saveRecord() {
    if (this._savingRecord) return
    const {title,duration,intensity,highlightsText}=this.data.newRecord
    if(!title.trim()||!Number.isInteger(Number(duration))||Number(duration)<1||Number(duration)>1440){wx.showToast({title:'请填写完整信息',icon:'none'});return}
    const hl=highlightsText?highlightsText.split(',').map(h=>h.trim()).filter(h=>h):[]
    return this.createRecord({ trainingDate: this.localDate(), title: title.trim(), durationMinutes: Number(duration), intensity, highlights: hl }, false)
  },

  async createRecord(payload, quick) {
    if (this._savingRecord) return
    this._savingRecord = true
    try {
      const api = await this.getApi()
      const saved = await api.post('/api/training/records', payload)
      this._recordsRevision = (this._recordsRevision || 0) + 1
      this.applyRecords([saved, ...this.data.recentRecords.filter(record => record.id !== saved.id)])
      if (!quick) this.setData({ showAddModal: false })
      wx.showToast({title: quick ? '训练已开始' : '记录添加成功',icon:'success'})
      return saved
    } catch (error) { wx.showToast({title:error.message || '保存失败',icon:'none'}) }
    finally { this._savingRecord = false }
  },

  startQuickTrain(e) {
    const item=this.data.quickTrain.find(t=>String(t.id)===String(e.currentTarget.dataset.id))
    if (!item) return
    wx.showModal({title:'开始训练',content:`确定开始「${item.title}」吗？`,success:(res)=>{if(res.confirm) return this.createRecord({
      trainingDate: this.localDate(), title: item.title, durationMinutes: parseInt(item.duration), intensity: '中等强度', highlights: []
    }, true)}})
  }
})
