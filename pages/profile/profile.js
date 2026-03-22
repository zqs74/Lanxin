// profile.js
Page({
  data: {
    stats: {
      points: 0,
      fieldGoals: 0,
      shootingPercentage: 0
    },
    profile: {
      name: '未填写名称',
      position: '未填',
      height: '0cm',
      weight: '0kg'
    }
  },

  onShow() {
    // 更新自定义TabBar的选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(3)
    }
    // 加载个人资料
    this.loadProfile()
  },

  // 加载个人资料
  loadProfile() {
    const profile = wx.getStorageSync('profile')
    if (profile) {
      const displayProfile = {
        name: profile.name || '未填写名称',
        position: profile.position || '未填',
        height: profile.height ? `${profile.height}cm` : '0cm',
        weight: profile.weight ? `${profile.weight}kg` : '0kg'
      }
      this.setData({ profile: displayProfile })
    }
  },

  // 编辑个人资料
  editProfile() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    })
  },

  // 跳转到AI助手
  goToChat() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    })
  }

})