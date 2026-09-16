'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const root = path.resolve(__dirname, '..')
const manifest = require('./ui-baseline.json')
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (['.git', 'node_modules'].includes(e.name) ? [] : files(path.join(dir, e.name))) : [path.join(dir, e.name)]) }

test('all 254 UI files match the original, except exact reviewed bindings, privacy authorization markup and copy', () => {
  const actual = files(root).filter(f => /\.(wxml|wxss)$/.test(f)).map(f => path.relative(root, f).replaceAll('\\', '/')).sort()
  assert.deepEqual(actual, manifest.files.map(e => e.path).sort())
  assert.equal(actual.length, 254)
  for (const entry of manifest.files) {
    let contents = fs.readFileSync(path.join(root, entry.path), 'utf8').replace(/\r\n/g, '\n')
    const reviewed = require('./ui-reviewed-changes.json')[entry.path] || []
    for (const [original, replacement] of reviewed) {
      assert.ok(typeof original === 'string' && original.length > 0, 'reviewed original must be a nonempty exact anchor')
      assert.ok(typeof replacement === 'string' && replacement.length > 0, 'reviewed replacement must be nonempty')
      assert.equal(contents.split(replacement).length, 2, entry.path + ': reviewed replacement must exist exactly once')
      contents = contents.replace(replacement, original)
      assert.equal(contents.split(original).length, 2, entry.path + ': restored original must exist exactly once')
    }
    if (['index', 'chat', 'profile-edit', 'custom-match-setup'].some(name => entry.path === `pages/${name}/${name}.wxml`)) {
      const overlay = fs.readFileSync(path.join(__dirname, 'privacy-overlay.txt'), 'utf8').replace(/\r\n/g, '\n')
      assert.equal(contents.split(overlay).length, 2, 'only the exact reviewed authorization overlay is allowed')
      contents = contents.replace(overlay, '')
    }
    if (entry.path === 'pages/training/training.wxml') {
      for (const [binding, original] of [['>{{ todaySummary.durationMinutes }}</view>', '>60</view>'], ['>{{ todaySummary.count }}</view>', '>4</view>'], ['>{{ todaySummary.intensity }}</view>', '>高强度</view>']]) {
        assert.equal(contents.split(binding).length, 2, 'reviewed data binding must exist exactly once')
        contents = contents.replace(binding, original)
      }
    }
    assert.equal(crypto.createHash('sha256').update(contents).digest('hex'), entry.sha256, entry.path)
  }
})

test('runtime has no provider credential literals or direct page networking', () => {
  const runtime = ['app.js', ...files(path.join(root, 'pages')).filter(f => f.endsWith('.js')).map(f => path.relative(root, f))]
  for (const file of runtime) {
    const source = fs.readFileSync(path.join(root, file), 'utf8')
    assert.doesNotMatch(source, new RegExp('\\bs' + 'k-[A-Za-z0-9_-]{16,}'), file + ' contains credential material')
    assert.doesNotMatch(source, /\bwx\.(request|uploadFile|downloadFile)\s*\(/, file + ' bypasses the authenticated API client')
    assert.doesNotMatch(source, /http:\/\/192\.168\./, file + ' contains a development host')
  }
})

test('all authorization overlays use global theme/button classes with their own positioning', () => {
  const overlay = fs.readFileSync(path.join(__dirname, 'privacy-overlay.txt'), 'utf8')
  const globalCss = fs.readFileSync(path.join(root, 'app.wxss'), 'utf8')
  for (const cls of ['card', 'btn', 'btn-primary', 'btn-ghost']) assert.ok(globalCss.includes('.' + cls + ' '))
  assert.match(overlay, /position:fixed;top:0;right:0;bottom:0;left:0/)
  assert.match(overlay, /flex-direction:column/)
  assert.match(overlay, /wx:if="\{\{privacyVisible\}\}"/)
  assert.match(overlay, /open-type="agreePrivacyAuthorization" bindagreeprivacyauthorization="agreePrivacyAuthorization"/)
  assert.doesNotMatch(overlay, /bindtap="agreePrivacyAuthorization"/)
})
