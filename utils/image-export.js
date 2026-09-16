const privacy = require('./privacy');
const session = require('./session');

function active(page, job) {
  return page._imageExport === job && !page._dead && session.hasSession() && job.epoch === session.getEpoch();
}
function finish(page, job) {
  if (page._imageExport !== job) return;
  page._imageExport = null;
  // onShow may be validating the account while the platform prompt returns.
  if (page._authSnapshot) Object.assign(page._authSnapshot, { saving: false, palette: null });
  page.setData({ saving: false, palette: null });
}
async function start(page, build) {
  if (page.data.saving) return;
  const job = { epoch: session.getEpoch(), ready: false, writing: false };
  page._imageExport = job;
  page.setData({ saving: true, palette: null });
  try {
    const palette = await build();
    if (!active(page, job)) { finish(page, job); return; }
    await privacy.requirePrivacy(page);
    if (!active(page, job)) { finish(page, job); return; }
    job.ready = true;
    page.setData({ palette });
  } catch (error) {
    const current = active(page, job);
    finish(page, job);
    if (current) wx.showToast({ title: privacy.failureMessage(error), icon: 'none' });
  }
}
async function save(page, event, title) {
  const job = page._imageExport;
  if (!job || !job.ready || job.writing || !active(page, job)) return;
  job.writing = true;
  try {
    const path = event.detail && event.detail.path;
    if (!path) throw new Error('图片生成失败');
    // Re-check immediately before the protected write, including changed consent.
    await privacy.requirePrivacy(page);
    if (!active(page, job)) return;
    // WeChat performs the separate album permission prompt. Never auto-open settings
    // or fall back to preview/long-press saving after cancellation or denial.
    await privacy.invoke('saveImageToPhotosAlbum', { filePath: path });
    if (active(page, job)) wx.showToast({ title, icon: 'success' });
  } catch (error) {
    if (active(page, job)) wx.showToast({ title: privacy.failureMessage(error), icon: 'none' });
  } finally { finish(page, job); }
}
function fail(page) {
  const job = page._imageExport;
  if (!job) return;
  const current = active(page, job);
  finish(page, job);
  if (current) wx.showToast({ title: '图片生成失败，未保存图片', icon: 'none' });
}
module.exports = { start, save, fail };
