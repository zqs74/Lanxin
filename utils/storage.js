const { STORAGE_KEYS } = require('./constants');

function safeRead(key, fallback) {
  try {
    const value = wx.getStorageSync(key);
    return value || fallback;
  } catch (error) {
    console.warn(`safeRead:${key} failed`, error);
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (error) {
    console.warn(`safeWrite:${key} failed`, error);
  }
}

function appendRecord(key, item, limit = 20) {
  const list = safeRead(key, []);
  const next = [item].concat(list).slice(0, limit);
  safeWrite(key, next);
}

function saveRecommendation(record) {
  appendRecord(STORAGE_KEYS.RECOMMENDATIONS, record, 20);
  safeWrite(STORAGE_KEYS.LATEST_RESULT, record);
}

function saveLatestDemand(demand) {
  safeWrite(STORAGE_KEYS.LATEST_DEMAND, demand);
}

function saveBooking(record) {
  appendRecord(STORAGE_KEYS.BOOKINGS, record, 20);
}

function getRecommendations() {
  return safeRead(STORAGE_KEYS.RECOMMENDATIONS, []);
}

function getBookings() {
  return safeRead(STORAGE_KEYS.BOOKINGS, []);
}

function getLatestDemand() {
  return safeRead(STORAGE_KEYS.LATEST_DEMAND, null);
}

function getLatestResult() {
  return safeRead(STORAGE_KEYS.LATEST_RESULT, null);
}

module.exports = {
  saveRecommendation,
  saveLatestDemand,
  saveBooking,
  getRecommendations,
  getBookings,
  getLatestDemand,
  getLatestResult,
};
