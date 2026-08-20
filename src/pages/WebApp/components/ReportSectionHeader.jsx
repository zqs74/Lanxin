const ACCENT_MAP = {
  brand: '#D4AF37',
  info: '#3B82F6',
  purple: '#8B5CF6',
  ok: '#10B981',
  warn: '#F59E0B',
  danger: '#EF4444',
  slate: '#64748B',
}

export default function ReportSectionHeader({ title, action = null, accent = 'purple' }) {
  const accentColor = ACCENT_MAP[accent] ?? ACCENT_MAP.purple
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
      <div className="flex items-center gap-2.5">
        <span
          className="inline-block h-[18px] w-[4px] rounded-[2px] shadow-[0_0_0_1px_rgba(255,255,255,0.35)_inset]"
          style={{ background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}cc 100%)` }}
        />
        <h3
          className="text-[15px] font-black uppercase tracking-[0.12em] leading-none"
          style={{
            color: 'var(--text-primary)',
            textShadow: '0 1px 0 rgba(255,255,255,0.5)',
            letterSpacing: '0.08em',
          }}
        >
          {title}
        </h3>
      </div>
      {action}
    </div>
  )
}
