import { useState, useRef, useEffect } from 'react'
import StatusPill from './StatusPill.jsx'

const ROW_HEIGHT = 44
const HEADER_HEIGHT = 48
const LEFT_COL_WIDTH = 180
const HOUR_WIDTH = 48
const CARD_ROUND = 'rounded-lg'

const MAX_HOURS_MAP = { day: 24, week: 7 * 24, month: 30 * 24 }

function roundToHalf(v) {
  return Math.max(0, Math.round(v * 2) / 2)
}
function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}
function formatHour(h) {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
function dayLabel(dow, baseDate = new Date(2024, 9, 14)) {
  const wkNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const d = new Date(baseDate)
  d.setDate(d.getDate() - (d.getDay() + 6) % 7 + (dow - 1))
  return `${wkNames[dow - 1]}(${(d.getMonth() + 1)}/${d.getDate()})`
}

/**
 * 排程看板：固定头 + 固定左列 + 绝对定位卡片
 * @param {Object} props
 * @param {'venue'|'hr'} props.dimension - 当前维度
 * @param {'day'|'week'|'month'} props.granularity
 * @param {Array<Object>} props.rows - VENUE_ROWS 或 HR_ROWS（长度=10）
 * @param {Array<Object>} props.items - 该维度的 filtered scheduleItems
 * @param {Set<string>} props.conflictedIds - 冲突 id 集合
 * @param {Array<Object>} props.activityTypes - 颜色映射
 * @param {boolean} props.conflictCheckOn - 冲突检测开关
 * @param {(itemId, newStartHour, newDurationHours)=>void} props.onItemReschedule - 拖拽/拉伸 onMouseUp 后触发
 */
export default function ScheduleBoard({
  dimension,
  granularity,
  rows,
  items,
  conflictedIds,
  activityTypes,
  conflictCheckOn,
  onItemReschedule
}) {
  const totalHours = MAX_HOURS_MAP[granularity]
  const totalWidth = LEFT_COL_WIDTH + totalHours * HOUR_WIDTH + 20
  const totalHeight = HEADER_HEIGHT + rows.length * ROW_HEIGHT

  const [openDetailId, setOpenDetailId] = useState(null)

  const dragStateRef = useRef(null)
  const resizeStateRef = useRef(null)
  const boardRef = useRef(null)

  const activityColorMap = Object.fromEntries(activityTypes.map(a => [a.name, a.color]))

  const currentHourOffset = (() => {
    if (granularity === 'month') return null
    const now = new Date()
    const baseDate = new Date(2024, 9, 14)
    const dow = ((baseDate.getDay() + 6) % 7) + 1
    const todayDow = ((now.getDay() + 6) % 7) + 1
    const dayOff = granularity === 'week' ? (todayDow - dow) * 24 : 0
    return dayOff + now.getHours() + now.getMinutes() / 60
  })()

  useEffect(() => {
    if (!openDetailId) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpenDetailId(null)
    }
    document.addEventListener('keydown', handleKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [openDetailId])

  useEffect(() => {
    const handleUp = () => {
      if (dragStateRef.current) {
        const { itemId, previewStartHour, durationHours } = dragStateRef.current
        onItemReschedule(itemId, previewStartHour, durationHours)
        dragStateRef.current = null
      }
      if (resizeStateRef.current) {
        const { itemId, startHour, previewDuration } = resizeStateRef.current
        onItemReschedule(itemId, startHour, previewDuration)
        resizeStateRef.current = null
      }
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    const handleMove = (e) => {
      if (dragStateRef.current) {
        const st = dragStateRef.current
        const deltaHour = (e.clientX - st.startMouseX) / HOUR_WIDTH
        let preview = roundToHalf(st.originalStartHour + deltaHour)
        preview = clamp(preview, 0, (st.maxHours || 24) - st.durationHours)
        st.previewStartHour = preview
        const el = document.getElementById(`sched-card-${st.itemId}`)
        if (el) {
          const dayOff = granularity === 'week' ? (st.dayOfWeek - 1) * 24 : 0
          el.style.left = `${LEFT_COL_WIDTH + (preview + dayOff) * HOUR_WIDTH}px`
        }
      }
      if (resizeStateRef.current) {
        const st = resizeStateRef.current
        const deltaHour = roundToHalf((e.clientX - st.startMouseX) / HOUR_WIDTH)
        let preview = clamp(st.startDuration + deltaHour, 0.5, 12)
        st.previewDuration = preview
        const el = document.getElementById(`sched-card-${st.itemId}`)
        if (el) {
          el.style.width = `${preview * HOUR_WIDTH - 4}px`
        }
      }
    }
    const _noop = () => { handleUp() }
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [granularity, onItemReschedule])

  const startDrag = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    const maxH = granularity === 'week' ? 24 : (granularity === 'day' ? 24 : 24)
    dragStateRef.current = {
      itemId: item.id,
      startMouseX: e.clientX,
      originalStartHour: item.startHour,
      previewStartHour: item.startHour,
      durationHours: item.durationHours,
      maxHours: maxH,
      dayOfWeek: item.dayOfWeek
    }
    const handleMove = (ev) => {
      if (!dragStateRef.current) return
      const st = dragStateRef.current
      const deltaHour = (ev.clientX - st.startMouseX) / HOUR_WIDTH
      let preview = roundToHalf(st.originalStartHour + deltaHour)
      preview = clamp(preview, 0, (st.maxHours || 24) - st.durationHours)
      st.previewStartHour = preview
      const el = document.getElementById(`sched-card-${st.itemId}`)
      if (el) {
        const dayOff = granularity === 'week' ? (st.dayOfWeek - 1) * 24 : 0
        el.style.left = `${LEFT_COL_WIDTH + (preview + dayOff) * HOUR_WIDTH}px`
      }
    }
    const handleUp = () => {
      if (dragStateRef.current) {
        const { itemId, previewStartHour, durationHours } = dragStateRef.current
        onItemReschedule(itemId, previewStartHour, durationHours)
        dragStateRef.current = null
      }
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  const startResize = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    resizeStateRef.current = {
      itemId: item.id,
      startMouseX: e.clientX,
      startDuration: item.durationHours,
      previewDuration: item.durationHours,
      startHour: item.startHour
    }
    const handleMove = (ev) => {
      if (!resizeStateRef.current) return
      const st = resizeStateRef.current
      const deltaHour = roundToHalf((ev.clientX - st.startMouseX) / HOUR_WIDTH)
      let preview = clamp(st.startDuration + deltaHour, 0.5, 12)
      st.previewDuration = preview
      const el = document.getElementById(`sched-card-${st.itemId}`)
      if (el) {
        el.style.width = `${preview * HOUR_WIDTH - 4}px`
      }
    }
    const handleUp = () => {
      if (resizeStateRef.current) {
        const { itemId, startHour, previewDuration } = resizeStateRef.current
        onItemReschedule(itemId, startHour, previewDuration)
        resizeStateRef.current = null
      }
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  const handleCardKey = (e, item) => {
    if (e.key === 'Enter') {
      setOpenDetailId(item.id)
      return
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const step = e.shiftKey ? 2 : 0.5
      const sign = e.key === 'ArrowLeft' ? -1 : 1
      const maxH = 24
      let newStart = clamp(roundToHalf(item.startHour + sign * step), 0, maxH - item.durationHours)
      onItemReschedule(item.id, newStart, item.durationHours)
    }
  }

  const rowIndexMap = Object.fromEntries(rows.map((r, i) => [r.id, i]))

  const renderHeaderTicks = () => {
    if (granularity === 'day') {
      const ticks = []
      for (let h = 0; h < 24; h++) {
        ticks.push(
          <div
            key={`h-${h}`}
            className="flex-shrink-0 text-xs text-[var(--text-muted)] border-l border-[var(--border)]"
            style={{ width: HOUR_WIDTH, height: HEADER_HEIGHT }}
          >
            <div className="px-2 pt-3">{formatHour(h)}</div>
          </div>
        )
      }
      return ticks
    }
    if (granularity === 'week') {
      const weeks = []
      for (let d = 1; d <= 7; d++) {
        const sublines = []
        for (let h = 0; h < 24; h++) {
          sublines.push(
            <div
              key={`${d}-${h}`}
              className="h-full border-l border-dashed"
              style={{
                width: HOUR_WIDTH,
                borderColor: 'rgba(212,175,55,0.08)'
              }}
            />
          )
        }
        weeks.push(
          <div key={`d-${d}`} className="flex-shrink-0 relative" style={{ width: 24 * HOUR_WIDTH }}>
            <div
              className="text-xs text-[var(--text-muted)] px-2 pt-3 border-l border-[var(--border)]"
              style={{ height: HEADER_HEIGHT }}
            >
              {dayLabel(d)}
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex h-[2px]" aria-hidden="true">
              {sublines}
            </div>
          </div>
        )
      }
      return weeks
    }
    const days = []
    for (let d = 1; d <= 30; d++) {
      days.push(
        <div
          key={`m-${d}`}
          className="flex-shrink-0 text-xs text-[var(--text-muted)] border-l border-[var(--border)] text-center"
          style={{ width: HOUR_WIDTH, height: HEADER_HEIGHT }}
        >
          <div className="pt-3">Day {d}</div>
        </div>
      )
    }
    return days
  }

  const rowBgClass = 'bg-[var(--bg-card)]'

  const renderGridLines = (rowIdx) => {
    const lines = []
    const count = granularity === 'week' ? 7 * 24 : (granularity === 'month' ? 30 * 24 : 24)
    for (let h = 1; h < count; h++) {
      lines.push(
        <div
          key={`g-${rowIdx}-${h}`}
          className="absolute top-0 bottom-0 border-l border-dashed pointer-events-none"
          style={{
            left: LEFT_COL_WIDTH + h * HOUR_WIDTH,
            borderColor: 'rgba(212,175,55,0.06)'
          }}
          aria-hidden="true"
        />
      )
    }
    return lines
  }

  const detailItem = openDetailId ? items.find(i => i.id === openDetailId) : null
  const detailRow = detailItem
    ? rows.find(r => r.id === (dimension === 'venue' ? detailItem.venueRowId : detailItem.hrRowId))
    : null
  const detailType = activityTypes.find(a => a.name === detailItem?.type)

  return (
    <>
      <div
        ref={boardRef}
        className="card-base card-solid overflow-auto scrollbar-custom"
        style={{ maxHeight: 'calc(100vh - 320px)' }}
      >
        <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
          <div
            className="sticky top-0 z-20 flex"
            style={{
              height: HEADER_HEIGHT,
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)'
            }}
          >
            <div
              className="flex-shrink-0 border-r border-[var(--border)] flex items-center px-3 text-xs text-[var(--text-muted)] font-semibold"
              style={{ width: LEFT_COL_WIDTH }}
            >
              {dimension === 'venue' ? '场地资源' : '人力组别'}
            </div>
            <div className="flex flex-shrink-0">
              {renderHeaderTicks()}
            </div>
          </div>

          {currentHourOffset != null && granularity !== 'month' && (
            <div
              className="absolute pointer-events-none z-10"
              style={{
                left: LEFT_COL_WIDTH + currentHourOffset * HOUR_WIDTH,
                top: HEADER_HEIGHT,
                bottom: 0,
                width: 0,
                borderLeft: '2px dashed var(--danger)',
                opacity: 0.6
              }}
              aria-hidden="true"
            />
          )}

          {rows.map((row, rowIdx) => {
            const top = HEADER_HEIGHT + rowIdx * ROW_HEIGHT
            return (
              <div
                key={row.id}
                className={`flex ${rowBgClass}`}
                style={{ height: ROW_HEIGHT, position: 'absolute', top, left: 0, right: 0 }}
              >
                <div
                  className={`flex-shrink-0 sticky left-0 z-10 flex items-center px-3 truncate border-r border-[var(--border)] ${rowBgClass}`}
                  style={{ width: LEFT_COL_WIDTH, height: ROW_HEIGHT }}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{dimension === 'venue' ? '🏀' : '👥'}</span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {row.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] truncate">
                        {dimension === 'venue'
                          ? `${row.type || '场馆'} · 容量${row.capacity ?? '--'}人`
                          : `${row.category} · ${row.headcount ?? '--'}人`}
                      </span>
                    </span>
                  </span>
                </div>
                <div className="relative flex-1" style={{ height: ROW_HEIGHT }}>
                  <div
                    className="absolute left-0 right-0 bottom-0 border-b border-[var(--border)]"
                    aria-hidden="true"
                  />
                  {renderGridLines(rowIdx)}
                </div>
              </div>
            )
          })}

          {items.map(item => {
            const rowId = dimension === 'venue' ? item.venueRowId : item.hrRowId
            const rowIdx = rowIndexMap[rowId]
            if (rowIdx == null) return null
            const colorVar = activityColorMap[item.type] || '--info'
            const dayOff = granularity === 'week' ? (item.dayOfWeek - 1) * 24 : 0
            const monthOff = granularity === 'month' ? ((item.dayOfWeek - 1) % 30) * 24 : 0
            const leftPx = LEFT_COL_WIDTH + (item.startHour + dayOff + monthOff) * HOUR_WIDTH
            const topPx = HEADER_HEIGHT + rowIdx * ROW_HEIGHT + 4
            const widthPx = item.durationHours * HOUR_WIDTH - 4
            const isConflicted = conflictCheckOn && conflictedIds.has(item.id)
            const row = rows[rowIdx]
            return (
              <div
                key={item.id}
                id={`sched-card-${item.id}`}
                role="button"
                tabIndex={0}
                aria-label={`日程 ${item.title} ${formatHour(item.startHour)}-${formatHour(item.startHour + item.durationHours)} ${row?.name || ''}`}
                onMouseDown={(e) => startDrag(e, item)}
                onDoubleClick={() => setOpenDetailId(item.id)}
                onKeyDown={(e) => handleCardKey(e, item)}
                className={`absolute ${CARD_ROUND} px-2 py-1 overflow-hidden text-xs cursor-move select-none border shadow-sm`}
                style={{
                  left: leftPx,
                  top: topPx,
                  width: widthPx,
                  height: ROW_HEIGHT - 8,
                  backgroundColor: `var(${colorVar}, var(--info))`,
                  backgroundImage: `linear-gradient(135deg, var(${colorVar}, var(--info)) 0%, var(${colorVar}, var(--info))cc 100%)`,
                  borderColor: `var(${colorVar}, var(--info))`,
                  color: '#fff',
                  outline: isConflicted ? '2px solid var(--danger)' : 'none',
                  outlineOffset: 0,
                  zIndex: isConflicted ? 15 : 5
                }}
              >
                <div className="flex flex-col h-full min-h-0 gap-[1px]">
                  <div className="font-semibold truncate leading-tight">{item.title}</div>
                  <div className="opacity-90 truncate text-[10px] leading-tight">
                    {formatHour(item.startHour)}-{formatHour(item.startHour + item.durationHours)} · {item.ownerName}
                  </div>
                </div>
                {isConflicted && (
                  <>
                    <div
                      className="absolute top-0 right-0"
                      style={{
                        width: 14,
                        height: 14,
                        clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                        backgroundColor: 'var(--danger)'
                      }}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute top-[1px] right-[1px] text-[9px] font-bold leading-none text-[var(--text-primary)]"
                      style={{ pointerEvents: 'none' }}
                    >
                      !
                    </div>
                    <div className="absolute left-1 top-1">
                      <StatusPill variant="danger">冲突</StatusPill>
                    </div>
                  </>
                )}
                <div
                  role="separator"
                  aria-label="调整时长"
                  className="absolute right-0 top-0 bottom-0 cursor-ew-resize transition-colors hover:bg-[rgba(212,175,55,0.35)]"
                  style={{ width: 8 }}
                  onMouseDown={(e) => startResize(e, item)}
                />
              </div>
            )
          })}
        </div>
      </div>

      {detailItem && (
        <div
          className="fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-sm flex items-center justify-center"
          onClick={() => setOpenDetailId(null)}
          aria-hidden="true"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sched-detail-title"
            className="card-base card-solid p-6 max-w-[95vw] w-[480px] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '85vh', overflowY: 'auto' }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3
                  id="sched-detail-title"
                  className="text-lg font-bold text-[var(--text-primary)] truncate"
                >
                  {detailItem.title}
                </h3>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  {detailType && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `var(${detailType.color})`,
                        color: '#fff'
                      }}
                    >
                      {detailType.name}
                    </span>
                  )}
                  {conflictCheckOn && conflictedIds.has(detailItem.id) && (
                    <StatusPill variant="danger">检测到冲突</StatusPill>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenDetailId(null)}
                className="text-[var(--text-muted)] hover:text-[var(--danger)] text-xl leading-none shrink-0 px-1"
                aria-label="关闭"
              >
                ×
              </button>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[var(--text-muted)]">负责人</dt>
                <dd className="text-[var(--text-primary)] font-medium">{detailItem.ownerName}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[var(--text-muted)]">时间</dt>
                <dd className="text-[var(--text-primary)] font-medium">
                  周{detailItem.dayOfWeek} · {formatHour(detailItem.startHour)} - {formatHour(detailItem.startHour + detailItem.durationHours)}
                  （{detailItem.durationHours}h）
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[var(--text-muted)]">分配资源</dt>
                <dd className="text-[var(--text-primary)] min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1">
                    {detailItem.assignedResourceIds?.length ? (
                      detailItem.assignedResourceIds.map((rid) => (
                        <span
                          key={rid}
                          className="text-xs px-2 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: 'var(--surface-muted)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {rid}
                        </span>
                      ))
                    ) : (
                      <span className="text-[var(--text-muted)]">未分配</span>
                    )}
                  </div>
                  {detailRow && (
                    <div className="mt-2 text-xs text-[var(--text-muted)]">
                      主资源：{detailRow.name}
                    </div>
                  )}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[var(--text-muted)]">关联赛事</dt>
                <dd className="text-[var(--text-primary)] font-medium">
                  {detailItem.matchId ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-[var(--brand)]">#{detailItem.matchId}</span>
                      <span className="text-xs text-[var(--text-muted)]">已绑定</span>
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">未关联赛事</span>
                  )}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[var(--text-muted)]">备注</dt>
                <dd className="text-[var(--text-primary)]">
                  本日程为系统模拟数据，支持拖拽移动与时长调整，修改不会被持久化。
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-lg border font-medium transition-all"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                onClick={() => setOpenDetailId(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="btn-accent px-4 py-2 text-sm rounded-lg"
                onClick={() => {
                  console.log('Saved schedule detail', detailItem.id, new Date())
                  setOpenDetailId(null)
                }}
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
