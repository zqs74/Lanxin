import React from 'react';
import AnimatedNumber from './AnimatedNumber.jsx';

/**
 * 环形占比图（营销报表路演 · 幕3 渠道占比）
 * 分扇区交错浮现 + 金色扫描光弧 + 中心金额计数
 * @param {Object} props
 * @param {Array<{label:string, value:number, color:string}>} props.items
 * @param {string} [props.centerLabel] 中心说明文字
 * @param {string} [props.centerUnit]  中心金额单位
 * @param {boolean} [props.animate]    是否触发浮现/计数动画
 * @param {number}  [props.size]       外框尺寸 px
 */
export default function DonutChart({
  items = [],
  centerLabel = '合计',
  centerUnit = '',
  animate = true,
  size = 200
}) {
  if (!items.length) return null;

  const total = items.reduce((s, it) => s + it.value, 0);
  const C = 100, R = 70, SW = 22;
  let start = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <defs>
            <linearGradient id="tour-sweep-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand)" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          {/* 底环 */}
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--surface-muted)" strokeWidth={SW} />
          {/* 分扇区（交错浮现） */}
          {items.map((it, i) => {
            const pct = total ? (it.value / total) * 100 : 0;
            const segStart = start;
            start += pct;
            return (
              <g
                key={it.label}
                style={{
                  opacity: animate ? 1 : 0,
                  transform: animate ? 'scale(1)' : 'scale(0.7)',
                  transformOrigin: `${C}px ${C}px`,
                  transition: 'opacity .5s ease, transform .6s cubic-bezier(0.22,1,0.36,1)',
                  transitionDelay: `${i * 110}ms`
                }}
              >
                <circle
                  cx={C} cy={C} r={R} fill="none"
                  stroke={it.color} strokeWidth={SW}
                  pathLength="100" strokeDasharray={`${pct} 200`} strokeDashoffset={100 - segStart}
                  transform={`rotate(-90 ${C} ${C})`}
                />
              </g>
            );
          })}
          {/* 扫描光弧 */}
          <g style={{ animation: 'tour-sweep 2.4s linear infinite' }}>
            <circle
              cx={C} cy={C} r={R} fill="none"
              stroke="url(#tour-sweep-grad)" strokeWidth={SW - 7}
              pathLength="100" strokeDasharray="15 200" strokeLinecap="round"
              opacity="0.9"
            />
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <AnimatedNumber
            value={total}
            decimals={1}
            run={animate}
            className="text-2xl font-black tabular-nums"
            style={{ color: 'var(--brand)' }}
          />
          <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{centerLabel}{centerUnit}</span>
        </div>
      </div>

      {/* 图例 */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {items.map((it) => {
          const pct = total ? ((it.value / total) * 100).toFixed(1) : '0.0';
          return (
            <div key={it.label} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: it.color }} />
              <span className="text-[var(--text-muted)] flex-1 truncate">{it.label}</span>
              <span className="font-bold tabular-nums" style={{ color: it.color }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
