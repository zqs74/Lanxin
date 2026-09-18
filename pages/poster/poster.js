// poster.js - 方案海报页（预览 + Painter 生成海报导出）
const { loadPlan, planPath, prepareShare, shareMessage } = require('../../utils/share');
const session = require('../../utils/session');
const privacy = require('../../utils/privacy');
const imageExport = require('../../utils/image-export');
const { buildPosterPalette } = require('../../utils/poster-palette');

Page(privacy.withPrivacy(session.protectPage({
  data: {
    poster: null,
    saving: false,
    palette: null,
  },

  async onShow() {
    const record = await loadPlan(this._query);
    if (this._dead) return;
    const poster = record.payload.result.posterPayload || null;
    this.setData({ poster });
    if (!poster) {
      // Reached directly (old link, share card) for a plan without matched resources: explain and
      // return to the plan instead of leaving a blank page. No share is created for it.
      wx.showToast({ title: '当前方案暂无可用海报', icon: 'none' });
      const target = planPath(this._query, 'result');
      wx.navigateBack({ fail() { wx.redirectTo({ url: target }); } });
      return;
    }
    prepareShare(this, record.id, this._query.shareId);
  },

  onShareAppMessage() { return shareMessage(this, this.data.poster && this.data.poster.title); },

  // —— Painter 导出：设置 palette 触发组件渲染，imgOK 回调拿图片路径 ——
  async savePoster() {
    if (this.data.saving || !this.data.poster) return;
    return imageExport.start(this, async () => {
      await session.me();
      const record = await loadPlan(this._query);
      const poster = record.payload.result.posterPayload;
      if (!poster) throw new Error('当前方案暂无可用海报');
      this.setData({ poster });
      return buildPosterPalette(poster);
    });
  },

  onImgOK(event) { return imageExport.save(this, event, '海报已保存'); },
  onImgErr() { imageExport.fail(this); },
})));
