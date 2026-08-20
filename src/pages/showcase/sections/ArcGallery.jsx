import { useState, useEffect, useRef } from 'react';
import { galleryImages } from '../data/showcaseData';

export default function ArcGallery() {
  const [centerIndex, setCenterIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const timer = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % galleryImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isMobile]);

  const getItemStyle = (index) => {
    const offset = index - centerIndex;
    const absOffset = Math.abs(offset);

    if (absOffset > 3) return { display: 'none' };

    const baseWidth = isMobile ? 280 : 380;
    const baseHeight = isMobile ? 180 : 240;
    const scale = 1 - absOffset * 0.18;
    const rotateY = offset * -15;
    const translateZ = -absOffset * 80;
    const translateX = offset * (isMobile ? 180 : 280);
    const opacity = 1 - absOffset * 0.3;

    return {
      width: `${baseWidth}px`,
      height: `${baseHeight}px`,
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: opacity,
      zIndex: 100 - absOffset,
    };
  };

  const handleClick = (index) => {
    if (index === centerIndex) {
      document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCenterIndex(index);
    }
  };

  return (
    <section id="arc-gallery" className="relative w-full py-20 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            真实案例 · <span className="gold-shine">一线沉淀</span>
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            4852场赛事，覆盖全国36城
          </p>
        </div>

        {isMobile ? (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-72 rounded-2xl overflow-hidden snap-center cursor-pointer group"
                style={{ border: '1px solid var(--border)', boxShadow: '0 8px 30px var(--shadow)' }}
                onClick={() => handleClick(i)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm font-medium">{img.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ perspective: '1400px', perspectiveOrigin: 'center center', position: 'relative', overflow: 'hidden' }}>
            <div
              ref={trackRef}
              className="relative flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d', height: '420px' }}
            >
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="absolute rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-out"
                  style={{
                    ...getItemStyle(i),
                    boxShadow: i === centerIndex
                      ? '0 20px 60px rgba(0,0,0,0.4), 0 0 0 2px var(--accent)'
                      : '0 10px 40px rgba(0,0,0,0.3)',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-190px',
                    marginTop: '-120px',
                  }}
                  onClick={() => handleClick(i)}
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-base font-bold">{img.caption}</p>
                  </div>
                  {i === centerIndex && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-black" style={{ background: 'var(--accent)' }}>
                      点击查看详情
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: 0, width: '18%',
              background: 'linear-gradient(to right, var(--bg-secondary), transparent)',
              pointerEvents: 'none', zIndex: 200,
            }} />
            <div style={{
              position: 'absolute', top: 0, bottom: 0, right: 0, width: '18%',
              background: 'linear-gradient(to left, var(--bg-secondary), transparent)',
              pointerEvents: 'none', zIndex: 200,
            }} />
          </div>
        )}

        <div className="flex justify-center gap-2 mt-6">
          {galleryImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCenterIndex(i)}
              className={`rounded-full transition-all duration-300 ${i === centerIndex ? 'w-8 h-2' : 'w-2 h-2'}`}
              style={{ background: i === centerIndex ? 'var(--accent)' : 'var(--border)' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
