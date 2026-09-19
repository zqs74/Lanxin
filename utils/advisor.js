// 企业微信客服是“进一步对接”的唯一入口：配置好就直接打开会话，没配置或跳转失败时退回联系信息弹层。
const session = require('./session');
function openAdvisor(fallback) {
  const contact = session.getContact();
  if (contact.wecomCorpId && contact.wecomKfUrl && typeof wx.openCustomerServiceChat === 'function') {
    wx.openCustomerServiceChat({ extInfo: { url: contact.wecomKfUrl }, corpId: contact.wecomCorpId, fail: fallback });
    return true;
  }
  fallback();
  return false;
}
module.exports = { openAdvisor };
