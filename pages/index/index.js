// index.js - 昇梦体育 智能剪辑工作台（含右上角头像个人中心入口）
const app = getApp()
const CLIP_API = '/api/comptrain/clips/projects'

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
    themeLabel: '跟随系统',
    profile: DEFAULT_PROFILE,
    // 剪辑工作台
    videoName: '',
    clips: [],
    selectedCount: 0,
    isGenerating: false,
    videoGenerated: false,
    generatedDuration: '',
    // 个人中心弹层
    panelVisible: false
  },

  onLoad() {
    this._epoch = 0
    this._visible = true
    this.initTheme()
    this.setNavHeight()
    this.setCurrentDate()
  },

  onShow() {
    this._visible = true
    this.checkClipAccount()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) { this.getTabBar().updateSelected(0) }
    const userTheme = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this.getThemeClass(userTheme), pageBg })
    this.applyNavBarColor()
    this.loadProfile().then(() => {
      if (this._visible && this._pending && !this._busy) this.resumeWork()
    })
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
  async loadProfile() {
    const request = this._profileRequest = (this._profileRequest || 0) + 1
    try {
      const profile = await app.api.get('/api/auth/me')
      if (!this._visible || request !== this._profileRequest) return
      if (typeof app.api.getUser === 'function' && this.currentClipAccount() !== String(profile.id)) {
        this.checkClipAccount()
        return
      }
      if (this._owner && String(this._owner) !== String(profile.id)) this.resetVideo()
      this._owner = String(profile.id)
      this.setData({ profile: this.normalizeProfile({
        name: profile.nickname, avatar: profile.avatarUrl, position: profile.position,
        height: profile.heightCm, weight: profile.weightKg, age: profile.age,
        yearsOfPlay: profile.yearsOfPlay, skillFeature: profile.skillFeature
      }) })
    } catch (e) {
      if (this._visible && request === this._profileRequest) {
        this.resetVideo(); this._owner = null
        this.setData({ profile: DEFAULT_PROFILE }); this.clipError(e)
      }
    }
  },

  normalizeProfile(profile = {}) {
    const source = { ...DEFAULT_PROFILE, ...profile }
    return {
      ...source,
      name: source.name || '篮球爱好者',
      position: source.position || '未设置',
      height: Number(source.height) > 0 ? `${source.height}cm` : '未设置',
      weight: Number(source.weight) > 0 ? `${source.weight}kg` : '未设置'
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
  onHide() { this._visible = false; this._profileRequest = (this._profileRequest || 0) + 1; this.stopWork() },
  onUnload() { this.onHide(); this._pending = null },

  clipError(error) {
    wx.showToast({ title: error && error.message || '请求失败，请稍后重试', icon: 'none' })
  },

  stopWork() {
    this._epoch = (this._epoch || 0) + 1
    if (this._timer) clearTimeout(this._timer)
    this._timer = null
    if (this._wake) { this._wake(); this._wake = null }
    this._busy = false
    this.setData({ isGenerating: false })
    wx.hideLoading()
  },

  currentClipAccount() {
    const user = app.api.getUser()
    return user && (user.id || user.userId) ? String(user.id || user.userId) : null
  },

  checkClipAccount() {
    if (typeof app.api.getUser !== 'function' || !this._owner || String(this._owner) === this.currentClipAccount()) return true
    this.resetVideo()
    this._owner = null
    this.setData({ profile: DEFAULT_PROFILE })
    return false
  },

  active(epoch) {
    return this._visible !== false && epoch === this._epoch && this.checkClipAccount()
  },

  async loginForClip(epoch) {
    if (!this.active(epoch)) return false
    if (typeof app.api.ensureLogin !== 'function') return true
    const user = await app.api.ensureLogin()
    if (!this.active(epoch)) return false
    const id = user && String(user.id || user.userId)
    if (!id || (typeof app.api.getUser === 'function' && this.currentClipAccount() !== id)) return false
    this._owner = id
    return true
  },

  async poll(path, epoch, first) {
    let value = first
    let failures = 0
    for (let attempts = 0; attempts < 900 && this.active(epoch); attempts++) {
      if (!value) {
        try { value = await app.api.get(path); failures = 0 }
        catch (error) {
          if (!this.active(epoch)) return null
          if (++failures >= 3 || [400, 401, 403, 404].includes(error.code)) throw error
        }
      }
      if (!this.active(epoch)) return null
      if (value && value.status === 'SUCCEEDED') return value
      if (value && value.status === 'FAILED') {
        const error = new Error(value.message || '视频处理失败，请重试')
        error.terminal = true
        throw error
      }
      if (value && !['QUEUED', 'RUNNING'].includes(value.status)) throw new Error('任务状态无效')
      value = null
      await new Promise(resolve => {
        this._wake = resolve
        this._timer = setTimeout(() => { this._timer = null; this._wake = null; resolve() }, 2000)
      })
    }
    if (this.active(epoch)) throw new Error('等待超时，请从云端继续查看')
    return null
  },

  async watchProject(project, epoch) {
    this._projectId = project.id
    this._pending = { type: 'analysis', projectId: project.id }
    const complete = await this.poll(`${CLIP_API}/${project.id}`, epoch, project)
    if (!complete || !this.active(epoch)) return
    this._pending = null
    this.setData({ clips: (complete.clips || []).map(c => ({
      id: c.id, time: c.time, description: c.description, type: c.type, selected: false
    })), selectedCount: 0, videoGenerated: false })
    if (!complete.clips || !complete.clips.length) wx.showToast({ title: complete.message || '未识别到篮球精彩片段', icon: 'none' })
    return complete
  },

  async watchRender(projectId, job, epoch) {
    this._pending = { type: 'render', projectId, jobId: job.id }
    let complete
    try { complete = await this.poll(`${CLIP_API}/${projectId}/render/${job.id}`, epoch, job) }
    catch (error) {
      if (this.active(epoch) && error.terminal) { this._pending = null; this._renderRequest = null }
      throw error
    }
    if (!complete || !this.active(epoch)) return
    if (!complete.videoUrl || !(complete.durationMs > 0)) throw new Error('生成文件不可用')
    this._pending = null
    this._render = complete
    this._renderRequest = null
    this.setData({ videoGenerated: true, generatedDuration: `${(complete.durationMs / 1000).toFixed(1)}秒` })
    wx.showToast({ title: '集锦生成成功！', icon: 'success' })
  },

  async runWork(work) {
    if (this._busy) return
    const epoch = this._epoch || 0
    this._epoch = epoch
    this._busy = true
    this.setData({ isGenerating: true })
    wx.showLoading({ title: 'AI 生成中...', mask: true })
    try { if (await this.loginForClip(epoch) && this.active(epoch)) await work(epoch) }
    catch (error) { if (this.active(epoch)) this.clipError(error) }
    finally {
      if (this.active(epoch)) { this._busy = false; this.setData({ isGenerating: false }); wx.hideLoading() }
    }
  },

  resumeWork() {
    const pending = this._pending
    if (!pending) return
    return this.runWork(async epoch => {
      if (pending.type === 'render') {
        const job = await app.api.get(`${CLIP_API}/${pending.projectId}/render/${pending.jobId}`)
        if (this.active(epoch)) await this.watchRender(pending.projectId, job, epoch)
      } else {
        const project = await app.api.get(`${CLIP_API}/${pending.projectId}`)
        if (this.active(epoch)) await this.watchProject(project, epoch)
      }
    })
  },

  uploadLocalVideo() {
    if (this._busy) return
    const epoch = this._epoch || 0
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        if (this._visible === false || epoch !== (this._epoch || 0)) return
        const name = (res && res.tempFilePath) ? res.tempFilePath.split('/').pop() : '比赛视频'
        if (!res.tempFilePath) return
        this.resetVideo()
        this.setData({ videoName: name || '比赛视频' })
        return this.runWork(async current => {
          const project = await app.api.upload(`${CLIP_API}/upload`, res.tempFilePath)
          if (!this.active(current)) return
          await this.watchProject(project, current)
        })
      },
      fail: error => { if (!/cancel/.test(error.errMsg || '') && this._visible !== false) this.clipError(error) }
    })
  },

  async useCloudVideo() {
    if (this._busy) return
    const epoch = this._epoch || 0
    try {
      if (!await this.loginForClip(epoch)) return
      const history = await app.api.get(`${CLIP_API}?limit=50`)
      if (!this.active(epoch)) return
      if (!Array.isArray(history) || !history.length) throw new Error('暂无云端视频')
      const choose = offset => {
        const page = history.slice(offset, offset + 5)
        const more = offset + 5 < history.length
        wx.showActionSheet({
          itemList: page.map(p => `${new Date(p.createdMs).toLocaleString()} · ${p.id}`).concat(more ? ['更多'] : []),
          success: result => {
            if (!this.active(epoch)) return
            if (more && result.tapIndex === page.length) { choose(offset + 5); return }
            const project = page[result.tapIndex]
            if (project) this.openCloudProject(project)
          }
        })
      }
      choose(0)
    } catch (error) { if (this._visible !== false) this.clipError(error) }
  },

  openCloudProject(project) {
    this.resetVideo()
    this.setData({ videoName: project.videoUrl.split('/').pop() })
    return this.runWork(async epoch => {
      const latest = project.status === 'FAILED'
        ? await app.api.post(`${CLIP_API}/${project.id}/analyze`, {})
        : await app.api.get(`${CLIP_API}/${project.id}`)
      if (!this.active(epoch)) return
      const complete = await this.watchProject(latest, epoch)
      if (!complete || !this.active(epoch)) return
      const job = (complete.renders || []).find(r => ['QUEUED', 'RUNNING'].includes(r.status) || (r.status === 'SUCCEEDED' && r.saved))
      if (job) {
        const clips = this.data.clips.map(c => ({ ...c, selected: (job.clipIds || []).includes(c.id) }))
        this.setData({ clips, selectedCount: clips.filter(c => c.selected).length })
        await this.watchRender(project.id, job, epoch)
      }
    })
  },

  toggleClip(e) {
    if (this._busy) return
    const index = e.currentTarget.dataset.index
    const clips = this.data.clips.map(c => ({ ...c }))
    if (!clips[index]) return
    clips[index].selected = !clips[index].selected
    const selectedCount = clips.filter(c => c.selected).length
    this.setData({ clips, selectedCount, videoGenerated: false })
    this._render = null
    this._renderRequest = null
    this._pending = null
  },

  generateWithAI() {
    if (this.data.selectedCount === 0) {
      wx.showToast({ title: '请选择至少一个精彩片段', icon: 'none' })
      return
    }
    if (this._busy || !this._projectId) return
    if (this._pending && this._pending.type === 'render') return this.resumeWork()
    const clipIds = this.data.clips.filter(c => c.selected).map(c => c.id)
    if (!this._renderRequest) this._renderRequest = { clipIds, requestId: `clip-${Date.now()}-${Math.random().toString(36).slice(2)}` }
    return this.runWork(async epoch => {
      const job = await app.api.post(`${CLIP_API}/${this._projectId}/render`, this._renderRequest)
      if (!this.active(epoch)) return
      if (job.status === 'FAILED') this._renderRequest = null
      await this.watchRender(this._projectId, job, epoch)
    })
  },

  async saveVideo() {
    if (!this.data.videoGenerated || !this._render || this._saving) return
    const epoch = this._epoch
    if (!this.active(epoch)) return
    const job = this._render
    this._saving = true
    try {
      if (!await this.loginForClip(epoch)) return
      const saved = await app.api.post(`${CLIP_API}/${this._projectId}/render/${job.id}/save`, {})
      if (!this.active(epoch)) return
      this._render = saved
      const filePath = await app.api.download(saved.videoUrl)
      if (!this.active(epoch)) return
      await new Promise((resolve, reject) => wx.saveVideoToPhotosAlbum({ filePath, success: resolve, fail: reject }))
      if (this.active(epoch)) wx.showToast({ title: '已保存到我的集锦', icon: 'success' })
    } catch (error) { if (this.active(epoch)) this.clipError(error) }
    finally { this._saving = false }
  },

  async shareVideo() {
    if (!this.data.videoGenerated || !this._render) return
    const epoch = this._epoch
    if (!this.active(epoch)) return
    if (!wx.shareVideoMessage) { wx.showToast({ title: '分享功能开发中', icon: 'none' }); return }
    try {
      if (!await this.loginForClip(epoch)) return
      const videoPath = await app.api.download(this._render.videoUrl)
      if (!this.active(epoch)) return
      await new Promise((resolve, reject) => wx.shareVideoMessage({ videoPath, success: resolve, fail: reject }))
    } catch (error) { if (this.active(epoch)) this.clipError(error) }
  },

  resetVideo() {
    this.stopWork()
    this._pending = null
    this._projectId = null
    this._render = null
    this._renderRequest = null
    this.setData({ clips: [], selectedCount: 0, videoGenerated: false, generatedDuration: '', videoName: '' })
  }
})
