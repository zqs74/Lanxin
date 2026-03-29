Component({
  properties: {},

  data: {
    x: 0,
    y: 0,
    isDragging: false,
    startX: 0,
    startY: 0
  },

  lifetimes: {
    attached() {
      this.initPosition()
    }
  },

  methods: {
    initPosition() {
      const systemInfo = wx.getSystemInfoSync()
      const rightMargin = 8
      const tabBarHeight = 120
      const x = systemInfo.windowWidth - 120 - rightMargin
      const y = systemInfo.windowHeight - 120 - tabBarHeight - 8
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
      const tabBarHeight = 60
      
      let x = touch.clientX - 60
      let y = touch.clientY - 60
      
      const maxX = systemInfo.windowWidth - 120
      const maxY = systemInfo.windowHeight - 120 - tabBarHeight
      
      x = Math.max(0, Math.min(x, maxX))
      y = Math.max(0, Math.min(y, maxY))
      
      this.setData({ x, y })
    },

    onTouchEnd(e) {
      const systemInfo = wx.getSystemInfoSync()
      const tabBarHeight = 120
      const deltaX = Math.abs(e.changedTouches[0].clientX - this.data.startX)
      const deltaY = Math.abs(e.changedTouches[0].clientY - this.data.startY)
      
      if (deltaX < 10 && deltaY < 10) {
        this.navigateToChat()
        this.setData({ isDragging: false })
        return
      }
      
      this.setData({ isDragging: false })
      
      const centerX = systemInfo.windowWidth / 2
      const maxY = systemInfo.windowHeight - 120 - tabBarHeight
      
      let x = this.data.x
      let y = this.data.y
      
      if (x < centerX) {
        x = 8
      } else {
        x = systemInfo.windowWidth - 120 - 8
      }
      
      y = Math.max(0, Math.min(y, maxY))
      
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