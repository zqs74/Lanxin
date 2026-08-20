import { useNavigate } from 'react-router-dom';
import HeroRingBackground from './HeroRingBackground';
import { heroData } from '../data/showcaseData';
import { useTheme } from '../../../context/ThemeContext';

export default function HeroSection() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const scrollToGallery = () => {
    document.getElementById('arc-gallery')?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToSmartMatch = () => {
    document.getElementById('smart-match')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Three.js Ring Gallery Background */}
      <HeroRingBackground />

      {/* Content Layer - centered inside the ring */}
      <div className="relative z-20 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center mb-4 md:mb-6">
          <img
            src={heroData.logo}
            alt="昇梦体育 Logo"
            className="h-20 w-auto md:h-28 lg:h-32 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-2">
          <span className="gold-shine">{heroData.title}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed mb-2"
          style={{ color: isLight ? '#1a1a1a' : '#ffffff' }}
        >
          {heroData.subtitle}
        </p>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg leading-relaxed mt-4 mb-8"
          style={{ color: isLight ? 'rgba(26, 26, 26, 0.75)' : 'rgba(255, 255, 255, 0.8)' }}
        >
          {heroData.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={scrollToGallery}
            className="btn-accent w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold shadow-2xl"
            style={{ boxShadow: '0 8px 32px var(--accent-muted)' }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              探索案例
            </span>
          </button>

          <button
            onClick={scrollToSmartMatch}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-transparent border-2 rounded-full font-bold text-sm sm:text-base hover:scale-105 transition-all duration-300"
            style={{
              borderColor: 'var(--accent)',
              backgroundColor: isLight ? 'rgba(184, 148, 31, 0.1)' : 'rgba(212, 175, 55, 0.1)',
              color: isLight ? '#1a1a1a' : '#ffffff',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              智能办赛
            </span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-transparent border-2 rounded-full font-bold text-sm sm:text-base hover:scale-105 transition-all duration-300"
            style={{
              borderColor: isLight ? 'rgba(26, 26, 26, 0.3)' : 'rgba(255,255,255,0.3)',
              color: isLight ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              技术首页
            </span>
          </button>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-20">
        <p className="text-sm animate-bounce"
          style={{ color: isLight ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.7)' }}
        >
          向下滚动探索更多 ↓
        </p>
      </div>
    </section>
  );
}
