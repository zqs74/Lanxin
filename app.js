// app.js - 昇梦体育 主题系统（auto/light/dark 三模式 + wx.onThemeChange）
App({
  onLaunch() {
    wx.cloud.init({
      env: "cloud1-d8gg26do45365a017"
    })

    this.globalData = {
      userInfo: null,
      userTheme: 'auto',
      resolvedTheme: 'dark',
      careerStats: {
        points: 128,
        rebounds: 86,
        assists: 42,
        shootingPercentage: 38.7,
        totalGames: 24
      }
    }

    this.loadTheme()
    this.listenSystemTheme()
  },

  globalData: {
    userInfo: null,
    userTheme: 'auto',
    resolvedTheme: 'dark',
    careerStats: {
      points: 128,
      rebounds: 86,
      assists: 42,
      shootingPercentage: 38.7,
      totalGames: 24
    }
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
  },

  resolveEffectiveTheme(userTheme) {
    if (userTheme === 'light') return 'light'
    if (userTheme === 'dark') return 'dark'
    // auto mode: follow system
    try {
      const sysInfo = wx.getSystemInfoSync()
      return sysInfo.theme === 'dark' ? 'dark' : 'light'
    } catch (e) {
      return 'dark'
    }
  },

  listenSystemTheme() {
    if (typeof wx.onThemeChange === 'function') {
      wx.onThemeChange((res) => {
        console.log('系统主题变化:', res.theme)
        if (this.globalData.userTheme === 'auto') {
          const newResolved = res.theme === 'dark' ? 'dark' : 'light'
          if (newResolved !== this.globalData.resolvedTheme) {
            this.globalData.resolvedTheme = newResolved
            this.notifyAllPages(newResolved)
          }
        }
      })
    }
  },

  notifyAllPages(theme) {
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.setTheme) {
        page.setTheme(theme)
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
    const changed = resolved !== this.globalData.resolvedTheme
    this.globalData.resolvedTheme = resolved

    try {
      wx.setStorageSync('app_theme', userTheme)
    } catch (e) {
      console.error('保存主题设置失败', e)
    }

    if (changed) {
      this.notifyAllPages(resolved)
    }

    return resolved
  },

  getTheme() {
    return this.globalData.resolvedTheme
  },

  getUserTheme() {
    return this.globalData.userTheme
  },

  api: {
    baseURL: 'http://192.168.43.233:8080',
    get: function(url, params) {
      const baseURL = this.baseURL;
      wx.showLoading({
        title: '加载中...'
      });

      return new Promise((resolve, reject) => {
        wx.request({
          url: baseURL + url,
          method: 'GET',
          data: params,
          success: (res) => {
            wx.hideLoading();
            console.log('API响应:', res);
            if (res.statusCode === 200) {
              if (res.data.code === 0) {
                resolve(res.data.data);
              } else {
                reject(res.data);
              }
            } else {
              reject({ message: '网络错误' + res.statusCode });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            console.log('API请求失败:', err);
            reject(err);
          }
        });
      });
    }
  }
})
