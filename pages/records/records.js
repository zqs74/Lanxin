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

// 推荐记录重点兜底：预算落点 + 方案调性（优先展示当时输入的一句话）
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
          : (demand.sentence || buildRecommendationHighlight(result)),
      });
    });
}

function pickFilterOptions(list, key) {
  const values = Array.from(new Set(list.map((item) => item[key]).filter(Boolean)));
  return ["全部"].concat(values);
}

function applyFilters(list, filters) {
  return list.filter((item) => {
    const townMatch = filters.town === "全部" || item.town === filters.town;
    const dateMatch = filters.date === "全部" || item.date === filters.date;
    return townMatch && dateMatch;
  });
}

Page({
  data: {
    type: "recommendation",
    title: "推荐记录",
    list: [],
    filteredList: [],
    filters: {
      town: "全部",
      date: "全部",
    },
    townOptions: ["全部"],
    dateOptions: ["全部"],
  },

  onLoad(query) {
    const type = query.type === "booking" ? "booking" : "recommendation";
    this.setData({
      type,
      title: type === "booking" ? "预约记录" : "推荐记录",
    });

    wx.setNavigationBarTitle({
      title: type === "booking" ? "预约记录" : "推荐记录",
    });
  },

  onShow() {
    const source = this.data.type === "booking"
      ? buildList(getBookings(), "booking")
      : buildList(getRecommendations(), "recommendation");

    this.setData({
      list: source,
      filteredList: source,
      filters: {
        town: "全部",
        date: "全部",
      },
      townOptions: pickFilterOptions(source, "town"),
      dateOptions: pickFilterOptions(source, "date"),
    });
  },

  selectFilter(event) {
    const { key, value } = event.currentTarget.dataset;
    this.setData(
      {
        [`filters.${key}`]: value,
      },
      () => {
        this.setData({
          filteredList: applyFilters(this.data.list, this.data.filters),
        });
      }
    );
  },

  reopenItem(event) {
    const { id, payload, type } = event.currentTarget.dataset;

    // 预约记录 → 预约成功页；推荐记录 → 对应方案页
    if (type === "booking") {
      if (id) {
        wx.navigateTo({
          url: `/pages/booking-success/booking-success?id=${id}`,
        });
      }
      return;
    }

    if (!payload || !payload.demand) {
      return;
    }

    const encoded = encodePayload(payload.demand);
    wx.navigateTo({
      url: `/pages/result/result?payload=${encoded}`,
    });
  },
});
