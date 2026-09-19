/**
 * 技术优势配图 · 画布
 *
 * 两张图都做成「真实系统界面」的样子（参考 PPT 里其它配图的界面截图风格）：
 *   图 1 HighlightCanvas ：横版 1000×660 —— 左「多模态场景识别」+ 右「高光时刻标记」
 *   图 2 DataOutputCanvas：竖版 700×1000 —— 三个产物窗口竖排（数据看板 / 训练建议 / 成长档案）
 *
 * 全部内联属性 SVG；导出 PNG 时照片由 canvasExport 自动内联成 data URI。
 */
import React from 'react'
import {
  HIGHLIGHT_UI,
  OUTPUT_UI,
  HIGHLIGHT_CANVAS,
  OUTPUT_CANVAS,
  FONT,
  PALETTE as P,
} from './techChartData.js'

/* ------------------------------------------------------------------ */
/* 图 1 · 多模态场景识别 + 高光时刻标记（横版）                        */
/* ------------------------------------------------------------------ */

const W = HIGHLIGHT_CANVAS.width
const H = HIGHLIGHT_CANVAS.height
const PANEL_X = 24
const PANEL_W = W - 48
const PANEL_TOP = 108

export function HighlightCanvas() {
  const barH = 48
  const bodyTop = PANEL_TOP + barH + 12
  const videoW = 512
  const modalTop = bodyTop + 34
  const videoTop = bodyTop + 84
  const videoH = 206
  const listX = PANEL_X + 20 + videoW + 16
  const listW = PANEL_W - 40 - videoW - 16

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="赛事高光智能识别实时界面">
      <defs>
        <clipPath id="tc-video">
          <rect x={PANEL_X + 20} y={videoTop} width={videoW} height={videoH} rx="10" />
        </clipPath>
        <linearGradient id="tc-video-shade" x1="0%" y1="40%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B1A2E" stopOpacity="0" />
          <stop offset="100%" stopColor="#0B1A2E" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={W} height={H} fill={P.pageBg} />

      <text x="32" y="56" fontFamily={FONT} fontSize="30" fontWeight="800" fill={P.text}>
        {HIGHLIGHT_UI.title}
      </text>
      <text x="32" y="88" fontFamily={FONT} fontSize="16" fill={P.muted}>
        {HIGHLIGHT_UI.subtitle}
      </text>

      {/* 界面卡片 */}
      <rect x={PANEL_X} y={PANEL_TOP} width={PANEL_W} height="524" rx="14" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
      <rect x={PANEL_X} y={PANEL_TOP} width={PANEL_W} height={barH} rx="14" fill={P.barBg} />
      <rect x={PANEL_X} y={PANEL_TOP + barH - 14} width={PANEL_W} height="14" fill={P.barBg} />
      <circle cx={PANEL_X + 28} cy={PANEL_TOP + 24} r="5" fill="#E5484D" />
      <text x={PANEL_X + 42} y={PANEL_TOP + 30} fontFamily={FONT} fontSize="16" fontWeight="700" fill={P.text}>
        {HIGHLIGHT_UI.panel}
      </text>
      <text
        x={PANEL_X + PANEL_W - 24}
        y={PANEL_TOP + 30}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="14"
        fill={P.muted}
      >
        {`实时 · ${HIGHLIGHT_UI.timecode}`}
      </text>

      {/* ── 左：多模态场景识别 ── */}
      <text x={PANEL_X + 20} y={bodyTop + 20} fontFamily={FONT} fontSize="16" fontWeight="800" fill={P.text}>
        多模态场景识别
      </text>
      <text
        x={PANEL_X + 20 + videoW}
        y={bodyTop + 20}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="13"
        fill={P.muted}
      >
        画面 · 音频 · 数据 三模态融合
      </text>

      {HIGHLIGHT_UI.modalities.map((item, index) => {
        const x = PANEL_X + 20 + index * 174
        return (
          <g key={item.name}>
            <rect x={x} y={modalTop} width="162" height="36" rx="9" fill={P.barBg} />
            <circle cx={x + 16} cy={modalTop + 18} r="4.5" fill={P.ok} />
            <text x={x + 28} y={modalTop + 23} fontFamily={FONT} fontSize="13" fill={P.muted}>
              {item.name}
            </text>
            <text
              x={x + 150}
              y={modalTop + 23}
              textAnchor="end"
              fontFamily={FONT}
              fontSize="13"
              fontWeight="700"
              fill={P.text}
            >
              {item.value}
            </text>
          </g>
        )
      })}

      <image
        href={HIGHLIGHT_UI.video}
        x={PANEL_X + 20}
        y={videoTop}
        width={videoW}
        height={videoH}
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#tc-video)"
      />
      <rect
        x={PANEL_X + 20}
        y={videoTop + videoH - 96}
        width={videoW}
        height="96"
        fill="url(#tc-video-shade)"
        clipPath="url(#tc-video)"
      />
      {/* 目标检测框 */}
      <rect
        x={PANEL_X + 208}
        y={videoTop + 26}
        width="118"
        height="140"
        rx="6"
        fill="none"
        stroke="#34D399"
        strokeWidth="2.5"
      />
      <rect x={PANEL_X + 208} y={videoTop + 2} width="118" height="24" rx="5" fill="#34D399" />
      <text
        x={PANEL_X + 267}
        y={videoTop + 19}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="13"
        fontWeight="800"
        fill="#06301F"
      >
        {`${HIGHLIGHT_UI.detection.label} ${HIGHLIGHT_UI.detection.score}`}
      </text>

      <text x={PANEL_X + 36} y={videoTop + videoH - 30} fontFamily={FONT} fontSize="14" fontWeight="700" fill="#FFFFFF">
        {HIGHLIGHT_UI.videoTag}
      </text>
      <rect x={PANEL_X + 36} y={videoTop + videoH - 16} width={videoW - 52} height="6" rx="3" fill="#FFFFFF" fillOpacity="0.28" />
      <rect x={PANEL_X + 36} y={videoTop + videoH - 16} width="146" height="6" rx="3" fill={P.accent} />

      {/* ── 右：高光时刻标记 ── */}
      <text x={listX} y={bodyTop + 20} fontFamily={FONT} fontSize="16" fontWeight="800" fill={P.text}>
        高光时刻标记
      </text>
      <text x={listX + listW} y={bodyTop + 20} textAnchor="end" fontFamily={FONT} fontSize="13" fill={P.muted}>
        17 类事件
      </text>
      <rect x={listX} y={modalTop} width={listW} height="36" rx="9" fill={P.barBg} />
      {[
        { label: '时间', x: listX + 12, anchor: 'start' },
        { label: '事件', x: listX + 88, anchor: 'start' },
        { label: '置信度', x: listX + listW - 76, anchor: 'end' },
        { label: '状态', x: listX + listW - 12, anchor: 'end' },
      ].map((col) => (
        <text
          key={col.label}
          x={col.x}
          y={modalTop + 23}
          textAnchor={col.anchor}
          fontFamily={FONT}
          fontSize="13"
          fontWeight="700"
          fill={P.muted}
        >
          {col.label}
        </text>
      ))}

      {HIGHLIGHT_UI.events.map((event, index) => {
        const top = modalTop + 44 + index * 36
        const marking = event.status === '标记中'
        return (
          <g key={event.time}>
            <text x={listX + 12} y={top + 22} fontFamily={FONT} fontSize="14" fill={P.muted}>
              {event.time}
            </text>
            <text x={listX + 88} y={top + 22} fontFamily={FONT} fontSize="15" fontWeight="700" fill={P.text}>
              {event.type}
            </text>
            <text x={listX + 150} y={top + 22} fontFamily={FONT} fontSize="13" fill={P.muted}>
              {event.player}
            </text>
            <text x={listX + listW - 76} y={top + 22} textAnchor="end" fontFamily={FONT} fontSize="14" fontWeight="700" fill={P.text}>
              {event.score}
            </text>
            <text
              x={listX + listW - 12}
              y={top + 22}
              textAnchor="end"
              fontFamily={FONT}
              fontSize="13"
              fontWeight="700"
              fill={marking ? P.accent : P.ok}
            >
              {event.status}
            </text>
            <line x1={listX} y1={top + 34} x2={listX + listW} y2={top + 34} stroke={P.line} strokeWidth="1" />
          </g>
        )
      })}

      {/* 指标条 */}
      <rect x={PANEL_X + 20} y={PANEL_TOP + 386} width={PANEL_W - 40} height="118" rx="12" fill={P.headBg} />
      {HIGHLIGHT_UI.stats.map((stat, index) => {
        const x = PANEL_X + 48 + index * 226
        return (
          <g key={stat.label}>
            <text x={x} y={PANEL_TOP + 440} fontFamily={FONT} fontSize="30" fontWeight="800" fill={P.accent}>
              {stat.value}
              <tspan fontFamily={FONT} fontSize="15" fontWeight="700" fill={P.muted}>
                {` ${stat.unit}`}
              </tspan>
            </text>
            <text x={x} y={PANEL_TOP + 470} fontFamily={FONT} fontSize="14" fill={P.muted}>
              {stat.label}
            </text>
          </g>
        )
      })}

      <text x="32" y={H - 14} fontFamily={FONT} fontSize="14" fill={P.dim}>
        {HIGHLIGHT_UI.note}
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* 图 2 · 三个产物窗口（竖版，竖排）                                   */
/* ------------------------------------------------------------------ */

const OW = OUTPUT_CANVAS.width
const OH = OUTPUT_CANVAS.height
const WIN_X = 24
const WIN_W = OW - 48
const WIN_TOP = 112
const WIN_H = 250
const WIN_GAP = 14
const TITLEBAR_H = 34

function WindowFrame({ index, name, color, children }) {
  const top = WIN_TOP + index * (WIN_H + WIN_GAP)
  return (
    <g>
      <rect x={WIN_X} y={top} width={WIN_W} height={WIN_H} rx="12" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
      <rect x={WIN_X} y={top} width={WIN_W} height={TITLEBAR_H} rx="12" fill={P.barBg} />
      <rect x={WIN_X} y={top + TITLEBAR_H - 12} width={WIN_W} height="12" fill={P.barBg} />
      <circle cx={WIN_X + 18} cy={top + 17} r="4" fill="#E5484D" />
      <circle cx={WIN_X + 32} cy={top + 17} r="4" fill="#F5B93D" />
      <circle cx={WIN_X + 46} cy={top + 17} r="4" fill="#3FBF7F" />
      <text x={WIN_X + 62} y={top + 22} fontFamily={FONT} fontSize="15" fontWeight="700" fill={P.text}>
        {name}
      </text>
      <rect x={WIN_X} y={top + TITLEBAR_H} width="4" height={WIN_H - TITLEBAR_H} fill={color} />
      {children}
    </g>
  )
}

export function DataOutputCanvas() {
  const statsTop = 906
  const inner = WIN_X + 20
  const innerW = WIN_W - 40

  return (
    <svg viewBox={`0 0 ${OW} ${OH}`} width="100%" height="100%" role="img" aria-label="Step4 数据产出">
      <rect x="0" y="0" width={OW} height={OH} fill={P.pageBg} />

      <text x="32" y="54" fontFamily={FONT} fontSize="28" fontWeight="800" fill={P.text}>
        {OUTPUT_UI.title}
      </text>
      <text x="32" y="84" fontFamily={FONT} fontSize="15" fill={P.muted}>
        {OUTPUT_UI.subtitle}
      </text>

      {OUTPUT_UI.windows.map((win, index) => {
        const top = WIN_TOP + index * (WIN_H + WIN_GAP)
        const bodyTop = top + TITLEBAR_H + 16

        return (
          <WindowFrame key={win.key} index={index} name={win.name} color={win.color}>
            {win.key === 'dashboard' ? (
              <g>
                {win.kpis.map((kpi, kpiIndex) => (
                  <g key={kpi.label}>
                    <rect x={inner + kpiIndex * 206} y={bodyTop} width="190" height="54" rx="8" fill={P.headBg} />
                    <text
                      x={inner + kpiIndex * 206 + 95}
                      y={bodyTop + 30}
                      textAnchor="middle"
                      fontFamily={FONT}
                      fontSize="22"
                      fontWeight="800"
                      fill={P.accent}
                    >
                      {kpi.value}
                    </text>
                    <text
                      x={inner + kpiIndex * 206 + 95}
                      y={bodyTop + 47}
                      textAnchor="middle"
                      fontFamily={FONT}
                      fontSize="12"
                      fill={P.muted}
                    >
                      {kpi.label}
                    </text>
                  </g>
                ))}
                {win.bars.map((bar, barIndex) => {
                  const y = bodyTop + 62 + barIndex * 28
                  return (
                    <g key={bar.label}>
                      <text x={inner} y={y + 13} fontFamily={FONT} fontSize="13" fill={P.muted}>
                        {bar.label}
                      </text>
                      <rect x={inner + 52} y={y + 3} width={innerW - 122} height="11" rx="5.5" fill={P.track} />
                      <rect
                        x={inner + 52}
                        y={y + 3}
                        width={(innerW - 122) * (bar.value / bar.max)}
                        height="11"
                        rx="5.5"
                        fill={win.color}
                      />
                      <text x={inner + innerW} y={y + 13} textAnchor="end" fontFamily={FONT} fontSize="13" fontWeight="700" fill={P.text}>
                        {bar.value}
                      </text>
                    </g>
                  )
                })}
              </g>
            ) : null}

            {win.key === 'advice' ? (
              <g>
                {win.items.map((item, itemIndex) => {
                  const y = bodyTop + itemIndex * 32
                  return (
                    <g key={item.name}>
                      <circle cx={inner + 8} cy={y + 11} r="5" fill={win.color} fillOpacity="0.5" />
                      <text x={inner + 22} y={y + 16} fontFamily={FONT} fontSize="14" fontWeight="700" fill={P.text}>
                        {item.name}
                      </text>
                      <text x={inner + 168} y={y + 16} fontFamily={FONT} fontSize="13" fill={P.muted}>
                        {item.cycle}
                      </text>
                      <text
                        x={inner + innerW}
                        y={y + 16}
                        textAnchor="end"
                        fontFamily={FONT}
                        fontSize="13"
                        fontWeight="700"
                        fill={item.tag === '优先' ? '#E5484D' : item.tag === '进行中' ? P.accent : P.dim}
                      >
                        {item.tag}
                      </text>
                    </g>
                  )
                })}
              </g>
            ) : null}

            {win.key === 'archive' ? (
              <g>
                {(() => {
                  const chartTop = bodyTop + 8
                  const chartBottom = bodyTop + 138
                  const values = win.series.map((s) => s.value)
                  const min = Math.min(...values)
                  const max = Math.max(...values)
                  const step = innerW / (win.series.length - 1)
                  const points = win.series.map((point, pointIndex) => [
                    inner + pointIndex * step,
                    chartBottom - ((point.value - min) / (max - min)) * (chartBottom - chartTop),
                  ])
                  return (
                    <g>
                      <polyline
                        points={points.map(([px, py]) => `${px},${py}`).join(' ')}
                        fill="none"
                        stroke={win.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map(([px, py], pointIndex) => (
                        <g key={pointIndex}>
                          <circle cx={px} cy={py} r="5" fill={P.card} stroke={win.color} strokeWidth="3" />
                          <text
                            x={px}
                            y={chartBottom + 20}
                            textAnchor="middle"
                            fontFamily={FONT}
                            fontSize="12"
                            fill={P.muted}
                          >
                            {win.series[pointIndex].label}
                          </text>
                        </g>
                      ))}
                      <text
                        x={inner + innerW}
                        y={chartTop + 4}
                        textAnchor="end"
                        fontFamily={FONT}
                        fontSize="13"
                        fontWeight="700"
                        fill={win.color}
                      >
                        {`${max} 分`}
                      </text>
                    </g>
                  )
                })()}
              </g>
            ) : null}

            <text x={inner} y={top + WIN_H - 16} fontFamily={FONT} fontSize="13" fill={P.muted}>
              {win.footer}
            </text>
          </WindowFrame>
        )
      })}

      <rect x="24" y={statsTop} width={OW - 48} height="66" rx="12" fill={P.headBg} />
      {OUTPUT_UI.stats.map((stat, index) => {
        const x = 52 + index * 320
        return (
          <g key={stat.label}>
            <text x={x} y={statsTop + 42} fontFamily={FONT} fontSize="28" fontWeight="800" fill={P.accent}>
              {stat.value}
              <tspan fontFamily={FONT} fontSize="15" fontWeight="700" fill={P.muted}>
                {` ${stat.unit}`}
              </tspan>
            </text>
            <text x={x + 168} y={statsTop + 40} fontFamily={FONT} fontSize="14" fill={P.muted}>
              {stat.label}
            </text>
          </g>
        )
      })}

      <text x="32" y={OH - 12} fontFamily={FONT} fontSize="12" fill={P.dim}>
        {OUTPUT_UI.note}
      </text>
    </svg>
  )
}

export default HighlightCanvas
