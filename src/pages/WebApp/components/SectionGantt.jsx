import React from 'react';
import StatusPill from './StatusPill.jsx';

/**
 * 赛事阶段甘特图组件 + 每日场次趋势折线
 * @param {Object} props
 * @param {{id:string,name:string,stages:Array<{id:string,name:string,startDay:number,endDay:number,status:string}>}} props.tournament - 当前赛事对象
 * @param {Array<Object>} props.matches - 当前赛事的全部比赛，用于统计每日场次
 */
export default function SectionGantt({ tournament, matches }) {
  const dayTicks = [1, 5, 10, 15, 20, 25, 30];

  const matchCounts = Array(31).fill(0);
  matches.forEach((m) => {
    if (m.date >= 1 && m.date <= 30) {
      matchCounts[m.date] += 1;
    }
  });
  const maxCount = Math.max(1, ...matchCounts.slice(1));

  const polylinePoints = [];
  const circlePoints = [];
  for (let i = 1; i <= 30; i++) {
    const x = ((i - 1) * 1000) / 29;
    const y = 80 - (matchCounts[i] / maxCount) * 60;
    polylinePoints.push(`${x},${y}`);
    circlePoints.push({ x, y });
  }

  const getStageBarStyle = (stage) => {
    const left = ((stage.startDay - 1) / 30) * 100;
    const width = ((stage.endDay - stage.startDay + 1) / 30) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  const renderStageBar = (stage) => {
    const baseClasses =
      'absolute rounded-md flex items-center justify-center text-xs font-medium truncate px-2 overflow-hidden';
    const positionStyle = getStageBarStyle(stage);
    const topStyle = { top: '50%', transform: 'translateY(-50%)', height: '24px' };

    if (stage.status === 'pending') {
      return (
        <div
          key={stage.id}
          className={`${baseClasses}`}
          style={{
            ...positionStyle,
            ...topStyle,
            backgroundColor: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)'
          }}
          title={stage.name}
        >
          {stage.name}
        </div>
      );
    }

    if (stage.status === 'ongoing') {
      return (
        <div
          key={stage.id}
          className={`${baseClasses}`}
          style={{
            ...positionStyle,
            ...topStyle,
            background:
              'linear-gradient(90deg, color-mix(in srgb, var(--brand) 60%, transparent), color-mix(in srgb, var(--brand) 90%, transparent))',
            border: '1px solid var(--brand)',
            color: '#ffffff',
            boxShadow: '0 0 8px color-mix(in srgb, var(--brand) 40%, transparent)'
          }}
          title={stage.name}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.08) 6px, rgba(255,255,255,0.08) 12px)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand)',
              boxShadow: '0 0 6px var(--brand)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
          <span style={{ position: 'relative', zIndex: 1 }}>{stage.name}</span>
        </div>
      );
    }

    if (stage.status === 'done') {
      return (
        <div
          key={stage.id}
          className={`${baseClasses}`}
          style={{
            ...positionStyle,
            ...topStyle,
            backgroundColor: 'color-mix(in srgb, var(--ok) 70%, transparent)',
            border: '1px solid var(--ok)',
            color: '#ffffff'
          }}
          title={stage.name}
        >
          <span className="flex items-center gap-1">
            {stage.name}
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="card-base card-solid p-4 mb-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {tournament.name}
          </h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--border)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              未开始
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--brand) 70%, transparent)',
                border: '1px solid var(--brand)',
                boxShadow: '0 0 4px color-mix(in srgb, var(--brand) 40%, transparent)'
              }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              进行中
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: 'var(--ok)', border: '1px solid var(--ok)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              已结束
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-6 h-0.5"
              style={{ backgroundColor: 'var(--info)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              场次趋势
            </span>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: '140px' }}>
        <div className="flex justify-between px-[90px] mb-2">
          {dayTicks.map((day) => (
            <span
              key={day}
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {day}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-1">
          {tournament.stages.map((stage) => (
            <div key={stage.id} className="flex items-center" style={{ height: '28px' }}>
              <div
                className="text-xs text-right pr-3 flex-shrink-0 truncate"
                style={{ width: '90px', color: 'var(--text-secondary)' }}
                title={stage.name}
              >
                {stage.name}
              </div>
              <div className="flex-1 relative" style={{ width: '100%', height: '28px' }}>
                {renderStageBar(stage)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3" style={{ borderTop: '1px dashed var(--border)' }}>
        <div className="flex justify-between mb-1 px-[90px]">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            每日场次：最大 {maxCount} 场
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            场次/天
          </span>
        </div>
        <div className="flex">
          <div style={{ width: '90px', flexShrink: 0 }} />
          <div className="flex-1 relative">
            <svg
              width="100%"
              height="80"
              viewBox="0 0 1000 80"
              preserveAspectRatio="none"
              style={{ display: 'block' }}
            >
              <line
                x1="0"
                y1="10"
                x2="1000"
                y2="10"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <line
                x1="0"
                y1="45"
                x2="1000"
                y2="45"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <line
                x1="0"
                y1="80"
                x2="1000"
                y2="80"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <polyline
                points={polylinePoints.join(' ')}
                stroke="var(--info)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {circlePoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="2.5"
                  fill="var(--info)"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
