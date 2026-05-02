// nav-bar.js
Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: false
    }
  },

  data: {
    statusBarHeight: 44,
    NavBarHeight: 44
  },

  lifetimes: {
    attached() {
      let windowInfo = {}
      let deviceInfo = {}
      try { windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {} } catch (e) { windowInfo = {} }
      try { deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {} } catch (e) { deviceInfo = {} }
      this.setData({
        statusBarHeight: windowInfo.statusBarHeight || 44,
        NavBarHeight: deviceInfo.platform === 'ios' ? 44 : 48
      })
    }
  },

  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        wx.navigateBack()
      } else {
        wx.switchTab({ url: '/pages/index/index' })
      }
    }
  }
})
