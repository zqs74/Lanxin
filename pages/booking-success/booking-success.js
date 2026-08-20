// booking-success.js - 场地预约成功页（展示预约信息 + Canvas 导出预约图片）
const { getBookings } = require("../../utils/storage");
const { encodePayload } = require("../../utils/share");

const TIME_SLOT_LABELS = {
  morning: "上午 08:00-12:00",
  afternoon: "下午 12:00-18:00",
  evening: "晚上 18:00-22:00",
};

const POSTER_WIDTH = 720;
const INFO_GRID_START_Y = 884;
const INFO_ROW_HEIGHT = 86;
const BOTTOM_CARD_HEIGHT = 126;
const BOTTOM_CARD_MARGIN = 48;

Page({
  data: {
    record: null,
    form: null,
    venue: null,
    modeLabel: "",
    summary: "",
    saving: false,
    canvasHeight: 1400,
  },

  onLoad(query) {
    const record = (getBookings() || []).find((item) => item.id === query.id) || null;
    if (!record) {
      wx.showToast({ title: "预约记录不存在", icon: "none" });
      return;
    }

    const payload = record.payload || {};
    const form = payload.bookingForm || {};
    const demand = payload.demand || {};
    const result = payload.result || {};
    const venueSection = (result.sections || []).find((section) => section.key === "venue");
    const venueItem = venueSection && venueSection.items[0];

    const venue = {
      name: form.venueName || (venueItem && venueItem.name) || "场馆待确认",
      town: form.venueTown || demand.town || "东莞",
      priceLevel: form.priceLevel || (venueItem && venueItem.priceLevel) || "",
      cover: (venueItem && (venueItem.cover || venueItem.avatar || venueItem.image)) || "",
    };

    const infoRows = this.buildInfoRows(form);

    this.setData({
      record,
      form,
      venue,
      modeLabel: demand.mode === "pro_event" ? "半专业赛事" : "野球约球",
      summary: record.summary || "",
      canvasHeight: this.getCanvasHeight(infoRows.length),
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

  onShareAppMessage() {
    const { record } = this.data;
    const demand = (record && record.payload && record.payload.demand) || {};
    const encoded = encodePayload(demand);
    return {
      title: "我的场地预约已提交，一起看看办赛方案",
      path: `/pages/result/result?payload=${encoded}`,
      imageUrl: this.data.venue && this.data.venue.cover ? this.data.venue.cover : "",
    };
  },

  saveImage() {
    if (this.data.saving) {
      return;
    }

    this.setData({ saving: true });

    const query = wx.createSelectorQuery().in(this);
    query.select("#booking-canvas").fields({ node: true, size: true }).exec(async (res) => {
      const canvasInfo = res && res[0];
      if (!canvasInfo || !canvasInfo.node) {
        this.finishSaving("画布初始化失败");
        return;
      }

      const { node } = canvasInfo;
      const width = POSTER_WIDTH;
      const height = this.data.canvasHeight;
      const ctx = node.getContext("2d");
      const dpr = Math.max(2, wx.getWindowInfo().pixelRatio || 2);

      node.width = width * dpr;
      node.height = height * dpr;

      if (typeof ctx.setTransform === "function") {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else if (typeof ctx.scale === "function") {
        ctx.scale(dpr, dpr);
      }

      try {
        await renderBookingCard(ctx, node, width, height, this.data, this.getSlotLabel.bind(this));
        await waitForCanvasFlush();
      } catch (error) {
        console.error("renderBookingCard failed", error);
        this.finishSaving("图片导出失败");
        return;
      }

      try {
        const tempFilePath = await exportCanvas(node, width, height, dpr, this);
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: () => {
            this.setData({ saving: false });
            wx.showToast({ title: "已保存到相册", icon: "success" });
          },
          fail: (error) => {
            console.warn("saveImageToPhotosAlbum failed", error);
            this.setData({ saving: false });
            wx.previewImage({ urls: [tempFilePath] });
          },
        });
      } catch (error) {
        console.error("exportCanvas failed", error);
        this.finishSaving("图片导出失败");
      }
    });
  },

  finishSaving(title) {
    this.setData({ saving: false });
    wx.showToast({ title, icon: "none" });
  },

  getCanvasHeight(infoCount) {
    const rows = Math.max(1, Math.ceil(infoCount / 2));
    const gridH = 76 + rows * INFO_ROW_HEIGHT;
    const bottomY = INFO_GRID_START_Y + gridH + 10;
    return bottomY + BOTTOM_CARD_HEIGHT + BOTTOM_CARD_MARGIN;
  },
});

function waitForCanvasFlush() {
  return new Promise((resolve) => {
    setTimeout(resolve, 80);
  });
}

function exportCanvas(node, width, height, dpr, component) {
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath(
      {
        canvas: node,
        x: 0,
        y: 0,
        width,
        height,
        destWidth: width * dpr,
        destHeight: height * dpr,
        success: ({ tempFilePath }) => resolve(tempFilePath),
        fail: (error) => reject(error),
      },
      component
    );
  });
}

function roundRectPath(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRoundRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.save();
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

async function loadCanvasImage(node, src) {
  try {
    const localSrc = await new Promise((resolve, reject) => {
      wx.getImageInfo({
        src,
        success: (res) => resolve(res.path),
        fail: (error) => reject(error),
      });
    });

    return await new Promise((resolve, reject) => {
      const image = node.createImage();
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = localSrc;
    });
  } catch (error) {
    console.warn("loadCanvasImage failed", src, error);
    return null;
  }
}

async function renderBookingCard(ctx, node, width, height, data, getSlotLabel) {
  const { form, venue, modeLabel, summary } = data;
  const date = form.expectedDate || "日期待定";
  const slotLabel = getSlotLabel(form.timeSlot) || "时段待定";

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#eef4ff";
  ctx.fillRect(0, 0, width, height);

  // —— hero 渐变 ——
  const heroGradient = ctx.createLinearGradient(0, 0, width, 460);
  heroGradient.addColorStop(0, "#115cff");
  heroGradient.addColorStop(1, "#5b9cff");
  ctx.fillStyle = heroGradient;
  ctx.fillRect(0, 0, width, 420);

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.beginPath();
  ctx.arc(width - 62, 66, 76, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "18px sans-serif";
  ctx.fillText("篮芯办赛", 42, 58);

  // 成功对勾
  drawSuccessBadge(ctx, 42, 108);

  ctx.font = "bold 40px sans-serif";
  ctx.fillText("场地预约成功", 128, 132);

  ctx.font = "18px sans-serif";
  wrapText(ctx, `${modeLabel} · ${venue.town} · ${date} · ${slotLabel}`, 128, 176, width - 170, 28, 2);

  // —— 场馆卡 ——
  const coverImage = venue.cover ? await loadCanvasImage(node, venue.cover) : null;
  drawVenueCard(ctx, venue, width, coverImage);

  // —— 预约信息卡 ——
  const infoRows = [
    ["办赛日期", date],
    ["办赛时段", slotLabel],
    ["联系人", form.contactName || "—"],
    ["手机号", form.phone || "—"],
    ["微信号", form.wechat || "—"],
    ["备注", form.remark || "—"],
  ].filter((row) => row[1] && row[1] !== "—");

  const gridRows = Math.max(1, Math.ceil(infoRows.length / 2));
  const gridH = 76 + gridRows * INFO_ROW_HEIGHT;
  drawInfoCard(ctx, width, infoRows);

  // —— 底部 ——
  const bottomY = INFO_GRID_START_Y + gridH + 10;
  fillRoundRect(ctx, 30, bottomY, width - 60, BOTTOM_CARD_HEIGHT, 28, "#1658ef");
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("场地预约已提交", 54, bottomY + 44);
  ctx.font = "15px sans-serif";
  wrapText(ctx, summary || "客户经理将尽快与您联系，确认档期与细节", 54, bottomY + 84, width - 108, 26, 2);
}

function drawSuccessBadge(ctx, x, y) {
  // 白色圆环 + 对勾
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + 40, y, 40, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 2);
  ctx.lineTo(x + 36, y + 16);
  ctx.lineTo(x + 60, y - 12);
  ctx.stroke();
  ctx.restore();
}

function drawVenueCard(ctx, venue, width, coverImage) {
  const cardX = 30;
  const cardY = 324;
  const cardW = width - 60;
  const cardH = 298;

  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 30, "#dce8ff");

  if (coverImage) {
    ctx.save();
    roundRectPath(ctx, cardX, cardY, cardW, cardH, 30);
    ctx.clip();
    ctx.drawImage(coverImage, cardX, cardY, cardW, cardH);
    ctx.restore();
  }

  const mask = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
  mask.addColorStop(0, "rgba(18,41,89,0.04)");
  mask.addColorStop(1, "rgba(18,41,89,0.78)");
  ctx.save();
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 30);
  ctx.fillStyle = mask;
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "14px sans-serif";
  ctx.fillText("预约场馆", cardX + 24, cardY + 38);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px sans-serif";
  wrapText(ctx, venue.name, cardX + 24, cardY + 92, cardW - 48, 38, 3);
  ctx.font = "15px sans-serif";
  wrapText(ctx, `${venue.town} · ${venue.priceLevel || "价格面议"}`, cardX + 24, cardY + 214, cardW - 48, 26, 2);
}

function drawInfoCard(ctx, width, infoRows) {
  const cardX = 30;
  const cardY = INFO_GRID_START_Y;
  const cardW = width - 60;
  const gridRows = Math.max(1, Math.ceil(infoRows.length / 2));
  const gridH = 76 + gridRows * INFO_ROW_HEIGHT;

  fillRoundRect(ctx, cardX, cardY, cardW, gridH, 28, "#ffffff");
  ctx.fillStyle = "#7d8cb1";
  ctx.font = "15px sans-serif";
  ctx.fillText("预约信息", cardX + 24, cardY + 36);

  const cellW = (cardW - 40) / 2;
  infoRows.forEach((entry, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = cardX + 20 + col * (cellW + 0);
    const y = cardY + 76 + row * INFO_ROW_HEIGHT;

    ctx.fillStyle = "#7d8cb1";
    ctx.font = "14px sans-serif";
    ctx.fillText(entry[0], x, y + 18);
    ctx.fillStyle = "#20304b";
    ctx.font = "bold 18px sans-serif";
    wrapText(ctx, entry[1], x, y + 52, cellW - 20, 26, 2);
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  if (!text) {
    return;
  }

  let line = "";
  let lines = 0;
  let renderedLength = 0;

  for (let i = 0; i < text.length; i += 1) {
    const testLine = line + text[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineHeight * lines);
      renderedLength += line.length;
      lines += 1;
      line = text[i];
      if (lines >= maxLines - 1) {
        break;
      }
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) {
    const finalText = lines === maxLines - 1 && text.length > renderedLength + line.length
      ? `${line}...`
      : line;
    ctx.fillText(finalText, x, y + lineHeight * lines);
  }
}
