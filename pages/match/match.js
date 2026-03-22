// match.js
Page({
  data: {
    selectedDate: ''
  },

  onLoad() {
    // 设置今天为默认日期
    const today = new Date()
    const todayStr = this.formatDate(today)
    this.setData({
      selectedDate: todayStr
    })
  },

  onShow() {
    // 更新自定义TabBar的选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(1)
    }
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 日期选择器变化
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
    })
  },

  // 跳转到比赛详情页
  goToMatchDetail() {
    wx.navigateTo({
      url: '/pages/match-detail/match-detail'
    })
  },


})