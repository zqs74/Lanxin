const { decodePayload, encodePayload } = require("../../utils/share");
const { createRecommendation } = require("../../utils/recommender");

Page({
  data: {
    poster: null,
    saving: false,
  },

  onLoad(query) {
    const payload = decodePayload(query.payload || "");
    const result = createRecommendation(payload || {});
    this.setData({
      poster: result.posterPayload,
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
    if (this.data.saving) {
      return;
    }

    this.setData({
      saving: true,
    });

    const query = wx.createSelectorQuery().in(this);
    query.select("#poster-canvas").fields({ node: true, size: true }).exec((res) => {
      const canvasInfo = res && res[0];
      if (!canvasInfo || !canvasInfo.node) {
        this.setData({ saving: false });
        wx.showToast({
          title: "海报画布初始化失败",
          icon: "none",
        });
        return;
      }

      const { node, width, height } = canvasInfo;
      const ctx = node.getContext("2d");
      const dpr = wx.getWindowInfo().pixelRatio || 2;
      node.width = width * dpr;
      node.height = height * dpr;
      ctx.scale(dpr, dpr);

      const poster = this.data.poster;
      ctx.fillStyle = "#f4f7fc";
      ctx.fillRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, width, 360);
      gradient.addColorStop(0, "#145bff");
      gradient.addColorStop(1, "#4d8dff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, 360);

      ctx.fillStyle = "#ffffff";
      ctx.font = "18px sans-serif";
      ctx.fillText("东莞篮球约战", 24, 40);
      ctx.font = "bold 28px sans-serif";
      wrapText(ctx, poster.title, 24, 86, width - 48, 38, 2);
      ctx.font = "16px sans-serif";
      wrapText(ctx, `${poster.modeLabel} · ${poster.town} · ${poster.date}`, 24, 154, width - 48, 28, 2);
      roundRect(ctx, 24, 192, 126, 36, 18, "rgba(255,255,255,0.16)");
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(`${poster.matchScore} 分匹配`, 42, 215);

      roundRect(ctx, 20, 268, width - 40, 146, 24, "#ffffff");
      ctx.fillStyle = "#7d8cb1";
      ctx.font = "15px sans-serif";
      ctx.fillText("推荐场馆", 40, 304);
      ctx.fillStyle = "#20304b";
      ctx.font = "bold 24px sans-serif";
      wrapText(ctx, poster.venue, 40, 340, width - 80, 34, 2);

      let tagX = 40;
      const tagY = 376;
      (poster.tags || []).forEach((tag) => {
        const tagWidth = Math.max(66, tag.length * 16 + 24);
        roundRect(ctx, tagX, tagY, tagWidth, 28, 14, "rgba(29,93,255,0.08)");
        ctx.fillStyle = "#1d5dff";
        ctx.font = "13px sans-serif";
        ctx.fillText(tag, tagX + 12, tagY + 18);
        tagX += tagWidth + 10;
      });

      const infoCards = [
        ["裁判配置", poster.refereeLine],
        ["物料建议", poster.materialLine],
        ["租赁建议", poster.rentalLine],
        ["供应商", poster.supplierLine],
        ["媒体", poster.mediaLine],
        ["预算参考", poster.budgetHint],
      ].filter((item) => item[1]);

      const cardWidth = (width - 56) / 2;
      const cardHeight = 122;
      const gridStartY = 434;

      infoCards.forEach((entry, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = 20 + col * (cardWidth + 16);
        const y = gridStartY + row * (cardHeight + 16);

        roundRect(ctx, x, y, cardWidth, cardHeight, 22, "#ffffff");
        ctx.fillStyle = "#7d8cb1";
        ctx.font = "14px sans-serif";
        ctx.fillText(entry[0], x + 18, y + 28);
        ctx.fillStyle = "#20304b";
        ctx.font = "bold 16px sans-serif";
        wrapText(ctx, entry[1], x + 18, y + 58, cardWidth - 36, 24, 2);
      });

      const bottomY = gridStartY + Math.ceil(infoCards.length / 2) * (cardHeight + 16) + 4;
      roundRect(ctx, 20, bottomY, width - 40, 118, 24, "#1658ef");
      ctx.fillStyle = "#ffffff";
      ctx.font = "15px sans-serif";
      ctx.fillText("一句话篮球约战", 40, bottomY + 30);
      ctx.font = "bold 20px sans-serif";
      wrapText(ctx, poster.summary, 40, bottomY + 68, width - 80, 28, 2);

      wx.canvasToTempFilePath(
        {
          canvas: node,
          success: ({ tempFilePath }) => {
            wx.saveImageToPhotosAlbum({
              filePath: tempFilePath,
              success: () => {
                this.setData({ saving: false });
                wx.showToast({
                  title: "海报已保存",
                  icon: "success",
                });
              },
              fail: () => {
                this.setData({ saving: false });
                wx.previewImage({
                  urls: [tempFilePath],
                });
              },
            });
          },
          fail: () => {
            this.setData({ saving: false });
            wx.showToast({
              title: "海报导出失败",
              icon: "none",
            });
          },
        },
        this
      );
    });
  },
});

function roundRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.save();
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
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
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
    const finalText = lines === maxLines - 1 && text.length > renderedLength + line.length ? `${line}...` : line;
    ctx.fillText(finalText, x, y + lineHeight * lines);
  }
}
