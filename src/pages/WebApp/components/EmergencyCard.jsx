/**
 * 单条预案卡片
 * @param {Object} props
 * @param {Object} props.plan - EMERGENCY_PLANS[i]
 * @param {()=>void} props.onClick - 点击卡片打开 Flow Drawer
 */
import { ShieldAlert, Clock, ArrowRightCircle } from 'lucide-react'
import StatusPill from './StatusPill.jsx'

const SEVERITY_CONFIG = {
  high: { variant: 'danger', label: '高危 H', iconColor: 'var(--danger)' },
  medium: { variant: 'warn', label: '中危 M', iconColor: 'var(--warn)' },
  low: { variant: 'info', label: '低危 L', iconColor: 'var(--info)' }
}

export default function EmergencyCard({ plan, onClick }) {
  const severityConfig = SEVERITY_CONFIG[plan.severity] || SEVERITY_CONFIG.low
  const triggerText = plan.triggerCondition.length > 40
    ? plan.triggerCondition.slice(0, 40) + '…'
    : plan.triggerCondition

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`预案：${plan.title}`}
      className={[
        'card-base card-solid p-4 h-full flex flex-col group rounded-xl',
        'hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
      ].join(' ')}
      style={{
        boxShadow: '0 0 0 1px var(--border)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 1px var(--brand),0 8px 24px rgba(212,175,55,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 1px var(--border)'
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <StatusPill variant={severityConfig.variant}>
          {severityConfig.label}
        </StatusPill>
        <span className="text-xs text-[var(--text-muted)]">{plan.category}类</span>
      </div>

      <div className="flex items-start gap-2 mt-1.5">
        <ShieldAlert
          className="w-[22px] h-[22px] shrink-0 mt-0.5"
          style={{ color: severityConfig.iconColor }}
          aria-hidden="true"
        />
        <h3
          className="font-semibold text-lg text-[var(--text-primary)] line-clamp-2 leading-snug"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {plan.title}
        </h3>
      </div>

      <p
        className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2"
        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {triggerText}
      </p>

      <div className="mt-auto pt-4 flex items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>SLA {plan.slaMinutes}分钟</span>
          </div>
          <StatusPill variant={severityConfig.variant}>
            {plan.slaMinutes} 分钟响应
          </StatusPill>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          className="btn-accent inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs group-hover:translate-x-0.5 transition-transform"
        >
          查看流程图
          <ArrowRightCircle className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
