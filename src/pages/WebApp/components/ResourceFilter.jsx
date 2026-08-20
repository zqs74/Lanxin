/**
 * 资源清单左侧 240px 宽筛选面板
 * @param {Object} props
 * @param {Object[]} props.categories - RESOURCE_CATEGORIES
 * @param {Object[]} props.tournaments - TOURNAMENTS（关联赛事下拉，从父组件 useScheduleMock 取）
 * @param {Object} props.filter - 受控值
 * @param {(newFilter)=>void} props.setFilter
 * @param {number} props.filteredCount - 已筛选条数
 * @param {number} props.totalCount - 总条数
 * @param {Object[]} props.allRows - 未筛选的所有行（用于显示每个资源类别的总条数）
 * @param {Object[]} props.filteredRows - 已筛选的行（用于显示每个资源类别的筛选后条数，与当前筛选联动）
 */
import { Search, RotateCcw } from 'lucide-react'
import StatusPill from './StatusPill.jsx'
import { useMemo } from 'react'

const STATUS_OPTIONS = [
  { value: 'all', label: '全部', variant: 'info' },
  { value: 'free', label: '空闲', variant: 'ok' },
  { value: 'partial', label: '占用中', variant: 'warn' },
  { value: 'busy', label: '已满', variant: 'danger' },
  { value: 'reserved', label: '已预订', variant: 'purple' }
]

const CATEGORY_ACCENT = {
  cat1: 'info',
  cat2: 'ok',
  cat3: 'warn',
  cat4: 'danger',
  cat5: 'purple'
}

export default function ResourceFilter({ categories, tournaments, filter, setFilter, filteredCount, totalCount, allRows, filteredRows }) {
  const updateFilter = (patch) => setFilter({ ...filter, ...patch })

  const toggleCategory = (catId) => {
    const next = new Set(filter.categories)
    if (next.has(catId)) next.delete(catId)
    else next.add(catId)
    updateFilter({ categories: next })
  }

  const handleReset = () => {
    setFilter({
      categories: new Set(categories.map(c => c.id)),
      tournamentId: null,
      status: 'all',
      dateFrom: null,
      dateTo: null,
      keyword: ''
    })
  }

  const countsByCategory = useMemo(() => {
    // 若用户做了筛选（筛选后数量 < 全库数量），显示「当前筛选结果里每类多少条」，与筛选联动；
    // 否则显示全库总条数。
    const sourceRows =
      filteredRows && allRows && filteredRows.length !== allRows.length
        ? filteredRows
        : allRows || []
    const out = Object.create(null)
    for (const r of sourceRows) {
      const cid = r.categoryId
      if (!cid) continue
      out[cid] = (out[cid] || 0) + 1
    }
    return out
  }, [filteredRows, allRows])

  const countByCategory = (catId) => countsByCategory[catId] || 0

  return (
    <aside
      className="w-60 shrink-0 card-base card-solid p-4 h-fit sticky top-0"
      aria-label="筛选条件面板"
    >
      <h3 className="text-base font-bold mb-3 text-[var(--text-primary)]">
        🔍 筛选条件
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
            关键词搜索
          </label>
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="text"
              className="input-base w-full pl-8 pr-3 py-2 rounded-lg text-sm"
              placeholder="搜资源名/负责人/编号"
              value={filter.keyword}
              onChange={(e) => updateFilter({ keyword: e.target.value })}
              aria-label="搜索资源名、负责人或编号"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">
            资源类别
          </label>
          <div className="space-y-1.5">
            {categories.map((cat) => {
              const checked = filter.categories.has(cat.id)
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between gap-2 py-1 px-1 rounded cursor-pointer hover:bg-[var(--brand)]/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 accent-[var(--brand)] rounded cursor-pointer"
                      checked={checked}
                      onChange={() => toggleCategory(cat.id)}
                      aria-label={`筛选${cat.name}`}
                    />
                    <span className="text-sm text-[var(--text-primary)]">{cat.name}</span>
                  </div>
                  <StatusPill variant={CATEGORY_ACCENT[cat.id] || 'info'}>
                    共{countByCategory(cat.id)}条
                  </StatusPill>
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
            关联赛事
          </label>
          <select
            className="input-base w-full px-3 py-2 rounded-lg text-sm cursor-pointer"
            value={filter.tournamentId || ''}
            onChange={(e) => updateFilter({ tournamentId: e.target.value || null })}
            aria-label="筛选关联赛事"
          >
            <option value="">全部赛事</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">
            资源状态
          </label>
          <div className="space-y-1.5">
            {STATUS_OPTIONS.map((opt) => {
              const checked = filter.status === opt.value
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg cursor-pointer transition-all border ${
                    checked
                      ? 'bg-[var(--brand)]/10 border-[var(--brand)]/50'
                      : 'border-transparent hover:bg-[var(--brand)]/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="resource-status"
                    className="w-3.5 h-3.5 accent-[var(--brand)] cursor-pointer"
                    checked={checked}
                    onChange={() => updateFilter({ status: opt.value })}
                    aria-label={`筛选状态：${opt.label}`}
                  />
                  <StatusPill variant={opt.variant}>{opt.label}</StatusPill>
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
            日期范围
          </label>
          <div className="flex items-center gap-2">
            <select
              className="input-base flex-1 px-2 py-2 rounded-lg text-xs cursor-pointer"
              value={filter.dateFrom || ''}
              onChange={(e) => updateFilter({ dateFrom: e.target.value ? Number(e.target.value) : null })}
              aria-label="起始日期"
            >
              <option value="">Start Day</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Day {d}
                </option>
              ))}
            </select>
            <span className="text-[var(--text-muted)] text-xs">~</span>
            <select
              className="input-base flex-1 px-2 py-2 rounded-lg text-xs cursor-pointer"
              value={filter.dateTo || ''}
              onChange={(e) => updateFilter({ dateTo: e.target.value ? Number(e.target.value) : null })}
              aria-label="结束日期"
            >
              <option value="">End Day</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Day {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--brand)]/5 hover:border-[var(--brand)]/50 transition-all"
            aria-label="重置筛选条件"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            重置筛选
          </button>
          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            已筛选 <span className="text-[var(--brand)] font-semibold">{filteredCount}</span> 条
            <span className="mx-1">/</span>
            总 {totalCount} 条
          </p>
        </div>
      </div>
    </aside>
  )
}
