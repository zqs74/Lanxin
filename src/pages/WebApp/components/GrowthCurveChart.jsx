export default function GrowthCurveChart({ data = [] }) {
  if (!data.length) return null

  const width = 720
  const height = 240
  const pad = { left: 44, right: 20, top: 20, bottom: 36 }
  const chartW = width - pad.left - pad.right
  const chartH = height - pad.top - pad.bottom
  const maxValue = Math.max(...data.flatMap((item) => [item.efficiency, item.shotQuality]), 100)

  const xAt = (index) => pad.left + (chartW / Math.max(1, data.length - 1)) * index
  const yAt = (value) => pad.top + chartH - (value / maxValue) * chartH

  const efficiencyPoints = data.map((item, index) => `${xAt(index)},${yAt(item.efficiency)}`).join(' ')
  const qualityPoints = data.map((item, index) => `${xAt(index)},${yAt(item.shotQuality)}`).join(' ')

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
      <div className="relative w-full" style={{ aspectRatio: `${width} / ${height}` }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
          {[0, 0.25, 0.5, 0.75, 1].map((step) => {
            const value = Math.round(maxValue * step)
            const y = yAt(value)
            return (
              <g key={step}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={width - pad.right}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                />
                <text
                  x={pad.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--text-muted)"
                >
                  {value}
                </text>
              </g>
            )
          })}

          <polyline
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={efficiencyPoints}
          />
          <polyline
            fill="none"
            stroke="var(--info)"
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="6 4"
            points={qualityPoints}
          />

          {data.map((item, index) => (
            <g key={item.game}>
              <circle cx={xAt(index)} cy={yAt(item.efficiency)} r="4.5" fill="var(--brand)" />
              <circle cx={xAt(index)} cy={yAt(item.shotQuality)} r="4" fill="var(--info)" />
              <text
                x={xAt(index)}
                y={height - 14}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-muted)"
              >
                {item.game}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-1.5 flex flex-wrap gap-4 border-t border-[var(--border)] pt-1.5 text-xs">
        <span className="inline-flex items-center gap-2 text-[var(--text-muted)]">
          <span className="inline-block h-[2px] w-4 bg-[var(--brand)]" />
          效率值
        </span>
        <span className="inline-flex items-center gap-2 text-[var(--text-muted)]">
          <span className="inline-block h-[2px] w-4 bg-[var(--info)]" />
          出手质量
        </span>
      </div>
    </div>
  )
}
