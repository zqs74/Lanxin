import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CopyPlus, Grip, MoveDiagonal, Trash2 } from 'lucide-react'
import { cloneStudioDocument, sortElementsByZIndex } from '../data/studioDocument.js'

const SNAP_THRESHOLD = 8
const MIN_WIDTH = 72
const MIN_HEIGHT = 36

function useCanvasScale(logicalWidth) {
  const containerRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect?.width ?? 0
      setViewportWidth(nextWidth)
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const scale = viewportWidth > 0 ? Math.min(viewportWidth / logicalWidth, 1) : 1
  return { containerRef, scale }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function roundGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize
}

function getFrameLines(frame) {
  return {
    left: frame.x,
    centerX: frame.x + frame.w / 2,
    right: frame.x + frame.w,
    top: frame.y,
    centerY: frame.y + frame.h / 2,
    bottom: frame.y + frame.h,
  }
}

function collectGuideCandidates(elements, currentId, canvas) {
  const vertical = [{ value: canvas.width / 2, source: 'canvas' }]
  const horizontal = [{ value: canvas.height / 2, source: 'canvas' }]

  elements.forEach((element) => {
    if (element.id === currentId) return
    const lines = getFrameLines(element.frame)
    vertical.push({ value: lines.left, source: element.id })
    vertical.push({ value: lines.centerX, source: element.id })
    vertical.push({ value: lines.right, source: element.id })
    horizontal.push({ value: lines.top, source: element.id })
    horizontal.push({ value: lines.centerY, source: element.id })
    horizontal.push({ value: lines.bottom, source: element.id })
  })

  return { vertical, horizontal }
}

function snapFrame(frame, action, elementId, document) {
  const gridSize = document.canvas.gridSize
  let nextFrame = {
    ...frame,
    x: roundGrid(frame.x, gridSize),
    y: roundGrid(frame.y, gridSize),
    w: Math.max(MIN_WIDTH, roundGrid(frame.w, gridSize)),
    h: Math.max(MIN_HEIGHT, roundGrid(frame.h, gridSize)),
  }

  const guides = { vertical: [], horizontal: [] }
  const candidates = collectGuideCandidates(document.elements, elementId, document.canvas)
  const nextLines = getFrameLines(nextFrame)

  const xAnchors = action === 'move'
    ? [
        { key: 'left', value: nextLines.left },
        { key: 'centerX', value: nextLines.centerX },
        { key: 'right', value: nextLines.right },
      ]
    : []
  const yAnchors = action === 'move'
    ? [
        { key: 'top', value: nextLines.top },
        { key: 'centerY', value: nextLines.centerY },
        { key: 'bottom', value: nextLines.bottom },
      ]
    : []

  if (action !== 'move') {
    if (action.includes('w')) xAnchors.push({ key: 'left', value: nextLines.left })
    if (action.includes('e')) xAnchors.push({ key: 'right', value: nextLines.right })
    if (action.includes('n')) yAnchors.push({ key: 'top', value: nextLines.top })
    if (action.includes('s')) yAnchors.push({ key: 'bottom', value: nextLines.bottom })
  }

  let bestX = null
  xAnchors.forEach((anchor) => {
    candidates.vertical.forEach((candidate) => {
      const delta = candidate.value - anchor.value
      if (Math.abs(delta) <= SNAP_THRESHOLD && (!bestX || Math.abs(delta) < Math.abs(bestX.delta))) {
        bestX = { delta, candidate: candidate.value, anchor: anchor.key }
      }
    })
  })

  if (bestX) {
    if (action === 'move') {
      nextFrame.x += bestX.delta
    } else if (bestX.anchor === 'left') {
      const right = nextFrame.x + nextFrame.w
      nextFrame.x += bestX.delta
      nextFrame.w = Math.max(MIN_WIDTH, right - nextFrame.x)
    } else if (bestX.anchor === 'right') {
      nextFrame.w = Math.max(MIN_WIDTH, nextFrame.w + bestX.delta)
    } else if (bestX.anchor === 'centerX') {
      nextFrame.x += bestX.delta
    }
    guides.vertical.push(bestX.candidate)
  }

  let bestY = null
  yAnchors.forEach((anchor) => {
    candidates.horizontal.forEach((candidate) => {
      const delta = candidate.value - anchor.value
      if (Math.abs(delta) <= SNAP_THRESHOLD && (!bestY || Math.abs(delta) < Math.abs(bestY.delta))) {
        bestY = { delta, candidate: candidate.value, anchor: anchor.key }
      }
    })
  })

  if (bestY) {
    if (action === 'move') {
      nextFrame.y += bestY.delta
    } else if (bestY.anchor === 'top') {
      const bottom = nextFrame.y + nextFrame.h
      nextFrame.y += bestY.delta
      nextFrame.h = Math.max(MIN_HEIGHT, bottom - nextFrame.y)
    } else if (bestY.anchor === 'bottom') {
      nextFrame.h = Math.max(MIN_HEIGHT, nextFrame.h + bestY.delta)
    } else if (bestY.anchor === 'centerY') {
      nextFrame.y += bestY.delta
    }
    guides.horizontal.push(bestY.candidate)
  }

  nextFrame.x = clamp(nextFrame.x, 0, document.canvas.width - MIN_WIDTH)
  nextFrame.y = clamp(nextFrame.y, 0, document.canvas.height - MIN_HEIGHT)
  nextFrame.w = clamp(nextFrame.w, MIN_WIDTH, document.canvas.width - nextFrame.x)
  nextFrame.h = clamp(nextFrame.h, MIN_HEIGHT, document.canvas.height - nextFrame.y)

  return { frame: nextFrame, guides }
}

function ChildHandle({ active, label, rect, onPointerDown, onClick }) {
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={`absolute rounded-[12px] border text-left transition ${
        active
          ? 'border-[var(--brand)] bg-[var(--brand)]/10 shadow-[0_0_0_1px_var(--brand)]'
          : 'border-transparent bg-transparent hover:border-[var(--brand)]/45 hover:bg-[var(--brand)]/6'
      }`}
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
    >
      {active ? (
        <span className="absolute left-2 top-1 rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold text-white">
          {label}
        </span>
      ) : null}
    </button>
  )
}

function SelectionOutline({ showHandles, onResizeStart }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-[var(--brand)] shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset]" />
      {showHandles
        ? [
            { key: 'nw', left: -6, top: -6, cursor: 'nwse-resize' },
            { key: 'ne', right: -6, top: -6, cursor: 'nesw-resize' },
            { key: 'sw', left: -6, bottom: -6, cursor: 'nesw-resize' },
            { key: 'se', right: -6, bottom: -6, cursor: 'nwse-resize' },
          ].map((handle) => (
            <button
              key={handle.key}
              type="button"
              onPointerDown={(event) => onResizeStart(event, handle.key)}
              className="absolute h-4 w-4 rounded-full border-2 border-white bg-[var(--brand)] shadow-[0_6px_12px_rgba(15,23,42,0.16)]"
              style={handle}
            />
          ))
        : null}
    </>
  )
}

function getChildRect(element, childKey) {
  const { w, h } = element.frame
  const layout = element.subLayout?.[childKey] ?? {}

  const presets = {
    playerCard: {
      photoFrame: { left: 18, top: 18, width: 172, height: h - 36 },
      nameBlock: { left: 228, top: 28, width: 220, height: 48 },
      numberBlock: { left: 456, top: 28, width: 120, height: 48 },
      infoBlock: { left: 228, top: 96, width: w - 252, height: 112 },
      footerTag: { left: 228, top: h - 74, width: 220, height: 36 },
    },
    growthChart: {
      title: { left: 0, top: 10, width: w, height: 34 },
      valueLabels: { left: 40, top: 50, width: w - 60, height: h - 90 },
      monthLabels: { left: 44, top: h - 46, width: w - 72, height: 28 },
    },
    radarChart: {
      title: { left: 0, top: 8, width: w, height: 34 },
      metricLabels: { left: 18, top: 44, width: w - 36, height: h - 112 },
      valueLabels: { left: 28, top: 64, width: w - 56, height: h - 148 },
      legend: { left: 34, top: h - 42, width: w - 68, height: 24 },
    },
    barChart: {
      title: { left: 0, top: 8, width: w, height: 34 },
      valueLabels: { left: 26, top: 44, width: w - 52, height: h - 130 },
      categoryLabels: { left: 26, top: h - 78, width: w - 52, height: 30 },
      legend: { left: 30, top: h - 42, width: w - 60, height: 24 },
    },
    dataTable: {
      title: { left: 24, top: 18, width: 220, height: 30 },
      header: { left: 18, top: 58, width: w - 36, height: 36 },
      body: { left: 18, top: 96, width: w - 36, height: h - 114 },
    },
    titleText: {
      text: { left: 0, top: 0, width: w, height: h },
    },
    bodyText: {
      text: { left: 0, top: 0, width: w, height: h },
    },
    badge: {
      text: { left: 0, top: 0, width: w, height: h },
    },
    colorBlock: {
      text: { left: 0, top: 0, width: w, height: h },
    },
    divider: {},
    imageFrame: {
      image: { left: 14, top: 14, width: w - 28, height: h - 54 },
      caption: { left: 14, top: h - 34, width: w - 28, height: 20 },
    },
  }

  const rect = presets[element.type]?.[childKey]
  if (!rect) return null

  return {
    left: rect.left + (layout.x ?? 0),
    top: rect.top + (layout.y ?? 0),
    width: rect.width,
    height: rect.height,
  }
}

function GrowthChartRenderer({ element }) {
  const { w, h } = element.frame
  const pad = { left: 58, right: 28, top: 56, bottom: 56 }
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom
  const labelsOffset = element.subLayout?.valueLabels ?? {}
  const monthOffset = element.subLayout?.monthLabels ?? {}
  const titleOffset = element.subLayout?.title ?? {}
  const months = element.data.labels
  const primary = element.data.series[0]
  const secondary = element.data.series[1]
  const xAt = (index) => pad.left + (chartW / (months.length - 1)) * index
  const yAt = (value) => pad.top + chartH - (value / 100) * chartH

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit] bg-white">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
        {[0, 20, 40, 60, 80, 100].map((tick) => (
          <g key={tick}>
            <line x1={pad.left} y1={yAt(tick)} x2={w - pad.right} y2={yAt(tick)} stroke={element.style.gridColor} strokeWidth="1" />
            <text x={pad.left - 10} y={yAt(tick) + 4} textAnchor="end" fontSize="16" fill="#475569">
              {tick}
            </text>
          </g>
        ))}

        <text
          x={w / 2 + (titleOffset.x ?? 0)}
          y={34 + (titleOffset.y ?? 0)}
          textAnchor="middle"
          fontSize={titleOffset.fontSize ?? 28}
          fontWeight="900"
          fill={titleOffset.color ?? '#0f172a'}
        >
          {element.data.title}
        </text>

        <polyline
          fill="none"
          stroke={primary.color}
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={primary.values.map((value, index) => `${xAt(index)},${yAt(value)}`).join(' ')}
        />
        <polyline
          fill="none"
          stroke={secondary.color}
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={secondary.values.map((value, index) => `${xAt(index)},${yAt(value)}`).join(' ')}
        />

        {primary.values.map((value, index) => (
          <g key={`primary-${index}`}>
            <circle cx={xAt(index)} cy={yAt(value)} r="8" fill={primary.color} />
            <text
              x={xAt(index) + (labelsOffset.x ?? 0) + (index === 0 ? 14 : index === 4 ? -10 : 0)}
              y={yAt(value) + (labelsOffset.y ?? 0) - 14}
              textAnchor={index === 4 ? 'end' : index === 0 ? 'start' : 'middle'}
              fontSize={labelsOffset.fontSize ?? 18}
              fontWeight="900"
              fill={labelsOffset.color ?? '#334155'}
            >
              {value}
            </text>
          </g>
        ))}
        {secondary.values.map((value, index) => (
          <g key={`secondary-${index}`}>
            <circle cx={xAt(index)} cy={yAt(value)} r="8" fill={secondary.color} />
            <text
              x={xAt(index) + (labelsOffset.x ?? 0) + (index === 0 ? -22 : 0)}
              y={yAt(value) + (labelsOffset.y ?? 0) + (index === 0 ? -14 : 28)}
              textAnchor={index === 0 ? 'end' : 'middle'}
              fontSize={labelsOffset.fontSize ?? 18}
              fontWeight="900"
              fill={labelsOffset.color ?? '#475569'}
            >
              {value}
            </text>
          </g>
        ))}

        {months.map((label, index) => (
          <text
            key={label}
            x={xAt(index) + (monthOffset.x ?? 0)}
            y={h - 18 + (monthOffset.y ?? 0)}
            textAnchor="middle"
            fontSize={monthOffset.fontSize ?? 16}
            fontWeight="700"
            fill={monthOffset.color ?? '#475569'}
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
}

function RadarChartRenderer({ element }) {
  const { w, h } = element.frame
  const titleLayout = element.subLayout?.title ?? {}
  const metricLayout = element.subLayout?.metricLabels ?? {}
  const valueLayout = element.subLayout?.valueLabels ?? {}
  const legendLayout = element.subLayout?.legend ?? {}
  const center = { x: w / 2, y: h / 2 - 12 }
  const radius = Math.min(w, h) * 0.27
  const metrics = element.data.metrics
  const pointAt = (ratio, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / metrics.length
    return {
      x: center.x + Math.cos(angle) * radius * ratio,
      y: center.y + Math.sin(angle) * radius * ratio,
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit] bg-white">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
        <text
          x={w / 2 + (titleLayout.x ?? 0)}
          y={34 + (titleLayout.y ?? 0)}
          textAnchor="middle"
          fontSize={titleLayout.fontSize ?? 30}
          fontWeight="900"
          fill={titleLayout.color ?? '#0f172a'}
        >
          {element.data.title}
        </text>

        {[0.2, 0.4, 0.6, 0.8, 1].map((ratio) => (
          <polygon
            key={ratio}
            points={metrics.map((_, index) => `${pointAt(ratio, index).x},${pointAt(ratio, index).y}`).join(' ')}
            fill={ratio === 1 ? 'rgba(37,99,235,0.04)' : 'none'}
            stroke={element.style.gridColor}
            strokeWidth="2"
          />
        ))}

        {metrics.map((metric, index) => (
          <line key={`axis-${metric.label}`} x1={center.x} y1={center.y} x2={pointAt(1, index).x} y2={pointAt(1, index).y} stroke={element.style.gridColor} strokeWidth="2" />
        ))}

        <polygon
          points={metrics.map((metric, index) => `${pointAt(metric.current / 100, index).x},${pointAt(metric.current / 100, index).y}`).join(' ')}
          fill="rgba(47,121,200,0.26)"
          stroke={element.style.accentColor}
          strokeWidth="5"
        />
        <polygon
          points={metrics.map((metric, index) => `${pointAt(metric.previous / 100, index).x},${pointAt(metric.previous / 100, index).y}`).join(' ')}
          fill="rgba(212,175,55,0.14)"
          stroke={element.style.secondaryColor}
          strokeWidth="3"
        />

        {metrics.map((metric, index) => {
          const labelPoint = pointAt(1.28, index)
          const valuePoint = pointAt(1.08, index)
          const anchor = labelPoint.x < center.x - 20 ? 'end' : labelPoint.x > center.x + 20 ? 'start' : 'middle'
          return (
            <g key={metric.label}>
              <text
                x={labelPoint.x + (metricLayout.x ?? 0)}
                y={labelPoint.y + (metricLayout.y ?? 0)}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={metricLayout.fontSize ?? 22}
                fontWeight="900"
                fill={metricLayout.color ?? '#1f2937'}
              >
                {metric.label}
              </text>
              <text
                x={valuePoint.x + (valueLayout.x ?? 0)}
                y={valuePoint.y + (valueLayout.y ?? 0)}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={valueLayout.fontSize ?? 18}
                fontWeight="900"
                fill={valueLayout.color ?? '#334155'}
              >
                {metric.current}
              </text>
            </g>
          )
        })}

        <rect x={28 + (legendLayout.x ?? 0)} y={h - 34 + (legendLayout.y ?? 0)} width="16" height="10" rx="3" fill={element.style.secondaryColor} />
        <text x={52 + (legendLayout.x ?? 0)} y={h - 26 + (legendLayout.y ?? 0)} fontSize={legendLayout.fontSize ?? 14} fill={legendLayout.color ?? '#334155'}>
          {element.data.legendPrevious}
        </text>
        <rect x={w / 2 + (legendLayout.x ?? 0)} y={h - 34 + (legendLayout.y ?? 0)} width="16" height="10" rx="3" fill={element.style.accentColor} />
        <text x={w / 2 + 24 + (legendLayout.x ?? 0)} y={h - 26 + (legendLayout.y ?? 0)} fontSize={legendLayout.fontSize ?? 14} fill={legendLayout.color ?? '#334155'}>
          {element.data.legendCurrent}
        </text>
      </svg>
    </div>
  )
}

function BarChartRenderer({ element }) {
  const { w, h } = element.frame
  const titleLayout = element.subLayout?.title ?? {}
  const valueLayout = element.subLayout?.valueLabels ?? {}
  const categoryLayout = element.subLayout?.categoryLabels ?? {}
  const legendLayout = element.subLayout?.legend ?? {}
  const baseline = h - 94
  const maxBarHeight = h - 146
  const groupCenters = [w * 0.2, w * 0.5, w * 0.8]
  const barWidth = Math.max(14, Math.round(w * 0.035))
  const barGap = Math.max(10, Math.round(w * 0.026))
  const colors = [element.style.accentColor, element.style.secondaryColor, element.style.mutedColor]

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit] bg-white">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
        <text
          x={w / 2 + (titleLayout.x ?? 0)}
          y={32 + (titleLayout.y ?? 0)}
          textAnchor="middle"
          fontSize={titleLayout.fontSize ?? 30}
          fontWeight="900"
          fill={titleLayout.color ?? '#0f172a'}
        >
          {element.data.title}
        </text>

        {element.data.groups.map((group, groupIndex) => {
          const startX = groupCenters[groupIndex] - barWidth - barGap
          return (
            <g key={group.label}>
              {group.values.map((value, valueIndex) => {
                const heightRatio = value / group.max
                const barHeight = heightRatio * maxBarHeight
                const x = startX + valueIndex * (barWidth + barGap)
                const y = baseline - barHeight
                return (
                  <g key={`${group.label}-${valueIndex}`}>
                    <text
                      x={x + barWidth / 2 + (valueLayout.x ?? 0)}
                      y={y - 8 + (valueLayout.y ?? 0)}
                      textAnchor="middle"
                      fontSize={valueLayout.fontSize ?? 16}
                      fontWeight="900"
                      fill={valueLayout.color ?? '#334155'}
                    >
                      {value.toFixed(1)}
                    </text>
                    <rect x={x} y={y} width={barWidth} height={barHeight} rx="6" fill={colors[valueIndex]} />
                  </g>
                )
              })}

              <text
                x={groupCenters[groupIndex] + (categoryLayout.x ?? 0)}
                y={h - 52 + (categoryLayout.y ?? 0)}
                textAnchor="middle"
                fontSize={categoryLayout.fontSize ?? 16}
                fontWeight="900"
                fill={categoryLayout.color ?? '#1f2937'}
              >
                {element.data.categories[groupIndex]}
              </text>
            </g>
          )
        })}

        {element.data.legends.map((legend, index) => (
          <g key={legend}>
            <rect x={40 + index * 122 + (legendLayout.x ?? 0)} y={h - 34 + (legendLayout.y ?? 0)} width="16" height="10" rx="3" fill={colors[index]} />
            <text x={64 + index * 122 + (legendLayout.x ?? 0)} y={h - 26 + (legendLayout.y ?? 0)} fontSize={legendLayout.fontSize ?? 14} fill={legendLayout.color ?? '#475569'}>
              {legend}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function DataTableRenderer({ element }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit] bg-white px-6 py-5">
      <div
        className="text-[26px] font-black text-[#0f172a]"
        style={{
          transform: `translate(${element.subLayout?.title?.x ?? 0}px, ${element.subLayout?.title?.y ?? 0}px)`,
          fontSize: element.subLayout?.title?.fontSize ?? 22,
          color: element.subLayout?.title?.color ?? '#0f172a',
        }}
      >
        {element.data.title}
      </div>

      <div className="mt-4 overflow-hidden rounded-[18px] border border-[#d7dbe3]">
        <table className="w-full border-collapse text-left">
          <thead
            style={{
              transform: `translate(${element.subLayout?.header?.x ?? 0}px, ${element.subLayout?.header?.y ?? 0}px)`,
            }}
          >
            <tr className="bg-[#f8fafc] text-[13px] font-black text-[#475569]">
              {element.data.columns.map((column) => (
                <th key={column} className="border-b border-[#e2e8f0] px-4 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            style={{
              transform: `translate(${element.subLayout?.body?.x ?? 0}px, ${element.subLayout?.body?.y ?? 0}px)`,
            }}
          >
            {element.data.rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="border-b border-[#e2e8f0] text-[15px] text-[#1f2937] last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PlayerCardRenderer({ element }) {
  const nameLayout = element.subLayout?.nameBlock ?? {}
  const numberLayout = element.subLayout?.numberBlock ?? {}
  const infoLayout = element.subLayout?.infoBlock ?? {}
  const footerLayout = element.subLayout?.footerTag ?? {}
  const photoLayout = element.subLayout?.photoFrame ?? {}

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[inherit] border"
      style={{
        background: element.style.background,
        borderColor: element.style.borderColor,
        borderWidth: element.style.borderWidth,
        boxShadow: element.style.shadow,
      }}
    >
      <div className="grid h-full grid-cols-[184px_minmax(0,1fr)] gap-6 px-5 py-5">
        <div
          className="rounded-[22px] bg-[linear-gradient(180deg,#173757_0%,#0f2741_100%)] p-3"
          style={{ transform: `translate(${photoLayout.x ?? 0}px, ${photoLayout.y ?? 0}px)` }}
        >
          <div className="relative h-full overflow-hidden rounded-[18px]">
            <img src={element.data.photoUrl} alt={element.data.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,34,0.06)_0%,rgba(8,20,34,0.48)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-2 text-white">
              <span className="text-[11px] font-bold tracking-[0.2em]">{element.data.roleEn}</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">{element.data.badge}</span>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between">
          <div>
            <div className="flex items-end gap-5">
              <div
                className="font-black tracking-tight"
                style={{
                  transform: `translate(${nameLayout.x ?? 0}px, ${nameLayout.y ?? 0}px)`,
                  fontSize: nameLayout.fontSize ?? 42,
                  color: nameLayout.color ?? element.style.textColor,
                }}
              >
                {element.data.name}
              </div>
              <div
                className="font-black tracking-tight"
                style={{
                  transform: `translate(${numberLayout.x ?? 0}px, ${numberLayout.y ?? 0}px)`,
                  fontSize: numberLayout.fontSize ?? 40,
                  color: numberLayout.color ?? element.style.textColor,
                }}
              >
                {element.data.number}
              </div>
            </div>

            <div
              className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 font-semibold"
              style={{
                transform: `translate(${infoLayout.x ?? 0}px, ${infoLayout.y ?? 0}px)`,
                fontSize: infoLayout.fontSize ?? 18,
                color: infoLayout.color ?? '#1f2937',
              }}
            >
              <div>年龄：{element.data.age}</div>
              <div>身高：{element.data.height}</div>
              <div>位置：{element.data.role}</div>
              <div>籍贯：{element.data.hometown}</div>
              <div className="col-span-2">所属球队：{element.data.team}</div>
              <div className="col-span-2">入学时间：{element.data.enrolledAt}</div>
            </div>
          </div>

          <div
            className="inline-flex w-fit rounded-[14px] px-6 py-2 font-bold tracking-[0.05em] shadow-[0_8px_18px_rgba(15,23,42,0.16)]"
            style={{
              transform: `translate(${footerLayout.x ?? 0}px, ${footerLayout.y ?? 0}px)`,
              fontSize: footerLayout.fontSize ?? 16,
              color: footerLayout.color ?? element.style.secondaryColor,
              background: 'linear-gradient(180deg,#2e2d30_0%,#1e1d1f_100%)',
            }}
          >
            {element.data.footerTag}
          </div>
        </div>
      </div>
    </div>
  )
}

function TextRenderer({ element }) {
  const layout = element.subLayout?.text ?? {}
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]" style={{ background: element.style.background }}>
      <div
        className="h-full w-full whitespace-pre-wrap"
        style={{
          transform: `translate(${layout.x ?? 0}px, ${layout.y ?? 0}px)`,
          color: layout.color ?? element.style.textColor,
          fontSize: layout.fontSize ?? element.style.fontSize ?? 18,
          fontWeight: element.style.fontWeight ?? 700,
          textAlign: element.style.textAlign ?? 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            element.style.textAlign === 'center' ? 'center' : element.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
        }}
      >
        {element.data.text}
      </div>
    </div>
  )
}

function BadgeRenderer({ element }) {
  const layout = element.subLayout?.text ?? {}
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[inherit] border"
      style={{
        background: element.style.background,
        borderColor: element.style.borderColor,
        borderWidth: element.style.borderWidth,
      }}
    >
      <div
        style={{
          transform: `translate(${layout.x ?? 0}px, ${layout.y ?? 0}px)`,
          color: layout.color ?? element.style.textColor,
          fontSize: layout.fontSize ?? 15,
          fontWeight: 700,
        }}
      >
        {element.data.text}
      </div>
    </div>
  )
}

function ColorBlockRenderer({ element }) {
  return (
    <div
      className="absolute inset-0 rounded-[inherit]"
      style={{
        background: element.style.background,
        opacity: element.style.opacity ?? 1,
      }}
    />
  )
}

function DividerRenderer({ element }) {
  return (
    <div
      className="absolute inset-0 rounded-[inherit]"
      style={{
        background: element.style.background,
        opacity: element.style.opacity ?? 1,
      }}
    />
  )
}

function ImageFrameRenderer({ element }) {
  const caption = element.subLayout?.caption ?? {}
  const image = element.subLayout?.image ?? {}
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[inherit] border bg-white"
      style={{
        borderColor: element.style.borderColor,
        borderWidth: element.style.borderWidth,
      }}
    >
      <div
        className="absolute inset-x-[14px] top-[14px] bottom-[42px] overflow-hidden rounded-[18px]"
        style={{ transform: `translate(${image.x ?? 0}px, ${image.y ?? 0}px)` }}
      >
        <img src={element.data.imageUrl} alt={element.data.caption} className="h-full w-full object-cover" />
      </div>
      <div
        className="absolute inset-x-4 bottom-4 text-center"
        style={{
          transform: `translate(${caption.x ?? 0}px, ${caption.y ?? 0}px)`,
          color: caption.color ?? '#64748b',
          fontSize: caption.fontSize ?? 14,
          fontWeight: 600,
        }}
      >
        {element.data.caption}
      </div>
    </div>
  )
}

function renderElementContent(element) {
  switch (element.type) {
    case 'playerCard':
      return <PlayerCardRenderer element={element} />
    case 'growthChart':
      return <GrowthChartRenderer element={element} />
    case 'radarChart':
      return <RadarChartRenderer element={element} />
    case 'barChart':
      return <BarChartRenderer element={element} />
    case 'dataTable':
      return <DataTableRenderer element={element} />
    case 'titleText':
    case 'bodyText':
      return <TextRenderer element={element} />
    case 'badge':
      return <BadgeRenderer element={element} />
    case 'colorBlock':
      return <ColorBlockRenderer element={element} />
    case 'divider':
      return <DividerRenderer element={element} />
    case 'imageFrame':
      return <ImageFrameRenderer element={element} />
    default:
      return null
  }
}

export default function StudioCanvas({
  document,
  pageName,
  pageIndex,
  pageCount,
  mode,
  selectedElementId,
  selectedChildKey,
  onSelect,
  onDocumentChange,
  onInsertElement,
  onDuplicate,
  onDelete,
  className = '',
}) {
  const { containerRef, scale } = useCanvasScale(document.canvas.width)
  const canvasRef = useRef(null)
  const interactionRef = useRef(null)
  const liveDocumentRef = useRef(document)
  const [guides, setGuides] = useState({ vertical: [], horizontal: [] })
  const elements = useMemo(() => sortElementsByZIndex(document.elements), [document.elements])

  useEffect(() => {
    liveDocumentRef.current = document
  }, [document])

  const startInteraction = (event, config) => {
    if (mode !== 'edit') return
    event.stopPropagation()
    event.preventDefault()

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const startPoint = {
      x: (event.clientX - canvasRect.left) / scale,
      y: (event.clientY - canvasRect.top) / scale,
    }

    interactionRef.current = {
      ...config,
      pointerId: event.pointerId,
      startPoint,
      snapshot: cloneStudioDocument(document),
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (event) => {
    const interaction = interactionRef.current
    if (!interaction) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const currentPoint = {
      x: (event.clientX - canvasRect.left) / scale,
      y: (event.clientY - canvasRect.top) / scale,
    }
    const dx = currentPoint.x - interaction.startPoint.x
    const dy = currentPoint.y - interaction.startPoint.y

    const nextDocument = cloneStudioDocument(interaction.snapshot)
    const target = nextDocument.elements.find((element) => element.id === interaction.elementId)
    if (!target) return

    if (interaction.kind === 'move') {
      const { frame, guides: nextGuides } = snapFrame(
        {
          ...target.frame,
          x: interaction.snapshotFrame.x + dx,
          y: interaction.snapshotFrame.y + dy,
        },
        'move',
        target.id,
        nextDocument
      )
      target.frame = frame
      setGuides(nextGuides)
    }

    if (interaction.kind === 'resize') {
      const source = interaction.snapshotFrame
      let frame = { ...source }

      if (interaction.handle.includes('e')) {
        frame.w = source.w + dx
      }
      if (interaction.handle.includes('s')) {
        frame.h = source.h + dy
      }
      if (interaction.handle.includes('w')) {
        frame.x = source.x + dx
        frame.w = source.w - dx
      }
      if (interaction.handle.includes('n')) {
        frame.y = source.y + dy
        frame.h = source.h - dy
      }

      const { frame: snappedFrame, guides: nextGuides } = snapFrame(frame, interaction.handle, target.id, nextDocument)
      target.frame = snappedFrame
      setGuides(nextGuides)
    }

    if (interaction.kind === 'child-move') {
      const subLayout = target.subLayout?.[interaction.childKey]
      if (!subLayout) return
      subLayout.x = roundGrid(interaction.snapshotChild.x + dx, nextDocument.canvas.gridSize)
      subLayout.y = roundGrid(interaction.snapshotChild.y + dy, nextDocument.canvas.gridSize)
      setGuides({ vertical: [], horizontal: [] })
    }

    onDocumentChange(nextDocument, { recordHistory: false })
  }

  const handlePointerUp = () => {
    const interaction = interactionRef.current
    if (!interaction) return

    interactionRef.current = null
    setGuides({ vertical: [], horizontal: [] })
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)

    onDocumentChange(cloneStudioDocument(liveDocumentRef.current), { recordHistory: true, fromLiveDocument: true })
  }

  const handleCanvasDrop = (event) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('text/studio-element')
    if (!type) return
    const rect = canvasRef.current.getBoundingClientRect()
    const point = {
      x: (event.clientX - rect.left) / scale,
      y: (event.clientY - rect.top) / scale,
    }
    onInsertElement(type, point)
  }

  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-[24px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,246,242,0.98))] px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[14px] font-black text-[var(--text-primary)]">画布</div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {pageName || '画布'} · {pageIndex + 1}/{pageCount} · 1600 × 900
          </div>
        </div>
        {mode === 'edit' ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)]">
            <Grip className="h-3.5 w-3.5 text-[var(--brand)]" />
            可拖拽 · 可缩放 · 吸附网格
          </div>
        ) : null}
      </div>

      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-auto rounded-[20px] border border-[var(--border)] bg-[var(--surface-muted)]/60 p-4 scrollbar-custom"
      >
        <div className="mx-auto w-full max-w-[980px]">
          <div
            className="relative mx-auto"
            style={{
              width: document.canvas.width * scale,
              height: document.canvas.height * scale,
            }}
          >
            <div
              ref={canvasRef}
              onClick={() => onSelect(null, null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleCanvasDrop}
              className="absolute left-0 top-0 overflow-hidden rounded-[30px] border border-[#dbe3ef] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
              style={{
                width: document.canvas.width,
                height: document.canvas.height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                background: document.canvas.background,
              }}
            >
              {mode === 'edit' ? (
                <div
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: `${document.canvas.gridSize}px ${document.canvas.gridSize}px`,
                  }}
                />
              ) : null}

              {elements.map((element) => {
                const isSelected = element.id === selectedElementId
                const childKeys = Object.keys(element.subLayout ?? {}).filter((key) => getChildRect(element, key))

                return (
                  <div
                    key={element.id}
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelect(element.id, null)
                    }}
                    onPointerDown={(event) => {
                      if (mode !== 'edit') return
                      onSelect(element.id, null)
                      startInteraction(event, {
                        kind: 'move',
                        elementId: element.id,
                        snapshotFrame: { ...element.frame },
                      })
                    }}
                    className={`absolute overflow-visible transition ${mode === 'edit' ? 'cursor-move' : ''}`}
                    style={{
                      left: element.frame.x,
                      top: element.frame.y,
                      width: element.frame.w,
                      height: element.frame.h,
                      zIndex: element.zIndex,
                      opacity: element.style.opacity ?? 1,
                      borderRadius: element.style.radius ?? 22,
                    }}
                  >
                    {renderElementContent(element)}

                    {mode === 'edit'
                      ? childKeys.map((childKey) => {
                          const childRect = getChildRect(element, childKey)
                          if (!childRect || element.subLayout?.[childKey]?.visible === false) return null
                          return (
                            <ChildHandle
                              key={childKey}
                              label={childKey}
                              rect={childRect}
                              active={isSelected && selectedChildKey === childKey}
                              onClick={(event) => {
                                event.stopPropagation()
                                onSelect(element.id, childKey)
                              }}
                              onPointerDown={(event) => {
                                event.stopPropagation()
                                onSelect(element.id, childKey)
                                startInteraction(event, {
                                  kind: 'child-move',
                                  elementId: element.id,
                                  childKey,
                                  snapshotChild: {
                                    x: element.subLayout?.[childKey]?.x ?? 0,
                                    y: element.subLayout?.[childKey]?.y ?? 0,
                                  },
                                })
                              }}
                            />
                          )
                        })
                      : null}

                    {mode === 'edit' && isSelected ? (
                      <SelectionOutline
                        element={element}
                        showHandles={!selectedChildKey}
                        onResizeStart={(event, handle) => {
                          startInteraction(event, {
                            kind: 'resize',
                            elementId: element.id,
                            handle,
                            snapshotFrame: { ...element.frame },
                          })
                        }}
                      />
                    ) : null}

                    {mode === 'edit' && isSelected ? (
                      <div className="absolute -top-12 right-0 flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-2 py-1 shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onDuplicate(element.id)
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--brand)]"
                        >
                          <CopyPlus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onDelete(element.id)
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[rgba(220,38,38,0.08)] hover:text-[#dc2626]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2 py-1 text-[10px] font-bold text-[var(--text-secondary)]">
                          <MoveDiagonal className="h-3 w-3" />
                          {element.type}
                        </span>
                      </div>
                    ) : null}
                  </div>
                )
              })}

              {mode === 'edit'
                ? guides.vertical.map((line, index) => (
                    <div key={`vertical-${index}`} className="pointer-events-none absolute top-0 w-px bg-[var(--brand)]" style={{ left: line, height: document.canvas.height }} />
                  ))
                : null}
              {mode === 'edit'
                ? guides.horizontal.map((line, index) => (
                    <div key={`horizontal-${index}`} className="pointer-events-none absolute left-0 h-px bg-[var(--brand)]" style={{ top: line, width: document.canvas.width }} />
                  ))
                : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
