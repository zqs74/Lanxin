const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
function privacyWx() {
  let listener, authorized = true
  return {
    getPrivacySetting(o) { o.success({ needAuthorization: !authorized, privacyContractName: '《测试隐私保护指引》' }) },
    requirePrivacyAuthorize(o) {
      if (authorized) o.success()
      else listener(result => { authorized = result.event === 'agree'; authorized ? o.success() : o.fail({}) })
    },
    onNeedPrivacyAuthorization(callback) { listener = callback },
    offNeedPrivacyAuthorization(callback) { if (listener === callback) listener = null },
    openPrivacyContract(o) { o.success() },
    showModal(o) { o.success({ confirm: true }) },
    needAuthorization() { authorized = false },
    listener() { return listener }
  }
}
function loadPrivacy(wx) {
  const module = { exports: {} }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../utils/privacy.js'), 'utf8'), { wx, module })
  return module.exports
}
module.exports = { privacyWx, loadPrivacy }
