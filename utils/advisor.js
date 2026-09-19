// 企业微信客服是“进一步对接”的唯一入口。打不开时要说清是哪一步的问题，不能一律退回空的联系信息弹层。
const session = require('./session');

function runningVersion() {
  try {
    const info = wx.getAccountInfoSync().miniProgram;
    return [info.envVersion, info.version].filter(Boolean).join(' ');
  } catch (_) { return ''; }
}
function explain(content) {
  const version = runningVersion();
  wx.showModal({ title: '客服暂时打不开', showCancel: false, confirmText: '知道了',
    content: content + (version ? '（当前版本 ' + version + '）' : '') });
}
// fallback 只用于服务器确实没有配置客服的情况：那时弹层如实显示“客服尚未配置”。
function openAdvisor(fallback) {
  const contact = session.getContact();
  if (!session.isContactLoaded()) {
    explain('客服信息还没加载出来，请退出小程序后重新进入再试。');
    return false;
  }
  if (!contact.wecomCorpId || !contact.wecomKfUrl) { fallback(); return false; }
  if (typeof wx.openCustomerServiceChat !== 'function') {
    explain('当前微信版本不支持直接打开客服会话，请升级微信后再试。');
    return false;
  }
  wx.openCustomerServiceChat({
    extInfo: { url: contact.wecomKfUrl }, corpId: contact.wecomCorpId,
    fail(error) { explain('微信返回：' + ((error && error.errMsg) || '未知错误') + '。'); },
  });
  return true;
}
module.exports = { openAdvisor };
