import React, { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Copy, Download, Maximize2, X } from 'lucide-react'
import { SchemeA } from './brand-linkage/LinkageSchemes.jsx'
import { CANVAS, BACKDROPS, MERCHANTS } from './brand-linkage/linkageData.js'

const SCHEME_LIST = [
  {
    key: 'a',
    label: '方案 A · 联动商家墙',
    hint: '15 个品牌 logo 按 5 列 × 3 行铺开，卡片和 logo 尺寸都是最大的，辨识度最高。方案 B / C 已停用，代码存档在 brand-linkage/archive/。',
    Comp: SchemeA,
  },
]

const BG_LIST = Object.values(BACKDROPS)

/**
 * 联动商家图谱工作台
 * 为 PPT「业务概述 · 业务二 赛事营销服务」生成可替换配图（1600×640）
 */
export default function BrandLinkageStudio() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlScheme = searchParams.get('scheme')
  const urlBg = searchParams.get('bg')

  const [scheme, setScheme] = useState(
    SCHEME_LIST.some((item) => item.key === urlScheme) ? urlScheme : 'a'
  )
  const [bg, setBg] = useState(BACKDROPS[urlBg] ? urlBg : 'deep')
  const [focusMode, setFocusMode] = useState(false)
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const stageRef = useRef(null)

  const theme = BACKDROPS[bg]
  const active = SCHEME_LIST.find((item) => item.key === scheme) ?? SCHEME_LIST[0]
  const Scheme = active.Comp

  const syncUrl = (patch) => {
    const next = new URLSearchParams(searchParams)
    next.set('view', 'linkage')
    next.set('scheme', patch.scheme ?? scheme)
    next.set('bg', patch.bg ?? bg)
    setSearchParams(next, { replace: true })
  }

  const applyScheme = (key) => {
    setScheme(key)
    syncUrl({ scheme: key })
  }

  const applyBg = (key) => {
    setBg(key)
    syncUrl({ bg: key })
  }

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const renderPng = async (scale = 2) => {
    const svg = stageRef.current?.querySelector('svg')
    if (!svg) throw new Error('画布还没准备好')

    const clone = svg.cloneNode(true)
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', String(CANVAS.width))
    clone.setAttribute('height', String(CANVAS.height))

    const markup = new XMLSerializer().serializeToString(clone)
    const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }))

    try {
      const image = await new Promise((resolve, reject) => {
        const node = new Image()
        node.onload = () => resolve(node)
        node.onerror = () => reject(new Error('画布渲染失败'))
        node.src = url
      })

      const canvas = document.createElement('canvas')
      canvas.width = CANVAS.width * scale
      canvas.height = CANVAS.height * scale
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = theme.from
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      return await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('导出失败'))), 'image/png')
      })
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const handleCopy = async () => {
    setBusy('copy')
    try {
      if (!navigator.clipboard || typeof window.ClipboardItem === 'undefined') {
        throw new Error('当前浏览器不支持复制图片，请改用「下载 PNG」')
      }
      const blob = await renderPng(2)
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })])
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
      const blob = await renderPng(2)
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `联动商家图-方案${scheme.toUpperCase()}-${theme.name}-${CANVAS.width * 2}x${CANVAS.height * 2}.png`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(link.href), 5000)
      notify('已下载 PNG（3200×1280）')
    } catch (error) {
      notify(`下载失败：${error.message}`)
    } finally {
      setBusy('')
    }
  }

  const canvasBlock = (
    <div
      className="w-full overflow-hidden rounded-[18px] border border-[var(--border)] shadow-[0_18px_48px_rgba(2,10,26,0.35)]"
      style={{ aspectRatio: `${CANVAS.width} / ${CANVAS.height}`, background: theme.from }}
    >
      <div ref={stageRef} className="h-full w-full">
        <Scheme theme={theme} />
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

  const pickers = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {SCHEME_LIST.map((item, index) => {
          const isActive = item.key === scheme
          return (
            <button
              key={item.key}
              type="button"
              data-scheme={item.key}
              onClick={() => applyScheme(item.key)}
              className={`inline-flex items-center gap-2 rounded-[14px] border px-3 py-2 text-[12px] font-semibold transition ${
                isActive
                  ? 'border-[var(--brand)] bg-[var(--brand)]/12 text-[var(--brand)]'
                  : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-[var(--brand)]/40'
              }`}
            >
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-black text-[var(--text-muted)]">
                {index + 1}
              </span>
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-semibold text-[var(--text-muted)]">背景</span>
        {BG_LIST.map((item) => {
          const isActive = item.key === bg
          return (
            <button
              key={item.key}
              type="button"
              data-bg={item.key}
              onClick={() => applyBg(item.key)}
              className={`inline-flex items-center gap-2 rounded-[14px] border px-3 py-2 text-[12px] font-semibold transition ${
                isActive
                  ? 'border-[var(--brand)] bg-[var(--brand)]/12 text-[var(--brand)]'
                  : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-[var(--brand)]/40'
              }`}
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/10"
                style={{ background: `linear-gradient(135deg, ${item.from}, ${item.to})` }}
              />
              {item.name}
            </button>
          )
        })}
      </div>
    </div>
  )

  if (focusMode) {
    return (
      <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-4 bg-[#040B18] p-6">
        <div className="flex w-full max-w-[1520px] flex-wrap items-center justify-between gap-3">
          <div className="text-[13px] font-semibold text-white/80">
            {active.label} · {theme.name} · {CANVAS.width}×{CANVAS.height}
          </div>
          <div className="flex flex-wrap gap-2">{actionButtons}</div>
        </div>
        <div className="w-full max-w-[1520px]">{canvasBlock}</div>
        <div className="text-[12px] text-white/40">要截图的话按 F11 全屏，再用 Win+Shift+S 框选</div>
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
            <h1 className="text-[20px] font-black text-[var(--text-primary)]">联动商家图谱</h1>
            <p className="mt-2 max-w-[840px] text-[13px] leading-6 text-[var(--text-secondary)]">
              PPT 配图，{CANVAS.width}×{CANVAS.height}（约 1.65:1）。
              品牌 logo 是外部矢量源（Simple Icons / WorldVectorLogo）下载后内联进画布的，导出 PNG 不依赖网络。
              点「复制图片」后到 PPT 里 Ctrl+V 粘贴即可。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">{actionButtons}</div>
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
        {pickers}
        <p className="mt-3 text-[12px] leading-6 text-[var(--text-muted)]">{active.hint}</p>
      </section>

      {canvasBlock}

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <div className="text-[13px] font-black text-[var(--text-primary)]">怎么改</div>
        <ul className="mt-2 space-y-1 text-[12px] leading-6 text-[var(--text-secondary)]">
          <li>
            换品牌 / 换顺序 / 改中文名：<code className="rounded bg-[var(--surface)] px-1">brand-linkage/linkageData.js</code> 里的
            <code className="rounded bg-[var(--surface)] px-1">MERCHANTS</code>（当前 {MERCHANTS.length} 个品牌）。
          </li>
          <li>
            重新抓 logo：在 Lanxin-UI 目录跑 <code className="rounded bg-[var(--surface)] px-1">node scripts/fetch-brand-logos.mjs</code>，
            会重新下载矢量源并重建 <code className="rounded bg-[var(--surface)] px-1">logoData.js</code>。
          </li>
          <li>数字口径沿用 PPT 原文：联动赛事品牌 25 家、覆盖 10.7w 人次、私域流量池 52 万用户。</li>
        </ul>
      </section>

      {toast ? (
        <div className="fixed bottom-8 left-1/2 z-[140] -translate-x-1/2 rounded-full bg-[var(--text-primary)] px-5 py-2 text-[12px] font-semibold text-[var(--surface)] shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
