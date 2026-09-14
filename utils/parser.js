const api = require('./api');
async function parseDemand(mode, sentence) {
  const parsed = await api.request('/api/demands/parse', { method: 'POST', data: { mode, sentence } });
  if (!parsed || !parsed.demand || !Array.isArray(parsed.missingFields)) throw new Error('需求解析响应无效，请重试');
  return parsed;
}
function getMissingFields(demand, required = []) {
  return required.filter(key => ['peopleCount', 'teamCount'].includes(key)
    ? !Number.isInteger(Number(demand[key])) || Number(demand[key]) <= 0 : !demand[key]);
}
module.exports = { parseDemand, getMissingFields };
