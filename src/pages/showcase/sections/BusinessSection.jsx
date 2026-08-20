import { useNavigate } from 'react-router-dom';
import { businesses } from '../data/showcaseData';

export default function BusinessSection() {
  const navigate = useNavigate();

  return (
    <section id="business" className="w-full py-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            三大核心 <span className="gold-shine">业务</span>
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            以AI驱动赛事全链路服务
          </p>
        </div>

        {businesses.map((biz, index) => {
          const isReversed = index % 2 === 1;
          return (
            <div
              key={biz.id}
              className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 lg:gap-12 scroll-fade-in`}
            >
              <div className="w-full lg:w-1/2">
                <div className="relative rounded-2xl overflow-hidden group" style={{ border: '1px solid var(--border)' }}>
                  <img
                    src={biz.image}
                    alt={biz.imageAlt}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <p className="text-white text-sm sm:text-base font-medium opacity-90">{biz.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 space-y-5">
                <div>
                  <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    核心业务 {index + 1}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {biz.title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {biz.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {biz.stats.map((stat, i) => (
                    <div key={i} className="card-base rounded-xl p-3 sm:p-4 text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-xl sm:text-2xl font-black gold-shine">{stat.value}</span>
                        <span className="text-xs sm:text-sm" style={{ color: 'var(--accent)' }}>{stat.unit}</span>
                      </div>
                      <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {biz.resources.length > 0 && (
                  <div className="space-y-2">
                    {biz.resources.map((res, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{res.label}：</span>
                          <span>{res.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => navigate(biz.link)}
                  className="btn-accent px-6 py-3 rounded-full text-sm font-bold hover:scale-105 transition-transform duration-300"
                >
                  {biz.linkText} →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
