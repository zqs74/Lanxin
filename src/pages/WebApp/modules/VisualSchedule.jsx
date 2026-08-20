import { useState, useMemo } from 'react'
import { LayoutGrid, Plus, CalendarDays, AlertTriangle, GripVertical } from 'lucide-react'
import { useVisualScheduleMock } from '../hooks/useMockApi.js'
import ScheduleBoard from '../components/ScheduleBoard.jsx'
import StatusPill from '../components/StatusPill.jsx'

/**
 * 可视化日程详情页主模块
 */
export default function VisualSchedule() {
  const [dimension, setDimension] = useState('venue')
  const [granularity, setGranularity] = useState('week')
  const [conflictCheckOn, setConflictCheckOn] = useState(true)
  const [itemsLocalOverride, setItemsLocalOverride] = useState(new Map())
  const [showNewBanner, setShowNewBanner] = useState(false)

  const base = useVisualScheduleMock({ dimension, conflictCheck: conflictCheckOn })

  const rows = dimension === 'venue' ? base.venueRows : base.hrRows
  const activityTypes = base.activityTypes

  const scheduleItems = useMemo(
    () =>
      base.scheduleItems.map((it) =>
        itemsLocalOverride.has(it.id) ? { ...it, ...itemsLocalOverride.get(it.id) } : it
      ),
    [base.scheduleItems, itemsLocalOverride]
  )

  const handleReschedule = (itemId, newStartHour, newDurationHours) => {
    setItemsLocalOverride(
      (prev) => new Map(prev).set(itemId, { startHour: newStartHour, durationHours: newDurationHours })
    )
  }

  const conflictedIds = useMemo(() => {
    if (!conflictCheckOn) return new Set()
    const ids = new Set()
    for (let i = 0; i < scheduleItems.length; i++) {
      for (let j = i + 1; j < scheduleItems.length; j++) {
        const a = scheduleItems[i]
        const b = scheduleItems[j]
        const sameRow =
          dimension === 'venue'
            ? a.venueRowId === b.venueRowId
            : a.hrRowId === b.hrRowId
        if (!sameRow || a.dayOfWeek !== b.dayOfWeek) continue
        const overlap =
          Math.max(a.startHour, b.startHour) <
          Math.min(a.startHour + a.durationHours, b.startHour + b.durationHours)
        if (overlap) {
          ids.add(a.id)
          ids.add(b.id)
        }
      }
    }
    return ids
  }, [scheduleItems, conflictCheckOn, dimension])

  const todayDayOfWeek = ((new Date().getDay() + 6) % 7) + 1

  const goToday = () => {
    const board = document.querySelector('[data-sched-board]')
    if (!board) return
    if (granularity === 'week') {
      const scrollLeft = (todayDayOfWeek - 1) * 24 * 48
      board.scrollBy({ left: scrollLeft, behavior: 'smooth' })
    } else if (granularity === 'day' || granularity === 'month') {
      board.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }

  const handleNewSchedule = () => {
    if (window.confirm('确认新增一条空白日程？（纯模拟，不持久化）')) {
      console.log('New schedule created', new Date())
      setShowNewBanner(true)
      setTimeout(() => setShowNewBanner(false), 3000)
    }
  }

  const handleNewBannerClose = () => setShowNewBanner(false)

  const granTabCls = (active) =>
    `px-3 py-1.5 text-sm rounded-lg font-medium transition-all border ${
      active
        ? 'bg-[var(--brand)] text-[#000] border-transparent shadow-sm'
        : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]'
    }`

  return (
    <div className="flex flex-col">
      <header className="flex flex-wrap items-center gap-3 mb-4">
        <div className="min-w-0 shrink-0">
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>📅</span>
            可视化日程
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            多维排程 · 拖拽调整 · 冲突检测
          </p>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <div className="relative">
            <select
              className="input-base text-sm rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer w-36"
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              aria-label="选择维度"
            >
              <option value="venue">🏟️ 按场地</option>
              <option value="hr">👥 按人力</option>
              <option value="type">🏷️ 按活动类型</option>
            </select>
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[var(--text-muted)]"
              aria-hidden="true"
            >
              ▾
            </span>
          </div>

          <div className="inline-flex rounded-lg overflow-hidden border border-[var(--border)]">
            <button
              type="button"
              className={granTabCls(granularity === 'day')}
              onClick={() => setGranularity('day')}
            >
              日
            </button>
            <button
              type="button"
              className={granTabCls(granularity === 'week')}
              onClick={() => setGranularity('week')}
            >
              周
            </button>
            <button
              type="button"
              className={granTabCls(granularity === 'month')}
              onClick={() => setGranularity('month')}
            >
              月
            </button>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border font-medium transition-all"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
              backgroundColor: 'transparent'
            }}
            onClick={goToday}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <CalendarDays className="w-4 h-4" aria-hidden="true" />
            今日
          </button>

          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] px-3 py-1.5 rounded-lg"
               style={{ backgroundColor: 'var(--surface-muted)' }}>
            {activityTypes.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block w-3 h-3 rounded"
                  style={{ backgroundColor: `var(${a.color})` }}
                  aria-hidden="true"
                />
                <span>{a.name}</span>
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block w-0 h-0"
                aria-hidden="true"
                style={{
                  borderLeft: '6px solid transparent',
                  borderTop: '10px solid var(--danger)',
                  borderRight: '10px solid var(--danger)',
                  transform: 'translateY(1px)'
                }}
              />
              <span>冲突</span>
            </span>
          </div>

          <label
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              冲突检测
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {conflictCheckOn ? 'ON' : 'OFF'}
            </span>
            <span
              role="switch"
              aria-checked={conflictCheckOn}
              className="relative inline-block transition-colors rounded-full"
              style={{
                width: 36,
                height: 20,
                backgroundColor: conflictCheckOn ? 'var(--brand)' : 'var(--surface-muted)'
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 inline-block w-4 h-4 rounded-full shadow transition-transform bg-[var(--surface)]"
                style={{
                  transform: conflictCheckOn ? 'translateX(16px)' : 'translateX(0)'
                }}
                aria-hidden="true"
              />
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={conflictCheckOn}
              onChange={(e) => setConflictCheckOn(e.target.checked)}
            />
          </label>

          <div className="inline-flex items-center gap-2">
            <StatusPill variant="info">共 {scheduleItems.length} 条</StatusPill>
            <StatusPill variant="danger">
              <AlertTriangle className="w-3 h-3 mr-1 inline" />
              冲突 {conflictedIds.size} 条
            </StatusPill>
          </div>

          <button
            type="button"
            onClick={handleNewSchedule}
            className="btn-accent inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--brand), var(--accent-hover))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.08)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none'
              e.currentTarget.style.transform = 'none'
            }}
          >
            <Plus className="w-4 h-4" />
            新增日程
          </button>
        </div>
      </header>

      {showNewBanner && (
        <div className="mb-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg"
             style={{
               backgroundColor: 'var(--info)',
               color: '#fff',
               boxShadow: '0 4px 16px rgba(59,130,246,0.25)'
             }}>
          <div className="inline-flex items-center gap-2 text-sm font-medium">
            <span>✅</span>
            空白日程已创建（模拟），刷新页面会丢失。真实场景将调用创建 API。
          </div>
          <button
            type="button"
            onClick={handleNewBannerClose}
            className="text-[var(--text-primary)]/80 hover:text-[var(--text-primary)] text-lg leading-none px-1"
            aria-label="关闭提示"
          >
            ×
          </button>
        </div>
      )}

      <div data-sched-board>
        <ScheduleBoard
          dimension={dimension === 'type' ? 'venue' : dimension}
          granularity={granularity}
          rows={dimension === 'type' ? activityTypes.map(t => ({ id: t.id, name: t.name, type: t.name, capacity: '—' })) : rows}
          items={scheduleItems}
          conflictedIds={conflictedIds}
          activityTypes={activityTypes}
          conflictCheckOn={conflictCheckOn}
          onItemReschedule={handleReschedule}
        />
      </div>

      {/* 解释性语句已删除：使用提示 / 快捷键说明 */}
    </div>
  )
}
