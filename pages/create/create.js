// create.js
Page({
  data: {
    clips: [
      { id: 1, description: '第一节08:24 两分跳投命中', selected: false },
      { id: 2, description: '第二节12:35 三分远投命中', selected: false },
      { id: 3, description: '第三节05:42 抢断后快攻', selected: false },
      { id: 4, description: '第四节01:18 压哨三分', selected: false }
    ],
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
        // 后续可调用wx.uploadFile上传视频到服务器
      },
      fail: (err) => {
        console.log('选择视频失败', err)
      }
    })
  },

  // 使用云端视频
  useCloudVideo() {
    // 这里可以实现从云端选择视频的逻辑
    console.log('使用云端视频')
  },

  // 切换片段选择状态
  toggleClip(e) {
    const index = e.currentTarget.dataset.index
    const clips = [...this.data.clips]
    clips[index].selected = !clips[index].selected
    this.setData({ clips })
  },

  // 标签切换事件
  onTabChange(e) {
    const value = e.detail.value
    this.setData({ tabValue: value })
    
    // 根据选择的标签跳转到对应页面
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