const { APP_MODE } = require('../../utils/constants');
const { loadPlan, planPath, prepareShare, shareMessage } = require('../../utils/share');
const { createRecommendation } = require('../../utils/recommender');
const { saveBooking } = require('../../utils/storage');
const api = require('../../utils/api');
const session = require('../../utils/session');
const { isInfoOnly, briefDescription } = require('../../utils/resource-policy');
const privacy = require('../../utils/privacy');

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEMAND_FIELDS = ['mode', 'city', 'sentence', 'town', 'playDate', 'peopleCount', 'teamCount',
  'budgetLevel', 'venuePreference', 'needReferee', 'needMaterials', 'needMedia', 'needSupplier'];

function copySharedDemand(source) {
  const demand = {};
  DEMAND_FIELDS.forEach(key => {
    if (source && ['string', 'number', 'boolean'].includes(typeof source[key])) demand[key] = source[key];
  });
  return demand;
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

Page(privacy.withPrivacy(session.protectPage({
  data: {
    mode: APP_MODE.PRO_EVENT,
    demand: null,
    result: null,
    budgetOptions: [],
    dateOptions: [],
    townOptions: [],
    tuneVisible: false,
    bookingVisible: false,
    infoOnly: false,
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
    timeSlots: [],
    planId: "",
    bookingVenue: null,
    // A1 详情访问控制：点击方案资源卡 → 居中弹窗展示客服二维码
    guideVisible: false,
  },

  async onLoad() {
    const config = await api.getConfig();
    this._config = config;
    this.setData({ budgetOptions: config.budgetOptions || [], dateOptions: config.dateOptions || [],
      townOptions: config.towns || [], timeSlots: config.timeSlots || [] });
  },

  async onShow() {
    const query = this._query;
    const sequence = this._resultSequence = (this._resultSequence || 0) + 1;
    const record = await loadPlan(query);
    if (this._dead || query !== this._query || sequence !== this._resultSequence) return;
    this.applyRecord(record);
  },

  applyRecord(record) {
    if (!record || !record.payload || !record.payload.demand || !record.payload.result) throw new Error('方案响应无效');
    api.id(record.id);
    this.record = record;
    const { demand, result } = record.payload;
    const venueSection = (result.sections || []).find(section => section.key === 'venue');
    const venue = venueSection && venueSection.items && venueSection.items[0];
    const initialBookingDate = this.data.planId === record.id && this.data.bookingForm.expectedDate
      ? this.data.bookingForm.expectedDate : formatDateValue(demand.playDate);
    // Display copy only: the stored record keeps the full descriptions.
    const shown = Object.assign({}, result, { sections: (result.sections || []).map(section => Object.assign({}, section, {
      items: (section.items || []).map(item => Object.assign({}, item, { description: briefDescription(item.description) })) })) });
    this.setData({ planId: record.id, mode: demand.mode, demand, result: shown,
      infoOnly: isInfoOnly(this._config, session.getContact(), record, result, venue),
      bookingVenue: (venueSection && venueSection.items && venueSection.items[0]) || null,
      'bookingForm.expectedDate': initialBookingDate,
      bookingCalendarDefaultDate: parseDateValue(initialBookingDate) || getTodayTimestamp() });
    prepareShare(this, record.id, this._query.shareId);
  },

  onShareAppMessage() {
    return shareMessage(this, this.data.result && this.data.result.posterPayload && this.data.result.posterPayload.title);
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

  async rematchResult() {
    if (this._rematching || this._owningPlan || !this.data.demand) return;
    this._rematching = true;
    this._resultSequence = (this._resultSequence || 0) + 1;
    const demand = JSON.parse(JSON.stringify(this.data.demand));
    try {
      const record = await api.submitOnce('plan', demand, requestId => createRecommendation(demand, requestId));
      if (this._dead) return;
      this._query = { id: record.id };
      this.applyRecord(record);
      this.closeTunePanel();
      wx.showToast({ title: '已重新匹配', icon: 'success' });
    } finally { this._rematching = false; }
  },

  openPoster() {
    if (!this.data.result) return;
    // A plan without matched resources has no poster content; opening the poster page would show a blank screen.
    if (!this.data.result.posterPayload) {
      wx.showToast({ title: '当前方案暂无可分享的海报，请调整需求后再试', icon: 'none' }); return;
    }
    wx.navigateTo({ url: planPath(this._query, 'poster') });
  },

  // —— A1：方案资源卡详情守卫（点击 → 居中弹窗展示客服二维码，详情不对外展示）——
  onResourceTap() {
    this.showGuide();
  },

  showGuide() {
    api.applyContact(this);
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

  async openBooking() {
    if (this._owningPlan || this._rematching) return;
    if (this.data.infoOnly || isInfoOnly(this._config, session.getContact(), this.data.bookingVenue)) {
      wx.showToast({ title: '公开信息不支持代订，请自行核实', icon: 'none' }); return;
    }
    if (this._query.shareId) {
      this._owningPlan = true;
      this._resultSequence = (this._resultSequence || 0) + 1;
      try {
        const demand = copySharedDemand(this.data.demand);
        wx.showToast({ title: '正在为你重新匹配预约方案', icon: 'none' });
        const record = await api.submitOnce('shared-booking-plan', demand,
          requestId => createRecommendation(demand, requestId));
        if (this._dead) return;
        this._query = { id: record.id };
        this.applyRecord(record);
      } finally { this._owningPlan = false; }
    }
    if (this.data.infoOnly) {
      wx.showToast({ title: '公开信息不支持代订，请自行核实', icon: 'none' }); return;
    }
    if (!this.data.bookingVenue || !this.data.planId) { wx.showToast({ title: "暂无可预约场馆", icon: "none" }); return; }
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
    privacy.cancel(this);
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

  async submitBooking() {
    if (this._bookingSubmitting || !this.data.bookingVisible) return;
    if (this.data.infoOnly || isInfoOnly(this._config, session.getContact(), this.data.bookingVenue)) {
      wx.showToast({ title: '公开信息不支持代订，请自行核实', icon: 'none' }); return;
    }
    if (this._query.shareId) throw new Error('请先重新匹配为自己的方案再预约');
    const { bookingForm, bookingVenue, planId } = this.data;
    if (!planId || !bookingVenue) throw new Error('暂无可预约场馆');
    if (!(bookingForm.contactName || '').trim() || !/^1[3-9]\d{9}$/.test(bookingForm.phone || '')) throw new Error('请填写联系人和有效手机号');
    if (!bookingForm.expectedDate || !bookingForm.timeSlot) throw new Error('请选择办赛日期和时段');
    const form = Object.assign({}, bookingForm);
    const epoch = session.getEpoch();
    this._bookingSubmitting = true;
    try {
      try { await privacy.requirePrivacy(this); }
      catch (error) { throw new Error(error.message + '；未提交预约资料'); }
      if (this._dead || epoch !== session.getEpoch() || !this.data.bookingVisible) return;
      if (planId !== this.data.planId || this.data.infoOnly ||
        isInfoOnly(this._config, session.getContact(), this.data.bookingVenue)) {
        throw new Error('方案或资源状态已变更，请重新查看后操作');
      }
      const record = await api.submitOnce('booking', { planId, bookingForm: form },
        requestId => saveBooking(planId, form, requestId));
      if (this._dead) return;
      if (!record || !record.id || !record.status) throw new Error('预约响应无效，请重试');
      const recordId = api.id(record.id);
      this.closeBooking();
      wx.showToast({ title: record.statusLabel || '预约已提交，待确认', icon: 'none' });
      wx.navigateTo({ url: '/pages/booking-success/booking-success?id=' + recordId });
    } finally { this._bookingSubmitting = false; }
  },
})));
