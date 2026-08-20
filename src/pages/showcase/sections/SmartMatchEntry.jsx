import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SmartMatchEntry() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState('');

  const handleGenerate = () => {
    const params = new URLSearchParams();
    params.set('autoMatch', '1');
    if (location) params.set('location', location);
    if (date) params.set('date', date);
    if (budget) params.set('budget', budget);
    navigate(`/web?view=matching&${params.toString()}`);
  };

  return (
    <section id="smart-match" className="w-full py-20" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            智能 <span className="gold-shine">办赛</span>
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            输入需求，一键生成采购清单 — 以AI驱动赛事资源智能匹配
          </p>
        </div>

        <div className="card-base rounded-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none"
               style={{ background: 'radial-gradient(circle at 50% 0%, var(--accent), transparent 70%)' }} />

          <div className="relative z-10 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  地点 / 赛区
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="如：松山湖"
                  className="input-base w-full px-4 py-3 rounded-xl text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  时间
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="如：2026年5月20日"
                  className="input-base w-full px-4 py-3 rounded-xl text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  预算
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="如：5000元"
                  className="input-base w-full px-4 py-3 rounded-xl text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleGenerate}
                className="btn-accent px-8 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300"
                style={{ boxShadow: '0 8px 32px var(--accent-muted)' }}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  生成办赛清单
                </span>
              </button>
            </div>

            <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              点击后将进入资源智能匹配系统，自动开始AI智能匹配
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => navigate('/web?view=matching')} className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:scale-105" style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}>
                办赛资源库 →
              </button>
              <button onClick={() => navigate('/web?view=roster')} className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:scale-105" style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}>
                专业人才库 →
              </button>
              <button onClick={() => navigate('/web?view=schedule')} className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:scale-105" style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}>
                赛制与赛程 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
