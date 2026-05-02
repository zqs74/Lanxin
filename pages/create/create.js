// create.js - 昇梦体育 AI创作
const app = getApp()

Page({
  data: {
    themeClass: '',
    pageBg: '#f8f7f4',
    selectedCount: 0,
    clips: [
      { id: 1, time: '第一节 08:24', description: '两分跳投', type: '投篮', selected: false },
      { id: 2, time: '第一节 06:12', description: '突破上篮', type: '上篮', selected: false },
      { id: 3, time: '第二节 10:05', description: '三分远投', type: '三分', selected: false },
      { id: 4, time: '第三节 05:30', description: '罚球得分', type: '罚球', selected: false },
      { id: 5, time: '第四节 01:20', description: '关键三分', type: '三分', selected: false }
    ]
  },

  _themeClass(ut) { return ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') },

  _syncTheme() {
    const ut = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this._themeClass(ut), pageBg })
    app.applyNavBarColor(app.getTheme())
  },

  onLoad() { this._syncTheme() },

  onShow() { this._syncTheme() },

  setTheme(t) { this._syncTheme() },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  toggleClip(e) {
    const index = e.currentTarget.dataset.index
    const clips = this.data.clips
    clips[index].selected = !clips[index].selected
    const selectedCount = clips.filter(c => c.selected).length
    this.setData({ clips, selectedCount })
  },

  uploadLocalVideo() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        wx.showToast({ title: '视频已选择', icon: 'success' })
      }
    })
  },

  useCloudVideo() {
    wx.showToast({ title: '云端视频功能开发中', icon: 'none' })
  },

  generateWithAI() {
    if (this.data.selectedCount === 0) {
      wx.showToast({ title: '请选择至少一个精彩片段', icon: 'none' })
      return
    }
    wx.showLoading({ title: '生成中...' })
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '集锦生成成功', icon: 'success' })
    }, 2000)
  }
})
