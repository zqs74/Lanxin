// training.js - 昇梦体育 训练中心
const app = getApp()

Page({
  data: {
    navHeight: 0,
    themeClass: '',
    pageBg: '#f8f7f4',
    todayDate: '',
    overallScore: 72,
    showAddModal: false,
    newRecord: { title: '', duration: '', intensity: '中等强度', highlightsText: '' },
    radarData: {
      dimensions: ['投篮','身体素质','突破/上篮','组织','控球/运球','防守'],
      values: [75, 65, 80, 70, 85, 60],
      colors: ['rgba(212,175,55,0.9)','rgba(255,215,0,0.9)','rgba(244,196,48,0.9)','rgba(218,165,32,0.9)','rgba(184,134,11,0.85)','rgba(255,193,37,0.9)']
    },
    weeklyPlans: [
      { id: 1, day: '周一', date: '03-24', title: '投篮专项训练', description: '中距离跳投 × 200次', status: 'completed', statusText: '已完成' },
      { id: 2, day: '周二', date: '03-25', title: '力量训练', description: '核心肌群强化', status: 'completed', statusText: '已完成' },
      { id: 3, day: '周三', date: '03-26', title: '技术综合训练', description: '运球 + 传球练习', status: 'today', statusText: '今日' },
      { id: 4, day: '周四', date: '03-27', title: '体能训练', description: '耐力跑 + 变速跑', status: 'upcoming', statusText: '待进行' }
    ],
    recentRecords: [
      { id: 1, day: '26', month: '03月', title: '投篮专项训练', duration: 60, intensity: '高强度', highlights: ['三分命中率提升','手感火热'] },
      { id: 2, day: '25', month: '03月', title: '团队对抗训练', duration: 90, intensity: '中等强度', highlights: ['5次助攻','防守积极'] },
      { id: 3, day: '24', month: '03月', title: '个人技术训练', duration: 45, intensity: '低强度', highlights: ['运球熟练'] }
    ],
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
  calculateOverallScore() { const v = this.data.radarData.values; this.setData({ overallScore: Math.round(v.reduce((a,b)=>a+b,0)/v.length) }) },

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
          return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), value }
        })

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

  saveRecord() {
    const {title,duration,intensity,highlightsText}=this.data.newRecord
    if(!title||!duration){wx.showToast({title:'请填写完整信息',icon:'none'});return}
    const n=new Date();const day=String(n.getDate()).padStart(2,'0');const month=String(n.getMonth()+1).padStart(2,'0')+'月'
    const hl=highlightsText?highlightsText.split(',').map(h=>h.trim()).filter(h=>h):[]
    this.setData({recentRecords:[{id:Date.now(),day,month,title,duration:parseInt(duration),intensity,highlights:hl},...this.data.recentRecords],showAddModal:false})
    wx.showToast({title:'记录添加成功',icon:'success'})
  },

  startQuickTrain(e) {
    const item=this.data.quickTrain.find(t=>t.id===e.currentTarget.dataset.id)
    wx.showModal({title:'开始训练',content:`确定开始「${item.title}」吗？`,success:(res)=>{if(res.confirm)wx.showToast({title:'训练已开始',icon:'success'})}})
  }
})
