/**
 * DetailDrawer 内嵌的应急流程图 + 联系人 + 模拟演练开关
 * @param {Object} props
 * @param {Object} props.plan
 * @param {Map<string, boolean>} props.doneMap - 步骤勾选状态，key=`${planId}:${stepId}`
 * @param {(stepId:string, done:boolean)=>void} props.toggleStep
 * @param {boolean} props.drillModeOn - 模拟演练模式开关状态
 * @param {(on:boolean)=>void} props.setDrillModeOn
 */
import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, Phone, User } from 'lucide-react'
import StatusPill from './StatusPill.jsx'

const SEVERITY_BADGE = {
  high: { variant: 'danger', label: '高危', textColor: 'var(--danger)' },
  medium: { variant: 'warn', label: '中危', textColor: 'var(--warn)' },
  low: { variant: 'info', label: '低危', textColor: 'var(--info)' }
}

const STEP_GAP = 80
const STEP_RADIUS = 22
const SVG_WIDTH = 800

export default function EmergencyFlow({ plan, doneMap, toggleStep, drillModeOn, setDrillModeOn }) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const steps = plan.steps || []
  const totalSteps = steps.length
  const badge = SEVERITY_BADGE[plan.severity] || SEVERITY_BADGE.low

  const firstUndoneIdx = steps.findIndex(
    (s) => !doneMap.get(`${plan.id}:${s.id}`)
  )

  const doneCount = steps.filter((s) => doneMap.get(`${plan.id}:${s.id}`)).length
  const allDone = doneCount === totalSteps && totalSteps > 0
  const drillMinutes = steps.reduce(
    (sum, s) => sum + (doneMap.get(`${plan.id}:${s.id}`) ? (s.expectedMinutes || 0) : 0),
    0
  )

  useEffect(() => {
    setElapsedMinutes(0)
    if (!drillModeOn) return
    const t = setInterval(() => {
      setElapsedMinutes((v) => Math.min(v + 0.5, plan.slaMinutes * 2))
    }, 3000)
    return () => clearInterval(t)
  }, [drillModeOn, plan.slaMinutes])

  const svgHeight = Math.max(totalSteps * STEP_GAP + 40, 320)
  const slaProgress = Math.min(100, (elapsedMinutes / Math.max(plan.slaMinutes, 1)) * 100)

  return (
    <div className="flex flex-col gap-6">
      <section className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-muted)' }}>
        <div className="flex items-center gap-3 mb-3">
          <StatusPill variant={badge.variant}>
            <span className="font-bold">{badge.label}</span>
          </StatusPill>
          <span
            className="text-sm font-semibold"
            style={{ color: badge.textColor }}
          >
            须 {plan.slaMinutes} 分钟内启动
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${slaProgress}%`,
              background: 'linear-gradient(90deg, var(--brand), var(--accent-hover))'
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-[var(--text-muted)]">
          <span>已模拟 {elapsedMinutes.toFixed(1)} 分钟</span>
          <span>SLA {plan.slaMinutes} 分钟</span>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            🔀 步骤流程图
          </h3>
          {drillModeOn && (
            <span className="text-xs text-[var(--text-muted)]">点击节点标记完成</span>
          )}
        </div>

        <div
          className="rounded-xl p-2"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
        >
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
            width="100%"
            role="img"
            aria-label="应急预案流程图"
            style={{ display: 'block' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--border)" />
              </marker>
              <marker
                id="arrowhead-ok"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--ok)" />
              </marker>
            </defs>

            {steps.map((step, idx) => {
              if (idx === 0) return null
              const prevDone = doneMap.get(`${plan.id}:${steps[idx - 1].id}`)
              const y1 = (idx - 1) * STEP_GAP + 40
              const y2 = idx * STEP_GAP + 40
              const lineColor = prevDone ? 'var(--ok)' : 'var(--border)'
              const marker = prevDone ? 'url(#arrowhead-ok)' : 'url(#arrowhead)'
              return (
                <line
                  key={`line-${step.id}`}
                  x1={SVG_WIDTH / 2}
                  y1={y1 + STEP_RADIUS}
                  x2={SVG_WIDTH / 2}
                  y2={y2 - STEP_RADIUS}
                  stroke={lineColor}
                  strokeWidth={3}
                  markerEnd={marker}
                />
              )
            })}

            {steps.map((step, idx) => {
              const cx = SVG_WIDTH / 2
              const cy = idx * STEP_GAP + 40
              const key = `${plan.id}:${step.id}`
              const isDone = doneMap.get(key)
              const isCurrent = idx === firstUndoneIdx && drillModeOn
              let fill = 'var(--surface)'
              let stroke = 'var(--border)'
              if (isDone) {
                fill = 'var(--ok)'
                stroke = 'var(--ok)'
              } else if (isCurrent) {
                fill = 'rgba(212, 175, 55, 0.15)'
                stroke = 'var(--brand)'
              }
              const clickable = drillModeOn
              return (
                <g key={`node-${step.id}`}>
                  {isCurrent && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={STEP_RADIUS + 6}
                      fill="none"
                      stroke="var(--brand)"
                      strokeWidth={2}
                      opacity={0.5}
                    >
                      <animate
                        attributeName="r"
                        values={`${STEP_RADIUS + 4};${STEP_RADIUS + 10};${STEP_RADIUS + 4}`}
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;0.15;0.6"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={STEP_RADIUS}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={2.5}
                    style={{
                      cursor: clickable ? 'pointer' : 'default',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => {
                      if (clickable) toggleStep(step.id, !isDone)
                    }}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : -1}
                    aria-label={`步骤 ${idx + 1}：${step.action}${isDone ? '，已完成' : ''}`}
                    onKeyDown={(e) => {
                      if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        toggleStep(step.id, !isDone)
                      }
                    }}
                  />
                  {isDone && (
                    <g transform={`translate(${cx - 10}, ${cy - 10})`}>
                      <CheckCircle2
                        width={20}
                        height={20}
                        color="#ffffff"
                        aria-hidden="true"
                      />
                    </g>
                  )}
                  {!isDone && (
                    <text
                      x={cx}
                      y={cy + 5}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="700"
                      fill={isCurrent ? 'var(--brand)' : 'var(--text-muted)'}
                      pointerEvents="none"
                    >
                      {idx + 1}
                    </text>
                  )}

                  <g pointerEvents="none">
                    <text
                      x={80}
                      y={cy - 4}
                      fontSize="14"
                      fontWeight="700"
                      fill="var(--text-primary)"
                      textAnchor="start"
                    >
                      Step {idx + 1}
                    </text>
                    <text
                      x={80}
                      y={cy + 12}
                      fontSize="11"
                      fill="var(--text-muted)"
                      textAnchor="start"
                    >
                      {step.id}
                    </text>
                  </g>

                  <g pointerEvents="none" transform={`translate(450, ${cy - 28})`}>
                    <foreignObject width="320" height="64">
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          padding: '2px 4px'
                        }}
                      >
                        <div>
                          <span
                            className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border"
                            style={{
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              borderColor: 'rgba(59, 130, 246, 0.3)',
                              color: 'var(--info)'
                            }}
                          >
                            {step.role}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            lineHeight: 1.4,
                            color: 'var(--text-primary)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {step.action}
                        </p>
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Clock width={11} height={11} aria-hidden="true" />
                          预计耗时 {step.expectedMinutes} 分钟
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                </g>
              )
            })}
          </svg>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          📇 联系人表格
        </h3>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-muted)' }}>
                <th
                  scope="col"
                  className="text-left px-3 py-2 text-xs font-medium text-[var(--text-muted)]"
                >
                  职位
                </th>
                <th
                  scope="col"
                  className="text-left px-3 py-2 text-xs font-medium text-[var(--text-muted)]"
                >
                  姓名
                </th>
                <th
                  scope="col"
                  className="text-left px-3 py-2 text-xs font-medium text-[var(--text-muted)]"
                >
                  电话
                </th>
                <th
                  scope="col"
                  className="text-left px-3 py-2 text-xs font-medium text-[var(--text-muted)]"
                >
                  备用电话
                </th>
              </tr>
            </thead>
            <tbody>
              {(plan.contacts || []).map((c, i) => (
                <tr
                  key={c.name + i}
                  style={{ borderBottom: i < (plan.contacts?.length || 0) - 1 ? '1px solid var(--border)' : undefined }}
                >
                  <td className="px-3 py-2.5 text-[var(--text-secondary)]">{c.position}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)]">
                      <User width={14} height={14} className="text-[var(--text-muted)]" aria-hidden="true" />
                      {c.name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {c.phone ? (
                      <a
                        href={`tel:${c.phone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1.5 hover:underline"
                        style={{ color: 'var(--brand)', textDecorationColor: 'var(--brand)' }}
                        aria-label={`拨打 ${c.name} 电话 ${c.phone}`}
                      >
                        <Phone width={14} height={14} aria-hidden="true" />
                        {c.phone}
                      </a>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {c.backupPhone ? (
                      <a
                        href={`tel:${c.backupPhone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1.5 hover:underline"
                        style={{ color: 'var(--brand)', textDecorationColor: 'var(--brand)' }}
                        aria-label={`拨打 ${c.name} 备用电话 ${c.backupPhone}`}
                      >
                        <Phone width={14} height={14} aria-hidden="true" />
                        {c.backupPhone}
                      </a>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!plan.contacts || plan.contacts.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-[var(--text-muted)] text-sm">
                    暂无联系人
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="p-4 rounded-xl"
        style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            🎮 模拟演练模式
          </h3>
          <label
            className="relative inline-flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              className="sr-only peer"
              checked={drillModeOn}
              onChange={(e) => setDrillModeOn(e.target.checked)}
              aria-label="开启模拟演练模式"
            />
            <div
              className="w-11 h-6 rounded-full peer transition-all duration-200"
              style={{
                backgroundColor: drillModeOn ? 'var(--brand)' : 'var(--bg-primary)',
                border: '1px solid var(--border)'
              }}
            />
            <div
              className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full transition-all duration-200 shadow"
              style={{
                backgroundColor: '#ffffff',
                transform: drillModeOn ? 'translateX(20px)' : 'translateX(0)'
              }}
            />
          </label>
        </div>

        {drillModeOn && (
          <p className="text-sm mb-3" style={{ color: 'var(--brand)' }}>
            演练模式激活 · 可逐步勾选流程节点
          </p>
        )}

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[var(--text-muted)]">演练进度</span>
            <StatusPill variant="ok">
              {doneCount} / {totalSteps}
            </StatusPill>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-400"
              style={{
                width: `${totalSteps ? (doneCount / totalSteps) * 100 : 0}%`,
                backgroundColor: 'var(--ok)'
              }}
            />
          </div>
        </div>

        {allDone && (
          <div
            className="mt-3 p-4 rounded-xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(255,215,0,0.15))',
              border: '1px solid var(--brand)'
            }}
          >
            <div className="text-2xl mb-1">🎉</div>
            <div
              className="font-bold text-lg"
              style={{ color: 'var(--brand)' }}
            >
              演练通过！
            </div>
            <div className="text-sm mt-1 text-[var(--text-secondary)]">
              累计耗时 {drillMinutes.toFixed(1)} 分钟
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
