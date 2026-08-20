import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const particleCount = 120;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const colors = isLight
      ? ['#D4AF37', '#FF6B35', '#F59E0B', '#FB923C', '#F97316']
      : ['#D4AF37', '#FFD700', '#B8941F', '#FFF8DC', '#DAA520'];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

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

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.25;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
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

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="page-home relative w-full overflow-hidden min-h-screen" style={{ background: 'var(--page-bg)' }}>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      {/* Hero Section */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="text-center space-y-12 max-w-4xl">
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-6 md:mb-8">
                <img
                  src="/test.png"
                  alt="篮芯 Logo"
                  className="h-36 w-auto md:h-48 lg:h-56 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>

              <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight px-2" style={{ color: 'var(--text-primary)' }}>
                你的专属<span className="gold-shine">AI</span>篮球分析师
              </p>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light max-w-2xl mx-auto leading-relaxed px-2" style={{ color: 'var(--text-secondary)' }}>
                智能识别 · 精准分析 · 数据驱动<br/>
                让每一次投篮都有迹可循
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 px-2">
              <button
                onClick={() => navigate('/web')}
                className="btn-accent w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg shadow-2xl"
                style={{
                  boxShadow: '0 8px 32px var(--accent-muted)'
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  管理控制台
                </span>
              </button>

              <button
                onClick={() => navigate('/download')}
                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-transparent border-2 rounded-full font-bold text-base sm:text-lg hover:scale-105 transition-all duration-300"
                style={{
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)'
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--accent-hover)'; e.target.style.color = 'var(--accent-hover)'; e.target.style.backgroundColor = 'var(--accent-light)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; e.target.style.backgroundColor = 'transparent' }}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下载APP
                </span>
              </button>

              <button
                onClick={() => navigate('/showcase')}
                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-lg hover:scale-105 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                  color: '#000',
                  boxShadow: '0 4px 20px var(--accent-muted)'
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  查看展示首页
                </span>
              </button>
            </div>

            <div className="pt-12 sm:pt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto px-2">
              {[
                { icon: '🎯', title: '智能识别', desc: 'AI自动识别球员、篮球、投篮动作' },
                { icon: '📊', title: '数据分析', desc: '精准统计投篮命中率、得分等数据' },
                { icon: '⚡', title: '实时反馈', desc: '即时生成分析报告与可视化图表' }
              ].map((item, index) => (
                <div key={index} className="card-base rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center space-y-3 hover:bg-[var(--bg-card-hover)] transition-all duration-300">
                  <div className="text-3xl sm:text-4xl">{item.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold gold-shine">{item.title}</h3>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center z-10">
          <p className="text-sm animate-bounce text-accent">
            向下滚动探索更多 ↓
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* Search Box */}
          <div className="max-w-4xl mx-auto px-2">
            <div className="relative group">
              <div className="absolute -inset-[5px] rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-hover), #FF6B35, var(--accent-hover), var(--accent))',
                  backgroundSize: '400% 100%',
                  animation: 'neon-border-flow 4s linear infinite',
                  filter: 'blur(8px)'
                }}
              />
              <div className="absolute -inset-[3px] rounded-2xl opacity-80"
                style={{
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-hover), #FF6B35, var(--accent-hover), var(--accent))',
                  backgroundSize: '400% 100%',
                  animation: 'neon-border-flow 4s linear infinite',
                }}
              />
              <div className="relative rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))' }}>
                <input
                  type="text"
                  placeholder="输入您想查询的球员/球队/联赛"
                  className="w-full px-5 sm:px-8 py-5 sm:py-7 pl-14 sm:pl-20 pr-32 sm:pr-44 bg-transparent border-2 border-transparent rounded-2xl text-lg sm:text-xl focus:outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <svg className="w-6 h-6 sm:w-8 sm:h-8 absolute left-4 sm:left-6 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button className="btn-accent absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg shadow-lg"
                  style={{ boxShadow: '0 4px 20px var(--accent-muted)' }}
                >
                  搜索
                </button>
              </div>
            </div>
          </div>

          {/* Report Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2">
            <div className="card-base rounded-xl sm:rounded-2xl overflow-hidden group hover:border-[var(--border-hover)] transition-all duration-300">
              <div className="relative h-40 overflow-hidden">
                <img src="/images/showcase/case-game-action-01.png" alt="赛事数据分析" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-black" style={{ background: 'var(--accent)' }}>AI分析</span>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>运动数据分析中台</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>多机位采集、目标检测、动作识别，17类高光事件毫秒级识别</p>
                <button onClick={() => navigate('/web?view=ai')} className="btn-accent px-5 py-2 rounded-lg text-sm">
                  立即体验
                </button>
              </div>
            </div>

            <div className="card-base rounded-xl sm:rounded-2xl overflow-hidden group hover:border-[var(--border-hover)] transition-all duration-300">
              <div className="relative h-40 overflow-hidden">
                <img src="/images/showcase/case-yueba-champion.png" alt="赛事运营" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-black" style={{ background: 'var(--accent)' }}>赛事运营</span>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>数字化办赛服务</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>累计办赛4852场，标准化SOP 53项，覆盖全国36城</p>
                <button onClick={() => navigate('/matches')} className="btn-accent px-5 py-2 rounded-lg text-sm">
                  查看赛事
                </button>
              </div>
            </div>

            <div className="card-base rounded-xl sm:rounded-2xl overflow-hidden group hover:border-[var(--border-hover)] transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="relative h-40 overflow-hidden">
                <img src="/images/showcase/case-brand-sandknit.png" alt="品牌合作" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-black" style={{ background: 'var(--accent)' }}>流量运营</span>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>赛事视频营销中台</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>高光识别、自动剪辑、智能宣发，单场视频产出200+条</p>
                <button onClick={() => navigate('/web?view=timeline')} className="btn-accent px-5 py-2 rounded-lg text-sm">
                  了解更多
                </button>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="flex justify-center px-2">
            <div className="card-base max-w-3xl w-full rounded-xl sm:rounded-2xl p-4 sm:p-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-2xl sm:text-3xl">📢</div>
                <div className="flex-1">
                  <h3 className="text-center text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: 'var(--text-primary)' }}>平台公告</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-center" style={{ color: 'var(--text-secondary)' }}>
                    全站技术统计数据和贡献值数据对所有用户免费开放查询权限。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-8 px-2">
            {[
              { icon: '🎬', title: '视频分析', desc: '上传比赛视频，AI自动识别关键事件' },
              { icon: '📈', title: '数据可视化', desc: '多维度图表展示球员表现数据' },
              { icon: '🏀', title: '投篮追踪', desc: '实时追踪每次投篮轨迹和命中率' },
              { icon: '👥', title: '球队管理', desc: '完整管理球队信息和球员档案' }
            ].map((feature, index) => (
              <div key={index} className="card-solid rounded-lg sm:rounded-xl p-4 sm:p-6 hover:bg-[var(--bg-card-hover)] transition-all duration-300 group cursor-pointer">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{feature.icon}</div>
                <h4 className="font-bold mb-2 transition-colors text-base sm:text-lg" style={{ color: 'var(--text-primary)' }}>{feature.title}</h4>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
