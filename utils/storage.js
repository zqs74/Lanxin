// Plans are computed and kept on the server, reachable by their random ids. The mini program has no
// login, so "my plans" is a short list of those ids kept on this device; bookings no longer exist.
// The legacy demo keys (lx_recommendations, lx_bookings, ...) are never read or touched.
const api = require('./api');
const { normalize } = require('./booking-status');
const HISTORY_KEY = 'lanxin_bansai_history_v1', HISTORY_LIMIT = 50;

function readHistory() {
  try {
    const saved = wx.getStorageSync(HISTORY_KEY);
    return Array.isArray(saved) ? saved.filter(item => item && typeof item.id === 'string' && /^[A-Za-z0-9_-]{1,160}$/.test(item.id)) : [];
  } catch (_) { return []; }
}
function writeHistory(list) {
  try { wx.setStorageSync(HISTORY_KEY, list.slice(0, HISTORY_LIMIT)); } catch (_) {}
}
// Only what the history cards show; the full plan is always read back from the server.
function historyEntry(record) {
  const demand = record.payload.demand || {}, result = record.payload.result || {};
  return { id: record.id, type: 'recommendation', mode: record.mode || demand.mode, createdAt: record.createdAt || new Date().toISOString(),
    summary: record.summary || result.summary || '',
    payload: { demand: { mode: demand.mode, town: demand.town, playDate: demand.playDate, sentence: demand.sentence },
      result: { summaryLead: result.summaryLead, budgetFocus: result.budgetFocus, planTone: result.planTone, strategyLine: result.strategyLine } } };
}
async function saveRecommendation(demand, requestId) {
  const record = await api.request('/api/plans', { method: 'POST', data: { demand, requestId } });
  if (!record || !record.payload || !record.payload.demand || !record.payload.result) throw new Error('方案响应无效，请重试');
  api.id(record.id);
  writeHistory([historyEntry(record)].concat(readHistory().filter(item => item.id !== record.id)));
  return record;
}
async function saveBooking(planId, bookingForm, requestId) {
  const record = await api.request('/api/bookings', { method: 'POST', data: { planId, bookingForm, requestId } });
  if (!record || !record.status) throw new Error('预约响应无效，请重试');
  api.id(record.id);
  return normalize(record);
}
async function getRecommendations(filters = {}) {
  return readHistory().filter(item => {
    const demand = (item.payload && item.payload.demand) || {};
    return (!filters.town || demand.town === filters.town) && (!filters.date || demand.playDate === filters.date);
  });
}
async function getBookings() { return []; }
function getRecommendation(id) { return api.request('/api/plans/' + api.id(id)); }
async function getBooking(id) { return normalize(await api.request('/api/bookings/' + api.id(id))); }
async function removeRecordsByType(type, ids) {
  if (!['booking', 'recommendation'].includes(type)) throw new Error('记录类型无效');
  if (type !== 'recommendation') return;
  const removed = new Set(ids || []);
  writeHistory(readHistory().filter(item => !removed.has(item.id)));
}
module.exports = { saveRecommendation, saveBooking, getRecommendations, getBookings, getRecommendation, getBooking, removeRecordsByType };
