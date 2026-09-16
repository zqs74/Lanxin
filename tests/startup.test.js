const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createApiClient } = require('../utils/api')
test('cold launch initializes API without wx.login, networking, media selection or privacy prompts', async () => {
  let app
  const wx = new Proxy({ getStorageSync() {} }, { get(target, key) { if (key in target) return target[key]; return () => assert.fail('unexpected startup call: ' + key) } })
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8'), {
    App: value => { app = value }, require: () => ({ createApiClient }), wx
  })
  app.loadTheme = () => {}; app.listenSystemTheme = () => {}
  app.onLaunch()
  assert.equal(await app.globalData.authReady, null)
  assert.equal(app.api.getUser(), null)
})
