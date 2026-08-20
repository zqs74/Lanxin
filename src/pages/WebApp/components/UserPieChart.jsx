import React, { useState } from 'react';
import PropTypes from 'prop-types';

const COLOR_MAP = {
  brand: 'var(--brand)',
  info: 'var(--info)',
  ok: 'var(--ok)',
  purple: 'var(--purple)',
  warn: 'var(--warn)'
};

const RADIUS = 80;

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad)
  };
}

function describeArc(startAngle, endAngle, r) {
  const end = polarToCartesian(0, 0, r, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M 0 -${r} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} L 0 0 Z`;
}

export default function UserPieChart({ demographics, totalFans = '12.4万' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const segments = demographics.reduce((acc, d, i) => {
    const startAngle = i === 0 ? 0 : acc[i - 1].endAngle;
    const sweep = (d.pct / 100) * 360;
    const endAngle = startAngle + sweep;
    const midAngle = startAngle + sweep / 2;
    const offsetDir = polarToCartesian(0, 0, 6, midAngle);
    acc.push({
      ...d,
      startAngle,
      endAngle,
      midAngle,
      offsetX: offsetDir.x,
      offsetY: offsetDir.y
    });
    return acc;
  }, []);

  const hoveredData = hoveredIdx !== null ? demographics[hoveredIdx] : null;
  const hoveredSegment = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div className='card-base card-solid p-4'>
      <div className='flex justify-between items-center mb-4'>
        <span className='text-base font-bold text-[var(--text-primary)]'>
          👥 用户构成
        </span>
        <span className='text-xs text-[var(--text-muted)]'>5 类粉丝画像</span>
      </div>

      <div className='flex items-center gap-4'>
        <div className='relative flex-shrink-0 w-[140px] h-[140px]'>
          <svg viewBox='-100 -100 200 200' className='w-full h-full overflow-visible'>
            {segments.map((seg, i) => {
              const isHovered = hoveredIdx === i;
              const pathD = describeArc(seg.startAngle, seg.endAngle, RADIUS);
              const transform = isHovered
                ? `translate(${seg.offsetX}px, ${seg.offsetY}px) scale(1.04)`
                : 'translate(0, 0) scale(1)';
              return (
                <path
                  key={i}
                  d={pathD}
                  fill={COLOR_MAP[seg.color]}
                  stroke={isHovered ? 'var(--text-primary)' : 'var(--surface)'}
                  strokeWidth={isHovered ? 2 : 1}
                  transform={transform}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                />
              );
            })}
          </svg>

          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none'>
            {hoveredData && hoveredSegment ? (
              <>
                <div
                  className='text-base font-bold'
                  style={{ color: COLOR_MAP[hoveredSegment.color] }}
                >
                  {hoveredData.name}
                </div>
                <div className='text-xl font-bold text-[var(--text-primary)]'>
                  {hoveredData.pct}%
                </div>
                <div className='text-[10px] text-[var(--text-muted)] mt-0.5'>
                  总粉丝 {totalFans}
                </div>
              </>
            ) : (
              <>
                <div className='text-xl font-bold text-[var(--brand)]'>
                  {totalFans}
                </div>
                <div className='text-[10px] text-[var(--text-muted)] mt-0.5'>
                  总粉丝
                </div>
              </>
            )}
          </div>
        </div>

        <div className='flex flex-col gap-2.5 flex-1 text-sm'>
          {demographics.map((d, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={i}
                className='flex items-center justify-between gap-2'
                style={{
                  transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  transformOrigin: 'left center'
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className='flex items-center gap-2'>
                  <div
                    className='w-3.5 h-3.5 rounded-sm flex-shrink-0'
                    style={{ backgroundColor: COLOR_MAP[d.color] }}
                  />
                  <span
                    className='font-medium'
                    style={{
                      color: isHovered
                        ? COLOR_MAP[d.color]
                        : 'var(--text-primary)'
                    }}
                  >
                    {d.name}
                  </span>
                </div>
                <div className='flex items-baseline gap-1'>
                  <span
                    className='font-bold tabular-nums'
                    style={{
                      color: isHovered
                        ? COLOR_MAP[d.color]
                        : 'var(--text-primary)'
                    }}
                  >
                    {d.pct}%
                  </span>
                </div>
              </div>
            );
          })}

          <div className='mt-1 pt-2 border-t border-dashed border-[var(--border)] flex justify-between text-xs'>
            <span className='text-[var(--text-muted)]'>合计</span>
            <span className='font-bold text-[var(--text-primary)]'>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

UserPieChart.propTypes = {
  demographics: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      pct: PropTypes.number.isRequired,
      color: PropTypes.oneOf(['brand', 'info', 'ok', 'purple', 'warn']).isRequired
    })
  ).isRequired,
  totalFans: PropTypes.string
};
