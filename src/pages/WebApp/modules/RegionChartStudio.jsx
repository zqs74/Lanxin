import React, { useRef, useState } from 'react'
import { Copy, Download } from 'lucide-react'
import RegionChartCanvas from './region-chart/RegionChartCanvas.jsx'
import { REGION } from './region-chart/regionChartData.js'
import {
  renderCanvasPng,
  copyPngToClipboard,
  downloadBlob,
} from './shared/canvasExport.js'

/**
 * 基层赛事数据积累图工作台
 * 为 PPT 第 27 页「区域深耕」右侧「基层赛事数据积累」卡片出图（760×660）
 */
export default function RegionChartStudio() {
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const stageRef = useRef(null)

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const makePng = () =>
    renderCanvasPng(stageRef.current, { width: REGION.width, height: REGION.height })

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
      downloadBlob(await makePng(), `基层赛事数据积累-${REGION.width * 2}x${REGION.height * 2}.png`)
      notify('已下载 PNG')
    } catch (error) {
      notify(`下载失败：${error.message}`)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="animate-fade-in space-y-5">
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-black text-[var(--text-primary)]">基层赛事数据积累</h1>
            <p className="mt-2 max-w-[820px] text-[13px] leading-6 text-[var(--text-secondary)]">
              PPT 第 27 页「区域深耕」右侧那张卡片配图，{REGION.width}×{REGION.height}。
              数字取自 PPT 原文（28 个本土 IP / 1021 场 / 26 个镇街 / 20615 人次 / 543 名人才库），没有另编。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      </section>

      <div
        className="mx-auto w-full max-w-[820px] overflow-hidden rounded-[18px] border border-[var(--border)] shadow-[0_18px_48px_rgba(2,10,26,0.35)]"
        style={{ aspectRatio: `${REGION.width} / ${REGION.height}`, background: '#F8F6F1' }}
      >
        <div ref={stageRef} className="h-full w-full">
          <RegionChartCanvas />
        </div>
      </div>

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <div className="text-[13px] font-black text-[var(--text-primary)]">改数据</div>
        <p className="mt-2 text-[12px] leading-6 text-[var(--text-secondary)]">
          关键数字和明细行都在{' '}
          <code className="rounded bg-[var(--surface)] px-1">region-chart/regionChartData.js</code>。
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
