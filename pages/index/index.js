// index.js - 昇梦体育 智能剪辑工作台（含右上角头像个人中心入口）
const app = getApp()

const DEFAULT_PROFILE = {
  name: '篮球爱好者',
  position: '未设置',
  height: '未设置',
  weight: '未设置',
  age: '',
  yearsOfPlay: '',
  skillFeature: '',
  avatar: ''
}

Page({
  data: {
    navHeight: 0,
    themeClass: '',
    pageBg: '#f8f7f4',
    currentDate: '',
    greetingText: '你好！',
    themeLabel: '跟随系统',
    profile: DEFAULT_PROFILE,
    // 剪辑工作台
    videoName: '',
    clips: [
      { id: 1, time: '第一节 08:24', description: '两分跳投', type: '投篮', selected: false },
      { id: 2, time: '第一节 06:12', description: '突破上篮', type: '上篮', selected: false },
      { id: 3, time: '第二节 10:05', description: '三分远投', type: '三分', selected: false },
      { id: 4, time: '第三节 05:30', description: '罚球得分', type: '罚球', selected: false },
      { id: 5, time: '第四节 01:20', description: '关键三分', type: '三分', selected: false }
    ],
    selectedCount: 0,
    isGenerating: false,
    videoGenerated: false,
    generatedDuration: '',
    // 个人中心弹层
    panelVisible: false
  },

  onLoad() {
    this.initTheme()
    this.setNavHeight()
    this.setCurrentDate()
    this.syncGreeting(this.data.profile.name)
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) { this.getTabBar().updateSelected(0) }
    const userTheme = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this.getThemeClass(userTheme), pageBg })
    this.applyNavBarColor()
    this.loadProfile()
    this.syncThemeLabel()
  },

  initTheme() {
    const userTheme = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this.getThemeClass(userTheme), pageBg })
  },

  getThemeClass(userTheme) {
    if (userTheme === 'auto') return ''
    return userTheme === 'light' ? 'theme-light' : 'theme-dark'
  },

  setTheme(theme) {
    const userTheme = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this.getThemeClass(userTheme), pageBg })
    this.applyNavBarColor()
    this.syncThemeLabel()
  },

  applyNavBarColor() {
    app.applyNavBarColor(app.getTheme())
  },

  setNavHeight() {
    let windowInfo = {}
    let deviceInfo = {}
    let menuButton = null
    try { windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {} } catch (e) { windowInfo = {} }
    try { deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {} } catch (e) { deviceInfo = {} }
    try { menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null } catch (e) { menuButton = null }

    const statusBarHeight = windowInfo.statusBarHeight || 44
    const navBarHeight = menuButton ? ((menuButton.top - statusBarHeight) * 2 + menuButton.height) : (deviceInfo.platform === 'ios' ? 44 : 48)
    this.setData({ navHeight: (statusBarHeight + navBarHeight) * 2 })
  },

  setCurrentDate() {
    const now = new Date(); const month = now.getMonth() + 1; const day = now.getDate()
    const weekdays = ['周日','周一','周二','周三','周四','周五','周六']
    this.setData({ currentDate: `${month}月${day}日 ${weekdays[now.getDay()]}` })
  },

  // ===== 个人中心（头像弹层） =====
  loadProfile() {
    let name = DEFAULT_PROFILE.name
    try {
      const profile = wx.getStorageSync('profile')
      const normalized = this.normalizeProfile(profile || DEFAULT_PROFILE)
      this.setData({ profile: normalized })
      name = normalized.name
    } catch (e) { console.error('加载个人资料失败', e) }
    this.syncGreeting(name)
  },

  // 按当前时段生成问候语，姓名接在问候语后面：早上好，XXX
  syncGreeting(name) {
    const userName = String(name || '').trim() || DEFAULT_PROFILE.name
    const hour = new Date().getHours()
    let period = '晚上好'
    if (hour >= 5 && hour < 12) period = '早上好'
    else if (hour >= 12 && hour < 18) period = '下午好'
    this.setData({ greetingText: `${period}，${userName}` })
  },

  normalizeProfile(profile = {}) {
    const source = { ...DEFAULT_PROFILE, ...profile }
    return {
      ...source,
      name: source.name || '篮球爱好者',
      position: source.position || '未设置',
      height: source.height ? `${source.height}cm` : '未设置',
      weight: source.weight ? `${source.weight}kg` : '未设置'
    }
  },

  syncThemeLabel() {
    const userTheme = app.getUserTheme()
    const labelMap = { auto: '跟随系统', light: '浅色模式', dark: '深色模式' }
    this.setData({ themeLabel: labelMap[userTheme] || '跟随系统' })
  },

  openPanel() { this.setData({ panelVisible: true }) },
  closePanel() { this.setData({ panelVisible: false }) },
  stopPropagation() {},

  editProfile() {
    this.closePanel()
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' })
  },

  switchTheme() {
    const choices = ['跟随系统', '浅色模式', '深色模式']
    const themeMap = { '跟随系统': 'auto', '浅色模式': 'light', '深色模式': 'dark' }
    wx.showActionSheet({
      itemList: choices,
      success: (res) => {
        const selected = choices[res.tapIndex]
        const userTheme = themeMap[selected]
        app.setUserTheme(userTheme)
        this.syncThemeLabel()
        wx.showToast({ title: `已切换为${selected}`, icon: 'success', duration: 1400 })
      }
    })
  },

  goChat() {
    this.closePanel()
    wx.navigateTo({ url: '/pages/chat/chat' })
  },

  goCreateMatch() {
    this.closePanel()
    wx.navigateTo({ url: '/pages/custom-match-setup/custom-match-setup' })
  },

  // ===== 智能剪辑工作台 =====
  uploadLocalVideo() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        const name = (res && res.tempFilePath) ? res.tempFilePath.split('/').pop() : '比赛视频'
        this.setData({ videoName: name || '比赛视频', videoGenerated: false })
        wx.showToast({ title: '视频已选择', icon: 'success' })
      }
    })
  },

  useCloudVideo() {
    wx.showToast({ title: '云端视频功能开发中', icon: 'none' })
  },

  toggleClip(e) {
    const index = e.currentTarget.dataset.index
    const clips = this.data.clips
    clips[index].selected = !clips[index].selected
    const selectedCount = clips.filter(c => c.selected).length
    this.setData({ clips, selectedCount, videoGenerated: false })
  },

  generateWithAI() {
    if (this.data.selectedCount === 0) {
      wx.showToast({ title: '请选择至少一个精彩片段', icon: 'none' })
      return
    }
    if (this.data.isGenerating) return
    this.setData({ isGenerating: true })
    wx.showLoading({ title: 'AI 生成中...', mask: true })
    setTimeout(() => {
      wx.hideLoading()
      const duration = `${this.data.selectedCount * 8 + 23}秒`
      this.setData({ isGenerating: false, videoGenerated: true, generatedDuration: duration })
      wx.showToast({ title: '集锦生成成功！', icon: 'success' })
    }, 2000)
  },

  saveVideo() {
    wx.showToast({ title: '已保存到我的集锦', icon: 'success' })
  },

  shareVideo() {
    wx.showToast({ title: '分享功能开发中', icon: 'none' })
  },

  resetVideo() {
    const clips = this.data.clips.map(c => ({ ...c, selected: false }))
    this.setData({ clips, selectedCount: 0, videoGenerated: false, videoName: '' })
  }
})
