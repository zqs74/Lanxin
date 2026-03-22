// create.js - 现代化UI
Page({
  data: {
    clips: [
      { id: 1, time: '第一节 08:24', description: '两分跳投命中', type: '跳投', selected: false },
      { id: 2, time: '第二节 12:35', description: '三分远投命中', type: '三分', selected: false },
      { id: 3, time: '第三节 05:42', description: '抢断后快攻', type: '快攻', selected: false },
      { id: 4, time: '第四节 01:18', description: '压哨三分', type: '关键球', selected: false }
    ],
    selectedCount: 0,
    tabValue: 'create',
    tabList: [
      { value: 'home', icon: 'home', ariaLabel: '首页' },
      { value: 'match', icon: 'app', ariaLabel: '赛事' },
      { value: 'training', icon: 'chat', ariaLabel: '训练' },
      { value: 'profile', icon: 'user', ariaLabel: '我的' },
    ],
  },

  // 上传本地视频
  uploadLocalVideo() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        console.log('选择视频成功', res)
        wx.showToast({
          title: '视频已选择',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.log('选择视频失败', err)
      }
    })
  },

  // 使用云端视频
  useCloudVideo() {
    console.log('使用云端视频')
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 切换片段选择状态
  toggleClip(e) {
    const index = e.currentTarget.dataset.index
    const clips = [...this.data.clips]
    clips[index].selected = !clips[index].selected
    
    const selectedCount = clips.filter(clip => clip.selected).length
    
    this.setData({ 
      clips, 
      selectedCount 
    })
  },

  // AI智能生成
  generateWithAI() {
    wx.showLoading({
      title: 'AI生成中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '生成成功！',
        icon: 'success'
      })
    }, 2000)
  },

  // 标签切换事件
  onTabChange(e) {
    const value = e.detail.value
    this.setData({ tabValue: value })
    
    switch (value) {
      case 'home':
        wx.switchTab({ url: '/pages/index/index' })
        break
      case 'match':
        wx.switchTab({ url: '/pages/match/match' })
        break
      case 'training':
        wx.switchTab({ url: '/pages/training/training' })
        break
      case 'profile':
        wx.switchTab({ url: '/pages/profile/profile' })
        break
    }
  }
})
