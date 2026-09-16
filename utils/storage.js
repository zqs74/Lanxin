// Business data lives on the server; never read legacy local history.
const api = require('./api');
const { normalize } = require('./booking-status');
async function saveRecommendation(demand, requestId) {
  const record = await api.request('/api/plans', { method: 'POST', data: { demand, requestId } });
  if (!record || !record.payload || !record.payload.demand || !record.payload.result) throw new Error('方案响应无效，请重试');
  api.id(record.id);
  return record;
}
async function saveBooking(planId, bookingForm, requestId) {
  const record = await api.request('/api/bookings', { method: 'POST', data: { planId, bookingForm, requestId } });
  if (!record || !record.status) throw new Error('预约响应无效，请重试');
  api.id(record.id);
  return normalize(record);
}
function getRecommendations(filters) { return api.listAll('/api/plans', filters); }
async function getBookings(filters) { return (await api.listAll('/api/bookings', filters)).map(normalize); }
function getRecommendation(id) { return api.request('/api/plans/' + api.id(id)); }
async function getBooking(id) { return normalize(await api.request('/api/bookings/' + api.id(id))); }
async function removeRecordsByType(type, ids) {
  if (!['booking', 'recommendation'].includes(type)) throw new Error('记录类型无效');
  const path = type === 'booking' ? '/api/bookings' : '/api/plans';
  const unique = Array.from(new Set(ids || []));
  for (let i = 0; i < unique.length; i += 100) {
    await api.request(path, { method: 'DELETE', data: { ids: unique.slice(i, i + 100) } });
  }
}
module.exports = { saveRecommendation, saveBooking, getRecommendations, getBookings, getRecommendation, getBooking, removeRecordsByType };
