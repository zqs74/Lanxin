// profile-edit.js
Page({
  data: {
    profile: {
      avatar: '',
      name: '',
      position: '',
      height: '',
      weight: '',
      age: '',
      yearsOfPlay: '',
      skillFeature: ''
    },
    positions: ['控球后卫', '得分后卫', '小前锋', '大前锋', '中锋'],
    positionIndex: 0
  },

  onLoad() {
    // 初始化页面，从本地存储获取个人资料
    this.loadProfile()
  },

  // 加载个人资料
  loadProfile() {
    const profile = wx.getStorageSync('profile')
    if (profile) {
      this.setData({ profile })
      // 设置位置索引
      const positionIndex = this.data.positions.indexOf(profile.position)
      if (positionIndex !== -1) {
        this.setData({ positionIndex })
      }
    }
  },

  // 返回按钮点击事件
  goBack() {
    wx.navigateBack()
  },

  // 保存个人资料
  saveProfile() {
    const profile = this.data.profile
    
    // 简单验证
    if (!profile.name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }
    
    // 保存到本地存储
    wx.setStorageSync('profile', profile)
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
    
    // 延迟返回，让用户看到保存成功的提示
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  // 姓名输入变化
  onNameChange(e) {
    this.setData({
      'profile.name': e.detail.value
    })
  },

  // 位置选择变化
  onPositionChange(e) {
    const positionIndex = e.detail.value
    const position = this.data.positions[positionIndex]
    this.setData({
      positionIndex,
      'profile.position': position
    })
  },

  // 身高输入变化
  onHeightChange(e) {
    this.setData({
      'profile.height': e.detail.value
    })
  },

  // 体重输入变化
  onWeightChange(e) {
    this.setData({
      'profile.weight': e.detail.value
    })
  },

  // 年龄输入变化
  onAgeChange(e) {
    this.setData({
      'profile.age': e.detail.value
    })
  },

  // 球龄输入变化
  onYearsOfPlayChange(e) {
    this.setData({
      'profile.yearsOfPlay': e.detail.value
    })
  },

  // 技术特点输入变化
  onSkillFeatureChange(e) {
    this.setData({
      'profile.skillFeature': e.detail.value
    })
  },

  // 上传头像
  uploadAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        // 这里可以上传图片到服务器，这里简化处理，直接使用临时路径
        this.setData({
          'profile.avatar': tempFilePaths[0]
        })
      }
    })
  }

})