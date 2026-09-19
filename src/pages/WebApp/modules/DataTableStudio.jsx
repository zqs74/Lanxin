import React, { useRef, useState } from 'react'
import { Copy, Download } from 'lucide-react'
import DataTableCanvas from './data-tables/DataTableCanvas.jsx'
import { TABLES, TABLE_WIDTH, tableHeight } from './data-tables/dataTableData.js'
import {
  renderCanvasPng,
  copyPngToClipboard,
  downloadBlob,
} from './shared/canvasExport.js'

/** 预览底色：浅色，和表格本身一致 */
const PREVIEW_BG = '#F5F3EE'

function TableCard({ table }) {
  const stageRef = useRef(null)
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const height = tableHeight()

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const makePng = () =>
    renderCanvasPng(stageRef.current, {
      width: TABLE_WIDTH,
      height,
      // 不填底色：导出透明 PNG，直接贴到 PPT 深蓝底上
    })

  const handleCopy = async () => {
    setBusy('copy')
    try {
      await copyPngToClipboard(await makePng())
      notify('已复制，去 PPT 里 Ctrl+V')
    } catch (error) {
      notify(`复制失败：${error.message}`)
    } finally {
      setBusy('')
    }
  }

  const handleDownload = async () => {
    setBusy('download')
    try {
      downloadBlob(await makePng(), `${table.title}-${TABLE_WIDTH * 2}x${height * 2}.png`)
      notify('已下载 PNG')
    } catch (error) {
      notify(`下载失败：${error.message}`)
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[14px] font-black text-[var(--text-primary)]">
            {table.title} · {table.caption}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {TABLE_WIDTH}×{height}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={busy === 'copy'}
            className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--brand)] bg-[var(--brand)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <Copy className="h-3.5 w-3.5" />
            {busy === 'copy' ? '复制中…' : '复制图片'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={busy === 'download'}
            className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-[12px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand)] disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            {busy === 'download' ? '导出中…' : '下载 PNG'}
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-[14px] border border-[var(--border)]"
        style={{ aspectRatio: `${TABLE_WIDTH} / ${height}`, background: PREVIEW_BG }}
      >
        <div ref={stageRef} className="h-full w-full">
          <DataTableCanvas table={table} />
        </div>
      </div>

      {toast ? (
        <div className="mt-2 text-[12px] font-semibold text-[var(--brand)]">{toast}</div>
      ) : null}
    </section>
  )
}

/**
 * 赛事数据服务 · 数据表工作台
 * 为 PPT「核心业务三」中间四个窗口出数据表（每张单独导出）
 */
export default function DataTableStudio() {
  return (
    <div className="animate-fade-in space-y-5">
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
        <h1 className="text-[20px] font-black text-[var(--text-primary)]">赛事数据服务 · 数据表</h1>
        <p className="mt-2 max-w-[860px] text-[13px] leading-6 text-[var(--text-secondary)]">
          给 PPT「核心业务三 赛事数据服务」中间四个窗口用，四张表分别对应四个窗口，字段按 PPT 上的说明填：
          基础五项（前板 / 后板 / 篮板 / 助攻 / 抢断 / 盖帽 / 失误 / 犯规）、投篮分布（出手 / 命中 / 命中率 / 频率）、
          综合影响力分析（VORP / 原始 BPM / OBPM / DBPM）、攻防综合（百回合净胜分 / 百回合得失分 / 进攻防守效率）。
          表格样式复刻了管理控制台里「运动数据分析中台」的表头底色 + 列间竖线。每张表可以单独复制或下载。
        </p>
      </section>

      {TABLES.map((table) => (
        <TableCard key={table.key} table={table} />
      ))}

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <div className="text-[13px] font-black text-[var(--text-primary)]">改数据</div>
        <p className="mt-2 text-[12px] leading-6 text-[var(--text-secondary)]">
          四张表的列名、列宽、数值都在{' '}
          <code className="rounded bg-[var(--surface)] px-1">data-tables/dataTableData.js</code>
          ，数值现在是示意数据，替换成真实战报即可。
        </p>
      </section>
    </div>
  )
}
