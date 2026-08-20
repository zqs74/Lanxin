import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function TrendLineChart({ trend7, trend30, granularity, onGranularityChange }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const data = granularity === '7d' ? trend7 : trend30;
  const n = data.length;
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  const step = 720 / (n - 1);
  const getX = (i) => 40 + i * step;
  const getY = (value) => 210 - (value / maxValue) * 180;

  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.value)
  }));

  const areaPath =
    `M ${points[0].x} 210 ` +
    points.map((p) => `L ${p.x} ${p.y}`).join(' ') +
    ` L ${points[n - 1].x} 210 Z`;

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  const yTicks = [
    { y: 210, value: 0 },
    { y: 120, value: Math.round(maxValue / 2) },
    { y: 66, value: Math.round(maxValue * 0.8) }
  ];

  let xTicks;
  if (granularity === '7d') {
    xTicks = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
      x: 40 + i * 120,
      label: `D${i + 1}`
    }));
  } else {
    xTicks = [
      { x: 40, label: 'D1' },
      { x: 220, label: 'D7' },
      { x: 400, label: 'D14' },
      { x: 580, label: 'D21' },
      { x: 760, label: 'D30' }
    ];
  }

  const sum = data.reduce((acc, d) => acc + d.value, 0);
  const avg = sum / n;
  const overallPct = ((data[n - 1].value - data[0].value) / data[0].value) * 100;

  const hoveredData = hoveredIdx !== null ? data[hoveredIdx] : null;
  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  const dotR = granularity === '7d' ? 4 : 2;

  return (
    <div className='card-base card-solid p-4 space-y-3'>
      <div className='flex justify-between items-center'>
        <span className='text-base font-bold text-[var(--text-primary)]'>📈 播放趋势</span>
        <div className='inline-flex rounded-lg border border-[var(--border)] overflow-hidden'>
          <button
            type='button'
            onClick={() => onGranularityChange('7d')}
            className={
              'px-3 py-1.5 text-xs font-medium transition-colors ' +
              (granularity === '7d'
                ? 'bg-[var(--brand)] text-[var(--text-inverse)]'
                : 'bg-[var(--surface-muted)] text-[var(--text-muted)]')
            }
          >
            近7天
          </button>
          <button
            type='button'
            onClick={() => onGranularityChange('30d')}
            className={
              'px-3 py-1.5 text-xs font-medium transition-colors ' +
              (granularity === '30d'
                ? 'bg-[var(--brand)] text-[var(--text-inverse)]'
                : 'bg-[var(--surface-muted)] text-[var(--text-muted)]')
            }
          >
            近30天
          </button>
        </div>
      </div>

      <div className='relative w-full' style={{ aspectRatio: '800 / 240' }}>
        <svg
          viewBox='0 0 800 240'
          preserveAspectRatio='xMidYMid meet'
          width='100%'
          height='100%'
          className='overflow-visible'
        >
          <defs>
            <linearGradient id='trendAreaGrad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='var(--brand)' stopOpacity='0.35' />
              <stop offset='100%' stopColor='var(--brand)' stopOpacity='0' />
            </linearGradient>
          </defs>

          {yTicks.map((t, i) => (
            <line
              key={`grid-${i}`}
              x1='40'
              y1={t.y}
              x2='760'
              y2={t.y}
              stroke='var(--border)'
              strokeDasharray='4 4'
              strokeWidth='1'
            />
          ))}

          {yTicks.map((t, i) => (
            <text
              key={`y-${i}`}
              x='38'
              y={t.y + 3}
              textAnchor='end'
              fontSize='10'
              fill='var(--text-muted)'
            >
              {t.value}
            </text>
          ))}

          {xTicks.map((t, i) => (
            <text
              key={`x-${i}`}
              x={t.x}
              y='222'
              textAnchor='middle'
              fontSize='10'
              fill='var(--text-muted)'
            >
              {t.label}
            </text>
          ))}

          <path d={areaPath} fill='url(#trendAreaGrad)' />

          <polyline
            points={polylinePoints}
            stroke='var(--brand)'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
            fill='none'
          />

          {points.map((p, i) => (
            <circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={dotR}
              fill='var(--brand)'
              stroke='var(--surface)'
              strokeWidth='2'
            />
          ))}

          {points.length > 0 && (
            <>
              <circle
                cx={points[n - 1].x}
                cy={points[n - 1].y}
                r='6'
                fill='none'
                stroke='var(--brand)'
                strokeOpacity='0.5'
                style={{
                  transformOrigin: `${points[n - 1].x}px ${points[n - 1].y}px`,
                  animation: 'pulse-ring 1.5s ease-in-out infinite'
                }}
              />
              <circle
                cx={points[n - 1].x}
                cy={points[n - 1].y}
                r='6'
                fill='none'
                stroke='var(--brand)'
                strokeOpacity='0.5'
                style={{
                  transformOrigin: `${points[n - 1].x}px ${points[n - 1].y}px`,
                  animation: 'pulse-ring 1.5s ease-in-out infinite',
                  animationDelay: '0.75s'
                }}
              />
            </>
          )}

          {points.map((p, i) => (
            <rect
              key={`hit-${i}`}
              x={p.x - step / 2}
              y={p.y - 20}
              width={step}
              height='40'
              fill='transparent'
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </svg>

        {hoveredData && hoveredPoint && (
          <div
            className='absolute bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none z-10'
            style={{
              left: `${(hoveredPoint.x / 800) * 100}%`,
              top: `${(hoveredPoint.y / 240) * 100 - 25}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className='font-medium text-[var(--text-primary)] mb-1'>
              Day {hoveredData.day}
            </div>
            <div className='text-[var(--text-muted)]'>
              播放量：{hoveredData.value} 万次
            </div>
            <div className='text-[var(--ok)]'>
              环比：↑ {hoveredData.pct}%
            </div>
          </div>
        )}
      </div>

      <div className='flex justify-between text-xs text-[var(--text-muted)] pt-1 mt-1 border-t border-dashed border-[var(--border)]'>
        <span>总播放量 {sum.toFixed(1)} 万次</span>
        <span>日均 {avg.toFixed(1)} 万次</span>
        <span className='text-[var(--ok)]'>
          整体环比 ↑{overallPct.toFixed(1)}%
        </span>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% {
            opacity: 0.5;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(2);
          }
        }
      `}</style>
    </div>
  );
}

TrendLineChart.propTypes = {
  trend7: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.number,
      value: PropTypes.number,
      pct: PropTypes.number
    })
  ),
  trend30: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.number,
      value: PropTypes.number,
      pct: PropTypes.number
    })
  ),
  granularity: PropTypes.oneOf(['7d', '30d']),
  onGranularityChange: PropTypes.func
};
