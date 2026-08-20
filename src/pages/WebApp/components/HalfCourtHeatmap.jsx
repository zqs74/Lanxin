const COURT_W = 600
const COURT_H = 420

function projectPoint(x, y) {
  return {
    x: 70 + x * 460,
    y: 40 + (1 - y) * 320,
  }
}

export default function HalfCourtHeatmap({ shots = [] }) {
  return (
    <div className="overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2">
      <div className="relative w-full" style={{ aspectRatio: `${COURT_W} / ${COURT_H}` }}>
        <svg viewBox={`0 0 ${COURT_W} ${COURT_H}`} preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
          <defs>
            <radialGradient id="hotMade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#d4af37" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </radialGradient>
            <radialGradient id="hotMiss" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width={COURT_W} height={COURT_H} rx="28" fill="rgba(255,255,255,0.02)" />
          <rect x="70" y="40" width="460" height="320" rx="24" fill="rgba(255,255,255,0.02)" stroke="var(--border)" strokeWidth="2" />
          <rect x="200" y="40" width="200" height="112" fill="none" stroke="var(--border)" strokeWidth="2" />
          <rect x="250" y="40" width="100" height="56" fill="none" stroke="var(--border)" strokeWidth="2" />
          <circle cx="300" cy="96" r="8" fill="none" stroke="var(--border)" strokeWidth="2" />
          <path d="M 140 40 A 160 160 0 0 0 460 40" fill="none" stroke="var(--border)" strokeWidth="2" />
          <path d="M 120 320 A 180 180 0 0 1 480 320" fill="none" stroke="var(--border)" strokeWidth="2" />
          <line x1="120" y1="320" x2="120" y2="220" stroke="var(--border)" strokeWidth="2" />
          <line x1="480" y1="320" x2="480" y2="220" stroke="var(--border)" strokeWidth="2" />
          <circle cx="300" cy="320" r="60" fill="none" stroke="var(--border)" strokeWidth="2" />

          {shots.map((shot) => {
            const point = projectPoint(shot.x, shot.y)
            return (
              <g key={shot.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={shot.made ? 28 : 20}
                  fill={shot.made ? 'url(#hotMade)' : 'url(#hotMiss)'}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={shot.made ? 4.5 : 3.5}
                  fill={shot.made ? '#ef4444' : '#60a5fa'}
                  opacity="0.95"
                />
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
