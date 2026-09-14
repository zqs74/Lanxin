const session = require('./session');
const API_BASE = 'https://api.lanxin.cyou/bansai-api';
const MAX_PAGES = 200, MAX_ITEMS = 10000;
// Query parameters go in options.data. Only canonical, contracted API paths
// are accepted; no URL normalization or decoding can move them outside bansai.
const API_PATH = /^\/api\/(?:auth\/(?:login|me|logout|password)|catalog\/config|resources|demands\/parse|plans(?:\/[A-Za-z0-9_-]{1,160}(?:\/shares)?)?|bookings(?:\/[A-Za-z0-9_-]{1,160})?|shares\/[A-Za-z0-9_-]{1,160})$/;
function id(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,160}$/.test(value)) throw new Error('记录链接无效');
  return encodeURIComponent(value);
}
function request(path, options = {}) {
  // Validate before reading a token, initializing storage, or redirecting.
  if (typeof path !== 'string' || !API_PATH.test(path) || /[\s\\%?#]/.test(path)) {
    return Promise.reject(new Error('请求路径无效'));
  }
  const token = session.getToken(), epoch = session.getEpoch();
  if (!options.public && !token) {
    session.redirectToLogin();
    return Promise.reject(Object.assign(new Error('请先登录'), { status: 401 }));
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + path, method: options.method || 'GET', data: options.data || {}, timeout: 20000,
      header: Object.assign({ 'Content-Type': 'application/json' }, !options.public ? { Authorization: 'Bearer ' + token } : {}),
      success(response) {
        if (epoch !== session.getEpoch() || (!options.public && token !== session.getToken())) {
          reject(Object.assign(new Error('会话已变更'), { stale: true })); return;
        }
        const body = response.data;
        if (response.statusCode >= 200 && response.statusCode < 300 && body && body.code === 0) {
          resolve(body.data); return;
        }
        const error = Object.assign(new Error((body && (body.msg || body.message)) || '请求失败，请稍后重试'),
          { status: response.statusCode, code: body && body.code });
        if (response.statusCode === 401 && !options.public) session.invalidate(token);
        reject(error);
      },
      fail() {
        // A session may expire while the request is waiting for the network.
        session.getToken();
        reject(Object.assign(new Error('网络连接失败，请稍后重试'), { stale: epoch !== session.getEpoch() }));
      },
    });
  });
}
async function listAll(path, filters = {}) {
  const items = [], seen = new Set();
  let page = 1;
  while (page <= MAX_PAGES) {
    const data = await request(path, { data: Object.assign({}, filters, { page, pageSize: 50 }) });
    if (!data || !Array.isArray(data.items) || !Number.isInteger(data.total) || data.total < 0 ||
      data.page !== page || !Number.isInteger(data.pageSize) || data.pageSize < 1 || data.pageSize > 100 ||
      data.items.length > data.pageSize) throw new Error('列表响应无效');
    if (data.total > MAX_ITEMS) throw new Error('记录超过10000条，请缩小筛选范围后重试');
    let added = 0;
    data.items.forEach(item => { if (!seen.has(item.id)) { seen.add(item.id); items.push(item); added++; } });
    if (items.length > MAX_ITEMS) throw new Error('记录超过10000条，请缩小筛选范围后重试');
    if (page * data.pageSize >= data.total) {
      if (items.length < data.total) throw new Error('列表加载不完整，请重试');
      return items;
    }
    if (!data.items.length || !added) throw new Error('列表加载不完整，请重试');
    page++;
  }
  throw new Error('列表超过200页，请缩小筛选范围后重试');
}
async function getConfig() {
  const config = await request('/api/catalog/config');
  session.setContact(config.contact);
  return config;
}
function notifyError(error) {
  if (error && (error.stale || error.status === 401)) return;
  wx.showToast({ title: (error && error.message) || '操作失败，请重试', icon: 'none' });
}
// Memory only: retry a timed-out form with the same ID; coalesce double taps.
const submissions = new Map();
session.onClear(() => submissions.clear());
let serial = 0;
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort()
    .map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
  return JSON.stringify(value);
}
function submitOnce(kind, form, submit) {
  const epoch = session.getEpoch();
  const key = kind + ':' + canonical(form);
  let entry = submissions.get(key);
  if (entry && entry.promise) return entry.promise;
  if (!entry) {
    entry = { requestId: 'bs_' + Date.now().toString(36) + '_' + (++serial).toString(36) + '_' + Math.random().toString(36).slice(2) };
    submissions.set(key, entry);
  }
  entry.promise = Promise.resolve().then(() => submit(entry.requestId)).then(result => {
    if (epoch !== session.getEpoch()) throw Object.assign(new Error('会话已变更'), { stale: true });
    // A successful action is complete. A later deliberate identical action gets
    // a fresh ID, while failed attempts retain this entry for a safe retry.
    if (submissions.get(key) === entry) submissions.delete(key);
    return result;
  }).finally(() => { entry.promise = null; });
  return entry.promise;
}
function applyContact(page) {
  const components = page.selectAllComponents ? page.selectAllComponents('open-guide') : [];
  components.forEach(component => component.setData({ contact: session.getContact() }));
}
module.exports = { API_BASE, request, listAll, getConfig, id, notifyError, submitOnce, applyContact };
