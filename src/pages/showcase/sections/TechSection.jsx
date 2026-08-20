import { useNavigate } from 'react-router-dom';
import { techSection } from '../data/showcaseData';

export default function TechSection() {
  const navigate = useNavigate();
  const { architecture, advantages, barriers } = techSection;

  return (
    <section id="tech" className="w-full py-20" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            运作 <span className="gold-shine">核心</span>
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            技术驱动赛事全链路数字化
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="mb-16 scroll-fade-in">
          <div className="card-base rounded-2xl overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="w-full lg:w-1/2">
                <img src={architecture.image} alt={architecture.imageAlt} className="w-full rounded-xl object-contain" />
              </div>
              <div className="w-full lg:w-1/2 space-y-4">
                <h3 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {architecture.title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {architecture.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {architecture.techStack.map((tech, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {architecture.stats.map((stat, i) => (
                    <div key={i} className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-xl font-black gold-shine">{stat.value}</span>
                        <span className="text-sm" style={{ color: 'var(--accent)' }}>{stat.unit}</span>
                      </div>
                      <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Advantages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {advantages.map((adv) => (
            <div key={adv.id} className="card-base rounded-2xl p-5 sm:p-6 flex flex-col scroll-fade-in hover:border-[var(--border-hover)] transition-all duration-300">
              {adv.image && (
                <div className="mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <img src={adv.image} alt={adv.imageAlt} className="w-full h-40 object-cover" />
                </div>
              )}

              <h3 className="text-lg sm:text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                {adv.title}
              </h3>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--accent)' }}>
                {adv.subtitle}
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                {adv.description}
              </p>

              {adv.stats && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {adv.stats.map((stat, i) => (
                    <div key={i} className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-lg font-black gold-shine">{stat.value}</span>
                        <span className="text-xs" style={{ color: 'var(--accent)' }}>{stat.unit}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {adv.comparison && (
                <div className="mb-4 space-y-2">
                  {adv.comparison.map((row, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                      <span className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>{row.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs line-through opacity-60" style={{ color: 'var(--text-muted)' }}>{row.before}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{row.after}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate(adv.link)}
                className="mt-auto btn-accent px-4 py-2.5 rounded-lg text-sm font-bold hover:scale-105 transition-transform"
              >
                {adv.linkText} →
              </button>
            </div>
          ))}
        </div>

        {/* Tech Barriers */}
        <div className="card-base rounded-2xl p-6 sm:p-8 scroll-fade-in">
          <h3 className="text-xl sm:text-2xl font-black text-center mb-6" style={{ color: 'var(--text-primary)' }}>
            {barriers.title}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {barriers.items.map((item, i) => (
              <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                <p className="text-2xl sm:text-3xl font-black gold-shine mb-1">{item.value}</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
