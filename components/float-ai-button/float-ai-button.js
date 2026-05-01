Component({
  properties: {},

  data: {
    x: 0,
    y: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    themeClass: 'theme-dark'
  },

  lifetimes: {
    attached() {
      this.syncTheme()
      const app = getApp()
      if (app.registerFloatAIButton) {
        app.registerFloatAIButton(this)
      }
      this.initPosition()
    },

    detached() {
      const app = getApp()
      if (app.unregisterFloatAIButton) {
        app.unregisterFloatAIButton(this)
      }
    }
  },

  pageLifetimes: {
    show() {
      this.syncTheme()
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

      const resolvedTheme = app.getTheme ? app.getTheme() : 'dark'
      return resolvedTheme === 'light' ? 'theme-light' : 'theme-dark'
    },

    syncTheme(theme) {
      this.setData({ themeClass: this.getThemeClass(theme) })
    },

    initPosition() {
      const systemInfo = wx.getSystemInfoSync()
      const pxToRpx = systemInfo.windowWidth / 750
      
      const btnSize = Math.round(110 * pxToRpx)
      const rightMargin = Math.round(24 * pxToRpx)
      const bottomMargin = Math.round(180 * pxToRpx)
      
      const x = systemInfo.windowWidth - btnSize - rightMargin
      const y = systemInfo.windowHeight - btnSize - bottomMargin
      
      this.setData({ x, y })
    },

    onTouchStart(e) {
      this.setData({ 
        isDragging: true,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY
      })
    },

    onTouchMove(e) {
      if (!this.data.isDragging) return
      
      const touch = e.touches[0]
      const systemInfo = wx.getSystemInfoSync()
      const pxToRpx = systemInfo.windowWidth / 750
      
      const btnSize = Math.round(110 * pxToRpx)
      const edgeMargin = Math.round(16 * pxToRpx)
      const bottomSafeArea = Math.round(200 * pxToRpx)
      
      let x = touch.clientX - btnSize / 2
      let y = touch.clientY - btnSize / 2
      
      const maxX = systemInfo.windowWidth - btnSize - edgeMargin
      const maxY = systemInfo.windowHeight - btnSize - bottomSafeArea
      
      x = Math.max(edgeMargin, Math.min(x, maxX))
      y = Math.max(edgeMargin, Math.min(y, maxY))
      
      this.setData({ x, y })
    },

    onTouchEnd(e) {
      const systemInfo = wx.getSystemInfoSync()
      const pxToRpx = systemInfo.windowWidth / 750
      
      const deltaX = Math.abs(e.changedTouches[0].clientX - this.data.startX)
      const deltaY = Math.abs(e.changedTouches[0].clientY - this.data.startY)
      
      if (deltaX < 10 && deltaY < 10) {
        this.navigateToChat()
        this.setData({ isDragging: false })
        return
      }
      
      this.setData({ isDragging: false })
      
      const centerX = systemInfo.windowWidth / 2
      const btnSize = Math.round(110 * pxToRpx)
      const edgeMargin = Math.round(20 * pxToRpx)
      const bottomSafeArea = Math.round(200 * pxToRpx)
      const maxY = systemInfo.windowHeight - btnSize - bottomSafeArea
      
      let x = this.data.x
      let y = this.data.y
      
      if (x < centerX) {
        x = edgeMargin
      } else {
        x = systemInfo.windowWidth - btnSize - edgeMargin
      }
      
      y = Math.max(edgeMargin, Math.min(y, maxY))
      
      this.setData({ x, y })
    },

    navigateToChat() {
      wx.navigateTo({
        url: '/pages/chat/chat',
        fail: (err) => {
          console.log('跳转失败', err)
        }
      })
    }
  }
})
