export default function Footer({ variant = 'simple' }) {
  if (variant === 'full') {
    return (
      <footer className="footer-base mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/test.png" alt="Logo" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>用AI技术重新定义篮球训练与分析</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>产品</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {['功能介绍', '更新日志', '价格方案'].map((item, i) => (
                  <li key={i}><a href="#" className="hover:text-[var(--accent)] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>支持</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {['帮助中心', '联系我们', '常见问题'].map((item, i) => (
                  <li key={i}><a href="#" className="hover:text-[var(--accent)] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>关注我们</h4>
              <div className="flex gap-3">
                {['微信', '抖音', '微博'].map((social) => (
                  <button key={social} className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-tertiary)',
                      border: '1px solid var(--border)'
                    }}
                    onMouseEnter={e => { e.target.style.backgroundColor = 'var(--accent)'; e.target.style.color = '#000' }}
                    onMouseLeave={e => { e.target.style.backgroundColor = 'var(--bg-primary)'; e.target.style.color = 'var(--text-tertiary)' }}
                  >
                    <span className="text-xs font-medium">{social[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2024 篮芯 LANXIN. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    );
  }

  if (variant === 'minimal') {
    return (
      <footer className="footer-base w-full p-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="flex items-center gap-2">
            Built with <span style={{ color: 'var(--accent)' }}>♥</span> by
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>昇梦体育科技有限公司</span>
          </p>
          <div className="flex items-center gap-4" style={{ color: 'var(--text-muted)' }}>
            <span>|</span>
            <span>v2.0.0</span>
          </div>
        </div>
      </footer>
    );
  }

  // Default simple footer (used by PlayersPage and MatchesPage)
  return (
    <footer className="footer-base mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <p className="font-medium" style={{ color: 'var(--accent)' }}>昇梦体育科技有限公司</p>
        </div>
        <div className="text-sm space-y-1" style={{ color: 'var(--text-tertiary)' }}>
          <p>地址：东莞理工学院</p>
          <p>邮箱：123456@qq.com</p>
        </div>
        <div className="mt-6 pt-6 border-t text-xs flex justify-between flex-wrap gap-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span>京ICP备20241145号</span>
          <div className="flex gap-4 flex-wrap">
            <span>网站支持权责声明</span>
            <span>隐私政策20250610430版</span>
            <span>广东省通信管理局备案（京ICP备25094号）</span>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors border" style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors border" style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--border)', color: '#22c55e' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.064-.264-.58-.404-1.214-.404-1.88 0-3.572 3.096-6.47 6.91-6.47.366 0 .724.028 1.076.08C15.95 4.476 12.682 2.188 8.691 2.188z"/>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
