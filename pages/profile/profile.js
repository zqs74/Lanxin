// profile.js
const app = getApp()

const DEFAULT_PROFILE = {
  name: '',
  position: '',
  age: '',
  height: '',
  weight: '',
  yearsOfPlay: '',
  skillFeature: '',
  avatar: ''
}

Page({
  data: {
    navHeight: 0,
    userTheme: 'auto',
    themeClass: '',
    pageBg: '#f8f7f4',
    themeLabel: '跟随系统',
    stats: {
      points: 0,
      fieldGoals: 0,
      shootingPercentage: 0
    },
    profile: {
      name: '篮球爱好者',
      position: '未设置',
      height: '未设置',
      weight: '未设置',
      age: '',
      yearsOfPlay: '',
      skillFeature: '',
      avatar: ''
    }
  },

  onLoad() {
    this.setNavHeight()
    this.initTheme()
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.updateSelected(3)
    this.loadProfile()
    this.syncTheme()
  },

  setTheme() {
    this.syncTheme()
  },

  setNavHeight() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 44
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48
    this.setData({ navHeight: (statusBarHeight + navBarHeight) * 2 })
  },

  initTheme() {
    this.syncTheme()
  },

  getThemeClass(userTheme) {
    if (userTheme === 'auto') return ''
    return userTheme === 'light' ? 'theme-light' : 'theme-dark'
  },

  getThemeLabel(userTheme) {
    if (userTheme === 'auto') return '跟随系统'
    return userTheme === 'light' ? '浅色模式' : '深色模式'
  },

  syncTheme() {
    const userTheme = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({
      userTheme,
      themeClass: this.getThemeClass(userTheme),
      themeLabel: this.getThemeLabel(userTheme),
      pageBg
    })
    app.applyNavBarColor(app.getTheme())
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
        this.syncTheme()
        wx.showToast({
          title: `已切换为${selected}`,
          icon: 'success',
          duration: 1400
        })
      }
    })
  },

  normalizeProfile(profile = {}) {
    const source = { ...DEFAULT_PROFILE, ...profile }
    return {
      ...source,
      name: source.name || '篮球爱好者',
      position: source.position || '未设置',
      height: source.height ? `${source.height}cm` : '未设置',
      weight: source.weight ? `${source.weight}kg` : '未设置'
    }
  },

  loadProfile() {
    const profile = wx.getStorageSync('profile')
    this.setData({ profile: this.normalizeProfile(profile || DEFAULT_PROFILE) })
  },

  editProfile() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' })
  },

  goToChat() {
    wx.navigateTo({ url: '/pages/chat/chat' })
  }
})
