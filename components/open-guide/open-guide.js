// open-guide.js - 开通引导弹窗组件（A1 详情访问控制 + A2 客服入口）
// 需求：办赛方端"只能看展示内容；点击详情 → 居中弹窗展示客服二维码/联系方式"
const { CONTACT } = require("../../utils/constants");

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    contact: CONTACT,
  },

  methods: {
    noop() {},

    close() {
      this.triggerEvent("close");
    },

    previewQr() {
      const { qrCode } = this.data.contact;
      if (!qrCode) {
        wx.showToast({ title: '客服二维码未配置', icon: 'none' });
        return;
      }
      // 包内静态图片需先经 getImageInfo 转成本地临时路径，wx.previewImage 才能放大预览
      wx.getImageInfo({
        src: qrCode,
        success: (res) => {
          wx.previewImage({
            current: res.path,
            urls: [res.path],
          });
        },
        fail: () => {
          wx.showToast({ title: "二维码加载失败", icon: "none" });
        },
      });
    },

    copyWechat() {
      const { wechat } = this.data.contact;
      if (!wechat) {
        wx.showToast({ title: "客服微信待配置", icon: "none" });
        return;
      }
      wx.setClipboardData({
        data: wechat,
        success: () => {
          wx.showToast({ title: "微信号已复制", icon: "none" });
        },
      });
    },

    callPhone() {
      const { phone } = this.data.contact;
      if (!phone) {
        wx.showToast({ title: "客服电话未配置", icon: "none" });
        return;
      }
      wx.makePhoneCall({
        phoneNumber: phone,
        fail: () => {
          wx.showToast({ title: "拨号未完成", icon: "none" });
        },
      });
    },
  },
});
