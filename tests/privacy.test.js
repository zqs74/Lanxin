const test = require('node:test')
const assert = require('node:assert/strict')
const { privacyWx, loadPrivacy } = require('./privacy-harness')
const flush = () => new Promise(resolve => setImmediate(resolve))
function setup() {
  const toasts = [], wx = { ...privacyWx(), showToast: value => toasts.push(value) }
  const privacy = loadPrivacy(wx)
  const page = { ...privacy.pageMethods, data: {}, setData(values) { Object.assign(this.data, values) } }
  return { wx, privacy, page, toasts }
}

test('loading privacy module never calls a platform API or collects data', () => {
  loadPrivacy(new Proxy({}, { get() { assert.fail('startup must not access wx') } }))
})
test('first use waits for real WeChat authorization, checks again, and removes listener', async () => {
  const h = setup(); h.wx.needAuthorization()
  let notice = 0; h.wx.showModal = o => { notice++; o.success({ confirm: true }) }
  const pending = h.privacy.authorizeMedia(h.page)
  await flush()
  assert.equal(notice, 0); assert.equal(h.page.data.privacyVisible, true)
  await h.page.openPrivacyContract()
  assert.equal(notice, 0, 'viewing contract does not grant authorization')
  h.page.agreePrivacyAuthorization()
  assert.equal(await pending, true)
  assert.equal(notice, 1); assert.equal(h.wx.listener(), null)
  assert.equal(h.page.data.privacyVisible, false)
})
test('declining WeChat authorization blocks even when the app notice would be accepted', async () => {
  const h = setup(); h.wx.needAuthorization()
  h.wx.showModal = () => assert.fail('notice cannot replace authorization')
  const pending = h.privacy.authorizeMedia(h.page); await flush()
  h.page.cancelPrivacyAuthorization()
  assert.equal(await pending, false); assert.equal(h.wx.listener(), null)
})
for (const api of ['getPrivacySetting', 'requirePrivacyAuthorize', 'openPrivacyContract', 'onNeedPrivacyAuthorization', 'offNeedPrivacyAuthorization']) {
  test(`missing ${api} fails closed without showing a substitute consent modal`, async () => {
    const h = setup(); delete h.wx[api]
    h.wx.showModal = () => assert.fail('unsupported client cannot continue')
    assert.equal(await h.privacy.authorizeMedia(h.page), false)
    assert.match(h.toasts.at(-1).title, /升级微信/)
  })
}
for (const value of [null, {}, { needAuthorization: false }, { needAuthorization: false, privacyContractName: '  ' }, { needAuthorization: 'false', privacyContractName: '指引' }]) {
  test(`missing platform configuration is blocking: ${JSON.stringify(value)}`, async () => {
    const h = setup(); h.wx.getPrivacySetting = o => o.success(value)
    h.wx.showModal = () => assert.fail('missing contract cannot continue')
    assert.equal(await h.privacy.authorizeMedia(h.page), false)
    assert.match(h.toasts.at(-1).title, /未配置/)
  })
}
test('getPrivacySetting failure and requirePrivacyAuthorize failure block the action', async () => {
  const h = setup(); h.wx.getPrivacySetting = o => o.fail({ errMsg: 'PRIVATE' })
  assert.equal(await h.privacy.ensurePrivacy(h.page), false)
  assert.equal(JSON.stringify(h.toasts).includes('PRIVATE'), false)
  const j = setup(); j.wx.needAuthorization(); j.wx.requirePrivacyAuthorize = o => o.fail({})
  assert.equal(await j.privacy.ensurePrivacy(j.page), false)
  assert.equal(j.wx.listener(), null)
})
test('require success cannot override still-unauthorized platform state', async () => {
  const h = setup(); h.wx.needAuthorization(); h.wx.requirePrivacyAuthorize = o => o.success()
  assert.equal(await h.privacy.ensurePrivacy(h.page), false)
  assert.match(h.toasts.at(-1).title, /未生效/)
})
test('contract failure closes pending authorization and blocks the sensitive action', async () => {
  const h = setup(); h.wx.needAuthorization(); h.wx.openPrivacyContract = o => o.fail({})
  const pending = h.privacy.authorizeMedia(h.page); await flush()
  assert.equal(await h.page.openPrivacyContract(), false)
  assert.equal(await pending, false); assert.equal(h.wx.listener(), null)
  assert.match(h.toasts.at(-1).title, /未配置/)
})
test('cancel during delayed settings cannot later show authorization or continue', async () => {
  const h = setup(); let response
  h.wx.getPrivacySetting = o => { response = o }
  const pending = h.privacy.authorizeMedia(h.page)
  h.page.cancelPrivacyAuthorization()
  response.success({ needAuthorization: true, privacyContractName: '指引' })
  assert.equal(await pending, false); assert.equal(h.wx.listener(), undefined)
})
test('cancel during the upload notice invalidates a later agree callback', async () => {
  const h = setup(); let notice
  h.wx.showModal = o => { notice = o }
  const pending = h.privacy.authorizeMedia(h.page); await flush()
  assert.match(notice.content, /仅上传已获授权/); assert.match(notice.content, /公共链接/)
  h.page.cancelPrivacyAuthorization(); notice.success({ confirm: true })
  assert.equal(await pending, false)
})
test('upload notice cancellation/failure never continues and consent is not cached', async () => {
  const h = setup(); let count = 0
  h.wx.showModal = o => { count++; o.success({ confirm: count === 2 }) }
  assert.equal(await h.privacy.authorizeMedia(h.page), false)
  assert.equal(await h.privacy.authorizeMedia(h.page), true)
  assert.equal(await h.privacy.authorizeMedia(h.page), false)
  h.wx.showModal = o => o.fail({})
  assert.equal(await h.privacy.authorizeMedia(h.page), false)
})

test('undeclared privacy scope from real media API reports configuration failure', () => {
  const h = setup()
  h.privacy.mediaFailure({ errMsg: 'chooseMedia:fail api scope is not declared in the privacy agreement' })
  assert.match(h.toasts.at(-1).title, /未配置/)
  const count = h.toasts.length
  h.privacy.mediaFailure({ errMsg: 'chooseMedia:fail cancel' }); assert.equal(h.toasts.length, count)
})
test('late platform listener after cancellation cannot re-open overlay', async () => {
  const h = setup(); h.wx.needAuthorization()
  const pending = h.privacy.ensurePrivacy(h.page); await flush()
  const listener = h.wx.listener(); h.page.cancelPrivacyAuthorization(); await pending
  h.page.setData = () => assert.fail('late listener must not write UI')
  listener(result => assert.equal(result.event, 'disagree'))
})

test('concurrent upload actions cannot open duplicate disclosure dialogs', async () => {
  const h = setup(); let notice, count = 0
  h.wx.showModal = o => { count++; notice = o }
  const first = h.privacy.authorizeMedia(h.page); await flush()
  assert.equal(await h.privacy.authorizeMedia(h.page), false); assert.equal(count, 1)
  notice.success({ confirm: false }); assert.equal(await first, false)
})
