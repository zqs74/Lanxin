import React, { useState, useMemo } from 'react';

/* StackedBarChart（原生 SVG） ******************************************************************
 * 用途：各渠道月度营业额（Tab3）堆叠柱，增强颜色区分：
 *  - 每个渠道独立渐变色 + 描边 + 高光；
 *  - 图例与柱子颜色严格一致，legend 色块加 border；
 *  - hover 高亮该月对应柱子，其余降透明度
 ***********************************************************************************************/
const COLOR_MAP = {
  brand:   'var(--brand)',
  info:    'var(--info)',
  ok:      'var(--ok)',
  purple:  'var(--purple)',
  warn:    'var(--warn)',
  danger:  'var(--danger)',
  surface: 'var(--surface)',
  muted:   'var(--text-muted)',
  border:  'var(--border)',
  card:    'var(--card-solid)'
};

// 辅助：每个渠道固定渐变 + 描边色（按 color key）
const STACK_STYLES = {
  brand:  { from: 'color-mix(in srgb, var(--brand) 100%, #ffd24a)', to:   'var(--brand)',  stroke: 'rgba(180,140,30,0.75)',  shade: 'rgba(0,0,0,0.08)' },
  ok:     { from: 'color-mix(in srgb, var(--ok) 100%, #a7f3d0)',    to:   'var(--ok)',     stroke: 'rgba(12,140,96,0.8)',    shade: 'rgba(0,0,0,0.08)' },
  info:   { from: 'color-mix(in srgb, var(--info) 100%, #93c5fd)',  to:   'var(--info)',   stroke: 'rgba(30,86,170,0.8)',    shade: 'rgba(0,0,0,0.08)' },
  purple: { from: 'color-mix(in srgb, var(--purple) 100%, #e9d5ff)',to:   'var(--purple)', stroke: 'rgba(124,58,237,0.8)',   shade: 'rgba(0,0,0,0.08)' },
  warn:   { from: 'color-mix(in srgb, var(--warn) 100%, #fed7aa)',  to:   'var(--warn)',   stroke: 'rgba(194,87,16,0.8)',   shade: 'rgba(0,0,0,0.08)' },
  danger: { from: 'color-mix(in srgb, var(--danger) 100%, #fecaca)',to:   'var(--danger)', stroke: 'rgba(185,28,28,0.8)',    shade: 'rgba(0,0,0,0.08)' }
};

export default function StackedBarChart({
  data = [],
  series = [],
  title = '各渠道月度营业额（近 6 月）'
}) {
  const [hoverIdx, setHoverIdx] = useState(null);
  // useMemo 必须在 early return 之前调用，遵守 Hook 规则
  const totals = useMemo(
    () => data.map(d => series.reduce((s, sr) => s + (d[sr.name] || 0), 0)),
    [data, series]
  );
  if (!data.length || !series.length) return null;

  const W = 900, H = 310;
  const PAD = { L: 56, R: 20, T: 20, B: 40 };
  const chartW = W - PAD.L - PAD.R;
  const chartH = H - PAD.T - PAD.B;
  const maxV = Math.max(...totals);
  const xStep = chartW / data.length;
  const barW = xStep * 0.58;

  const mapY = v => PAD.T + chartH - (v / maxV) * chartH;
  const baseY = mapY(0);

  return (
    <div className='card-base card-solid p-5 space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h3 className='text-base font-bold text-[var(--text-primary)]'>{title}</h3>
        <div className='flex flex-wrap items-center gap-3 text-xs'>
          {series.map(sr => {
            const st = STACK_STYLES[sr.color] || STACK_STYLES.brand;
            return (
              <span key={sr.name} className='flex items-center gap-1.5'>
                <span
                  className='inline-block w-3.5 h-3.5 rounded-md border shadow-sm'
                  style={{
                    background: `linear-gradient(180deg, ${st.from}, ${st.to})`,
                    borderColor: st.stroke
                  }}
                />
                <span className='text-[var(--text-primary)] font-semibold'>{sr.name}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className='relative w-full' style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='xMidYMid meet' width='100%' height='100%' className='overflow-visible'>
          <defs>
            {series.map(sr => {
              const st = STACK_STYLES[sr.color] || STACK_STYLES.brand;
              return (
                <linearGradient key={`sbg-${sr.name}`} id={`sbg-${sr.name}`} x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%'  stopColor={st.from} stopOpacity='1' />
                  <stop offset='60%' stopColor={st.to}   stopOpacity='0.98' />
                  <stop offset='100%' stopColor={st.to}  stopOpacity='0.85' />
                </linearGradient>
              );
            })}
          </defs>

          {/* 水平网格 */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = mapY(maxV * r);
            return (
              <g key={i}>
                <line
                  x1={PAD.L} x2={W - PAD.R} y1={y} y2={y}
                  stroke={COLOR_MAP.border} strokeDasharray='4 4' strokeOpacity={r === 0 ? 0 : 0.7}
                />
                <text x={PAD.L - 10} y={y + 3.5} textAnchor='end'
                      fontSize='11' fill={COLOR_MAP.muted}>{Math.round(maxV * r)}</text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const xC = PAD.L + xStep * (i + 0.5);
            let cumY = baseY;
            const isHover = hoverIdx === i;
            const dim = hoverIdx !== null && !isHover;
            return (
              <g
                key={d.month}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: 'pointer', opacity: dim ? 0.45 : 1, transition: 'opacity 0.2s' }}
              >
                <rect x={xC - xStep / 2} y={PAD.T} width={xStep} height={chartH} fill='transparent' />
                {series.map((sr, j) => {
                  const v = d[sr.name] || 0;
                  const hPx = (v / maxV) * chartH;
                  const topY = cumY - hPx; // 累计堆叠（关键：用 cumY 而不是 baseY 作为起点，每段独立正确高度）
                  cumY = topY;
                  const isLast = j === series.length - 1;
                  const st = STACK_STYLES[sr.color] || STACK_STYLES.brand;
                  return (
                    <g key={sr.name}>
                      {/* 主体柱子：每段独立高度，从 cumY 开始，不叠加重叠 */}
                      <rect
                        x={xC - barW / 2}
                        y={topY}
                        width={isHover ? barW + 3 : barW}
                        height={Math.max(0, hPx)}
                        fill={`url(#sbg-${sr.name})`}
                        stroke={st.stroke}
                        strokeWidth={isHover ? 1.8 : 1}
                        rx={isLast ? 6 : 0}
                        ry={isLast ? 6 : 0}
                        style={{ transition: 'all 0.2s', transformOrigin: `${xC}px ${baseY}px` }}
                      />
                      {/* 顶部高光（仅当 h>8 时渲染，避免 0 高度 artifact） */}
                      {hPx > 8 && (
                        <rect
                          x={xC - barW / 2 + 2}
                          y={topY + 1.2}
                          width={(isHover ? barW + 3 : barW) - 4}
                          height={Math.min(2.5, hPx * 0.18)}
                          fill='#ffffff'
                          opacity='0.45'
                          rx='1'
                        />
                      )}
                    </g>
                  );
                })}
                {/* 顶部合计 */}
                <text x={xC} y={mapY(totals[i]) - 8} textAnchor='middle'
                      fontSize='12' fontWeight='800'
                      fill={isHover ? 'var(--brand)' : 'var(--text-primary)'}>
                  {totals[i].toFixed(1)}
                </text>
                {/* 月份 */}
                <text x={xC} y={H - PAD.B + 20} textAnchor='middle'
                      fontSize='12' fill={isHover ? 'var(--brand)' : COLOR_MAP.muted}
                      fontWeight={isHover ? '800' : '600'}>{d.month}</text>
              </g>
            );
          })}

          <line x1={PAD.L} x2={W - PAD.R} y1={baseY} y2={baseY} stroke={COLOR_MAP.border} strokeWidth='1.2' />
        </svg>

        {hoverIdx !== null && (() => {
          const d = data[hoverIdx];
          const total = totals[hoverIdx];
          const xC = (PAD.L + xStep * (hoverIdx + 0.5)) / W * 100;
          return (
            <div
              className='absolute -translate-x-1/2 z-10 top-2 rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] shadow-lg px-3.5 py-2.5 text-xs space-y-1.5 min-w-[210px] pointer-events-none backdrop-blur-sm'
              style={{ left: `${xC}%` }}
            >
              <div className='flex items-center justify-between'>
                <span className='font-bold text-[var(--text-primary)] text-sm'>{d.month} 明细</span>
                <span className='font-black text-[var(--brand)] tabular-nums text-sm'>¥ {total.toFixed(1)}万</span>
              </div>
              <div className='h-px bg-[var(--border)] my-0.5' />
              {series.map(sr => {
                const v = d[sr.name] || 0;
                const pct = total ? (v / total * 100).toFixed(1) : '0.0';
                const st = STACK_STYLES[sr.color] || STACK_STYLES.brand;
                return (
                  <div key={sr.name} className='flex items-center justify-between gap-2'>
                    <span className='flex items-center gap-1.5 text-[var(--text-primary)] min-w-[88px] font-medium'>
                      <span
                        className='w-3 h-3 rounded-md border shadow-sm inline-block'
                        style={{ background: `linear-gradient(180deg, ${st.from}, ${st.to})`, borderColor: st.stroke }}
                      />
                      {sr.name}
                    </span>
                    <span className='flex items-baseline gap-2'>
                      <span className='font-semibold text-[var(--text-primary)] tabular-nums'>¥{v.toFixed(1)}万</span>
                      <span className='text-[var(--text-muted)] font-medium'>{pct}%</span>
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
