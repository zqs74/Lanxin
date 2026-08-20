const {
  APP_MODE,
  BUDGET_OPTIONS,
  DATE_OPTIONS,
  TOWN_OPTIONS,
} = require("../../utils/constants");
const { decodePayload, encodePayload } = require("../../utils/share");
const { createRecommendation } = require("../../utils/recommender");
const { saveRecommendation, saveBooking } = require("../../utils/storage");

const DAY_IN_MS = 24 * 60 * 60 * 1000;

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

function getTodayTimestamp() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

function getBookingCalendarMaxDate() {
  const maxDate = new Date(getTodayTimestamp());
  maxDate.setMonth(maxDate.getMonth() + 6);
  return maxDate.getTime();
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
    }
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function formatDateValue(value) {
  const timestamp = parseDateValue(value);
  const safeTimestamp = timestamp || getTodayTimestamp();
  const date = new Date(safeTimestamp);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    bookingDateCalendarVisible: false,
    bookingCalendarDefaultDate: getTodayTimestamp() + DAY_IN_MS,
    bookingCalendarMinDate: getTodayTimestamp(),
    bookingCalendarMaxDate: getBookingCalendarMaxDate(),
    bookingForm: {
      contactName: "",
      phone: "",
      wechat: "",
      expectedDate: "",
      timeSlot: "",
      remark: "",
      acceptFallback: true,
    },
    // A3 场地预约：时段选项与预约场馆（锁定主推馆）
    timeSlots: [
      { label: "上午 08:00-12:00", value: "morning" },
      { label: "下午 12:00-18:00", value: "afternoon" },
      { label: "晚上 18:00-22:00", value: "evening" },
    ],
    bookingVenue: null,
    // A1 详情访问控制：点击方案资源卡 → 居中弹窗展示客服二维码
    guideVisible: false,
  },

  onLoad(query) {
    const payload = decodePayload(query.payload || "") || getApp().globalData.latestSharePayload;
    const demand = normalizeDemand(payload);
    const result = createRecommendation(demand);
    const initialBookingDate = formatDateValue(demand.playDate);

    // A3：预约场馆锁定主推馆（方案 venue 段第一项）
    const venueSection = (result.sections || []).find((section) => section.key === "venue");
    const bookingVenue = (venueSection && venueSection.items[0]) || null;

    this.setData({
      mode: demand.mode,
      demand,
      result,
      bookingVenue,
      "bookingForm.expectedDate": initialBookingDate,
      bookingCalendarDefaultDate: parseDateValue(initialBookingDate) || getTodayTimestamp(),
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

  // —— A1：方案资源卡详情守卫（点击 → 居中弹窗展示客服二维码，详情不对外展示）——
  onResourceTap() {
    this.showGuide();
  },

  showGuide() {
    this.setData(
      {
        guideVisible: true,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({ hidden: true });
        }
      }
    );
  },

  closeGuide() {
    this.setData(
      {
        guideVisible: false,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({ hidden: false });
        }
      }
    );
  },

  openBooking() {
    const currentBookingDate = this.data.bookingForm.expectedDate || this.data.demand.playDate;
    this.setData(
      {
        bookingVisible: true,
        bookingCalendarDefaultDate: parseDateValue(currentBookingDate) || getTodayTimestamp(),
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
        bookingDateCalendarVisible: false,
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

  openBookingDateCalendar() {
    const currentBookingDate = this.data.bookingForm.expectedDate || this.data.demand.playDate;
    this.setData({
      bookingDateCalendarVisible: true,
      bookingCalendarDefaultDate: parseDateValue(currentBookingDate) || getTodayTimestamp(),
    });
  },

  closeBookingDateCalendar() {
    this.setData({
      bookingDateCalendarVisible: false,
    });
  },

  confirmBookingDate(event) {
    const selectedDate = formatDateValue(event.detail);
    this.setData({
      bookingDateCalendarVisible: false,
      bookingCalendarDefaultDate: parseDateValue(selectedDate) || getTodayTimestamp(),
      "bookingForm.expectedDate": selectedDate,
    });
  },

  toggleAcceptFallback() {
    this.setData({
      "bookingForm.acceptFallback": !this.data.bookingForm.acceptFallback,
    });
  },

  // A3：选择办赛时段
  selectTimeSlot(event) {
    const { value } = event.currentTarget.dataset;
    this.setData({
      "bookingForm.timeSlot": value,
    });
  },

  submitBooking() {
    const { bookingForm, demand, result, bookingVenue } = this.data;

    if (!bookingForm.contactName || !bookingForm.phone) {
      wx.showToast({
        title: "联系人和手机号必填",
        icon: "none",
      });
      return;
    }

    if (!bookingForm.timeSlot) {
      wx.showToast({
        title: "请选择办赛时段",
        icon: "none",
      });
      return;
    }

    // A3：提交时自动带出场馆信息
    const submitForm = Object.assign({}, bookingForm, {
      venueName: bookingVenue ? bookingVenue.name : "",
      venueTown: bookingVenue ? bookingVenue.town : "",
      priceLevel: bookingVenue ? bookingVenue.priceLevel : "",
    });

    const recordId = `book_${Date.now()}`;

    saveBooking({
      id: recordId,
      type: "booking",
      mode: demand.mode,
      createdAt: new Date().toISOString(),
      summary: result.summary,
      payload: {
        demand,
        result,
        bookingForm: submitForm,
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

    wx.navigateTo({
      url: `/pages/booking-success/booking-success?id=${recordId}`,
    });
  },
});
