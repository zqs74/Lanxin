// match.js - 昇梦体育 赛事页面
const app = getApp()
Page({
  data: {
    themeClass: '',
    pageBg: '#f8f7f4',
    selectedDate: ''
  },

  onLoad() {
    this.initTheme()
    this.setTodayDate()
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
  },

  goToMatchDetail() {
    wx.navigateTo({
      url: '/pages/match-detail/match-detail'
    })
  }
})
