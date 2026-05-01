// profile.js - 昇梦体育 个人中心
const app = getApp()

Page({
  data: {
    navHeight: 0,
    userTheme: 'auto',
    themeClass: '',
    themeLabel: '跟随系统',
    stats: {
      points: 0,
      fieldGoals: 0,
      shootingPercentage: 0
    },
    profile: {
      name: '未填写名称',
      position: '未填',
      height: '0cm',
      weight: '0kg'
    }
  },

  onLoad() {
    this.setNavHeight()
    this.initTheme()
  },

  setNavHeight() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 44
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48
    this.setData({ navHeight: (statusBarHeight + navBarHeight) * 2 })
  },

  initTheme() {
    const userTheme = app.getUserTheme()
    const resolved = app.getTheme()
    const themeClass = this.getThemeClass(userTheme)
    const themeLabel = this.getThemeLabel(userTheme)
    this.setData({ userTheme, themeClass, themeLabel })
  },

  getThemeClass(userTheme) {
    if (userTheme === 'auto') return ''
    return userTheme === 'light' ? 'theme-light' : 'theme-dark'
  },

  getThemeLabel(userTheme) {
    if (userTheme === 'auto') return '跟随系统'
    return userTheme === 'light' ? '浅色模式' : '深色模式'
  },

  setTheme(theme) {
    const userTheme = app.getUserTheme()
    const themeClass = this.getThemeClass(userTheme)
    const themeLabel = this.getThemeLabel(userTheme)
    this.setData({ themeClass, themeLabel, userTheme })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(3)
    }
    this.loadProfile()
    const userTheme = app.getUserTheme()
    if (userTheme !== this.data.userTheme) {
      this.setData({
        userTheme,
        themeClass: this.getThemeClass(userTheme),
        themeLabel: this.getThemeLabel(userTheme)
      })
    }
  },

  handleToggleTheme() {
    const choices = ['跟随系统', '浅色模式', '深色模式']
    const themeMap = { '跟随系统': 'auto', '浅色模式': 'light', '深色模式': 'dark' }
    wx.showActionSheet({
      itemList: choices,
      success: (res) => {
        const selected = choices[res.tapIndex]
        const userTheme = themeMap[selected]
        app.setUserTheme(userTheme)
        this.setData({
          userTheme,
          themeClass: this.getThemeClass(userTheme),
          themeLabel: selected
        })
        wx.showToast({
          title: '已切换为' + selected,
          icon: 'success',
          duration: 1500
        })
      }
    })
  },

  loadProfile() {
    const profile = wx.getStorageSync('profile')
    if (profile) {
      const displayProfile = {
        name: profile.name || '未填写名称',
        position: profile.position || '未填',
        height: profile.height ? `${profile.height}cm` : '0cm',
        weight: profile.weight ? `${profile.weight}kg` : '0kg'
      }
      this.setData({ profile: displayProfile })
    }
  },

  editProfile() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' })
  },

  goToChat() {
    wx.navigateTo({ url: '/pages/chat/chat' })
  }
})
