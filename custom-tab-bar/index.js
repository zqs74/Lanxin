Component({
  data: {
    selected: 0,
    tabList: [
      { value: 'home', icon: 'home', ariaLabel: '首页', pagePath: '/pages/index/index' },
      { value: 'match', icon: 'app', ariaLabel: '赛事', pagePath: '/pages/match/match' },
      { value: 'training', icon: 'ai-article', ariaLabel: '训练', pagePath: '/pages/training/training' },
      { value: 'profile', icon: 'user', ariaLabel: '我的', pagePath: '/pages/profile/profile' }
    ]
  },

  methods: {
    updateSelected(index) {
      this.setData({ selected: index })
    },

    onTabChange(e) {
      const value = e.detail.value
      const index = this.data.tabList.findIndex(item => item.value === value)
      
      // 只有点击不同的tab才跳转
      if (index !== -1 && index !== this.data.selected) {
        const pagePath = this.data.tabList[index].pagePath
        wx.switchTab({
          url: pagePath
        })
      }
    }
  }
})
