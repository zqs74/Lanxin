const privacy = require('../../utils/privacy')
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
  ...privacy.pageMethods,
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

  onHide() { this.cancelPrivacyAuthorization() },
  onUnload() { this.cancelPrivacyAuthorization() },

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

  async getApi() {
    if (app.globalData.authReady) await app.globalData.authReady
    return app.api || app.globalData.api
  },

  mapProfile(user) {
    const str = value => value == null ? '' : String(value)
    return { name: user.nickname || '', avatar: user.avatarUrl || '', position: user.position || '',
      age: str(user.age), height: str(user.heightCm), weight: str(user.weightKg),
      yearsOfPlay: str(user.yearsOfPlay), skillFeature: user.skillFeature || '' }
  },

  async loadProfile() {
    const revision = this._editRevision || 0
    try {
      const api = await this.getApi()
      const user = await api.get('/api/auth/me')
      const profile = this.mapProfile(user)
      if (revision === (this._editRevision || 0)) {
        this.setData({ profile, positionIndex: this.data.positions.indexOf(profile.position) })
      }
    } catch (error) { wx.showToast({ title: error.message || '加载失败', icon: 'none' }) }
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
    this._editRevision = (this._editRevision || 0) + 1
    this.setData({ [`profile.${field}`]: value })
  },

  onNameChange(e) { this.updateProfileField('name', e.detail.value) },
  onAgeChange(e) { this.updateProfileField('age', e.detail.value) },
  onHeightChange(e) { this.updateProfileField('height', e.detail.value) },
  onWeightChange(e) { this.updateProfileField('weight', e.detail.value) },
  onYearsOfPlayChange(e) { this.updateProfileField('yearsOfPlay', e.detail.value) },
  onSkillFeatureChange(e) { this.updateProfileField('skillFeature', e.detail.value) },

  onPositionChange(e) {
    this._editRevision = (this._editRevision || 0) + 1
    const positionIndex = Number(e.detail.value)
    this.setData({
      positionIndex,
      'profile.position': this.data.positions[positionIndex]
    })
  },

  async uploadAvatar() {
    const generation = this._privacyGeneration || 0
    if (!await privacy.authorizeMedia(this)) return
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (generation !== (this._privacyGeneration || 0)) return
        const file = res.tempFiles && res.tempFiles[0]
        if (file && file.tempFilePath) {
          this.updateProfileField('avatar', file.tempFilePath)
        }
      },
      fail: error => privacy.mediaFailure(error)
    })
  },

  async saveProfile() {
    if (this._saving) return
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

    const number = value => value === '' ? null : Number(value)
    const numeric = [profile.age, profile.height, profile.weight, profile.yearsOfPlay]
    if (numeric.some(value => value !== '' && !Number.isInteger(Number(value)))) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    this._saving = true
    const revision = this._editRevision = (this._editRevision || 0) + 1
    try {
      const api = await this.getApi()
      const auth = await api.ensureLogin()
      if (!auth || auth.userId == null) throw { message: '未登录或登录已过期' }
      const localAvatar = value => !!value && (!/^https?:\/\//i.test(value) || /^https?:\/\/(tmp|usr)\//i.test(value))
      if (localAvatar(profile.avatar)) {
        const uploaded = await api.upload('/api/upload/image', profile.avatar)
        if (!uploaded || !uploaded.url || localAvatar(uploaded.url)) throw { message: '保存失败，请重试' }
        profile.avatar = uploaded.url
      }
      const saved = await api.put('/api/users/' + encodeURIComponent(auth.userId), {
        nickname: profile.name, avatarUrl: profile.avatar, position: profile.position,
        age: number(profile.age), heightCm: number(profile.height), weightKg: number(profile.weight),
        yearsOfPlay: number(profile.yearsOfPlay), skillFeature: profile.skillFeature
      })
      const confirmed = this.mapProfile(saved)
      wx.setStorageSync('profile', confirmed)
      if (revision === this._editRevision) {
        this.setData({ profile: confirmed, positionIndex: this.data.positions.indexOf(confirmed.position) })
        setTimeout(() => { if (revision === this._editRevision) this.goBack() }, 900)
      }
      wx.showToast({ title: '资料已保存', icon: 'success', duration: 900 })
      return saved
    } catch (error) { wx.showToast({ title: error.message || '保存失败，请重试', icon: 'none' }) }
    finally { this._saving = false }
  }
})
