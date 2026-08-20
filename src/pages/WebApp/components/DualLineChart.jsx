import React, { useState } from 'react';

/* DualLineChart（原生 SVG） *******************************************************************
 * 用途：近期增长速率（Tab3、Tab2 15日收益）——两条折线 + 面积渐变，可选双 Y 轴
 * Props:
 *   data: Array<{ day: number, seriesA: number, seriesB: number }>
 *   nameA/nameB: string,
 *   colorA/colorB: brand/info/ok/purple/warn
 *   title: string,
 *   unitA/unitB: string (轴单位)
 ***********************************************************************************************/
const COLOR_MAP = {
  brand: 'var(--brand)', info: 'var(--info)', ok: 'var(--ok)',
  purple: 'var(--purple)', warn: 'var(--warn)', danger: 'var(--danger)',
  surface: 'var(--surface)', muted: 'var(--text-muted)', border: 'var(--border)'
};

export default function DualLineChart({
  data = [],
  nameA = '营业额（万元）',
  nameB = '同比增长率（%）',
  colorA = 'brand',
  colorB = 'ok',
  title = '近期增长速率（近 30 日）',
  unitA = '万',
  unitB = '%',
  dualAxis = true
}) {
  const [hoverIdx, setHoverIdx] = useState(null);
  if (!data.length) return null;

  const W = 900, H = 260;
  const PAD = { L: 56, R: 56, T: 20, B: 32 };
  const chartW = W - PAD.L - PAD.R;
  const chartH = H - PAD.T - PAD.B;
  const cA = COLOR_MAP[colorA], cB = COLOR_MAP[colorB];

  const maxA = Math.max(...data.map(d => d.seriesA));
  const maxB = Math.max(...data.map(d => d.seriesB));
  const step = chartW / (data.length - 1);

  const yA = v => PAD.T + chartH - (v / maxA) * chartH;
  const yB = v => PAD.T + chartH - (v / maxB) * chartH;
  const xAt = i => PAD.L + step * i;

  const areaAPoints = data.map((d, i) => `${xAt(i)},${yA(d.seriesA)}`);
  const areaA = `M ${xAt(0)} ${PAD.T + chartH} L ${areaAPoints.join(' L ')} L ${xAt(data.length - 1)} ${PAD.T + chartH} Z`;

  return (
    <div className='card-base card-solid p-4 space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-base font-bold text-[var(--text-primary)]'>{title}</h3>
        <div className='flex items-center gap-4 text-xs'>
          <span className='flex items-center gap-1.5'>
            <span className='inline-block w-4 h-[2px]' style={{ background: cA }} />
            <span className='text-[var(--text-muted)]'>{nameA}</span>
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='inline-block w-4 h-[2px]' style={{ background: cB }} />
            <span className='text-[var(--text-muted)]'>{nameB}</span>
          </span>
        </div>
      </div>

      <div className='relative w-full' style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='xMidYMid meet' width='100%' height='100%' className='overflow-visible'>
          <defs>
            <linearGradient id='dlgA' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={cA} stopOpacity='0.32' />
              <stop offset='100%' stopColor={cA} stopOpacity='0' />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((r, i) => {
            const y = yA(maxA * r);
            return (
              <g key={i}>
                <line x1={PAD.L} x2={W - PAD.R} y1={y} y2={y} stroke={COLOR_MAP.border} strokeDasharray='4 4' />
                <text x={PAD.L - 8} y={y + 3.5} textAnchor='end' fontSize='10' fill={COLOR_MAP.muted}>
                  {(maxA * r).toFixed(0)}{unitA}
                </text>
                {dualAxis && (
                  <text x={W - PAD.R + 8} y={y + 3.5} textAnchor='start' fontSize='10' fill={COLOR_MAP.muted}>
                    {(maxB * r).toFixed(0)}{unitB}
                  </text>
                )}
              </g>
            );
          })}

          <path d={areaA} fill='url(#dlgA)' />

          <polyline
            fill='none' stroke={cA} strokeWidth='2.8'
            strokeLinecap='round' strokeLinejoin='round'
            points={data.map((d, i) => `${xAt(i)},${yA(d.seriesA)}`).join(' ')} />
          <polyline
            fill='none' stroke={cB} strokeWidth='2.4'
            strokeLinecap='round' strokeLinejoin='round'
            strokeDasharray='6 4'
            points={data.map((d, i) => `${xAt(i)},${yB(d.seriesB)}`).join(' ')} />

          {data.map((d, i) => {
            const isH = hoverIdx === i;
            const sparse = data.length <= 15 || i % Math.ceil(data.length / 10) === 0 || i === data.length - 1;
            return (
              <g key={i}>
                {sparse && (
                  <>
                    <circle cx={xAt(i)} cy={yA(d.seriesA)} r={isH ? 5 : 3} fill={cA} stroke={COLOR_MAP.surface} strokeWidth='2' />
                    <circle cx={xAt(i)} cy={yB(d.seriesB)} r={isH ? 4.5 : 2.6} fill={cB} stroke={COLOR_MAP.surface} strokeWidth='2' />
                  </>
                )}
                <rect x={xAt(i) - step / 2} y={PAD.T} width={step} height={chartH} fill='transparent'
                      onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} />
              </g>
            );
          })}

          {(() => {
            const n = data.length;
            const labelCount = Math.min(6, n);
            const labelIdx = Array.from({ length: labelCount }, (_, i) => Math.round(i * (n - 1) / (labelCount - 1)));
            return labelIdx.map(i => (
              <text key={`xt-${i}`} x={xAt(i)} y={H - PAD.B + 16} textAnchor='middle'
                    fontSize='10.5' fill={hoverIdx === i ? cA : COLOR_MAP.muted}>
                {data[i].label ?? `D${data[i].day}`}
              </text>
            ));
          })()}

          <line x1={PAD.L} x2={W - PAD.R} y1={PAD.T + chartH} y2={PAD.T + chartH} stroke={COLOR_MAP.border} strokeWidth='1.2' />
        </svg>

        {hoverIdx !== null && (() => {
          const d = data[hoverIdx];
          const xC = xAt(hoverIdx) / W * 100;
          return (
            <div className='absolute -translate-x-1/2 z-10 top-2 rounded-lg border border-[var(--border)] bg-[var(--card-solid)] shadow-lg px-3 py-2 text-xs space-y-1 min-w-[170px] pointer-events-none'
                 style={{ left: `${xC}%` }}>
              <div className='font-bold text-[var(--text-primary)] text-sm'>{d.label ?? `第 ${d.day} 天`}</div>
              <div className='flex items-center justify-between gap-3'>
                <span className='flex items-center gap-1.5 text-[var(--text-muted)]'>
                  <span className='w-2.5 h-0.5' style={{ background: cA }} />{nameA}
                </span>
                <span className='font-semibold text-[var(--text-primary)] tabular-nums'>{d.seriesA.toFixed(1)}{unitA}</span>
              </div>
              <div className='flex items-center justify-between gap-3'>
                <span className='flex items-center gap-1.5 text-[var(--text-muted)]'>
                  <span className='w-2.5 h-0.5' style={{ background: cB }} />{nameB}
                </span>
                <span className='font-semibold text-[var(--text-primary)] tabular-nums'>{d.seriesB.toFixed(1)}{unitB}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
