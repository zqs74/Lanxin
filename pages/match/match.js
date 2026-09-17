// match.js - 昇梦体育 赛事资讯报名
const app = getApp()

let requestSequence = 0
const api = () => app.api || app.globalData.api
const showError = error => wx.showToast({ title: (error && error.message) || '请求失败，请重试', icon: 'none' })
const cacheRegistrations = list => {
  try { wx.setStorageSync('event_registrations', list) } catch (e) { console.error('保存报名失败', e) }
}

Page({
  data: {
    themeClass: '',
    pageBg: '#f8f7f4',
    searchKeyword: '',
    newsList: [],
    filteredNews: [],
    eventList: [],
    filteredEvents: [],
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
    return Promise.all([this.loadNews(), this.loadEvents()])
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
    return this.loadRegistrations()
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

  // 搜索按钮和键盘“搜索”键：结果已随输入实时更新，这里只需再次应用并收起键盘。
  onSearchConfirm() {
    this.applyFilters()
    if (typeof wx.hideKeyboard === 'function') wx.hideKeyboard({ fail() {} })
  },

  applyFilters() {
    // 忽略空白和大小写：输入法常在中英文之间自动插入空格（例如“粤 BA”）。
    const normalize = value => String(value == null ? '' : value).replace(/\s+/g, '').toLowerCase()
    const keyword = normalize(this.data.searchKeyword)
    const date = this.data.selectedDate
    const matches = fields => !keyword || fields.some(field => normalize(field).indexOf(keyword) !== -1)
    let filtered = this.data.eventList.filter(ev => matches([ev.name, ev.venue, ev.group]))
    if (date) {
      filtered = filtered.filter(ev => ev.date >= date)
    }
    const filteredNews = this.data.newsList.filter(news => matches([news.title, news.tag, news.content]))
    this.setData({ filteredEvents: filtered, filteredNews })
  },

  async loadNews() {
    try {
      const list = await api().get('/api/comptrain/news')
      if (!Array.isArray(list)) throw new Error('请求失败，请重试')
      this.setData({ newsList: list })
      this.applyFilters()
    } catch (e) { this.setData({ newsList: [], filteredNews: [] }); showError(e) }
  },

  async loadEvents() {
    const version = this._eventsVersion = (this._eventsVersion || 0) + 1
    try {
      const list = await api().get('/api/comptrain/events')
      if (!Array.isArray(list)) throw new Error('请求失败，请重试')
      if (version !== this._eventsVersion) return
      this.setData({ eventList: list })
      this.applyFilters()
    } catch (e) {
      if (version !== this._eventsVersion) return
      this.setData({ eventList: [], filteredEvents: [] })
      showError(e)
    }
  },

  setRegistrations(list) {
    this._registrations = list
    const registeredMap = {}
    list.forEach(r => { if (r && r.eventId != null) registeredMap[r.eventId] = true })
    this.setData({ registeredMap })
  },

  async loadRegistrations() {
    const version = this._registrationsVersion = (this._registrationsVersion || 0) + 1
    try {
      const list = await api().get('/api/comptrain/registrations')
      if (!Array.isArray(list)) throw new Error('请求失败，请重试')
      if (version !== this._registrationsVersion || this._registerSubmitting) return
      this.setRegistrations(list)
      cacheRegistrations(list)
    } catch (e) {
      if (version !== this._registrationsVersion || this._registerSubmitting) return
      this.setRegistrations([])
      showError(e)
    }
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
    if (this._registerSubmitting) return
    const id = e.currentTarget.dataset.id
    const event = this.data.eventList.find(ev => ev.id === id)
    if (!event || this.data.registeredMap[event.id]) return
    if (['已截止', '已结束', 'CLOSED'].includes(event.status)) {
      wx.showToast({ title: event.status === '已结束' ? '已结束' : '已截止', icon: 'none' })
      return
    }
    if (event.status === '名额已满' || Number(event.slots) <= 0) {
      wx.showToast({ title: '该赛事名额已满', icon: 'none' })
      return
    }
    this._registerRequest = null
    this.setData({
      eventDetail: event,
      registerVisible: true,
      registerForm: { name: '', phone: '', group: event.group, team: '', remark: '' },
      groupIndex: Math.max(0, this.data.registerGroups.indexOf(event.group))
    })
  },

  closeRegister() {
    if (this._registerSubmitting) return
    this._registerRequest = null
    this.setData({ registerVisible: false })
  },

  onFormInput(e) {
    if (this._registerSubmitting) return
    const field = e.currentTarget.dataset.field
    this.setData({ [`registerForm.${field}`]: e.detail.value })
  },

  onGroupChange(e) {
    if (this._registerSubmitting) return
    const index = Number(e.detail.value)
    this.setData({ groupIndex: index, 'registerForm.group': this.data.registerGroups[index] })
  },

  async submitRegister() {
    if (this._registerSubmitting || !this.data.registerVisible) return
    const { name, phone, group } = this.data.registerForm
    if (!name.trim()) { wx.showToast({ title: '请填写姓名', icon: 'none' }); return }
    if (!/^1\d{10}$/.test(phone.trim())) { wx.showToast({ title: '请填写正确的手机号', icon: 'none' }); return }
    if (!group) { wx.showToast({ title: '请选择组别', icon: 'none' }); return }

    const event = this.data.eventDetail
    if (!event || this.data.registeredMap[event.id]) return
    const body = {
      group,
      name: name.trim(),
      phone: phone.trim(),
      team: this.data.registerForm.team.trim(),
      remark: this.data.registerForm.remark.trim()
    }
    const signature = JSON.stringify([event.id, body])
    if (!this._registerRequest || this._registerRequest.signature !== signature) {
      this._registerRequest = {
        signature,
        id: `registration_${Date.now()}_${++requestSequence}_${Math.random().toString(36).slice(2)}`
      }
    }
    this._registerSubmitting = true
    this._registrationsVersion = (this._registrationsVersion || 0) + 1
    try {
      const record = await api().post(`/api/comptrain/events/${encodeURIComponent(event.id)}/registrations`, {
        ...body, requestId: this._registerRequest.id
      })
      if (!record || record.eventId == null) throw new Error('请求失败，请重试')
      const list = [record, ...(this._registrations || []).filter(r => r.eventId !== record.eventId)]
      this._registrationsVersion = (this._registrationsVersion || 0) + 1
      this.setRegistrations(list)
      cacheRegistrations(list)
      this._registerRequest = null
      this.setData({ registerVisible: false, eventDetail: null })
      wx.showToast({ title: '报名成功！', icon: 'success' })
      // 名额和展示状态始终以服务端为准。
      void this.loadEvents()
    } catch (e) { showError(e) } finally { this._registerSubmitting = false }
  },

  stopPropagation() {}
})
