const GRID_LEVELS = [20, 40, 60, 80, 100]

function pointFor(value, index, total, radius) {
  const angle = (-Math.PI / 2) + ((Math.PI * 2) / total) * index
  const r = (value / 100) * radius
  return {
    x: 160 + Math.cos(angle) * r,
    y: 160 + Math.sin(angle) * r,
  }
}

export default function SkillRadarChart({ data = [] }) {
  if (!data.length) return null

  const radius = 112
  const total = data.length

  const polygon = data
    .map((item, index) => {
      const point = pointFor(item.value, index, total, radius)
      return `${point.x},${point.y}`
    })
    .join(' ')

  return (
    <div className="overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2">
      <div className="relative w-full mx-auto max-w-[300px]" style={{ aspectRatio: '1 / 1' }}>
        <svg viewBox="0 0 320 320" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
          <defs>
            <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.36" />
              <stop offset="100%" stopColor="var(--info)" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {GRID_LEVELS.map((level) => {
            const points = data
              .map((_, index) => {
                const point = pointFor(level, index, total, radius)
                return `${point.x},${point.y}`
              })
              .join(' ')
            return (
              <polygon
                key={level}
                points={points}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray={level === 100 ? '0' : '4 4'}
              />
            )
          })}

          {data.map((item, index) => {
            const edge = pointFor(100, index, total, radius)
            return (
              <g key={item.label}>
                <line
                  x1="160"
                  y1="160"
                  x2={edge.x}
                  y2={edge.y}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
                <text
                  x={edge.x}
                  y={edge.y}
                  textAnchor={edge.x < 150 ? 'end' : edge.x > 170 ? 'start' : 'middle'}
                  dominantBaseline={edge.y < 150 ? 'baseline' : 'hanging'}
                  fontSize="12"
                  fill="var(--text-muted)"
                >
                  {item.label}
                </text>
              </g>
            )
          })}

          <polygon
            points={polygon}
            fill="url(#radarFill)"
            stroke="var(--brand)"
            strokeWidth="2.5"
          />

          {data.map((item, index) => {
            const point = pointFor(item.value, index, total, radius)
            return (
              <g key={`${item.label}-dot`}>
                <circle cx={point.x} cy={point.y} r="5" fill="var(--brand)" />
                <circle cx={point.x} cy={point.y} r="2" fill="white" />
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--border)]">
        {data.map((item) => (
          <div
            key={item.label}
            className="bg-[var(--surface-muted)]/70 px-2 py-1.5"
          >
            <div className="text-[11px] text-[var(--text-muted)]">{item.label}</div>
            <div className="text-sm font-bold tabular-nums text-[var(--text-primary)]">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
