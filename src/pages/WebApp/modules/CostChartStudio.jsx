import React, { useRef, useState } from 'react'
import { Copy, Download, Maximize2, X } from 'lucide-react'
import CostChartCanvas from './cost-chart/CostChartCanvas.jsx'
import { COST } from './cost-chart/costChartData.js'
import {
  renderCanvasPng,
  copyPngToClipboard,
  downloadBlob,
} from './shared/canvasExport.js'

/**
 * 办赛成本统计图工作台
 * 为 PPT「技术优势一」出成本统计图（1200×724）
 */
export default function CostChartStudio() {
  const [focusMode, setFocusMode] = useState(false)
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const stageRef = useRef(null)

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const makePng = () =>
    renderCanvasPng(stageRef.current, { width: COST.width, height: COST.height })

  const handleCopy = async () => {
    setBusy('copy')
    try {
      await copyPngToClipboard(await makePng())
      notify('已复制到剪贴板，去 PPT 里 Ctrl+V 粘贴')
    } catch (error) {
      notify(`复制失败：${error.message}`)
    } finally {
      setBusy('')
    }
  }

  const handleDownload = async () => {
    setBusy('download')
    try {
      downloadBlob(await makePng(), `办赛成本统计-${COST.width * 2}x${COST.height * 2}.png`)
      notify('已下载 PNG')
    } catch (error) {
      notify(`下载失败：${error.message}`)
    } finally {
      setBusy('')
    }
  }

  const canvasBlock = (
    <div
      className="w-full overflow-hidden rounded-[18px] border border-[var(--border)] shadow-[0_18px_48px_rgba(2,10,26,0.35)]"
      style={{ aspectRatio: `${COST.width} / ${COST.height}` }}
    >
      <div ref={stageRef} className="h-full w-full">
        <CostChartCanvas />
      </div>
    </div>
  )

  const actionButtons = (
    <>
      <button
        type="button"
        onClick={handleCopy}
        disabled={busy === 'copy'}
        className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--brand)] bg-[var(--brand)] px-4 py-2 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        <Copy className="h-4 w-4" />
        {busy === 'copy' ? '复制中…' : '复制图片'}
      </button>
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy === 'download'}
        className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-[12px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand)] disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        {busy === 'download' ? '导出中…' : '下载 PNG'}
      </button>
      <button
        type="button"
        onClick={() => setFocusMode((current) => !current)}
        className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-[12px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand)]"
      >
        {focusMode ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        {focusMode ? '退出专注' : '专注模式'}
      </button>
    </>
  )

  if (focusMode) {
    return (
      <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-4 bg-[#040B18] p-6">
        <div className="flex w-full max-w-[1520px] flex-wrap items-center justify-between gap-3">
          <div className="text-[13px] font-semibold text-white/80">
            办赛成本统计 · {COST.width}×{COST.height}
          </div>
          <div className="flex flex-wrap gap-2">{actionButtons}</div>
        </div>
        <div className="w-full max-w-[1520px]">{canvasBlock}</div>
        {toast ? (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-2 text-[12px] font-semibold text-[#0B1F3A] shadow-lg">
            {toast}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-5">
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-black text-[var(--text-primary)]">办赛成本统计</h1>
            <p className="mt-2 max-w-[820px] text-[13px] leading-6 text-[var(--text-secondary)]">
              PPT「技术优势一」配图，{COST.width}×{COST.height}。最顶是「昇梦一句话办赛」小程序式顶栏（右侧注册商标），
              往下依次是场馆实景图、左边三位裁判 + 右边环形图（中心写物料成本）、底部四类成本表；
              四类金额按赛事资源报价表的单场用量 × 12 场算，场馆一项沿用资源调度清单，没有另编。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">{actionButtons}</div>
        </div>
      </section>

      {canvasBlock}

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <div className="text-[13px] font-black text-[var(--text-primary)]">改数据</div>
        <p className="mt-2 text-[12px] leading-6 text-[var(--text-secondary)]">
          成本分类和明细都在{' '}
          <code className="rounded bg-[var(--surface)] px-1">cost-chart/costChartData.js</code>
          ，原始数据来自{' '}
          <code className="rounded bg-[var(--surface)] px-1">WebApp/data/resourceMatchingMock.js</code>
          （改那边会同步影响资源匹配模块）。
        </p>
      </section>

      {toast ? (
        <div className="fixed bottom-8 left-1/2 z-[140] -translate-x-1/2 rounded-full bg-[var(--text-primary)] px-5 py-2 text-[12px] font-semibold text-[var(--surface)] shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
