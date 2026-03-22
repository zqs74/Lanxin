// match.js
Page({
  data: {
    dateList: [],
    selectedDate: '',
  },

  onLoad() {
    // 生成两周的日期列表
    this.generateDateList()
  },

  onShow() {
    // 更新自定义TabBar的选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(1)
    }
  },

  // 生成日期列表
  generateDateList() {
    const dateList = []
    const today = new Date()
    const todayStr = this.formatDate(today)
    
    // 生成过去两周的日期
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      const dateStr = this.formatDate(date)
      
      dateList.push({
        date: dateStr,
        week: this.getWeekDay(date),
        day: date.getDate(),
        month: date.getMonth() + 1 + '月',
        isToday: dateStr === todayStr,
        isSelected: dateStr === todayStr
      })
    }
    
    this.setData({
      dateList: dateList,
      selectedDate: todayStr
    })
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 获取星期
  getWeekDay(date) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return weekdays[date.getDay()]
  },

  // 选择日期
  selectDate(e) {
    const selectedDate = e.currentTarget.dataset.date
    const dateList = this.data.dateList.map(item => ({
      ...item,
      isSelected: item.date === selectedDate
    }))
    
    this.setData({
      dateList: dateList,
      selectedDate: selectedDate
    })
  },

  // 跳转到比赛详情页
  goToMatchDetail() {
    wx.navigateTo({
      url: '/pages/match-detail/match-detail'
    })
  },


})