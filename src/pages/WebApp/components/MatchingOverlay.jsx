import React, { useState, useEffect } from 'react';
import { Wand2, Users, Building2, Package, Megaphone, Check, Sparkles } from 'lucide-react';
import StatusPill from './StatusPill.jsx';

/**
 * 资源智能匹配 · 过渡动画浮层（点击"开始智能匹配"后展示）
 * 雷达扫圈 + 光子扫描线 + 四库依次匹配进度动画 + 匹配完成定格
 * @param {Object} props
 * @param {Object[]} props.stages    - 匹配进度（MATCH_PROGRESS）
 * @param {Object}   props.stats     - 匹配统计（MATCH_STATS）
 * @param {Function} props.onComplete- 动画结束回调（进入自动匹配页）
 */
export default function MatchingOverlay({ stages = [], stats = {}, onComplete }) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const [progresses, setProgresses] = useState(() => Array(stages.length).fill(0));
  const [counts, setCounts] = useState(() => Array(stages.length).fill(0));
  const [phase, setPhase] = useState('matching');

  const DB_ICON = { Users, Building2, Package, Megaphone };
  const DB_TEXT = {
    info: 'text-[var(--info)]', ok: 'text-[var(--ok)]',
    warn: 'text-[var(--warn)]', purple: 'text-[var(--purple)]'
  };
  const DB_BG = {
    info: 'bg-[var(--info)]/15', ok: 'bg-[var(--ok)]/15',
    warn: 'bg-[var(--warn)]/15', purple: 'bg-[var(--purple)]/15'
  };
  const COLOR_VAR = {
    info: 'var(--info)', ok: 'var(--ok)', warn: 'var(--warn)', purple: 'var(--purple)'
  };

  const PARTICLES = [
    { left: '8%', top: '22%', size: 6, delay: '0s', dur: '4.5s' },
    { left: '88%', top: '30%', size: 5, delay: '0.8s', dur: '5s' },
    { left: '16%', top: '68%', size: 4, delay: '1.4s', dur: '4.2s' },
    { left: '76%', top: '74%', size: 6, delay: '0.3s', dur: '4.8s' },
    { left: '40%', top: '16%', size: 4, delay: '1.9s', dur: '5.2s' },
    { left: '60%', top: '80%', size: 5, delay: '0.6s', dur: '4.6s' },
    { left: '30%', top: '84%', size: 4, delay: '2.2s', dur: '5.4s' },
    { left: '72%', top: '14%', size: 5, delay: '1.1s', dur: '4.4s' }
  ];

  const SLOT = 720;
  const FILL = 560;
  const TOTAL = 120 + stages.length * SLOT;

  useEffect(() => {
    const BASE = 120;
    const timers = [];
    const raf = [];

    stages.forEach((stage, i) => {
      timers.push(
        setTimeout(() => {
          setActiveIdx(i);
          setProgresses(prev => {
            const next = [...prev];
            next[i] = 100;
            return next;
          });
          const t0 = performance.now();
          const tick = () => {
            const p = Math.min(1, (performance.now() - t0) / FILL);
            const eased = 1 - Math.pow(1 - p, 3);
            setCounts(prev => {
              const next = [...prev];
              next[i] = Math.round(stage.matched * eased);
              return next;
            });
            if (p < 1) raf.push(requestAnimationFrame(tick));
          };
          raf.push(requestAnimationFrame(tick));
        }, BASE + i * SLOT)
      );
    });

    timers.push(setTimeout(() => setPhase('done'), TOTAL + 250));
    timers.push(setTimeout(() => { if (onComplete) onComplete(); }, TOTAL + 900));

    return () => {
      timers.forEach(clearTimeout);
      raf.forEach(cancelAnimationFrame);
    };
  }, [stages, onComplete, FILL, SLOT, TOTAL]);

  const isDonePhase = phase === 'done';

  const statusText = () => {
    if (isDonePhase) {
      return `匹配完成，共匹配 ${stats.totalMatched}/${stats.totalRequired} 项资源，综合匹配率 ${stats.matchRate}%`;
    }
    if (activeIdx < 0) return '正在初始化 AI 匹配引擎…';
    const stage = stages[activeIdx];
    if (activeIdx === 2) return `正在进行${stage.name}匹配… 发现资源冲突，正在优化推荐方案`;
    return `正在进行${stage.name}匹配…`;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rm-overlay-title"
    >
      {/* ===== 毛玻璃遮罩 ===== */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'color-mix(in srgb, var(--bg-primary) 72%, transparent)', backdropFilter: 'blur(8px)' }}
        aria-hidden="true"
      />

      {/* ===== 漂浮粒子（资源光点） ===== */}
      {!isDonePhase && PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: i % 3 === 0 ? 'var(--brand)' : i % 3 === 1 ? 'var(--info)' : 'var(--ok)',
            animation: `rmDrift ${p.dur} ease-in-out ${p.delay} infinite`
          }}
          aria-hidden="true"
        />
      ))}

      {/* ===== 主卡片 ===== */}
      <div className="relative card-solid p-8 w-full max-w-lg shadow-2xl" style={{ animation: 'fadeIn 240ms ease both' }}>
        {/* ===== 标题行 ===== */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center shrink-0"
              style={{ animation: 'rmGlowPulse 1.6s ease-in-out infinite' }}
            >
              {isDonePhase
                ? <Check size={22} className="text-[var(--ok)]" aria-hidden="true" />
                : <Wand2 size={22} className="text-[var(--brand)]" aria-hidden="true" />}
            </div>
            <div>
              <h3 id="rm-overlay-title" className="text-lg font-bold text-[var(--text-primary)]">
                {isDonePhase ? '匹配完成' : 'AI 智能匹配中'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">正在从四库资源中精准匹配办赛需要</p>
            </div>
          </div>
          <StatusPill variant={isDonePhase ? 'ok' : 'brand'}>
            {isDonePhase ? '匹配完成' : '正在匹配'}
          </StatusPill>
        </div>

        {/* ===== 雷达扫圈 ===== */}
        <div className="relative w-24 h-24 mx-auto mb-5 rounded-full border border-[var(--brand)]/30" aria-hidden="true">
          <div className="absolute inset-3 rounded-full border border-[var(--brand)]/20" />
          <div className="absolute inset-6 rounded-full border border-[var(--brand)]/15" />
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: 'conic-gradient(from 0deg, color-mix(in srgb, var(--brand) 55%, transparent), transparent 70deg, transparent 360deg)',
                animation: 'rmRadarSweep 1.7s linear infinite'
              }}
            />
          </div>
          {isDonePhase ? (
            <>
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid var(--ok)', animation: 'rmRingPing 700ms ease-out forwards' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-[var(--ok)] flex items-center justify-center">
                  <Check size={15} className="text-white" aria-hidden="true" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="absolute left-[30%] top-[22%] w-1.5 h-1.5 rounded-full bg-[var(--brand)]" style={{ animation: 'rmBlip 1.7s ease-in-out infinite' }} />
              <div className="absolute right-[26%] top-[42%] w-1 h-1 rounded-full bg-[var(--ok)]" style={{ animation: 'rmBlip 1.7s ease-in-out 0.6s infinite' }} />
              <div className="absolute left-[40%] bottom-[16%] w-1 h-1 rounded-full bg-[var(--info)]" style={{ animation: 'rmBlip 1.7s ease-in-out 1.1s infinite' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[var(--brand)]" style={{ animation: 'rmBlip 1.7s ease-in-out infinite' }} />
              </div>
            </>
          )}
        </div>

        {/* ===== 四库匹配进度 ===== */}
        <div className="space-y-4">
          {stages.map((stage, i) => {
            const Icon = DB_ICON[stage.icon] || Package;
            const rowActive = isDonePhase || i === activeIdx;
            const rowDone = isDonePhase || i < activeIdx;
            const isCurrentActive = !isDonePhase && i === activeIdx;
            return (
              <div
                key={stage.id}
                className={`space-y-1 transition-opacity duration-300 ${rowActive ? 'opacity-100' : 'opacity-35'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${DB_BG[stage.color] || 'bg-[var(--brand)]/15'}`}>
                      <Icon size={14} className={DB_TEXT[stage.color] || 'text-[var(--brand)]'} aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {rowDone && <Check size={12} className="text-[var(--ok)]" aria-hidden="true" />}
                    <span className="text-xs tabular-nums text-[var(--text-primary)]">
                      {counts[i]}/{stage.total}
                    </span>
                  </div>
                </div>
                <div className="relative h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progresses[i]}%`,
                      backgroundColor: COLOR_VAR[stage.color] || 'var(--brand)',
                      transition: `width ${FILL}ms cubic-bezier(0.22, 1, 0.36, 1)`
                    }}
                  />
                  {isCurrentActive && (
                    <div
                      className="absolute inset-y-0 w-9 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--text-primary) 85%, transparent), transparent)',
                        animation: 'rmPhoton 0.75s linear infinite'
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== 底部状态 ===== */}
        <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-center gap-2">
          <Sparkles
            size={14}
            className={isDonePhase ? 'text-[var(--ok)]' : 'text-[var(--brand)]'}
            aria-hidden="true"
          />
          <p
            className="text-xs text-[var(--text-muted)] text-center"
            role="status"
            aria-live="polite"
          >
            {statusText()}
          </p>
        </div>
      </div>
    </div>
  );
}