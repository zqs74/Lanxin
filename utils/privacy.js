// Only WeChat's privacy APIs can grant authorization. No local consent flag.
const AGREE_BUTTON_ID = 'bansai-privacy-agree';
let listening = false, pending = null;

function hide(page) {
  const patch = { privacyVisible: false, privacyContractName: '' };
  if (page._authSnapshot) Object.assign(page._authSnapshot, patch);
  if (!page._dead) page.setData(patch);
}
function cancel(page) {
  const job = pending;
  if (!job || job.page !== page) return;
  job.cancelled = true;
  hide(page);
  for (const resolve of job.resolvers) {
    try { resolve({ event: 'disagree' }); } catch (_) {}
  }
  job.resolvers.clear();
  job.rejectCancellation(new Error('已取消或拒绝微信隐私授权'));
}
function ensureListener() {
  if (listening) return;
  if (typeof wx.onNeedPrivacyAuthorization !== 'function') {
    throw new Error('当前微信不支持隐私授权，请升级后重试');
  }
  // This API uses replacement registration, not an on/off subscription pair.
  // Register once and dispatch only to the active page's pending operation.
  wx.onNeedPrivacyAuthorization((resolve) => {
    const job = pending;
    if (!job || !job.awaitingAuthorization || !job.contractName ||
        job.cancelled || job.page._dead || job.page._privacyHidden) {
      resolve({ event: 'disagree' }); return;
    }
    job.resolvers.add(resolve);
    job.page.setData({ privacyVisible: true, privacyContractName: job.contractName });
  });
  listening = true;
}
function agree(page, event) {
  const job = pending;
  // This handler is bound only to the platform authorization event, never tap.
  if (!job || job.page !== page || !job.resolvers.size || job.cancelled || page._dead || page._privacyHidden ||
      !event || event.type !== 'agreeprivacyauthorization' ||
      !event.currentTarget || event.currentTarget.id !== AGREE_BUTTON_ID) return;
  const resolvers = Array.from(job.resolvers);
  job.resolvers.clear();
  hide(page);
  try {
    resolvers.forEach(resolve => resolve({ event: 'agree', buttonId: AGREE_BUTTON_ID }));
  } catch (_) { cancel(page); }
  // Do not resolve our promise here. Wait for WeChat success and recheck consent.
}
function invoke(name, options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof wx[name] !== 'function') {
      reject(new Error('当前微信不支持隐私授权，请升级后重试')); return;
    }
    const callbacks = { success: resolve, fail: reject };
    if (name === 'requirePrivacyAuthorize') {
      // A complete-only callback is terminal, but cannot establish consent.
      // After success/fail this is inert: the same Promise has already settled.
      callbacks.complete = () => reject(new Error('微信隐私授权未成功完成'));
    }
    wx[name](Object.assign({}, options, callbacks));
  });
}
function validateSetting(setting) {
  if (!setting || typeof setting.privacyContractName !== 'string' || !setting.privacyContractName.trim()) {
    throw new Error('隐私指引未配置，请联系管理员');
  }
  if (typeof setting.needAuthorization !== 'boolean') throw new Error('无法确认微信隐私授权状态，请重试');
}
async function checkPrivacy(job) {
  const assertActive = () => {
    if (job.cancelled || job.page._dead || job.page._privacyHidden) throw new Error('已取消微信隐私授权');
  };
  try {
    assertActive();
    // Runtime public AppID only; do not inspect local credentials/configuration.
    const account = typeof wx.getAccountInfoSync === 'function' && wx.getAccountInfoSync();
    const appId = account && account.miniProgram && account.miniProgram.appId;
    if (typeof appId !== 'string' || !/^wx[0-9a-f]{16}$/i.test(appId)) {
      throw new Error('缺少有效AppID，无法校验微信隐私配置');
    }
    let setting = await invoke('getPrivacySetting');
    assertActive();
    validateSetting(setting);
    ensureListener();
    if (setting.needAuthorization) {
      job.contractName = setting.privacyContractName;
      job.awaitingAuthorization = true;
      await invoke('requirePrivacyAuthorize');
      job.awaitingAuthorization = false;
      assertActive();
      setting = await invoke('getPrivacySetting');
      assertActive();
      validateSetting(setting);
      if (setting.needAuthorization !== false) throw new Error('尚未完成微信隐私授权');
    }
  } catch (error) {
    if (error instanceof Error) throw error;
    const cancelled = /cancel|deny|denied|reject|not authorized/i.test(String(error && error.errMsg || ''));
    throw new Error(cancelled ? '已取消或拒绝微信隐私授权' : '微信隐私检查失败，请确认AppID和后台配置');
  }
}
function requirePrivacy(page) {
  if (!page || typeof page.setData !== 'function') return Promise.reject(new Error('无法展示微信隐私授权，请重新进入页面'));
  if (pending) {
    return pending.page === page && !pending.cancelled ? pending.promise
      : Promise.reject(new Error('其他隐私授权尚未结束，请稍后重试'));
  }
  const job = { page, resolvers: new Set(), contractName: '', cancelled: false };
  const cancellation = new Promise((_, reject) => { job.rejectCancellation = reject; });
  pending = job;
  // Caller cancellation is immediate, but does NOT release the platform owner.
  // An old requirePrivacyAuthorize can emit onNeed later through the CURRENT
  // global listener. Keep its cancelled job in place (deny-only) until the
  // platform actually reports success/fail/complete; never replace it with B.
  const platformWork = Promise.resolve().then(() => checkPrivacy(job)).finally(() => {
    if (pending !== job) return;
    for (const resolve of job.resolvers) {
      try { resolve({ event: 'disagree' }); } catch (_) {}
    }
    job.resolvers.clear();
    hide(page);
    pending = null;
  });
  job.promise = Promise.race([platformWork, cancellation]);
  return job.promise;
}
async function openPrivacyContract(page) {
  if (page) page._openingPrivacyContract = true;
  try { await invoke('openPrivacyContract'); }
  catch (_) {
    if (page) page._openingPrivacyContract = false;
    wx.showToast({ title: '隐私指引暂不可用，请稍后重试', icon: 'none' });
  }
}
function withPrivacy(definition) {
  const load = definition.onLoad, show = definition.onShow, unload = definition.onUnload, onHide = definition.onHide;
  definition.data = Object.assign({}, definition.data, { privacyVisible: false, privacyContractName: '' });
  definition.onLoad = function(...args) {
    this._privacyHidden = false;
    this._dead = false;
    return load && load.apply(this, args);
  };
  definition.onShow = function(...args) {
    this._privacyHidden = false;
    this._openingPrivacyContract = false;
    return show && show.apply(this, args);
  };
  definition.onHide = function(...args) {
    this._privacyHidden = true;
    // Reading the official contract may temporarily hide the page. On return
    // the same official button can complete the pending platform challenge.
    if (!this._openingPrivacyContract) cancel(this);
    this._openingPrivacyContract = false;
    return onHide && onHide.apply(this, args);
  };
  definition.onUnload = function(...args) {
    cancel(this);
    this._dead = true;
    return unload && unload.apply(this, args);
  };
  definition.agreePrivacyAuthorization = function(event) { agree(this, event); };
  definition.cancelPrivacyAuthorization = function() { cancel(this); };
  definition.openPrivacyContract = function() { return openPrivacyContract(this); };
  definition.privacyNoop = function() {};
  return definition;
}
function failureMessage(error) {
  const message = String(error && (error.errMsg || error.message) || '');
  if (/cancel|deny|denied|reject|取消|拒绝/i.test(message)) return '已取消或未授权，未保存图片';
  if (/隐私指引未配置/.test(message)) return '隐私指引未配置，未保存图片';
  if (/AppID/.test(message)) return 'AppID或隐私配置异常，未保存图片';
  return '授权检查或保存失败，未保存图片';
}
module.exports = { invoke, requirePrivacy, openPrivacyContract, failureMessage, withPrivacy, cancel };
