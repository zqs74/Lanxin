import React, { useState, useRef } from 'react'
import { Copy, Download, MousePointerClick } from 'lucide-react'
import FutureChartCanvas from './future-chart/FutureChartCanvas.jsx'
import { FUTURE, formatNumber, tint } from './future-chart/futureChartData.js'
import {
  renderCanvasPng,
  copyPngToClipboard,
  downloadBlob,
} from './shared/canvasExport.js'

/**
 * 未来规划 · 数字化数据积累 工作台
 *
 * 交互层级 = 方案 A：整张卡片都是点击热区，卡内不再放白色胶囊，
 * 「查看球员档案 →」只作为文字链接提示入口。
 * hover：边框加深 + 轻微上浮 + 阴影变深；active：整卡按下（scale 0.97）+ 阴影变浅。
 */
export default function FutureChartStudio() {
  const [counts, setCounts] = useState(() => FUTURE.items.map((item) => Number(item.value)))
  const [pressed, setPressed] = useState('')
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const stageRef = useRef(null)

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const bump = (key) => {
    const index = FUTURE.items.findIndex((item) => item.key === key)
    setCounts((current) => current.map((value, i) => (i === index ? value + 1 : value)))
    setPressed(key)
    window.setTimeout(() => setPressed(''), 260)
  }

  const resetCounts = () => setCounts(FUTURE.items.map((item) => Number(item.value)))

  const makePng = () =>
    renderCanvasPng(stageRef.current, { width: FUTURE.width, height: FUTURE.height })

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
      downloadBlob(await makePng(), `数字化数据积累-${FUTURE.width * 2}x${FUTURE.height * 2}.png`)
      notify('已下载 PNG')
    } catch (error) {
      notify(`下载失败：${error.message}`)
    } finally {
      setBusy('')
    }
  }

  const delta = (index) => counts[index] - Number(FUTURE.items[index].value)

  return (
    <div className="animate-fade-in space-y-5">
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
        <h1 className="text-[20px] font-black text-[var(--text-primary)]">数字化数据积累</h1>
        <p className="mt-2 max-w-[900px] text-[13px] leading-6 text-[var(--text-secondary)]">
          PPT 第 26 页「未来规划」那张手机截图的位置。交互按方案 A —— <b>整张卡片都是点击热区</b>，
          卡内不再放白色胶囊，「查看球员档案 →」只是入口提示。鼠标移上去边框会加深、卡片轻轻浮起，
          按下时整卡下沉、数字 +1。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-3 py-1">
            <MousePointerClick className="h-3.5 w-3.5" />
            整卡可点，点一下数字 +1
          </span>
          <button
            type="button"
            onClick={resetCounts}
            className="rounded-full border border-[var(--border)] px-3 py-1 font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand)]"
          >
            重置
          </button>
          <span className="text-[11px]">
            {counts.map((value, index) => `${formatNumber(value)}${FUTURE.items[index].unit}`).join(' · ')}
          </span>
        </div>
      </section>

      {/* 整卡可点的按钮列表 */}
      <section className="mx-auto w-full max-w-[640px] space-y-4">
        {FUTURE.items.map((item, index) => {
          const isPressed = pressed === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => bump(item.key)}
              className="group block w-full rounded-[16px] border px-5 pb-7 pt-5 text-left transition-all duration-150 ease-out"
              style={{
                background: `linear-gradient(180deg, ${tint(item.color, 0.26)} 0%, ${tint(item.color, 0.4)} 100%)`,
                borderColor: isPressed ? item.color : tint(item.color, 0.34),
                boxShadow: isPressed
                  ? '0 1px 4px rgba(14,27,44,0.08)'
                  : '0 4px 16px rgba(14,27,44,0.10)',
                transform: isPressed ? 'scale(0.97)' : 'scale(1)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-[15px] font-bold text-[var(--text-primary)]">{item.label}</span>
                <span
                  className="shrink-0 text-[12px] font-bold opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  style={{ color: item.color }}
                >
                  {delta(index) > 0 ? `+${delta(index)}` : '点击查看'}
                </span>
              </div>

              <div className="mt-1 flex items-end gap-1.5">
                <span
                  className="text-[40px] font-black leading-none"
                  style={{ color: item.color }}
                >
                  {formatNumber(counts[index])}
                </span>
                <span className="pb-0.5 text-[15px] font-bold text-[var(--text-muted)]">{item.unit}</span>
              </div>

              <div
                className="mt-5 inline-block border-b text-[13px] font-bold"
                style={{ color: item.color, borderColor: tint(item.color, 0.45) }}
              >
                {item.detail} →
              </div>
            </button>
          )
        })}
      </section>

      {/* 静态导出图 */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[14px] font-black text-[var(--text-primary)]">导出图（贴 PPT 用）</div>
            <div className="text-[11px] text-[var(--text-muted)]">
              {FUTURE.width}×{FUTURE.height} · 数字取初值，不含 hover / 点击态
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
          className="mx-auto max-w-[420px] overflow-hidden rounded-[14px] border border-[var(--border)]"
          style={{ aspectRatio: `${FUTURE.width} / ${FUTURE.height}`, background: '#FFFFFF' }}
        >
          <div ref={stageRef} className="h-full w-full">
            <FutureChartCanvas />
          </div>
        </div>
      </section>

      {toast ? (
        <div className="fixed bottom-8 left-1/2 z-[140] -translate-x-1/2 rounded-full bg-[var(--text-primary)] px-5 py-2 text-[12px] font-semibold text-[var(--surface)] shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
