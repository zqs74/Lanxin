const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const clone = value => JSON.parse(JSON.stringify(value));
const tick = () => new Promise(resolve => setImmediate(resolve));
const account = id => ({ id, username: id, displayName: id, organizationId: 'org-1', role: 'organizer' });
const auth = id => ({ token: 'opaque-' + id, expiresAt: '2099-01-01T00:00:00Z', account: account(id) });
const demand = { mode: 'pro_event', town: '南城', playDate: '2026-10-10', peopleCount: 20, teamCount: 4, sentence: '需求', budgetLevel: 'mid' };
const plan = id => ({ id, type: 'recommendation', mode: demand.mode, createdAt: '2026-09-14T00:00:00Z', summary: '同一摘要', payload: { demand, result: {
  summary: '真实方案', sections: [{ key: 'venue', items: [{ id: 'venue-1', name: '真实场馆', priceLevel: 1000 }] }],
  alternatives: [], posterPayload: { title: '方案海报' },
} } });
const config = { city: '东莞', modeOptions: [{ value: 'pro_event', label: '半专业赛事' }], towns: ['南城'],
  budgetOptions: [], venueOptions: [], dateOptions: [], timeSlots: [{ value: 'evening', label: '晚上' }],
  contact: {}, taxonomy: [{ key: 'venues', label: '场馆' }] };
function harness() {
  let now = Date.now();
  class ClockDate extends Date { static now() { return now; } }
  const storage = new Map(), writes = [], requests = [], navigation = [], toasts = [], modals = [], loaded = [];
  const cache = new Map(); let definition; const pages = [];
  const wx = {
    request(options) { requests.push(options); },
    getStorageSync(key) { return storage.get(key); },
    setStorageSync(key, value) { writes.push({ key, value: clone(value) }); storage.set(key, clone(value)); },
    removeStorageSync(key) { storage.delete(key); },
    reLaunch(options) { navigation.push(options); }, navigateTo(options) { navigation.push(options); }, switchTab(options) { navigation.push(options); },
    showToast(options) { toasts.push(options); }, showModal(options) { modals.push(options); }, setNavigationBarTitle() {},
    login() { throw new Error('wx.login is forbidden'); },
  };
  const context = vm.createContext({ wx, console, Date: ClockDate, setTimeout, clearTimeout, getCurrentPages: () => pages,
    Page(value) { definition = value; }, App() {} });
  function load(relative) {
    const file = path.resolve(root, relative);
    if (cache.has(file)) return cache.get(file).exports;
    loaded.push(path.relative(root, file));
    const module = { exports: {} }; cache.set(file, module);
    const localRequire = target => load(path.relative(root, path.resolve(path.dirname(file), target)) + (path.extname(target) ? '' : '.js'));
    const factory = vm.runInContext('(function(require,module,exports){\n' + fs.readFileSync(file, 'utf8') + '\n})', context, { filename: file });
    factory(localRequire, module, module.exports); return module.exports;
  }
  function page(name) {
    load('pages/' + name + '/' + name + '.js');
    const item = Object.assign({}, definition, { data: clone(definition.data || {}), route: 'pages/' + name + '/' + name,
      options: {}, setData(patch, callback) {
        for (const [key, value] of Object.entries(patch)) {
          const keys = key.split('.'); let target = this.data;
          keys.slice(0, -1).forEach(part => { target = target[part] || (target[part] = {}); });
          target[keys[keys.length - 1]] = clone(value);
        }
        if (callback) callback();
      }, getTabBar() { return { setData() {} }; }, selectAllComponents() { return []; },
    });
    pages.push(item); return item;
  }
  function respond(request, data, statusCode = 200) {
    request.success({ statusCode, data: statusCode >= 200 && statusCode < 300 ? { code: 0, message: 'success', data } : { code: statusCode, msg: data, data: null } });
  }
  const session = load('utils/session.js'), api = load('utils/api.js');
  return { wx, session, api, load, page, requests, navigation, storage, writes, toasts, modals, loaded, respond,
    advanceTime(ms) { now += ms; } };
}

test('login failure surfaces server error; password is masked and never persisted', async () => {
  const h = harness(), p = h.page('login'); p.onLoad({});
  p.setData({ username: 'someone', password: 'plaintext-secret' });
  const pending = p.submitLogin();
  assert.equal(h.requests[0].url, 'https://api.lanxin.cyou/bansai-api/api/auth/login');
  assert.equal(h.requests[0].data.password, 'plaintext-secret');
  assert.equal(h.requests[0].header.Authorization, undefined);
  h.respond(h.requests[0], '账号或密码错误', 401); await pending;
  assert.equal(p.data.error, '账号或密码错误'); assert.equal(p.data.password, '');
  assert.equal(h.writes.length, 0); assert.equal(h.navigation.length, 0); assert.equal(h.session.hasSession(), false);
  const ui = fs.readFileSync(path.join(root, 'pages/login/login.wxml'), 'utf8');
  assert.match(ui, /password="\{\{true\}\}"/); assert.doesNotMatch(ui, /注册/);
});

test('successful login stores only session fields and returns to the shared plan', async () => {
  const h = harness(), p = h.page('login');
  p.onLoad({ next: encodeURIComponent('/pages/result/result?shareId=share-123') });
  p.setData({ username: 'issued', password: 'plaintext-secret' });
  const pending = p.submitLogin();
  h.respond(h.requests[0], Object.assign(auth('a'), { password: 'server-echo', account: Object.assign(account('a'), { password: 'echo' }) }));
  await pending;
  assert.equal(h.navigation[0].url, '/pages/result/result?shareId=share-123');
  assert.equal(h.writes.length, 1); assert.doesNotMatch(JSON.stringify(h.writes), /password|plaintext-secret|server-echo/);
  assert.equal(h.session.getToken(), 'opaque-a');
});

test('local session persistence failure does not claim login success', async () => {
  const h = harness(), p = h.page('login'); p.onLoad({});
  h.wx.setStorageSync = () => { throw new Error('full'); };
  p.setData({ username: 'issued', password: 'secret' });
  const pending = p.submitLogin(); h.respond(h.requests[0], auth('a')); await pending;
  assert.equal(h.navigation.length, 0); assert.equal(h.session.hasSession(), false); assert.match(p.data.error, /保存登录状态/);
});

test('only safe app routes and opaque IDs survive login next', () => {
  const h = harness();
  for (const next of ['https://evil.test', '//evil.test', '/pages/login/login', '/pages/result/result?payload=raw',
    '/pages/result/result?shareId=../../secret', '/pages/result/result?shareId=a&shareId=b', '/pages/records/records?type=admin',
    '/pages/result/result?shareId=a\n', '/pages/result/result?shareId=a\0']) {
    assert.equal(h.session.safeNext(next), '');
  }
  assert.equal(h.session.safeNext('/pages/result/result?shareId=share-1'), '/pages/result/result?shareId=share-1');
});

test('concurrent 401s revoke this session and redirect once, preserving share next', async () => {
  const h = harness(); h.session.accept(auth('a'));
  const p = h.page('result'); p.options = { shareId: 's1' }; p.onLoad(p.options);
  const first = h.api.request('/api/plans'), second = h.api.request('/api/bookings');
  const settled = Promise.allSettled([first, second]);
  h.respond(h.requests[0], '会话已失效', 401); h.respond(h.requests[1], '会话已失效', 401); await settled;
  assert.equal(h.session.hasSession(), false); assert.equal(h.navigation.length, 1);
  assert.equal(decodeURIComponent(h.navigation[0].url.split('next=')[1]), '/pages/result/result?shareId=s1');
  assert.equal(h.storage.size, 0); assert.equal(p.data.result, null);
});

test('old account responses cannot revoke or populate a new account', async () => {
  const h = harness(); h.session.accept(auth('a'));
  const first = h.api.request('/api/plans'), second = h.api.request('/api/bookings');
  const settled = Promise.allSettled([first, second]);
  h.session.accept(auth('b'));
  h.respond(h.requests[0], [plan('old')]); h.respond(h.requests[1], 'revoked', 401);
  const result = await settled;
  assert.ok(result.every(item => item.status === 'rejected' && item.reason.stale));
  assert.equal(h.session.getToken(), 'opaque-b'); assert.equal(h.navigation.length, 0);
});

test('legacy history is preserved and all non-login pages reject anonymous entry', async () => {
  const h = harness();
  for (const key of ['lx_recommendations', 'lx_bookings', 'lx_latest_demand', 'lx_latest_result', 'latest_share_payload']) h.storage.set(key, [{ secret: true }]);
  const legacy = Array.from(h.storage.entries());
  h.session.init(); assert.deepEqual(Array.from(h.storage.entries()), legacy);
  for (const name of ['index', 'library', 'history', 'records', 'result', 'poster', 'booking-success', 'logs']) {
    const p = h.page(name); p.onLoad({ shareId: 's1' }); await p.onShow();
  }
  assert.equal(h.requests.length, 0); assert.equal(h.navigation.length, 1);
  assert.deepEqual(Array.from(h.storage.entries()), legacy);
  assert.ok(h.loaded.every(name => !name.replace(/\\/g, '/').includes('utils/data/resources')));
});

test('legacy business records are never read, migrated or shown in new history', async () => {
  const h = harness();
  const legacy = new Map([
    ['lx_recommendations', [plan('legacy-plan')]],
    ['lx_bookings', [{ id: 'legacy-booking', type: 'booking', payload: { bookingForm: { phone: '13800138000' } } }]],
    ['lx_latest_demand', demand], ['lx_latest_result', plan('legacy-latest')],
    ['latest_share_payload', { sentence: 'legacy-private-demand' }],
  ]);
  for (const [key, value] of legacy) h.storage.set(key, clone(value));
  const reads = [], removals = [];
  const read = h.wx.getStorageSync, remove = h.wx.removeStorageSync;
  h.wx.getStorageSync = key => { reads.push(key); return read(key); };
  h.wx.removeStorageSync = key => { removals.push(key); remove(key); };
  h.session.init(); h.session.accept(auth('a'));
  const p = h.page('history'); p.onLoad({});
  const pending = p.onShow(); h.respond(h.requests[0], account('a')); await tick();
  h.respond(h.requests[1], { items: [plan('server-plan')], total: 1, page: 1, pageSize: 50 });
  h.respond(h.requests[2], { items: [], total: 0, page: 1, pageSize: 50 }); await pending;
  assert.deepEqual(clone(p.data.recommendations.map(item => item.id)), ['server-plan']);
  assert.equal(p.data.bookings.length, 0);
  assert.doesNotMatch(JSON.stringify(p.data), /legacy-|13800138000/);
  h.session.clear(); h.session.accept(auth('b')); h.session.clear();
  for (const [key, value] of legacy) assert.deepEqual(h.storage.get(key), value);
  assert.ok(reads.every(key => key === 'lanxin_bansai_session_v1'));
  assert.ok(removals.every(key => key === 'lanxin_bansai_session_v1'));
  assert.ok(h.writes.every(item => item.key === 'lanxin_bansai_session_v1'));
});

test('onShow validates account revocation before loading protected records', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('records'); p.onLoad({ type: 'booking' });
  p.setData({ list: [{ id: 'old' }], filteredList: [{ id: 'old' }] });
  const pending = p.onShow(); assert.match(h.requests[0].url, /\/api\/auth\/me$/);
  h.respond(h.requests[0], '账号已停用', 401); await pending;
  assert.equal(h.requests.length, 1); assert.equal(p.data.list.length, 0); assert.equal(h.navigation.length, 1);
});

test('history loads every page and keeps distinct IDs even when summaries match', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('records'); p.onLoad({ type: 'recommendation' });
  const pending = p.onShow(); h.respond(h.requests[0], account('a')); await tick();
  for (let n = 1; n <= 3; n++) {
    const request = h.requests[n]; assert.equal(request.data.page, n); assert.equal(request.data.pageSize, 50);
    h.respond(request, { items: Array.from({ length: n === 3 ? 21 : 50 }, (_, i) => plan('p-' + ((n - 1) * 50 + i))), total: 121, page: n, pageSize: 50 });
    await tick();
  }
  await pending; assert.equal(p.data.list.length, 121);
  p.reopenItem({ currentTarget: { dataset: { type: 'recommendation', id: 'p-120' } } });
  assert.equal(h.navigation[0].url, '/pages/result/result?id=p-120');
});

test('list pagination failure never returns a truncated success', async () => {
  const h = harness(); h.session.accept(auth('a'));
  const pending = h.load('utils/storage.js').getRecommendations();
  const rejected = assert.rejects(pending, /网络连接失败/);
  h.respond(h.requests[0], { items: Array.from({ length: 50 }, (_, i) => plan('p-' + i)), total: 80, page: 1, pageSize: 50 }); await tick();
  h.requests[1].fail(); await rejected;
});

test('failed plan generation does not navigate or write local history', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('index'); p.onLoad({});
  const pending = p.generateResult(demand); await tick(); h.requests[0].fail(); await pending;
  assert.equal(h.navigation.length, 0); assert.equal(h.writes.length, 1);
  assert.equal(h.toasts.some(item => item.icon === 'success'), false);
});

test('booking failures keep the form, retry ID is stable and double taps submit once', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('result'); p.onLoad({ id: 'p1' });
  p.setData({ planId: 'p1', bookingVenue: { name: 'venue', priceLevel: 999 }, bookingVisible: true,
    bookingForm: { contactName: '测试', phone: '13800138000', expectedDate: '2026-10-10', timeSlot: 'evening', remark: '', acceptFallback: true } });
  const first = p.submitBooking(); const duplicate = p.submitBooking(); await tick();
  assert.equal(h.requests.length, 1);
  const requestId = h.requests[0].data.requestId;
  assert.equal(h.requests[0].data.planId, 'p1'); assert.equal(h.requests[0].data.bookingForm.venueName, undefined);
  assert.equal(h.requests[0].data.bookingForm.priceLevel, undefined);
  h.requests[0].fail(); await Promise.all([first, duplicate]);
  assert.equal(h.navigation.length, 0); assert.equal(p.data.bookingVisible, true);
  const retry = p.submitBooking(); await tick(); assert.equal(h.requests[1].data.requestId, requestId);
  h.respond(h.requests[1], { id: 'b1', status: 'PENDING', statusLabel: '已提交，待确认', version: 1 }); await retry;
  assert.equal(h.navigation[0].url, '/pages/booking-success/booking-success?id=b1');
  await p.submitBooking(); assert.equal(h.requests.length, 2);
  assert.doesNotMatch(JSON.stringify(h.writes), /13800138000/);
});

test('failed async delete cannot report success or remove local list', async () => {
  for (const name of ['history', 'records']) {
    const h = harness(); h.session.accept(auth('a')); const p = h.page(name); p.onLoad({});
    if (name === 'history') p.deleteItem({ currentTarget: { dataset: { type: 'recommendation', id: 'p1' } } });
    else { p.setData({ selectedIds: ['p1'] }); p.deleteSelected(); }
    const pending = h.modals[0].success({ confirm: true }); h.respond(h.requests[0], '保存失败', 500); await pending;
    assert.equal(h.toasts.some(item => item.icon === 'success'), false);
  }
});

test('resource filter races only show the last response and empty resources stay empty', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('library'); p.onLoad({});
  const first = p.refreshList(); p.setData({ townFilter: '南城' }); const last = p.refreshList();
  h.respond(h.requests[1], { items: [], total: 0, page: 1, pageSize: 50 }); await last;
  h.respond(h.requests[0], { items: [{ id: 'old', name: 'old venue' }], total: 1, page: 1, pageSize: 50 }); await first;
  assert.equal(p.data.featuredItem, null); assert.equal(p.data.list.length, 0); assert.match(p.data.emptyText, /暂无资源/);
});

test('server contact replaces placeholder globally and clears on account switch', async () => {
  const h = harness(); h.session.accept(auth('a'));
  assert.equal(h.load('utils/constants.js').CONTACT.wechat, '');
  let pending = h.api.getConfig(); h.respond(h.requests[0], Object.assign({}, config, { contact: { wechat: 'real-contact', phone: '123' } })); await pending;
  assert.equal(h.load('utils/constants.js').CONTACT.wechat, 'real-contact');
  h.session.clear(); assert.equal(h.load('utils/constants.js').CONTACT.wechat, '');
  h.session.accept(auth('b')); pending = h.api.getConfig(); h.respond(h.requests[1], config); await pending;
  assert.equal(h.load('utils/constants.js').CONTACT.qrCode, '');
});

test('shares contain only opaque share IDs; private booking forms never enter URL', async () => {
  const h = harness(); h.session.accept(auth('a')); const share = h.load('utils/share.js');
  const p = h.page('result'); p.onLoad({ id: 'p1' });
  const pending = share.prepareShare(p, 'p1');
  assert.match(h.requests[0].url, /\/api\/plans\/p1\/shares$/);
  h.respond(h.requests[0], { shareId: 's1', expiresAt: '2099-01-01T00:00:00Z', path: '/pages/result/result?payload=secret' }); await pending;
  assert.equal(p.onShareAppMessage().path, '/pages/result/result?shareId=s1');
  await assert.rejects(share.loadPlan({ payload: encodeURIComponent(JSON.stringify({ demand, bookingForm: { phone: '13800138000' } })) }), /无效/);
});

test('booking status and exported image reflect backend confirmation', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('booking-success'); p.onLoad({ id: 'b1' });
  const record = { id: 'b1', status: 'CONFIRMED', statusLabel: '预约已确认', payload: Object.assign({}, plan('p1').payload, { bookingForm: { expectedDate: '2026-10-10' } }) };
  const pending = p.onShow(); h.respond(h.requests[0], account('a')); await tick(); h.respond(h.requests[1], record); await pending;
  assert.match(p.data.statusDescription, /已确认/); assert.doesNotMatch(p.data.statusDescription, /尽快|待确认/);
  const palette = p.buildPalette(); assert.ok(palette.views.some(view => view.text === '预约已确认'));
  assert.doesNotMatch(JSON.stringify(palette), /锁档|占位|付款成功|预约成功/);
});

test('password change and logout use server revocation then clear session', async () => {
  const h = harness(); h.session.accept(auth('a'));
  const changed = h.session.changePassword('old-secret', 'new-secret');
  assert.equal(h.requests[0].method, 'PUT'); assert.match(h.requests[0].url, /\/api\/auth\/password$/);
  h.respond(h.requests[0], null); await changed; assert.equal(h.session.hasSession(), false);
  h.session.accept(auth('b')); const out = h.session.logout();
  assert.match(h.requests[1].url, /\/api\/auth\/logout$/); h.respond(h.requests[1], null); await out;
  assert.equal(h.session.hasSession(), false); assert.doesNotMatch(JSON.stringify(h.writes), /secret/);
});

test('network login failures release the submit lock without storing credentials', async () => {
  const h = harness(), p = h.page('login'); p.onLoad({}); p.setData({ username: 'issued', password: 'secret' });
  const pending = p.submitLogin(); await p.submitLogin(); assert.equal(h.requests.length, 1);
  h.requests[0].fail(); await pending;
  assert.equal(p.data.submitting, false); assert.equal(p.data.password, ''); assert.match(p.data.error, /网络/);
  assert.equal(h.writes.length, 0); assert.equal(h.navigation.length, 0);
});

test('server parse and completion use server config and retain the prompt after failed save', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('index'); p.onLoad({});
  const initial = p.onShow(); h.respond(h.requests[0], account('a')); await tick(); h.respond(h.requests[1], config); await initial;
  p.setData({ mode: 'pro_event', sentence: '需求' }); const parsed = p.handlePrimaryAction();
  assert.match(h.requests[2].url, /\/api\/demands\/parse$/);
  h.respond(h.requests[2], { demand: Object.assign({}, demand, { town: '' }), missingFields: ['town'] }); await parsed;
  assert.equal(p.data.popupVisible, true); assert.deepEqual(clone(p.data.missingPrompts[0].options), ['南城']);
  p.selectPromptOption({ currentTarget: { dataset: { key: 'town', value: '南城' } } });
  const pending = p.confirmPrompt(); await tick(); h.requests[3].fail(); await pending;
  assert.equal(p.data.popupVisible, true); assert.equal(p.data.formValues.town, '南城'); assert.equal(h.navigation.length, 0);
  const retry = p.confirmPrompt(); await tick(); assert.equal(h.requests[4].data.requestId, h.requests[3].data.requestId);
  h.respond(h.requests[4], plan('saved')); await retry;
  assert.equal(p.data.popupVisible, false); assert.equal(h.navigation[0].url, '/pages/result/result?id=saved');
});

test('malformed booking response is not cached or shown as success', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('result'); p.onLoad({ id: 'p1' });
  p.setData({ planId: 'p1', bookingVenue: { name: 'venue' }, bookingVisible: true,
    bookingForm: { contactName: '测试', phone: '13800138000', expectedDate: '2026-10-10', timeSlot: 'evening' } });
  const pending = p.submitBooking(); await tick(); h.respond(h.requests[0], { unexpected: true }); await pending;
  assert.equal(h.navigation.length, 0); assert.equal(p.data.bookingVisible, true); assert.match(h.toasts[0].title, /响应无效/);
  const retry = p.submitBooking(); await tick(); assert.equal(h.requests.length, 2);
  assert.equal(h.requests[0].data.requestId, h.requests[1].data.requestId);
  h.respond(h.requests[1], { id: 'b1', status: 'PENDING' }); await retry;
  assert.equal(h.navigation.length, 1);
});

test('only the same in-flight action coalesces; a later identical action gets a new ID', async () => {
  const h = harness(); h.session.accept(auth('a')); const calls = [];
  const submit = id => { calls.push(id); return Promise.resolve({ id: 'server-' + calls.length }); };
  const action = h.api.submitOnce('plan', { town: '南城', count: 10 }, submit);
  const duplicate = h.api.submitOnce('plan', { count: 10, town: '南城' }, submit);
  const [first, same] = await Promise.all([action, duplicate]);
  assert.equal(first.id, same.id); assert.equal(calls.length, 1);
  const next = await h.api.submitOnce('plan', { town: '南城', count: 10 }, submit);
  assert.notEqual(first.id, next.id); assert.equal(calls.length, 2);
  await h.api.submitOnce('plan', { town: '东城', count: 10 }, submit);
  h.session.accept(auth('b')); await h.api.submitOnce('plan', { town: '南城', count: 10 }, submit);
  assert.equal(new Set(calls).size, 4);
});

test('request paths are rejected before token reads, storage access or network effects', async () => {
  const h = harness(); let tokenReads = 0, storageReads = 0;
  h.session.getToken = () => { tokenReads++; return 'private-token'; };
  h.wx.getStorageSync = () => { storageReads++; return auth('a'); };
  const invalid = [null, {}, '', '/', '/api', '/api/', '/api/plans/../../comptrain', '/api/../plans',
    '/../../comptrain/api/me', 'https://evil.test/api/plans', 'https://api.lanxin.cyou/bansai-api/api/plans',
    '//evil.test/api/plans', '/api\\plans', '/api/plans\\..\\comptrain', '/api//plans', '/api/plans/',
    '/api/%2e%2e/comptrain', '/api/%2E%2E/comptrain', '/api/plans%2f..%2fcomptrain', '/api/plans%2Fetc',
    '/api/%252e%252e/comptrain', '/api/plans%5c..', '/api/plans\n', '/api/plans\r', '/api/plans\t',
    '/api/plans\0', '/api/plans?token=leak', '/api/plans#fragment', '/api/auth/register', '/api/auth/reset'];
  for (const value of invalid) await assert.rejects(h.api.request(value), /请求路径无效/);
  assert.equal(tokenReads, 0); assert.equal(storageReads, 0);
  assert.equal(h.requests.length, 0); assert.equal(h.navigation.length, 0);
});

test('canonical business paths keep Authorization inside the fixed bansai API base', async () => {
  const h = harness(); h.session.accept(auth('a'));
  for (const endpoint of ['/api/catalog/config', '/api/resources', '/api/demands/parse', '/api/plans',
    '/api/plans/p_1-2', '/api/plans/p_1-2/shares', '/api/bookings', '/api/bookings/b1', '/api/shares/s1']) {
    const pending = h.api.request(endpoint); const request = h.requests[h.requests.length - 1];
    assert.equal(request.url, 'https://api.lanxin.cyou/bansai-api' + endpoint);
    assert.equal(request.header.Authorization, 'Bearer opaque-a'); h.respond(request, {}); await pending;
  }
});

test('malicious totals fail explicitly without silently truncating or requesting more pages', async () => {
  for (const total of [10001, Number.MAX_SAFE_INTEGER, Infinity, -1, 1.5]) {
    const h = harness(); h.session.accept(auth('a'));
    const pending = h.api.listAll('/api/plans'); const rejected = assert.rejects(pending, /10000|响应无效/);
    h.respond(h.requests[0], { items: [], total, page: 1, pageSize: 50 }); await rejected;
    assert.equal(h.requests.length, 1);
  }
});

test('pagination stops with an explicit error after at most 200 requests', async () => {
  const h = harness(); h.session.accept(auth('a'));
  const pending = h.api.listAll('/api/plans'); const rejected = assert.rejects(pending, /超过200页/);
  for (let page = 1; page <= 200; page++) {
    h.respond(h.requests[page - 1], { items: [plan('p-' + page)], total: 201, page, pageSize: 1 });
    await tick();
  }
  await rejected; assert.equal(h.requests.length, 200);
});

test('a new explicit booking action after success receives a fresh request ID', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('result'); p.onLoad({ id: 'p1' });
  p.setData({ planId: 'p1', demand, bookingVenue: { name: 'venue' }, bookingVisible: true,
    bookingForm: { contactName: '测试', phone: '13800138000', expectedDate: '2026-10-10', timeSlot: 'evening' } });
  const first = p.submitBooking(); await tick(); h.respond(h.requests[0], { id: 'b1', status: 'PENDING' }); await first;
  await p.submitBooking(); assert.equal(h.requests.length, 1);
  p.openBooking(); const next = p.submitBooking(); await tick();
  assert.notEqual(h.requests[0].data.requestId, h.requests[1].data.requestId);
  h.respond(h.requests[1], { id: 'b2', status: 'PENDING' }); await next;
  assert.equal(h.navigation[1].url, '/pages/booking-success/booking-success?id=b2');
});

test('shared result page reads the server record without regenerating a plan', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('result'); p.onLoad({ shareId: 's1' });
  const pending = p.onShow(); h.respond(h.requests[0], account('a')); await tick();
  h.respond(h.requests[1], config); await tick(); assert.match(h.requests[2].url, /\/api\/shares\/s1$/);
  h.respond(h.requests[2], plan('shared')); await pending; await tick();
  assert.equal(p.data.planId, 'shared'); assert.equal(p.data.bookingVenue.name, '真实场馆');
  assert.equal(p.onShareAppMessage().path, '/pages/result/result?shareId=s1');
  assert.equal(h.requests.some(request => request.method === 'POST'), false);
});

test('export refuses stale booking data when the status refresh fails', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('booking-success'); p.onLoad({ id: 'b1' });
  p.setData({ record: { id: 'b1', statusLabel: '旧状态' }, form: {}, venue: {} });
  const pending = p.saveImage(); h.respond(h.requests[0], account('a')); await tick(); h.requests[1].fail(); await pending;
  assert.equal(p.data.palette, null); assert.equal(p.data.saving, false);
});

test('overlapping booking refreshes cannot overwrite a newer status with an older one', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('booking-success'); p.onLoad({ id: 'b1' });
  const older = p.refreshRecord(), newer = p.refreshRecord();
  const record = { id: 'b1', status: 'CONFIRMED', statusLabel: '预约已确认', payload: Object.assign({}, plan('p1').payload, { bookingForm: {} }) };
  h.respond(h.requests[1], record); await newer;
  h.respond(h.requests[0], Object.assign({}, record, { status: 'PENDING', statusLabel: '待确认' })); await older;
  assert.equal(p.data.record.status, 'CONFIRMED');
});

test('a late result fetch cannot replace the newly rematched plan', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('result'); p.onLoad({ id: 'old' });
  p._loaded = true; p.setData({ demand, result: plan('old').payload.result });
  const loading = p.onShow(); h.respond(h.requests[0], account('a')); await tick();
  const rematch = p.rematchResult(); await tick();
  h.respond(h.requests[2], plan('new')); await rematch;
  h.respond(h.requests[1], plan('old')); await loading;
  assert.equal(p.data.planId, 'new');
});

test('poster export checks revocation and cannot render after a 401', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('poster'); p.onLoad({ id: 'p1' });
  p.setData({ poster: { title: '旧海报' } });
  const saving = p.savePoster(); h.respond(h.requests[0], '账号已停用', 401); await saving;
  assert.equal(p.data.palette, null); assert.equal(p.data.poster, null); assert.equal(h.navigation.length, 1);
});

test('existing UI hashes remain unchanged except the two approved status bindings', () => {
  const baseline = require('./ui-baseline');
  for (const [file, expected] of Object.entries(baseline)) {
    let content = fs.readFileSync(path.join(root, file));
    if (file.replace(/\\/g, '/') === './pages/booking-success/booking-success.wxml') {
      let text = content.toString('utf8');
      // UI whitelist: title and subtitle binding only, no layout/style edits.
      assert.match(text, /\{\{record.statusLabel \|\| '预约已提交'\}\}/);
      assert.match(text, /\{\{statusDescription\}\}/);
      text = text.replace("{{record.statusLabel || '预约已提交'}}", '预约成功')
        .replace('{{statusDescription}}', '已提交场地预约，客户经理将尽快与您联系确认档期');
      content = Buffer.from(text);
    }
    assert.equal(crypto.createHash('sha256').update(content).digest('hex'), expected, file);
  }
});

test('reading an expired runtime token clears PII and redirects once without network access', () => {
  const h = harness();
  h.session.accept(Object.assign(auth('a'), { expiresAt: new Date(Date.now() + 1000).toISOString() }));
  const p = h.page('booking-success'); p.onLoad({ id: 'b1' });
  p.setData({ record: { id: 'b1' }, form: { contactName: 'private', phone: '13800138000' } });
  h.advanceTime(2000);
  assert.equal(h.session.getToken(), ''); assert.equal(h.session.hasSession(), false);
  assert.equal(p.data.record, null); assert.equal(p.data.form, null);
  assert.equal(h.navigation.length, 1); assert.equal(h.requests.length, 0);
  assert.equal(h.storage.has('lanxin_bansai_session_v1'), false);
});

test('onShow hides PII immediately and network failure after expiry clears hidden drafts too', async () => {
  const h = harness();
  h.session.accept(Object.assign(auth('a'), { expiresAt: new Date(Date.now() + 1000).toISOString() }));
  const p = h.page('booking-success'); p.onLoad({ id: 'b1' });
  p.setData({ record: { id: 'b1' }, form: { contactName: 'private', phone: '13800138000' } });
  const pending = p.onShow();
  assert.equal(p.data.form, null); assert.equal(p.data.record, null);
  h.advanceTime(2000); h.requests[0].fail(); await pending;
  assert.equal(h.storage.has('lanxin_bansai_session_v1'), false);
  assert.equal(p._authSnapshot, null); assert.equal(p.data.form, null);
  assert.equal(h.session.hasSession(), false); assert.equal(h.navigation.length, 1);
});

test('same-session ordinary drafts survive failed revalidation and return only after successful me', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('index'); p.onLoad({}); p._loaded = true;
  p.setData({ mode: 'pro_event', sentence: '未提交的普通需求', formValues: { town: '南城' } });
  const failed = p.onShow(); assert.equal(p.data.sentence, ''); h.requests[0].fail(); await failed;
  assert.equal(p.data.sentence, ''); assert.equal(h.session.hasSession(), true);
  const retry = p.onShow(); assert.equal(p.data.sentence, ''); h.respond(h.requests[1], account('a')); await retry;
  assert.equal(p.data.sentence, '未提交的普通需求'); assert.equal(p.data.formValues.town, '南城');
  h.session.accept(auth('b')); assert.equal(p.data.sentence, ''); assert.equal(p._authSnapshot, null);
});

test('cross-organization share booking creates a recipient plan and never mutates or books the source', async () => {
  const h = harness(); h.session.accept(Object.assign(auth('recipient'), { account: Object.assign(account('recipient'), { organizationId: 'recipient-org' }) }));
  const source = plan('source-plan'); source.organizationId = 'source-org';
  source.payload.demand = Object.assign({}, demand, { ownerId: 'source-owner', phone: '13900139000', bookingForm: { phone: '13900139000' } });
  const sourceBefore = clone(source);
  const p = h.page('result'); p.onLoad({ shareId: 'cross-org-share' }); p._loaded = true;
  const loading = p.onShow(); h.respond(h.requests[0], account('recipient')); await tick();
  h.respond(h.requests[1], source); await loading;
  const opening = p.openBooking(); await p.openBooking(); await tick();
  const create = h.requests[2]; assert.match(create.url, /\/api\/plans$/); assert.equal(create.method, 'POST');
  assert.equal(create.header.Authorization, 'Bearer opaque-recipient');
  assert.equal(create.data.demand.ownerId, undefined); assert.equal(create.data.demand.bookingForm, undefined);
  assert.equal(create.data.demand.phone, undefined); assert.equal(create.data.planId, undefined);
  const own = plan('recipient-plan'); own.payload.result.sections[0].items[0].name = '重新匹配的场馆';
  h.respond(create, own); await opening;
  assert.equal(p.record.id, 'recipient-plan'); assert.equal(p.data.planId, 'recipient-plan');
  assert.equal(p._query.shareId, undefined); assert.equal(p.data.bookingVenue.name, '重新匹配的场馆');
  assert.equal(p.data.bookingVisible, true);
  p.setData({ 'bookingForm.contactName': '接收者', 'bookingForm.phone': '13800138000', 'bookingForm.timeSlot': 'evening' });
  const booking = p.submitBooking(); await tick();
  const request = h.requests.find(item => item.url.endsWith('/api/bookings'));
  assert.equal(request.data.planId, 'recipient-plan');
  h.respond(request, { id: 'recipient-booking', status: 'PENDING' }); await booking;
  assert.equal(h.navigation[0].url, '/pages/booking-success/booking-success?id=recipient-booking');
  assert.deepEqual(source, sourceBefore);
  assert.equal(h.requests.some(item => item.url.includes('/plans/source-plan')), false);
});

test('shared booking refresh with no available venue updates own plan but never opens booking', async () => {
  const h = harness(); h.session.accept(auth('recipient')); const p = h.page('result'); p.onLoad({ shareId: 's1' });
  p.applyRecord(plan('source-plan'));
  const pending = p.openBooking(); await tick();
  const own = plan('own-empty'); own.payload.result.sections = [];
  h.respond(h.requests[0], own); await pending;
  assert.equal(p.data.planId, 'own-empty'); assert.equal(p.data.bookingVenue, null);
  assert.equal(p.data.bookingVisible, false); assert.ok(h.toasts.some(item => item.title === '暂无可预约场馆'));
  assert.equal(h.requests.some(item => item.url.endsWith('/api/bookings')), false);
});
