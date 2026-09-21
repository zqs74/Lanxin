// profile-edit.js
const app = getApp()

const DEFAULT_PROFILE = {
  name: '',
  position: '',
  age: '',
  height: '',
  weight: '',
  yearsOfPlay: '',
  skillFeature: '',
  avatar: ''
}

Page({
  data: {
    themeClass: '',
    pageBg: '#f8f7f4',
    profile: { ...DEFAULT_PROFILE },
    positions: ['控球后卫', '得分后卫', '小前锋', '大前锋', '中锋'],
    positionIndex: -1
  },

  onLoad() {
    this._syncTheme()
    this.loadProfile()
  },

  onShow() {
    this._syncTheme()
  },

  setTheme() {
    this._syncTheme()
  },

  _themeClass(userTheme) {
    return userTheme === 'auto' ? '' : (userTheme === 'light' ? 'theme-light' : 'theme-dark')
  },

  _syncTheme() {
    const userTheme = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this._themeClass(userTheme), pageBg })
    app.applyNavBarColor(app.getTheme())
  },

  loadProfile() {
    const stored = wx.getStorageSync('profile') || {}
    const profile = { ...DEFAULT_PROFILE, ...stored }
    const positionIndex = this.data.positions.indexOf(profile.position)
    this.setData({ profile, positionIndex })
  },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
      return
    }
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  updateProfileField(field, value) {
    this.setData({ [`profile.${field}`]: value })
  },

  onNameChange(e) { this.updateProfileField('name', e.detail.value) },
  onAgeChange(e) { this.updateProfileField('age', e.detail.value) },
  onHeightChange(e) { this.updateProfileField('height', e.detail.value) },
  onWeightChange(e) { this.updateProfileField('weight', e.detail.value) },
  onYearsOfPlayChange(e) { this.updateProfileField('yearsOfPlay', e.detail.value) },
  onSkillFeatureChange(e) { this.updateProfileField('skillFeature', e.detail.value) },

  onPositionChange(e) {
    const positionIndex = Number(e.detail.value)
    this.setData({
      positionIndex,
      'profile.position': this.data.positions[positionIndex]
    })
  },

  uploadAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const file = res.tempFiles && res.tempFiles[0]
        if (file && file.tempFilePath) {
          this.persistAvatar(file.tempFilePath)
        }
      }
    })
  },

  // 首次保存到本地用户目录，拿到持久路径；失败时退回临时路径
  persistAvatar(tempFilePath) {
    try {
      wx.getFileSystemManager().saveFile({
        tempFilePath,
        success: (saveRes) => { this.setData({ 'profile.avatar': saveRes.savedFilePath }) },
        fail: () => { this.setData({ 'profile.avatar': tempFilePath }) }
      })
    } catch (e) {
      this.setData({ 'profile.avatar': tempFilePath })
    }
  },

  saveProfile() {
    const profile = { ...this.data.profile }
    profile.name = String(profile.name || '').trim()
    profile.position = String(profile.position || '').trim()
    profile.age = String(profile.age || '').trim()
    profile.height = String(profile.height || '').trim()
    profile.weight = String(profile.weight || '').trim()
    profile.yearsOfPlay = String(profile.yearsOfPlay || '').trim()
    profile.skillFeature = String(profile.skillFeature || '').trim()

    if (!profile.name) {
      wx.showToast({ title: '请填写姓名', icon: 'none' })
      return
    }

    wx.setStorageSync('profile', profile)
    wx.showToast({ title: '资料已保存', icon: 'success', duration: 900 })
    setTimeout(() => this.goBack(), 900)
  }
})
