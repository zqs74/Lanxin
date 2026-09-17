const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const { privacyWx, loadPrivacy } = require('./privacy-harness')
const source = fs.readFileSync(path.join(__dirname, '../pages/index/index.js'), 'utf8')
const base = '/api/comptrain/clips/projects'
const clip = { id: '1', time: '00:02', description: '进球识别', type: '投篮', selected: false }
const project = { id: 10, videoUrl: 'https://api.lanxin.cyou/media/video/source.mp4?exp=1999999999&sig=' + 'a'.repeat(64), status: 'SUCCEEDED', clips: [clip] }
const rendered = { id: 'render-1', projectId: 10, status: 'SUCCEEDED', videoUrl: 'https://api.lanxin.cyou/media/video/render.mp4', durationMs: 1234, clipIds: ['1'], saved: false }

function harness(api = {}) {
  let definition
  let timerId = 0
  const timers = new Map()
  const calls = { toast: [], album: [], loading: 0, loadingTitles: [], navigation: [] }
  const defaultUser = { id: 7 }
  const app = { api: { getUser: () => defaultUser, ensureLogin: async () => defaultUser,
    get: async route => route === '/api/auth/me' ? defaultUser : route === `${base}/10` ? project : ({ ...rendered, saved: true }), ...api },
    getUserTheme: () => 'auto', getThemeColors: () => ({ pageBg: '#f8f7f4' }), getTheme: () => 'light', applyNavBarColor() {} }
  const wx = { ...privacyWx(),
    showToast: value => calls.toast.push(value), showLoading: o => { calls.loading++; calls.loadingTitles.push(o.title) }, hideLoading: () => { calls.loading = 0 },
    getFileSystemManager: () => ({ stat(o) { o.success({ stats: { size: 1024, isFile: () => true } }) } }),
    navigateTo: o => calls.navigation.push(o.url),
    chooseVideo: options => { calls.choose = options }, showActionSheet: options => { calls.sheet = options },
    saveVideoToPhotosAlbum: options => { calls.album.push(options.filePath); options.success() }
  }
  let stack = []
  vm.runInNewContext(source, { getCurrentPages: () => stack, Page: value => { definition = value }, getApp: () => app, wx, require: name => name.endsWith('/api') ? require('../utils/api') : loadPrivacy(wx),
    setTimeout: fn => { timers.set(++timerId, fn); return timerId }, clearTimeout: id => timers.delete(id), console })
  const page = { ...definition, data: JSON.parse(JSON.stringify(definition.data)), _epoch: 0, _visible: true,
    setData(value) { Object.assign(this.data, value) } }
  stack = [page]
  return { page, calls, timers, wx, app, setStack(value) { stack = value }, tick: async () => { await flush(); const tasks = [...timers.values()]; timers.clear(); tasks.forEach(fn => fn()); await flush() } }
}
const flush = () => new Promise(resolve => setImmediate(resolve))

test('initial clips are empty; /auth/me maps the actual profile DTO', async () => {
  const { page } = harness({ getUser: () => ({ id: 9 }), get: async p => { assert.equal(p, '/api/auth/me'); return { id: 9, nickname: '球员', avatarUrl: 'a', heightCm: 180, weightKg: 75 } } })
  assert.equal(page.data.clips.length, 0)
  await page.loadProfile()
  assert.equal(page.data.profile.name, '球员')
  assert.equal(page.data.profile.height, '180cm')
  assert.equal(page.data.profile.weight, '75kg')
  assert.equal(page.data.profile.avatar, 'a')
})

test('chooseVideo really uploads and only displays returned clips in the original UI shape', async () => {
  const { page, calls } = harness({ upload: async (p, file) => {
    assert.equal(p, `${base}/upload`); assert.equal(file, '/tmp/source.mp4'); return project
  } })
  await page.uploadLocalVideo()
  await calls.choose.success({ tempFilePath: '/tmp/source.mp4' })
  assert.equal(page._projectId, 10)
  assert.deepEqual(Object.keys(page.data.clips[0]), ['id', 'time', 'description', 'type', 'selected'])
  assert.equal(page.data.clips[0].id, '1')
  assert.equal(page.data.videoGenerated, false)
  assert.equal(page.data.isGenerating, false)
})

test('upload failure clears busy and never creates fake results', async () => {
  const { page, calls } = harness({ upload: async () => { throw new Error('上传失败') } })
  await page.uploadLocalVideo(); await calls.choose.success({ tempFilePath: '/tmp/a.mp4' })
  assert.equal(page.data.isGenerating, false); assert.equal(page._busy, false)
  assert.equal(page.data.clips.length, 0); assert.equal(calls.loading, 0)
  assert.equal(calls.toast.at(-1).title, '上传失败')
})

test('queued analysis polls, and no basketball signal stays empty', async () => {
  const { page, tick, calls } = harness({ get: async () => ({ ...project, clips: [], message: '未识别到篮球精彩片段' }) })
  const work = page.runWork(epoch => page.watchProject({ ...project, status: 'QUEUED' }, epoch))
  assert.equal(page.data.videoGenerated, false)
  await tick(); await work
  assert.equal(page.data.clips.length, 0); assert.equal(calls.toast.at(-1).title, '未识别到篮球精彩片段')
})

test('selected IDs go to render; success depends on completed file and measured duration', async () => {
  let submitted
  const { page } = harness({ post: async (p, body) => { assert.equal(p, `${base}/10/render`); submitted = body; return rendered } })
  page._projectId = 10; page.setData({ clips: [{ ...clip, selected: true }], selectedCount: 1 })
  await page.generateWithAI()
  assert.equal(submitted.clipIds.join(','), '1'); assert.ok(submitted.requestId)
  assert.equal(page.data.generatedDuration, '1.2秒'); assert.equal(page.data.videoGenerated, true)
})

test('ambiguous render POST retries reuse requestId', async () => {
  const ids = []
  const { page } = harness({ post: async (p, b) => { ids.push(b.requestId); if (ids.length === 1) throw new Error('network'); return rendered } })
  page._projectId = 10; page.setData({ clips: [{ ...clip, selected: true }], selectedCount: 1 })
  await page.generateWithAI(); await page.generateWithAI()
  assert.equal(ids[0], ids[1]); assert.equal(page.data.videoGenerated, true)
})

test('terminal render failure permits a fresh request instead of looping on failed job', async () => {
  const ids = []
  const { page } = harness({ post: async (p, b) => { ids.push(b.requestId); return ids.length === 1 ? { ...rendered, status: 'FAILED' } : rendered } })
  page._projectId = 10; page.setData({ clips: [{ ...clip, selected: true }], selectedCount: 1 })
  await page.generateWithAI(); assert.equal(page._pending, null)
  await page.generateWithAI(); assert.notEqual(ids[0], ids[1]); assert.equal(page.data.videoGenerated, true)
})

test('hide clears timers and ignores late responses; pending work can resume', async () => {
  let release
  const { page, tick, timers } = harness({ get: () => new Promise(resolve => { release = resolve }) })
  const work = page.runWork(epoch => page.watchProject({ ...project, status: 'QUEUED' }, epoch))
  await tick(); page.onHide(); release(project); await work
  assert.equal(page.data.clips.length, 0); assert.equal(timers.size, 0); assert.equal(page._busy, false)
  assert.equal(page._pending.type, 'analysis')
})

test('reset cancels pending delay and unload blocks chosen-video callbacks', async () => {
  const { page, calls, timers } = harness({})
  const work = page.runWork(epoch => page.watchProject({ ...project, status: 'QUEUED' }, epoch))
  page.resetVideo(); await work
  assert.equal(timers.size, 0); assert.equal(page._pending, null)
  await page.uploadLocalVideo(); page.onUnload(); await calls.choose.success({ tempFilePath: '/tmp/a.mp4' })
  assert.equal(page.data.videoName, '')
})

test('save persists own work, downloads actual URL and saves tempFilePath', async () => {
  const { page, calls } = harness({ post: async p => { assert.equal(p, `${base}/10/render/render-1/save`); return { ...rendered, saved: true } },
    download: async url => { assert.equal(url, rendered.videoUrl); return '/tmp/download.mp4' } })
  page._projectId = 10; page._render = rendered; page.setData({ videoGenerated: true })
  await page.saveVideo()
  assert.deepEqual(calls.album, ['/tmp/download.mp4']); assert.equal(page._render.saved, true)
  assert.equal(calls.toast.at(-1).title, '已保存集锦及相册')
})

test('download/album failure never claims saved-to-album success and permits retry', async () => {
  const { page, calls } = harness({ post: async () => ({ ...rendered, saved: true }), download: async () => { throw new Error('下载失败') } })
  page._projectId = 10; page._render = rendered; page.setData({ videoGenerated: true })
  await page.saveVideo(); assert.equal(page._saving, false); assert.equal(calls.album.length, 0)
  assert.equal(calls.toast.at(-1).title, '下载失败')
})

test('cloud history restores saved render with server selection and file', async () => {
  const saved = { ...project, renders: [{ ...rendered, saved: true }] }
  const { page } = harness({ get: async () => saved })
  await page.openCloudProject(project)
  assert.equal(page.data.selectedCount, 1); assert.equal(page.data.videoGenerated, true)
  assert.equal(page._render.videoUrl, undefined)
})

test('no success on malformed completed render without a file', async () => {
  const { page, calls } = harness({ post: async () => ({ ...rendered, videoUrl: null }) })
  page._projectId = 10; page.setData({ clips: [{ ...clip, selected: true }], selectedCount: 1 })
  await page.generateWithAI(); assert.equal(page.data.videoGenerated, false)
  assert.equal(calls.toast.at(-1).title, '生成文件不可用')
})

test('polling retries transient errors three times then releases busy without success', async () => {
  let requests = 0
  const { page, tick, calls, timers } = harness({ get: async () => { requests++; throw new Error('network unavailable') } })
  const work = page.runWork(epoch => page.watchProject({ ...project, status: 'QUEUED' }, epoch))
  await tick(); await tick(); await tick(); await work
  assert.equal(requests, 3); assert.equal(page._busy, false); assert.equal(timers.size, 0)
  assert.equal(page.data.videoGenerated, false); assert.equal(calls.toast.at(-1).title, 'network unavailable')
})

test('account change clears previous user project, selection and pending work', async () => {
  const { page } = harness({ getUser: () => ({ id: 8 }), get: async () => ({ id: 8, nickname: '新用户' }) })
  page._owner = 7; page._projectId = 10; page._pending = { type: 'analysis', projectId: 10 }
  page.setData({ clips: [clip], selectedCount: 1, videoGenerated: true })
  await page.loadProfile()
  assert.equal(page._projectId, null); assert.equal(page._pending, null)
  assert.equal(page.data.clips.length, 0); assert.equal(page.data.videoGenerated, false)
  assert.equal(page.data.profile.name, '新用户')
})

test('late upload response from previous account cannot expose its project or clips', async () => {
  let user = { id: 7 }; let completeUpload
  const { page, calls } = harness({ getUser: () => user, ensureLogin: async () => user,
    upload: () => new Promise(resolve => { completeUpload = resolve }) })
  await page.uploadLocalVideo()
  const work = calls.choose.success({ tempFilePath: '/tmp/source.mp4' })
  await flush(); user = { id: 8 }; completeUpload(project); await work
  assert.equal(page.data.clips.length, 0); assert.equal(page._projectId, null)
  assert.equal(page._busy, false); assert.equal(page.data.videoGenerated, false)
})

test('older profile response cannot replace a newer user profile', async () => {
  let user = { id: 7 }; let firstProfile; let requests = 0
  const { page } = harness({ getUser: () => user, get: async () => ++requests === 1
    ? new Promise(resolve => { firstProfile = resolve }) : { id: 8, nickname: 'B用户' } })
  const first = page.loadProfile()
  user = { id: 8 }; await page.loadProfile()
  firstProfile({ id: 7, nickname: 'A用户' }); await first
  assert.equal(page.data.profile.name, 'B用户'); assert.equal(page._owner, '8')
})

test('logout blocks sharing a previously cached public media URL', async () => {
  let downloads = 0
  const { page, wx } = harness({ getUser: () => null, download: async () => { downloads++; return '/tmp/a.mp4' } })
  wx.shareVideoMessage = () => assert.fail('must not share previous account video')
  page._owner = '7'; page._render = rendered; page.setData({ videoGenerated: true })
  await page.shareVideo()
  assert.equal(downloads, 0); assert.equal(page._render, null); assert.equal(page.data.videoGenerated, false)
})

test('account change during download prevents saving old user video to album', async () => {
  let user = { id: 7 }; let finishDownload
  const { page, calls } = harness({ getUser: () => user, ensureLogin: async () => user,
    post: async () => ({ ...rendered, saved: true }), download: () => new Promise(resolve => { finishDownload = resolve }) })
  page._owner = '7'; page._projectId = 10; page._render = rendered; page.setData({ videoGenerated: true })
  const work = page.saveVideo(); await flush()
  user = { id: 8 }; finishDownload('/tmp/previous-user.mp4'); await work
  assert.equal(calls.album.length, 0); assert.equal(page._render, null)
})

test('late cloud history from previous user does not open the chooser', async () => {
  let user = { id: 7 }; let finishHistory
  const { page, calls } = harness({ getUser: () => user, ensureLogin: async () => user,
    get: () => new Promise(resolve => { finishHistory = resolve }) })
  const work = page.useCloudVideo(); await flush()
  user = { id: 8 }; finishHistory([project]); await work
  assert.equal(calls.sheet, undefined); assert.equal(page._owner, null)
})

function prepareSaved(page) { page._projectId = 10; page._render = rendered; page.setData({ videoGenerated: true }) }
const freshUrl = rendered.videoUrl + '?exp=1789529999&sig=' + 'b'.repeat(64)
test('save fetches owned render before saving and refreshes again immediately before download', async () => {
  const order = []; let reads = 0
  const { page, calls } = harness({ get: async route => { order.push('get'); reads++; assert.equal(route, `${base}/10/render/render-1`); return { ...rendered, videoUrl: freshUrl.replace('1789529999', String(1789529999 + reads)), saved: true } },
    post: async () => { order.push('save'); return { ...rendered, saved: true } },
    download: async url => { order.push('download'); assert.equal(url, freshUrl.replace('1789529999', '1789530001')); return '/tmp/fresh.mp4' } })
  prepareSaved(page); await page.saveVideo()
  assert.deepEqual(order, ['get', 'save', 'get', 'download'])
  assert.deepEqual(calls.album, ['/tmp/fresh.mp4']); assert.equal(page._render.videoUrl, undefined)
  assert.equal(JSON.stringify(page.data).includes('sig='), false)
})
test('share always refreshes owned render, never downloads stale in-memory URL', async () => {
  const order = []; const { page, wx } = harness({ get: async route => { order.push('get'); assert.equal(route, `${base}/10/render/render-1`); return { ...rendered, videoUrl: freshUrl } },
    download: async url => { order.push('download'); assert.equal(url, freshUrl); return '/tmp/fresh.mp4' } })
  wx.shareVideoMessage = o => { order.push('share'); assert.equal(o.videoPath, '/tmp/fresh.mp4'); o.success() }
  prepareSaved(page); await page.shareVideo()
  assert.deepEqual(order, ['get', 'download', 'share']); assert.equal(page._render.videoUrl, undefined)
})
for (const action of ['saveVideo', 'shareVideo']) {
  test(`${action}: owned GET failure never falls back to stale URL and gives retry guidance`, async () => {
    const { page, wx, calls } = harness({ get: async () => { throw { code: 403, message: freshUrl } },
      post: async () => assert.fail('must verify ownership first'), download: async () => assert.fail('stale URL fallback forbidden') })
    wx.shareVideoMessage = () => assert.fail('failed refresh cannot share')
    prepareSaved(page); await page[action]()
    assert.match(calls.toast.at(-1).title, /刷新后重试/); assert.equal(JSON.stringify(calls.toast).includes('sig='), false)
  })
}
test('403 download prompts refresh; retry obtains a new URL and can save', async () => {
  let attempts = 0, reads = 0
  const { page, calls } = harness({ get: async () => { reads++; return { ...rendered, saved: true, videoUrl: freshUrl } },
    post: async () => ({ ...rendered, saved: true }), download: async () => { if (++attempts === 1) throw { code: 403 }; return '/tmp/renewed.mp4' } })
  prepareSaved(page); await page.saveVideo()
  assert.equal(calls.album.length, 0); assert.match(calls.toast.at(-1).title, /刷新后重试/)
  await page.saveVideo(); assert.deepEqual(calls.album, ['/tmp/renewed.mp4']); assert.equal(reads, 4)
})
test('account changes during URL refresh prevent download and sharing', async () => {
  let user = { id: 7 }, resolveGet, downloads = 0
  const { page, wx } = harness({ getUser: () => user, ensureLogin: async () => user,
    get: () => new Promise(resolve => { resolveGet = resolve }), download: async () => { downloads++ } })
  wx.shareVideoMessage = () => assert.fail('must not share after account changes')
  prepareSaved(page); page._owner = '7'
  const pending = page.shareVideo(); await flush(); user = { id: 8 }; resolveGet({ ...rendered, videoUrl: freshUrl }); await pending
  assert.equal(downloads, 0); assert.equal(page._render, null)
})
test('cloud signed source URL is not exposed in display name or retained render metadata', async () => {
  const { page } = harness({ get: async () => ({ ...project, videoUrl: freshUrl, renders: [{ ...rendered, saved: true, videoUrl: freshUrl }] }) })
  await page.openCloudProject({ ...project, videoUrl: freshUrl })
  assert.equal(page.data.videoName, '云端视频 10')
  assert.equal(page.data.playerSources[0].url, freshUrl)
  assert.equal(JSON.stringify([page.data.videoName, page.data.libraryItems, page._render]).includes('sig='), false)
})
test('video picker and album save both fail closed on missing privacy configuration', async () => {
  const { page, wx, calls } = harness({ post: async () => assert.fail('blocked save must not POST') })
  wx.getPrivacySetting = o => o.success({ needAuthorization: false, privacyContractName: '' })
  await page.uploadLocalVideo(); assert.equal(calls.choose, undefined)
  prepareSaved(page); await page.saveVideo(); assert.equal(calls.album.length, 0)
})
test('hide during video authorization installs denial listener and never opens the picker', async () => {
  const { page, wx, calls } = harness(); wx.needAuthorization()
  const pending = page.uploadLocalVideo(); await flush()
  assert.equal(page.data.privacyVisible, true)
  page.onHide(); await pending
  assert.equal(typeof wx.listener(), 'function')
  wx.listener()(result => assert.equal(result.event, 'disagree'))
  assert.equal(calls.choose, undefined)
})
test('album authorization rejection happens before save POST/download', async () => {
  const { page, wx, calls } = harness({ post: async () => assert.fail('no save before authorization'), download: async () => assert.fail('no download before authorization') })
  prepareSaved(page); wx.needAuthorization()
  const pending = page.saveVideo(); await flush()
  page.cancelPrivacyAuthorization(); await pending
  assert.equal(calls.album.length, 0); assert.equal(page._saving, false)
})
test('privacy guide is reachable from existing theme action sheet without changing theme', async () => {
  const { page, wx, calls } = harness(); let opened = 0
  wx.openPrivacyContract = o => { opened++; o.success() }
  page.switchTheme(); assert.equal(calls.sheet.itemList[3], '隐私保护指引')
  await calls.sheet.success({ tapIndex: 3 }); assert.equal(opened, 1)
})

test('first home display without a logged-in user does not initiate profile collection', () => {
  // Theme values are unrelated to privacy; install them in this test's app via a dedicated loader.
  let definition
  const app = { api: { getUser: () => null }, getUserTheme: () => 'auto', getThemeColors: () => ({ pageBg: '#fff' }) }
  const wx = { ...privacyWx(), hideLoading() {} }
  vm.runInNewContext(source, { Page: value => { definition = value }, getApp: () => app, wx, require: name => name.endsWith('/api') ? require('../utils/api') : loadPrivacy(wx), clearTimeout() {} })
  const cold = { ...definition, data: JSON.parse(JSON.stringify(definition.data)), setData(v) { Object.assign(this.data, v) }, applyNavBarColor() {}, syncThemeLabel() {} }
  cold.onShow()
  assert.equal(cold.data.profile.name, '篮球爱好者'); assert.equal(cold._projectId, null)
})

for (const order of ['hide-success-show', 'hide-show-success']) {
  test(`native picker ${order} uploads exactly once only after return to the original page`, async () => {
    const uploads = []
    const h = harness({ upload: async (route, file) => { uploads.push(file); return project } })
    await h.page.uploadLocalVideo()
    const ticket = h.page._videoPicker, choose = h.calls.choose
    assert.equal(ticket.owner, '7'); assert.equal(ticket.page, h.page)
    assert.equal(choose.compressed, undefined, 'keep WeChat default compression unchanged')
    h.page.onHide()
    assert.equal(h.page._videoPicker, ticket)
    if (order === 'hide-success-show') {
      await choose.success({ tempFilePath: '/tmp/selected.mp4' })
      assert.equal(ticket.stage, 'ready'); assert.deepEqual(uploads, [])
      await h.page.onShow()
    } else {
      await h.page.onShow()
      assert.equal(ticket.stage, 'selecting'); assert.deepEqual(uploads, [])
      assert.equal(h.calls.loadingTitles.at(-1), '视频选择处理中...')
      await h.page.uploadLocalVideo(); assert.equal(h.calls.choose, choose)
      await choose.success({ tempFilePath: '/tmp/selected.mp4' })
    }
    await choose.success({ tempFilePath: '/tmp/duplicate.mp4' })
    assert.deepEqual(uploads, ['/tmp/selected.mp4'])
    assert.equal(h.page.data.videoName, 'selected.mp4'); assert.equal(h.page._videoPicker, null)
    assert.equal(h.page._projectId, 10)
    assert.ok(h.calls.loadingTitles.includes('上传视频中...'))
    assert.equal(h.calls.loading, 0)
  })
}
test('picker fixes identity with real login before invoking the native selector', async () => {
  let user = null, finishLogin
  const h = harness({ getUser: () => user, ensureLogin: () => new Promise(resolve => { finishLogin = () => { user = { id: 9 }; resolve(user) } }) })
  const opening = h.page.uploadLocalVideo(); await flush()
  assert.equal(h.calls.choose, undefined)
  finishLogin(); await opening
  assert.equal(h.page._videoPicker.owner, '9'); assert.equal(h.page._owner, '9')
  h.calls.choose.fail({ errMsg: 'chooseVideo:fail cancel' })
})
test('old profile response/failure cannot reset a live picker on native return', async () => {
  for (const outcome of ['resolve', 'reject']) {
    let finishProfile
    const h = harness({ get: () => new Promise((resolve, reject) => { finishProfile = () => outcome === 'resolve' ? resolve({ id: 99 }) : reject(new Error('old profile failure')) }),
      upload: async () => project })
    const profile = h.page.loadProfile()
    await h.page.uploadLocalVideo(); const ticket = h.page._videoPicker
    finishProfile(); await profile
    assert.equal(h.page._videoPicker, ticket)
    h.page.onHide(); await h.page.onShow()
    assert.equal(h.page._videoPicker, ticket)
    await h.calls.choose.success({ tempFilePath: '/tmp/returned.mp4' })
    assert.equal(h.page._projectId, 10)
  }
})
for (const action of ['cancel', 'unload', 'reset', 'navigation', 'ownerchange', 'logout', 'same-user-new-session']) {
  test(`picker ${action} invalidates stored results and late callbacks`, async () => {
    let user = { id: 7 }, uploads = 0
    const h = harness({ getUser: () => user, ensureLogin: async () => user,
      get: async () => user, upload: async () => { uploads++; return project } })
    await h.page.uploadLocalVideo(); const choose = h.calls.choose
    h.page.onHide()
    if (action === 'cancel') choose.fail({ errMsg: 'chooseVideo:fail cancel' })
    if (action === 'unload') h.page.onUnload()
    if (action === 'reset') h.page.resetVideo()
    if (action === 'navigation') h.page.goChat()
    if (action === 'ownerchange') user = { id: 8 }
    if (action === 'logout') user = null
    if (action === 'same-user-new-session') user = { id: 7 }
    await choose.success({ tempFilePath: '/tmp/stale.mp4' })
    if (action !== 'unload') await h.page.onShow()
    await flush()
    assert.equal(uploads, 0); assert.equal(h.page._videoPicker, null)
    assert.equal(h.page.data.videoName, '')
    if (action === 'cancel') assert.equal(h.calls.toast.length, 0)
  })
}
test('reset after a hidden success deletes the parked file instead of uploading it on show', async () => {
  const h = harness({ upload: async () => assert.fail('reset result must not upload') })
  await h.page.uploadLocalVideo(); h.page.onHide()
  await h.calls.choose.success({ tempFilePath: '/tmp/parked.mp4' })
  const ticket = h.page._videoPicker
  h.page.resetVideo(); assert.equal(ticket.filePath, null)
  await h.page.onShow()
  assert.equal(h.page.data.videoName, '')
})
test('a different top Page, even with the same route, cannot consume a picker result', async () => {
  const h = harness({ upload: async () => assert.fail('other page must not upload') })
  await h.page.uploadLocalVideo()
  h.setStack([{ route: 'pages/index/index' }]); h.page.onHide()
  await h.calls.choose.success({ tempFilePath: '/tmp/other-page.mp4' })
  h.setStack([h.page]); await h.page.onShow()
  assert.equal(h.page._videoPicker, null); assert.equal(h.page.data.videoName, '')
})
test('late callbacks from cancelled picker A do not cancel or consume current picker B', async () => {
  let uploads = 0
  const h = harness({ upload: async () => { uploads++; return project } })
  await h.page.uploadLocalVideo(); const a = h.calls.choose
  a.fail({ errMsg: 'chooseVideo:fail cancel' })
  await h.page.uploadLocalVideo(); const b = h.calls.choose, ticket = h.page._videoPicker
  await a.success({ tempFilePath: '/tmp/old.mp4' }); a.fail({ errMsg: 'chooseVideo:fail' })
  assert.equal(h.page._videoPicker, ticket)
  h.page.onHide(); await b.success({ tempFilePath: '/tmp/new.mp4' })
  b.fail({ errMsg: 'chooseVideo:fail duplicate' })
  assert.equal(ticket.stage, 'ready', 'a duplicate terminal callback must not delete the first result')
  await h.page.onShow(); assert.equal(uploads, 1); assert.equal(h.page.data.videoName, 'new.mp4')
})
for (const result of ['no-file', 'real-failure', 'sync-throw']) {
  test(`picker ${result} gives explicit feedback and releases its ticket`, async () => {
    const h = harness({ upload: async () => assert.fail('invalid result cannot upload') })
    if (result === 'sync-throw') h.wx.chooseVideo = () => { throw new Error('native failure') }
    await h.page.uploadLocalVideo()
    if (result !== 'sync-throw') {
      h.page.onHide()
      if (result === 'no-file') await h.calls.choose.success({})
      else h.calls.choose.fail({ errMsg: 'chooseVideo:fail unknown native error' })
      assert.equal(h.calls.toast.length, 0)
      await h.page.onShow()
    }
    assert.match(h.calls.toast.at(-1).title, /失败|未获取到视频/)
    assert.equal(h.page._videoPicker, null); assert.equal(h.calls.loading, 0)
  })
}
test('picker login failure reports an error without invoking chooseVideo', async () => {
  const h = harness({ ensureLogin: async () => { throw new Error('微信登录失败，请重试') } })
  await h.page.uploadLocalVideo()
  assert.equal(h.calls.choose, undefined); assert.equal(h.page._openingVideoPicker, false)
  assert.equal(h.calls.toast.at(-1).title, '微信登录失败，请重试')
})
test('video upload HTML 413 remains an explicit size error after native picker return', async () => {
  const { createApiClient } = require('../utils/api')
  const user = { id: 7 }
  const client = createApiClient({ getStorageSync: () => ({ token: 'test-fixture', user }), setStorageSync() {},
    request(o) { o.success({ statusCode: 200, data: { code: 0, data: user } }); return {} },
    uploadFile(o) { o.success({ statusCode: 413, data: '<html>PRIVATE_NGINX_413</html>' }); return {} } })
  await client.ensureLogin()
  const h = harness(client)
  await h.page.uploadLocalVideo(); h.page.onHide()
  await h.calls.choose.success({ tempFilePath: '/tmp/large.mp4' })
  await h.page.onShow()
  assert.equal(h.page.data.videoName, 'large.mp4')
  assert.equal(h.page._projectId, null); assert.equal(h.page.data.clips.length, 0)
  assert.match(h.calls.toast.at(-1).title, /文件过大.*413/)
  assert.equal(JSON.stringify(h.calls.toast).includes('PRIVATE_NGINX'), false)
  assert.equal(h.calls.loading, 0); assert.equal(h.page._busy, false)
})

for (const size of [1073741825, 1728121019]) {
  test(`selected ${size}-byte video is blocked locally without upload`, async () => {
    const h = harness({ upload: async () => assert.fail('oversized video must not leave device') })
    h.wx.getFileSystemManager = () => assert.fail('known size does not require another file read')
    await h.page.uploadLocalVideo(); h.page.onHide()
    await h.calls.choose.success({ tempFilePath: '/tmp/oversized.mp4', size })
    assert.equal(h.calls.toast.length, 0)
    await h.page.onShow()
    assert.equal(h.calls.toast.at(-1).title, '视频超过1GiB，请截取较短片段后重试')
    assert.equal(h.page.data.videoName, 'oversized.mp4'); assert.equal(h.page._projectId, null)
    assert.equal(h.page._busy, false); assert.equal(h.calls.loading, 0)
    assert.equal(h.calls.loadingTitles.includes('上传视频中...'), false)
  })
}
test('exactly 1GiB is accepted; maxDuration is not used as an album duration limit', async () => {
  let uploads = 0
  const h = harness({ upload: async () => { uploads++; return project } })
  h.wx.getFileSystemManager = () => assert.fail('known size does not need stat')
  await h.page.uploadLocalVideo()
  await h.calls.choose.success({ tempFilePath: '/tmp/boundary.mp4', size: 1073741824, duration: 600 })
  assert.equal(uploads, 1)
  assert.equal(h.calls.choose.maxDuration, 60, 'preserve camera recording configuration')
  assert.equal(h.calls.choose.compressed, undefined)
})
test('missing picker size uses only authorized local FS stat path with official result shape', async () => {
  let reads = 0, uploads = 0
  const h = harness({ upload: async () => { uploads++; return project } })
  h.wx.getFileSystemManager = () => ({ stat(o) {
    reads++; assert.equal(o.path, '/tmp/stat.mp4'); assert.equal(o.recursive, false)
    o.success({ stats: { size: 1024, isFile: () => true, isDirectory: () => false } })
  } })
  assert.equal(reads, 0)
  await h.page.uploadLocalVideo(); h.page.onHide()
  await h.calls.choose.success({ tempFilePath: '/tmp/stat.mp4' })
  assert.equal(reads, 0); assert.equal(uploads, 0)
  await h.page.onShow(); assert.equal(reads, 1); assert.equal(uploads, 1)
})
test('FS stat detects an oversized file when picker omitted its size', async () => {
  const h = harness({ upload: async () => assert.fail('oversize fallback must not upload') })
  h.wx.getFileSystemManager = () => ({ stat(o) { o.success({ stats: { size: 1728121019, isFile: () => true } }) } })
  await h.page.uploadLocalVideo(); await h.calls.choose.success({ tempFilePath: '/tmp/large-stat.mp4' })
  assert.equal(h.calls.toast.at(-1).title, '视频超过1GiB，请截取较短片段后重试')
})
for (const kind of ['missing-manager', 'missing-stat', 'fail', 'throw', 'wrong-shape', 'directory', 'invalid-size', 'zero']) {
  test(`file size ${kind} cannot silently bypass the upload size check`, async () => {
    const h = harness({ upload: async () => assert.fail('unverified/empty video must not upload') })
    if (kind === 'missing-manager') delete h.wx.getFileSystemManager
    else h.wx.getFileSystemManager = () => kind === 'missing-stat' ? {} : ({ stat(o) {
      if (kind === 'fail') { o.fail({ errMsg: 'PRIVATE_LOCAL_PATH' }); return }
      if (kind === 'throw') throw new Error('PRIVATE_LOCAL_PATH')
      if (kind === 'wrong-shape') { o.success({ size: 42 }); return }
      o.success({ stats: { size: kind === 'invalid-size' ? NaN : kind === 'zero' ? 0 : 1024, isFile: () => kind !== 'directory' } })
    } })
    await h.page.uploadLocalVideo(); await h.calls.choose.success({ tempFilePath: '/tmp/unknown-size.mp4' })
    assert.match(h.calls.toast.at(-1).title, /无法确认视频大小|视频文件为空/)
    assert.equal(JSON.stringify(h.calls.toast).includes('PRIVATE_LOCAL_PATH'), false)
    assert.equal(h.page._busy, false); assert.equal(h.calls.loading, 0)
  })
}
for (const action of ['hide', 'reset', 'ownerchange']) {
  test(`${action} during file stat prevents a late metadata response from starting upload`, async () => {
    let user = { id: 7 }, stat
    const h = harness({ getUser: () => user, ensureLogin: async () => user, upload: async () => assert.fail('stale metadata must not upload') })
    h.wx.getFileSystemManager = () => ({ stat(o) { stat = o } })
    await h.page.uploadLocalVideo()
    const pending = h.calls.choose.success({ tempFilePath: '/tmp/pending-stat.mp4' }); await flush()
    if (action === 'hide') h.page.onHide()
    if (action === 'reset') h.page.resetVideo()
    if (action === 'ownerchange') user = { id: 8 }
    stat.success({ stats: { size: 1024, isFile: () => true } }); await pending
    assert.equal(h.page._projectId, null)
  })
}

const sourceError = page => ({ currentTarget: { dataset: { key: page.data.playerSources[0].key } }, detail: { errMsg: project.videoUrl } })
const failedSource = { ...project, status: 'FAILED', clips: [] }

for (const status of ['QUEUED', 'RUNNING']) {
  test(`${status} cloud source mounts a real signed player while analysis remains pending without a mask`, async () => {
    const reads = []
    const h = harness({ get: async route => { reads.push(route); return route.includes('?') ? [] : { ...project, status } },
      post: async () => assert.fail('preview must never submit analysis'), download: async () => assert.fail('preview must stream, not download') })
    const work = h.page.openCloudProject(project)
    await flush()
    assert.equal(h.page.data.playerSources.length, 1)
    assert.equal(h.page.data.playerSources[0].url, project.videoUrl)
    assert.equal(h.page._pending.type, 'analysis')
    assert.equal(h.calls.loading, 0)
    await h.page.useCloudVideo()
    assert.equal(h.page.data.libraryVisible, true)
    assert.ok(reads.includes(`${base}?limit=10`))
    h.page.resetVideo(); await work
    assert.equal(h.timers.size, 0)
  })
}

test('upload response unlocks playback before queued analysis completes and exposes local selection first', async () => {
  let finishUpload
  const h = harness({ upload: () => new Promise(resolve => { finishUpload = resolve }), get: async () => ({ ...project, status: 'QUEUED' }) })
  await h.page.uploadLocalVideo()
  const work = h.calls.choose.success({ tempFilePath: '/tmp/selected.mp4', size: 100 })
  await flush()
  assert.equal(h.page.data.playerSources[0].url, '/tmp/selected.mp4')
  await h.page.useCloudVideo(); assert.equal(h.page.data.libraryVisible, false)
  finishUpload({ ...project, status: 'QUEUED' }); await flush()
  assert.equal(h.calls.loading, 0)
  assert.equal(h.page.data.playerSources[0].url, project.videoUrl)
  assert.equal(h.page._pending.type, 'analysis')
  h.page.onHide(); await work
})

test('FAILED preview and its explicit signed-link refresh only GET the owned project, once per retry', async () => {
  let reads = 0
  const h = harness({ get: async route => { assert.equal(route, `${base}/10`); reads++; return { ...failedSource, videoUrl: project.videoUrl.replace('1999999999', String(1999999999 + reads)) } },
    post: async () => assert.fail('FAILED preview must not POST'), download: async () => assert.fail('no download') })
  await h.page.openCloudProject(failedSource)
  assert.equal(h.page._pending, null)
  assert.equal(h.page.data.sourceStatus, '分析失败 · 仍可看原片')
  const first = h.page.data.playerSources[0]
  const oldEvent = sourceError(h.page)
  h.page.onSourceError(oldEvent)
  assert.equal(reads, 1); assert.equal(h.page.data.playerSources.length, 0)
  await Promise.all([h.page.retrySource(), h.page.retrySource()])
  assert.equal(reads, 2); assert.notEqual(h.page.data.playerSources[0].url, first.url)
  h.page.onSourceError(oldEvent)
  assert.equal(h.page.data.playerSources.length, 1, 'old native error cannot remove new player')
  h.page.onSourceError(sourceError(h.page)); await h.page.retrySource()
  assert.equal(reads, 2); assert.equal(h.page.data.playerCanRetry, false)
  assert.doesNotMatch(h.page.data.playerError, /sig=|https:/)
})

for (const action of ['reset', 'hide', 'unload', 'ownerchange', 'logout', 'same-user-new-session']) {
  test(`source ${action} destroys the player and isolates a delayed signed refresh`, async () => {
    let user = { id: 7 }, finish, reads = 0
    const h = harness({ getUser: () => user, ensureLogin: async () => user,
      get: async () => ++reads === 1 ? failedSource : new Promise(resolve => { finish = resolve }) })
    let stopped = 0
    h.wx.createVideoContext = () => ({ stop() { stopped++ } })
    await h.page.openCloudProject(failedSource)
    // A refresh may happen while the existing source is still mounted.
    const pending = h.page.refreshSource(h.page._preview)
    if (action === 'reset') h.page.resetVideo()
    if (action === 'hide') h.page.onHide()
    if (action === 'unload') h.page.onUnload()
    if (action === 'ownerchange') user = { id: 8 }
    if (action === 'logout') user = null
    if (action === 'same-user-new-session') user = { id: 7 }
    if (action.includes('session') || action === 'ownerchange' || action === 'logout') h.page.checkClipAccount()
    finish(failedSource); await pending
    assert.equal(stopped, 1)
    assert.equal(h.page.data.playerSources.length, 0)
    assert.equal(h.page._preview, null)
    assert.equal(h.page.data.playerError, '')
    assert.equal(h.page.data.playerLoading, false)
  })
}

test('slow selection A cannot overwrite newer B or surface an old error', async () => {
  for (const rejectOld of [false, true]) {
    let finish, reject
    const h = harness({ get: async route => route.endsWith('/10') ? new Promise((yes, no) => { finish = yes; reject = no }) : { ...failedSource, id: 11 } })
    const a = h.page.openCloudProject(project); await flush()
    await h.page.openCloudProject({ id: 11 })
    const b = h.page.data.playerSources[0].key
    if (rejectOld) reject(new Error(project.videoUrl)); else finish(project)
    await a
    assert.equal(h.page._projectId, 11); assert.equal(h.page.data.playerSources[0].key, b)
    assert.equal(h.page.data.playerError, ''); assert.equal(h.page.data.clips.length, 0)
  }
})

test('switching project during analysis invalidates the old in-flight poll', async () => {
  let finish, reads = 0
  const h = harness({ get: async route => route.endsWith('/11') ? { ...failedSource, id: 11 } : ++reads === 1 ? { ...project, status: 'RUNNING' } : new Promise(resolve => { finish = resolve }) })
  const a = h.page.openCloudProject(project); await h.tick()
  assert.equal(typeof finish, 'function')
  await h.page.openCloudProject({ id: 11 })
  finish(project); await a
  assert.equal(h.page._projectId, 11); assert.equal(h.page.data.clips.length, 0)
  assert.equal(h.page.data.sourceStatus, '分析失败 · 仍可看原片')
  assert.equal(h.page.data.playerSources.length, 1)
})

for (const url of ['https://api.lanxin.cyou/media/video/public.mp4', 'https://other.example/video.mp4', 'https://api.lanxin.cyou/media/image/a.png', null]) {
  test(`source URL validation rejects ${url || 'missing URL'} without exposing it or POSTing`, async () => {
    let reads = 0
    const h = harness({ get: async () => { reads++; return { ...failedSource, videoUrl: url } }, post: async () => assert.fail('no POST') })
    await h.page.openCloudProject(project)
    assert.equal(h.page.data.playerSources.length, 0)
    assert.equal(h.page.data.playerCanRetry, true)
    await h.page.retrySource(); await h.page.retrySource()
    assert.equal(reads, 2); assert.equal(h.page.data.playerCanRetry, false)
    assert.doesNotMatch(h.page.data.playerError, /https:|sig=/)
  })
}

test('history uses cursor pagination, Chinese metadata and no embedded media or render URL retention', async () => {
  const routes = []
  const rows = Array.from({ length: 10 }, (_, i) => ({ ...project, id: 30 - i, createdMs: new Date(2026, 8, 16, 9, 5).getTime(), durationMs: i ? null : 65000, status: i ? 'QUEUED' : 'FAILED', renders: [rendered] }))
  const h = harness({ get: async route => { routes.push(route); return routes.length === 1 ? rows : [] }, download: async () => assert.fail('no eager downloads') })
  await h.page.useCloudVideo()
  assert.equal(h.calls.sheet, undefined); assert.equal(h.page.data.playerSources.length, 0)
  assert.equal(h.page.data.libraryItems[0].dateLabel, '2026年9月16日 09:05')
  assert.equal(h.page.data.libraryItems[0].durationLabel, '1分05秒')
  assert.equal(h.page.data.libraryItems[1].durationLabel, '时长待获取')
  assert.equal(h.page.data.libraryItems[0].statusLabel, '分析失败 · 仍可看原片')
  assert.doesNotMatch(JSON.stringify(h.page.data.libraryItems), /videoUrl|renders|sig=|https:/)
  await h.page.loadVideoLibrary()
  assert.deepEqual(routes, [`${base}?limit=10`, `${base}?limit=10&beforeId=21`])
  assert.equal(h.page.data.libraryMore, false); assert.equal(h.page.data.libraryItems.length, 10)
})

test('history empty and malformed/error responses release loading and permit explicit retry', async () => {
  let reads = 0
  const h = harness({ get: async () => { reads++; if (reads === 1) throw new Error(project.videoUrl); if (reads === 2) return {}; return [] } })
  await h.page.useCloudVideo()
  assert.equal(h.page.data.libraryLoading, false); assert.ok(h.page.data.libraryError)
  assert.doesNotMatch(h.page.data.libraryError, /sig=|https:/)
  await h.page.loadVideoLibrary(); assert.ok(h.page.data.libraryError)
  await h.page.loadVideoLibrary()
  assert.equal(h.page.data.libraryError, ''); assert.equal(h.page.data.libraryItems.length, 0)
  assert.equal(h.page.data.libraryMore, false)
})

test('pagination errors keep metadata and retry the same cursor', async () => {
  const routes = []
  const rows = Array.from({ length: 10 }, (_, i) => ({ ...project, id: 30 - i }))
  const h = harness({ get: async route => { routes.push(route); if (routes.length === 1) return rows; if (routes.length === 2) throw new Error('network'); return [{ ...project, id: 20 }] } })
  await h.page.useCloudVideo(); await h.page.loadVideoLibrary()
  assert.equal(h.page.data.libraryItems.length, 10); assert.ok(h.page.data.libraryError)
  await h.page.loadVideoLibrary()
  assert.equal(h.page.data.libraryItems.length, 11); assert.equal(routes[1], routes[2]); assert.equal(h.page.data.libraryMore, false)
})

for (const action of ['cancel', 'hide', 'reset', 'ownerchange', 'same-user-new-session']) {
  test(`history ${action} ignores delayed rows and delayed errors`, async () => {
    for (const fail of [false, true]) {
      let user = { id: 7 }, finish, reject
      const h = harness({ getUser: () => user, ensureLogin: async () => user, get: () => new Promise((yes, no) => { finish = yes; reject = no }) })
      const pending = h.page.useCloudVideo(); await flush()
      if (action === 'cancel') h.page.closeVideoLibrary()
      if (action === 'hide') h.page.onHide()
      if (action === 'reset') h.page.resetVideo()
      if (action === 'ownerchange') user = { id: 8 }
      if (action === 'same-user-new-session') user = { id: 7 }
      if (fail) reject(new Error(project.videoUrl)); else finish([project])
      await pending
      assert.equal(h.page.data.libraryItems.length, 0); assert.equal(h.page.data.libraryError, '')
      assert.equal(h.page.data.libraryVisible, false); assert.equal(h.page.data.libraryLoading, false)
    }
  })
}

test('native source widget has controls, fullscreen, seeking, one keyed node and no fabricated thumbnail', () => {
  const markup = fs.readFileSync(path.join(__dirname, '../pages/index/index.wxml'), 'utf8')
  assert.equal((markup.match(/<video\s/g) || []).length, 1)
  for (const attr of ['controls', 'show-fullscreen-btn', 'enable-progress-gesture']) assert.ok(markup.includes(`${attr}="{{ true }}"`))
  assert.match(markup, /wx:for="\{\{ playerSources \}\}" wx:key="key"/)
  assert.doesNotMatch(markup, /\bposter=/)
  assert.doesNotMatch(source, /toLocaleString|\/analyze/)
})

test('uploaded original remains playable when queued analysis later fails without reanalysis', async () => {
  let reads = 0
  const h = harness({ upload: async () => ({ ...project, status: 'QUEUED' }), get: async () => ++reads === 1 ? { ...project, status: 'QUEUED' } : failedSource,
    post: async () => assert.fail('analysis failure must not retry POST') })
  await h.page.uploadLocalVideo()
  const work = h.calls.choose.success({ tempFilePath: '/tmp/a.mp4', size: 100 })
  await h.tick(); await work
  assert.equal(h.page.data.playerSources[0].url, project.videoUrl)
  assert.equal(h.page.data.sourceStatus, '分析失败 · 仍可看原片')
  assert.equal(h.calls.loading, 0); assert.equal(h.page._pending, null)
})

test('history selection fetches only the chosen owned URL and returning after hide requires a fresh URL', async () => {
  const routes = []
  const h = harness({ get: async route => { routes.push(route); return route.includes('?') ? [{ ...failedSource, videoUrl: 'DO_NOT_USE_HISTORY_URL' }] : { ...failedSource, videoUrl: project.videoUrl.replace('1999999999', String(1999999999 + routes.length)) } } })
  await h.page.useCloudVideo()
  await h.page.selectCloudVideo({ currentTarget: { dataset: { id: 10 } } })
  const first = h.page.data.playerSources[0].url
  assert.deepEqual(routes, [`${base}?limit=10`, `${base}/10`])
  h.page.onHide()
  assert.equal(h.page.data.playerSources.length, 0)
  assert.equal(h.page.data.libraryItems.length, 0)
  h.page._visible = true
  await h.page.reopenSource()
  assert.equal(routes.at(-1), `${base}/10`)
  assert.notEqual(h.page.data.playerSources[0].url, first)
})

test('upload failure leaves an authorized local player with accurate status instead of perpetual uploading', async () => {
  const h = harness({ upload: async () => { throw new Error('network') } })
  await h.page.uploadLocalVideo(); await h.calls.choose.success({ tempFilePath: '/tmp/a.mp4', size: 100 })
  assert.equal(h.page.data.playerSources[0].url, '/tmp/a.mp4')
  assert.equal(h.page.data.sourceStatus, '上传未完成 · 可查看本地原片')
  assert.equal(h.calls.loading, 0)
})

test('real native metadata and progress are accepted only for the current player key', () => {
  const h = harness(), ticket = h.page.newPreview(10)
  h.page.mountSource(ticket, project.videoUrl)
  const event = detail => ({ currentTarget:{dataset:{key:ticket.key}}, detail })
  h.page.onSourceMetadata(event({duration:63.8}))
  assert.equal(h.page.data.sourceDuration, '1分03秒')
  assert.equal(ticket.metadataLoaded, true)
  h.page.onSourcePlay(event({})); assert.equal(ticket.playing, true)
  h.page.onSourceTimeUpdate(event({currentTime:1.5})); assert.equal(ticket.currentTime, 1.5)
  h.page.onSourcePause(event({})); assert.equal(ticket.playing, false)
  h.page.onSourceEnded(event({})); assert.equal(ticket.ended, true)
  assert.equal('currentTime' in h.page.data, false, 'progress is memory only, not repeatedly copied into view data')
})

test('late or malformed native events cannot update another video or a hidden page', () => {
  const h = harness(), old = h.page.newPreview(10)
  h.page.mountSource(old, project.videoUrl)
  const oldEvent = {currentTarget:{dataset:{key:old.key}},detail:{duration:90,currentTime:55}}
  const current = h.page.newPreview(11); h.page.mountSource(current, project.videoUrl)
  h.page.onSourceMetadata(oldEvent); h.page.onSourceTimeUpdate(oldEvent); h.page.onSourcePlay(oldEvent)
  assert.equal(current.metadataLoaded, undefined); assert.equal(current.currentTime, undefined); assert.equal(current.playing, undefined)
  h.page.onSourceMetadata({currentTarget:{dataset:{key:current.key}},detail:{duration:'bad'}})
  assert.equal(current.metadataLoaded, undefined)
  h.page.onHide()
  h.page.onSourceMetadata({currentTarget:{dataset:{key:current.key}},detail:{duration:90}})
  assert.equal(h.page.data.playerSources.length, 0); assert.equal(h.page._preview, null)
})

test('cloud opening and selecting focus the requested section after rendering without background scrolling', async () => {
  const h = harness({get:async route => route.includes('?') ? [failedSource] : failedSource}), moves=[]
  h.wx.pageScrollTo = options => moves.push(options.selector)
  const original = h.page.setData
  h.page.setData = function(patch, callback){ original.call(this,patch); if(callback)callback() }
  await h.page.useCloudVideo()
  assert.equal(moves.at(-1), '.video-library')
  await h.page.selectCloudVideo({currentTarget:{dataset:{id:10}}})
  assert.equal(moves.at(-1), '.source-video-card')
  const count = moves.length; h.page.onHide(); h.page.scrollVideoSection('.source-video-card')
  assert.equal(moves.length, count)
})

test('analysis updates existing library metadata without copying private playback URLs', () => {
  const h = harness()
  h.page.setData({libraryItems:[{id:10,statusLabel:'等待分析'}]})
  h.page.syncLibraryItem({...project,createdMs:1000,durationMs:3000,videoUrl:'SIGNED_PRIVATE',renders:[{videoUrl:'PRIVATE'}]})
  assert.equal(h.page.data.libraryItems[0].statusLabel, '分析完成')
  assert.equal(h.page.data.libraryItems[0].durationLabel, '0分03秒')
  assert.equal(JSON.stringify(h.page.data.libraryItems).includes('PRIVATE'), false)
})

// ===== 片段预览与集锦播放（在小程序内直接观看，不必先保存到相册） =====
const timedClip = { ...clip, time: '00:41', startMs: 36625, endMs: 44625 }
const timedProject = { ...project, clips: [timedClip] }
const tapClip = index => ({ currentTarget: { dataset: { index } } })
function recordingContexts(h) {
  const actions = []
  h.wx.createVideoContext = id => ({ seek: value => actions.push(['seek', id, value]), play: () => actions.push(['play', id]),
    pause: () => actions.push(['pause', id]), stop: () => actions.push(['stop', id]) })
  return actions
}
const playerEvent = (h, detail) => ({ currentTarget: { dataset: { key: h.page.data.playerSources[0].key } }, detail })

test('clip preview plays only the chosen range on the owned source player without POST or download', async () => {
  const reads = []
  const h = harness({ get: async route => { reads.push(route); return route === '/api/auth/me' ? { id: 7 } : timedProject },
    post: async () => assert.fail('preview must never POST'), download: async () => assert.fail('preview must stream, not download') })
  const actions = recordingContexts(h)
  await h.page.openCloudProject(project)
  assert.deepEqual(JSON.parse(JSON.stringify(h.page.data.clips)), [{ ...timedClip, selected: false }])
  await h.page.previewClip(tapClip(0))
  const id = `source-video-${h.page.data.playerSources[0].key}`
  assert.equal(h.page.data.previewClipId, '1'); assert.match(h.page.data.previewClipLabel, /00:41/)
  assert.deepEqual(actions, [], 'nothing is sought before the player reports metadata')
  h.page.onSourceMetadata(playerEvent(h, { duration: 251.25 }))
  assert.deepEqual(actions, [['seek', id, 36.625], ['play', id]])
  h.page.onSourceTimeUpdate(playerEvent(h, { currentTime: 40 }))
  assert.equal(h.page.data.previewClipId, '1')
  h.page.onSourceTimeUpdate(playerEvent(h, { currentTime: 44.7 }))
  assert.deepEqual(actions.at(-1), ['pause', id])
  assert.equal(h.page.data.previewClipId, null); assert.equal(h.page.data.previewClipLabel, '')
  h.page.onSourceTimeUpdate(playerEvent(h, { currentTime: 60 }))
  assert.equal(actions.filter(a => a[0] === 'pause').length, 1, 'normal playback after a preview is never paused again')
  const before = reads.length
  await h.page.previewClip(tapClip(0))
  assert.equal(reads.length, before, 'a mounted owned player is reused without another request')
  assert.deepEqual(actions.slice(-2), [['seek', id, 36.625], ['play', id]])
  assert.equal(h.page.data.selectedCount, 0, 'previewing never toggles the selection')
})

test('clip preview without a usable range or project only explains itself', async () => {
  const h = harness({ get: async route => route === '/api/auth/me' ? { id: 7 } : { ...project, clips: [clip] } })
  const actions = recordingContexts(h)
  await h.page.openCloudProject(project)
  await h.page.previewClip(tapClip(0))
  assert.equal(h.calls.toast.at(-1).title, '该片段暂时无法预览')
  await h.page.previewClip(tapClip(5))
  assert.deepEqual(actions, []); assert.equal(h.page.data.previewClipId, null)
})

test('clip preview remounts the source when the player was closed, and reset or account change cancels it', async () => {
  const h = harness({ get: async route => route === '/api/auth/me' ? { id: 7 } : timedProject })
  const actions = recordingContexts(h)
  await h.page.openCloudProject(project)
  h.page.destroyPlayer()
  assert.equal(h.page.data.playerSources.length, 0)
  await h.page.previewClip(tapClip(0))
  assert.equal(h.page.data.playerSources[0].url, project.videoUrl)
  h.page.onSourceMetadata(playerEvent(h, { duration: 251.25 }))
  assert.equal(actions.filter(a => a[0] === 'seek').length, 1)
  h.page.resetVideo()
  assert.equal(h.page.data.previewClipId, null); assert.equal(h.page._clipPreview, null)
})

test('generated highlight plays in the same player from a fresh owned URL and can return to the source', async () => {
  const reads = []
  const signedRender = 'https://api.lanxin.cyou/media/video/comptrain_render.mp4?exp=1999999999&sig=' + 'b'.repeat(64)
  const h = harness({ post: async () => rendered, download: async () => assert.fail('in-app playback must not download'),
    get: async route => { reads.push(route); return route === '/api/auth/me' ? { id: 7 } : route.includes('/render/') ? { ...rendered, videoUrl: signedRender } : timedProject } })
  recordingContexts(h)
  await h.page.openCloudProject(project)
  h.page.toggleClip(tapClip(0)); await h.page.generateWithAI()
  assert.equal(h.page.data.videoGenerated, true)
  await h.page.playRender()
  assert.equal(h.page.data.playerMode, 'render')
  assert.equal(h.page.data.playerSources[0].url, signedRender)
  assert.equal(h.page.data.sourceStatus, '已生成的集锦')
  assert.ok(reads.includes(`${base}/10/render/render-1`))
  assert.equal(h.page._render.videoUrl, undefined, 'signed URLs are never retained in render metadata')
  await h.page.reopenSource()
  assert.equal(h.page.data.playerMode, 'source'); assert.equal(h.page.data.playerSources[0].url, project.videoUrl)
  await h.page.playRender()
  h.page.toggleClip(tapClip(0))
  assert.equal(h.page.data.playerSources.length, 0, 'changing the selection discards the outdated highlight player')
  assert.equal(h.page.data.playerMode, 'source'); assert.equal(h.page.data.videoGenerated, false)
  await h.page.playRender()
  assert.equal(h.page.data.playerSources.length, 0, 'no highlight, nothing to play')
})

test('highlight playback failure allows one explicit refresh and never loops', async () => {
  let renderReads = 0
  const signedUrl = 'https://api.lanxin.cyou/media/video/comptrain_render.mp4?exp=1999999999&sig=' + 'c'.repeat(64)
  const h = harness({ post: async () => rendered,
    get: async route => { if (route === '/api/auth/me') return { id: 7 }; if (!route.includes('/render/')) return timedProject
      renderReads++; if (renderReads === 1) throw new Error('expired'); return { ...rendered, videoUrl: signedUrl } } })
  recordingContexts(h)
  await h.page.openCloudProject(project)
  h.page.toggleClip(tapClip(0)); await h.page.generateWithAI()
  const afterGenerate = renderReads
  await h.page.playRender()
  assert.equal(h.page.data.playerSources.length, 0)
  assert.equal(h.page.data.playerError, '集锦暂不可用，可刷新播放链接重试'); assert.equal(h.page.data.playerCanRetry, true)
  await h.page.retrySource()
  assert.equal(h.page.data.playerSources[0].url, signedUrl); assert.equal(h.page.data.playerMode, 'render')
  h.page.onSourceError(playerEvent(h, {}))
  assert.equal(h.page.data.playerCanRetry, false, 'only one refresh per opened highlight')
  assert.equal(renderReads, afterGenerate + 2)
})

test('an unsigned highlight address is never mounted in the player', async () => {
  const h = harness({ post: async () => rendered, get: async route => route === '/api/auth/me' ? { id: 7 } : route.includes('/render/') ? rendered : timedProject })
  recordingContexts(h)
  await h.page.openCloudProject(project)
  h.page.toggleClip(tapClip(0)); await h.page.generateWithAI()
  await h.page.playRender()
  assert.equal(h.page.data.playerSources.length, 0)
  assert.equal(h.page.data.playerError, '集锦暂不可用，可刷新播放链接重试')
})
