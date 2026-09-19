import React, { useRef, useState } from 'react'
import { Copy, Download } from 'lucide-react'
import { HighlightCanvas, DataOutputCanvas } from './tech-charts/TechChartCanvas.jsx'
import { HIGHLIGHT_CANVAS, OUTPUT_CANVAS } from './tech-charts/techChartData.js'
import {
  renderCanvasPng,
  copyPngToClipboard,
  downloadBlob,
} from './shared/canvasExport.js'

const CHARTS = [
  {
    key: 'highlight',
    name: '赛事高光智能识别技术拆解',
    hint: 'PPT 技术优势二用 · 横版实时识别界面（画面 + 检测框 + 高光标记列表）',
    size: HIGHLIGHT_CANVAS,
    Comp: HighlightCanvas,
  },
  {
    key: 'output',
    name: 'Step4 · 数据产出',
    hint: 'PPT 技术优势三用 · 竖版，三个产物窗口竖排',
    size: OUTPUT_CANVAS,
    Comp: DataOutputCanvas,
  },
]

function ChartCard({ chart }) {
  const stageRef = useRef(null)
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const { Comp, size } = chart

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const makePng = () =>
    renderCanvasPng(stageRef.current, { width: size.width, height: size.height })

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
      downloadBlob(await makePng(), `${chart.name}-${size.width * 2}x${size.height * 2}.png`)
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
          <div className="text-[14px] font-black text-[var(--text-primary)]">{chart.name}</div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {chart.hint} · {size.width}×{size.height}
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
        className={`overflow-hidden rounded-[14px] border border-[var(--border)] ${chart.key === 'output' ? 'mx-auto max-w-[560px]' : ''}`}
        style={{ aspectRatio: `${size.width} / ${size.height}`, background: '#F8F6F1' }}
      >
        <div ref={stageRef} className="h-full w-full">
          <Comp />
        </div>
      </div>

      {toast ? <div className="mt-2 text-[12px] font-semibold text-[var(--brand)]">{toast}</div> : null}
    </section>
  )
}

/**
 * 技术优势配图工作台
 * 出两张图：高光识别技术拆解（技术优势二，横版）、Step4 数据产出（技术优势三，竖版）
 */
export default function TechChartStudio() {
  return (
    <div className="animate-fade-in space-y-5">
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
        <h1 className="text-[20px] font-black text-[var(--text-primary)]">技术优势配图</h1>
        <p className="mt-2 max-w-[880px] text-[13px] leading-6 text-[var(--text-secondary)]">
          两张图分别对应 PPT 第 17 页「赛事高光智能识别技术拆解」和第 18 页「Step4 数据产出」被框住的那两块，
          做成真实系统界面的样子，文案和数字取自 PPT 原文。每张可以单独复制或下载。
        </p>
      </section>

      {CHARTS.map((chart) => (
        <ChartCard key={chart.key} chart={chart} />
      ))}

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <div className="text-[13px] font-black text-[var(--text-primary)]">改内容</div>
        <p className="mt-2 text-[12px] leading-6 text-[var(--text-secondary)]">
          两张图的标题、识别事件、训练项、成长曲线、数字都在{' '}
          <code className="rounded bg-[var(--surface)] px-1">tech-charts/techChartData.js</code>。
        </p>
      </section>
    </div>
  )
}
