import React, { useRef, useState } from 'react'
import { Copy, Download, Maximize2, X } from 'lucide-react'
import LibraryCanvas from './video-library/LibraryCanvas.jsx'
import { LIBRARY_CANVAS } from './video-library/libraryData.js'
import {
  renderCanvasPng,
  copyPngToClipboard,
  downloadBlob,
} from './shared/canvasExport.js'

/**
 * 视频素材库图工作台
 * 为 PPT「比赛视频 | 赛事影像覆盖 1000+ 场」那页出图（1200×700，桌面软件界面）
 */
export default function VideoLibraryStudio() {
  const [focusMode, setFocusMode] = useState(false)
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const stageRef = useRef(null)

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const makePng = () =>
    renderCanvasPng(stageRef.current, { width: LIBRARY_CANVAS.width, height: LIBRARY_CANVAS.height })

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
      downloadBlob(
        await makePng(),
        `视频素材库-${LIBRARY_CANVAS.width * 2}x${LIBRARY_CANVAS.height * 2}.png`
      )
      notify('已下载 PNG')
    } catch (error) {
      notify(`下载失败：${error.message}`)
    } finally {
      setBusy('')
    }
  }

  const canvasBlock = (
    <div
      className="w-full overflow-hidden rounded-[18px] border border-[var(--border)] shadow-[0_18px_48px_rgba(2,10,26,0.18)]"
      style={{ aspectRatio: `${LIBRARY_CANVAS.width} / ${LIBRARY_CANVAS.height}` }}
    >
      <div ref={stageRef} className="h-full w-full">
        <LibraryCanvas />
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
            视频素材库 · {LIBRARY_CANVAS.width}×{LIBRARY_CANVAS.height}
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
            <h1 className="text-[20px] font-black text-[var(--text-primary)]">视频素材库</h1>
            <p className="mt-2 max-w-[840px] text-[13px] leading-6 text-[var(--text-secondary)]">
              PPT「比赛视频 | 赛事影像覆盖 1000+ 场」那页配图，{LIBRARY_CANVAS.width}×{LIBRARY_CANVAS.height}。
              桌面软件界面（标题栏 / 菜单栏 / 工具栏 / 左导航 / 筛选条 + 素材缩略图网格 / 右侧素材详情 / 状态栏），
              9 张封面全部来自项目现有真实素材（村BA 航拍、锦标赛合影、场馆空镜、CBA 现场等），
              素材总量 8740+ 条与宣发 10+ 平台取自 PPT 原文。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">{actionButtons}</div>
        </div>
      </section>

      {canvasBlock}

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <div className="text-[13px] font-black text-[var(--text-primary)]">改数据</div>
        <p className="mt-2 text-[12px] leading-6 text-[var(--text-secondary)]">
          导航分类、筛选标签、9 条素材（标题 / 时长 / 赛事 / 是否收藏）、右侧详情与状态栏都在{' '}
          <code className="rounded bg-[var(--surface)] px-1">video-library/libraryData.js</code>
          ；封面图在{' '}
          <code className="rounded bg-[var(--surface)] px-1">public/images/library/</code>
          （lib-01 ~ lib-09，由项目现有素材压到 420 宽生成）。
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
