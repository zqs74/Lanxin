const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const plain = value => JSON.parse(JSON.stringify(value))
const tap = id => ({ currentTarget: { dataset: { id } } })
const input = (field, value) => ({ currentTarget: { dataset: { field } }, detail: { value } })
const event = { id: 17, name: '服务器赛事', group: 'U12', date: '2099-09-10', time: '09:00', venue: '服务器球馆', fee: '300 元/队', slots: 2, status: '即将截止' }
const news = { id: 31, title: '服务器资讯', date: '2026-09-09', tag: '公告', content: '完整正文' }
const product = { id: 23, name: '服务器篮球', category: 'ball', price: 89, emoji: '🏀', tag: '热卖', desc: '服务器商品描述' }
const registration = { id: 71, eventId: event.id, eventName: event.name, eventDate: event.date, name: '张三', phone: '13800138000', group: 'U12', team: '测试队', remark: '10号', createdAt: '2026-09-09T01:00:00Z' }
const order = { id: 'server-order', productId: product.id, productName: product.name, emoji: product.emoji, price: 80, count: 2, total: 150, status: 'UNPAID', createdAt: '2026-09-09T01:00:00Z' }
const form = { name: ' 张三 ', phone: ' 13800138000 ', group: 'U12', team: ' 测试队 ', remark: ' 10号 ' }

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

function harness(name, options = {}) {
  let page
  const calls = [], toasts = [], modals = [], writes = [], removals = []
  const storage = new Map(Object.entries(options.storage || {}))
  const client = {}
  for (const method of ['get', 'post', 'delete']) {
    client[method] = (url, body) => {
      calls.push({ method, url, body: body === undefined ? undefined : plain(body) })
      return options[method] ? options[method](url, body) : Promise.resolve([])
    }
  }
  client.ensureLogin = () => { throw new Error('页面应交由客户端处理登录') }
  const app = {
    api: client,
    globalData: { api: client, authReady: new Promise(() => {}) },
    getUserTheme: () => 'auto', getTheme: () => 'light',
    getThemeColors: () => ({ pageBg: '#f8f7f4' }), applyNavBarColor() {}
  }
  if (options.globalOnly) delete app.api
  const wx = {
    getStorageSync() { throw new Error('页面不得从旧缓存恢复业务记录') },
    setStorageSync(key, value) {
      if (options.storageFails) throw new Error('storage full')
      storage.set(key, plain(value)); writes.push(key)
    },
    removeStorageSync(key) { storage.delete(key); removals.push(key) },
    showToast(value) { toasts.push(plain(value)) },
    showModal(value) { modals.push(value) }
  }
  const filename = path.join(__dirname, '..', 'pages', name, `${name}.js`)
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
    getApp: () => app, wx, console: { error() {} },
    Page(value) { page = value }
  }, { filename })
  page.data = plain(page.data)
  page.setData = patch => {
    for (const [key, value] of Object.entries(patch)) {
      const parts = key.split('.')
      let target = page.data
      for (const part of parts.slice(0, -1)) target = target[part]
      target[parts.at(-1)] = value
    }
  }
  return { page, calls, toasts, modals, storage, writes, removals }
}

function prepareRegistration(h, selected = event) {
  h.page.setData({ eventList: [selected] })
  h.page.openRegister(tap(selected.id))
  for (const [field, value] of Object.entries(form)) h.page.onFormInput(input(field, value))
}

function prepareOrder(h, selected = product) {
  h.page.setData({ products: [selected] })
  h.page.openDetail(tap(selected.id))
  h.page.increase()
}

const posts = h => h.calls.filter(call => call.method === 'post')
const successes = h => h.toasts.filter(toast => toast.icon === 'success')

test('赛事、资讯、本人报名读取服务器，保留全部字段并支持原筛选和详情', async () => {
  const h = harness('match', { globalOnly: true, get: async url => ({
    '/api/comptrain/news': [news], '/api/comptrain/events': [event],
    '/api/comptrain/registrations': [registration]
  })[url] })
  await Promise.all([h.page.onLoad(), h.page.onShow()])
  assert.deepEqual(plain(h.page.data.newsList), [news])
  assert.deepEqual(plain(h.page.data.eventList), [event])
  assert.deepEqual(plain(h.page.data.filteredEvents), [event])
  assert.equal(h.page.data.registeredMap[event.id], true)
  assert.deepEqual(h.storage.get('event_registrations'), [registration])
  h.page.openNews(tap(news.id)); h.page.openEvent(tap(event.id))
  assert.deepEqual(plain(h.page.data.newsDetail), news)
  assert.deepEqual(plain(h.page.data.eventDetail), event)
  h.page.onSearchInput({ detail: { value: '不存在' } })
  assert.equal(h.page.data.filteredEvents.length, 0)
  h.page.onSearchInput({ detail: { value: '服务器球馆' } })
  assert.equal(h.page.data.filteredEvents.length, 1)
  h.page.onDateChange({ detail: { value: '2100-01-01' } })
  assert.equal(h.page.data.filteredEvents.length, 0)
})

test('商城请求 all 分类，保留商品、服务端订单金额和状态，原详情分类可用', async () => {
  const h = harness('profile', { get: async url => url.endsWith('/products') ? [product] : [order] })
  await Promise.all([h.page.onLoad(), h.page.onShow()])
  assert.deepEqual(h.calls.find(call => call.url.endsWith('/products')).body, { category: 'all' })
  assert.deepEqual(plain(h.page.data.products), [product])
  assert.deepEqual(plain(h.page.data.orders), [order])
  assert.deepEqual(h.storage.get('mall_orders'), [order])
  h.page.openDetail(tap(product.id))
  assert.deepEqual(plain(h.page.data.currentProduct), product)
  h.page.switchCategory({ currentTarget: { dataset: { key: 'guard' } } })
  assert.equal(h.page.data.filteredProducts.length, 0)
  h.page.switchCategory({ currentTarget: { dataset: { key: 'ball' } } })
  assert.deepEqual(plain(h.page.data.filteredProducts), [product])
})

for (const name of ['match', 'profile']) {
  test(`${name}: 服务器空数组覆盖旧缓存，不显示演示数据`, async () => {
    const h = harness(name, { storage: { mall_orders: [order], event_registrations: [registration] } })
    await Promise.all([h.page.onLoad(), h.page.onShow()])
    for (const field of name === 'match' ? ['newsList', 'eventList', 'filteredEvents'] : ['products', 'filteredProducts', 'orders']) {
      assert.deepEqual(plain(h.page.data[field]), [])
    }
    if (name === 'match') assert.deepEqual(plain(h.page.data.registeredMap), {})
    assert.equal(successes(h).length, 0)
  })

  test(`${name}: 无 Token / GET 失败使用 toast，不恢复本地数据`, async () => {
    const h = harness(name, { get: async () => { throw { code: 'NO_TOKEN', message: '请先登录' } } })
    await Promise.all([h.page.onLoad(), h.page.onShow()])
    assert.ok(h.toasts.length >= 2)
    assert.ok(h.toasts.every(t => t.title === '请先登录' && t.icon === 'none'))
    assert.equal(h.writes.length, 0)
    assert.equal(successes(h).length, 0)
  })
}

test('报名等待服务器成功、防双提交、提交完整字段并缓存原记录，刷新剩余名额', async () => {
  const pending = deferred()
  const h = harness('match', { post: () => pending.promise, get: async () => [{ ...event, slots: 1 }] })
  prepareRegistration(h)
  const first = h.page.submitRegister()
  await h.page.submitRegister()
  h.page.closeRegister(); h.page.openRegister(tap(event.id))
  h.page.onFormInput(input('name', '请求中修改'))
  assert.equal(posts(h).length, 1)
  assert.equal(h.page.data.registerForm.name, form.name)
  assert.equal(h.page.data.registerVisible, true)
  assert.equal(successes(h).length, 0)
  assert.equal(h.writes.length, 0)
  const { requestId, ...body } = posts(h)[0].body
  assert.ok(requestId.startsWith('registration_'))
  assert.equal(posts(h)[0].url, `/api/comptrain/events/${event.id}/registrations`)
  assert.deepEqual(body, { name: '张三', phone: '13800138000', group: 'U12', team: '测试队', remark: '10号' })
  pending.resolve(registration)
  await first
  // 报名成功后的赛事刷新独立完成，等待其异步响应落到页面。
  await new Promise(resolve => setImmediate(resolve))
  assert.deepEqual(h.storage.get('event_registrations'), [registration])
  assert.equal(h.page.data.registeredMap[event.id], true)
  assert.equal(h.page.data.registerVisible, false)
  assert.equal(h.page.data.eventDetail, null)
  assert.equal(h.page.data.eventList[0].slots, 1)
  assert.deepEqual(successes(h), [{ title: '报名成功！', icon: 'success' }])
  await h.page.submitRegister()
  assert.equal(posts(h).length, 1)
})

test('报名失败保留表单且不成功，重试复用 key，改字段、重开、不同赛事生成新 key', async () => {
  let failure = true
  const h = harness('match', { post: async () => {
    if (failure) throw { code: 'NETWORK_ERROR', message: '网络失败' }
    return registration
  } })
  prepareRegistration(h)
  await h.page.submitRegister(); await h.page.submitRegister()
  assert.equal(posts(h)[0].body.requestId, posts(h)[1].body.requestId)
  assert.deepEqual(plain(h.page.data.registerForm), form)
  assert.equal(h.page.data.registerVisible, true)
  assert.deepEqual(plain(h.page.data.registeredMap), {})
  assert.equal(h.writes.length, 0)
  assert.equal(successes(h).length, 0)
  assert.equal(h.toasts[0].title, '网络失败')
  h.page.onFormInput(input('remark', '新备注')); await h.page.submitRegister()
  assert.notEqual(posts(h)[2].body.requestId, posts(h)[1].body.requestId)
  h.page.closeRegister(); prepareRegistration(h); await h.page.submitRegister()
  assert.notEqual(posts(h)[3].body.requestId, posts(h)[0].body.requestId)
  prepareRegistration(h, { ...event, id: 18 }); await h.page.submitRegister()
  assert.notEqual(posts(h)[4].body.requestId, posts(h)[3].body.requestId)
  prepareRegistration(h); failure = false; await h.page.submitRegister()
  assert.equal(successes(h).length, 1)
})

test('报名验证和名额不足不发请求，已报名不能重复打开', async () => {
  const h = harness('match')
  prepareRegistration(h)
  for (const patch of [{ name: '' }, { phone: '123' }, { group: '' }]) {
    h.page.setData({ registerForm: { ...form, ...patch } })
    await h.page.submitRegister()
  }
  h.page.closeRegister()
  h.page.setData({ eventList: [{ ...event, slots: 0 }] })
  h.page.openRegister(tap(event.id))
  assert.equal(h.page.data.registerVisible, false)
  h.page.setData({ eventList: [event], registeredMap: { [event.id]: true } })
  h.page.openRegister(tap(event.id))
  assert.equal(h.page.data.registerVisible, false)
  assert.equal(posts(h).length, 0)
})

test('已截止、已结束和 CLOSED 赛事即使有名额也不能打开报名或发起提交', async () => {
  for (const status of ['已截止', '已结束', 'CLOSED']) {
    const h = harness('match')
    h.page.setData({ eventList: [{ ...event, status, slots: 5 }] })
    h.page.openEvent(tap(event.id))
    h.page.openRegister(tap(event.id))
    assert.equal(h.page.data.registerVisible, false)
    assert.equal(h.page.data.eventDetail.status, status)
    assert.equal(h.toasts.length, 1)
    assert.equal(h.toasts[0].icon, 'none')
    assert.equal(h.toasts[0].title, status === '已结束' ? '已结束' : '已截止')
    await h.page.submitRegister()
    assert.equal(posts(h).length, 0)
    assert.equal(h.writes.length, 0)
  }
})

test('下单防双提交，不发送本地价格，完整保留服务器金额和 UNPAID 状态', async () => {
  const pending = deferred()
  const h = harness('profile', { post: () => pending.promise })
  prepareOrder(h)
  const first = h.page.submitOrder()
  await h.page.submitOrder()
  h.page.increase(); h.page.decrease(); h.page.closeDetail(); h.page.openDetail(tap(product.id)); h.page.clearOrders()
  assert.equal(h.page.data.buyCount, 2)
  assert.equal(h.page.data.detailVisible, true)
  assert.equal(h.modals.length, 0)
  assert.equal(posts(h).length, 1)
  assert.equal(successes(h).length, 0)
  assert.equal(h.writes.length, 0)
  const { requestId, ...body } = posts(h)[0].body
  assert.ok(requestId.startsWith('order_'))
  assert.deepEqual(body, { productId: product.id, count: 2 })
  pending.resolve(order); await first
  assert.deepEqual(plain(h.page.data.orders), [order])
  assert.deepEqual(h.storage.get('mall_orders'), [order])
  assert.equal(h.page.data.detailVisible, false)
  assert.deepEqual(successes(h), [{ title: '下单成功（演示）', icon: 'success' }])
  await h.page.submitOrder()
  assert.equal(posts(h).length, 1)
  prepareOrder(h); await h.page.submitOrder()
  assert.notEqual(posts(h)[1].body.requestId, requestId)
  assert.equal(h.page.data.orders.length, 1)
})

test('下单失败不写缓存且保留选择，原表单重试稳定，新数量、新表单、新商品使用新 key', async () => {
  const h = harness('profile', { post: async () => { throw { code: 'NO_TOKEN', message: '请先登录' } } })
  prepareOrder(h)
  await h.page.submitOrder(); await h.page.submitOrder()
  assert.equal(posts(h)[0].body.requestId, posts(h)[1].body.requestId)
  assert.equal(h.page.data.detailVisible, true)
  assert.equal(h.page.data.buyCount, 2)
  assert.equal(h.page.data.orders.length, 0)
  assert.equal(h.writes.length, 0)
  assert.equal(successes(h).length, 0)
  assert.ok(h.toasts.every(t => t.title === '请先登录' && t.icon === 'none'))
  h.page.increase(); await h.page.submitOrder()
  assert.notEqual(posts(h)[2].body.requestId, posts(h)[1].body.requestId)
  h.page.closeDetail(); prepareOrder(h); await h.page.submitOrder()
  assert.notEqual(posts(h)[3].body.requestId, posts(h)[0].body.requestId)
  prepareOrder(h, { ...product, id: 24 }); await h.page.submitOrder()
  assert.notEqual(posts(h)[4].body.requestId, posts(h)[3].body.requestId)
})

test('报名和商城使用独立业务 requestId', async () => {
  const reject = async () => { throw new Error('offline') }
  const a = harness('match', { post: reject }), b = harness('profile', { post: reject })
  prepareRegistration(a); prepareOrder(b)
  await Promise.all([a.page.submitRegister(), b.page.submitOrder()])
  assert.notEqual(posts(a)[0].body.requestId, posts(b)[0].body.requestId)
})

test('清空等待 DELETE 成功再清本地，失败保留订单和缓存，重复点击只发一次', async () => {
  let pending = deferred()
  const h = harness('profile', { storage: { mall_orders: [order] }, delete: () => pending.promise })
  h.page.setData({ orders: [order] })
  h.page.clearOrders(); h.page.clearOrders()
  assert.equal(h.modals.length, 1)
  const first = h.modals[0].success({ confirm: true })
  h.page.clearOrders()
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].url, '/api/comptrain/orders')
  assert.equal(h.calls[0].method, 'delete')
  assert.equal(h.removals.length, 0)
  assert.deepEqual(h.storage.get('mall_orders'), [order])
  pending.reject({ code: 'NO_TOKEN', message: '请先登录' }); await first
  assert.deepEqual(plain(h.page.data.orders), [order])
  assert.deepEqual(h.storage.get('mall_orders'), [order])
  assert.equal(successes(h).length, 0)
  assert.equal(h.toasts[0].title, '请先登录')
  pending = deferred()
  h.page.clearOrders()
  const second = h.modals[1].success({ confirm: true })
  pending.resolve(null); await second
  assert.deepEqual(plain(h.page.data.orders), [])
  assert.equal(h.storage.has('mall_orders'), false)
  assert.deepEqual(h.removals, ['mall_orders'])
  assert.deepEqual(successes(h), [{ title: '已清空', icon: 'success' }])
})

test('取消清空或弹窗失败释放锁、不调用 DELETE', async () => {
  const h = harness('profile')
  h.page.clearOrders(); await h.modals[0].success({ confirm: false })
  h.page.clearOrders(); h.modals[1].fail({ message: '弹窗失败' })
  h.page.clearOrders()
  assert.equal(h.modals.length, 3)
  assert.equal(h.calls.length, 0)
  assert.equal(h.removals.length, 0)
})

test('下单及清空之前发起的 GET 晚到，不能覆盖已确认结果', async () => {
  const pending = deferred()
  const h = harness('profile', { get: () => pending.promise, post: async () => order, delete: async () => null })
  const loading = h.page.loadOrders()
  prepareOrder(h); await h.page.submitOrder()
  pending.resolve([]); await loading
  assert.deepEqual(plain(h.page.data.orders), [order])
  const old = deferred()
  const cleared = harness('profile', { get: () => old.promise, delete: async () => null })
  cleared.page.setData({ orders: [order] })
  const oldLoad = cleared.page.loadOrders()
  cleared.page.clearOrders(); await cleared.modals[0].success({ confirm: true })
  old.resolve([order]); await oldLoad
  assert.equal(cleared.page.data.orders.length, 0)
  assert.equal(cleared.storage.has('mall_orders'), false)
})

test('报名之前发起的 GET 晚到不能撤销成功标记', async () => {
  const pending = deferred()
  const h = harness('match', { get: url => url.endsWith('/registrations') ? pending.promise : Promise.resolve([event]), post: async () => registration })
  const loading = h.page.loadRegistrations()
  prepareRegistration(h); await h.page.submitRegister()
  pending.resolve([]); await loading
  assert.equal(h.page.data.registeredMap[event.id], true)
  assert.deepEqual(h.storage.get('event_registrations'), [registration])
})

test('本地缓存写入失败不影响已确认的服务端成功', async () => {
  const a = harness('match', { storageFails: true, post: async () => registration })
  const b = harness('profile', { storageFails: true, post: async () => order })
  prepareRegistration(a); prepareOrder(b)
  await Promise.all([a.page.submitRegister(), b.page.submitOrder()])
  assert.equal(a.page.data.registeredMap[event.id], true)
  assert.deepEqual(plain(b.page.data.orders), [order])
  assert.equal(successes(a).length, 1)
  assert.equal(successes(b).length, 1)
})

test('异常成功响应不能生成虚假报名或订单', async () => {
  const a = harness('match', { post: async () => null })
  const b = harness('profile', { post: async () => ({ data: order }) })
  prepareRegistration(a); prepareOrder(b)
  await Promise.all([a.page.submitRegister(), b.page.submitOrder()])
  assert.equal(successes(a).length + successes(b).length, 0)
  assert.equal(a.writes.length + b.writes.length, 0)
  assert.equal(a.page.data.registerVisible, true)
  assert.equal(b.page.data.detailVisible, true)
})
