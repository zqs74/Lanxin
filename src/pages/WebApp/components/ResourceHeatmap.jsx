/**
 * 月视图日历热力图 + Tooltip + 日期点击回调
 * @param {Object} props
 * @param {Map<number, {total:number, perCategory:{cat1:number,cat2:number,cat3:number,cat4:number,cat5:number}}>} props.dayCountMap - Day(1..30) -> 每类分配数
 * @param {(date:number)=>void} props.onDatePick
 * @param {number|null} props.selectedDay
 * @param {Object[]} props.categories - RESOURCE_CATEGORIES
 */
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
]

const CATEGORY_COLORS = {
  cat1: 'var(--info)',
  cat2: 'var(--ok)',
  cat3: 'var(--warn)',
  cat4: 'var(--danger)',
  cat5: 'var(--purple)'
}

function getHeatLevel(total) {
  if (!total || total <= 0) return 0
  if (total <= 3) return 1
  if (total <= 6) return 2
  return 3
}

function getCellStyles(level) {
  switch (level) {
    case 0:
      return {
        bg: 'var(--surface-muted)',
        text: 'var(--text-muted)',
        ring: ''
      }
    case 1:
      return {
        bg: 'color-mix(in srgb, var(--brand) 10%, transparent)',
        text: 'var(--text-primary)'
      }
    case 2:
      return {
        bg: 'color-mix(in srgb, var(--brand) 30%, transparent)',
        text: 'var(--text-primary)'
      }
    case 3:
    default:
      return {
        bg: 'var(--brand)',
        text: '#000000'
      }
  }
}

export default function ResourceHeatmap({ dayCountMap, onDatePick, selectedDay, categories }) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [tooltip, setTooltip] = useState({ day: null, x: 0, y: 0 })

  const baseMonth = 9
  const currentMonthIdx = (baseMonth + monthOffset + 12) % 12
  const currentYear = 2025 + Math.floor((baseMonth + monthOffset) / 12)
  const displayMonth = MONTH_NAMES[currentMonthIdx]

  const startWeekday = 2

  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const emptyStartCells = startWeekday - 1
  const totalGridCells = emptyStartCells + 30
  const emptyEndCells = (7 - (totalGridCells % 7)) % 7

  const handleCellEnter = (day, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const parentRect = e.currentTarget.closest('.heatmap-wrapper')?.getBoundingClientRect()
    if (!parentRect) return
    setTooltip({
      day,
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top
    })
  }

  const handleCellLeave = () => setTooltip({ day: null, x: 0, y: 0 })

  const handleToday = () => setMonthOffset(0)

  const tooltipData = tooltip.day != null ? dayCountMap.get(tooltip.day) : null
  const tooltipTotal = tooltipData ? tooltipData.total : 0

  return (
    <div className="heatmap-wrapper relative card-base rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthOffset((m) => m - 1)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--brand)]/5 hover:border-[var(--brand)]/50 transition-all"
            aria-label="上一个月"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setMonthOffset((m) => m + 1)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--brand)]/5 hover:border-[var(--brand)]/50 transition-all"
            aria-label="下一个月"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--brand)]" aria-hidden="true" />
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              {currentYear}年 {displayMonth}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--brand)]/50 text-[var(--brand)] hover:bg-[var(--brand)]/10 transition-all"
            aria-label="回到当前月"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">分配密度：</span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <span
                className="w-4 h-4 rounded border border-[var(--border)]"
                style={{ backgroundColor: 'var(--surface-muted)' }}
                aria-hidden="true"
              />
              <span className="text-[10px] text-[var(--text-muted)]">空</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className="w-4 h-4 rounded border border-[var(--border)]"
                style={{ backgroundColor: 'color-mix(in srgb, var(--brand) 10%, transparent)' }}
                aria-hidden="true"
              />
              <span className="text-[10px] text-[var(--text-muted)]">1-3</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className="w-4 h-4 rounded border border-[var(--border)]"
                style={{ backgroundColor: 'color-mix(in srgb, var(--brand) 30%, transparent)' }}
                aria-hidden="true"
              />
              <span className="text-[10px] text-[var(--text-muted)]">4-6</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className="w-4 h-4 rounded border border-[var(--brand)]"
                style={{ backgroundColor: 'var(--brand)' }}
                aria-hidden="true"
              />
              <span className="text-[10px] text-[var(--text-muted)]">≥7</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_LABELS.map((w) => (
          <div
            key={`week-${w}`}
            className="text-center text-xs font-semibold text-[var(--text-muted)] py-1"
          >
            {w}
          </div>
        ))}

        {Array.from({ length: emptyStartCells }).map((_, i) => (
          <div key={`empty-start-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const data = dayCountMap.get(day)
          const total = data ? data.total : 0
          const level = getHeatLevel(total)
          const styles = getCellStyles(level)
          const isSelected = selectedDay === day
          const showStar = level >= 3

          return (
            <button
              key={day}
              type="button"
              onClick={() => onDatePick(day)}
              onMouseEnter={(e) => handleCellEnter(day, e)}
              onMouseLeave={handleCellLeave}
              className={`aspect-square rounded-lg border p-1.5 flex flex-col justify-between transition-all hover:ring-2 hover:ring-[var(--brand)] hover:cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-[var(--ok)] shadow-lg'
                  : ''
              }`}
              style={{
                backgroundColor: styles.bg,
                color: styles.text,
                borderColor: isSelected ? 'var(--ok)' : 'var(--border)'
              }}
              aria-label={`Day ${day}，共 ${total} 条分配`}
              aria-pressed={isSelected}
            >
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold leading-none">
                  {day}
                </span>
                {showStar && (
                  <span className="text-[10px] leading-none" aria-hidden="true">
                    ★
                  </span>
                )}
              </div>
              <div className="flex justify-end items-end">
                {total > 0 && (
                  <span className="text-[10px] opacity-80 leading-none">
                    {total}
                  </span>
                )}
              </div>
            </button>
          )
        })}

        {Array.from({ length: emptyEndCells }).map((_, i) => (
          <div key={`empty-end-${i}`} className="aspect-square" />
        ))}
      </div>

      {tooltip.day != null && tooltipData && (
        <div
          className="pointer-events-none absolute z-20 card-solid rounded-lg shadow-xl p-3 min-w-[220px]"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, calc(-100% - 10px))'
          }}
          role="tooltip"
        >
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border)]">
            <div className="text-sm font-bold text-[var(--text-primary)]">
              Day {tooltip.day}
            </div>
            <div className="text-xs font-semibold text-[var(--brand)]">
              共 {tooltipTotal} 条分配
            </div>
          </div>
          <div className="space-y-1.5">
            {categories.map((cat) => {
              const count = tooltipData.perCategory?.[cat.id] || 0
              const maxCount = Math.max(1, ...Object.values(tooltipData.perCategory || {}))
              const pct = Math.round((count / maxCount) * 100)
              return (
                <div key={cat.id} className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-secondary)] w-20 shrink-0 truncate">
                    {cat.name}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CATEGORY_COLORS[cat.id] || 'var(--info)'
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] w-6 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
