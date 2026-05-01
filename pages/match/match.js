// match.js - 昇梦体育 赛事页面
const app = getApp()
Page({
  data: {
    themeClass: '',
    selectedDate: ''
  },

  onLoad() {
    this.initTheme()
    this.setTodayDate()
  },

  initTheme() {
    const ut = app.getUserTheme()
    this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') })
  },

  setTheme(t) {
    const ut = app.getUserTheme()
    this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) { this.getTabBar().updateSelected(1) }
    const ut = app.getUserTheme()
    this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') })
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
