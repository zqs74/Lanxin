'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { createApiClient, AUTH_KEY } = require('../utils/api')

function harness(handler) {
  const storage = new Map(), calls = []
  let logins = 0
  const wx = {
    getStorageSync: key => storage.get(key),
    setStorageSync: (key, value) => storage.set(key, value),
    removeStorageSync: key => storage.delete(key),
    login(options) { logins++; queueMicrotask(() => options.success({ code: 'single-use-code' })) },
    request(options) {
      calls.push(options)
      queueMicrotask(() => {
        if (options.url.endsWith('/wx-login')) options.success({ statusCode: 200, data: { code: 0, data: { token: 'session-' + logins, user: { id: 7, nickname: '测试', openid: 'must-not-persist', phone: 'must-not-persist' } } } })
        else handler(options)
      })
      return { abort() {} }
    }
  }
  return { wx, storage, calls, logins: () => logins }
}
const ok = (options, data) => options.success({ statusCode: 200, data: { code: 0, data } })

test('concurrent page requests share wx login and only store an allowlisted user', async () => {
  const h = harness(o => ok(o, ['actual-server-data']))
  const api = createApiClient(h.wx)
  const results = await Promise.all([api.get('/api/comptrain/events'), api.get('/api/comptrain/products')])
  assert.equal(h.logins(), 1)
  assert.deepEqual(results, [['actual-server-data'], ['actual-server-data']])
  assert.equal(h.storage.get(AUTH_KEY).user.openid, undefined)
  assert.equal(h.storage.get(AUTH_KEY).user.phone, undefined)
  assert.equal(h.storage.get(AUTH_KEY).user.userId, 7)
  for (const call of h.calls.filter(c => !c.url.endsWith('wx-login'))) assert.equal(call.header.Authorization, 'Bearer session-1')
})

test('401 refreshes once and does not loop when the refreshed credential is rejected', async () => {
  const h = harness(o => o.success({ statusCode: 401, data: { code: 401 } }))
  await assert.rejects(createApiClient(h.wx).get('/api/auth/me'), { code: 401 })
  assert.equal(h.logins(), 2)
  assert.equal(h.calls.length, 4)
})

test('403, conflicts and network failures never become local success or trigger another write', async () => {
  for (const code of [403, 409, 500, 0]) {
    const h = harness(o => code === 0 ? o.fail({}) : o.success({ statusCode: code, data: { code, message: 'failed' } }))
    await assert.rejects(createApiClient(h.wx).post('/api/comptrain/orders', { productId: 1, count: 2 }), { code })
    assert.equal(h.logins(), 1)
    assert.equal(h.calls.length, 2)
  }
})

test('absolute, protocol-relative, traversal, encoded and internal URL inputs are refused before authentication', async () => {
  const h = harness(o => ok(o, {})), api = createApiClient(h.wx)
  for (const bad of ['https://untrusted.example/api/a', '//untrusted.example/api/a', '/api/../x', '/api/%2e%2e/x', 'http://127.0.0.1/api/a']) {
    await assert.rejects(api.get(bad), { code: 400 })
  }
  assert.equal(h.calls.length, 0)
  assert.equal(h.logins(), 0)
})

test('uploads parse multipart JSON and downloads only allow project media without bearer leakage', async () => {
  const h = harness(o => ok(o, {}))
  h.wx.uploadFile = o => {
    assert.equal(o.name, 'file')
    assert.match(o.header.Authorization, /^Bearer /)
    o.success({ statusCode: 200, data: JSON.stringify({ code: 0, data: { url: 'https://api.lanxin.cyou/media/video/test.mp4' } }) })
  }
  h.wx.downloadFile = o => { assert.equal(o.header, undefined); o.success({ statusCode: 200, tempFilePath: '/tmp/test.mp4' }) }
  const api = createApiClient(h.wx)
  const uploaded = await api.upload('/api/upload/video', '/tmp/source.mp4')
  assert.equal(await api.download(uploaded.url), '/tmp/test.mp4')
  await assert.rejects(api.download('https://api.lanxin.cyou.evil.example/media/test.mp4'), { code: 400 })
})

test('cached token is verified with auth/me before use and expired cache goes through wx.login', async () => {
  const h = harness(o => o.header.Authorization === 'Bearer expired' ? o.success({ statusCode: 401, data: {} }) : ok(o, []))
  h.storage.set(AUTH_KEY, { token: 'expired', user: { id: 7 } })
  await createApiClient(h.wx).get('/api/comptrain/orders')
  assert.equal(h.calls[0].url, 'https://api.lanxin.cyou/api/auth/me')
  assert.equal(h.logins(), 1)
})

test('stream passes only successful response chunks and exposes cancellation', async () => {
  const h = harness(o => ok(o, {})), api = createApiClient(h.wx)
  await api.ensureLogin()
  let headers, chunks, options, aborted = false
  h.wx.request = o => { options = o; return { onHeadersReceived(cb) { headers = cb }, onChunkReceived(cb) { chunks = cb }, abort() { aborted = true } } }
  const received = [], errors = []
  const handle = await api.stream('/api/comptrain/chat/completions', { stream: true }, { onChunkReceived: c => received.push(c), onError: e => errors.push(e) })
  const bytes = new Uint8Array([1, 2]).buffer
  chunks({ data: bytes })
  assert.equal(received.length, 0)
  headers({ statusCode: 200 })
  assert.equal(received[0].data, bytes)
  assert.equal(options.header.Authorization, 'Bearer session-1')
  handle.abort()
  chunks({ data: bytes })
  assert.equal(received.length, 1)
  assert.equal(aborted, true)
  assert.equal(errors.length, 0)
})

test('a streaming header 401 invalidates cached login and never forwards its body', async () => {
  const h = harness(o => ok(o, {})), api = createApiClient(h.wx)
  await api.ensureLogin()
  const originalRequest = h.wx.request
  let headers, chunks, aborted = false
  h.wx.request = () => ({ onHeadersReceived(cb) { headers = cb }, onChunkReceived(cb) { chunks = cb }, abort() { aborted = true } })
  const received = [], errors = []
  await api.stream('/api/comptrain/chat/completions', {}, { onChunkReceived: c => received.push(c), onError: e => errors.push(e.code) })
  headers({ statusCode: 401 })
  chunks({ data: new Uint8Array([1]).buffer })
  assert.deepEqual(errors, [401])
  assert.equal(received.length, 0)
  assert.equal(aborted, true)
  assert.equal(h.storage.has(AUTH_KEY), false)
  h.wx.request = originalRequest
  await api.ensureLogin()
  assert.equal(h.logins(), 2)
})

test('late stream 401 cannot invalidate a newer login or an already-aborted stream', async () => {
  const h = harness(o => ok(o, {})), api = createApiClient(h.wx)
  await api.ensureLogin()
  const originalRequest = h.wx.request
  let headers
  h.wx.request = () => ({ onHeadersReceived(cb) { headers = cb }, onChunkReceived() {}, abort() {} })
  const task = await api.stream('/api/comptrain/chat/completions', {}, {})
  api.logout()
  h.wx.request = originalRequest
  await api.ensureLogin()
  headers({ statusCode: 401 })
  assert.equal(h.storage.get(AUTH_KEY).token, 'session-2')
  task.abort()
  headers({ statusCode: 401 })
  assert.equal(h.storage.get(AUTH_KEY).token, 'session-2')
})
