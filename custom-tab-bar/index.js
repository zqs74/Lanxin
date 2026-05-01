const TAB_LIST = [
  {
    value: 'home',
    text: '首页',
    ariaLabel: '首页',
    pagePath: '/pages/index/index',
    icon: '/images/tabbar/no/1.png',
    activeIcon: '/images/tabbar/yes/1.png'
  },
  {
    value: 'match',
    text: '赛事中心',
    ariaLabel: '赛事中心',
    pagePath: '/pages/match/match',
    icon: '/images/tabbar/no/2.png',
    activeIcon: '/images/tabbar/yes/2.png'
  },
  {
    value: 'training',
    text: '训练中心',
    ariaLabel: '训练中心',
    pagePath: '/pages/training/training',
    icon: '/images/tabbar/no/3.png',
    activeIcon: '/images/tabbar/yes/3.png'
  },
  {
    value: 'profile',
    text: '个人中心',
    ariaLabel: '个人中心',
    pagePath: '/pages/profile/profile',
    icon: '/images/tabbar/no/4.png',
    activeIcon: '/images/tabbar/yes/4.png'
  }
]

Component({
  data: {
    selected: 0,
    themeClass: '',
    tabList: TAB_LIST
  },

  attached() {
    this.syncTheme()
    this.syncSelectedByRoute()
  },

  pageLifetimes: {
    show() {
      this.syncTheme()
      this.syncSelectedByRoute()
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

    syncSelectedByRoute() {
      const pages = getCurrentPages()
      const current = pages[pages.length - 1]
      if (!current || !current.route) return

      const route = `/${current.route}`
      const selected = this.data.tabList.findIndex(item => item.pagePath === route)
      if (selected !== -1 && selected !== this.data.selected) {
        this.setData({ selected })
      }
    },

    updateSelected(index) {
      this.syncTheme()

      if (index !== this.data.selected) {
        this.setData({ selected: index })
      }
    },

    setTheme(theme) {
      this.syncTheme(theme)
    },

    onTabTap(e) {
      const { index, path } = e.currentTarget.dataset
      const selected = Number(index)

      if (selected === this.data.selected) return

      this.setData({ selected })
      wx.switchTab({
        url: path,
        fail: () => {
          this.syncSelectedByRoute()
        }
      })
    }
  }
})
