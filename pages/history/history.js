const { getRecommendations, getBookings } = require("../../utils/storage");
const { encodePayload } = require("../../utils/share");

const TIME_SLOT_LABELS = {
  morning: "上午 08:00-12:00",
  afternoon: "下午 12:00-18:00",
  evening: "晚上 18:00-22:00",
};

function getModeLabel(mode) {
  return mode === "pro_event" ? "半专业赛事" : "野球约球";
}

function getSlotLabel(value) {
  return TIME_SLOT_LABELS[value] || "";
}

// 推荐记录重点：预算落点 + 方案调性（替代原 summaryNote 长句）
function buildRecommendationHighlight(result) {
  const parts = [];
  if (result.budgetFocus) {
    parts.push(`预算落点 ${result.budgetFocus}`);
  }
  if (result.planTone) {
    parts.push(result.planTone);
  }
  return parts.join(" · ") || result.strategyLine || "";
}

function buildList(list = [], type) {
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
      const payload = item.payload || {};
      const demand = payload.demand || {};
      const result = payload.result || {};
      const bookingForm = payload.bookingForm || {};
      const date = demand.playDate || item.createdAt.slice(0, 10);
      const town = demand.town || "东莞";

      return Object.assign({}, item, {
        title: type === "booking" ? "场地预约" : getModeLabel(item.mode),
        town,
        date,
        meta: [town, date].filter(Boolean).join(" · "),
        brief: type === "booking"
          ? (bookingForm.contactName ? `${bookingForm.contactName} · ${bookingForm.phone || "待回访"}` : "已提交场地预约")
          : (result.summaryLead || item.summary || ""),
        highlight: type === "booking"
          ? ((bookingForm.venueName && bookingForm.timeSlot)
              ? `${bookingForm.venueName} · ${getSlotLabel(bookingForm.timeSlot) || "时段待定"}`
              : (bookingForm.remark || (bookingForm.acceptFallback ? "接受同档位替代方案" : "仅接受当前方案")))
          : buildRecommendationHighlight(result),
      });
    });
}

Page({
  data: {
    recommendations: [],
    bookings: [],
    previewRecommendations: [],
    previewBookings: [],
  },

  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        active: "history",
        hidden: false,
      });
    }

    const recommendations = buildList(getRecommendations(), "recommendation");
    const bookings = buildList(getBookings(), "booking");

    this.setData({
      recommendations,
      bookings,
      previewRecommendations: recommendations.slice(0, 4),
      previewBookings: bookings.slice(0, 4),
    });
  },

  openRecommendationRecords() {
    wx.navigateTo({
      url: "/pages/records/records?type=recommendation",
    });
  },

  openBookingRecords() {
    wx.navigateTo({
      url: "/pages/records/records?type=booking",
    });
  },

  reopenRecommendation(event) {
    const { payload } = event.currentTarget.dataset;
    if (!payload || !payload.demand) {
      return;
    }

    const encoded = encodePayload(payload.demand);
    wx.navigateTo({
      url: `/pages/result/result?payload=${encoded}`,
    });
  },

  reopenBooking(event) {
    const { id } = event.currentTarget.dataset;
    if (!id) {
      return;
    }

    wx.navigateTo({
      url: `/pages/booking-success/booking-success?id=${id}`,
    });
  },
});
