const { getRecommendations, getBookings } = require("../../utils/storage");
const { encodePayload } = require("../../utils/share");

function getModeLabel(mode) {
  return mode === "pro_event" ? "半专业赛事" : "野球约球";
}

function formatCompactList(list = []) {
  const seen = new Set();

  return list
    .filter((item) => {
      const key = `${item.mode}_${item.summary}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .map((item) => {
      const demand = (item.payload && item.payload.demand) || {};
      return Object.assign({}, item, {
        title: getModeLabel(item.mode),
        meta: [demand.town || "东莞", demand.playDate || item.createdAt.slice(0, 10)]
          .filter(Boolean)
          .join(" · "),
      });
    });
}

Page({
  data: {
    recommendations: [],
    bookings: [],
  },

  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        active: "history",
      });
    }

    this.setData({
      recommendations: formatCompactList(getRecommendations()).slice(0, 8),
      bookings: formatCompactList(getBookings()).slice(0, 8),
    });
  },

  reopenRecommendation(event) {
    const { payload } = event.currentTarget.dataset;
    const encoded = encodePayload(payload.demand);
    wx.navigateTo({
      url: `/pages/result/result?payload=${encoded}`,
    });
  },
});
