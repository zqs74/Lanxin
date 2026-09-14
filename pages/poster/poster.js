// poster.js - 方案海报页（预览 + Painter 生成海报导出）
const { loadPlan, prepareShare, shareMessage } = require('../../utils/share');
const session = require('../../utils/session');

Page(session.protectPage({
  data: {
    poster: null,
    saving: false,
    palette: null,
  },

  async onShow() {
    const record = await loadPlan(this._query);
    if (this._dead) return;
    this.setData({ poster: record.payload.result.posterPayload || null });
    prepareShare(this, record.id, this._query.shareId);
  },

  onShareAppMessage() { return shareMessage(this, this.data.poster && this.data.poster.title); },

  // —— Painter 导出：设置 palette 触发组件渲染，imgOK 回调拿图片路径 ——
  async savePoster() {
    if (this.data.saving || !this.data.poster) {
      return;
    }
    this.setData({ saving: true });
    try {
      await session.me();
      const record = await loadPlan(this._query);
      if (this._dead) return;
      const poster = record.payload.result.posterPayload;
      if (!poster) throw new Error('当前方案暂无可用海报');
      this.setData({ poster, palette: buildPosterPalette(poster) });
    } catch (error) { this.setData({ saving: false }); throw error; }
  },

  onImgOK(event) {
    const path = event.detail && event.detail.path;
    if (!path) {
      this.finishSaving("海报导出失败");
      return;
    }

    this.setData({ saving: false });

    wx.saveImageToPhotosAlbum({
      filePath: path,
      success: () => {
        wx.showToast({ title: "海报已保存", icon: "success" });
      },
      fail: (error) => {
        console.warn("saveImageToPhotosAlbum failed", error);
        wx.previewImage({ urls: [path] });
      },
    });
  },

  onImgErr(event) {
    console.warn("painter imgErr", event.detail);
    this.finishSaving("海报导出失败");
  },

  finishSaving(title) {
    this.setData({ saving: false });
    wx.showToast({ title, icon: "none" });
  },
}));

// 方案海报 palette（Painter JSON 布局，蓝白风格，与预约卡同源）
function buildPosterPalette(poster) {
  const views = [];

  // —— hero 渐变区 ——
  views.push({
    type: "rect",
    css: {
      left: "0rpx", top: "0rpx", width: "654rpx", height: "270rpx",
      color: "linear-gradient(135deg, #115cff 0%, #5b9cff 100%)",
    },
  });
  views.push({ type: "text", text: "篮芯办赛", css: { left: "40rpx", top: "34rpx", fontSize: "22rpx", color: "#ffffff" } });
  views.push({
    type: "text",
    text: poster.title,
    css: { left: "40rpx", top: "78rpx", width: "480rpx", fontSize: "44rpx", fontWeight: "bold", color: "#ffffff", maxLines: 1 },
  });
  views.push({
    type: "text",
    text: `${poster.modeLabel} · ${poster.town} · ${poster.date}`,
    css: { left: "40rpx", top: "156rpx", width: "480rpx", fontSize: "24rpx", color: "rgba(255,255,255,0.92)" },
  });
  // 匹配分胶囊
  views.push({
    type: "rect",
    css: { left: "40rpx", top: "200rpx", width: "178rpx", height: "46rpx", borderRadius: "23rpx", color: "rgba(255,255,255,0.18)" },
  });
  views.push({
    type: "text",
    text: `${poster.matchScore} 分匹配`,
    css: { left: "40rpx", top: "214rpx", width: "178rpx", textAlign: "center", fontSize: "22rpx", fontWeight: "bold", color: "#ffffff" },
  });

  // —— 场馆卡 ——
  const venueCardTop = 294;
  const hasCover = !!poster.venueCover;
  const textLeft = hasCover ? "210rpx" : "50rpx";
  views.push({
    type: "rect",
    css: { left: "30rpx", top: `${venueCardTop}rpx`, width: "594rpx", height: "260rpx", borderRadius: "24rpx", color: "#ffffff" },
  });
  if (hasCover) {
    views.push({
      type: "image",
      url: poster.venueCover,
      css: { left: "50rpx", top: `${venueCardTop + 18}rpx`, width: "140rpx", height: "140rpx", borderRadius: "20rpx" },
    });
  }
  views.push({ type: "text", text: "推荐场馆", css: { left: textLeft, top: `${venueCardTop + 24}rpx`, fontSize: "20rpx", color: "#1d5dff" } });
  views.push({
    type: "text",
    text: poster.venue,
    css: { left: textLeft, top: `${venueCardTop + 54}rpx`, width: "384rpx", fontSize: "32rpx", fontWeight: "bold", color: "#20304b", maxLines: 2 },
  });
  views.push({
    type: "text",
    text: poster.planTone,
    css: { left: textLeft, top: `${venueCardTop + 132}rpx`, width: "384rpx", fontSize: "22rpx", color: "#7d8cb1", maxLines: 1 },
  });
  // 场馆标签（横向排）
  let tagX = 50;
  const tagY = venueCardTop + 196;
  (poster.tags || []).slice(0, 3).forEach((tag) => {
    const tagWidth = Math.max(80, tag.length * 16 + 28);
    views.push({
      type: "rect",
      css: { left: `${tagX}rpx`, top: `${tagY}rpx`, width: `${tagWidth}rpx`, height: "36rpx", borderRadius: "18rpx", color: "rgba(29,93,255,0.1)" },
    });
    views.push({
      type: "text",
      text: tag,
      css: { left: `${tagX}rpx`, top: `${tagY + 8}rpx`, width: `${tagWidth}rpx`, textAlign: "center", fontSize: "20rpx", color: "#1d5dff" },
    });
    tagX += tagWidth + 12;
  });

  // —— 方案摘要卡 ——
  const summaryTop = venueCardTop + 260 + 24;
  views.push({
    type: "rect",
    css: { left: "30rpx", top: `${summaryTop}rpx`, width: "594rpx", height: "220rpx", borderRadius: "24rpx", color: "#ffffff" },
  });
  views.push({ type: "text", text: "方案摘要", css: { left: "50rpx", top: `${summaryTop + 22}rpx`, fontSize: "22rpx", color: "#7d8cb1" } });
  views.push({
    type: "text",
    text: poster.summaryLead,
    css: { left: "50rpx", top: `${summaryTop + 64}rpx`, width: "500rpx", fontSize: "30rpx", fontWeight: "bold", color: "#1d5dff", maxLines: 1 },
  });
  views.push({
    type: "text",
    text: poster.summaryTail,
    css: { left: "50rpx", top: `${summaryTop + 110}rpx`, width: "500rpx", fontSize: "24rpx", fontWeight: "bold", color: "#21324f", maxLines: 2 },
  });
  views.push({
    type: "text",
    text: poster.summaryNote || poster.strategyLine || "",
    css: { left: "50rpx", top: `${summaryTop + 172}rpx`, width: "500rpx", fontSize: "20rpx", color: "#64789c", maxLines: 1 },
  });

  // —— 方案重点卡 ——
  const points = (poster.highlightPoints || []).slice(0, 4);
  const pointsTop = summaryTop + 220 + 24;
  const pointsH = points.length ? 92 + points.length * 54 : 0;
  if (points.length) {
    views.push({
      type: "rect",
      css: { left: "30rpx", top: `${pointsTop}rpx`, width: "594rpx", height: `${pointsH}rpx`, borderRadius: "24rpx", color: "#ffffff" },
    });
    views.push({ type: "text", text: "方案重点", css: { left: "50rpx", top: `${pointsTop + 22}rpx`, fontSize: "22rpx", color: "#7d8cb1" } });
    points.forEach((item, index) => {
      const y = pointsTop + 70 + index * 54;
      views.push({
        type: "text",
        text: item.label,
        css: { left: "50rpx", top: `${y}rpx`, width: "96rpx", fontSize: "20rpx", fontWeight: "bold", color: "#5b7ed6", maxLines: 1 },
      });
      views.push({
        type: "text",
        text: item.value,
        css: { left: "156rpx", top: `${y}rpx`, width: "440rpx", fontSize: "22rpx", fontWeight: "bold", color: "#21324f", maxLines: 1 },
      });
    });
  }

  // —— 资源配置网格（两列） ——
  const infoCards = [
    ["预算落点", poster.budgetFocus],
    ["预算参考", poster.budgetHint],
    ["裁判配置", poster.refereeLine],
    ["物料建议", poster.materialLine],
    ["租赁建议", poster.rentalLine],
    ["供应商", poster.supplierLine],
    ["媒体", poster.mediaLine],
  ].filter((item) => item[1]);

  const gridTop = points.length ? pointsTop + pointsH + 24 : summaryTop + 220 + 24;
  const gridColumns = Math.max(1, Math.ceil(infoCards.length / 2));
  const gridH = 84 + gridColumns * 88;
  views.push({
    type: "rect",
    css: { left: "30rpx", top: `${gridTop}rpx`, width: "594rpx", height: `${gridH}rpx`, borderRadius: "24rpx", color: "#ffffff" },
  });
  views.push({ type: "text", text: "资源配置", css: { left: "50rpx", top: `${gridTop + 22}rpx`, fontSize: "22rpx", color: "#7d8cb1" } });

  const colX = [50, 330];
  infoCards.forEach((entry, index) => {
    const col = index % 2;
    const rowIndex = Math.floor(index / 2);
    const x = colX[col];
    const y = gridTop + 76 + rowIndex * 88;
    views.push({
      type: "text",
      text: entry[0],
      css: { left: `${x}rpx`, top: `${y}rpx`, fontSize: "20rpx", color: "#9aa8c4" },
    });
    views.push({
      type: "text",
      text: entry[1],
      css: { left: `${x}rpx`, top: `${y + 34}rpx`, width: "274rpx", fontSize: "24rpx", fontWeight: "bold", color: "#20304b", maxLines: 2 },
    });
  });

  // —— 底部引导卡 ——
  const bottomTop = gridTop + gridH + 16;
  views.push({
    type: "rect",
    css: { left: "30rpx", top: `${bottomTop}rpx`, width: "594rpx", height: "116rpx", borderRadius: "24rpx", color: "#1658ef" },
  });
  views.push({
    type: "text",
    text: "打开小程序查看完整方案",
    css: { left: "50rpx", top: `${bottomTop + 30}rpx`, fontSize: "24rpx", fontWeight: "bold", color: "#ffffff" },
  });
  views.push({
    type: "text",
    text: "场馆、裁判、物料、预约入口已同步准备好",
    css: { left: "50rpx", top: `${bottomTop + 74}rpx`, width: "540rpx", fontSize: "20rpx", color: "rgba(255,255,255,0.9)", maxLines: 1 },
  });

  const height = bottomTop + 116 + 24;
  return {
    width: "654rpx",
    height: `${height}rpx`,
    background: "#eef4ff",
    views,
  };
}
