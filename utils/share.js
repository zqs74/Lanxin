const api = require('./api');
const session = require('./session');
async function createShare(planId) {
  const share = await api.request('/api/plans/' + api.id(planId) + '/shares', { method: 'POST' });
  return { shareId: api.id(share.shareId), expiresAt: share.expiresAt, path: '/pages/result/result?shareId=' + api.id(share.shareId) };
}
function getSharedPlan(shareId) { return api.request('/api/shares/' + api.id(shareId)); }
function loadPlan(query = {}) {
  if (query.shareId) return getSharedPlan(query.shareId);
  if (query.id) return require('./storage').getRecommendation(query.id);
  return Promise.reject(new Error('方案链接无效或已过期'));
}
function planPath(query = {}, page = 'result') {
  const key = query.shareId ? 'shareId' : 'id';
  return '/pages/' + page + '/' + page + '?' + key + '=' + api.id(query[key]);
}
function shareMessage(page, title) {
  const fallback = { title: title || '篮芯办赛方案', path: '/pages/index/index', imageUrl: '/assets/resources/materials/trophy-real.jpg' };
  if (!session.hasSession()) return fallback;
  if (page._share && (!page._share.expiresAt || Date.parse(page._share.expiresAt) > Date.now())) {
    return Object.assign({}, fallback, { path: page._share.path });
  }
  if (!page._sharePromise) return fallback;
  return Object.assign({}, fallback, { promise: page._sharePromise.then(share =>
    share ? Object.assign({}, fallback, { path: share.path }) : fallback).catch(() => fallback) });
}
function prepareShare(page, planId, existingShareId) {
  page._share = null;
  const token = session.getToken();
  const promise = existingShareId ? Promise.resolve({ path: '/pages/result/result?shareId=' + api.id(existingShareId) }) : createShare(planId);
  const pending = promise.then(share => {
    if (token !== session.getToken() || page._dead || page._sharePromise !== pending) return null;
    page._share = share; return share;
  }).catch(() => null);
  page._sharePromise = pending;
  return pending;
}
module.exports = { createShare, getSharedPlan, loadPlan, planPath, shareMessage, prepareShare };
