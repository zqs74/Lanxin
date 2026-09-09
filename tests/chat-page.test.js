const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const source = fs.readFileSync(path.join(__dirname, '../pages/chat/chat.js'), 'utf8')

function setup(streamImpl, options = {}) {
  const calls = [], toasts = [], logs = []
  const timers = []
  let definition, handlers, aborted = 0
  const task = { abort() { aborted++ } }
  const app = { api: { stream(route, body, callbacks) {
    calls.push({ route, body })
    handlers = callbacks
    return streamImpl ? streamImpl(callbacks, task) : Promise.resolve(task)
  } } }
  vm.runInNewContext(source, {
    getApp: () => app,
    Page: value => { definition = value },
    wx: { showToast: value => toasts.push(value), request() { throw new Error('Direct connection forbidden') } },
    console: { error: (...args) => logs.push(args), log: (...args) => logs.push(args) },
    setTimeout: callback => { timers.push(callback); return timers.length }, Uint8Array,
    TextDecoder: options.noTextDecoder ? undefined : TextDecoder
  })
  const page = { ...definition, data: JSON.parse(JSON.stringify(definition.data)),
    setData(values) { Object.assign(this.data, values) } }
  page.data.messages = [{ role: 'user', content: 'test question' }]
  page.data.isLoading = true
  function bytes(value) {
    const buffer = Buffer.from(value)
    handlers.onChunkReceived({ data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) })
  }
  return { page, calls, toasts, logs, bytes, timers, get handlers() { return handlers }, get aborted() { return aborted } }
}

const delta = content => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`

test('chat source has no embedded credentials, provider connection, model or token storage', () => {
  // Boolean assertions deliberately avoid printing matched source or secrets on failure.
  for (const pattern of [/sk-[\w-]{12,}/i, /apiKey\s*:/i, /Bearer\s/i, /https?:\/\//i,
    /wx\.request\s*\(/, /\bmodel\s*:/, /(?:get|set)Storage/, /auth\.token|accessToken/i]) {
    assert.equal(pattern.test(source), false, 'forbidden chat transport configuration')
  }
})

test('sends prompt and clean conversation using only messages + stream to authenticated API', async () => {
  const h = setup()
  h.page.data.messages.unshift({ role: 'assistant', content: 'previous error', isError: true })
  const pending = h.page.callDeepSeekAPI('test question')
  assert.equal(h.calls[0].route, '/api/comptrain/chat/completions')
  assert.deepEqual(Object.keys(h.calls[0].body).sort(), ['messages', 'stream'])
  assert.equal(h.calls[0].body.stream, true)
  assert.equal(h.calls[0].body.messages[0].role, 'system')
  assert.equal(h.calls[0].body.messages[0].content.includes('2026 赛季安踏小篮球联赛'), true)
  assert.equal(h.calls[0].body.messages.length, 2)
  h.bytes(delta('**answer**'))
  assert.equal(h.page.data.messages.at(-1).isStreaming, true)
  assert.equal(h.page.data.messages.at(-1).renderedBlocks[0].spans[0].type, 'strong')
  h.bytes('data: [DONE]\n\n')
  h.handlers.onComplete({ statusCode: 200 })
  await pending
  assert.equal(h.page.data.isLoading, false)
  assert.equal(h.page.data.messages.at(-1).isStreaming, false)
  assert.equal(h.toasts.length, 0)
})

test('existing SSE buffering handles events split across chunks and multiple events', async () => {
  const h = setup()
  const pending = h.page.callDeepSeekAPI('test question')
  const wire = delta('hello ') + delta('world') + 'data: [DONE]\n\n'
  for (let index = 0; index < wire.length; index += 7) h.bytes(wire.slice(index, index + 7))
  await pending
  assert.equal(h.page.data.messages.at(-1).content, 'hello world')
})

test('transport preserves Chinese and supplementary Unicode split at every byte', async () => {
  const h = setup()
  const pending = h.page.callDeepSeekAPI('test question')
  const wire = Buffer.from(delta('篮球🏀') + 'data: [DONE]\n\n')
  for (const byte of wire) h.handlers.onChunkReceived({ data: Uint8Array.of(byte).buffer })
  await pending
  assert.equal(h.page.data.messages.at(-1).content, '篮球🏀')
  assert.equal(h.toasts.length, 0)
})

test('HTTP completion without provider DONE marks partial answer failed and clears streaming', async () => {
  const h = setup()
  const pending = h.page.callDeepSeekAPI('test question')
  await Promise.resolve()
  h.bytes(delta('partial'))
  h.handlers.onComplete({ statusCode: 200 })
  await pending
  assert.equal(h.page.data.messages[1].content, 'partial')
  assert.equal(h.page.data.messages[1].isStreaming, false)
  assert.equal(h.page.data.messages[1].isError, true)
  assert.equal(h.page.data.messages.at(-1).isError, true)
  assert.equal(h.page.data.isLoading, false)
  assert.equal(h.toasts.length, 1)
  assert.equal(h.aborted, 1)
})

test('provider SSE error is sanitized, terminal and not overwritten by later DONE/chunks', async () => {
  const h = setup()
  const pending = h.page.callDeepSeekAPI('test question')
  h.bytes('event: error\ndata: {"error":{"message":"PRIVATE_UPSTREAM_BODY"}}\n\ndata: [DONE]\n\n')
  h.bytes(delta('ignored'))
  h.handlers.onComplete({ statusCode: 200 })
  await pending
  assert.equal(h.page.data.messages.at(-1).isError, true)
  assert.equal(h.toasts.length, 1)
  assert.equal(JSON.stringify([h.logs, h.toasts, h.page.data]).includes('PRIVATE_UPSTREAM_BODY'), false)
})

for (const scenario of ['http', 'network', 'malformed', 'empty', 'initialization', 'login']) {
  test(`${scenario} failure settles once without exposing raw error details`, async () => {
    const h = setup(scenario === 'initialization' ? () => { throw new Error('PRIVATE_BODY') }
      : scenario === 'login' ? () => Promise.reject(new Error('PRIVATE_BODY')) : undefined)
    const pending = h.page.callDeepSeekAPI('test question')
    if (scenario === 'http') h.handlers.onComplete({ statusCode: 503, data: { message: 'PRIVATE_BODY' } })
    if (scenario === 'network') h.handlers.onError({ errMsg: 'PRIVATE_BODY' })
    if (scenario === 'malformed') h.bytes('data: INVALID_PRIVATE_BODY\n\n')
    if (scenario === 'empty') h.handlers.onComplete({ statusCode: 200 })
    await pending
    h.handlers.onError({ errMsg: 'PRIVATE_BODY' })
    assert.equal(h.toasts.length, 1)
    assert.equal(h.page.data.isLoading, false)
    assert.equal(h.page.data.messages.at(-1).isError, true)
    assert.equal(JSON.stringify([h.logs, h.toasts, h.page.data]).includes('PRIVATE_BODY'), false)
  })
}

test('unload during login aborts the eventual task and ignores callbacks without UI writes', async () => {
  let resolveTask
  const h = setup(() => new Promise(resolve => { resolveTask = resolve }))
  const pending = h.page.callDeepSeekAPI('test question')
  h.page.onUnload()
  h.page.setData = () => { throw new Error('UI update after unload') }
  resolveTask({ abort() { h.handlers.onError({}) } })
  await pending
  await Promise.resolve()
  h.bytes(delta('late'))
  h.handlers.onComplete({ statusCode: 200 })
  assert.equal(h.toasts.length, 0)
})

test('unload aborts active request; duplicate send is suppressed', async () => {
  const h = setup()
  const pending = h.page.callDeepSeekAPI('test question')
  await Promise.resolve()
  h.page.data.userInput = 'duplicate'
  h.page.sendMessage()
  assert.equal(h.calls.length, 1)
  h.page.onUnload()
  await pending
  assert.equal(h.aborted, 1)
  assert.equal(h.toasts.length, 0)
})

for (const prefix of ['', ': heartbeat\n\n', 'data: {"choices":[{"delta":{"role":"assistant"}}]}\n\n', delta(' \n\t')]) {
  test(`DONE without an answer fails (${prefix.length} prefix bytes)`, async () => {
    const h = setup()
    const pending = h.page.callDeepSeekAPI('test question')
    h.bytes(prefix + 'data: [DONE]\n\n')
    await pending
    assert.equal(h.page.data.messages.at(-1).isError, true)
    assert.equal(h.page.data.isLoading, false)
    assert.equal(h.toasts.length, 1)
  })
}

test('abort exceptions cannot prevent failure settlement or expose transport details', async () => {
  const h = setup(() => Promise.resolve({ abort() { throw new Error('PRIVATE_BODY') } }))
  const pending = h.page.callDeepSeekAPI('test question')
  await Promise.resolve()
  h.handlers.onError({ code: 401 })
  await pending
  assert.equal(h.page.data.isLoading, false)
  assert.equal(h.page.data.messages.at(-1).isError, true)
  assert.equal(JSON.stringify(h.logs).includes('PRIVATE_BODY'), false)
})

test('unload ignores queued scroll callbacks and synchronous abort callbacks', async () => {
  let aborts = 0
  const h = setup(callbacks => Promise.resolve({ abort() { aborts++; callbacks.onError({}) } }))
  const pending = h.page.callDeepSeekAPI('test question')
  await Promise.resolve()
  h.bytes(delta('partial'))
  h.page.onUnload()
  h.page.onUnload()
  h.page.setData = () => { throw new Error('UI update after unload') }
  for (const callback of h.timers) callback()
  await pending
  assert.equal(aborts, 1)
  assert.equal(h.toasts.length, 0)
})

test('fallback decoder preserves multi-part UTF8 including empty chunks', async () => {
  const h = setup(undefined, { noTextDecoder: true })
  const pending = h.page.callDeepSeekAPI('test question')
  const wire = Buffer.from(delta('é篮球🏀中文') + 'data: [DONE]\n\n')
  for (let index = 0; index < wire.length; index += 2) {
    const part = wire.subarray(index, index + 2)
    h.handlers.onChunkReceived({ data: part.buffer.slice(part.byteOffset, part.byteOffset + part.byteLength) })
    h.handlers.onChunkReceived({ data: new ArrayBuffer(0) })
  }
  await pending
  assert.equal(h.page.data.messages.at(-1).content, 'é篮球🏀中文')
})

test('thousands of events retain content order and stop processing after DONE', async () => {
  const h = setup()
  const pending = h.page.callDeepSeekAPI('test question')
  h.bytes(Array.from({ length: 2000 }, () => delta('x')).join('') + 'data: [DONE]\n\n' + delta('ignored').repeat(2000))
  await pending
  assert.equal(h.page.data.messages.at(-1).content, 'x'.repeat(2000))
  assert.equal(h.page.data.messages.at(-1).isStreaming, false)
  assert.equal(h.toasts.length, 0)
})

for (const statusCode of [200, 401]) {
  test(`page interoperates with real shared stream callbacks (${statusCode})`, async () => {
    const { createApiClient } = require('../utils/api')
    let headers, chunk, complete, issued, aborts = 0
    const ready = new Promise(resolve => { issued = resolve })
    const client = createApiClient({
      getStorageSync: () => ({ token: 'local-test-fixture', user: { id: 1 } }),
      setStorageSync() {}, removeStorageSync() {},
      request(options) {
        if (options.url.endsWith('/auth/me')) {
          options.success({ statusCode: 200, data: { code: 0, data: { id: 1 } } })
          return {}
        }
        complete = options.success
        issued()
        return {
          onHeadersReceived(callback) { headers = callback },
          onChunkReceived(callback) { chunk = callback },
          abort() { aborts++; options.fail({}) }
        }
      }
    })
    const h = setup(callbacks => client.stream('/api/comptrain/chat/completions', { messages: [], stream: true }, callbacks))
    const pending = h.page.callDeepSeekAPI('test question')
    await ready
    headers({ statusCode })
    if (statusCode === 200) {
      const wire = Buffer.from(delta('篮球') + 'data: [DONE]\n\n')
      for (const byte of wire) chunk({ data: Uint8Array.of(byte).buffer })
    }
    complete({ statusCode })
    await pending
    assert.equal(h.page.data.isLoading, false)
    assert.equal(h.page.data.messages.at(-1).isError === true, statusCode !== 200)
    assert.ok(aborts >= 1)
  })
}
