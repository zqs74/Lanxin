// 方案海报 palette（Painter JSON 布局，蓝白风格，与预约卡同源）。
// Painter 不会回报文字高度，所以每张卡片的高度按估算行数自上而下排版，
// 内容多少都不会互相压住，也不会留大块空白。
const CARD_LEFT = 30, CARD_WIDTH = 594, TEXT_LEFT = 50, TEXT_WIDTH = 554, GAP = 24;

// 估算行数：全角字符按 1 个字宽，半角按 0.56 个字宽，留 4% 余量。
function textLines(text, fontSize, width, maxLines) {
  let units = 0;
  for (const ch of String(text || '')) units += ch.charCodeAt(0) < 256 ? 0.56 : 1;
  return Math.max(1, Math.min(maxLines, Math.ceil(units * fontSize * 1.04 / width)));
}

function buildPosterPalette(poster) {
  const views = [];
  const rect = (top, height, css) => views.push({ type: "rect",
    css: Object.assign({ left: `${CARD_LEFT}rpx`, top: `${top}rpx`, width: `${CARD_WIDTH}rpx`, height: `${height}rpx`, borderRadius: "24rpx", color: "#ffffff" }, css) });
  // 返回这段文字占用的高度，方便继续往下排。
  const text = (content, top, css, lineHeight, maxLines = 1) => {
    const fontSize = parseInt(css.fontSize, 10), width = parseInt(css.width || `${TEXT_WIDTH}rpx`, 10);
    const lines = textLines(content, fontSize, width, maxLines);
    views.push({ type: "text", text: String(content || ''),
      css: Object.assign({ left: `${TEXT_LEFT}rpx`, top: `${top}rpx`, width: `${width}rpx`, lineHeight: `${lineHeight}rpx`, maxLines }, css) });
    return lines * lineHeight;
  };
  const label = (content, top) => text(content, top, { fontSize: "22rpx", color: "#7d8cb1" }, 30);

  // —— hero 渐变区 ——
  views.push({ type: "rect", css: { left: "0rpx", top: "0rpx", width: "654rpx", height: "270rpx",
    color: "linear-gradient(135deg, #115cff 0%, #5b9cff 100%)" } });
  text("篮芯办赛", 34, { left: "40rpx", fontSize: "22rpx", color: "#ffffff", width: "574rpx" }, 30);
  text(poster.title, 78, { left: "40rpx", width: "574rpx", fontSize: "44rpx", fontWeight: "bold", color: "#ffffff" }, 58);
  text(`${poster.modeLabel} · ${poster.town} · ${poster.date}`, 156,
    { left: "40rpx", width: "574rpx", fontSize: "24rpx", color: "rgba(255,255,255,0.92)" }, 32);
  views.push({ type: "rect", css: { left: "40rpx", top: "200rpx", width: "178rpx", height: "46rpx", borderRadius: "23rpx", color: "rgba(255,255,255,0.18)" } });
  text(`${poster.matchScore} 分匹配`, 208, { left: "40rpx", width: "178rpx", textAlign: "center", fontSize: "22rpx", fontWeight: "bold", color: "#ffffff" }, 30);

  // —— 场馆卡：没有封面时文字用满整张卡片的宽度 ——
  let top = 294;
  const hasCover = !!poster.venueCover;
  const venueLeft = hasCover ? 210 : TEXT_LEFT, venueWidth = hasCover ? 394 : TEXT_WIDTH;
  const venueCard = views.length; rect(top, 0);
  if (hasCover) {
    views.push({ type: "image", url: poster.venueCover,
      css: { left: `${TEXT_LEFT}rpx`, top: `${top + 24}rpx`, width: "140rpx", height: "140rpx", borderRadius: "20rpx" } });
  }
  let y = top + 24;
  y += text("推荐场馆", y, { left: `${venueLeft}rpx`, width: `${venueWidth}rpx`, fontSize: "20rpx", color: "#1d5dff" }, 28) + 6;
  y += text(poster.venue, y, { left: `${venueLeft}rpx`, width: `${venueWidth}rpx`, fontSize: "32rpx", fontWeight: "bold", color: "#20304b" }, 44, 2) + 8;
  y += text(poster.planTone, y, { left: `${venueLeft}rpx`, width: `${venueWidth}rpx`, fontSize: "22rpx", color: "#7d8cb1" }, 30);
  if (hasCover) y = Math.max(y, top + 24 + 140);
  const tags = (poster.tags || []).slice(0, 3);
  if (tags.length) {
    y += 20;
    let tagX = TEXT_LEFT;
    tags.forEach((tag) => {
      const tagWidth = Math.max(80, tag.length * 20 + 32);
      views.push({ type: "rect", css: { left: `${tagX}rpx`, top: `${y}rpx`, width: `${tagWidth}rpx`, height: "36rpx", borderRadius: "18rpx", color: "rgba(29,93,255,0.1)" } });
      text(tag, y + 5, { left: `${tagX}rpx`, width: `${tagWidth}rpx`, textAlign: "center", fontSize: "20rpx", color: "#1d5dff" }, 26);
      tagX += tagWidth + 12;
    });
    y += 36;
  }
  views[venueCard].css.height = `${y + 28 - top}rpx`;
  top = y + 28 + GAP;

  // —— 方案摘要卡 ——
  const summaryCard = views.length; rect(top, 0);
  y = top + 24;
  y += label("方案摘要", y) + 12;
  y += text(poster.summaryLead, y, { fontSize: "30rpx", fontWeight: "bold", color: "#1d5dff" }, 42, 2) + 6;
  y += text(poster.summaryTail, y, { fontSize: "24rpx", fontWeight: "bold", color: "#21324f" }, 34, 2);
  const note = poster.summaryNote || poster.strategyLine || "";
  if (note) y += 12 + text(note, y + 12, { fontSize: "20rpx", color: "#64789c" }, 30, 2);
  views[summaryCard].css.height = `${y + 28 - top}rpx`;
  top = y + 28 + GAP;

  // —— 左标签 + 右内容的行，方案重点与资源配置共用 ——
  const rows = (title, entries) => {
    if (!entries.length) return;
    const card = views.length; rect(top, 0);
    y = top + 24;
    y += label(title, y) + 14;
    entries.forEach(([name, value], index) => {
      text(name, y + 2, { width: "110rpx", fontSize: "20rpx", fontWeight: "bold", color: "#5b7ed6" }, 30);
      y += text(value, y, { left: "170rpx", width: "434rpx", fontSize: "22rpx", fontWeight: "bold", color: "#21324f" }, 32, 2);
      if (index < entries.length - 1) y += 16;
    });
    views[card].css.height = `${y + 28 - top}rpx`;
    top = y + 28 + GAP;
  };
  // 裁判配置在“资源配置”里列出，这里不重复。
  rows("方案重点", (poster.highlightPoints || []).filter(item => item && item.value && item.label !== "裁判配置")
    .slice(0, 4).map(item => [item.label, item.value]));
  // 预算参考只取第一句，完整说明在小程序的方案页里。
  const budgetHint = String(poster.budgetHint || "").split("。")[0];
  rows("资源配置", [
    ["预算参考", budgetHint ? budgetHint + "。" : ""],
    ["裁判配置", poster.refereeLine],
    ["物料建议", poster.materialLine],
    ["租赁建议", poster.rentalLine],
    ["供应商", poster.supplierLine],
    ["媒体", poster.mediaLine],
  ].filter(entry => entry[1]));

  // —— 底部引导卡 ——
  rect(top, 116, { color: "#1658ef" });
  text("打开小程序查看完整方案", top + 24, { fontSize: "24rpx", fontWeight: "bold", color: "#ffffff" }, 34);
  text("资源仅供参考，档期与服务需另行确认", top + 66, { fontSize: "20rpx", color: "rgba(255,255,255,0.9)" }, 28);

  return { width: "654rpx", height: `${top + 116 + GAP}rpx`, background: "#eef4ff", views };
}

module.exports = { buildPosterPalette, textLines };
