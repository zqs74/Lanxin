const {
  APP_MODE,
  BUDGET_OPTIONS,
  DATE_OPTIONS,
  TOWN_OPTIONS,
} = require("../../utils/constants");
const { decodePayload, encodePayload } = require("../../utils/share");
const { createRecommendation } = require("../../utils/recommender");
const { saveRecommendation, saveBooking } = require("../../utils/storage");

function normalizeDemand(payload) {
  return Object.assign(
    {
      city: "东莞",
      sentence: "",
      budgetLevel: "mid",
      venuePreference: "indoor",
      playDate: "2026-08-01",
      peopleCount: 20,
      teamCount: 4,
      town: "南城",
      needReferee: true,
      needMaterials: true,
      needMedia: false,
      needSupplier: false,
      mode: APP_MODE.PRO_EVENT,
    },
    payload
  );
}

Page({
  data: {
    mode: APP_MODE.PRO_EVENT,
    demand: null,
    result: null,
    budgetOptions: BUDGET_OPTIONS,
    dateOptions: DATE_OPTIONS,
    townOptions: TOWN_OPTIONS,
    tuneVisible: false,
    bookingVisible: false,
    bookingForm: {
      contactName: "",
      phone: "",
      wechat: "",
      expectedDate: "",
      remark: "",
      acceptFallback: true,
    },
  },

  onLoad(query) {
    const payload = decodePayload(query.payload || "") || getApp().globalData.latestSharePayload;
    const demand = normalizeDemand(payload);
    const result = createRecommendation(demand);

    this.setData({
      mode: demand.mode,
      demand,
      result,
      "bookingForm.expectedDate": demand.playDate,
    });

    getApp().setLatestSharePayload(result.sharePayload);
  },

  onShareAppMessage() {
    const { result } = this.data;
    const encoded = encodePayload(result.sharePayload);
    return {
      title: result.posterPayload ? result.posterPayload.title : "东莞篮球约战方案",
      path: `/pages/result/result?payload=${encoded}`,
    };
  },

  openTunePanel() {
    this.setData(
      {
        tuneVisible: true,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({
            hidden: true,
          });
        }
      }
    );
  },

  closeTunePanel() {
    this.setData(
      {
        tuneVisible: false,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({
            hidden: false,
          });
        }
      }
    );
  },

  selectTuneValue(event) {
    const { key, value } = event.currentTarget.dataset;
    this.setData({
      [`demand.${key}`]: value,
    });
  },

  onTuneNumberChange(event) {
    const { key } = event.currentTarget.dataset;
    this.setData({
      [`demand.${key}`]: Number(event.detail || 0),
    });
  },

  rematchResult() {
    const demand = Object.assign({}, this.data.demand);
    const result = createRecommendation(demand);
    const record = {
      id: `rec_${Date.now()}`,
      type: "recommendation",
      mode: demand.mode,
      createdAt: new Date().toISOString(),
      summary: `${result.summary}（调整后）`,
      payload: {
        demand,
        result,
      },
    };

    saveRecommendation(record);
    getApp().setLatestSharePayload(result.sharePayload);

    this.setData(
      {
        result,
        tuneVisible: false,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({
            hidden: false,
          });
        }
      }
    );

    wx.showToast({
      title: "已重新匹配",
      icon: "success",
    });
  },

  openPoster() {
    const encoded = encodePayload(this.data.result.sharePayload);
    wx.navigateTo({
      url: `/pages/poster/poster?payload=${encoded}`,
    });
  },

  openBooking() {
    this.setData(
      {
        bookingVisible: true,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({
            hidden: true,
          });
        }
      }
    );
  },

  closeBooking() {
    this.setData(
      {
        bookingVisible: false,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({
            hidden: false,
          });
        }
      }
    );
  },

  updateBookingField(event) {
    const { key } = event.currentTarget.dataset;
    this.setData({
      [`bookingForm.${key}`]: event.detail,
    });
  },

  toggleAcceptFallback() {
    this.setData({
      "bookingForm.acceptFallback": !this.data.bookingForm.acceptFallback,
    });
  },

  submitBooking() {
    const { bookingForm, demand, result } = this.data;

    if (!bookingForm.contactName || !bookingForm.phone) {
      wx.showToast({
        title: "联系人和手机号必填",
        icon: "none",
      });
      return;
    }

    saveBooking({
      id: `book_${Date.now()}`,
      type: "booking",
      mode: demand.mode,
      createdAt: new Date().toISOString(),
      summary: result.summary,
      payload: {
        demand,
        result,
        bookingForm,
      },
    });

    this.setData(
      {
        bookingVisible: false,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({
            hidden: false,
          });
        }
      }
    );

    wx.showToast({
      title: "已记录预约意向",
      icon: "success",
    });
  },
});
