const KEY = 'lanxin_bansai_session_v1';
const { CONTACT } = require('./constants');
const listeners = new Set();
let current = null, initialized = false, epoch = 0, redirecting = false, nextPath = '';
const routes = {
  '/pages/index/index': [], '/pages/library/library': [], '/pages/history/history': [],
  '/pages/records/records': ['type'], '/pages/result/result': ['id', 'shareId'],
  '/pages/poster/poster': ['id', 'shareId'], '/pages/booking-success/booking-success': ['id'],
  '/pages/account/account': [],
};
function setContact(contact) {
  Object.keys(CONTACT).forEach(key => delete CONTACT[key]);
  const source = contact || {};
  const fields = {};
  ['name', 'phone', 'wechat', 'qrCode', 'mode', 'wecomCorpId', 'wecomKfUrl'].forEach(key => {
    fields[key] = typeof source[key] === 'string' ? source[key].trim() : '';
  });
  // WeCom customer service needs both ids, in the exact shape WeChat expects; otherwise neither is kept.
  if (!/^w[wx][0-9A-Za-z]{16}$/.test(fields.wecomCorpId) || !/^https:\/\/work\.weixin\.qq\.com\/kfid\/kfc[0-9A-Za-z]{10,40}$/.test(fields.wecomKfUrl)) {
    fields.wecomCorpId = ''; fields.wecomKfUrl = '';
  }
  if (fields.wechat === 'Lanxin-kefu') fields.wechat = '';
  if (fields.qrCode === '/assets/contact-qr.png') fields.qrCode = '';
  const configured = !!(fields.phone || fields.wechat || fields.qrCode);
  Object.assign(CONTACT, fields, { configured, name: configured ? (fields.name || '联系客服') : '客服未配置' });
}
setContact(null);
function init() {
  if (initialized) return;
  initialized = true;
  // Legacy demo business records belong to the user: leave them untouched.
  // The mini program no longer has a login. A session stored by an earlier version is dropped, so the
  // device continues as an ordinary visitor instead of mixing an old account's plans with its own.
  try { if (wx.getStorageSync(KEY)) wx.removeStorageSync(KEY); } catch (_) {}
  current = null;
}
function getToken() {
  init();
  if (current && !(Date.parse(current.expiresAt) > Date.now())) {
    const path = activePath();
    clear();
    redirectToLogin(path);
  }
  return current ? current.token : '';
}
function getEpoch() { return epoch; }
function hasSession() { return !!getToken(); }
// Display copy only (no token); mutating it cannot alter the session.
function getAccount() { return getToken() ? Object.assign({}, current.account) : null; }
function onClear(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function clear() {
  init(); current = null; epoch++; setContact(null);
  try { wx.removeStorageSync(KEY); } catch (_) {}
  listeners.forEach(fn => fn());
}
function accept(data) {
  if (!data || !data.token || !data.account || !data.account.id || !(Date.parse(data.expiresAt) > Date.now())) {
    throw new Error('登录响应无效，请联系管理员');
  }
  clear();
  const account = data.account;
  const safe = { token: data.token, expiresAt: data.expiresAt, account: {
    id: account.id, username: account.username, displayName: account.displayName,
    organizationId: account.organizationId, role: account.role,
  } };
  try { wx.setStorageSync(KEY, safe); } catch (_) { throw new Error('无法保存登录状态，请检查存储后重试'); }
  current = safe; redirecting = false;
}
function safeNext(path) {
  if (typeof path !== 'string' || path.length > 600 || /[\s\\%#\x00-\x1f\x7f]/.test(path)) return '';
  const parts = path.split('?');
  if (parts.length > 2 || !Object.prototype.hasOwnProperty.call(routes, parts[0])) return '';
  const allowed = routes[parts[0]], query = [];
  if (parts[1]) {
    for (const pair of parts[1].split('&')) {
      const [key, value, extra] = pair.split('=');
      if (extra !== undefined || !allowed.includes(key) || !/^[A-Za-z0-9_-]{1,160}$/.test(value || '')) return '';
      if (key === 'type' && !['booking', 'recommendation'].includes(value)) return '';
      if (query.some(p => p.startsWith(key + '='))) return '';
      query.push(key + '=' + value);
    }
  }
  return parts[0] + (query.length ? '?' + query.join('&') : '');
}
function pagePath(route, query = {}) {
  const base = '/' + route.replace(/^\//, '');
  const pairs = (routes[base] || []).filter(key => query[key]).map(key => key + '=' + query[key]);
  return safeNext(base + (pairs.length ? '?' + pairs.join('&') : '')) || '/pages/index/index';
}
function activePath() {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  const page = pages[pages.length - 1];
  return page ? pagePath(page.route || '', page._query || page.options || {}) : '/pages/index/index';
}
function onLoginPage() {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  const page = pages[pages.length - 1];
  return !!page && page.route === 'pages/login/login';
}
// There is no login page any more. Callers that used to send the visitor there simply continue as a
// visitor; the function stays so that an expired legacy session ends quietly.
function redirectToLogin() {}
function invalidate(token) {
  if (token && token !== getToken()) return;
  const path = activePath(); clear(); redirectToLogin(path);
}
function enterLogin(next) {
  // The login page is showing, so the redirect that led here is finished. Without this reset an
  // anonymous entry while it is open (a shared plan opened from a chat, for instance) stayed on an
  // empty protected page with no way to sign in, because the flag was only cleared after a login.
  redirecting = false;
  if (hasSession()) clear();
  let decoded = next || '';
  try { decoded = decodeURIComponent(decoded); } catch (_) { decoded = ''; }
  const valid = safeNext(decoded);
  if (valid) nextPath = valid;
}
function finishLogin() {
  const target = safeNext(nextPath) || '/pages/index/index';
  nextPath = ''; redirecting = false;
  wx.reLaunch({ url: target });
}
async function login(username, password) {
  const data = await require('./api').request('/api/auth/login', { public: true, method: 'POST', data: { username, password } });
  accept(data); return data.account;
}
async function me() {
  const account = await require('./api').request('/api/auth/me');
  if (!account || !account.id || (current && account.id !== current.account.id)) {
    invalidate(getToken());
    throw Object.assign(new Error('账号状态异常，请重新登录'), { status: 401 });
  }
  if (current) current.account = account;
  return account;
}
async function logout() {
  try { await require('./api').request('/api/auth/logout', { method: 'POST' }); }
  finally { clear(); redirectToLogin('/pages/index/index'); }
}
async function changePassword(currentPassword, newPassword) {
  await require('./api').request('/api/auth/password', { method: 'PUT', data: { currentPassword, newPassword } });
  clear(); redirectToLogin('/pages/index/index');
}
function protectPage(definition) {
  const load = definition.onLoad, show = definition.onShow, unload = definition.onUnload;
  const initial = JSON.parse(JSON.stringify(definition.data || {}));
  Object.keys(definition).forEach(key => {
    if (typeof definition[key] !== 'function' || key.startsWith('onShare') ||
      ['onLoad', 'onShow', 'onUnload', 'applyRecord', 'buildPalette', 'buildInfoRows', 'getSlotLabel', 'refreshRecord', 'refreshRecords'].includes(key)) return;
    const fn = definition[key];
    definition[key] = function(...args) {
      if (this._authPending) return;
      try {
        const result = fn.apply(this, args);
        return result && typeof result.catch === 'function' ? result.catch(require('./api').notifyError) : result;
      } catch (error) { require('./api').notifyError(error); }
    };
  });
  definition.onLoad = function(query = {}) {
    this._query = query; this._dead = false;
    const setData = this.setData.bind(this);
    this.setData = (patch, callback) => { if (!this._dead) setData(patch, callback); };
    this._unlisten = onClear(() => {
      require('./privacy').cancel(this);
      this._authSnapshot = null; this._authPending = true; this.record = null;
      this._share = null; this._sharePromise = null; this._loaded = false;
      this._config = null; this._requiredFields = []; this._imageExport = null;
      this._listSequence = (this._listSequence || 0) + 1;
      this._refreshSequence = (this._refreshSequence || 0) + 1;
      this.setData(JSON.parse(JSON.stringify(initial)));
      const components = this.selectAllComponents ? this.selectAllComponents('open-guide') : [];
      components.forEach(component => component.setData({ contact: CONTACT }));
    });
  };
  definition.onShow = async function() {
    if (this._showBusy) return;
    // Hide all previously rendered data until this session is confirmed. Keep
    // drafts only in memory and restore them only within the same auth epoch.
    if (!this._authSnapshot) this._authSnapshot = JSON.parse(JSON.stringify(this.data));
    this._authPending = true;
    this.setData(JSON.parse(JSON.stringify(initial)));
    this._showBusy = true;
    const generation = getEpoch();
    try {
      // Visitors need no check; a session only exists for an issued account and is still validated.
      if (hasSession()) await me();
      if (this._dead || generation !== getEpoch()) return;
      if (this._authSnapshot) this.setData(this._authSnapshot);
      this._authSnapshot = null;
      this._authPending = false;
      if (!this._loaded && load) {
        await load.call(this, this._query || {});
        if (this._dead || generation !== getEpoch()) return;
        this._loaded = true;
      }
      if (!this._dead && show) await show.call(this);
    } catch (error) { require('./api').notifyError(error); }
    finally { this._showBusy = false; }
  };
  definition.onUnload = function() {
    this._dead = true;
    this._imageExport = null;
    this._authSnapshot = null;
    if (this._unlisten) this._unlisten();
    if (unload) unload.call(this);
  };
  return definition;
}
module.exports = { init, getToken, getEpoch, hasSession, getAccount, accept, clear, onClear, safeNext, pagePath,
  redirectToLogin, invalidate, enterLogin, finishLogin, login, me, logout, changePassword,
  setContact, getContact: () => CONTACT, protectPage };
