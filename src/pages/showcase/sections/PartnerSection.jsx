import { partnerData } from '../data/showcaseData';

export default function PartnerSection() {
  return (
    <section id="partners" className="w-full py-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            合作 <span className="gold-shine">伙伴</span>
          </h2>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
            {partnerData.subtitle}
          </p>
        </div>

        <div className="card-base rounded-2xl overflow-hidden mb-8">
          <img src={partnerData.mainImage} alt={partnerData.mainImageAlt} className="w-full object-contain" style={{ maxHeight: '400px' }} />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {partnerData.logos.map((logo, i) => (
            <div key={i} className="card-solid rounded-xl p-4 flex items-center justify-center h-20 hover:scale-105 transition-transform duration-300">
              <img src={logo} alt={`合作媒体 ${i + 1}`} className="max-h-full max-w-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
