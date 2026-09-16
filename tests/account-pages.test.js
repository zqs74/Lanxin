'use strict'

// Run with: node --test tests/account-pages.test.js (Node built-ins only).
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { privacyWx } = require('./privacy-harness')
const root = path.resolve(__dirname, '..')
const copy = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value))
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b }); return { promise, resolve, reject } }

function harness(overrides = {}, initial = {}) {
  const storage = new Map(Object.entries(copy(initial))), toasts = [], navigation = [], timers = []
  const api = { ensureLogin: async () => ({ id: 7, userId: 7 }),
    get: async () => { throw { code: 404, message: '不存在' } },
    post: async () => { throw { code: 500, message: '保存失败' } },
    put: async () => { throw { code: 500, message: '保存失败' } },
    upload: async () => ({ url: 'https://api.lanxin.cyou/media/image/avatar.png' }), ...overrides }
  const app = { api, globalData: { api, authReady: Promise.resolve(null) }, getUserTheme: () => 'light',
    getThemeColors: () => ({ pageBg: '#f8f7f4' }), getTheme: () => 'light', applyNavBarColor() {} }
  const wx = { ...privacyWx(), getStorageSync: key => copy(storage.get(key)), setStorageSync: (key, value) => storage.set(key, copy(value)),
    removeStorageSync: key => storage.delete(key), showToast: value => toasts.push(value),
    showModal: options => options.success({ confirm: true }), nextTick: callback => callback(),
    navigateTo: options => navigation.push(options.url), navigateBack: () => navigation.push('back'), switchTab: options => navigation.push(options.url),
    getWindowInfo: () => ({}), getDeviceInfo: () => ({}),
    createSelectorQuery: () => ({ in() { return this }, select() { return this }, fields() { return this },
      boundingClientRect() { return this }, exec(callback) { if (callback) callback([]) } }) }
  const cache = new Map()
  function run(relative, page) {
    const filename = path.resolve(root, relative)
    if (!page && cache.has(filename)) return cache.get(filename)
    let definition
    const module = { exports: {} }
    const context = { module, exports: module.exports, getApp: () => app, wx,
      getCurrentPages: () => [{}], Page: value => { definition = value },
      console: { log() {}, error() {} }, setTimeout: callback => { timers.push(callback); return timers.length },
      setInterval: callback => { timers.push(callback); return timers.length }, clearInterval() {},
      require: specifier => run(path.relative(root, path.resolve(path.dirname(filename), specifier + '.js'))) }
    vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, { filename })
    if (!page) { cache.set(filename, module.exports); return module.exports }
    const instance = { ...definition, data: copy(definition.data), setData(patch, callback) {
      for (const [key, value] of Object.entries(patch)) {
        const parts = key.split('.'); let target = this.data
        for (const part of parts.slice(0, -1)) target = target[part]
        target[parts.at(-1)] = copy(value)
      }
      if (callback) callback()
    } }
    return instance
  }
  return { api, app, wx, storage, toasts, navigation, timers, page: name => run(`pages/${name}/${name}.js`, true), sync: () => run('utils/custom-match-sync.js') }
}

function match(id = 'custom_test') {
  return { matchId: id, status: 'in_progress', startTime: '2026-09-09T00:00:00.000Z', duration: '00:01:02',
    players: [{ id: 1, name: 'A1号', number: '1', team: 'A', avatar: '', score: 3, fouls: [], rebounds: [{ time: '08:00:00' }], assists: [], steals: [], turnovers: [], blocks: [] },
      { id: 2, name: 'B1号', number: '1', team: 'B', avatar: '', score: 2, fouls: [], rebounds: [], assists: [], steals: [], turnovers: [], blocks: [] }],
    totalScore: 5, teamAScore: 3, teamBScore: 2, teamAFouls: 1, teamBFouls: 0,
    teamAFoulRecords: [{ time: '08:00:02' }], teamBFoulRecords: [],
    actionLog: [{ id: 1, type: 'score', playerId: 1, points: 3, oldScore: 0, time: '08:00:01', timestamp: '2026-09-09T00:00:01.000Z' }] }
}

test('profile maps full /auth/me DTO, including zero years of play', async () => {
  const calls = []
  const h = harness({ get: async endpoint => { calls.push(endpoint); return { id: 7, nickname: '小林', avatarUrl: 'https://example.com/a.png', age: 22, heightCm: 185, weightKg: 80, yearsOfPlay: 0, position: '中锋', skillFeature: '防守' } } })
  const page = h.page('profile-edit')
  await page.loadProfile()
  assert.deepEqual(calls, ['/api/auth/me'])
  assert.deepEqual(copy(page.data.profile), { name: '小林', avatar: 'https://example.com/a.png', age: '22', height: '185', weight: '80', yearsOfPlay: '0', position: '中锋', skillFeature: '防守' })
  assert.equal(page.data.positionIndex, 4)
})

test('profile uploads local avatar before PUT and caches only confirmed DTO', async () => {
  const calls = []
  const h = harness({ upload: async (endpoint, file) => { calls.push(['upload', endpoint, file]); return { url: 'https://example.com/avatar.png' } },
    put: async (endpoint, body) => { calls.push(['put', endpoint, copy(body)]); return { id: 7, ...body, nickname: '服务端姓名' } } })
  const page = h.page('profile-edit')
  page.setData({ profile: { name: '  小林 ', avatar: 'http://tmp/avatar.png', age: '22', height: '185', weight: '80', yearsOfPlay: '0', position: '中锋', skillFeature: '防守' } })
  await page.saveProfile()
  assert.equal(calls[0][0], 'upload')
  assert.equal(calls[1][1], '/api/users/7')
  assert.deepEqual(calls[1][2], { nickname: '小林', avatarUrl: 'https://example.com/avatar.png', age: 22, heightCm: 185, weightKg: 80, yearsOfPlay: 0, position: '中锋', skillFeature: '防守' })
  assert.equal(h.storage.get('profile').name, '服务端姓名')
  assert.equal(h.toasts.at(-1).title, '资料已保存')
})

for (const failAt of ['upload', 'put']) test(`profile ${failAt} failure preserves edits and never reports success`, async () => {
  let puts = 0
  const h = harness({ upload: async () => { if (failAt === 'upload') throw { code: 500, message: '上传失败' }; return { url: 'https://example.com/a.png' } },
    put: async () => { puts++; throw { code: 500, message: '保存失败' } } }, { profile: { name: '原资料' } })
  const page = h.page('profile-edit')
  page.setData({ 'profile.name': '新资料', 'profile.avatar': 'wxfile://tmp/a.png' })
  await page.saveProfile()
  assert.equal(puts, failAt === 'upload' ? 0 : 1)
  assert.equal(h.storage.get('profile').name, '原资料')
  assert.equal(page.data.profile.name, '新资料')
  assert.equal(h.toasts.some(toast => toast.icon === 'success'), false)
  assert.equal(h.timers.length, 0)
})

test('late profile GET does not replace edits', async () => {
  const pending = deferred(), h = harness({ get: () => pending.promise }), page = h.page('profile-edit')
  const loading = page.loadProfile()
  page.onNameChange({ detail: { value: '正在编辑' } })
  pending.resolve({ nickname: '旧姓名' })
  await loading
  assert.equal(page.data.profile.name, '正在编辑')
})

test('training maps records/plans/career DTOs and never relabels game stats as skills', async () => {
  const calls = []
  const h = harness({ get: async endpoint => {
    calls.push(endpoint)
    if (endpoint === '/api/home/overview') return { careerStats: { points: 17, rebounds: 8, assists: 4, shootingPercentage: 42, totalGames: 3 } }
    if (endpoint === '/api/training/records') return [{ id: 3, trainingDate: '2026-09-09', title: '投篮', durationMinutes: 24, intensity: '高强度', highlights: ['命中'] }]
    return { radarData: [{ label: '得分', value: 17, max: 40 }], plans: [{ id: 4, title: '计划', goal: '基础', startDate: '2026-09-07', status: 'COMPLETED', progress: 100 }] }
  } })
  const page = h.page('training')
  await page.loadTrainingData()
  assert.equal(page.data.careerStats.shootingPercentage, '42%')
  assert.equal(page.data.recentRecords[0].duration, 24)
  assert.equal(page.data.recentRecords[0].day, '09')
  assert.equal(page.data.weeklyPlans[0].description, '基础')
  assert.equal(page.data.weeklyPlans[0].day, '周一')
  assert.equal(page.data.weeklyPlans[0].status, 'completed')
  assert.deepEqual(page.data.radarData.values, [null, null, null, null, null, null])
  assert.equal(page.data.overallScore, '')
  assert.equal(calls.includes('/api/training/plans'), false)
})

test('empty training responses remove demo records/plans and use zero career totals', async () => {
  const h = harness({ get: async endpoint => endpoint.endsWith('/records') ? [] : {} })
  const page = h.page('training')
  await page.loadTrainingData()
  assert.deepEqual(page.data.recentRecords, [])
  assert.deepEqual(page.data.weeklyPlans, [])
  assert.equal(page.data.careerStats.points, 0)
  assert.equal(page.data.todaySummary.count, 0)
  assert.equal(page.data.overallScore, '')
})

test('training saves via record DTO; rejected save keeps modal and no fake record', async () => {
  let body, fail = true
  const h = harness({ post: async (endpoint, payload) => { assert.equal(endpoint, '/api/training/records'); body = copy(payload); if (fail) throw { code: 500, message: '保存失败' }; return { id: 90, ...payload } } })
  const page = h.page('training')
  page.setData({ showAddModal: true, newRecord: { title: ' 投篮 ', duration: '30', intensity: '中等强度', highlightsText: '稳定, 手感' } })
  await page.saveRecord()
  assert.equal(page.data.showAddModal, true)
  assert.equal(page.data.recentRecords.length, 0)
  assert.equal(h.toasts.some(toast => toast.icon === 'success'), false)
  fail = false
  await page.saveRecord()
  assert.equal(body.title, '投篮')
  assert.equal(body.durationMinutes, 30)
  assert.match(body.trainingDate, /^\d{4}-\d{2}-\d{2}$/)
  assert.deepEqual(body.highlights, ['稳定', '手感'])
  assert.equal(page.data.showAddModal, false)
  assert.equal(page.data.recentRecords[0].id, 90)
  assert.equal(page.data.todaySummary.durationMinutes, 30)
})

test('quick train uses existing record POST and guards double submit', async () => {
  const pending = deferred(); let posts = 0
  const h = harness({ post: async (endpoint, body) => { posts++; assert.equal(body.durationMinutes, 30); await pending.promise; return { id: 1, ...body } } })
  const page = h.page('training')
  let saving
  h.wx.showModal = options => { saving = options.success({ confirm: true }) }
  page.startQuickTrain({ currentTarget: { dataset: { id: '1' } } })
  await page.createRecord({}, true)
  pending.resolve()
  await saving
  assert.equal(posts, 1)
  assert.equal(page.data.recentRecords.length, 1)
  assert.equal(h.toasts.at(-1).title, '训练已开始')
})

test('custom snapshot roundtrip uses only accepted DTO fields, preserving all new stats', () => {
  const sync = harness().sync(), data = match(), body = sync.toRequest(data, 8)
  assert.deepEqual(Object.keys(body).sort(), ['expectedVersion', 'payload', 'status'])
  assert.deepEqual(Object.keys(body.payload).sort(), ['clock', 'eventLog', 'fouls', 'players', 'score'])
  assert.equal(body.status, 'ONGOING')
  assert.equal(body.expectedVersion, 8)
  const restored = sync.fromResponse({ clientMatchId: data.matchId, version: 9, status: body.status, payload: body.payload })
  for (const field of ['players', 'actionLog', 'startTime', 'duration', 'teamAFoulRecords', 'teamAScore']) assert.deepEqual(copy(restored[field]), data[field])
  assert.equal(restored._sync.version, 9)
})

test('concurrent custom edits serialize PUTs and acknowledge only the sent revision', async () => {
  const first = deferred(), entered = deferred(), calls = []; let active = 0, maxActive = 0
  const h = harness({ put: async (endpoint, body) => { calls.push(copy(body)); maxActive = Math.max(maxActive, ++active); if (calls.length === 1) { entered.resolve(); await first.promise }; active--; return { version: calls.length } } })
  const sync = h.sync(), data = match()
  sync.saveLocal(data)
  const sending = sync.sync(data.matchId)
  await entered.promise
  data.players[0].score = 6; data.teamAScore = 6
  sync.saveLocal(data)
  const again = sync.sync(data.matchId)
  assert.equal(sync.read(data.matchId)._sync.dirty, true)
  first.resolve()
  await Promise.all([sending, again])
  assert.equal(maxActive, 1)
  assert.deepEqual(calls.map(body => body.expectedVersion), [0, 1])
  assert.equal(calls[1].payload.players[0].score, 6)
  assert.equal(sync.read(data.matchId)._sync.dirty, false)
  assert.equal(sync.read(data.matchId)._sync.version, 2)
})

test('edits during delayed login are not overwritten before PUT', async () => {
  const auth = deferred(), entered = deferred(); let sent
  const h = harness({ ensureLogin: () => { entered.resolve(); return auth.promise }, put: async (endpoint, body) => { sent = copy(body); return { version: 1 } } })
  const sync = h.sync(), data = match()
  sync.saveLocal(data)
  const pending = sync.sync(data.matchId)
  await entered.promise
  data.players[0].score = 9
  sync.saveLocal(data)
  auth.resolve({ userId: 7 })
  await pending
  assert.equal(sent.payload.players[0].score, 9)
  assert.equal(sync.read(data.matchId).players[0].score, 9)
})

test('409 persists conflict and original base version across retries and reloads', async () => {
  let calls = 0
  const h = harness({ put: async () => { calls++; throw { code: 409, message: '自定义比赛版本冲突' } } })
  const sync = h.sync(), data = match()
  sync.saveLocal(data)
  assert.equal((await sync.sync(data.matchId)).ok, false)
  data.players[0].score = 8
  sync.saveLocal(data)
  await sync.sync(data.matchId)
  await sync.load(data.matchId)
  const stored = sync.read(data.matchId)
  assert.equal(calls, 1)
  assert.equal(stored._sync.dirty, true)
  assert.equal(stored._sync.conflict, true)
  assert.equal(stored._sync.version, 0)
  assert.equal(stored.players[0].score, 8)
  const reloaded = harness({ put: async () => { throw new Error('must never overwrite') } }, Object.fromEntries(h.storage)).sync()
  assert.equal((await reloaded.sync(data.matchId)).error.code, 409)
})

test('GET cannot replace a local edit made while loading the server snapshot', async () => {
  const pending = deferred(), entered = deferred()
  const h = harness({ get: () => { entered.resolve(); return pending.promise } }), sync = h.sync()
  const loading = sync.load('custom_test')
  await entered.promise
  const data = match(); data.players[0].score = 11
  sync.saveLocal(data)
  pending.resolve({ clientMatchId: data.matchId, version: 10, status: 'ONGOING', payload: sync.toRequest(match(), 0).payload })
  const loaded = await loading
  assert.equal(loaded.players[0].score, 11)
  assert.equal(loaded._sync.version, 0)
  assert.equal(loaded._sync.dirty, true)
})

test('server-only custom match restores version, stats, clock and result calculations', async () => {
  const h = harness(), sync = h.sync(), data = match()
  data.status = 'completed'; data.finalTotalScore = 5; data.endTime = '2026-09-09T00:01:02.000Z'
  h.api.get = async () => ({ clientMatchId: data.matchId, version: 4, status: 'FINISHED', payload: sync.toRequest(data, 0).payload })
  const page = h.page('custom-match-result')
  page.setData({ matchId: data.matchId })
  await page.loadMatchResult()
  assert.equal(page.data.teamATotalScore, 3)
  assert.equal(page.data.teamBTotalScore, 2)
  assert.equal(page.data.teamAFouls, 1)
  assert.equal(page.data.statTotals.rebounds, 1)
  assert.equal(page.data.matchDuration, '00:01:02')
  assert.equal(sync.read(data.matchId)._sync.version, 4)
})

test('local player avatars upload before the custom snapshot leaves the device', async () => {
  const calls = []
  const h = harness({ upload: async () => { calls.push('upload'); return { url: 'https://example.com/player.png' } },
    put: async (endpoint, body) => { calls.push('put'); assert.equal(body.payload.players[0].avatar, 'https://example.com/player.png'); return { version: 1 } } })
  const sync = h.sync(), data = match(); data.players[0].avatar = 'wxfile://tmp/p.png'
  sync.saveLocal(data)
  await sync.sync(data.matchId)
  assert.deepEqual(calls, ['upload', 'put'])
  assert.equal(sync.read(data.matchId).players[0].avatar, 'https://example.com/player.png')
})

test('offline onHide/onUnload failures resolve and preserve pending data for a later retry', async () => {
  const h = harness({ put: async () => { throw { code: 0, message: '离线' } } }), sync = h.sync(), data = match()
  sync.saveLocal(data)
  const page = h.page('custom-match-live')
  page.setData({ matchId: data.matchId })
  await Promise.all([page.onHide(), page.onUnload()])
  assert.equal(sync.read(data.matchId)._sync.dirty, true)
  assert.equal(sync.read(data.matchId)._sync.conflict, false)
  h.api.put = async () => ({ version: 1 })
  await sync.sync(data.matchId)
  assert.equal(sync.read(data.matchId)._sync.dirty, false)
})

test('ending and lifecycle saves remain FINISHED, with offline result retained', async () => {
  const calls = [], h = harness({ put: async (endpoint, body) => { calls.push(copy(body)); throw { code: 0, message: '离线' } } })
  const sync = h.sync(), data = match(); sync.saveLocal(data)
  const page = h.page('custom-match-live')
  page.setData({ ...data, matchTime: '00:01:02' })
  page.confirmEndMatch()
  await Promise.all([page.onHide(), page.onUnload()])
  assert.equal(sync.read(data.matchId).status, 'completed')
  assert.equal(sync.read(data.matchId)._sync.dirty, true)
  assert.equal(h.storage.has('unfinished_custom_match'), false)
  assert.equal(calls.every(body => body.status === 'FINISHED'), true)
  assert.equal(h.storage.get('finished_custom_matches').length, 1)
  page.confirmEndMatch()
  assert.equal(h.storage.get('finished_custom_matches').length, 1)
})

test('scoring and undo preserve new frontend team statistics and pending snapshots', async () => {
  const h = harness(), sync = h.sync(), data = match(); sync.saveLocal(data)
  const page = h.page('custom-match-live'); page.setData({ ...data, selectedPlayer: data.players[0] })
  page.addScore({ currentTarget: { dataset: { points: '2' } } })
  assert.equal(page.data.teamAScore, 5)
  assert.equal(page.data.teamAFouls, 1)
  page.undoLastAction()
  assert.equal(page.data.teamAScore, 3)
  assert.equal(page.data.players[0].rebounds.length, 1)
  await page.onHide()
  assert.equal(sync.read(data.matchId).teamAScore, 3)
  assert.equal(sync.read(data.matchId)._sync.dirty, true)
})

test('setup saves drafts offline and reopens the durable roster', async () => {
  const h = harness(), setup = h.page('custom-match-setup')
  setup.onLoad({ matchId: 'custom_draft' })
  setup.onNameInput({ currentTarget: { dataset: { index: '0' } }, detail: { value: '新球员' } })
  await setup.onHide()
  assert.equal(h.sync().read('custom_draft').status, 'draft')
  const restored = h.page('custom-match-setup'); restored.onLoad({ matchId: 'custom_draft' }); restored._visible = true
  await restored.checkUnfinishedMatch()
  assert.equal(restored.data.players[0].name, '新球员')
  assert.equal(restored.data.teamBPlayers.length, 5)
})

test('leaving setup while restoration is pending cannot reset an ongoing match', async () => {
  const pending = deferred(), entered = deferred()
  const h = harness({ put: () => { entered.resolve(); return pending.promise } }), sync = h.sync()
  const data = match(); sync.saveLocal(data)
  const page = h.page('custom-match-setup'); page.onLoad({ matchId: data.matchId }); page._visible = true
  const loading = page.checkUnfinishedMatch()
  await entered.promise
  const hiding = page.onHide()
  assert.equal(sync.read(data.matchId).status, 'in_progress')
  assert.equal(sync.read(data.matchId).players[0].score, 3)
  pending.resolve({ version: 1 })
  await Promise.all([loading, hiding])
  assert.equal(sync.read(data.matchId).status, 'in_progress')
  assert.equal(h.navigation.length, 0)
})

test('training refresh begun before a successful save cannot drop the new record', async () => {
  const pending = deferred()
  const h = harness({ get: endpoint => endpoint.endsWith('/records') ? pending.promise : Promise.resolve({}),
    post: async (endpoint, body) => ({ id: 33, ...body }) })
  const page = h.page('training'), loading = page.loadTrainingData()
  await page.createRecord({ title: '练习', trainingDate: page.localDate(), durationMinutes: 10, highlights: [] }, false)
  pending.resolve([])
  await loading
  assert.equal(page.data.recentRecords[0].id, 33)
})

test('upload failure in custom sync retains dirty local avatar without sending PUT', async () => {
  let puts = 0
  const h = harness({ upload: async () => { throw { code: 500, message: '上传失败' } }, put: async () => { puts++; return { version: 1 } } })
  const sync = h.sync(), data = match(); data.players[0].avatar = 'http://tmp/a.png'; sync.saveLocal(data)
  const result = await sync.sync(data.matchId)
  assert.equal(result.ok, false)
  assert.equal(puts, 0)
  assert.equal(sync.read(data.matchId).players[0].avatar, 'http://tmp/a.png')
  assert.equal(sync.read(data.matchId)._sync.dirty, true)
})

test('match detail maps server score/performance/shooting and preserves custom resume entry', async () => {
  const h = harness({ get: async endpoint => { assert.equal(endpoint, '/api/matches/12/insight'); return {
    match: { teamAScore: 52, teamBScore: 48, matchDate: '2026-09-09T08:30:00' },
    teamAPerformance: { points: 52, fieldGoalPct: 45.5 }, teamBPerformance: { points: 48 },
    scoreTrend: [{ quarterNo: 1, teamAScore: 12, teamBScore: 10 }], shootingData: [{ quarterNo: 1, makes: 2, attempts: 3 }], clips: []
  } } }, { unfinished_custom_match: match('custom_resume') })
  const page = h.page('match-detail'); page.matchId = 12
  await page.loadMatchDetail()
  assert.equal(page.data.score.redTeam, 52)
  assert.equal(page.data.performance[3].redTeam, '45.5%')
  assert.deepEqual(page.data.shootingData.made, [2])
  assert.deepEqual(page.data.clips, [])
  page.startCustomMatch()
  assert.match(h.navigation.at(-1), /matchId=custom_resume$/)
})

const flushPrivacy = () => new Promise(resolve => setImmediate(resolve))
for (const name of ['profile-edit', 'custom-match-setup']) {
  const choose = page => name === 'profile-edit' ? page.uploadAvatar() : page.chooseAvatar({ currentTarget: { dataset: { index: '0' } } })
  test(`${name}: image picker waits for platform authorization and upload disclosure`, async () => {
    const h = harness(), page = h.page(name); let picker, notice
    h.wx.needAuthorization(); h.wx.chooseMedia = o => { picker = o }
    h.wx.showModal = o => { notice = o }
    const pending = choose(page); await flushPrivacy()
    assert.equal(picker, undefined); assert.equal(notice, undefined)
    page.agreePrivacyAuthorization(); await flushPrivacy()
    assert.equal(picker, undefined); assert.match(notice.content, /公共链接/)
    notice.success({ confirm: true }); await pending
    assert.equal(picker.count, 1); assert.deepEqual(copy(picker.mediaType), ['image'])
  })
  for (const lifecycle of ['onHide', 'onUnload']) {
    test(`${name}: ${lifecycle} cancels pending authorization and replaces listener with denial`, async () => {
      const h = harness(), page = h.page(name)
      h.wx.needAuthorization(); h.wx.chooseMedia = () => assert.fail('cannot choose after leaving')
      const pending = choose(page); await flushPrivacy()
      if (name === 'custom-match-setup') page.saveDraft = () => {}
      await page[lifecycle](); await pending
      assert.equal(typeof h.wx.listener(), 'function')
      h.wx.listener()(result => assert.equal(result.event, 'disagree'))
      assert.equal(page.data.privacyVisible, false)
    })
  }
  test(`${name}: missing config, denial and late picker callback do not modify avatars`, async () => {
    const h = harness(), page = h.page(name); let chosen
    h.wx.chooseMedia = o => { chosen = o }
    h.wx.getPrivacySetting = o => o.success({ needAuthorization: false, privacyContractName: '' })
    await choose(page); assert.equal(chosen, undefined)
    h.wx.getPrivacySetting = o => o.success({ needAuthorization: false, privacyContractName: '指引' })
    h.wx.showModal = o => o.success({ confirm: false })
    await choose(page); assert.equal(chosen, undefined)
    h.wx.showModal = o => o.success({ confirm: true })
    await choose(page)
    if (name === 'custom-match-setup') page.saveDraft = () => {}
    await page.onUnload()
    page.setData = () => assert.fail('late picker callback must not update hidden page')
    chosen.success({ tempFiles: [{ tempFilePath: 'wxfile://late.png' }] })
  })
}
