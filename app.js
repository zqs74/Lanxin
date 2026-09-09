const { createApiClient } = require('./utils/api')

// app.js - 昇梦体育 主题系统（auto/light/dark 三模式 + wx.onThemeChange）
App({
  onLaunch() {
    this.globalData = {
      userInfo: null,
      userTheme: 'auto',
      resolvedTheme: 'dark',
      tabBarSelected: -1,
      tabBarInstances: [],
      floatAIButtonInstances: [],
      careerStats: {
        points: 0,
        rebounds: 0,
        assists: 0,
        shootingPercentage: 0,
        totalGames: 0
      }
    }

    this.api = createApiClient(wx)
    this.globalData.api = this.api
    this.globalData.authReady = this.api.ensureLogin().then(user => {
      this.globalData.userInfo = user
      return user
    }).catch(error => {
      this.globalData.authError = { code: error.code, message: error.message }
      return null
    })

    this.loadTheme()
    this.listenSystemTheme()
  },

  onShow() {
    this.refreshThemeFromSystem()
  },

  onThemeChange(res) {
    this.handleSystemThemeChange(res && res.theme)
  },

  globalData: {
    userInfo: null,
    userTheme: 'auto',
    resolvedTheme: 'dark',
    tabBarSelected: -1,
    tabBarInstances: [],
    floatAIButtonInstances: [],
    careerStats: {
      points: 0,
      rebounds: 0,
      assists: 0,
      shootingPercentage: 0,
      totalGames: 0
    }
  },

  normalizeTabBarIndex(index) {
    const selected = Number(index)
    if (!Number.isInteger(selected) || selected < 0 || selected > 3) {
      return -1
    }
    return selected
  },

  registerTabBar(instance) {
    if (!instance) return
    const instances = this.globalData.tabBarInstances || []
    if (!instances.includes(instance)) {
      instances.push(instance)
      this.globalData.tabBarInstances = instances
    }
    if (instance.applyGlobalTabBarState) {
      instance.applyGlobalTabBarState(this.globalData.tabBarSelected, this.globalData.resolvedTheme)
    }
  },

  unregisterTabBar(instance) {
    const instances = this.globalData.tabBarInstances || []
    this.globalData.tabBarInstances = instances.filter(item => item !== instance)
  },

  getTabBarSelected() {
    return typeof this.globalData.tabBarSelected === 'number' ? this.globalData.tabBarSelected : -1
  },

  initTabBarSelectedByRoute(route) {
    if (this.getTabBarSelected() !== -1 || !route) {
      return this.getTabBarSelected()
    }

    const path = route.charAt(0) === '/' ? route : `/${route}`
    const routeMap = {
      '/pages/index/index': 0,
      '/pages/match/match': 1,
      '/pages/training/training': 2,
      '/pages/profile/profile': 3
    }
    const selected = routeMap[path]

    if (typeof selected === 'number') {
      this.globalData.tabBarSelected = selected
      this.notifyTabBarInstances()
    }

    return this.getTabBarSelected()
  },

  setTabBarSelected(index) {
    const selected = this.normalizeTabBarIndex(index)
    if (selected === -1) return this.getTabBarSelected()

    this.globalData.tabBarSelected = selected
    this.notifyTabBarInstances()
    return selected
  },

  notifyTabBarInstances() {
    const instances = this.globalData.tabBarInstances || []
    instances.forEach(instance => {
      if (instance && instance.applyGlobalTabBarState) {
        instance.applyGlobalTabBarState(this.globalData.tabBarSelected, this.globalData.resolvedTheme)
      }
    })
  },

  registerFloatAIButton(instance) {
    if (!instance) return
    const instances = this.globalData.floatAIButtonInstances || []
    if (!instances.includes(instance)) {
      instances.push(instance)
      this.globalData.floatAIButtonInstances = instances
    }
    if (instance.syncTheme) {
      instance.syncTheme(this.globalData.resolvedTheme)
    }
  },

  unregisterFloatAIButton(instance) {
    const instances = this.globalData.floatAIButtonInstances || []
    this.globalData.floatAIButtonInstances = instances.filter(item => item !== instance)
  },

  notifyFloatAIButtons() {
    const instances = this.globalData.floatAIButtonInstances || []
    instances.forEach(instance => {
      if (instance && instance.syncTheme) {
        instance.syncTheme(this.globalData.resolvedTheme)
      }
    })
  },

  loadTheme() {
    try {
      const stored = wx.getStorageSync('app_theme')
      const userTheme = stored || 'auto'
      this.globalData.userTheme = userTheme
      this.globalData.resolvedTheme = this.resolveEffectiveTheme(userTheme)
    } catch (e) {
      this.globalData.userTheme = 'auto'
      this.globalData.resolvedTheme = this.resolveEffectiveTheme('auto')
    }
    this.applyNavBarColor(this.globalData.resolvedTheme)
  },

  normalizeTheme(theme) {
    return theme === 'dark' ? 'dark' : 'light'
  },

  getSystemTheme() {
    const candidates = []

    try {
      if (typeof wx.getAppBaseInfo === 'function') {
        candidates.push(wx.getAppBaseInfo())
      }
    } catch (e) {}

    try {
      if (typeof wx.getWindowInfo === 'function') {
        candidates.push(wx.getWindowInfo())
      }
    } catch (e) {}

    try {
      if (typeof wx.getSystemSetting === 'function') {
        candidates.push(wx.getSystemSetting())
      }
    } catch (e) {}

    for (const info of candidates) {
      if (info && (info.theme === 'dark' || info.theme === 'light')) {
        return info.theme
      }
    }

    return this.globalData && this.globalData.resolvedTheme ? this.globalData.resolvedTheme : 'light'
  },

  resolveEffectiveTheme(userTheme) {
    if (userTheme === 'light') return 'light'
    if (userTheme === 'dark') return 'dark'
    return this.normalizeTheme(this.getSystemTheme())
  },

  applyResolvedTheme(resolvedTheme, options = {}) {
    const nextTheme = this.normalizeTheme(resolvedTheme)
    const changed = nextTheme !== this.globalData.resolvedTheme
    this.globalData.resolvedTheme = nextTheme

    this.applyNavBarColor(nextTheme)

    if (changed || options.forceNotify) {
      this.notifyAllPages(nextTheme)
      this.notifyTabBarInstances()
      this.notifyFloatAIButtons()
    }
  },

  refreshThemeFromSystem() {
    if (this.globalData.userTheme !== 'auto') return this.globalData.resolvedTheme
    const resolved = this.resolveEffectiveTheme('auto')
    this.applyResolvedTheme(resolved)
    return resolved
  },

  handleSystemThemeChange(theme) {
    if (this.globalData.userTheme !== 'auto') return
    this.applyResolvedTheme(theme || this.getSystemTheme(), { forceNotify: true })
  },

  listenSystemTheme() {
    if (typeof wx.onThemeChange === 'function' && !this._themeChangeListener) {
      this._themeChangeListener = (res) => {
        this.handleSystemThemeChange(res && res.theme)
      }
      wx.onThemeChange(this._themeChangeListener)
    }
  },

  applyNavBarColor(theme) {
    const isDark = theme === 'dark'
    const bg = isDark ? '#0a0a0a' : '#f8f7f4'
    wx.setNavigationBarColor({
      frontColor: isDark ? '#ffffff' : '#000000',
      backgroundColor: bg,
      animation: { duration: 200, timingFunc: 'easeInOut' }
    })
    wx.setBackgroundColor({
      backgroundColor: bg,
      backgroundColorTop: bg,
      backgroundColorBottom: bg
    })
  },

  notifyAllPages(theme) {
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.setTheme) {
        page.setTheme(theme)
      }
      if (page.applyNavBarColor) {
        page.applyNavBarColor(theme)
      }
      if (typeof page.getTabBar === 'function' && page.getTabBar()) {
        const tabBar = page.getTabBar()
        if (tabBar.setTheme) {
          tabBar.setTheme(theme)
        }
      }
    })
  },

  setUserTheme(userTheme) {
    this.globalData.userTheme = userTheme
    const resolved = this.resolveEffectiveTheme(userTheme)

    try {
      wx.setStorageSync('app_theme', userTheme)
    } catch (e) {
      console.error('保存主题设置失败', e)
    }

    this.applyResolvedTheme(resolved, { forceNotify: true })

    return resolved
  },

  getTheme() {
    return this.globalData.resolvedTheme
  },

  getThemeColors() {
    const isDark = this.globalData.resolvedTheme === 'dark'
    return {
      pageBg: isDark ? '#0a0a0a' : '#f8f7f4',
      frontColor: isDark ? '#ffffff' : '#000000'
    }
  },

  getUserTheme() {
    return this.globalData.userTheme
  },

  api: null
})
