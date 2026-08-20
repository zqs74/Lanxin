import { recognitionData, mediaData } from '../data/showcaseData';

export default function RecognitionSection() {
  return (
    <section id="recognition" className="w-full py-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
              行业 <span className="gold-shine">认可</span>
            </h2>
            <p className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
              篮球行业专家与领袖的指导与支持
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {recognitionData.experts.map((expert, i) => (
              <div key={i} className="card-base rounded-2xl p-5 sm:p-6 text-center scroll-fade-in hover:border-[var(--border-hover)] transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl font-black"
                     style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '2px solid var(--border)' }}>
                  {expert.name.charAt(0)}
                </div>
                <h3 className="text-base sm:text-lg font-black mb-1" style={{ color: 'var(--text-primary)' }}>
                  {expert.name}
                </h3>
                <p className="text-xs sm:text-sm mb-3" style={{ color: 'var(--accent)' }}>
                  {expert.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  {expert.quote}
                </p>
              </div>
            ))}
          </div>

          <div className="card-base rounded-2xl overflow-hidden">
            <img src={recognitionData.image} alt={recognitionData.imageAlt} className="w-full h-64 sm:h-80 object-cover" />
          </div>
        </div>

        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
              主流媒体 <span className="gold-shine">报道</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {mediaData.images.map((img, i) => (
              <div key={i} className="card-base rounded-2xl overflow-hidden scroll-fade-in">
                <img src={img.src} alt={img.alt} className="w-full h-48 sm:h-64 object-cover hover:scale-105 transition-transform duration-700" />
                <div className="p-4">
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{img.alt}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card-base rounded-2xl p-6 sm:p-8">
            <ul className="space-y-4">
              {mediaData.highlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-3 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 5.882V4.5a1.5 1.5 0 013 0v1.382m0 0a4.001 4.001 0 012.13 6.836l.04.026M5.436 13.683L18 20" />
                  </svg>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
