const { decodePayload, encodePayload } = require("../../utils/share");
const { createRecommendation } = require("../../utils/recommender");

const POSTER_WIDTH = 720;
const GRID_CARD_HEIGHT = 138;
const GRID_CARD_GAP = 16;
const GRID_START_Y = 1120;
const BOTTOM_CARD_HEIGHT = 126;
const BOTTOM_CARD_MARGIN = 48;

Page({
  data: {
    poster: null,
    saving: false,
    canvasHeight: 1880,
  },

  onLoad(query) {
    const payload = decodePayload(query.payload || "");
    const result = createRecommendation(payload || {});
    this.setData({
      poster: result.posterPayload,
      canvasHeight: getPosterCanvasHeight(result.posterPayload),
    });
  },

  onShareAppMessage() {
    const payload = getApp().globalData.latestSharePayload || {};
    const encoded = encodePayload(payload);
    return {
      title: this.data.poster ? this.data.poster.title : "东莞篮球约战方案",
      path: `/pages/result/result?payload=${encoded}`,
    };
  },

  savePoster() {
    if (this.data.saving || !this.data.poster) {
      return;
    }

    this.setData({
      saving: true,
    });

    const query = wx.createSelectorQuery().in(this);
    query.select("#poster-canvas").fields({ node: true, size: true }).exec(async (res) => {
      const canvasInfo = res && res[0];
      if (!canvasInfo || !canvasInfo.node) {
        this.finishSaving("海报画布初始化失败");
        return;
      }

      const { node } = canvasInfo;
      const width = POSTER_WIDTH;
      const height = this.data.canvasHeight || getPosterCanvasHeight(this.data.poster);
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
        await renderPoster(ctx, node, width, height, this.data.poster);
        await waitForCanvasFlush();
      } catch (error) {
        console.error("renderPoster failed", error);
        this.finishSaving("海报导出失败");
        return;
      }

      try {
        const tempFilePath = await exportCanvas(node, width, height, dpr, this);
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: () => {
            this.setData({ saving: false });
            wx.showToast({
              title: "海报已保存",
              icon: "success",
            });
          },
          fail: (error) => {
            console.warn("saveImageToPhotosAlbum failed", error);
            this.setData({ saving: false });
            wx.previewImage({
              urls: [tempFilePath],
            });
          },
        });
      } catch (error) {
        console.error("exportCanvas failed", error);
        this.finishSaving("海报导出失败");
      }
    });
  },

  finishSaving(title) {
    this.setData({ saving: false });
    wx.showToast({
      title,
      icon: "none",
    });
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

function getPosterInfoCards(poster) {
  if (!poster) {
    return [];
  }

  return [
    ["预算落点", poster.budgetFocus],
    ["预算参考", poster.budgetHint],
    ["裁判配置", poster.refereeLine],
    ["物料建议", poster.materialLine],
    ["租赁建议", poster.rentalLine],
    ["供应商", poster.supplierLine],
    ["媒体", poster.mediaLine],
  ].filter((item) => item[1]);
}

function getPosterCanvasHeight(poster) {
  const rows = Math.max(1, Math.ceil(getPosterInfoCards(poster).length / 2));
  const bottomY = GRID_START_Y + rows * (GRID_CARD_HEIGHT + GRID_CARD_GAP) + 8;
  return bottomY + BOTTOM_CARD_HEIGHT + BOTTOM_CARD_MARGIN;
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

async function renderPoster(ctx, node, width, height, poster) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#eef4ff";
  ctx.fillRect(0, 0, width, height);

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
  ctx.fillText("东莞篮球约战", 42, 58);
  ctx.font = "bold 38px sans-serif";
  wrapText(ctx, poster.title, 42, 112, width - 84, 46, 2);
  ctx.font = "18px sans-serif";
  wrapText(ctx, `${poster.modeLabel} · ${poster.town} · ${poster.date}`, 42, 210, width - 84, 30, 2);

  fillRoundRect(ctx, 42, 248, 170, 48, 24, "rgba(255,255,255,0.16)");
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(`${poster.matchScore} 分匹配`, 62, 279);

  const coverImage = poster.venueCover ? await loadCanvasImage(node, poster.venueCover) : null;
  drawCoverCard(ctx, poster, width, coverImage);
  drawSummaryCard(ctx, poster, width);
  drawHighlightCard(ctx, poster, width);
  drawInfoGrid(ctx, poster, width);
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

function drawCoverCard(ctx, poster, width, coverImage) {
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
  ctx.fillText("推荐场馆", cardX + 24, cardY + 38);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px sans-serif";
  wrapText(ctx, poster.venue, cardX + 24, cardY + 92, cardW - 48, 38, 3);
  ctx.font = "15px sans-serif";
  wrapText(ctx, poster.planTone, cardX + 24, cardY + 214, cardW - 48, 26, 2);

  let tagX = cardX + 24;
  const tagY = cardY + cardH - 44;
  (poster.tags || []).forEach((tag) => {
    const tagWidth = Math.max(88, tag.length * 18 + 30);
    fillRoundRect(ctx, tagX, tagY, tagWidth, 34, 17, "rgba(255,255,255,0.16)");
    ctx.fillStyle = "#ffffff";
    ctx.font = "13px sans-serif";
    ctx.fillText(tag, tagX + 14, tagY + 22);
    tagX += tagWidth + 10;
  });
}

function drawSummaryCard(ctx, poster, width) {
  const cardX = 30;
  const cardY = 646;
  const cardW = width - 60;
  const cardH = 186;

  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 28, "#ffffff");

  ctx.fillStyle = "#7d8cb1";
  ctx.font = "15px sans-serif";
  ctx.fillText("方案摘要", cardX + 24, cardY + 36);

  ctx.fillStyle = "#1d5dff";
  ctx.font = "bold 28px sans-serif";
  const leadWidth = Math.min(ctx.measureText(poster.summaryLead || "").width, cardW - 48);
  ctx.fillText(poster.summaryLead || "", cardX + 24, cardY + 84);

  ctx.fillStyle = "#21324f";
  ctx.font = "bold 24px sans-serif";
  wrapText(ctx, poster.summaryTail || "", cardX + 24 + leadWidth + 10, cardY + 84, cardW - 58 - leadWidth, 30, 1);

  ctx.fillStyle = "#64789c";
  ctx.font = "15px sans-serif";
  wrapText(ctx, poster.summaryNote || poster.strategyLine || "", cardX + 24, cardY + 126, cardW - 48, 26, 2);
}

function drawHighlightCard(ctx, poster, width) {
  const cardX = 30;
  const cardY = 854;
  const cardW = width - 60;
  const cardH = 242;
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 28, "#ffffff");

  ctx.fillStyle = "#7d8cb1";
  ctx.font = "15px sans-serif";
  ctx.fillText("方案重点", cardX + 24, cardY + 36);

  const points = poster.highlightPoints || [];
  points.forEach((item, index) => {
    const itemY = cardY + 76 + index * 42;
    ctx.fillStyle = "#5b7ed6";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(item.label, cardX + 24, itemY);
    ctx.fillStyle = "#21324f";
    ctx.font = "bold 16px sans-serif";
    wrapText(ctx, item.value, cardX + 126, itemY, cardW - 150, 24, 1);
  });
}

function drawInfoGrid(ctx, poster, width) {
  const infoCards = getPosterInfoCards(poster);
  const cardWidth = (width - 76) / 2;

  infoCards.forEach((entry, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = 30 + col * (cardWidth + 16);
    const y = GRID_START_Y + row * (GRID_CARD_HEIGHT + GRID_CARD_GAP);

    fillRoundRect(ctx, x, y, cardWidth, GRID_CARD_HEIGHT, 24, "#ffffff");
    ctx.fillStyle = "#7d8cb1";
    ctx.font = "14px sans-serif";
    ctx.fillText(entry[0], x + 18, y + 30);
    ctx.fillStyle = "#20304b";
    ctx.font = "bold 18px sans-serif";
    wrapText(ctx, entry[1], x + 18, y + 64, cardWidth - 36, 26, 3);
  });

  const rows = Math.max(1, Math.ceil(infoCards.length / 2));
  const bottomY = GRID_START_Y + rows * (GRID_CARD_HEIGHT + GRID_CARD_GAP) + 8;
  fillRoundRect(ctx, 30, bottomY, width - 60, BOTTOM_CARD_HEIGHT, 28, "#1658ef");
  ctx.fillStyle = "#ffffff";
  ctx.font = "15px sans-serif";
  ctx.fillText("打开小程序可继续查看完整方案", 54, bottomY + 44);
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("场馆、裁判、物料、预约入口已同步准备好", 54, bottomY + 84);
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
