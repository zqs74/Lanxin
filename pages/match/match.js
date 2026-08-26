// match.js - 昇梦体育 赛事资讯报名
const app = getApp()

const NEWS_LIST = [
  { id: 1, title: '2026 安踏小篮球联赛火热报名中', date: '2026-08-18', tag: '官方公告', content: '2026 赛季安踏小篮球联赛（MCBA）正式开启报名！本届赛事设置 U8 / U10 / U12 三大年龄组别，采用 4v4 小篮球规则，赛季时间窗口为 2026 年 5 月 1 日至 8 月 31 日。欢迎全国各俱乐部、学校、社区青训队伍踊跃报名。' },
  { id: 2, title: '联赛赛制升级：三大组别全面解读', date: '2026-08-15', tag: '赛事解读', content: '本届联赛赛制全面升级：U8 组使用 2.60m 篮高、U10/U12 组使用 2.75m 篮高，统一采用 5 号球。每场由 4v4 对抗，每场地最多 6 场次/天，全天 18 场次上限。组委会将为每场地配备国家级裁判与记录台人员。' },
  { id: 3, title: '赛程公布：场馆与时间安排一览', date: '2026-08-12', tag: '赛程公告', content: '本赛季比赛场馆为国贸室内篮球场，配备 3 片标准小篮球场地、专业木地板、电子计时记分屏与 200 席观众席。营业时间为每日 08:00-22:00，比赛将安排在周末及节假日举行。' },
  { id: 4, title: '往届精彩回顾：冠军队伍采访', date: '2026-08-08', tag: '精彩回顾', content: '上赛季冠军队伍主教练在采访中表示："小篮球赛事的核心是让每个孩子都能上场、都能成长。"本赛季组委会将继续提供直播、数据统计与短视频集锦服务，记录每一位小球员的高光时刻。' },
  { id: 5, title: '报名指南：参赛队伍报名流程与常见问题', date: '2026-08-05', tag: '报名指南', content: '报名流程：选择赛事 → 填写报名信息 → 提交后等待组委会审核 → 审核通过后缴纳报名费与保险费。费用标准详见各赛事详情页，价格依据 2026 赛季安踏官方招商手册。' },
  { id: 6, title: '安全保障：赛事医疗保障与保险说明', date: '2026-08-01', tag: '保障说明', content: '组委会将为每场比赛配备医疗急救站与伤病绿色通道，并为每位参赛球员购买赛事保险。家长观赛区将设置专人管理，确保现场秩序与安全。' }
]

const EVENT_LIST = [
  { id: 1, name: '2026 安踏小篮球联赛 U12 组', group: 'U12', date: '2026-08-30', time: '09:00', venue: '东莞·南城篮球中心', fee: '300 元/队', slots: 12, status: '报名中' },
  { id: 2, name: '2026 安踏小篮球联赛 U10 组', group: 'U10', date: '2026-08-31', time: '09:00', venue: '东莞·东城体育馆', fee: '300 元/队', slots: 8, status: '报名中' },
  { id: 3, name: '2026 安踏小篮球联赛 U8 组', group: 'U8', date: '2026-09-06', time: '10:00', venue: '东莞·松山湖体育馆', fee: '300 元/队', slots: 20, status: '报名中' },
  { id: 4, name: '东莞企业篮球联赛', group: '成人', date: '2026-09-13', time: '19:00', venue: '东莞·厚街体育公园', fee: '800 元/队', slots: 5, status: '即将截止' },
  { id: 5, name: '东莞理工学院校友篮球赛', group: '成人', date: '2026-09-20', time: '14:00', venue: '东莞理工学院体育馆', fee: '免费', slots: 0, status: '名额已满' }
]

Page({
  data: {
    themeClass: '',
    pageBg: '#f8f7f4',
    searchKeyword: '',
    newsList: NEWS_LIST,
    eventList: EVENT_LIST,
    filteredEvents: EVENT_LIST,
    selectedDate: '',
    // 详情/报名弹层
    newsDetail: null,
    eventDetail: null,
    registerVisible: false,
    registerForm: { name: '', phone: '', group: '', team: '', remark: '' },
    registerGroups: ['U8', 'U10', 'U12', '成人'],
    groupIndex: 0,
    registeredMap: {}
  },

  onLoad() {
    this.initTheme()
    this.setTodayDate()
    this.loadRegistrations()
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
  applyNavBarColor() { app.applyNavBarColor(app.getTheme()) },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) { this.getTabBar().updateSelected(1) }
    this._syncTheme()
    this.loadRegistrations()
  },

  setTodayDate() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    this.setData({ selectedDate: `${year}-${month}-${day}` })
  },

  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value })
    this.applyFilters()
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
    this.applyFilters()
  },

  applyFilters() {
    const keyword = (this.data.searchKeyword || '').trim()
    const date = this.data.selectedDate
    let filtered = this.data.eventList
    if (keyword) {
      filtered = filtered.filter(ev => ev.name.indexOf(keyword) !== -1 || ev.venue.indexOf(keyword) !== -1)
    }
    if (date) {
      filtered = filtered.filter(ev => ev.date >= date)
    }
    this.setData({ filteredEvents: filtered })
  },

  loadRegistrations() {
    try {
      const list = wx.getStorageSync('event_registrations') || []
      const registeredMap = {}
      list.forEach(r => { if (r && r.eventId) registeredMap[r.eventId] = true })
      this.setData({ registeredMap })
    } catch (e) { this.setData({ registeredMap: {} }) }
  },

  // ===== 资讯 =====
  openNews(e) {
    const id = e.currentTarget.dataset.id
    const news = this.data.newsList.find(n => n.id === id)
    this.setData({ newsDetail: news })
  },

  closeNews() { this.setData({ newsDetail: null }) },

  // ===== 赛事详情 =====
  openEvent(e) {
    const id = e.currentTarget.dataset.id
    const event = this.data.eventList.find(ev => ev.id === id)
    this.setData({ eventDetail: event })
  },

  closeEvent() { this.setData({ eventDetail: null }) },

  // ===== 报名 =====
  openRegister(e) {
    const id = e.currentTarget.dataset.id
    const event = this.data.eventList.find(ev => ev.id === id)
    if (!event) return
    if (event.status === '名额已满') {
      wx.showToast({ title: '该赛事名额已满', icon: 'none' })
      return
    }
    this.setData({
      eventDetail: event,
      registerVisible: true,
      registerForm: { name: '', phone: '', group: event.group, team: '', remark: '' },
      groupIndex: Math.max(0, this.data.registerGroups.indexOf(event.group))
    })
  },

  closeRegister() { this.setData({ registerVisible: false }) },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`registerForm.${field}`]: e.detail.value })
  },

  onGroupChange(e) {
    const index = Number(e.detail.value)
    this.setData({ groupIndex: index, 'registerForm.group': this.data.registerGroups[index] })
  },

  submitRegister() {
    const { name, phone, group } = this.data.registerForm
    if (!name.trim()) { wx.showToast({ title: '请填写姓名', icon: 'none' }); return }
    if (!/^1\d{10}$/.test(phone.trim())) { wx.showToast({ title: '请填写正确的手机号', icon: 'none' }); return }
    if (!group) { wx.showToast({ title: '请选择组别', icon: 'none' }); return }

    const event = this.data.eventDetail
    const record = {
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      group,
      name: name.trim(),
      phone: phone.trim(),
      team: this.data.registerForm.team.trim(),
      remark: this.data.registerForm.remark.trim(),
      createdAt: new Date().toISOString()
    }

    try {
      const list = wx.getStorageSync('event_registrations') || []
      list.unshift(record)
      wx.setStorageSync('event_registrations', list.slice(0, 50))
    } catch (e) { console.error('保存报名失败', e) }

    this.setData({
      registerVisible: false,
      eventDetail: null,
      registeredMap: { ...this.data.registeredMap, [event.id]: true }
    })
    wx.showToast({ title: '报名成功！', icon: 'success' })
  },

  stopPropagation() {}
})
