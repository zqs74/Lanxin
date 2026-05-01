// index.js - 昇梦体育 首页
const app = getApp()

Page({
  data: {
    navHeight: 0,
    themeClass: '',
    pageBg: '#f8f7f4',
    currentDate: '',
    careerStats: {
      points: 0, rebounds: 0, assists: 0,
      shootingPercentage: 0.0, totalGames: 0
    },
    statsData: [
      { id: 1, icon: '🏆', value: '0', label: '得分' },
      { id: 2, icon: '📊', value: '0', label: '篮板' },
      { id: 3, icon: '🎯', value: '0', label: '助攻' },
      { id: 4, icon: '🎪', value: '0%', label: '命中率' },
      { id: 5, icon: '⚡', value: '0', label: '场次' }
    ],
    quickActions: [
      { id: 1, icon: '📝', label: '创建比赛', action: 'createMatch', bgColor: 'linear-gradient(135deg, #44ceff 0%, #59a8ff 100%)' },
      { id: 2, icon: '📺', label: '查看训练', action: 'goTraining', bgColor: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' },
      { id: 3, icon: '🤖', label: 'AI助手', action: 'goChat', bgColor: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)' },
      { id: 4, icon: '👤', label: '个人中心', action: 'goProfile', bgColor: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' }
    ],
    activeVideoTab: 'collection',
    contentAnimClass: '',
  },

  onLoad() {
    this.initTheme()
    this.setNavHeight()
    this.setCurrentDate()
    this.loadCareerStats()
  },

  initTheme() {
    const userTheme = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this.getThemeClass(userTheme), pageBg })
  },

  getThemeClass(userTheme) {
    if (userTheme === 'auto') return ''
    return userTheme === 'light' ? 'theme-light' : 'theme-dark'
  },

  setTheme(theme) {
    const userTheme = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this.getThemeClass(userTheme), pageBg })
    this.applyNavBarColor()
  },

  applyNavBarColor() {
    app.applyNavBarColor(app.getTheme())
  },

  setNavHeight() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 44
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48
    this.setData({ navHeight: (statusBarHeight + navBarHeight) * 2 })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) { this.getTabBar().updateSelected(0) }
    const userTheme = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this.getThemeClass(userTheme), pageBg })
    this.applyNavBarColor()
  },

  setCurrentDate() {
    const now = new Date(); const month = now.getMonth() + 1; const day = now.getDate()
    const weekdays = ['周日','周一','周二','周三','周四','周五','周六']
    this.setData({ currentDate: `${month}月${day}日 ${weekdays[now.getDay()]}` })
  },

  loadCareerStats() {
    try {
      const stats = wx.getStorageSync('careerStats')
      if (stats) {
        this.setData({
          careerStats: stats,
          statsData: [
            { id: 1, icon: '🏆', value: stats.points.toString(), label: '得分' },
            { id: 2, icon: '📊', value: stats.rebounds.toString(), label: '篮板' },
            { id: 3, icon: '🎯', value: stats.assists.toString(), label: '助攻' },
            { id: 4, icon: '🎪', value: stats.shootingPercentage + '%', label: '命中率' },
            { id: 5, icon: '⚡', value: stats.totalGames.toString(), label: '场次' }
          ]
        })
      }
    } catch (e) { console.error('加载生涯数据失败', e) }
  },

  switchVideoTab(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeVideoTab) return
    this.setData({ contentAnimClass: 'fade-out' })
    setTimeout(() => { this.setData({ activeVideoTab: tab, contentAnimClass: 'fade-in' }) }, 150)
  },

  goToCreate() { wx.navigateTo({ url: '/pages/create/create' }) },

  handleAction(e) {
    const action = e.currentTarget.dataset.action
    switch(action) {
      case 'createMatch': wx.navigateTo({ url: '/pages/create/create' }); break
      case 'goTraining': wx.switchTab({ url: '/pages/training/training' }); break
      case 'goChat': wx.navigateTo({ url: '/pages/chat/chat' }); break
      case 'goProfile': wx.switchTab({ url: '/pages/profile/profile' }); break
    }
  }
})
