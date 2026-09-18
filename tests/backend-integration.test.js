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
  let privacyListener;
  const wx = {
    onNeedPrivacyAuthorization(listener) { privacyListener = listener; },
    getAccountInfoSync() { return { miniProgram: { appId: 'wx0000000000000001' } }; },
    getPrivacySetting(options) { options.success({ needAuthorization: false, privacyContractName: '测试隐私保护指引' }); },
    request(options) { requests.push(options); },
    getStorageSync(key) { return storage.get(key); },
    setStorageSync(key, value) { writes.push({ key, value: clone(value) }); storage.set(key, clone(value)); },
    removeStorageSync(key) { storage.delete(key); },
    reLaunch(options) { navigation.push(options); }, navigateTo(options) { navigation.push(options); }, switchTab(options) { navigation.push(options); },
    showToast(options) { toasts.push(options); }, showModal(options) { modals.push(options); }, setNavigationBarTitle() {},
    login() { throw new Error('wx.login is forbidden'); },
  };
  const context = vm.createContext({ wx, console, Date: ClockDate, setTimeout, clearTimeout, getCurrentPages: () => pages,
    Page(value) { definition = value; }, Component(value) { definition = value; }, App() {} });
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
  function component(name) {
    load('components/' + name + '/' + name + '.js');
    return Object.assign({ data: clone(definition.data), triggerEvent() {} }, definition.methods);
  }
  const session = load('utils/session.js'), api = load('utils/api.js');
  return { wx, session, api, load, page, component, activePage: () => pages[pages.length - 1], emitPrivacy(resolve) { assert.equal(typeof privacyListener, "function"); privacyListener(resolve, { referrer: "requirePrivacyAuthorize" }); }, requests, navigation, storage, writes, toasts, modals, loaded, respond,
    advanceTime(ms) { now += ms; } };
}

test('login failure surfaces server error; password is masked and never persisted', async () => {
  const h = harness(), p = h.page('login'); p.onLoad({});
  p.setData({ username: 'someone', password: 'plaintext-secret' });
  const pending = p.submitLogin(); await tick();
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
  const pending = p.submitLogin(); await tick();
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
  const pending = p.submitLogin(); await tick(); h.respond(h.requests[0], auth('a')); await pending;
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

test('anonymous entry while the login page is open still leads to login, and the open login page is never reloaded', async () => {
  const h = harness();
  const home = h.page('index'); home.onLoad({}); await home.onShow();            // cold start without a session
  assert.equal(h.navigation.length, 1);
  assert.match(h.navigation[0].url, /^\/pages\/login\/login\?next=/);
  const login = h.page('login'); login.onLoad({ next: encodeURIComponent('/pages/index/index') });
  h.session.redirectToLogin('/pages/history/history');                         // late callback from a closed page
  assert.equal(h.navigation.length, 1, 'the login page being typed into is not reloaded');
  const shared = h.page('result'); shared.options = { shareId: 'share-9' };      // WeChat opens a shared plan card while the app is alive
  shared.onLoad(shared.options); await shared.onShow();
  assert.equal(h.navigation.length, 2, 'the anonymous visitor is taken to login instead of an empty plan page');
  assert.equal(decodeURIComponent(h.navigation[1].url.split('next=')[1]), '/pages/result/result?shareId=share-9');
  assert.equal(h.requests.length, 0); assert.equal(shared.data.result, null);
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
  assert.equal(p.data.featuredItem, undefined); assert.equal(p.data.list.length, 0); assert.match(p.data.emptyText, /暂无资源/);
});

test('every listed resource uses the same card; covers render only when a picture exists', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('library'); p.onLoad({});
  const pending = p.refreshList();
  h.respond(h.requests[0], { items: [{ id: 'v1', name: '有图场馆', cover: 'https://api.lanxin.cyou/media/image/bansai/venues/v1.jpg' },
    { id: 'v2', name: '无图场馆' }], total: 2, page: 1, pageSize: 50 });
  await pending;
  assert.deepEqual(p.data.list.map(item => item.id), ['v1', 'v2'], 'the first item is not split off as a featured card');
  assert.equal(p.data.resourceCount, 2); assert.equal('featuredItem' in p.data, false);
  const ui = fs.readFileSync(path.join(root, 'pages/library/library.wxml'), 'utf8');
  assert.doesNotMatch(ui, /featuredItem|library-feature-card|library-feature-badge/);
  assert.match(ui, /<image wx:if="\{\{item\.cover \|\| item\.avatar \|\| item\.image\}\}" class="library-cover"/);
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

async function accountPage(h) {
  h.session.accept(auth('a'));
  const p = h.page('account'); p.onLoad({});
  const showing = p.onShow(); await tick();
  assert.match(h.requests[0].url, /\/api\/auth\/me$/); h.respond(h.requests[0], account('a')); await showing;
  return p;
}
const typePassword = (p, field, value) => p.onPasswordInput({ currentTarget: { dataset: { field } }, detail: { value } });

test('history offers the account page; the page shows the account and is closed to anonymous visitors', async () => {
  const h = harness(); h.session.accept(auth('a'));
  const history = h.page('history'); history.onLoad({}); history.openAccount();
  assert.equal(h.navigation.at(-1).url, '/pages/account/account');
  assert.equal(h.session.safeNext('/pages/account/account'), '/pages/account/account');
  assert.equal(h.session.safeNext('/pages/account/account?id=1'), '');
  assert.ok(JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).pages.includes('pages/account/account'));
  const ui = fs.readFileSync(path.join(root, 'pages/account/account.wxml'), 'utf8');
  assert.equal(ui.split('password="{{true}}"').length - 1, 3, 'all three password inputs are masked');
  assert.equal(ui.split(fs.readFileSync(path.join(root, 'tests/privacy-overlay.txt'), 'utf8')).length, 2);
  const anonymous = harness(), p = anonymous.page('account'); p.onLoad({}); await p.onShow();
  assert.equal(anonymous.requests.length, 0); assert.equal(p.data.username, '');
  assert.equal(decodeURIComponent(anonymous.navigation[0].url.split('next=')[1]), '/pages/account/account');
  const signedIn = harness(), shown = await accountPage(signedIn);
  assert.equal(shown.data.username, 'a'); assert.equal(signedIn.session.getAccount().token, undefined);
});

test('account page rejects weak or mismatched passwords locally and sends nothing', async () => {
  const h = harness(), p = await accountPage(h);
  typePassword(p, 'username', 'ignored'); assert.equal(p.data.username, 'a', 'only the three password fields are writable');
  const cases = [
    [['', 'new-plaintext-secret', 'new-plaintext-secret'], /请填写/],
    [['old-plaintext-secret', 'elevenchars', 'elevenchars'], /12至128位/],
    [['old-plaintext-secret', '123456789012345', '123456789012345'], /纯数字/],
    [['old-plaintext-secret', '             ', '             '], /空白/],
    [['old-plaintext-secret', 'new-plaintext-secret', 'new-plaintext-secreT'], /不一致/],
    [['old-plaintext-secret', 'old-plaintext-secret', 'old-plaintext-secret'], /不能与当前密码相同/],
  ];
  for (const [[currentPassword, newPassword, confirmPassword], message] of cases) {
    typePassword(p, 'currentPassword', currentPassword); typePassword(p, 'newPassword', newPassword);
    typePassword(p, 'confirmPassword', confirmPassword);
    await p.submitPassword(); assert.match(p.data.error, message);
  }
  assert.equal(h.requests.length, 1, 'only the initial account check reached the network');
  assert.equal(h.session.hasSession(), true); assert.equal(p.data.submitting, false);
});

test('account page changes the password after the privacy check, then signs out without storing any password', async () => {
  const h = harness(), p = await accountPage(h);
  typePassword(p, 'currentPassword', 'old-plaintext-secret'); typePassword(p, 'newPassword', 'new-plaintext-secret');
  typePassword(p, 'confirmPassword', 'new-plaintext-secret');
  const pending = p.submitPassword(); await tick();
  p.submitPassword(); await tick(); assert.equal(h.requests.length, 2, 'a double tap submits once');
  const sent = h.requests[1];
  assert.equal(sent.method, 'PUT'); assert.match(sent.url, /\/api\/auth\/password$/);
  assert.deepEqual(clone(sent.data), { currentPassword: 'old-plaintext-secret', newPassword: 'new-plaintext-secret' });
  assert.equal(sent.header.Authorization, 'Bearer opaque-a');
  h.respond(sent, { reauthenticate: true }); await pending;
  assert.equal(h.session.hasSession(), false); assert.equal(h.storage.has('lanxin_bansai_session_v1'), false);
  assert.equal(decodeURIComponent(h.navigation.at(-1).url.split('next=')[1]), '/pages/index/index');
  assert.match(h.toasts.at(-1).title, /请重新登录/);
  assert.deepEqual([p.data.currentPassword, p.data.newPassword, p.data.confirmPassword, p.data.username], ['', '', '', '']);
  assert.doesNotMatch(JSON.stringify(h.writes) + JSON.stringify(Array.from(h.storage.entries())), /plaintext-secret/);
});

test('a wrong current password keeps the session, clears the fields and allows another attempt', async () => {
  const h = harness(), p = await accountPage(h);
  typePassword(p, 'currentPassword', 'bad-plaintext-secret'); typePassword(p, 'newPassword', 'new-plaintext-secret');
  typePassword(p, 'confirmPassword', 'new-plaintext-secret');
  const pending = p.submitPassword(); await tick();
  h.respond(h.requests[1], '当前密码错误', 400); await pending;
  assert.equal(p.data.error, '当前密码错误'); assert.equal(p.data.submitting, false);
  assert.deepEqual([p.data.currentPassword, p.data.newPassword, p.data.confirmPassword], ['', '', '']);
  assert.equal(h.session.hasSession(), true); assert.equal(h.navigation.length, 0);
  typePassword(p, 'currentPassword', 'old-plaintext-secret'); typePassword(p, 'newPassword', 'new-plaintext-secret');
  typePassword(p, 'confirmPassword', 'new-plaintext-secret');
  const retry = p.submitPassword(); await tick(); assert.equal(h.requests.length, 3);
  h.respond(h.requests[2], { reauthenticate: true }); await retry; assert.equal(h.session.hasSession(), false);
});

test('a failed privacy check never sends the passwords; leaving the page forgets them', async () => {
  const h = harness(), p = await accountPage(h);
  h.wx.getPrivacySetting = options => options.success({ needAuthorization: false, privacyContractName: '' });
  typePassword(p, 'currentPassword', 'old-plaintext-secret'); typePassword(p, 'newPassword', 'new-plaintext-secret');
  typePassword(p, 'confirmPassword', 'new-plaintext-secret');
  await p.submitPassword();
  assert.match(p.data.error, /隐私指引未配置.*未提交密码/); assert.equal(h.requests.length, 1);
  assert.equal(p.data.submitting, false); assert.equal(h.session.hasSession(), true);
  typePassword(p, 'currentPassword', 'old-plaintext-secret'); p.onHide();
  assert.equal(p.data.currentPassword, '');
});

test('logout asks first, revokes the server session and signs out locally even when offline', async () => {
  const h = harness(), p = await accountPage(h);
  p.confirmLogout(); assert.equal(h.modals.length, 1); assert.match(h.modals[0].content, /重新输入账号和密码/);
  await h.modals[0].success({ confirm: false });
  assert.equal(h.requests.length, 1); assert.equal(h.session.hasSession(), true);
  p.confirmLogout(); const leaving = h.modals[1].success({ confirm: true }); await tick();
  p.confirmLogout(); assert.equal(h.modals.length, 2, 'no second dialog while signing out');
  const sent = h.requests[1];
  assert.equal(sent.method, 'POST'); assert.match(sent.url, /\/api\/auth\/logout$/);
  h.respond(sent, true); await leaving;
  assert.equal(h.session.hasSession(), false); assert.equal(h.storage.has('lanxin_bansai_session_v1'), false);
  assert.match(h.navigation.at(-1).url, /^\/pages\/login\/login\?next=/);
  const offline = harness(), q = await accountPage(offline);
  q.confirmLogout(); const out = offline.modals[0].success({ confirm: true }); await tick();
  offline.requests[1].fail({ errMsg: 'request:fail' }); await out;
  assert.equal(offline.session.hasSession(), false); assert.equal(offline.navigation.length, 1);
});

test('network login failures release the submit lock without storing credentials', async () => {
  const h = harness(), p = h.page('login'); p.onLoad({}); p.setData({ username: 'issued', password: 'secret' });
  const pending = p.submitLogin(); await tick(); await p.submitLogin(); assert.equal(h.requests.length, 1);
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

test('a plan without matched resources never leads to a blank poster page', async () => {
  const emptyResult = { summary: '暂时没有完全匹配的方案', sections: [], alternatives: [], matchScore: 0, posterPayload: null };
  const h = harness(); h.session.accept(auth('a'));
  const r = h.page('result'); r.onLoad({ id: 'p0' }); r.setData({ result: emptyResult });
  r.openPoster();
  assert.equal(h.navigation.length, 0); assert.match(h.toasts.at(-1).title, /暂无可分享的海报/);
  r.setData({ result: plan('p0').payload.result }); r.openPoster();
  assert.equal(h.navigation.length, 1); assert.equal(h.navigation[0].url, '/pages/poster/poster?id=p0');

  for (const hasHistory of [true, false]) {
    const d = harness(); d.session.accept(auth('a'));
    const back = []; d.wx.navigateBack = options => { back.push(options); if (!hasHistory) options.fail(); };
    d.wx.redirectTo = options => d.navigation.push(options);
    const empty = plan('p0'); empty.payload.result = emptyResult;
    const p = d.page('poster'); p.onLoad({ id: 'p0' });
    const showing = p.onShow(); await tick();
    assert.match(d.requests[0].url, /\/api\/auth\/me$/); d.respond(d.requests[0], account('a')); await tick();
    assert.match(d.requests[1].url, /\/api\/plans\/p0$/); d.respond(d.requests[1], empty); await showing;
    assert.equal(p.data.poster, null); assert.match(d.toasts.at(-1).title, /暂无可用海报/);
    assert.equal(back.length, 1);
    assert.deepEqual(d.navigation.map(n => n.url), hasHistory ? [] : ['/pages/result/result?id=p0']);
    assert.equal(d.requests.length, 2, 'no share is created for a plan without a poster');
    await p.savePoster(); assert.equal(d.requests.length, 2); assert.equal(p.data.palette, null);
  }
});

test('existing UI hashes allow only exact approved text and privacy entry changes', () => {
  const baseline = require('./ui-baseline');
  for (const [file, expected] of Object.entries(baseline)) {
    let content = fs.readFileSync(path.join(root, file));
    let approved = content.toString('utf8');
    for (const [before, after, count = 1] of require('./ui-approved-changes')[file] || []) {
      assert.equal(approved.split(after).length - 1, count, file + ': exact approved occurrence count');
      for (let i = 0; i < count; i++) approved = approved.replace(after, before);
    }
    content = Buffer.from(approved);
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

// Privacy/export regression cases use isolated wx mocks; no live requests or credentials.
function exportHarness() {
  const h = harness(); h.session.accept(auth('a'));
  const p = h.page('booking-success'); p.onLoad({ id: 'b1' });
  const calls = []; let authorized = false;
  h.wx.getPrivacySetting = options => { calls.push('check'); options.success({ needAuthorization: !authorized, privacyContractName: '测试隐私保护指引' }); };
  h.wx.requirePrivacyAuthorize = options => {
    calls.push('authorize');
    h.emitPrivacy(resolution => {
      if (resolution.event === 'agree') {
        assert.equal(resolution.buttonId, 'bansai-privacy-agree');
        authorized = true; options.success({ errMsg: 'requirePrivacyAuthorize:ok' });
      } else if (resolution.event === 'disagree') options.fail({ errMsg: 'requirePrivacyAuthorize:fail privacy permission is not authorized' });
    });
    // Simulate the user only after the official onNeed callback shows the overlay.
    setImmediate(() => {
      const activePage = h.activePage();
      assert.equal(activePage.data.privacyVisible, true);
      activePage.agreePrivacyAuthorization({ type: 'agreeprivacyauthorization', currentTarget: { id: 'bansai-privacy-agree' } });
    });
  };
  h.wx.saveImageToPhotosAlbum = options => { calls.push('save'); options.success({}); };
  h.wx.previewImage = () => { throw new Error('must not preview after failure'); };
  h.wx.openSetting = () => { throw new Error('must not force settings'); };
  return { h, p, calls, exporter: h.load('utils/image-export.js') };
}

test('export calls real wx privacy authorization and rechecks before album write; duplicate callbacks save once', async () => {
  const { h, p, calls, exporter } = exportHarness();
  const palette = { width: '654rpx', views: [] };
  await exporter.start(p, async () => palette);
  assert.deepEqual(calls, ['check', 'authorize', 'check']);
  assert.deepEqual(p.data.palette, palette); assert.equal(p.data.saving, true);
  const first = p.onImgOK({ detail: { path: 'safe.png' } });
  await p.onImgOK({ detail: { path: 'duplicate.png' } }); await first;
  assert.deepEqual(calls, ['check', 'authorize', 'check', 'check', 'save']);
  assert.equal(p.data.saving, false); assert.equal(p.data.palette, null);
  assert.equal(h.toasts.filter(item => item.icon === 'success').length, 1);
  assert.equal(h.modals.length, 0);
});

test('already-authorized privacy state does not prompt again', async () => {
  const { h, p, calls, exporter } = exportHarness();
  h.wx.getPrivacySetting = options => options.success({ needAuthorization: false, privacyContractName: '测试隐私保护指引' });
  await exporter.start(p, async () => ({ views: [] }));
  await p.onImgOK({ detail: { path: 'safe.png' } });
  assert.deepEqual(calls, ['save']);
});

for (const scenario of ['missing-api', 'check-fails', 'malformed-setting', 'authorize-cancel', 'authorize-deny', 'authorize-api-missing', 'consent-not-recorded']) {
  test('privacy fails closed before rendering: ' + scenario, async () => {
    const { h, p, calls, exporter } = exportHarness();
    if (scenario === 'missing-api') delete h.wx.getPrivacySetting;
    if (scenario === 'check-fails') h.wx.getPrivacySetting = options => options.fail({ errMsg: 'network error' });
    if (scenario === 'malformed-setting') h.wx.getPrivacySetting = options => options.success({});
    if (scenario === 'authorize-api-missing') delete h.wx.requirePrivacyAuthorize;
    if (scenario === 'authorize-cancel') h.wx.requirePrivacyAuthorize = options => options.fail({ errMsg: 'requirePrivacyAuthorize:fail cancel' });
    if (scenario === 'authorize-deny') h.wx.requirePrivacyAuthorize = options => options.fail({ errMsg: 'requirePrivacyAuthorize:fail auth deny' });
    if (scenario === 'consent-not-recorded') h.wx.requirePrivacyAuthorize = options => options.success({});
    await exporter.start(p, async () => ({ views: [] }));
    await p.onImgOK({ detail: { path: 'late.png' } });
    assert.equal(p.data.palette, null); assert.equal(p.data.saving, false);
    assert.equal(calls.includes('save'), false); assert.equal(h.modals.length, 0);
    assert.ok(h.toasts.every(item => item.icon !== 'success'));
  });
}

test('revoked privacy between rendering and album callback blocks saving', async () => {
  const { h, p, calls, exporter } = exportHarness();
  await exporter.start(p, async () => ({ views: [] }));
  h.wx.getPrivacySetting = options => options.success({ needAuthorization: true, privacyContractName: '测试隐私保护指引' });
  h.wx.requirePrivacyAuthorize = options => options.fail({ errMsg: 'cancel' });
  await p.onImgOK({ detail: { path: 'safe.png' } });
  assert.equal(calls.includes('save'), false); assert.equal(p.data.saving, false);
  assert.match(h.toasts.at(-1).title, /取消|未授权/);
});

for (const reason of ['cancel', 'auth deny', 'disk full']) {
  test('album failure releases lock without preview/settings fallback: ' + reason, async () => {
    const { h, p, exporter } = exportHarness();
    h.wx.saveImageToPhotosAlbum = options => options.fail({ errMsg: reason });
    await exporter.start(p, async () => ({ views: [] }));
    await p.onImgOK({ detail: { path: 'safe.png' } });
    assert.equal(p.data.saving, false); assert.equal(p.data.palette, null);
    assert.ok(h.toasts.every(item => item.icon !== 'success'));
    await exporter.start(p, async () => ({ views: [] }));
    assert.equal(p.data.saving, true); // retry is a new explicit action
    p.onImgErr(); assert.equal(p.data.saving, false);
  });
}

for (const action of ['account-switch', 'unload']) {
  test('pending privacy callback cannot export after ' + action, async () => {
    const { h, p, calls, exporter } = exportHarness(); let pendingCheck;
    h.wx.getPrivacySetting = options => { pendingCheck = options; };
    const task = exporter.start(p, async () => ({ views: [] })); await tick();
    if (action === 'account-switch') h.session.accept(auth('b')); else p.onUnload();
    pendingCheck.success({ needAuthorization: false, privacyContractName: '测试隐私保护指引' }); await task;
    await p.onImgOK({ detail: { path: 'late.png' } });
    assert.equal(calls.includes('save'), false); assert.equal(p.data.palette, null);
    assert.equal(h.toasts.length, 0);
  });
}

test('painter errors or missing image paths fail closed and allow retry', async () => {
  const { h, p, calls, exporter } = exportHarness();
  await exporter.start(p, async () => ({ views: [] }));
  await p.onImgOK({ detail: {} }); assert.equal(p.data.saving, false);
  await exporter.start(p, async () => ({ views: [] })); p.onImgErr();
  assert.equal(p.data.saving, false); assert.equal(calls.includes('save'), false);
  assert.ok(h.toasts.every(item => item.icon !== 'success'));
});

test('booking export masks all contact fields and freeform remarks without altering the record', async () => {
  const { h, p, calls } = exportHarness();
  const form = { expectedDate: '2026-10-10', timeSlot: 'evening', contactName: '私密接收者', phone: '13800138000', wechat: 'private_recipient', remark: '包含他人联系方式13900139000' };
  const record = { id: 'b1', status: 'PENDING', statusLabel: '预约成功', payload: { demand, bookingForm: form, result: plan('p1').payload.result } };
  p.setData({ record, form, venue: {} });
  const saving = p.saveImage(); h.respond(h.requests[0], account('a')); await tick();
  h.respond(h.requests[1], record); await saving;
  const exported = JSON.stringify(p.data.palette);
  for (const key of ['contactName', 'phone', 'wechat', 'remark']) assert.equal(exported.includes(form[key]), false, key);
  assert.equal((exported.match(/已隐藏/g) || []).length, 4);
  assert.deepEqual(p.data.form, form);
  assert.equal(p.data.record.status, 'PENDING'); assert.equal(p.data.record.statusLabel, '预约意向待确认');
  assert.doesNotMatch(exported, /客户经理|尽快|预约成功|准备好/);
  await p.onImgOK({ detail: { path: 'redacted.png' } }); assert.equal(calls.at(-1), 'save');
});

test('poster page uses the same privacy gate before render and album save', async () => {
  const { h, calls } = exportHarness(); const p = h.page('poster'); p.onLoad({ id: 'p1' });
  p.setData({ poster: { title: '海报' } });
  const saving = p.savePoster(); h.respond(h.requests[0], account('a')); await tick();
  h.respond(h.requests[1], plan('p1')); await saving;
  assert.deepEqual(calls, ['check', 'authorize', 'check']);
  assert.match(JSON.stringify(p.data.palette), /资源仅供参考/);
  await p.onImgOK({ detail: { path: 'poster.png' } }); assert.equal(calls.at(-1), 'save');
});

test('PENDING labels stay honest in lists and submissions even with misleading server copy', async () => {
  const h = harness(); h.session.accept(auth('a')); const storage = h.load('utils/storage.js');
  const record = { id: 'b1', status: 'PENDING', statusLabel: '客户经理已准备好' };
  const listing = storage.getBookings(); h.respond(h.requests[0], { items: [record], page: 1, pageSize: 50, total: 1 });
  assert.equal((await listing)[0].statusLabel, '预约意向待确认');
  const saving = storage.saveBooking('p1', {}, 'test-request'); h.respond(h.requests[1], record);
  const result = await saving; assert.equal(result.status, 'PENDING'); assert.equal(result.statusLabel, '预约意向待确认');
});

for (const where of ['config', 'contact', 'venue', 'result']) {
  test('info mode blocks booking open and direct submission: ' + where, async () => {
    const h = harness(); h.session.accept(auth('a')); const p = h.page('result'); p.onLoad({ shareId: 's1' });
    const source = plan('p1');
    if (where === 'config') p._config = { resourceMode: 'info' };
    if (where === 'contact') h.session.setContact({ mode: 'info' });
    if (where === 'venue') source.payload.result.sections[0].items[0].bookingMode = 'info';
    if (where === 'result') source.payload.result.mode = 'info';
    p.applyRecord(source); assert.equal(p.data.infoOnly, true);
    await p.openBooking(); assert.equal(p.data.bookingVisible, false);
    p.setData({ bookingVisible: true }); await p.submitBooking();
    assert.equal(h.requests.length, 0); assert.match(h.toasts.at(-1).title, /不支持代订/);
  });
}

test('recipient rematch to an info-only venue does not open booking', async () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('result'); p.onLoad({ shareId: 's1' });
  p.applyRecord(plan('source')); const opening = p.openBooking(); await tick();
  const own = plan('own'); own.payload.result.sections[0].items[0].mode = 'info';
  h.respond(h.requests[0], own); await opening;
  assert.equal(p.data.infoOnly, true); assert.equal(p.data.bookingVisible, false);
  assert.equal(h.requests.some(item => item.url.endsWith('/api/bookings')), false);
});

test('unconfigured and legacy sample contacts never dial, copy or preview', () => {
  const h = harness();
  h.session.setContact({ wechat: 'Lanxin-kefu', qrCode: '/assets/contact-qr.png' });
  const contact = h.session.getContact(); assert.equal(contact.configured, false); assert.equal(contact.name, '客服未配置');
  const component = h.component('open-guide'); component.copyWechat(); component.callPhone(); component.previewQr();
  assert.equal(h.toasts.length, 3); assert.ok(h.toasts.every(item => /配置/.test(item.title)));
  h.session.setContact({ phone: '123', wechat: 'real-service' }); component.data.contact = h.session.getContact();
  const actions = []; h.wx.setClipboardData = options => actions.push(options.data); h.wx.makePhoneCall = options => actions.push(options.phoneNumber);
  component.copyWechat(); component.callPhone(); assert.deepEqual(actions, ['real-service', '123']);
});

test('login privacy entry opens platform contract without login and reports unavailable API', async () => {
  const h = harness(); const p = h.page('login'); let opened = 0;
  h.wx.openPrivacyContract = options => { opened++; options.success({}); };
  await p.openPrivacyContract(); assert.equal(opened, 1); assert.equal(h.requests.length, 0);
  delete h.wx.openPrivacyContract; await p.openPrivacyContract();
  assert.match(h.toasts.at(-1).title, /暂不可用/); assert.equal(h.session.hasSession(), false);
});

test('all share branches use a packaged public cover, never automatic screenshots of recipient PII', async () => {
  const h = harness(); const share = h.load('utils/share.js'); const p = h.page('booking-success');
  p.setData({ form: { contactName: '私密用户', phone: '13800138000', wechat: 'private', remark: 'secret' } });
  const anonymous = p.onShareAppMessage(); assert.ok(fs.existsSync(path.join(root, anonymous.imageUrl)));
  h.session.accept(auth('a'));
  const pending = share.prepareShare(p, 'p1'); const message = p.onShareAppMessage();
  h.respond(h.requests[0], { shareId: 's1', expiresAt: '2099-01-01T00:00:00Z' }); await pending;
  for (const result of [anonymous, message, await message.promise, p.onShareAppMessage()]) {
    assert.equal(result.imageUrl, anonymous.imageUrl); assert.doesNotMatch(JSON.stringify(result), /私密用户|13800138000|private|secret/);
  }
});

test('cancelling the booking form keeps the draft and never submits a request', () => {
  const h = harness(); h.session.accept(auth('a')); const p = h.page('result'); p.onLoad({ id: 'p1' });
  const form = { contactName: '草稿', phone: '13800138000', wechat: 'draft', remark: 'private draft' };
  p.setData({ bookingVisible: true, bookingDateCalendarVisible: true, bookingForm: form });
  p.closeBooking();
  assert.equal(p.data.bookingVisible, false); assert.equal(p.data.bookingDateCalendarVisible, false);
  assert.deepEqual(p.data.bookingForm, form); assert.equal(h.requests.length, 0);
});

test('export completion clears a hidden auth snapshot so returning cannot restore stale saving state', async () => {
  const { p, exporter } = exportHarness();
  await exporter.start(p, async () => ({ views: [] }));
  p._authSnapshot = clone(p.data);
  await p.onImgOK({ detail: { path: 'safe.png' } });
  assert.equal(p._authSnapshot.saving, false); assert.equal(p._authSnapshot.palette, null);
});

function sensitiveHarness(kind) {
  const h = harness();
  if (kind === 'booking') h.session.accept(auth('a'));
  const p = h.page(kind === 'login' ? 'login' : 'result'); p.onLoad(kind === 'login' ? {} : { id: 'p1' });
  if (kind === 'login') p.setData({ username: 'issued', password: 'mock-password' });
  else p.setData({ bookingVisible: true, planId: 'p1', bookingVenue: { id: 'v1' }, bookingForm: {
    contactName: '测试联系人', phone: '13800138000', wechat: 'test-private', remark: '测试备注', expectedDate: '2026-10-10', timeSlot: 'evening',
  } });
  return { h, p, submit: () => kind === 'login' ? p.submitLogin() : p.submitBooking() };
}

for (const kind of ['login', 'booking']) {
  for (const reason of ['empty-name', 'missing-name', 'whitespace-name', 'empty-appid', 'guest-appid', 'platform-fails', 'cancel']) {
    test(kind + ' sends no personal data when privacy is unavailable: ' + reason, async () => {
      const { h, p, submit } = sensitiveHarness(kind);
      if (reason === 'empty-name') h.wx.getPrivacySetting = options => options.success({ needAuthorization: false, privacyContractName: '' });
      if (reason === 'missing-name') h.wx.getPrivacySetting = options => options.success({ needAuthorization: false });
      if (reason === 'whitespace-name') h.wx.getPrivacySetting = options => options.success({ needAuthorization: false, privacyContractName: '  \n ' });
      if (reason === 'empty-appid') h.wx.getAccountInfoSync = () => ({ miniProgram: { appId: '' } });
      if (reason === 'guest-appid') h.wx.getAccountInfoSync = () => ({ miniProgram: { appId: 'touristappid' } });
      if (reason === 'platform-fails') h.wx.getPrivacySetting = options => options.fail({ errMsg: 'getPrivacySetting:fail invalid appid' });
      if (reason === 'cancel') {
        h.wx.getPrivacySetting = options => options.success({ needAuthorization: true, privacyContractName: '测试隐私指引' });
        h.wx.requirePrivacyAuthorize = options => options.fail({ errMsg: 'requirePrivacyAuthorize:fail cancel' });
      }
      const writeCount = h.writes.length;
      await submit();
      assert.equal(h.requests.length, 0); assert.equal(h.navigation.length, 0); assert.equal(h.writes.length, writeCount);
      assert.equal(h.modals.length, 0);
      if (kind === 'login') {
        assert.equal(p.data.submitting, false); assert.equal(p.data.password, '');
        assert.match(p.data.error, /未提交登录信息/);
      } else {
        assert.equal(p._bookingSubmitting, false); assert.equal(p.data.bookingVisible, true);
        assert.equal(p.data.bookingForm.phone, '13800138000'); assert.match(h.toasts.at(-1).title, /未提交预约资料/);
      }
    });
  }

  test(kind + ' waits for official button, platform success and contract recheck before sending once', async () => {
    const { h, p, submit } = sensitiveHarness(kind);
    const platform = officialPrivacy(h);
    const task = submit(); await tick(); await submit();
    assert.equal(h.requests.length, 0); assert.equal(p.data.privacyVisible, true);
    assert.deepEqual(platform.events, ['check', 'require', 'need']);
    platform.agree(p); await tick();
    assert.deepEqual(platform.events, ['check', 'require', 'need', 'agree', 'check']);
    assert.equal(h.requests.length, 1);
    h.respond(h.requests[0], kind === 'login' ? auth('a') : { id: 'b1', status: 'PENDING' }); await task;
    assert.equal(p.data.privacyVisible, false); assert.equal(h.modals.length, 0);
    assert.equal(h.writes.some(item => /privacy|consent|agreed/i.test(item.key)), false);
  });
}

test('contract name must remain configured after platform consent, even if needAuthorization becomes false', async () => {
  const { h, p, submit } = sensitiveHarness('login'); let count = 0;
  h.wx.getPrivacySetting = options => options.success(++count === 1
    ? { needAuthorization: true, privacyContractName: '测试隐私指引' }
    : { needAuthorization: false, privacyContractName: '' });
  h.wx.requirePrivacyAuthorize = options => h.emitPrivacy(resolution => {
    if (resolution.event === 'agree') options.success({ errMsg: 'requirePrivacyAuthorize:ok' });
  });
  const task = submit(); await tick();
  p.agreePrivacyAuthorization({ type: 'agreeprivacyauthorization', currentTarget: { id: 'bansai-privacy-agree' } });
  await task; assert.equal(count, 2); assert.equal(h.requests.length, 0); assert.match(p.data.error, /隐私指引未配置/);
});

test('closing booking while privacy is pending stops the submission after consent returns', async () => {
  const { h, p, submit } = sensitiveHarness('booking'); let pending;
  h.wx.getPrivacySetting = options => { pending = options; };
  const task = submit(); await tick(); p.closeBooking();
  pending.success({ needAuthorization: false, privacyContractName: '测试隐私指引' }); await task;
  assert.equal(h.requests.length, 0); assert.equal(p._bookingSubmitting, false);
});

test('leaving login while privacy is pending never sends the captured password', async () => {
  const { h, p, submit } = sensitiveHarness('login'); let pending;
  h.wx.getPrivacySetting = options => { pending = options; };
  const task = submit(); await tick(); p.onUnload();
  pending.success({ needAuthorization: false, privacyContractName: '测试隐私指引' }); await task;
  assert.equal(h.requests.length, 0); assert.equal(p.data.password, '');
});

test('album rendering fails closed for missing contract name despite needAuthorization=false', async () => {
  const { h, p, calls, exporter } = exportHarness();
  h.wx.getPrivacySetting = options => options.success({ needAuthorization: false });
  await exporter.start(p, async () => ({ views: [] }));
  await p.onImgOK({ detail: { path: 'never.png' } });
  assert.equal(p.data.palette, null); assert.equal(p.data.saving, false); assert.equal(calls.includes('save'), false);
});

test('resource becoming info-only while authorization is pending blocks personal data submission', async () => {
  const { h, p, submit } = sensitiveHarness('booking'); let pending;
  h.wx.getPrivacySetting = options => { pending = options; };
  const task = submit(); await tick(); h.session.setContact({ mode: 'info' });
  pending.success({ needAuthorization: false, privacyContractName: '测试隐私指引' }); await task;
  assert.equal(h.requests.length, 0); assert.equal(p._bookingSubmitting, false);
  assert.match(h.toasts.at(-1).title, /状态已变更/);
});

// Platform-shaped first-use mock: require -> listener(resolve, eventInfo) ->
// official button event -> checked resolve({event, buttonId}) -> API callback.
// No synthetic unsubscribe API and no automatic grant before a button event.
function officialPrivacy(h, { recordConsent = true, deferSuccess = false } = {}) {
  const events = [], resolutions = []; let authorized = false, clicked = false, delayed;
  h.wx.getPrivacySetting = options => {
    events.push('check'); options.success({ needAuthorization: !authorized, privacyContractName: '《测试隐私保护指引》' });
  };
  const requireAuthorization = options => {
    events.push('require');
    if (authorized) { options.success({ errMsg: 'requirePrivacyAuthorize:ok' }); return; }
    events.push('need');
    h.emitPrivacy(resolution => {
      resolutions.push(clone(resolution)); events.push(resolution.event);
      if (resolution.event === 'agree') {
        assert.equal(clicked, true, 'platform only accepts a clicked official button');
        assert.equal(resolution.buttonId, 'bansai-privacy-agree');
        authorized = recordConsent;
        const complete = () => options.success({ errMsg: 'requirePrivacyAuthorize:ok' });
        if (deferSuccess) delayed = complete; else complete();
      } else if (resolution.event === 'disagree') {
        options.fail({ errMsg: 'requirePrivacyAuthorize:fail privacy permission is not authorized' });
      }
    });
  };
  h.wx.requirePrivacyAuthorize = requireAuthorization;
  return {
    events, resolutions,
    agree(page) {
      assert.equal(page.data.privacyVisible, true);
      clicked = true;
      try { page.agreePrivacyAuthorization({ type: 'agreeprivacyauthorization', currentTarget: { id: 'bansai-privacy-agree' } }); }
      finally { clicked = false; }
    },
    complete() { assert.equal(typeof delayed, 'function'); delayed(); },
    reset() { authorized = false; },
    requireAuthorization,
  };
}

test('first authorization works with official APIs and no unsubscribe API; ordinary taps cannot grant consent', async () => {
  const { h, p, submit } = sensitiveHarness('login'); const platform = officialPrivacy(h);
  assert.equal(typeof h.wx.offNeedPrivacyAuthorization, 'undefined');
  const task = submit(); await tick();
  assert.equal(p.data.privacyVisible, true); assert.equal(p.data.privacyContractName, '《测试隐私保护指引》');
  p.agreePrivacyAuthorization({ type: 'tap', currentTarget: { id: 'bansai-privacy-agree' } });
  p.agreePrivacyAuthorization({ type: 'agreeprivacyauthorization', currentTarget: { id: 'wrong' } });
  assert.equal(platform.resolutions.length, 0); assert.equal(h.requests.length, 0);
  platform.agree(p); await tick();
  assert.deepEqual(platform.resolutions, [{ event: 'agree', buttonId: 'bansai-privacy-agree' }]);
  h.respond(h.requests[0], auth('a')); await task;
  assert.ok(h.toasts.every(item => !/升级/.test(item.title)));
});

test('button event alone cannot submit until the platform success callback and state recheck', async () => {
  const { h, p, submit } = sensitiveHarness('login'); const platform = officialPrivacy(h, { deferSuccess: true });
  const task = submit(); await tick(); platform.agree(p); await tick();
  assert.equal(h.requests.length, 0); assert.equal(p.data.submitting, true);
  platform.complete(); await tick(); assert.equal(h.requests.length, 1);
  h.respond(h.requests[0], auth('a')); await task;
});

for (const kind of ['login', 'booking']) {
  test(kind + ' official cancel resolves disagree, releases lock, and permits a new explicit authorization attempt', async () => {
    const { h, p, submit } = sensitiveHarness(kind); const platform = officialPrivacy(h);
    const task = submit(); await tick(); p.cancelPrivacyAuthorization(); await task;
    assert.deepEqual(platform.resolutions, [{ event: 'disagree' }]);
    assert.equal(h.requests.length, 0); assert.equal(p.data.privacyVisible, false);
    assert.equal(kind === 'login' ? p.data.submitting : p._bookingSubmitting, false);
    if (kind === 'login') p.setData({ password: 'new-mock-password' });
    const retry = submit(); await tick(); platform.agree(p); await tick();
    h.respond(h.requests[0], kind === 'login' ? auth('a') : { id: 'b1', status: 'PENDING' }); await retry;
    assert.equal(h.requests.length, 1);
  });
}

for (const name of ['poster', 'booking-success']) {
  test(name + ' first-use album authorization is cancellable and never saves after disagree', async () => {
    const h = harness(); h.session.accept(auth('a')); const p = h.page(name); p.onLoad({ id: 'p1' });
    const platform = officialPrivacy(h); let saved = 0;
    h.wx.saveImageToPhotosAlbum = () => { saved++; };
    const exporter = h.load('utils/image-export.js');
    const task = exporter.start(p, async () => ({ views: [] })); await tick();
    p.cancelPrivacyAuthorization(); await task;
    await p.onImgOK({ detail: { path: 'late.png' } });
    assert.equal(saved, 0); assert.equal(p.data.saving, false); assert.equal(p.data.palette, null);
    assert.deepEqual(platform.resolutions, [{ event: 'disagree' }]);
  });
}

test('same-page concurrent privacy callers share one platform challenge and one registered listener', async () => {
  const { h, p } = sensitiveHarness('login'); const platform = officialPrivacy(h);
  let registrations = 0; const register = h.wx.onNeedPrivacyAuthorization;
  h.wx.onNeedPrivacyAuthorization = fn => { registrations++; register(fn); };
  const privacy = h.load('utils/privacy.js');
  const first = privacy.requirePrivacy(p), second = privacy.requirePrivacy(p);
  assert.equal(first, second); await tick(); platform.agree(p); await Promise.all([first, second]);
  platform.reset(); const retry = privacy.requirePrivacy(p); await tick(); platform.agree(p); await retry;
  assert.equal(registrations, 1); assert.equal(platform.events.filter(e => e === 'require').length, 2);
});

test('concurrent platform listeners are each resolved once by the same official button event', async () => {
  const { h, p } = sensitiveHarness('login'); const platform = officialPrivacy(h);
  const privacy = h.load('utils/privacy.js'); const task = privacy.requirePrivacy(p); await tick();
  let extraSuccess = 0;
  platform.requireAuthorization({ success() { extraSuccess++; }, fail() {} });
  platform.agree(p); await task;
  p.agreePrivacyAuthorization({ type: 'agreeprivacyauthorization', currentTarget: { id: 'bansai-privacy-agree' } });
  assert.equal(extraSuccess, 1); assert.equal(platform.resolutions.length, 2);
});

for (const lifecycle of ['onHide', 'onUnload']) {
  test('pending official request disagrees on ' + lifecycle + ' without removing the listener', async () => {
    const { h, p, submit } = sensitiveHarness('login'); const platform = officialPrivacy(h);
    const task = submit(); await tick(); p[lifecycle](); await task;
    assert.deepEqual(platform.resolutions, [{ event: 'disagree' }]);
    assert.equal(h.requests.length, 0);
    const late = []; h.emitPrivacy(resolution => late.push(clone(resolution)));
    assert.deepEqual(late, [{ event: 'disagree' }]);
  });
}

test('session change cancels the pending official challenge and never submits the previous booking form', async () => {
  const { h, p, submit } = sensitiveHarness('booking'); const platform = officialPrivacy(h);
  const task = submit(); await tick(); h.session.accept(auth('b')); await task;
  assert.deepEqual(platform.resolutions, [{ event: 'disagree' }]);
  assert.equal(h.requests.length, 0); assert.equal(p.data.privacyVisible, false);
});

test('viewing the official contract preserves the prompt for a subsequent official agreement on return', async () => {
  const { h, p, submit } = sensitiveHarness('login'); const platform = officialPrivacy(h);
  h.wx.openPrivacyContract = options => { p.onHide(); options.success({ errMsg: 'openPrivacyContract:ok' }); };
  const task = submit(); await tick(); await p.openPrivacyContract();
  assert.equal(platform.resolutions.length, 0); assert.equal(h.requests.length, 0);
  p.onShow(); platform.agree(p); await tick();
  h.respond(h.requests[0], auth('a')); await task;
});

test('official agreement without a recorded platform grant fails the post-authorization state check', async () => {
  const { h, p, submit } = sensitiveHarness('login'); const platform = officialPrivacy(h, { recordConsent: false });
  const task = submit(); await tick(); platform.agree(p); await task;
  assert.equal(h.requests.length, 0); assert.match(p.data.error, /尚未完成微信隐私授权/);
});

test('missing real listener API fails closed for first authorization', async () => {
  const { h, p, submit } = sensitiveHarness('login'); officialPrivacy(h); delete h.wx.onNeedPrivacyAuthorization;
  await submit(); assert.equal(h.requests.length, 0); assert.equal(p.data.submitting, false);
  assert.match(p.data.error, /不支持隐私授权/);
});

test('approved privacy overlay is exact, conditional, and uses only the official consent event', () => {
  const overlay = fs.readFileSync(path.join(root, 'tests/privacy-overlay.txt'), 'utf8');
  assert.match(overlay, /wx:if="\{\{privacyVisible\}\}"/);
  assert.match(overlay, /id="bansai-privacy-agree"[^>]+open-type="agreePrivacyAuthorization" bindagreeprivacyauthorization="agreePrivacyAuthorization"/);
  assert.doesNotMatch(overlay, /bindtap="agreePrivacyAuthorization"/);
  for (const name of ['login', 'result', 'poster', 'booking-success']) {
    const ui = fs.readFileSync(path.join(root, 'pages', name, name + '.wxml'), 'utf8');
    assert.equal(ui.split(overlay).length, 2, name);
  }
  const runtime = fs.readFileSync(path.join(root, 'utils/privacy.js'), 'utf8');
  assert.doesNotMatch(runtime, /offNeedPrivacyAuthorization|setStorageSync|showModal/);
});

test('idle or setting-check listener events cannot borrow another operation to bypass contract validation', async () => {
  const { h, p } = sensitiveHarness('login'); const platform = officialPrivacy(h);
  const privacy = h.load('utils/privacy.js');
  const first = privacy.requirePrivacy(p); await tick(); platform.agree(p); await first;
  platform.reset(); const getSetting = h.wx.getPrivacySetting; let check;
  h.wx.getPrivacySetting = options => { check = options; };
  const second = privacy.requirePrivacy(p); await tick();
  const unrelated = []; h.emitPrivacy(resolution => unrelated.push(clone(resolution)));
  assert.deepEqual(unrelated, [{ event: 'disagree' }]); assert.equal(p.data.privacyVisible, false);
  h.wx.getPrivacySetting = getSetting;
  check.success({ needAuthorization: true, privacyContractName: '《测试隐私保护指引》' }); await tick();
  platform.agree(p); await second;
});

test('UI approval cannot absorb duplicate overlays, modified overlay styles or extra normal-page markup', () => {
  const file = './pages/login/login.wxml';
  const original = fs.readFileSync(path.join(root, file), 'utf8');
  const overlay = fs.readFileSync(path.join(root, 'tests/privacy-overlay.txt'), 'utf8');
  const undo = source => {
    for (const [before, after, count = 1] of require('./ui-approved-changes')[file]) {
      assert.equal(source.split(after).length - 1, count);
      for (let i = 0; i < count; i++) source = source.replace(after, before);
    }
    return crypto.createHash('sha256').update(source).digest('hex');
  };
  assert.equal(undo(original), require('./ui-baseline')[file]);
  assert.throws(() => undo(original + overlay));
  assert.throws(() => undo(original.replace('width:600rpx', 'width:601rpx')));
  assert.notEqual(undo(original + '<view>额外页面布局</view>'), require('./ui-baseline')[file]);
});

for (const terminal of ['success', 'fail', 'complete']) {
  test('cancel before onNeed retains global ownership until old platform ' + terminal + '; old events use current listener', async () => {
    const h = harness(); h.session.accept(auth('a'));
    const a = h.page('poster'); a.onLoad({ id: 'a' });
    const b = h.page('booking-success'); b.onLoad({ id: 'b' });
    const privacy = h.load('utils/privacy.js');
    let authorized = false;
    h.wx.getPrivacySetting = options => options.success({ needAuthorization: !authorized, privacyContractName: '《测试隐私保护指引》' });
    const platformRequests = [];
    h.wx.requirePrivacyAuthorize = options => { platformRequests.push(options); }; // No onNeed yet.
    const first = privacy.requirePrivacy(a);
    const cancelled = assert.rejects(first, /取消|拒绝/);
    await tick(); assert.equal(platformRequests.length, 1);
    a.cancelPrivacyAuthorization(); await cancelled;
    assert.equal(a.data.privacyVisible, false);
    assert.equal(h.requests.length, 0);
    // The page/caller is free immediately, but B must not replace the platform owner.
    const blocked = privacy.requirePrivacy(b).then(() => null, error => error);
    await tick();
    const oldResolution = [];
    // emitPrivacy dispatches through the CURRENT global listener in the harness,
    // not a captured listener from A; the old resolver itself arrives late.
    h.emitPrivacy(resolution => oldResolution.push(clone(resolution)));
    b.agreePrivacyAuthorization({ type: 'agreeprivacyauthorization', currentTarget: { id: 'bansai-privacy-agree' } });
    assert.deepEqual(oldResolution, [{ event: 'disagree' }]);
    assert.equal(a.data.privacyVisible, false); assert.equal(b.data.privacyVisible, false);
    assert.match((await blocked).message, /尚未结束/);
    await assert.rejects(privacy.requirePrivacy(a), /尚未结束/);
    assert.equal(platformRequests.length, 1);
    // Denying a resolver is NOT itself platform termination; keep rejecting B.
    await assert.rejects(privacy.requirePrivacy(b), /尚未结束/);
    const old = platformRequests[0];
    assert.equal(typeof old.complete, 'function');
    old[terminal]({ errMsg: 'requirePrivacyAuthorize:' + (terminal === 'success' ? 'ok' : 'fail cancel') });
    await tick();
    const second = privacy.requirePrivacy(b); await tick();
    assert.equal(platformRequests.length, 2);
    const bResolutions = [];
    h.emitPrivacy(resolution => {
      bResolutions.push(clone(resolution));
      if (resolution.event === 'agree') {
        authorized = true;
        platformRequests[1].success({ errMsg: 'requirePrivacyAuthorize:ok' });
      }
    });
    assert.equal(b.data.privacyVisible, true);
    // A's later complete/fail/success callbacks cannot release B's owner or UI.
    old.complete({ errMsg: 'requirePrivacyAuthorize:fail cancel' });
    old.fail({ errMsg: 'requirePrivacyAuthorize:fail cancel' });
    old.success({ errMsg: 'requirePrivacyAuthorize:ok' });
    await tick();
    assert.equal(b.data.privacyVisible, true);
    assert.equal(privacy.requirePrivacy(b), second);
    await assert.rejects(privacy.requirePrivacy(a), /尚未结束/);
    b.agreePrivacyAuthorization({ type: 'agreeprivacyauthorization', currentTarget: { id: 'bansai-privacy-agree' } });
    await second;
    assert.deepEqual(bResolutions, [{ event: 'agree', buttonId: 'bansai-privacy-agree' }]);
    assert.deepEqual(oldResolution, [{ event: 'disagree' }]);
    assert.equal(b.data.privacyVisible, false);
    assert.equal(h.requests.length, 0);
  });
}

test('complete without success or fail terminates a live platform request as failure and permits retry', async () => {
  const { h, p } = sensitiveHarness('login'); const privacy = h.load('utils/privacy.js');
  h.wx.getPrivacySetting = options => options.success({ needAuthorization: true, privacyContractName: '《测试隐私保护指引》' });
  let request;
  h.wx.requirePrivacyAuthorize = options => { request = options; };
  const first = privacy.requirePrivacy(p); const rejected = assert.rejects(first, /未成功完成/); await tick();
  assert.equal(typeof request.complete, 'function');
  request.complete({ errMsg: 'requirePrivacyAuthorize:fail' }); await rejected;
  const platform = officialPrivacy(h);
  const second = privacy.requirePrivacy(p); await tick(); platform.agree(p); await second;
});
