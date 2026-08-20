/**
 * 资源清单详情页主模块
 * Tab = 列表视图 | 热力图视图，左侧固定筛选项，右侧主区
 */
import { useState, useMemo } from 'react'
import { LayoutList, CalendarDays, Phone, MapPin, User } from 'lucide-react'
import { useResourceUsageMock, useScheduleMock } from '../hooks/useMockApi.js'
import ResourceFilter from '../components/ResourceFilter.jsx'
import ResourceTable from '../components/ResourceTable.jsx'
import ResourceHeatmap from '../components/ResourceHeatmap.jsx'
import DetailDrawer from '../components/DetailDrawer.jsx'
import StatusPill from '../components/StatusPill.jsx'

const RESOURCE_STATUS_TEXT = {
  free: '空闲',
  partial: '部分占用',
  busy: '已满',
  reserved: '已预订'
}

const ALLOC_STATUS_TEXT = {
  pending: '待执行',
  ongoing: '进行中',
  done: '已完成',
  cancelled: '已取消'
}

const TIMELINE_DOT_COLOR = {
  pending: 'var(--purple)',
  ongoing: 'var(--brand)',
  done: 'var(--ok)',
  cancelled: 'var(--text-muted)'
}

const CATEGORY_NAME_CACHE = {
  cat1: '人力资源',
  cat2: '场地资源',
  cat3: '物料资源',
  cat4: '供应商/外包',
  cat5: '媒体/宣传'
}

function matchAllocationStatusFilter(allocationStatus, resourceUsedQty, resourceTotalQty, filterStatus) {
  if (filterStatus === 'all') return true
  if (filterStatus === 'reserved') return allocationStatus === 'pending'
  if (filterStatus === 'busy') return allocationStatus === 'ongoing' && resourceUsedQty >= resourceTotalQty
  if (filterStatus === 'partial') return allocationStatus === 'ongoing' && resourceUsedQty < resourceTotalQty
  if (filterStatus === 'free') return allocationStatus === 'done' || allocationStatus === 'cancelled'
  return true
}

export default function ResourceUsage() {
  const { categories, resources, allocations } = useResourceUsageMock()
  const { tournaments, matches } = useScheduleMock()

  const [activeTab, setActiveTab] = useState('list')
  const [filter, setFilter] = useState({
    categories: new Set(categories.map((c) => c.id)),
    tournamentId: null,
    status: 'all',
    dateFrom: null,
    dateTo: null,
    keyword: ''
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerData, setDrawerData] = useState(null)
  const [showMoreTimeline, setShowMoreTimeline] = useState(false)

  const resourceById = useMemo(() => {
    const map = new Map()
    resources.forEach((r) => map.set(r.id, r))
    return map
  }, [resources])

  const categoryById = useMemo(() => {
    const map = new Map()
    categories.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  const matchById = useMemo(() => {
    const map = new Map()
    matches.forEach((m) => map.set(m.id, m))
    return map
  }, [matches])

  const tournamentById = useMemo(() => {
    const map = new Map()
    tournaments.forEach((t) => map.set(t.id, t))
    return map
  }, [tournaments])

  const rows = useMemo(() => {
    return allocations
      .map((alloc) => {
        const resource = resourceById.get(alloc.resourceId)
        if (!resource) return null
        const category = categoryById.get(resource.categoryId)
        const match = alloc.matchId ? matchById.get(alloc.matchId) : null
        const tournament = match ? tournamentById.get(match.tournamentId) : null

        return {
          id: alloc.id,
          allocationId: alloc.id,
          resourceId: resource.id,
          resourceName: resource.name,
          code: resource.code,
          categoryId: resource.categoryId,
          categoryName: category ? category.name : CATEGORY_NAME_CACHE[resource.categoryId] || '-',
          totalQty: resource.totalQty,
          usedQty: resource.usedQty,
          status: resource.status,
          statusText: RESOURCE_STATUS_TEXT[resource.status],
          location: resource.location,
          owner: resource.owner,
          contact: resource.contact,
          lastUpdated: resource.lastUpdated,
          matchId: alloc.matchId,
          tournamentId: tournament ? tournament.id : null,
          tournamentName: tournament ? tournament.name : null,
          matchName: match ? `${match.stage}` : null,
          eventType: alloc.eventType,
          startDay: alloc.startDay,
          endDay: alloc.endDay,
          startTime: alloc.startTime,
          endTime: alloc.endTime,
          qty: alloc.qty,
          department: alloc.department,
          allocationStatus: alloc.status,
          allocationStatusText: ALLOC_STATUS_TEXT[alloc.status],
          notes: alloc.notes
        }
      })
      .filter(Boolean)
  }, [allocations, resourceById, categoryById, matchById, tournamentById])

  const totalCount = rows.length

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!filter.categories.has(row.categoryId)) return false

      if (filter.tournamentId && row.tournamentId !== filter.tournamentId) return false

      if (
        !matchAllocationStatusFilter(
          row.allocationStatus,
          row.usedQty,
          row.totalQty,
          filter.status
        )
      ) {
        return false
      }

      if (filter.dateFrom != null && row.endDay < filter.dateFrom) return false
      if (filter.dateTo != null && row.startDay > filter.dateTo) return false

      if (filter.keyword) {
        const kw = filter.keyword.trim().toLowerCase()
        if (!kw) return true
        const hit =
          (row.resourceName && row.resourceName.toLowerCase().includes(kw)) ||
          (row.owner && row.owner.toLowerCase().includes(kw)) ||
          (row.code && row.code.toLowerCase().includes(kw))
        if (!hit) return false
      }

      return true
    })
  }, [rows, filter])

  const dayCountMap = useMemo(() => {
    const map = new Map()
    for (let d = 1; d <= 30; d++) {
      map.set(d, {
        total: 0,
        perCategory: { cat1: 0, cat2: 0, cat3: 0, cat4: 0, cat5: 0 }
      })
    }
    allocations.forEach((alloc) => {
      const resource = resourceById.get(alloc.resourceId)
      if (!resource) return
      const from = alloc.startDay || 1
      const to = alloc.endDay || from
      for (let d = from; d <= Math.min(30, to); d++) {
        const bucket = map.get(d)
        if (!bucket) continue
        bucket.total += 1
        if (bucket.perCategory && resource.categoryId) {
          bucket.perCategory[resource.categoryId] =
            (bucket.perCategory[resource.categoryId] || 0) + 1
        }
      }
    })
    return map
  }, [allocations, resourceById])

  const resourceAllocationsTimeline = useMemo(() => {
    if (!drawerData) return []
    const rid = drawerData.resourceId
    return allocations
      .filter((a) => a.resourceId === rid)
      .map((alloc) => {
        const match = alloc.matchId ? matchById.get(alloc.matchId) : null
        const tournament = match ? tournamentById.get(match.tournamentId) : null
        return {
          id: alloc.id,
          startDay: alloc.startDay,
          endDay: alloc.endDay,
          eventType: alloc.eventType,
          tournamentName: tournament ? tournament.name : null,
          stage: match ? match.stage : null,
          qty: alloc.qty,
          status: alloc.status
        }
      })
      .sort((a, b) => a.startDay - b.startDay)
  }, [drawerData, allocations, matchById, tournamentById])

  const handleShowDetail = (row) => {
    setDrawerData(row)
    setShowMoreTimeline(false)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
  }

  const handleDatePick = (day) => {
    setFilter((prev) => ({ ...prev, dateFrom: day, dateTo: day }))
    setActiveTab('list')
  }

  const timelineDisplay = useMemo(() => {
    if (!resourceAllocationsTimeline.length) return { list: [], hasMore: false }
    const MAX_PREVIEW = 8
    if (resourceAllocationsTimeline.length <= MAX_PREVIEW || showMoreTimeline) {
      return { list: resourceAllocationsTimeline, hasMore: false }
    }
    return {
      list: resourceAllocationsTimeline.slice(0, MAX_PREVIEW),
      hasMore: resourceAllocationsTimeline.length > MAX_PREVIEW
    }
  }, [resourceAllocationsTimeline, showMoreTimeline])

  return (
    <div className="flex gap-5 w-full">
      <ResourceFilter
        categories={categories}
        tournaments={tournaments}
        filter={filter}
        setFilter={setFilter}
        filteredCount={filteredRows.length}
        totalCount={totalCount}
        allRows={rows}
        filteredRows={filteredRows}
      />

      <section className="flex-1 min-w-0 flex flex-col gap-4">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              📦 资源使用清单
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              查看所有赛事资源分配情况，支持多维度筛选与月历热力图
            </p>
          </div>

          <div
            className="inline-flex rounded-xl p-1 gap-1"
            style={{ backgroundColor: 'var(--surface-muted)' }}
            role="tablist"
            aria-label="资源清单视图切换"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'list'}
              onClick={() => setActiveTab('list')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'list'
                  ? 'text-[var(--text-primary)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              style={
                activeTab === 'list'
                  ? { backgroundColor: 'var(--brand)' }
                  : undefined
              }
            >
              <LayoutList className="w-4 h-4" aria-hidden="true" />
              列表视图
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'heatmap'}
              onClick={() => setActiveTab('heatmap')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'heatmap'
                  ? 'text-[var(--text-primary)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              style={
                activeTab === 'heatmap'
                  ? { backgroundColor: 'var(--brand)' }
                  : undefined
              }
            >
              <CalendarDays className="w-4 h-4" aria-hidden="true" />
              热力图视图
            </button>
          </div>
        </header>

        {activeTab === 'list' ? (
          <ResourceTable rows={filteredRows} onShowDetail={handleShowDetail} />
        ) : (
          <ResourceHeatmap
            dayCountMap={dayCountMap}
            onDatePick={handleDatePick}
            selectedDay={filter.dateFrom === filter.dateTo ? filter.dateFrom : null}
            categories={categories}
          />
        )}
      </section>

      <DetailDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title={drawerData?.resourceName || '资源详情'}
      >
        {drawerData && (
          <div className="space-y-6">
            <div className="card-solid rounded-xl p-5">
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--brand) 15%, transparent)',
                    border: '1px solid var(--border)'
                  }}
                >
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {drawerData.resourceName}
                    </h3>
                    <StatusPill variant={drawerData.status}>
                      {drawerData.statusText || '-'}
                    </StatusPill>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                    {drawerData.code}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-1">类别</div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {drawerData.categoryName}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-1">数量</div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    <span className="text-[var(--brand)] font-bold">{drawerData.usedQty}</span>
                    <span className="text-[var(--text-muted)] mx-1">/</span>
                    {drawerData.totalQty} {categoryById.get(drawerData.categoryId)?.unit || '单位'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" aria-hidden="true" />
                    负责人
                  </div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {drawerData.owner}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" aria-hidden="true" />
                    联系电话
                  </div>
                  <div className="text-sm font-medium text-[var(--text-primary)] font-mono">
                    {drawerData.contact}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    位置
                  </div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {drawerData.location}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  🕒 近 30 天使用记录
                </h4>
                <span className="text-xs text-[var(--text-muted)]">
                  共 {resourceAllocationsTimeline.length} 条
                </span>
              </div>

              {resourceAllocationsTimeline.length === 0 ? (
                <div className="card-solid rounded-xl py-10 text-center text-sm text-[var(--text-muted)]">
                  暂无使用记录
                </div>
              ) : (
                <>
                  <ol className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-1 before:bottom-1 before:w-px before:bg-[var(--border)]">
                    {timelineDisplay.list.map((item) => (
                      <li key={item.id} className="relative">
                        <span
                          className="absolute -left-[26px] top-1.5 w-[10px] h-[10px] rounded-full ring-4"
                          style={{
                            backgroundColor: TIMELINE_DOT_COLOR[item.status] || 'var(--info)',
                            boxShadow: `0 0 0 4px color-mix(in srgb, ${TIMELINE_DOT_COLOR[item.status] || 'var(--info)'} 20%, transparent)`
                          }}
                          aria-hidden="true"
                        />
                        <div className="card-solid rounded-lg p-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                            <div className="text-sm font-semibold text-[var(--text-primary)]">
                              Day {item.startDay}
                              {item.endDay !== item.startDay && (
                                <span className="text-[var(--text-muted)] font-normal">
                                  {' '}- Day {item.endDay}
                                </span>
                              )}
                            </div>
                            <StatusPill
                              variant={
                                item.status === 'ongoing'
                                  ? 'busy'
                                  : item.status === 'pending'
                                  ? 'purple'
                                  : item.status === 'done'
                                  ? 'ok'
                                  : 'info'
                              }
                            >
                              {ALLOC_STATUS_TEXT[item.status]}
                            </StatusPill>
                          </div>
                          <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
                            <div>
                              <span className="text-[var(--text-muted)]">活动类型：</span>
                              {item.eventType}
                            </div>
                            {item.tournamentName && (
                              <div>
                                <span className="text-[var(--text-muted)]">关联赛事：</span>
                                {item.tournamentName}
                                {item.stage && (
                                  <span className="text-[var(--text-muted)]">
                                    {' '}· {item.stage}
                                  </span>
                                )}
                              </div>
                            )}
                            <div>
                              <span className="text-[var(--text-muted)]">使用数量：</span>
                              <span className="text-[var(--brand)] font-semibold">
                                {item.qty}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>

                  {timelineDisplay.hasMore && (
                    <button
                      type="button"
                      onClick={() => setShowMoreTimeline(true)}
                      className="mt-4 w-full py-2 text-xs font-semibold text-[var(--brand)] rounded-lg border border-dashed hover:bg-[var(--brand)]/5 transition-all"
                      style={{ borderColor: 'var(--brand)' }}
                    >
                      查看更多 ({resourceAllocationsTimeline.length - 8} 条)...
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  )
}
