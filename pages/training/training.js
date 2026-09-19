// training.js - 昇梦体育 个人成长分析
const app = getApp()

// 演示档案：17 岁高中校队小前锋（186cm / 75kg，区高中生联赛）
// 生涯累计：22 场 / 264 分 / 132 篮板 / 66 助攻 / 命中率 46.2%
const DEFAULT_CAREER_STATS = (app.globalData && app.globalData.careerStats) || {
  points: 264,
  rebounds: 132,
  assists: 66,
  shootingPercentage: 46.2,
  totalGames: 22
}

// 今日训练概览（当天队内对抗课：热身 / 投篮 / 战术 / 对抗 / 拉伸）
const TODAY_SUMMARY = { minutes: 90, items: 5, intensity: '高强度' }

// 一周训练课表（周一至周六，周日恢复休息）
const WEEK_PLANS = [
  { id: 1, title: '投篮专项训练', description: '中距离跳投 ×200 + 定点三分 ×100' },
  { id: 2, title: '力量训练', description: '核心 + 下肢力量，深蹲 5×8 @60kg' },
  { id: 3, title: '技术综合训练', description: '运球变向 + 三人传切 + 上篮终结' },
  { id: 4, title: '体能训练', description: '全场折返跑 17 趟 + 变速跑 2000m' },
  { id: 5, title: '战术跑位训练', description: '挡拆顺下 + 底角拉开 + 快攻二打一' },
  { id: 6, title: '队内对抗赛', description: '5v5 全场对抗，四节 ×10 分钟' }
]

const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六']

function pad2(n) { return String(n).padStart(2, '0') }

// 按当前日期推算本周课表：已过为已完成、当天为今日、其余为待进行
function buildWeeklyPlans() {
  const now = new Date()
  const offset = (now.getDay() + 6) % 7 // 周一 = 0
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset)

  return WEEK_PLANS.map((plan, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    const status = i < offset ? 'completed' : (i === offset ? 'today' : 'upcoming')
    return {
      id: plan.id,
      day: DAY_NAMES[i],
      date: `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
      title: plan.title,
      description: plan.description,
      status,
      statusText: status === 'completed' ? '已完成' : (status === 'today' ? '今日' : '待进行')
    }
  })
}

// 最近三次训练（相对当天：今天 / 昨天 / 前天）
function buildRecentRecords() {
  const now = new Date()
  const at = (back) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back)
    return { day: pad2(d.getDate()), month: `${pad2(d.getMonth() + 1)}月` }
  }

  return [
    { id: 1, ...at(0), title: '队内对抗赛', duration: 90, intensity: '高强度', highlights: ['中距离 8 投 5 中', '抢下 7 个篮板', '3 次助攻'] },
    { id: 2, ...at(1), title: '投篮专项训练', duration: 60, intensity: '中等强度', highlights: ['定点三分 100 投 34 中', '罚球 50 投 41 中'] },
    { id: 3, ...at(2), title: '力量 + 体能训练', duration: 45, intensity: '中等强度', highlights: ['深蹲 5×8 @60kg', '折返跑 17 趟 1 分 02 秒'] }
  ]
}

Page({
  data: {
    navHeight: 0,
    themeClass: '',
    pageBg: '#f8f7f4',
    todayDate: '',
    overallScore: 80,
    careerStats: {
      points: DEFAULT_CAREER_STATS.points,
      rebounds: DEFAULT_CAREER_STATS.rebounds,
      assists: DEFAULT_CAREER_STATS.assists,
      shootingPercentage: `${DEFAULT_CAREER_STATS.shootingPercentage}%`,
      totalGames: DEFAULT_CAREER_STATS.totalGames
    },
    todaySummary: TODAY_SUMMARY,
    showAddModal: false,
    newRecord: { title: '', duration: '', intensity: '中等强度', highlightsText: '' },
    radarData: {
      dimensions: ['投篮','身体素质','突破/上篮','组织','控球/运球','防守'],
      values: [78, 85, 82, 72, 80, 83],
      colors: ['rgba(212,175,55,0.9)','rgba(255,215,0,0.9)','rgba(244,196,48,0.9)','rgba(218,165,32,0.9)','rgba(184,134,11,0.85)','rgba(255,193,37,0.9)']
    },
    weeklyPlans: buildWeeklyPlans(),
    recentRecords: buildRecentRecords(),
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
    this.loadCareerStats()
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

  // 生涯数据（从原首页迁入）
  loadCareerStats() {
    let stats = null
    try {
      stats = wx.getStorageSync('careerStats')
    } catch (e) {
      console.error('加载生涯数据失败', e)
    }
    if (!stats || !stats.totalGames) stats = DEFAULT_CAREER_STATS

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
