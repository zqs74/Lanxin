const session = require('../../utils/session');
const privacy = require('../../utils/privacy');
Page(privacy.withPrivacy({
  data: { username: '', password: '', submitting: false, error: '' },
  onLoad(query = {}) { session.enterLogin(query.next); },
  onUsernameInput(event) { this.setData({ username: event.detail.value, error: '' }); },
  onPasswordInput(event) { this.setData({ password: event.detail.value, error: '' }); },
  onHide() { this.setData({ password: '' }); },
  onUnload() { this._dead = true; this.setData({ password: '' }); },
  async submitLogin() {
    if (this.data.submitting) return;
    const username = this.data.username.trim(), password = this.data.password;
    if (!username || !password) { this.setData({ error: '请输入账号和密码' }); return; }
    this.setData({ submitting: true, error: '' });
    const epoch = session.getEpoch();
    let checkingPrivacy = true;
    try {
      await privacy.requirePrivacy(this);
      if (this._dead || epoch !== session.getEpoch()) return;
      checkingPrivacy = false;
      await session.login(username, password);
      this.setData({ password: '' });
      if (!this._dead) session.finishLogin();
    } catch (error) {
      if (!this._dead) this.setData({ password: '', error: checkingPrivacy
        ? (error.message || '微信隐私检查失败') + '；未提交登录信息'
        : error.message || '登录失败，请重试' });
    } finally {
      if (!this._dead) this.setData({ submitting: false });
    }
  },
}));
