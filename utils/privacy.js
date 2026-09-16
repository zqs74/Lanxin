// Only WeChat's privacy APIs can grant authorization. No local consent flag.
function invoke(name, options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof wx[name] !== 'function') {
      reject(new Error('当前微信不支持隐私授权，请升级后重试')); return;
    }
    wx[name](Object.assign({}, options, { success: resolve, fail: reject }));
  });
}
function validateSetting(setting) {
  if (!setting || typeof setting.privacyContractName !== 'string' || !setting.privacyContractName.trim()) {
    throw new Error('隐私指引未配置，请联系管理员');
  }
  if (typeof setting.needAuthorization !== 'boolean') throw new Error('无法确认微信隐私授权状态，请重试');
}
async function requirePrivacy() {
  try {
    // Runtime public AppID only; do not inspect local credentials/configuration.
    const account = typeof wx.getAccountInfoSync === 'function' && wx.getAccountInfoSync();
    const appId = account && account.miniProgram && account.miniProgram.appId;
    if (typeof appId !== 'string' || !/^wx[0-9a-f]{16}$/i.test(appId)) {
      throw new Error('缺少有效AppID，无法校验微信隐私配置');
    }
    let setting = await invoke('getPrivacySetting');
    validateSetting(setting);
    if (setting.needAuthorization) {
      await invoke('requirePrivacyAuthorize');
      setting = await invoke('getPrivacySetting');
      validateSetting(setting);
      if (setting.needAuthorization !== false) throw new Error('尚未完成微信隐私授权');
    }
  } catch (error) {
    if (error instanceof Error) throw error;
    const cancelled = /cancel|deny|denied|reject/i.test(String(error && error.errMsg || ''));
    throw new Error(cancelled ? '已取消或拒绝微信隐私授权' : '微信隐私检查失败，请确认AppID和后台配置');
  }
}
async function openPrivacyContract() {
  try { await invoke('openPrivacyContract'); }
  catch (_) { wx.showToast({ title: '隐私指引暂不可用，请稍后重试', icon: 'none' }); }
}
function failureMessage(error) {
  const message = String(error && (error.errMsg || error.message) || '');
  if (/cancel|deny|denied|reject|取消|拒绝/i.test(message)) return '已取消或未授权，未保存图片';
  if (/隐私指引未配置/.test(message)) return '隐私指引未配置，未保存图片';
  if (/AppID/.test(message)) return 'AppID或隐私配置异常，未保存图片';
  return '授权检查或保存失败，未保存图片';
}
module.exports = { invoke, requirePrivacy, openPrivacyContract, failureMessage };
