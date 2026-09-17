const privacy = require('../../utils/privacy')
const { mediaUrl } = require('../../utils/api')
// index.js - 昇梦体育 智能剪辑工作台（含右上角头像个人中心入口）
const app = getApp()
const CLIP_API = '/api/comptrain/clips/projects'
const MAX_VIDEO_BYTES = 1073741824
const LIBRARY_LIMIT = 10
const STATUS_LABELS = { QUEUED: '等待分析', RUNNING: '分析中', FAILED: '分析失败 · 仍可看原片', SUCCEEDED: '分析完成' }

function videoMetadata(project) {
  const date = new Date(Number(project.createdMs))
  const pad = n => String(n).padStart(2, '0')
  const dateLabel = Number(project.createdMs) > 0 && Number.isFinite(date.getTime())
    ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}` : '日期待确认'
  const seconds = Math.floor(Number(project.durationMs) / 1000)
  return { id: project.id, dateLabel,
    durationLabel: Number.isFinite(seconds) && seconds > 0 ? `${Math.floor(seconds / 60)}分${pad(seconds % 60)}秒` : '时长待获取',
    statusLabel: STATUS_LABELS[project.status] || '状态待确认' }
}

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
  ...privacy.pageMethods,
  data: {
    navHeight: 0,
    themeClass: '',
    pageBg: '#f8f7f4',
    currentDate: '',
    themeLabel: '跟随系统',
    profile: DEFAULT_PROFILE,
    // 剪辑工作台
    videoName: '',
    playerSources: [],
    playerLoading: false,
    playerError: '',
    playerCanRetry: false,
    // 同一个播放器既看原片也看已生成的集锦；片段预览只是在原片上定位播放一段。
    playerMode: 'source',
    previewClipId: null,
    previewClipLabel: '',
    sourceStatus: '',
    sourceDuration: '',
    selectedVideoId: null,
    libraryVisible: false,
    libraryItems: [],
    libraryLoading: false,
    libraryError: '',
    libraryMore: false,
    clips: [],
    selectedCount: 0,
    isGenerating: false,
    videoGenerated: false,
    generatedDuration: '',
    // 个人中心弹层
    panelVisible: false
  },

  onLoad() {
    this._clipUnloaded = false
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
    // Native media UI may hide/show this page before or after chooseVideo's
    // callback. Do not let a profile refresh reset its independent ticket.
    if (this._videoPicker) {
      this.syncThemeLabel()
      return this.consumeVideoPicker(this._videoPicker)
    }
    if (app.api.getUser()) {
      this.loadProfile().then(() => {
        if (this._visible && this._pending && !this._busy) this.resumeWork()
      })
    } else {
      this.resetVideo()
      this._owner = null
      this.setData({ profile: DEFAULT_PROFILE })
    }
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
    this.cancelVideoPicker()
    this.closePanel()
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' })
  },

  switchTheme() {
    const choices = ['跟随系统', '浅色模式', '深色模式', '隐私保护指引']
    const themeMap = { '跟随系统': 'auto', '浅色模式': 'light', '深色模式': 'dark' }
    wx.showActionSheet({
      itemList: choices,
      success: (res) => {
        if (res.tapIndex === 3) { this.openPrivacyContract(); return }
        const selected = choices[res.tapIndex]
        const userTheme = themeMap[selected]
        app.setUserTheme(userTheme)
        this.syncThemeLabel()
        wx.showToast({ title: `已切换为${selected}`, icon: 'success', duration: 1400 })
      }
    })
  },

  goChat() {
    this.cancelVideoPicker()
    this.closePanel()
    wx.navigateTo({ url: '/pages/chat/chat' })
  },

  goCreateMatch() {
    this.cancelVideoPicker()
    this.closePanel()
    wx.navigateTo({ url: '/pages/custom-match-setup/custom-match-setup' })
  },

  // ===== 智能剪辑工作台 =====
  onHide() {
    this.cancelPrivacyAuthorization()
    this._visible = false
    this.destroyPlayer()
    this.closeVideoLibrary()
    this._profileRequest = (this._profileRequest || 0) + 1
    this.stopWork()
    // Native pickers leave this Page at the top of the mini-program stack.
    // A known navigation away invalidates the ticket; hide alone is ambiguous.
    if (this._videoPicker && !this.isPickerPageTop()) this.cancelVideoPicker()
  },
  onUnload() { this._clipUnloaded = true; this.cancelVideoPicker(); this.onHide(); this._pending = null },

  clipError(error) {
    if (error && error.errMsg) { privacy.mediaFailure(error); return }
    const raw = error && error.message
    const message = [401, 403, 404].includes(error && error.code) ? '视频链接失效或不可用，请刷新后重试'
      : (typeof raw === 'string' && !/https?:|[?&](?:sig|exp)=/i.test(raw) ? raw : '请求失败，请稍后重试')
    wx.showToast({ title: message, icon: 'none' })
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
    if ((this._preview && this._preview.session !== app.api.getUser()) ||
        (this._librarySession && this._librarySession !== app.api.getUser())) {
      this.resetVideo()
      this._owner = null
      this.setData({ profile: DEFAULT_PROFILE })
      return false
    }
    if (this._videoPicker && !this.validVideoPicker(this._videoPicker)) this.cancelVideoPicker()
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
      if (value && this._pending && this._pending.type === 'analysis') {
        this.setData({ sourceStatus: STATUS_LABELS[value.status] || '状态待确认' })
        this.syncLibraryItem(value)
      }
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
    // Analysis never blocks the native player or submits another analysis job.
    wx.hideLoading()
    let complete
    try { complete = await this.poll(`${CLIP_API}/${project.id}`, epoch, project) }
    catch (error) { if (this.active(epoch) && error.terminal) this._pending = null; throw error }
    if (!complete || !this.active(epoch)) return
    this._pending = null
    this.setData({ clips: (complete.clips || []).map(c => {
      const item = { id: c.id, time: c.time, description: c.description, type: c.type, selected: false }
      // 片段起止时间只用于在原片上预览这一段；服务端没给时保持原有字段形状。
      if (Number.isFinite(c.startMs) && Number.isFinite(c.endMs)) { item.startMs = c.startMs; item.endMs = c.endMs }
      return item
    }), selectedCount: 0, videoGenerated: false })
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
    this._render = this.renderMetadata(complete)
    this._renderRequest = null
    this.setData({ videoGenerated: true, generatedDuration: `${(complete.durationMs / 1000).toFixed(1)}秒` })
    wx.showToast({ title: '集锦生成成功！', icon: 'success' })
  },

  async runWork(work, title = 'AI 生成中...', background = false) {
    if (this._busy) return
    const epoch = this._epoch || 0
    this._epoch = epoch
    this._busy = true
    this.setData({ isGenerating: true })
    if (!background) wx.showLoading({ title, mask: true })
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
    }, '读取处理状态...', true)
  },

  isPickerPageTop() {
    const pages = getCurrentPages()
    return pages.length > 0 && pages[pages.length - 1] === this
  },

  cancelVideoPicker() {
    const ticket = this._videoPicker
    this._videoPicker = null
    if (ticket) { ticket.stage = 'cancelled'; ticket.filePath = null; ticket.error = null; wx.hideLoading() }
  },

  validVideoPicker(ticket) {
    return !!ticket && this._videoPicker === ticket && ticket.page === this && !this._clipUnloaded &&
      ticket.owner === this.currentClipAccount() && ticket.session === app.api.getUser()
  },

  consumeVideoPicker(ticket) {
    if (!this.validVideoPicker(ticket) || !this.isPickerPageTop()) {
      if (this._videoPicker === ticket) this.cancelVideoPicker()
      return
    }
    // A success/failure received while native UI covers the page is parked
    // until onShow. Never start an upload or show an error in the background.
    if (!this._visible) return
    if (ticket.stage === 'selecting') { wx.showLoading({ title: '视频选择处理中...', mask: true }); return }
    if (!['ready', 'failed'].includes(ticket.stage)) return
    const filePath = ticket.filePath
    const selectedSize = ticket.size
    const error = ticket.error
    ticket.stage = 'consumed'
    ticket.filePath = null
    ticket.error = null
    this._videoPicker = null
    if (error) { wx.hideLoading(); this.clipError(error); return }
    this.resetVideo()
    this.setData({ videoName: filePath.split('/').pop() || '比赛视频' })
    return this.runWork(async current => {
      // Login may have awaited native/platform work. Recheck the exact session
      // and Page before handing the local file to the authenticated uploader.
      if (ticket.session !== app.api.getUser() || ticket.owner !== this.currentClipAccount() || !this.isPickerPageTop()) return
      const size = await this.selectedVideoSize(filePath, selectedSize)
      if (!this.active(current) || ticket.session !== app.api.getUser() || !this.isPickerPageTop()) return
      if (size > MAX_VIDEO_BYTES) throw new Error('视频超过1GiB，请截取较短片段后重试')
      if (size === 0) throw new Error('视频文件为空，请重新选择')
      this.startLocalPreview(filePath)
      wx.showLoading({ title: '上传视频中...', mask: true })
      let project
      try { project = await app.api.upload(`${CLIP_API}/upload`, filePath) }
      catch (error) {
        if (this.active(current)) this.setData({ sourceStatus: '上传未完成 · 可查看本地原片' })
        throw error
      }
      if (!this.active(current) || ticket.session !== app.api.getUser()) return
      wx.hideLoading()
      this._projectId = project.id
      this._preview.id = project.id
      this.setData({ selectedVideoId: project.id, sourceStatus: STATUS_LABELS[project.status] || '状态待确认' })
      // Fetch the owned project's signed URL independently of analysis polling.
      this.refreshSource(this._preview)
      await this.watchProject(project, current)
    }, '检查视频大小...')
  },

  selectedVideoSize(filePath, selectedSize) {
    if (Number.isSafeInteger(selectedSize) && selectedSize >= 0) return Promise.resolve(selectedSize)
    // Read only metadata for the file returned by this authorized picker.
    // Official shape: FileSystemManager.stat({ path, recursive: false }) -> res.stats.size (bytes).
    return new Promise((resolve, reject) => {
      const fail = () => reject(new Error('无法确认视频大小，请重新选择后重试'))
      try {
        const manager = typeof wx.getFileSystemManager === 'function' && wx.getFileSystemManager()
        if (!manager || typeof manager.stat !== 'function') { fail(); return }
        manager.stat({
          path: filePath, recursive: false,
          success: result => {
            try {
              const stats = result && result.stats
              if (!stats || typeof stats.isFile !== 'function' || !stats.isFile() || !Number.isSafeInteger(stats.size) || stats.size < 0) { fail(); return }
              resolve(stats.size)
            } catch (_) { fail() }
          },
          fail
        })
      } catch (_) { fail() }
    })
  },

  async uploadLocalVideo() {
    if (this._busy || this._openingVideoPicker || this._videoPicker || this._clipUnloaded) return
    const epoch = this._epoch || 0
    this._openingVideoPicker = true
    try {
      if (!await privacy.authorizeMedia(this) || !this.active(epoch) || this._busy) return
      if (!await this.loginForClip(epoch) || !this.active(epoch) || !this.isPickerPageTop()) return
      const session = app.api.getUser()
      const owner = this.currentClipAccount()
      if (!session || !owner) throw new Error('登录状态未就绪，请重试')
      const ticket = { page: this, owner, session, stage: 'selecting', filePath: null, error: null }
      this._videoPicker = ticket
      // Ignore profile requests started before this picker was opened.
      this._profileRequest = (this._profileRequest || 0) + 1
      const fail = error => {
        if (!this.validVideoPicker(ticket)) {
          if (this._videoPicker === ticket) this.cancelVideoPicker()
          return
        }
        if (ticket.stage !== 'selecting') return
        if (/cancel/i.test(error && error.errMsg || '')) { this.cancelVideoPicker(); return }
        ticket.stage = 'failed'
        ticket.error = error && error.errMsg ? { errMsg: error.errMsg } : new Error('视频选择失败，请重试')
        return this.consumeVideoPicker(ticket)
      }
      try {
        wx.chooseVideo({
          sourceType: ['album', 'camera'],
          maxDuration: 60,
          camera: 'back',
          success: res => {
            if (!this.validVideoPicker(ticket)) {
              if (this._videoPicker === ticket) this.cancelVideoPicker()
              return
            }
            if (ticket.stage !== 'selecting') return
            const filePath = res && res.tempFilePath
            if (typeof filePath !== 'string' || !filePath.trim()) {
              ticket.stage = 'failed'
              ticket.error = new Error('未获取到视频文件，请重新选择')
            } else {
              ticket.stage = 'ready'
              ticket.filePath = filePath
              ticket.size = res.size
            }
            return this.consumeVideoPicker(ticket)
          },
          fail
        })
      } catch (error) { fail(error) }
    } catch (error) { if (this.active(epoch)) this.clipError(error) }
    finally { this._openingVideoPicker = false }
  },

  destroyPlayer() {
    const source = this.data.playerSources[0]
    if (source && typeof wx.createVideoContext === 'function') {
      try { wx.createVideoContext(`source-video-${source.key}`, this).stop() } catch (_) {}
    }
    this._preview = null
    this._clipPreview = null
    this.setData({ playerSources: [], playerLoading: false, playerError: '', playerCanRetry: false,
      playerMode: 'source', previewClipId: null, previewClipLabel: '' })
  },

  previewActive(ticket) {
    return !!ticket && this._preview === ticket && this._visible !== false && !this._clipUnloaded &&
      this.checkClipAccount() && ticket.session === app.api.getUser() && ticket.owner === this.currentClipAccount()
  },

  newPreview(id) {
    this.destroyPlayer()
    const ticket = { id, session: app.api.getUser(), owner: this.currentClipAccount(), retried: false, loading: false }
    this._preview = ticket
    return ticket
  },

  mountSource(ticket, url) {
    if (!this.previewActive(ticket)) return
    this._playerKey = (this._playerKey || 0) + 1
    ticket.key = this._playerKey
    this.setData({ playerSources: [{ key: ticket.key, url }], playerError: '', playerLoading: false, playerCanRetry: false })
  },

  startLocalPreview(filePath) {
    const ticket = this.newPreview(null)
    this.setData({ sourceStatus: '上传中', sourceDuration: '时长待获取' }, () => this.scrollVideoSection('.source-video-card'))
    this.mountSource(ticket, filePath)
  },

  async refreshSource(ticket) {
    if (!this.previewActive(ticket) || !ticket.id || ticket.loading) return null
    ticket.loading = true
    this.setData({ playerLoading: true, playerError: '', playerCanRetry: false })
    try {
      const latest = await app.api.get(`${CLIP_API}/${ticket.id}`)
      if (!this.previewActive(ticket)) return null
      if (!latest || String(latest.id) !== String(ticket.id)) throw new Error('视频不可用')
      const url = mediaUrl(latest.videoUrl)
      if (!url.includes('/media/video/')) throw new Error('视频不可用')
      this.mountSource(ticket, url)
      const metadata = videoMetadata(latest)
      this.setData({ sourceStatus: metadata.statusLabel, sourceDuration: metadata.durationLabel })
      this.syncLibraryItem(latest)
      return latest
    } catch (_) {
      if (this.previewActive(ticket)) this.setData({ playerSources: [], playerError: ticket.retried ? '视频仍不可用，请稍后重新选择' : '视频暂不可用，可刷新播放链接重试', playerCanRetry: !ticket.retried })
      return null
    } finally {
      ticket.loading = false
      if (this.previewActive(ticket)) this.setData({ playerLoading: false })
    }
  },

  onSourceError(event) {
    const ticket = this._preview
    if (!this.previewActive(ticket) || String(event.currentTarget.dataset.key) !== String(ticket.key) || ticket.loading) return
    // Never expose native error text/URLs or automatically loop on errors.
    this.setData({ playerSources: [], playerError: ticket.id ? (ticket.retried ? '视频仍不可用，请稍后重新选择' : '播放失败或链接已过期，请刷新播放链接') : '本地视频无法播放，请重新选择', playerCanRetry: !!ticket.id && !ticket.retried })
  },

  sourceEventTicket(event) {
    const ticket = this._preview
    const key = event && event.currentTarget && event.currentTarget.dataset && event.currentTarget.dataset.key
    return key !== undefined && key !== null && this.previewActive(ticket) && String(key) === String(ticket.key) ? ticket : null
  },

  onSourceMetadata(event) {
    const ticket = this.sourceEventTicket(event)
    const duration = Number(event && event.detail && event.detail.duration)
    if (!ticket || !Number.isFinite(duration) || duration <= 0) return
    ticket.duration = duration
    ticket.metadataLoaded = true
    const seconds = Math.floor(duration)
    this.setData({ sourceDuration: `${Math.floor(seconds / 60)}分${String(seconds % 60).padStart(2, '0')}秒` })
    // A clip preview requested before the player was ready starts once metadata is known.
    this.startClipPreview(ticket)
  },

  onSourceTimeUpdate(event) {
    const ticket = this.sourceEventTicket(event)
    const current = Number(event && event.detail && event.detail.currentTime)
    if (!ticket || !Number.isFinite(current) || current < 0) return
    ticket.currentTime = current
    const preview = this._clipPreview
    if (preview && preview.ticket === ticket && preview.started && current >= preview.endSec) {
      this.endClipPreview()
      if (typeof wx.createVideoContext === 'function') {
        try { wx.createVideoContext(`source-video-${ticket.key}`, this).pause() } catch (_) {}
      }
    }
  },

  onSourcePlay(event) { const ticket = this.sourceEventTicket(event); if (ticket) ticket.playing = true },
  onSourcePause(event) { const ticket = this.sourceEventTicket(event); if (ticket) ticket.playing = false },
  onSourceEnded(event) {
    const ticket = this.sourceEventTicket(event)
    if (!ticket) return
    ticket.playing = false
    ticket.ended = true
    if (this._clipPreview && this._clipPreview.ticket === ticket) this.endClipPreview()
  },

  // ===== 片段预览：在原片播放器里定位播放一段，不下载、不生成新文件 =====
  endClipPreview() {
    this._clipPreview = null
    if (this.data.previewClipId !== null || this.data.previewClipLabel) this.setData({ previewClipId: null, previewClipLabel: '' })
  },

  startClipPreview(ticket) {
    const preview = this._clipPreview
    if (!preview || preview.started || preview.ticket !== ticket || !this.previewActive(ticket) ||
      !ticket.metadataLoaded || typeof wx.createVideoContext !== 'function') return
    preview.started = true
    try {
      const context = wx.createVideoContext(`source-video-${ticket.key}`, this)
      context.seek(preview.startSec)
      context.play()
    } catch (_) { this.endClipPreview() }
  },

  async previewClip(e) {
    const clip = this.data.clips[e.currentTarget.dataset.index]
    if (!clip || !this._projectId || this._visible === false || !this.checkClipAccount()) return
    const startSec = Number(clip.startMs) / 1000
    const endSec = Number(clip.endMs) / 1000
    if (!Number.isFinite(startSec) || !Number.isFinite(endSec) || startSec < 0 || endSec <= startSec) {
      wx.showToast({ title: '该片段暂时无法预览', icon: 'none' })
      return
    }
    let ticket = this._preview
    const reusable = this.previewActive(ticket) && ticket.kind !== 'render' && ticket.id === this._projectId &&
      this.data.playerSources.length > 0
    if (!reusable) ticket = this.newPreview(this._projectId)
    this._clipPreview = { id: clip.id, startSec, endSec, ticket, started: false }
    this.setData({ previewClipId: clip.id, previewClipLabel: `正在预览 ${clip.time} 的片段` },
      () => this.scrollVideoSection('.source-video-card'))
    if (reusable) return this.startClipPreview(ticket)
    const latest = await this.refreshSource(ticket)
    if (!latest && this._clipPreview && this._clipPreview.ticket === ticket) this.endClipPreview()
  },

  // ===== 集锦预览：生成成功后直接在小程序里播放，不必先保存到相册 =====
  async playRender() {
    if (!this.data.videoGenerated || !this._render || !this._projectId || this._openingRender) return
    const epoch = this._epoch
    if (!this.active(epoch)) return
    this._openingRender = true
    try {
      if (!await this.loginForClip(epoch) || !this._render) return
      const ticket = this.newPreview(this._projectId)
      ticket.kind = 'render'
      ticket.renderId = this._render.id
      this.setData({ playerMode: 'render' }, () => this.scrollVideoSection('.source-video-card'))
      await this.refreshRender(ticket)
    } finally { this._openingRender = false }
  },

  async refreshRender(ticket) {
    if (!this.previewActive(ticket) || ticket.kind !== 'render' || ticket.loading) return null
    ticket.loading = true
    this.setData({ playerMode: 'render', playerLoading: true, playerError: '', playerCanRetry: false })
    try {
      const latest = await this.freshRender(this._epoch, ticket.renderId)
      if (!latest || !this.previewActive(ticket)) return null
      const url = mediaUrl(latest.videoUrl)
      if (!url.includes('/media/video/')) throw new Error('视频不可用')
      this.mountSource(ticket, url)
      this.setData({ playerMode: 'render', sourceStatus: '已生成的集锦', sourceDuration: '' })
      return latest
    } catch (_) {
      if (this.previewActive(ticket)) this.setData({ playerSources: [], playerMode: 'render', playerError: ticket.retried ? '集锦仍不可用，请稍后重试' : '集锦暂不可用，可刷新播放链接重试', playerCanRetry: !ticket.retried })
      return null
    } finally {
      ticket.loading = false
      if (this.previewActive(ticket)) this.setData({ playerLoading: false })
    }
  },

  retrySource() {
    const ticket = this._preview
    if (!this.previewActive(ticket) || !ticket.id || ticket.retried || ticket.loading || !this.data.playerCanRetry) return
    ticket.retried = true
    return ticket.kind === 'render' ? this.refreshRender(ticket) : this.refreshSource(ticket)
  },

  reopenSource() {
    if (!this._projectId || !this.checkClipAccount() || this._visible === false) return
    return this.refreshSource(this.newPreview(this._projectId))
  },

  closeVideoLibrary() {
    this._libraryRequest = (this._libraryRequest || 0) + 1
    this._librarySession = null
    this._libraryCursor = null
    this.setData({ libraryVisible: false, libraryItems: [], libraryLoading: false, libraryError: '', libraryMore: false })
  },

  syncLibraryItem(project) {
    if (!project || !this.data.libraryItems.some(item => String(item.id) === String(project.id))) return
    this.setData({ libraryItems: this.data.libraryItems.map(item => String(item.id) === String(project.id) ? videoMetadata(project) : item) })
  },

  scrollVideoSection(selector) {
    if (this._visible === false || this._clipUnloaded || !this.checkClipAccount() || !this.isPickerPageTop() || typeof wx.pageScrollTo !== 'function') return
    if (selector === '.video-library' ? !this.data.libraryVisible : selector !== '.source-video-card' || !this.data.videoName) return
    try { wx.pageScrollTo({ selector, offsetTop: -96, duration: 200, fail() {} }) } catch (_) {}
  },

  useCloudVideo() {
    if (this._busy && (!this._pending || this._pending.type !== 'analysis')) return
    this.cancelVideoPicker()
    if (this.data.libraryVisible) { this.closeVideoLibrary(); return }
    this.setData({ libraryVisible: true }, () => this.scrollVideoSection('.video-library'))
    return this.loadVideoLibrary()
  },

  async loadVideoLibrary() {
    if (!this.data.libraryVisible || this.data.libraryLoading) return
    const request = this._libraryRequest = (this._libraryRequest || 0) + 1
    const epoch = this._epoch || 0
    this.setData({ libraryLoading: true, libraryError: '' })
    let session
    const valid = () => request === this._libraryRequest && this.data.libraryVisible && this.active(epoch) && (!session || session === app.api.getUser())
    try {
      if (!await this.loginForClip(epoch) || !valid()) return
      session = this._librarySession = app.api.getUser()
      const cursor = this._libraryCursor
      const history = await app.api.get(`${CLIP_API}?limit=${LIBRARY_LIMIT}${cursor ? `&beforeId=${cursor}` : ''}`)
      if (!valid()) return
      if (!Array.isArray(history) || history.some(p => !p || !/^[1-9][0-9]*$/.test(String(p.id)))) throw new Error('Invalid history')
      const nextCursor = history.length ? history[history.length - 1].id : null
      if (cursor && history.length && Number(nextCursor) >= Number(cursor)) throw new Error('Invalid cursor')
      const seen = new Set(this.data.libraryItems.map(p => String(p.id)))
      const items = history.filter(p => !seen.has(String(p.id))).map(videoMetadata)
      this._libraryCursor = nextCursor || cursor
      this.setData({ libraryItems: this.data.libraryItems.concat(items), libraryMore: history.length === LIBRARY_LIMIT })
    } catch (_) {
      if (valid()) this.setData({ libraryError: '云端视频加载失败，请重试' })
    } finally {
      if (valid()) this.setData({ libraryLoading: false })
    }
  },

  selectCloudVideo(event) {
    if (!this.checkClipAccount()) return
    const project = this.data.libraryItems.find(p => String(p.id) === String(event.currentTarget.dataset.id))
    if (project) return this.openCloudProject(project)
  },

  async openCloudProject(project) {
    if (this._visible === false || !project || !/^[1-9][0-9]*$/.test(String(project.id))) return
    if (this._busy && (!this._pending || this._pending.type !== 'analysis')) return
    this.resetVideo()
    const epoch = this._epoch
    this.setData({ videoName: `云端视频 ${project.id}`, selectedVideoId: project.id }, () => this.scrollVideoSection('.source-video-card'))
    try {
      if (!await this.loginForClip(epoch)) return
      const ticket = this.newPreview(project.id)
      this._projectId = project.id
      const latest = await this.refreshSource(ticket)
      if (!latest || !this.previewActive(ticket) || latest.status === 'FAILED') return
      return this.runWork(async current => {
        const complete = await this.watchProject(latest, current)
        if (!complete || !this.active(current)) return
        const job = (complete.renders || []).find(r => ['QUEUED', 'RUNNING'].includes(r.status) || (r.status === 'SUCCEEDED' && r.saved))
        if (job) {
          const clips = this.data.clips.map(c => ({ ...c, selected: (job.clipIds || []).includes(c.id) }))
          this.setData({ clips, selectedCount: clips.filter(c => c.selected).length })
          await this.watchRender(project.id, job, current)
        }
      }, '读取处理状态...', true)
    } catch (_) {
      if (this.active(epoch)) this.setData({ playerError: '视频暂不可用，请重新选择' })
    }
  },

  toggleClip(e) {
    if (this._busy) return
    const index = e.currentTarget.dataset.index
    const clips = this.data.clips.map(c => ({ ...c }))
    if (!clips[index]) return
    clips[index].selected = !clips[index].selected
    const selectedCount = clips.filter(c => c.selected).length
    // 选择变了，旧集锦作废；正在播放它的播放器一并关闭，可再点“查看原片”。
    if (this.data.playerMode === 'render') this.destroyPlayer()
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

  renderMetadata(job) {
    // Keep identity/status only; signed media URLs live only for the current action.
    return { id: job.id, projectId: job.projectId, status: job.status, durationMs: job.durationMs,
      clipIds: job.clipIds, saved: job.saved }
  },

  async freshRender(epoch, jobId) {
    const latest = await app.api.get(`${CLIP_API}/${this._projectId}/render/${jobId}`)
    if (!this.active(epoch) || !this._render || this._render.id !== jobId) return null
    if (!latest || latest.id !== jobId || latest.status !== 'SUCCEEDED' || !latest.videoUrl) throw new Error('视频暂不可用，请刷新后重试')
    this._render = this.renderMetadata(latest)
    return latest
  },

  async saveVideo() {
    if (!this.data.videoGenerated || !this._render || this._saving) return
    const epoch = this._epoch
    if (!this.active(epoch)) return
    const job = this._render
    this._saving = true
    try {
      if (!await this.loginForClip(epoch)) return
      if (!await privacy.ensurePrivacy(this) || !this.active(epoch)) return
      const latest = await this.freshRender(epoch, job.id)
      if (!latest) return
      const saved = await app.api.post(`${CLIP_API}/${this._projectId}/render/${job.id}/save`, {})
      if (!this.active(epoch) || !this._render || this._render.id !== job.id) return
      this._render = this.renderMetadata(saved)
      const refreshed = await this.freshRender(epoch, job.id)
      if (!refreshed) return
      const filePath = await app.api.download(refreshed.videoUrl)
      if (!this.active(epoch) || !this._render || this._render.id !== job.id) return
      await new Promise((resolve, reject) => wx.saveVideoToPhotosAlbum({ filePath, success: resolve, fail: reject }))
      if (this.active(epoch)) wx.showToast({ title: '已保存集锦及相册', icon: 'success' })
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
      const latest = await this.freshRender(epoch, this._render.id)
      if (!latest) return
      const videoPath = await app.api.download(latest.videoUrl)
      if (!this.active(epoch) || !this._render || this._render.id !== latest.id) return
      await new Promise((resolve, reject) => wx.shareVideoMessage({ videoPath, success: resolve, fail: reject }))
    } catch (error) { if (this.active(epoch)) this.clipError(error) }
  },

  resetVideo() {
    this.cancelVideoPicker()
    this.destroyPlayer()
    this.closeVideoLibrary()
    this.stopWork()
    this._pending = null
    this._projectId = null
    this._render = null
    this._renderRequest = null
    this.setData({ clips: [], selectedCount: 0, videoGenerated: false, generatedDuration: '', videoName: '', selectedVideoId: null, sourceStatus: '', sourceDuration: '' })
  }
})
