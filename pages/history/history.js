const { getRecommendations, getBookings, removeRecordsByType } = require("../../utils/storage");
const api = require('../../utils/api');
const session = require('../../utils/session');

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
  return list
    .map((item) => {
      const payload = item.payload || {};
      const demand = payload.demand || {};
      const result = payload.result || {};
      const bookingForm = payload.bookingForm || {};
      const date = (type === "booking" ? bookingForm.expectedDate : demand.playDate) || (item.createdAt || "").slice(0, 10);
      const town = demand.town || "东莞";

      return Object.assign({}, item, {
        payload: Object.assign({}, payload, { planId: item.id }),
        title: type === "booking" ? (item.statusLabel || "预约已提交") : getModeLabel(item.mode),
        town,
        date,
        meta: [town, date].filter(Boolean).join(" · "),
        brief: type === "booking"
          ? (bookingForm.contactName ? `${bookingForm.contactName} · ${bookingForm.phone || "未填写"}` : "已提交场地预约")
          : (result.summaryLead || item.summary || ""),
        highlight: type === "booking"
          ? ((bookingForm.venueName && bookingForm.timeSlot)
              ? `${bookingForm.venueName} · ${getSlotLabel(bookingForm.timeSlot) || "时段待定"}`
              : (bookingForm.remark || (bookingForm.acceptFallback ? "接受同档位替代方案" : "仅接受当前方案")))
          : (demand.sentence || buildRecommendationHighlight(result)),
      });
    });
}

Page(session.protectPage({
  data: {
    recommendations: [],
    bookings: [],
    previewRecommendations: [],
    previewBookings: [],
  },

  async onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        active: "history",
        hidden: false,
      });
    }

    await this.refresh();
  },

  async refresh() {
    const sequence = this._refreshSequence = (this._refreshSequence || 0) + 1;
    const [plans, reservations] = await Promise.all([getRecommendations(), getBookings()]);
    if (this._dead || sequence !== this._refreshSequence) return;
    const recommendations = buildList(plans, 'recommendation');
    const bookings = buildList(reservations, 'booking');

    this.setData({
      recommendations,
      bookings,
      previewRecommendations: recommendations.slice(0, 4),
      previewBookings: bookings.slice(0, 4),
    });
  },

  // 单条删除（推荐/预约记录）
  deleteItem(event) {
    const { id, type } = event.currentTarget.dataset;
    if (!id || !type) {
      return;
    }

    wx.showModal({
      title: "删除记录",
      content: "确定删除这条记录吗？删除后不可恢复",
      confirmColor: "#fa5151",
      success: async (res) => {
        if (!res.confirm) {
          return;
        }
        if (this._deleting) return;
        this._deleting = true;
        try {
          await removeRecordsByType(type, [id]);
          wx.showToast({ title: '已删除', icon: 'success' });
          await this.refresh();
        } catch (error) { api.notifyError(error); }
        finally { this._deleting = false; }
      },
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
    if (!payload || !payload.planId) {
      return;
    }

    wx.navigateTo({
      url: '/pages/result/result?id=' + api.id(payload.planId),
    });
  },

  reopenBooking(event) {
    const { id } = event.currentTarget.dataset;
    if (!id) {
      return;
    }

    wx.navigateTo({
      url: '/pages/booking-success/booking-success?id=' + api.id(id),
    });
  },
}));
