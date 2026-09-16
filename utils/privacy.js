// WeChat authorization is separate from the contextual data-use notice.
const CONFIG_ERROR = '隐私指引未配置或暂不可用，请联系运营方后重试'
const MEDIA_NOTICE = '仅上传已获授权的素材，并取得涉及人员的必要同意；涉及未成年人须取得监护人授权。所选素材将上传服务器用于头像展示或视频剪辑。图片、头像当前可能通过公共链接访问，请勿上传敏感内容。'
const AI_NOTICE = '发送后，本次输入及当前对话历史将经本小程序服务器转发至 ZeoAPI，用于生成 AI 回复。请勿提供敏感信息或未成年人资料。供应商保留期限及是否涉及跨境尚未核实，请谨慎决定；可以取消发送。AI 内容仅供参考，需自行核实。'
const API_ERROR = '当前运行环境的隐私接口未就绪，请重新进入小程序或联系管理员'
// Official onNeedPrivacyAuthorization is replacement-based. There is no
// offNeedPrivacyAuthorization API; never invent it in production or test doubles.
// Keep this owner until the platform request actually terminates, even if its
// page already cancelled. Otherwise a late A event could be dispatched to B.
let activeListener = null
function denyUnexpected(callback) {
  try { if (typeof callback === 'function') callback({ event: 'disagree' }) } catch (_) {}
}
function invoke(name, options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof wx[name] !== 'function') { reject(new Error(API_ERROR)); return }
    wx[name]({ ...options, success: resolve, fail: reject })
  })
}
function report(message) { wx.showToast({ title: message, icon: 'none', duration: 3000 }) }
async function openContract(page) {
  try { await invoke('openPrivacyContract'); return true }
  catch (_) {
    if (page && page._privacyCancel) page._privacyCancel(CONFIG_ERROR)
    report(CONFIG_ERROR)
    return false
  }
}
async function settings() {
  const value = await invoke('getPrivacySetting')
  if (!value || typeof value.needAuthorization !== 'boolean' || !String(value.privacyContractName || '').trim()) throw new Error(CONFIG_ERROR)
  return value
}
async function ensurePrivacy(page) {
  if (page._privacyPending) return false
  const generation = page._privacyGeneration || 0
  page._privacyPending = true
  try {
    for (const api of ['getPrivacySetting', 'requirePrivacyAuthorize', 'openPrivacyContract', 'onNeedPrivacyAuthorization']) {
      if (typeof wx[api] !== 'function') throw new Error(API_ERROR)
    }
    const state = await settings()
    if (generation !== (page._privacyGeneration || 0)) return false
    if (state.needAuthorization) {
      if (activeListener) throw new Error('另一项隐私授权正在处理，请完成或取消后重试')
      await new Promise((resolve, reject) => {
        let platformResolve, finished = false
        let rejectionMessage = '未完成微信隐私授权，操作已取消'
        const deactivate = (terminal) => {
          if (activeListener === listener) {
            // Replace only the listener owned by this operation. Later privacy
            // events must fail closed, not revive a hidden/unloaded page.
            try { wx.onNeedPrivacyAuthorization(denyUnexpected) } catch (_) {}
            if (terminal) activeListener = null
          }
        }
        const cleanup = () => {
          deactivate(false)
          page._privacyCancel = null
          page._privacyAgree = null
          page.setData({ privacyVisible: false })
        }
        const finish = (ok, terminal = false) => {
          if (terminal) deactivate(true)
          if (finished) return
          finished = true
          cleanup()
          if (ok) resolve(); else reject(new Error(rejectionMessage))
        }
        const listener = (callback) => {
          if (finished || activeListener !== listener || generation !== (page._privacyGeneration || 0)) {
            callback({ event: 'disagree' })
            return
          }
          platformResolve = callback
          page.setData({ privacyVisible: true, privacyContractName: state.privacyContractName })
        }
        page._privacyCancel = (reason) => {
          if (reason) rejectionMessage = reason
          try { if (platformResolve) platformResolve({ event: 'disagree' }) } catch (_) {}
          finish(false)
        }
        // Only the official button's bindagreeprivacyauthorization calls this.
        page._privacyAgree = () => {
          try { if (platformResolve) platformResolve({ event: 'agree', buttonId: 'privacy-agree' }) }
          catch (_) { finish(false) }
        }
        try {
          activeListener = listener
          wx.onNeedPrivacyAuthorization(listener)
          wx.requirePrivacyAuthorize({
            success: () => finish(true, true), fail: () => finish(false, true),
            complete: () => { if (!finished) finish(false, true); else deactivate(true) }
          })
        } catch (_) { finish(false, true) }
      })
      if ((await settings()).needAuthorization) throw new Error('微信隐私授权未生效，请重试')
    }
    return generation === (page._privacyGeneration || 0)
  } catch (error) {
    report(error instanceof Error ? error.message : CONFIG_ERROR)
    return false
  } finally { page._privacyPending = false }
}
async function confirmNotice(content, title) {
  try { return (await invoke('showModal', { title, content, confirmText: '同意继续', cancelText: '取消' })).confirm === true }
  catch (_) { return false }
}
async function authorizeMedia(page) {
  if (page._mediaNoticePending) return false
  page._mediaNoticePending = true
  const generation = page._privacyGeneration || 0
  try {
    if (!await ensurePrivacy(page)) return false
    return await confirmNotice(MEDIA_NOTICE, '素材上传告知') && generation === (page._privacyGeneration || 0)
  } finally { page._mediaNoticePending = false }
}
function mediaFailure(error) {
  const message = error && error.errMsg || ''
  if (/cancel/i.test(message)) return
  report(/privacy|scope.*declar|隐私/i.test(message) ? CONFIG_ERROR : '媒体操作失败，请检查微信相册或相机权限后重试')
}
const pageMethods = {
  openPrivacyContract() { return openContract(this) },
  agreePrivacyAuthorization() { if (this._privacyAgree) this._privacyAgree() },
  cancelPrivacyAuthorization() { this._privacyGeneration = (this._privacyGeneration || 0) + 1; if (this._privacyCancel) this._privacyCancel() }
}
module.exports = { mediaFailure, ensurePrivacy, authorizeMedia, confirmNotice, openContract, pageMethods, AI_NOTICE, MEDIA_NOTICE }
