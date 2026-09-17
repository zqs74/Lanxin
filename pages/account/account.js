// account.js - 账号与安全（修改密码、退出登录）
const session = require('../../utils/session');
const privacy = require('../../utils/privacy');

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

// Same rule as the server (12-128 characters, not blank, not digits only); the server stays authoritative.
function passwordProblem(form) {
  if (!form.currentPassword || !form.newPassword || !form.confirmPassword) return '请填写当前密码、新密码和确认密码';
  if (form.newPassword.length < 12 || form.newPassword.length > 128 || !form.newPassword.trim() || /^\d+$/.test(form.newPassword)) {
    return '新密码须为12至128位，不能是纯数字或空白';
  }
  if (form.newPassword !== form.confirmPassword) return '两次输入的新密码不一致';
  if (form.newPassword === form.currentPassword) return '新密码不能与当前密码相同';
  return '';
}

Page(privacy.withPrivacy(session.protectPage({
  data: Object.assign({ username: '', displayName: '', submitting: false, loggingOut: false, error: '' }, EMPTY_FORM),

  onShow() {
    const account = session.getAccount() || {};
    // Passwords never survive leaving the page, even though ordinary drafts do.
    this.setData(Object.assign({ username: account.username || '', displayName: account.displayName || '', error: '' }, EMPTY_FORM));
  },

  onHide() { this.setData(EMPTY_FORM); },

  onPasswordInput(event) {
    const field = event.currentTarget.dataset.field;
    if (!Object.prototype.hasOwnProperty.call(EMPTY_FORM, field)) return;
    this.setData({ [field]: event.detail.value, error: '' });
  },

  async submitPassword() {
    if (this.data.submitting || this.data.loggingOut) return;
    const form = { currentPassword: this.data.currentPassword, newPassword: this.data.newPassword, confirmPassword: this.data.confirmPassword };
    const problem = passwordProblem(form);
    if (problem) { this.setData({ error: problem }); return; }
    this.setData({ submitting: true, error: '' });
    const epoch = session.getEpoch();
    let checkingPrivacy = true;
    try {
      await privacy.requirePrivacy(this);
      if (this._dead || epoch !== session.getEpoch()) return;
      checkingPrivacy = false;
      // Success revokes every login of this account on the server and returns to the login page.
      await session.changePassword(form.currentPassword, form.newPassword);
      wx.showToast({ title: '密码已修改，请重新登录', icon: 'none' });
    } catch (error) {
      if (epoch !== session.getEpoch()) return;
      this.setData(Object.assign({}, EMPTY_FORM, { error: checkingPrivacy
        ? (error.message || '微信隐私检查失败') + '；未提交密码'
        : error.message || '修改失败，请重试' }));
    } finally {
      if (epoch === session.getEpoch()) this.setData({ submitting: false });
    }
  },

  confirmLogout() {
    if (this.data.submitting || this.data.loggingOut) return;
    wx.showModal({
      title: '退出登录',
      content: '退出后需要重新输入账号和密码才能继续使用。',
      confirmText: '退出',
      confirmColor: '#fa5151',
      success: async (res) => {
        if (!res.confirm || this.data.loggingOut || !session.hasSession()) return;
        this.setData({ loggingOut: true });
        // The local session is cleared and the login page opens even when the server cannot be reached.
        try { await session.logout(); } catch (_) {}
      },
    });
  },
})));
