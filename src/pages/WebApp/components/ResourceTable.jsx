/**
 * 资源清单表格 + 分页
 * @param {Object} props
 * @param {Object[]} props.rows - 筛选后行数组（每 row 是 JOIN 过的对象，含 categoryName/tournamentName/matchName/statusText）
 * @param {(row)=>void} props.onShowDetail - 行操作回调
 */
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye } from 'lucide-react'
import StatusPill from './StatusPill.jsx'

const PAGE_SIZE = 20

const CATEGORY_DOT_COLORS = {
  cat1: 'bg-[var(--info)]',
  cat2: 'bg-[var(--ok)]',
  cat3: 'bg-[var(--warn)]',
  cat4: 'bg-[var(--danger)]',
  cat5: 'bg-[var(--purple)]'
}

const SORT_KEY_LABEL = {
  resourceName: '资源名称',
  dayRange: '时段'
}

export default function ResourceTable({ rows, onShowDetail }) {
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState(null)

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const handleSortClick = (key) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
    } else if (sortDir === 'desc') {
      setSortKey(null)
      setSortDir(null)
    } else {
      setSortDir('asc')
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDir) return rows
    const arr = [...rows]
    arr.sort((a, b) => {
      let va, vb
      if (sortKey === 'resourceName') {
        va = (a.resourceName || '').toString()
        vb = (b.resourceName || '').toString()
      } else if (sortKey === 'dayRange') {
        va = a.startDay || 0
        vb = b.startDay || 0
      } else {
        return 0
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [rows, sortKey, sortDir])

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return sortedRows.slice(start, start + PAGE_SIZE)
  }, [sortedRows, safePage])

  const getHeatColor = (usedQty, totalQty) => {
    if (!totalQty) return 'bg-[var(--surface-muted)]'
    const ratio = usedQty / totalQty
    if (ratio === 0) return 'bg-[var(--surface-muted)]'
    if (ratio < 0.34) return 'bg-[var(--brand)]/20'
    if (ratio < 0.67) return 'bg-[var(--brand)]/40'
    return 'bg-[var(--brand)]'
  }

  const pageNumbers = useMemo(() => {
    const buttons = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i)
    } else if (safePage <= 3) {
      buttons.push(1, 2, 3, 4, 'ellipsis', totalPages)
    } else if (safePage >= totalPages - 2) {
      buttons.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      buttons.push(1, 'ellipsis', safePage - 1, safePage, safePage + 1, 'ellipsis', totalPages)
    }
    return buttons
  }, [totalPages, safePage])

  const SortableHeader = ({ sortId, children }) => {
    const isActive = sortKey === sortId
    return (
      <th
        scope="col"
        className="px-4 py-3 text-left cursor-pointer select-none hover:text-[var(--brand)] transition-colors"
        onClick={() => handleSortClick(sortId)}
        aria-sort={isActive ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <div className="flex items-center gap-1">
          <span>{children}</span>
          <ArrowUpDown
            className={`w-3 h-3 transition-colors ${isActive ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'}`}
            aria-hidden="true"
          />
        </div>
      </th>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card-base overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)] text-xs font-semibold">
              <tr>
                <SortableHeader sortId="resourceName">资源名称</SortableHeader>
                <th scope="col" className="px-4 py-3 text-left">类别</th>
                <th scope="col" className="px-4 py-3 text-left">缩略</th>
                <SortableHeader sortId="dayRange">时段</SortableHeader>
                <th scope="col" className="px-4 py-3 text-left">关联赛事</th>
                <th scope="col" className="px-4 py-3 text-left">使用方</th>
                <th scope="col" className="px-4 py-3 text-left">状态</th>
                <th scope="col" className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-[var(--text-muted)]">
                    暂无符合条件的分配记录
                  </td>
                </tr>
              ) : (
                pagedRows.map((row) => {
                  const statusVariant =
                    row.allocationStatus === 'ongoing' ? 'busy' :
                    row.allocationStatus === 'pending' ? 'warn' :
                    row.allocationStatus === 'done' ? 'ok' :
                    row.allocationStatus === 'cancelled' ? 'pending' :
                    (row.status || 'info')
                  const dotColor = CATEGORY_DOT_COLORS[row.categoryId] || 'bg-[var(--info)]'
                  return (
                    <tr
                      key={row.id}
                      className="group hover:bg-[var(--brand)]/5 hover:border-l-4 hover:border-[var(--brand)] transition-all border-l-4 border-transparent"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--text-primary)]">{row.resourceName}</div>
                        <div className="text-xs text-[var(--text-muted)]">{row.code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${dotColor}`} aria-hidden="true" />
                          <span className="text-sm text-[var(--text-secondary)]">{row.categoryName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-sm ${getHeatColor(row.usedQty, row.totalQty)}`}
                          title={`${row.usedQty}/${row.totalQty}`}
                          aria-label={`已用 ${row.usedQty}，共 ${row.totalQty}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {row.startDay === row.endDay
                          ? `Day ${row.startDay}`
                          : `Day ${row.startDay} - Day ${row.endDay}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {row.tournamentName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                        {row.department || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill variant={statusVariant}>
                          {row.statusText ||
                            (row.allocationStatus === 'pending' && '待执行') ||
                            (row.allocationStatus === 'ongoing' && '进行中') ||
                            (row.allocationStatus === 'done' && '已完成') ||
                            (row.allocationStatus === 'cancelled' && '已取消') ||
                            '-'}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onShowDetail(row)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--brand)]/10 hover:border-[var(--brand)]/50 hover:text-[var(--brand)] transition-all"
                          aria-label={`查看 ${row.resourceName} 详情`}
                        >
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                          查看详情
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-[var(--text-muted)]">
          共 <span className="text-[var(--text-primary)] font-semibold">{rows.length}</span> 条
          <span className="mx-1.5">·</span>
          页 <span className="text-[var(--text-primary)] font-semibold">{safePage}</span>/{totalPages}
        </div>

        <nav className="flex items-center gap-1" aria-label="分页导航">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--brand)]/5 hover:border-[var(--brand)]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="上一页"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          {pageNumbers.map((pn, idx) =>
            pn === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] text-sm"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={pn}
                type="button"
                onClick={() => setPage(pn)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  safePage === pn
                    ? 'bg-[var(--brand)] text-[var(--text-primary)] shadow-md'
                    : 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--brand)]/5 hover:border-[var(--brand)]/50'
                }`}
                aria-current={safePage === pn ? 'page' : undefined}
                aria-label={`第 ${pn} 页`}
              >
                {pn}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--brand)]/5 hover:border-[var(--brand)]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="下一页"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </nav>

        <div className="text-xs text-[var(--text-muted)]">
          {PAGE_SIZE}/页
        </div>
      </div>
    </div>
  )
}
