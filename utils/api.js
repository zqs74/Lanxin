'use strict'

const BASE_URL = 'https://api.lanxin.cyou'
const AUTH_KEY = 'comptrain_auth_v1'

function failure(code, message) {
  const error = new Error(message || '请求失败，请稍后重试')
  error.code = code
  return error
}

function apiUrl(path) {
  if (typeof path !== 'string' || !/^\/api\/[A-Za-z0-9/_-]+(?:\?[A-Za-z0-9_=&%.-]*)?$/.test(path) || path.includes('..')) {
    throw failure(400, '接口地址无效')
  }
  return BASE_URL + path
}

function mediaUrl(url) {
  if (typeof url !== 'string') throw failure(400, '媒体地址无效')
  // Only the backend's exact signed-video contract; no decoding or arbitrary query.
  const video = /^https:\/\/api\.lanxin\.cyou\/media\/video\/[A-Za-z0-9_-]+\.(mp4|mov|webm|mkv)\?exp=[1-9][0-9]{0,10}&sig=[a-f0-9]{64}$/.test(url)
  const image = /^https:\/\/api\.lanxin\.cyou\/media\/image\/[A-Za-z0-9_-]+\.[A-Za-z0-9]+$/.test(url)
  if (!video && !image) throw failure(400, '媒体地址无效')
  return url
}

function userSummary(user) {
  if (!user || !Number.isSafeInteger(Number(user.id || user.userId)) || Number(user.id || user.userId) <= 0) {
    throw failure(502, '登录响应无效')
  }
  const id = Number(user.id || user.userId)
  return { id, userId: id, nickname: user.nickname || '', avatarUrl: user.avatarUrl || '', role: user.role || 'PLAYER' }
}

function unwrap(response) {
  let body = response.data
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch (_) { throw failure(502, '服务器响应格式错误') }
  }
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw failure(response.statusCode, body && body.message || '请求失败，请稍后重试')
  }
  if (!body || body.code !== 0) throw failure(body && body.code || 502, body && body.message || '服务器响应格式错误')
  return body.data
}

function createApiClient(wxApi) {
  let auth = null
  let validated = false
  let loginPending = null
  let generation = 0
  try {
    const saved = wxApi.getStorageSync(AUTH_KEY)
    if (saved && typeof saved.token === 'string' && saved.token) auth = { token: saved.token, user: userSummary(saved.user) }
  } catch (_) {}

  function persist() {
    try {
      if (auth) wxApi.setStorageSync(AUTH_KEY, auth)
      else wxApi.removeStorageSync(AUTH_KEY)
    } catch (_) {}
  }

  function raw(method, path, data, token) {
    const url = apiUrl(path)
    return new Promise((resolve, reject) => wxApi.request({
      url, method, data,
      timeout: 30000,
      header: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
      success: response => { try { resolve(unwrap(response)) } catch (error) { reject(error) } },
      fail: () => reject(failure(0, '网络连接失败，请稍后重试'))
    }))
  }

  function ensureLogin() {
    if (validated && auth) return Promise.resolve(auth.user)
    if (loginPending) return loginPending
    const currentGeneration = generation
    loginPending = (async () => {
      if (auth) {
        try {
          const user = userSummary(await raw('GET', '/api/auth/me', undefined, auth.token))
          if (currentGeneration !== generation) throw failure(401, '登录状态已改变')
          auth.user = user
          validated = true
          persist()
          return user
        } catch (error) {
          if (error.code !== 401) throw error
          auth = null
          persist()
        }
      }
      const code = await new Promise((resolve, reject) => wxApi.login({
        timeout: 10000,
        success: result => result && result.code ? resolve(result.code) : reject(failure(401, '微信登录失败，请重试')),
        fail: () => reject(failure(401, '微信登录失败，请重试'))
      }))
      const result = await raw('POST', '/api/auth/wx-login', { code })
      if (currentGeneration !== generation) throw failure(401, '登录状态已改变')
      if (!result || typeof result.token !== 'string' || !result.token) throw failure(502, '登录响应无效')
      const user = userSummary(result.user)
      auth = { token: result.token, user }
      validated = true
      persist()
      return user
    })().finally(() => { loginPending = null })
    return loginPending
  }

  async function withAuth(action) {
    await ensureLogin()
    const firstToken = auth.token
    try { return await action(firstToken) } catch (error) {
      if (error.code !== 401) throw error
      if (auth && auth.token === firstToken) { auth = null; validated = false; persist() }
      await ensureLogin()
      return action(auth.token)
    }
  }

  function request(method, path, data) {
    try { apiUrl(path) } catch (error) { return Promise.reject(error) }
    return withAuth(token => raw(method, path, data, token))
  }

  function upload(path, filePath) {
    let url
    try { url = apiUrl(path) } catch (error) { return Promise.reject(error) }
    return withAuth(token => new Promise((resolve, reject) => wxApi.uploadFile({
      url, filePath, name: 'file', timeout: 300000,
      header: { Authorization: 'Bearer ' + token },
      success: response => { try { resolve(unwrap(response)) } catch (error) { reject(error) } },
      fail: () => reject(failure(0, '上传失败，请检查网络后重试'))
    })))
  }

  function download(url) {
    try { mediaUrl(url) } catch (error) { return Promise.reject(error) }
    return new Promise((resolve, reject) => wxApi.downloadFile({
      url, timeout: 300000,
      success: result => result.statusCode === 200 && result.tempFilePath ? resolve(result.tempFilePath) : reject(failure(result.statusCode || 502, [401, 403, 404].includes(result.statusCode) ? '视频链接失效或不可用，请刷新后重试' : '下载失败')),
      fail: () => reject(failure(0, '下载失败，请检查网络后重试'))
    }))
  }

  async function stream(path, body, handlers) {
    const url = apiUrl(path)
    await ensureLogin()
    if (handlers && handlers.expectedUser && auth.user !== handlers.expectedUser) throw failure(401, '登录状态已改变，请重新确认发送')
    const requestToken = auth.token
    const requestGeneration = generation
    const callbacks = handlers || {}
    let ended = false
    let accepted = false
    let pending = []
    let pendingBytes = 0
    function fail(error) {
      if (ended) return
      ended = true
      pending = []
      if (callbacks.onError) callbacks.onError(error)
    }
    function chunk(data) {
      if (!ended && callbacks.onChunkReceived) callbacks.onChunkReceived({ data })
    }
    const task = wxApi.request({
      url, method: 'POST', data: body, enableChunked: true, timeout: 180000,
      header: { 'Content-Type': 'application/json', Accept: 'text/event-stream', Authorization: 'Bearer ' + requestToken },
      success: response => {
        if (ended) return
        if (response.statusCode !== 200) {
          if (response.statusCode === 401 && generation === requestGeneration && auth && auth.token === requestToken) { auth = null; validated = false; persist() }
          fail(failure(response.statusCode || 502, 'AI 请求失败，请重试'))
          return
        }
        if (!accepted) { pending.forEach(chunk); pending = [] }
        ended = true
        if (callbacks.onComplete) callbacks.onComplete(response)
      },
      fail: () => fail(failure(0, 'AI 连接中断，请重试'))
    })
    if (task.onHeadersReceived) task.onHeadersReceived(result => {
      if (ended) return
      if (result.statusCode !== 200) {
        if (result.statusCode === 401 && generation === requestGeneration && auth && auth.token === requestToken) { auth = null; validated = false; persist() }
        fail(failure(result.statusCode || 502, 'AI 请求失败，请重试')); task.abort(); return
      }
      accepted = true
      pending.forEach(chunk)
      pending = []
    })
    if (task.onChunkReceived) task.onChunkReceived(result => {
      if (ended) return
      if (accepted) chunk(result.data)
      else {
        pendingBytes += result.data.byteLength || 0
        if (pendingBytes > 1024 * 1024) { fail(failure(502, 'AI 响应过大')); task.abort(); return }
        pending.push(result.data)
      }
    })
    return { abort() { ended = true; pending = []; task.abort() } }
  }

  return {
    get: (path, data) => request('GET', path, data),
    post: (path, data) => request('POST', path, data),
    put: (path, data) => request('PUT', path, data),
    delete: (path, data) => request('DELETE', path, data),
    request, upload, download, stream, ensureLogin,
    getUser: () => auth && auth.user,
    logout() { generation++; auth = null; validated = false; persist() }
  }
}

module.exports = { createApiClient, BASE_URL, AUTH_KEY, apiUrl, mediaUrl }
