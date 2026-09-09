// Local snapshots are durable before any network work. A conflict never advances
// the local base version: resolving it requires an explicit user decision.
const queues = new Map()
const clone = value => JSON.parse(JSON.stringify(value))
const key = id => 'custom_match_' + id
const statusToApi = { draft: 'DRAFT', in_progress: 'ONGOING', completed: 'FINISHED' }
const statusFromApi = { DRAFT: 'draft', ONGOING: 'in_progress', FINISHED: 'completed' }

function toRequest(match, version) {
  return {
    expectedVersion: version || 0,
    status: statusToApi[match.status] || 'DRAFT',
    payload: {
      players: match.players || [],
      score: { totalScore: match.totalScore || 0, finalTotalScore: match.finalTotalScore || 0,
        teamAScore: match.teamAScore || 0, teamBScore: match.teamBScore || 0 },
      fouls: { teamAFouls: match.teamAFouls || 0, teamBFouls: match.teamBFouls || 0,
        teamAFoulRecords: match.teamAFoulRecords || [], teamBFoulRecords: match.teamBFoulRecords || [] },
      clock: { startTime: match.startTime || null, endTime: match.endTime || null, duration: match.duration || '' },
      eventLog: match.actionLog || []
    }
  }
}

function fromResponse(response) {
  const payload = response.payload || {}
  const clock = payload.clock || {}
  return {
    matchId: response.clientMatchId,
    status: statusFromApi[response.status] || 'draft',
    players: payload.players || [],
    ...payload.score, ...payload.fouls,
    startTime: clock.startTime || response.startedAt || null,
    endTime: clock.endTime || response.finishedAt || null,
    duration: clock.duration || '',
    actionLog: payload.eventLog || payload['event-log'] || [],
    _sync: { version: response.version, revision: 0, dirty: false, conflict: false }
  }
}

function read(id) { return wx.getStorageSync(key(id)) || null }

function persist(match) {
  wx.setStorageSync(key(match.matchId), match)
  if (match.status === 'in_progress') wx.setStorageSync('unfinished_custom_match', match)
  else {
    const unfinished = wx.getStorageSync('unfinished_custom_match')
    if (unfinished && unfinished.matchId === match.matchId) wx.removeStorageSync('unfinished_custom_match')
  }
}

function saveLocal(match) {
  const previous = read(match.matchId)
  // Page snapshots can be stale while a PUT is in flight. Always take metadata
  // from durable storage, never from a page's copy of the snapshot.
  const meta = (previous && previous._sync) || {}
  const next = clone({ ...match, _sync: { ...meta, version: meta.version || 0,
    revision: (meta.revision || 0) + 1, dirty: true } })
  persist(next)
  return next
}

function enqueue(id, operation) {
  const task = (queues.get(id) || Promise.resolve()).then(operation).catch(error => ({ ok: false, error }))
  queues.set(id, task)
  task.then(() => { if (queues.get(id) === task) queues.delete(id) })
  return task
}

async function client() {
  const app = getApp()
  if (app.globalData.authReady) await app.globalData.authReady
  const api = app.api || app.globalData.api
  const auth = await api.ensureLogin()
  if (!auth || auth.userId == null) throw { code: 401, message: '未登录或登录已过期' }
  return { api, userId: auth.userId }
}

function checkOwner(match, userId) {
  if (match && match._sync && match._sync.ownerId != null && String(match._sync.ownerId) !== String(userId)) {
    throw { code: 403, message: '无权访问其他用户数据' }
  }
}

function isLocalAvatar(value) {
  return !!value && (!/^https?:\/\//i.test(value) || /^https?:\/\/(tmp|usr)\//i.test(value))
}

async function uploadAvatars(api, snapshot) {
  for (const player of snapshot.players || []) {
    if (!isLocalAvatar(player.avatar)) continue
    const result = await api.upload('/api/upload/image', player.avatar)
    if (!result || !/^https?:\/\//i.test(result.url || '') || isLocalAvatar(result.url)) {
      throw { code: 500, message: '保存失败，请重试' }
    }
    player.avatar = result.url
  }
}

async function flush(id) {
  try {
    let current = read(id)
    if (!current || (current._sync && !current._sync.dirty)) return { ok: true }
    if (current._sync && current._sync.conflict) return { ok: false, error: { code: 409, message: '自定义比赛版本冲突' } }
    const { api, userId } = await client()
    current = read(id)
    checkOwner(current, userId)
    if (!current._sync) current = saveLocal(current)
    current._sync.ownerId = userId
    persist(current)
    while ((current = read(id)) && current._sync.dirty) {
      checkOwner(current, userId)
      if (current._sync.conflict) return { ok: false, error: { code: 409 } }
      const snapshot = clone(current)
      await uploadAvatars(api, snapshot)
      const response = await api.put('/api/custom-matches/' + encodeURIComponent(id), toRequest(snapshot, snapshot._sync.version))
      if (!response || !Number.isInteger(response.version) || response.version <= snapshot._sync.version) {
        throw { code: 500, message: '保存失败，请重试' }
      }
      const latest = read(id)
      checkOwner(latest, userId)
      // Keep edits made during the request and only acknowledge the sent revision.
      latest._sync = { ...latest._sync, version: response.version,
        dirty: latest._sync.revision !== snapshot._sync.revision, lastError: null, ownerId: userId }
      latest.players = (latest.players || []).map(player => {
        const before = (current.players || []).find(p => p.id === player.id)
        const uploaded = (snapshot.players || []).find(p => p.id === player.id)
        return before && uploaded && before.avatar === player.avatar ? { ...player, avatar: uploaded.avatar } : player
      })
      persist(latest)
    }
    return { ok: true }
  } catch (error) {
    try {
      const latest = read(id)
      if (latest) {
        latest._sync = { ...latest._sync, dirty: true,
          conflict: !!(latest._sync && latest._sync.conflict) || Number(error.code) === 409,
          lastError: { code: error.code || 0, message: error.message || '保存失败' } }
        persist(latest)
      }
    } catch (_) { /* The already persisted dirty revision must remain retryable. */ }
    return { ok: false, error }
  }
}

function sync(id) { return enqueue(id, () => flush(id)) }

function load(id) {
  return enqueue(id, async () => {
    let local = read(id)
    if (local && (!local._sync || local._sync.dirty)) {
      const result = await flush(id)
      if (!result.ok && Number(result.error.code) === 403) return null
      return read(id)
    }
    try {
      const { api, userId } = await client()
      checkOwner(local, userId)
      const response = await api.get('/api/custom-matches/' + encodeURIComponent(id))
      local = read(id)
      // A local write can happen while GET waits; do not replace that draft.
      if (local && (!local._sync || local._sync.dirty)) return local
      const match = fromResponse(response)
      match._sync.ownerId = userId
      persist(match)
      return match
    } catch (error) {
      if (Number(error.code) === 403) return null
      return read(id)
    }
  }).then(result => result && result.ok === false ? null : result)
}

module.exports = { saveLocal, read, sync, load, toRequest, fromResponse, isLocalAvatar }
