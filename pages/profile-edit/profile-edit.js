// profile-edit.js
const app = getApp()
Page({
  data: { themeClass: '', pageBg: '#f8f7f4' },
  _syncTheme() {
    const ut = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark'), pageBg })
    app.applyNavBarColor(app.getTheme())
  },
  onLoad() { this._syncTheme() },
  onShow() { this._syncTheme() },
  setTheme(t) { this._syncTheme() }
})
