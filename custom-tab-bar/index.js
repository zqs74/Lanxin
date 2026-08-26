const TAB_LIST = [
  {
    value: 'home',
    text: '智能剪辑',
    ariaLabel: '智能剪辑',
    pagePath: '/pages/index/index',
    icon: '/images/tabbar/no/1.png',
    activeIcon: '/images/tabbar/yes/1.png'
  },
  {
    value: 'match',
    text: '赛事资讯报名',
    ariaLabel: '赛事资讯报名',
    pagePath: '/pages/match/match',
    icon: '/images/tabbar/no/2.png',
    activeIcon: '/images/tabbar/yes/2.svg'
  },
  {
    value: 'training',
    text: '个人成长分析',
    ariaLabel: '个人成长分析',
    pagePath: '/pages/training/training',
    icon: '/images/tabbar/no/3.png',
    activeIcon: '/images/tabbar/yes/3.png'
  },
  {
    value: 'profile',
    text: '商城',
    ariaLabel: '商城',
    pagePath: '/pages/profile/profile',
    icon: '/images/tabbar/no/4.png',
    activeIcon: '/images/tabbar/yes/4.png'
  }
]

Component({
  data: {
    selected: -1,
    themeClass: '',
    tabList: TAB_LIST
  },

  attached() {
    const app = getApp()
    this.syncTheme()
    if (app.registerTabBar) {
      app.registerTabBar(this)
    }
  },

  detached() {
    const app = getApp()
    if (app.unregisterTabBar) {
      app.unregisterTabBar(this)
    }
  },

  pageLifetimes: {
    show() {
      const app = getApp()
      if (app.refreshThemeFromSystem) {
        app.refreshThemeFromSystem()
      }
      if (app.initTabBarSelectedByRoute && app.getTabBarSelected && app.getTabBarSelected() === -1) {
        const pages = getCurrentPages()
        const current = pages[pages.length - 1]
        app.initTabBarSelectedByRoute(current && current.route)
      }
      if (app.registerTabBar) {
        app.registerTabBar(this)
      } else {
        this.syncTheme()
      }
    }
  },

  methods: {
    getThemeClass(theme) {
      if (theme === 'light') return 'theme-light'
      if (theme === 'dark') return 'theme-dark'

      const app = getApp()
      const userTheme = app.getUserTheme ? app.getUserTheme() : 'auto'

      if (userTheme === 'light') return 'theme-light'
      if (userTheme === 'dark') return 'theme-dark'

      const resolvedTheme = app.getTheme ? app.getTheme() : 'light'
      return resolvedTheme === 'dark' ? 'theme-dark' : 'theme-light'
    },

    syncTheme(theme) {
      this.setData({ themeClass: this.getThemeClass(theme) })
    },

    applyGlobalTabBarState(selected, theme) {
      const nextData = { themeClass: this.getThemeClass(theme) }
      const normalized = this.normalizeSelected(selected)

      if (normalized !== -1 && normalized !== this.data.selected) {
        nextData.selected = normalized
      }

      this.setData(nextData)
    },

    normalizeSelected(index) {
      const selected = Number(index)
      if (!Number.isInteger(selected) || selected < 0 || selected >= this.data.tabList.length) {
        return -1
      }
      return selected
    },

    updateSelected(index) {
      const selected = this.normalizeSelected(index)
      if (selected === -1) {
        return
      }

      const app = getApp()
      if (app.setTabBarSelected) {
        app.setTabBarSelected(selected)
      } else if (selected !== this.data.selected) {
        this.setData({ selected })
      }
    },

    setTheme(theme) {
      this.syncTheme(theme)
    },

    onTabTap(e) {
      const { index, path } = e.currentTarget.dataset
      const selected = this.normalizeSelected(index)

      if (selected === -1) {
        return
      }

      if (selected === this.data.selected) return

      const previousSelected = this.data.selected
      const app = getApp()
      if (app.setTabBarSelected) {
        app.setTabBarSelected(selected)
      } else {
        this.setData({ selected })
      }
      wx.switchTab({
        url: path,
        fail: () => {
          if (app.setTabBarSelected && previousSelected !== -1) {
            app.setTabBarSelected(previousSelected)
          } else {
            this.setData({ selected: previousSelected })
          }
        }
      })
    }
  }
})
