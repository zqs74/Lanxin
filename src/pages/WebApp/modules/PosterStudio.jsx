import React, { useRef, useState } from 'react'
import { Copy, Download, Maximize2, X } from 'lucide-react'
import MvpPosterCanvas from './poster/MvpPosterCanvas.jsx'
import { POSTER } from './poster/posterData.js'
import {
  renderCanvasPng,
  copyPngToClipboard,
  downloadBlob,
} from './shared/canvasExport.js'

/**
 * 球员交付海报工作台
 * 为 PPT「核心业务三 赛事数据服务 → 球员/球队交付海报」出图（700×1000，0.7:1）
 */
export default function PosterStudio() {
  const [focusMode, setFocusMode] = useState(false)
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const stageRef = useRef(null)

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const makePng = () =>
    renderCanvasPng(stageRef.current, { width: POSTER.width, height: POSTER.height })

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
      downloadBlob(await makePng(), `球员交付海报-${POSTER.width * 2}x${POSTER.height * 2}.png`)
      notify('已下载 PNG（1400×2000）')
    } catch (error) {
      notify(`下载失败：${error.message}`)
    } finally {
      setBusy('')
    }
  }

  const posterBlock = (
    <div
      className="mx-auto w-full max-w-[560px] overflow-hidden rounded-[18px] border border-[var(--border)] shadow-[0_18px_48px_rgba(2,10,26,0.35)]"
      style={{ aspectRatio: `${POSTER.width} / ${POSTER.height}` }}
    >
      <div ref={stageRef} className="h-full w-full">
        <MvpPosterCanvas />
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
        <div className="flex w-full max-w-[900px] flex-wrap items-center justify-between gap-3">
          <div className="text-[13px] font-semibold text-white/80">
            球员交付海报 · {POSTER.width}×{POSTER.height}
          </div>
          <div className="flex flex-wrap gap-2">{actionButtons}</div>
        </div>
        <div className="w-full max-w-[900px]">{posterBlock}</div>
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
            <h1 className="text-[20px] font-black text-[var(--text-primary)]">球员交付海报</h1>
            <p className="mt-2 max-w-[820px] text-[13px] leading-6 text-[var(--text-secondary)]">
              给 PPT「核心业务三 赛事数据服务」右下那张海报用，{POSTER.width}×{POSTER.height}（0.7:1 竖版）。
              左上角是昇梦 logo，主图用的是项目里的真实球员照片，数据可以随便改。点「复制图片」后到 PPT 里 Ctrl+V 粘贴。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">{actionButtons}</div>
        </div>
      </section>

      {posterBlock}

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <div className="text-[13px] font-black text-[var(--text-primary)]">改内容</div>
        <p className="mt-2 text-[12px] leading-6 text-[var(--text-secondary)]">
          球员姓名 / 号码 / 球队 / 三项主数据 / 底部小字都在{' '}
          <code className="rounded bg-[var(--surface)] px-1">poster/posterData.js</code>
          ；换照片改同文件里的 <code className="rounded bg-[var(--surface)] px-1">photo</code>（放{' '}
          <code className="rounded bg-[var(--surface)] px-1">public/images/</code> 下即可）。
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
