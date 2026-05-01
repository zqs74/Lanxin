// profile-edit.js
const app = getApp()
Page({
  data: { themeClass: '' },
  onLoad() { const ut = app.getUserTheme(); this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') }) },
  onShow() { const ut = app.getUserTheme(); this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') }) },
  setTheme(t) { const ut = app.getUserTheme(); this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') }) }
})
