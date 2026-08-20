import { cases } from '../data/showcaseData';

export default function CaseGallery() {
  return (
    <section id="cases" className="w-full py-20" style={{ background: 'var(--page-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            典型 <span className="gold-shine">案例</span>
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            真实赛事，真实数据，真实成果
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem, index) => (
            <div
              key={caseItem.id}
              className="card-base rounded-2xl overflow-hidden flex flex-col scroll-fade-in hover:border-[var(--border-hover)] transition-all duration-300"
            >
              {caseItem.image && (
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img src={caseItem.image} alt={caseItem.imageAlt} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-black" style={{ background: 'var(--accent)' }}>
                    案例 {index + 1}
                  </div>
                </div>
              )}

              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <h3 className="text-lg sm:text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                  {caseItem.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {caseItem.description}
                </p>

                {caseItem.stats && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {caseItem.stats.map((stat, i) => (
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

                {caseItem.highlights && (
                  <ul className="space-y-2 mb-4">
                    {caseItem.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{caseItem.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
