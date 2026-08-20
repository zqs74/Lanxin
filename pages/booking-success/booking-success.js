// booking-success.js - 场地预约成功页（展示预约信息 + Painter 生成预约图片导出）
const { getBookings } = require("../../utils/storage");
const { encodePayload, decodePayload } = require("../../utils/share");
const { createRecommendation } = require("../../utils/recommender");

const TIME_SLOT_LABELS = {
  morning: "上午 08:00-12:00",
  afternoon: "下午 12:00-18:00",
  evening: "晚上 18:00-22:00",
};

// 补齐 demand 默认值（与 result 页一致），用于分享还原重建方案
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
      mode: "pro_event",
    },
    payload
  );
}

Page({
  data: {
    record: null,
    demand: null,
    form: null,
    venue: null,
    modeLabel: "",
    summary: "",
    saving: false,
    palette: null,
  },

  onLoad(query) {
    // 来源一：本地记录（query.id，历史页/预约后跳转）
    // 来源二：分享还原（query.payload，好友点开分享卡片）
    let demand = null;
    let bookingForm = {};
    let result = null;
    let record = null;

    if (query.id) {
      record = (getBookings() || []).find((item) => item.id === query.id) || null;
      if (record) {
        const payload = record.payload || {};
        demand = payload.demand || null;
        bookingForm = payload.bookingForm || {};
        result = payload.result || {};
      }
    } else if (query.payload) {
      const shared = decodePayload(query.payload);
      if (shared && shared.demand) {
        demand = shared.demand;
        bookingForm = shared.bookingForm || {};
        result = createRecommendation(normalizeDemand(demand));
      }
    }

    if (!demand) {
      wx.showToast({ title: "预约信息不存在", icon: "none" });
      return;
    }

    const venueSection = (result.sections || []).find((section) => section.key === "venue");
    const venueItem = venueSection && venueSection.items[0];

    const venue = {
      name: bookingForm.venueName || (venueItem && venueItem.name) || "场馆待确认",
      town: bookingForm.venueTown || demand.town || "东莞",
      priceLevel: bookingForm.priceLevel || (venueItem && venueItem.priceLevel) || "",
      cover: (venueItem && (venueItem.cover || venueItem.avatar || venueItem.image)) || "",
    };

    this.setData({
      record,
      demand,
      form: bookingForm,
      venue,
      modeLabel: demand.mode === "pro_event" ? "半专业赛事" : "野球约球",
      summary: (record && record.summary) || result.summary || "",
    });
  },

  getSlotLabel(value) {
    return TIME_SLOT_LABELS[value] || "";
  },

  buildInfoRows(form) {
    const rows = [
      ["办赛日期", form.expectedDate || "待定"],
      ["办赛时段", this.getSlotLabel(form.timeSlot) || "待定"],
      ["联系人", form.contactName || "—"],
      ["手机号", form.phone || "—"],
      ["微信号", form.wechat || "—"],
      ["备注", form.remark || "—"],
    ];
    return rows.filter((row) => row[1] && row[1] !== "—");
  },

  goHome() {
    wx.switchTab({ url: "/pages/index/index" });
  },

  // 回到该预约对应的办赛方案
  goPlan() {
    const { demand } = this.data;
    if (!demand) {
      return;
    }
    const encoded = encodePayload(demand);
    wx.navigateTo({
      url: `/pages/result/result?payload=${encoded}`,
    });
  },

  onShareAppMessage() {
    const { demand, form } = this.data;
    if (!demand) {
      return {
        title: "我的场地预约已提交",
        path: "/pages/index/index",
      };
    }
    // 分享还原：payload 携带完整 demand + bookingForm，好友打开直达预约成功页
    const encoded = encodePayload({ demand, bookingForm: form });
    return {
      title: "我的场地预约已提交，一起看看办赛方案",
      path: `/pages/booking-success/booking-success?payload=${encoded}`,
      imageUrl: this.data.venue && this.data.venue.cover ? this.data.venue.cover : "",
    };
  },

  // —— Painter 导出：设置 palette 触发组件渲染，imgOK 回调拿图片路径 ——
  saveImage() {
    if (this.data.saving) {
      return;
    }
    this.setData({
      saving: true,
      palette: this.buildPalette(),
    });
  },

  onImgOK(event) {
    const path = event.detail && event.detail.path;
    if (!path) {
      this.finishSaving("图片生成失败");
      return;
    }

    this.setData({ saving: false });

    wx.saveImageToPhotosAlbum({
      filePath: path,
      success: () => {
        wx.showToast({ title: "已保存到相册", icon: "success" });
      },
      fail: (error) => {
        console.warn("saveImageToPhotosAlbum failed", error);
        wx.previewImage({ urls: [path] });
      },
    });
  },

  onImgErr(event) {
    console.warn("painter imgErr", event.detail);
    this.finishSaving("图片生成失败");
  },

  finishSaving(title) {
    this.setData({ saving: false });
    wx.showToast({ title, icon: "none" });
  },

  // 预约卡片 palette（Painter JSON 布局）
  buildPalette() {
    const { form, venue, modeLabel, summary } = this.data;
    const date = form.expectedDate || "日期待定";
    const slotLabel = this.getSlotLabel(form.timeSlot) || "时段待定";
    const views = [];

    // —— hero 渐变区 ——
    views.push({
      type: "rect",
      css: {
        left: "0rpx", top: "0rpx", width: "654rpx", height: "240rpx",
        color: "linear-gradient(135deg, #115cff 0%, #5b9cff 100%)",
      },
    });
    views.push({ type: "text", text: "篮芯办赛", css: { left: "40rpx", top: "32rpx", fontSize: "22rpx", color: "#ffffff" } });
    views.push({ type: "text", text: "场地预约成功", css: { left: "40rpx", top: "76rpx", fontSize: "46rpx", fontWeight: "bold", color: "#ffffff" } });
    // 模式/镇区 与 日期/时段 分两行展示
    views.push({
      type: "text",
      text: `${modeLabel} · ${venue.town}`,
      css: { left: "40rpx", top: "156rpx", width: "500rpx", fontSize: "24rpx", color: "rgba(255,255,255,0.92)" },
    });
    views.push({
      type: "text",
      text: `${date} · ${slotLabel}`,
      css: { left: "40rpx", top: "190rpx", width: "500rpx", fontSize: "24rpx", color: "rgba(255,255,255,0.92)" },
    });
    // 对勾圆 + ✓
    views.push({
      type: "rect",
      css: { right: "40rpx", top: "52rpx", width: "92rpx", height: "92rpx", borderRadius: "100%", color: "rgba(255,255,255,0.18)" },
    });
    views.push({
      type: "text",
      text: "✓",
      css: { right: "40rpx", top: "66rpx", width: "92rpx", textAlign: "center", fontSize: "52rpx", fontWeight: "bold", color: "#ffffff" },
    });

    // —— 场馆卡 ——
    const hasCover = !!venue.cover;
    const textLeft = hasCover ? "200rpx" : "50rpx";
    views.push({
      type: "rect",
      css: { left: "30rpx", top: "260rpx", width: "594rpx", height: "170rpx", borderRadius: "24rpx", color: "#ffffff" },
    });
    if (hasCover) {
      views.push({
        type: "image",
        url: venue.cover,
        css: { left: "50rpx", top: "280rpx", width: "130rpx", height: "130rpx", borderRadius: "18rpx" },
      });
    }
    views.push({ type: "text", text: "预约场馆", css: { left: textLeft, top: "288rpx", fontSize: "20rpx", color: "#1d5dff" } });
    views.push({
      type: "text",
      text: venue.name,
      css: { left: textLeft, top: "322rpx", width: "400rpx", fontSize: "30rpx", fontWeight: "bold", color: "#20304b", maxLines: 1 },
    });
    views.push({
      type: "text",
      text: `${venue.town} · ${venue.priceLevel || "价格面议"}`,
      css: { left: textLeft, top: "368rpx", width: "400rpx", fontSize: "22rpx", color: "#7d8cb1", maxLines: 1 },
    });

    // —— 预约信息卡（两列网格） ——
    const infoRows = this.buildInfoRows(form);
    const infoColumns = Math.max(1, Math.ceil(infoRows.length / 2));
    const infoCardH = 84 + infoColumns * 88;
    const infoTop = 450;
    views.push({
      type: "rect",
      css: { left: "30rpx", top: `${infoTop}rpx`, width: "594rpx", height: `${infoCardH}rpx`, borderRadius: "24rpx", color: "#ffffff" },
    });
    views.push({ type: "text", text: "预约信息", css: { left: "50rpx", top: `${infoTop + 22}rpx`, fontSize: "22rpx", color: "#7d8cb1" } });

    const colX = [50, 330];
    infoRows.forEach((row, index) => {
      const col = index % 2;
      const rowIndex = Math.floor(index / 2);
      const x = colX[col];
      const y = infoTop + 76 + rowIndex * 88;
      views.push({
        type: "text",
        text: row[0],
        css: { left: `${x}rpx`, top: `${y}rpx`, fontSize: "20rpx", color: "#9aa8c4" },
      });
      views.push({
        type: "text",
        text: row[1],
        css: { left: `${x}rpx`, top: `${y + 34}rpx`, width: "274rpx", fontSize: "26rpx", fontWeight: "bold", color: "#20304b", maxLines: 2 },
      });
    });

    // —— 底部引导卡 ——
    const bottomTop = infoTop + infoCardH + 16;
    views.push({
      type: "rect",
      css: { left: "30rpx", top: `${bottomTop}rpx`, width: "594rpx", height: "116rpx", borderRadius: "24rpx", color: "#1658ef" },
    });
    views.push({
      type: "text",
      text: "场地预约已提交",
      css: { left: "50rpx", top: `${bottomTop + 28}rpx`, fontSize: "26rpx", fontWeight: "bold", color: "#ffffff" },
    });
    views.push({
      type: "text",
      text: summary || "客户经理将尽快与您联系，确认档期与细节",
      css: { left: "50rpx", top: `${bottomTop + 72}rpx`, width: "540rpx", fontSize: "20rpx", color: "rgba(255,255,255,0.9)", maxLines: 2 },
    });

    const height = bottomTop + 116 + 24;
    return {
      width: "654rpx",
      height: `${height}rpx`,
      background: "#eef4ff",
      views,
    };
  },
});
