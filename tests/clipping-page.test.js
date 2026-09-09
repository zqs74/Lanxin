const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const source = fs.readFileSync(path.join(__dirname, '../pages/index/index.js'), 'utf8')
const base = '/api/comptrain/clips/projects'
const clip = { id: '1', time: '00:02', description: '进球识别', type: '投篮', selected: false }
const project = { id: 10, videoUrl: 'https://api.lanxin.cyou/media/video/source.mp4', status: 'SUCCEEDED', clips: [clip] }
const rendered = { id: 'render-1', projectId: 10, status: 'SUCCEEDED', videoUrl: 'https://api.lanxin.cyou/media/video/render.mp4', durationMs: 1234, clipIds: ['1'], saved: false }

function harness(api = {}) {
  let definition
  let timerId = 0
  const timers = new Map()
  const calls = { toast: [], album: [], loading: 0 }
  const app = { api }
  const wx = {
    showToast: value => calls.toast.push(value), showLoading: () => calls.loading++, hideLoading: () => { calls.loading = 0 },
    chooseVideo: options => { calls.choose = options }, showActionSheet: options => { calls.sheet = options },
    saveVideoToPhotosAlbum: options => { calls.album.push(options.filePath); options.success() }
  }
  vm.runInNewContext(source, { Page: value => { definition = value }, getApp: () => app, wx,
    setTimeout: fn => { timers.set(++timerId, fn); return timerId }, clearTimeout: id => timers.delete(id), console })
  const page = { ...definition, data: JSON.parse(JSON.stringify(definition.data)), _epoch: 0, _visible: true,
    setData(value) { Object.assign(this.data, value) } }
  return { page, calls, timers, wx, tick: async () => { await flush(); const tasks = [...timers.values()]; timers.clear(); tasks.forEach(fn => fn()); await flush() } }
}
const flush = () => new Promise(resolve => setImmediate(resolve))

test('initial clips are empty; /auth/me maps the actual profile DTO', async () => {
  const { page } = harness({ get: async p => { assert.equal(p, '/api/auth/me'); return { id: 9, nickname: '球员', avatarUrl: 'a', heightCm: 180, weightKg: 75 } } })
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
  page.uploadLocalVideo()
  await calls.choose.success({ tempFilePath: '/tmp/source.mp4' })
  assert.equal(page._projectId, 10)
  assert.deepEqual(Object.keys(page.data.clips[0]), ['id', 'time', 'description', 'type', 'selected'])
  assert.equal(page.data.clips[0].id, '1')
  assert.equal(page.data.videoGenerated, false)
  assert.equal(page.data.isGenerating, false)
})

test('upload failure clears busy and never creates fake results', async () => {
  const { page, calls } = harness({ upload: async () => { throw new Error('上传失败') } })
  page.uploadLocalVideo(); await calls.choose.success({ tempFilePath: '/tmp/a.mp4' })
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
  page.uploadLocalVideo(); page.onUnload(); await calls.choose.success({ tempFilePath: '/tmp/a.mp4' })
  assert.equal(page.data.videoName, '')
})

test('save persists own work, downloads actual URL and saves tempFilePath', async () => {
  const { page, calls } = harness({ post: async p => { assert.equal(p, `${base}/10/render/render-1/save`); return { ...rendered, saved: true } },
    download: async url => { assert.equal(url, rendered.videoUrl); return '/tmp/download.mp4' } })
  page._projectId = 10; page._render = rendered; page.setData({ videoGenerated: true })
  await page.saveVideo()
  assert.deepEqual(calls.album, ['/tmp/download.mp4']); assert.equal(page._render.saved, true)
  assert.equal(calls.toast.at(-1).title, '已保存到我的集锦')
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
  assert.equal(page._render.videoUrl, rendered.videoUrl)
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
  const { page } = harness({ get: async () => ({ id: 8, nickname: '新用户' }) })
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
  page.uploadLocalVideo()
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
