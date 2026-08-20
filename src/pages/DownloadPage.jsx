import { useEffect, useRef } from 'react';
import Footer from '../components/Footer';

export default function DownloadPage() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const particleCount = 120;
    const colors = ['#8B5CF6', '#A78BFA', '#3B82F6', '#60A5FA', '#7C3AED'];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(window.innerHeight, document.documentElement.scrollHeight);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() { this.reset(); }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.8;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.2;
        this.originalSize = this.size;
      }

      update() {
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 180;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 2.5;
          this.y -= Math.sin(angle) * force * 2.5;
          this.size = this.originalSize + force * 3.5;
          this.opacity = Math.min(1, this.opacity + force * 0.4);
        } else {
          this.size += (this.originalSize - this.size) * 0.1;
          this.opacity += (this.opacity * 0.6 + 0.2 - this.opacity) * 0.05;
        }
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) { particles.push(new Particle()); }

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.25;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    const handleMouseMove = (e) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY; };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="page-download relative w-full min-h-screen overflow-hidden pt-20 theme-transition" style={{ background: 'var(--page-bg)' }}>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <img src="/test.png" alt="篮芯 Logo" className="h-28 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
                  你的专属<br/>
                  <span className="gold-shine">AI篮球分析师</span>
                </h2>
                <p className="text-lg leading-relaxed max-w-md mx-auto lg:mx-0" style={{ color: 'var(--text-secondary)' }}>
                  随时随地，智能分析你的投篮数据。下载篮芯APP，开启AI辅助训练新时代。
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button className="group relative px-10 py-4 rounded-full font-bold text-base shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, var(--page-accent), var(--page-accent-secondary))',
                    color: '#ffffff',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-3 justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    iOS下载
                  </span>
                </button>

                <button className="group relative px-10 py-4 rounded-full font-bold text-base shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                    color: '#ffffff',
                    boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-3 justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    Android下载
                  </span>
                </button>

                <button
                  onClick={() => window.location.href = '/web'}
                  className="px-10 py-4 bg-transparent border-2 rounded-full font-bold text-base hover:scale-105 transition-all duration-300 whitespace-nowrap"
                  style={{
                    borderColor: 'var(--page-accent)',
                    color: 'var(--page-accent)'
                  }}
                  onMouseEnter={e => { e.target.style.backgroundColor = 'var(--accent-light)'; e.target.style.borderColor = 'var(--accent-hover)' }}
                  onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.borderColor = 'var(--page-accent)' }}
                >
                  <span className="flex items-center gap-3 justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    管理控制台
                  </span>
                </button>
              </div>

              <div className="pt-8 space-y-4">
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>核心功能</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['AI智能识别', '实时数据分析', '投篮轨迹追踪', '球员表现统计', '比赛回放分析', '多维度报告生成'].map((feature, index) => (
                    <div key={index} className="card-solid rounded-xl p-3 flex items-center gap-3 hover:bg-[var(--bg-card-hover)] transition-all duration-300">
                      <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, var(--page-accent), var(--page-accent-secondary))' }}></div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl rounded-full scale-110 animate-pulse"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))' }}
                />
                <div className="relative w-72 h-[580px] rounded-[3rem] border-4 shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500"
                  style={{
                    background: 'linear-gradient(180deg, var(--bg-secondary), var(--bg-tertiary))',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 rounded-b-2xl z-20" style={{ backgroundColor: 'var(--bg-primary)' }}></div>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--accent-light), rgba(59,130,246,0.1), var(--accent-light))' }}></div>
                  <div className="relative z-10 h-full flex flex-col items-center justify-start pt-12 px-6 space-y-6">
                    <img src="/test.png" alt="App Icon" className="h-24 w-auto object-contain" />
                    <h3 className="text-2xl font-bold gold-shine">篮芯</h3>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>AI Basketball Analyst</p>
                    <div className="w-full space-y-3 mt-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card-solid rounded-2xl p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}></div>
                            <div className="flex-1">
                              <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: 'var(--accent-muted)' }}></div>
                              <div className="h-1.5 rounded-full w-1/2 mt-1.5" style={{ backgroundColor: 'var(--border)' }}></div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map((j) => (
                              <div key={j} className="rounded-lg p-2 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                                <div className="h-1.5 rounded-full mx-auto w-8 mb-1" style={{ backgroundColor: 'var(--accent-muted)' }}></div>
                                <div className="h-1 rounded-full w-6 mx-auto" style={{ backgroundColor: 'var(--border)' }}></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute -right-8 top-1/4 w-64 h-[520px] rounded-[2.5rem] border-4 shadow-2xl overflow-hidden transform -rotate-6 opacity-90"
                  style={{
                    background: 'linear-gradient(180deg, var(--bg-secondary), var(--bg-tertiary))',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--accent-light), rgba(59,130,246,0.1), transparent)' }}></div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 rounded-b-2xl" style={{ backgroundColor: 'var(--bg-primary)' }}></div>
                  <div className="relative h-full pt-10 px-4">
                    <div className="rounded-2xl p-4 mb-3" style={{
                      background: 'linear-gradient(135deg, var(--accent-muted), rgba(59,130,246,0.15))'
                    }}>
                      <div className="h-20 rounded-xl mb-2" style={{ backgroundColor: 'var(--bg-primary)' }}></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                          <div className="h-1.5 rounded-full w-12 mb-1" style={{ backgroundColor: 'var(--accent-muted)' }}></div>
                          <div className="h-2 rounded-full w-full" style={{ backgroundColor: 'var(--accent-muted)' }}></div>
                        </div>
                        <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                          <div className="h-1.5 rounded-full w-12 mb-1" style={{ backgroundColor: 'var(--accent-muted)' }}></div>
                          <div className="h-2 rounded-full w-full" style={{ backgroundColor: 'var(--accent-muted)' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="rounded-lg p-2 flex items-center gap-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--accent-light)' }}></div>
                          <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer variant="full" />
      </div>
    </div>
  );
}
