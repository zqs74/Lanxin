import React, { useState } from 'react';

/* ComboBarChart（原生 SVG） *****************************************************************
 * 用途：组合柱 + 折线 + 增长速率点（Tab2 2021-2026 营业额）
 * Props:
 *   data: Array<{ year: string, total: number, product: number, marketing: number, growth: number }>
 *   title: string
 *   accent1/accent2: brand/info/ok/purple/warn（CSS var 映射颜色
 * **********************************************************************************************/
const COLOR_MAP = {
  brand: 'var(--brand)',
  info: 'var(--info)',
  ok: 'var(--ok)',
  purple: 'var(--purple)',
  warn: 'var(--warn)',
  danger: 'var(--danger)',
  surface: 'var(--surface)',
  muted: 'var(--text-muted)',
  border: 'var(--border)'
};

export default function ComboBarChart({
  data = [],
  title = '2021 - 2026 营业额（万元）',
  accent1 = 'brand',
  accent2 = 'info',
  series1Name = '产品销售',
  series2Name = '营销服务',
  lineName = '同比增长率'
}) {
  const [hoverIdx, setHoverIdx] = useState(null);
  if (data.length === 0) return null;

  const W = 900, H = 300;
  const PAD = { L: 52, R: 52, T: 20, B: 34 };
  const chartW = W - PAD.L - PAD.R;
  const chartH = H - PAD.T - PAD.B;
  const c1 = COLOR_MAP[accent1];
  const c2 = COLOR_MAP[accent2];

  const maxBar = Math.max(...data.map(d => d.total));
  const maxLine = Math.max(...data.map(d => d.growth));
  const xStep = chartW / data.length;
  const barW = xStep * 0.46;

  const mapY = (v, max) => PAD.T + chartH - (v / max) * chartH;

  const gridYs = [0, 0.5, 0.8, 1];
  const ticks = gridYs.map(r => maxBar * r);

  return (
    <div className='card-base card-solid p-4 space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-base font-bold text-[var(--text-primary)]'>{title}</h3>
        <div className='flex items-center gap-4 text-xs'>
          <span className='flex items-center gap-1.5'>
            <span className='inline-block w-3 h-3 rounded-sm border shadow-sm' style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--brand) 100%, #ffe08a), var(--brand))', borderColor: 'rgba(180,140,30,0.8)' }} />
            <span className='text-[var(--text-muted)]'>{series1Name}</span>
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='inline-block w-3 h-3 rounded-sm border shadow-sm' style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--info) 100%, #bfdbfe), var(--info))', borderColor: 'rgba(30,86,170,0.85)' }} />
            <span className='text-[var(--text-muted)]'>{series2Name}</span>
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='inline-block w-3 h-[2px]' style={{ background: 'var(--ok)' }} />
            <span className='text-[var(--text-muted)]'>{lineName}</span>
          </span>
        </div>
      </div>

      <div className='relative w-full' style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='xMidYMid meet' width='100%' height='100%' className='overflow-visible'>
          <defs>
            <linearGradient id='comboBarGrad1' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='color-mix(in srgb, var(--brand) 100%, #ffe08a)' stopOpacity='1' />
              <stop offset='100%' stopColor='var(--brand)' stopOpacity='1' />
            </linearGradient>
            <linearGradient id='comboBarGrad2' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='color-mix(in srgb, var(--info) 100%, #bfdbfe)' stopOpacity='1' />
              <stop offset='100%' stopColor='var(--info)' stopOpacity='1' />
            </linearGradient>
          </defs>

          {/* 网格线 */}
          {ticks.map((t, i) => {
            const y = mapY(t, maxBar);
            return (
              <g key={i}>
                <line x1={PAD.L} x2={W - PAD.R} y1={y} y2={y}
                      stroke={COLOR_MAP.border} strokeDasharray='4 4' strokeWidth='1' />
                <text x={PAD.L - 8} y={y + 3.5} textAnchor='end'
                      fontSize='10' fill={COLOR_MAP.muted}>{Math.round(t)}</text>
              </g>
            );
          })}
          {/* 右 Y 轴 增长% 刻度 */}
          {[0, 0.5, 1].map((r, i) => {
            const y = mapY(maxBar * r, maxBar);
            return (
              <text key={i} x={W - PAD.R + 8} y={y + 3.5} textAnchor='start'
                    fontSize='10' fill={COLOR_MAP.muted}>{(maxLine * r).toFixed(0)}%</text>
            );
          })}

          {/* 柱子 */}
          {data.map((d, i) => {
            const xCenter = PAD.L + xStep * (i + 0.5);
            const hProduct = (d.product / d.total) * chartH * (d.total / maxBar);
            const yProduct = PAD.T + chartH - hProduct;
            const hMarket = (d.marketing / d.total) * chartH * (d.total / maxBar);
            const yMarket = yProduct - hMarket;
            const isHover = hoverIdx === i;
            const hoverBarW = isHover ? barW + 2 : barW;
            const stroke1 = 'rgba(180,140,30,0.85)';
            const stroke2 = 'rgba(30,86,170,0.9)';
            return (
              <g key={d.year}
                 onMouseEnter={() => setHoverIdx(i)}
                 onMouseLeave={() => setHoverIdx(null)}>
                {/* 背景透明 hit rect */}
                <rect x={xCenter - xStep / 2} y={PAD.T} width={xStep} height={chartH}
                      fill='transparent' />
                {/* 产品销售（下，金色渐变，平底） */}
                <rect x={xCenter - hoverBarW / 2} y={yProduct} width={hoverBarW} height={hProduct}
                      fill='url(#comboBarGrad1)' rx='2' stroke={stroke1} strokeWidth={isHover ? 1.6 : 0.8} />
                {/* 营销服务（上，蓝色渐变，顶部圆角） */}
                <rect x={xCenter - hoverBarW / 2} y={yMarket} width={hoverBarW} height={hMarket}
                      fill='url(#comboBarGrad2)' rx='5' ry='5' stroke={stroke2} strokeWidth={isHover ? 1.6 : 0.8} />
                {/* X 轴标签 */}
                <text x={xCenter} y={H - PAD.B + 18} textAnchor='middle'
                      fontSize='11' fill={isHover ? c1 : COLOR_MAP.muted}
                      fontWeight={isHover ? '700' : '500'}>{d.year}</text>
                {/* 柱子顶部 total 数字 */}
                <text x={xCenter} y={yMarket - 6} textAnchor='middle'
                      fontSize='10.5' fontWeight='700' fill={isHover ? c1 : 'var(--text-primary)'}>
                  {d.total.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* 增长速率 折线 */}
          <polyline
            fill='none'
            stroke='var(--ok)'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            points={data.map((d, i) => {
              const x = PAD.L + xStep * (i + 0.5);
              const y = mapY(d.growth / maxLine * maxBar, maxBar);
              return `${x},${y}`;
            }).join(' ')}
          />
          {data.map((d, i) => {
            const x = PAD.L + xStep * (i + 0.5);
            const y = mapY(d.growth / maxLine * maxBar, maxBar);
            const isHover = hoverIdx === i;
            return (
              <g key={`pt-${i}`}>
                <circle cx={x} cy={y} r={isHover ? 6 : 4} fill='var(--ok)'
                        stroke='var(--surface)' strokeWidth='2' />
              </g>
            );
          })}

          {/* 底部基线 */}
          <line x1={PAD.L} x2={W - PAD.R}
                y1={PAD.T + chartH} y2={PAD.T + chartH}
                stroke={COLOR_MAP.border} strokeWidth='1.2' />
        </svg>

        {/* Tooltip */}
        {hoverIdx !== null && (() => {
          const d = data[hoverIdx];
          const xCenter = (PAD.L + xStep * (hoverIdx + 0.5)) / W * 100;
          return (
            <div className='absolute -translate-x-1/2 pointer-events-none z-10 top-4 rounded-lg border border-[var(--border)] bg-[var(--card-solid)] shadow-lg px-3 py-2 text-xs space-y-1'
                 style={{ left: `${xCenter}%` }}>
              <div className='font-bold text-[var(--text-primary)] text-sm'>{d.year}</div>
              <div className='flex items-center justify-between gap-6'>
                <span className='text-[var(--text-muted)]'>总营业额</span>
                <span className='font-semibold text-[var(--brand)]'>¥ {d.total.toFixed(1)} 万</span>
              </div>
              <div className='flex items-center justify-between gap-6'>
                <span className='flex items-center gap-1.5 text-[var(--text-muted)]'>
                  <span className='w-2 h-2 rounded-sm' style={{ background: c1 }} />{series1Name}
                </span>
                <span className='font-semibold text-[var(--text-primary)] tabular-nums'>¥ {d.product.toFixed(1)}</span>
              </div>
              <div className='flex items-center justify-between gap-6'>
                <span className='flex items-center gap-1.5 text-[var(--text-muted)]'>
                  <span className='w-2 h-2 rounded-sm' style={{ background: c2 }} />{series2Name}
                </span>
                <span className='font-semibold text-[var(--text-primary)] tabular-nums'>¥ {d.marketing.toFixed(1)}</span>
              </div>
              <div className='flex items-center justify-between gap-6 pt-0.5 border-t border-dashed border-[var(--border)]'>
                <span className='text-[var(--text-muted)]'>同比增长</span>
                <span className='font-semibold text-[var(--ok)]'>↑ {d.growth.toFixed(1)}%</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
