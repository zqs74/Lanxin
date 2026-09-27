/**
 * 技术优势配图 · 画布
 *
 * 两张图都做成「真实系统界面」的样子（参考 PPT 里其它配图的界面截图风格）：
 *   图 1 HighlightCanvas ：横版 1000×660 —— 左「多模态场景识别」+ 右「高光时刻标记」
 *   图 2 DataOutputCanvas：竖版 700×1176 —— 最顶是顶栏（居中「昇梦一句话办赛」+ 右侧注册商标），
 *                             下面三个产物窗口竖排（数据看板 / 训练建议 / 成长档案）
 *
 * 全部内联属性 SVG；导出 PNG 时照片由 canvasExport 自动内联成 data URI。
 */
import React from 'react'
import {
  HIGHLIGHT_UI,
  OUTPUT_UI,
  HIGHLIGHT_CANVAS,
  OUTPUT_CANVAS,
  OUTPUT_TOPBAR,
  PROMO_CANVAS,
  PROMO_UI,
  FEEDBACK_CANVAS,
  FEEDBACK_UI,
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
/** 顶栏高度：内容整体下移这么多 */
const O_TOP_BAR = OUTPUT_TOPBAR.height
const WIN_X = 24
const WIN_W = OW - 48
const WIN_TOP = 52
const WIN_H = 288
const WIN_GAP = 12
const TITLEBAR_H = 68

function WindowFrame({ index, name, color, children }) {
  const top = WIN_TOP + index * (WIN_H + WIN_GAP)
  return (
    <g>
      <rect x={WIN_X} y={top} width={WIN_W} height={WIN_H} rx="12" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
      <rect x={WIN_X} y={top} width={WIN_W} height={TITLEBAR_H} rx="12" fill={P.barBg} />
      <rect x={WIN_X} y={top + TITLEBAR_H - 12} width={WIN_W} height="12" fill={P.barBg} />
      <text
        x={WIN_X + WIN_W / 2}
        y={top + 44}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="32"
        fontWeight="800"
        fill={P.text}
      >
        {name}
      </text>
      <rect x={WIN_X} y={top + TITLEBAR_H} width="4" height={WIN_H - TITLEBAR_H} fill={color} />
      {children}
    </g>
  )
}

export function DataOutputCanvas() {
  const statsTop = 952
  const inner = WIN_X + 20
  const innerW = WIN_W - 40

  return (
    <svg viewBox={`0 0 ${OW} ${OH}`} width="100%" height="100%" role="img" aria-label="Step4 数据产出">
      <rect x="0" y="0" width={OW} height={OH} fill={P.pageBg} />

      {/* 最顶：顶栏（小程序式）—— 居中品牌语 + 右侧注册商标 */}
      <rect x="0" y="0" width={OW} height={O_TOP_BAR} fill={P.card} />
      <line x1="0" y1={O_TOP_BAR} x2={OW} y2={O_TOP_BAR} stroke={P.cardBorder} strokeWidth="1" />
      <text
        x={OW / 2}
        y={O_TOP_BAR / 2 + 12}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="34"
        fontWeight="800"
        fill={P.text}
      >
        {OUTPUT_TOPBAR.title}
      </text>
      <image
        href={OUTPUT_TOPBAR.logo}
        x={OW - 32 - OUTPUT_TOPBAR.logoW}
        y={(O_TOP_BAR - OUTPUT_TOPBAR.logoH) / 2}
        width={OUTPUT_TOPBAR.logoW}
        height={OUTPUT_TOPBAR.logoH}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* 顶栏以下：整块内容 */}
      <g transform={`translate(0, ${O_TOP_BAR})`}>
        <text x={OW / 2} y="32" textAnchor="middle" fontFamily={FONT} fontSize="15" fill={P.muted}>
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

        <text x="32" y={OH - O_TOP_BAR - 12} fontFamily={FONT} fontSize="12" fill={P.dim}>
          {OUTPUT_UI.note}
        </text>
      </g>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* 图 3 · 智能宣发（多平台触达）横版 1000×630                           */
/* ------------------------------------------------------------------ */

const PW = PROMO_CANVAS.width
const PH = PROMO_CANVAS.height
const P_CARD = { x: 16, y: 16, w: PW - 32, h: PH - 32, barH: 52 }
const P_COL = { l: 40, lw: 268, m: 324, mw: 300, r: 640, rw: 320 }
const P_TOP = 84
const P_BOTTOM = 540

/** 顶栏（窗口标题栏）+ 卡片底 */
function PanelShell({ title, status, accent }) {
  return (
    <g>
      <rect
        x={P_CARD.x}
        y={P_CARD.y}
        width={P_CARD.w}
        height={P_CARD.h}
        rx="16"
        fill={P.card}
        stroke={P.cardBorder}
        strokeWidth="1"
      />
      <rect x={P_CARD.x} y={P_CARD.y} width={P_CARD.w} height={P_CARD.barH} rx="16" fill={P.barBg} />
      <rect x={P_CARD.x} y={P_CARD.y + P_CARD.barH - 16} width={P_CARD.w} height="16" fill={P.barBg} />
      <rect x={P_CARD.x} y={P_CARD.y + P_CARD.barH} width="5" height={P_CARD.h - P_CARD.barH} fill={accent} />
      <text x={P_CARD.x + 24} y={P_CARD.y + 34} fontFamily={FONT} fontSize="20" fontWeight="800" fill={P.text}>
        {title}
      </text>
      <text
        x={P_CARD.x + P_CARD.w - 24}
        y={P_CARD.y + 33}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="13"
        fill={P.muted}
      >
        {status}
      </text>
    </g>
  )
}

export function SmartPromoCanvas() {
  const s = PROMO_UI.source

  return (
    <svg viewBox={`0 0 ${PW} ${PH}`} width="100%" height="100%" role="img" aria-label="智能宣发 · 多平台触达">
      <defs>
        <clipPath id="promo-cover">
          <rect x={P_COL.l + 12} y={P_TOP + 12} width={P_COL.lw - 24} height="152" rx="10" />
        </clipPath>
      </defs>

      <rect x="0" y="0" width={PW} height={PH} fill={P.pageBg} />
      <PanelShell title={PROMO_UI.panel} status={PROMO_UI.panelStatus} accent={P.info} />

      {/* 左栏 · 内容源 */}
      <rect x={P_COL.l} y={P_TOP} width={P_COL.lw} height={P_BOTTOM - P_TOP} rx="12" fill={P.headBg} />
      <image
        href={s.photo}
        x={P_COL.l + 12}
        y={P_TOP + 12}
        width={P_COL.lw - 24}
        height="152"
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#promo-cover)"
      />
      <rect x={P_COL.l + 22} y={P_TOP + 22} width="118" height="24" rx="6" fill="rgba(10,20,36,0.72)" />
      <text x={P_COL.l + 30} y={P_TOP + 39} fontFamily={FONT} fontSize="12" fontWeight="700" fill="#FFFFFF">
        {s.tag}
      </text>
      <text x={P_COL.l + 12} y={P_TOP + 200} fontFamily={FONT} fontSize="16" fontWeight="800" fill={P.text}>
        张宇辰 36 分全场高光
      </text>
      <text x={P_COL.l + 12} y={P_TOP + 224} fontFamily={FONT} fontSize="14" fontWeight="700" fill={P.muted}>
        粤BA 半决赛
      </text>
      <text x={P_COL.l + 12} y={P_TOP + 262} fontFamily={FONT} fontSize="12.5" fill={P.muted}>
        末节连得 11 分，一记压哨三分
      </text>
      <text x={P_COL.l + 12} y={P_TOP + 284} fontFamily={FONT} fontSize="12.5" fill={P.muted}>
        锁定胜局；全场 36 分 10 篮板
      </text>
      <text x={P_COL.l + 12} y={P_TOP + 306} fontFamily={FONT} fontSize="12.5" fill={P.muted}>
        8 助攻，命中率 57.5%。
      </text>
      {s.tags.map((tag, index) => (
        <g key={tag}>
          <rect
            x={P_COL.l + 12 + index * 82}
            y={P_TOP + 328}
            width="74"
            height="26"
            rx="13"
            fill={P.card}
            stroke={P.cardBorder}
            strokeWidth="1"
          />
          <text
            x={P_COL.l + 12 + index * 82 + 37}
            y={P_TOP + 345}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize="12"
            fill={P.info}
          >
            {tag}
          </text>
        </g>
      ))}
      <text x={P_COL.l + 12} y={P_TOP + 382} fontFamily={FONT} fontSize="11.5" fill={P.dim}>
        {s.variants}
      </text>
      <rect x={P_COL.l + 12} y={P_TOP + 396} width={P_COL.lw - 24} height="44" rx="10" fill={P.info} />
      <text
        x={P_COL.l + P_COL.lw / 2}
        y={P_TOP + 424}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="15"
        fontWeight="800"
        fill="#FFFFFF"
      >
        一键分发到 8 个渠道
      </text>

      {/* 中栏 · 三步流程 */}
      {PROMO_UI.steps.map((step, index) => {
        const top = P_TOP + index * 108
        const color = step.done ? P.ok : step.doing ? P.info : P.dim
        return (
          <g key={step.name}>
            <rect x={P_COL.m} y={top} width={P_COL.mw} height="96" rx="12" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
            <circle cx={P_COL.m + 30} cy={top + 48} r="17" fill={color} />
            <text
              x={P_COL.m + 30}
              y={top + 54}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="16"
              fontWeight="800"
              fill="#FFFFFF"
            >
              {index + 1}
            </text>
            <text x={P_COL.m + 58} y={top + 40} fontFamily={FONT} fontSize="16" fontWeight="800" fill={P.text}>
              {step.name}
            </text>
            <text x={P_COL.m + 58} y={top + 64} fontFamily={FONT} fontSize="12" fill={P.muted}>
              {step.desc}
            </text>
            <text
              x={P_COL.m + P_COL.mw - 16}
              y={top + 42}
              textAnchor="end"
              fontFamily={FONT}
              fontSize="12"
              fontWeight="700"
              fill={color}
            >
              {step.state}
            </text>
          </g>
        )
      })}

      {/* 中栏 · 本周排期 */}
      <rect x={P_COL.m} y={P_TOP + 324} width={P_COL.mw} height={P_BOTTOM - P_TOP - 324} rx="12" fill={P.headBg} />
      <text x={P_COL.m + 16} y={P_TOP + 352} fontFamily={FONT} fontSize="14" fontWeight="800" fill={P.text}>
        {PROMO_UI.schedule.title}
      </text>
      {PROMO_UI.schedule.items.map((item, index) => {
        const y = P_TOP + 382 + index * 32
        return (
          <g key={item.name}>
            <text x={P_COL.m + 16} y={y} fontFamily={FONT} fontSize="12" fill={P.dim}>
              {item.time}
            </text>
            <text x={P_COL.m + 100} y={y} fontFamily={FONT} fontSize="12.5" fontWeight="700" fill={P.text}>
              {item.name}
            </text>
          </g>
        )
      })}

      {/* 右栏 · 分发渠道 */}
      {PROMO_UI.platforms.map((platform, index) => {
        const top = P_TOP + index * 76
        const published = platform.state === '已发布'
        const scheduled = platform.state === '排期中'
        const color = published ? P.ok : scheduled ? P.info : P.dim
        return (
          <g key={platform.name}>
            <rect x={P_COL.r} y={top} width={P_COL.rw} height="68" rx="10" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
            <text x={P_COL.r + 16} y={top + 28} fontFamily={FONT} fontSize="15" fontWeight="800" fill={P.text}>
              {platform.name}
            </text>
            <text x={P_COL.r + 16} y={top + 50} fontFamily={FONT} fontSize="12" fill={P.muted}>
              {platform.handle}
            </text>
            <text
              x={P_COL.r + P_COL.rw - 16}
              y={top + 29}
              textAnchor="end"
              fontFamily={FONT}
              fontSize="14"
              fontWeight="800"
              fill={P.accent}
            >
              {platform.views}
            </text>
            <rect
              x={P_COL.r + P_COL.rw - 78}
              y={top + 40}
              width="62"
              height="20"
              rx="10"
              fill={color}
              opacity="0.14"
            />
            <text
              x={P_COL.r + P_COL.rw - 47}
              y={top + 54}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="11.5"
              fontWeight="700"
              fill={color}
            >
              {platform.state}
            </text>
          </g>
        )
      })}

      {/* 底部 · 实时效果反馈 */}
      <rect x={P_COL.l} y={P_BOTTOM + 12} width={PW - 80} height="48" rx="10" fill={P.headBg} />
      {PROMO_UI.metrics.map((metric, index) => (
        <g key={metric.label}>
          <text x={P_COL.l + 20 + index * 168} y={P_BOTTOM + 42} fontFamily={FONT} fontSize="12" fill={P.muted}>
            {metric.label}
          </text>
          <text
            x={P_COL.l + 68 + index * 168}
            y={P_BOTTOM + 42}
            fontFamily={FONT}
            fontSize="16"
            fontWeight="800"
            fill={P.text}
          >
            {metric.value}
          </text>
        </g>
      ))}
      <text
        x={PW - 56}
        y={P_BOTTOM + 42}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="11.5"
        fill={P.ok}
        fontWeight="700"
      >
        已自动优化渠道权重
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* 图 4 · 数据反哺（持续优化）横版 1000×630                             */
/* ------------------------------------------------------------------ */

const FW = FEEDBACK_CANVAS.width
const FH = FEEDBACK_CANVAS.height

export function DataFeedbackCanvas() {
  const trend = FEEDBACK_UI.trend
  const chartX = 76
  const chartW = 500
  const chartTop = 268
  const chartBottom = 492
  const step = chartW / (trend.points.length - 1)
  const toY = (value) =>
    chartBottom - ((value - trend.min) / (trend.max - trend.min)) * (chartBottom - chartTop)
  const line = trend.points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${chartX + index * step} ${toY(point.value)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${FW} ${FH}`} width="100%" height="100%" role="img" aria-label="数据反哺 · 持续优化">
      <rect x="0" y="0" width={FW} height={FH} fill={P.pageBg} />

      <rect x={16} y={16} width={FW - 32} height={FH - 32} rx="16" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
      <rect x={16} y={16} width={FW - 32} height="52" rx="16" fill={P.barBg} />
      <rect x={16} y="52" width={FW - 32} height="16" fill={P.barBg} />
      <rect x="16" y="68" width="5" height={FH - 84} fill={P.purple} />
      <text x="40" y="50" fontFamily={FONT} fontSize="20" fontWeight="800" fill={P.text}>
        {FEEDBACK_UI.panel}
      </text>
      <text x={FW - 40} y="49" textAnchor="end" fontFamily={FONT} fontSize="13" fill={P.muted}>
        {FEEDBACK_UI.panelStatus}
      </text>

      {/* 上排：四个多维指标 */}
      {FEEDBACK_UI.kpis.map((kpi, index) => {
        const x = 40 + index * 235
        return (
          <g key={kpi.label}>
            <rect x={x} y="84" width="223" height="102" rx="12" fill={P.headBg} />
            <text x={x + 18} y="112" fontFamily={FONT} fontSize="13" fill={P.muted}>
              {kpi.label}
            </text>
            <text x={x + 18} y="152" fontFamily={FONT} fontSize="27" fontWeight="800" fill={P.text}>
              {kpi.value}
            </text>
            <text x={x + 205} y="152" textAnchor="end" fontFamily={FONT} fontSize="13" fontWeight="700" fill={P.ok}>
              {kpi.delta}
            </text>
          </g>
        )
      })}

      {/* 中排左：完播率走势 */}
      <rect x="40" y="202" width="560" height="338" rx="12" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
      <text x="60" y="234" fontFamily={FONT} fontSize="15" fontWeight="800" fill={P.text}>
        {trend.title}
      </text>
      {[0, 1, 2, 3].map((index) => {
        const y = chartTop + (index * (chartBottom - chartTop)) / 3
        const value = Math.round(trend.max - (index * (trend.max - trend.min)) / 3)
        return (
          <g key={`grid-${index}`}>
            <line x1={chartX} y1={y} x2={chartX + chartW} y2={y} stroke={P.line} strokeWidth="1" />
            <text x={chartX - 10} y={y + 4} textAnchor="end" fontFamily={FONT} fontSize="11.5" fill={P.dim}>
              {`${value}${trend.unit}`}
            </text>
          </g>
        )
      })}
      <path d={line} fill="none" stroke={P.info} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {trend.points.map((point, index) => {
        const x = chartX + index * step
        const y = toY(point.value)
        const last = index === trend.points.length - 1
        return (
          <g key={point.label}>
            <circle cx={x} cy={y} r={last ? 6 : 4.5} fill={last ? P.accent : P.card} stroke={P.info} strokeWidth="3" />
            <text x={x} y={y - 14} textAnchor="middle" fontFamily={FONT} fontSize="11.5" fontWeight="700" fill={P.text}>
              {`${point.value}%`}
            </text>
            <text x={x} y={chartBottom + 26} textAnchor="middle" fontFamily={FONT} fontSize="12" fill={P.muted}>
              {point.label}
            </text>
          </g>
        )
      })}

      {/* 中排右：数据 → 剪辑标准 */}
      <rect x="616" y="202" width="344" height="338" rx="12" fill={P.headBg} />
      <text x="636" y="234" fontFamily={FONT} fontSize="15" fontWeight="800" fill={P.text}>
        {FEEDBACK_UI.rules.title}
      </text>
      {FEEDBACK_UI.rules.items.map((rule, index) => {
        const top = 252 + index * 94
        const applied = rule.tag === '已应用'
        const color = applied ? P.ok : P.accent
        return (
          <g key={rule.from}>
            <rect x="636" y={top} width="304" height="82" rx="10" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
            <text x="652" y={top + 26} fontFamily={FONT} fontSize="12.5" fill={P.muted}>
              {rule.from}
            </text>
            <text x="652" y={top + 50} fontFamily={FONT} fontSize="11.5" fontWeight="700" fill={P.dim}>
              ↓
            </text>
            <text x="670" y={top + 51} fontFamily={FONT} fontSize="13.5" fontWeight="800" fill={P.text}>
              {rule.to}
            </text>
            <rect x="872" y={top + 12} width="56" height="20" rx="10" fill={color} opacity="0.14" />
            <text x="900" y={top + 26} textAnchor="middle" fontFamily={FONT} fontSize="11" fontWeight="700" fill={color}>
              {rule.tag}
            </text>
            <text x="652" y={top + 72} fontFamily={FONT} fontSize="11" fill={P.dim}>
              {applied ? '已写入剪辑模板' : 'A/B 对比验证中'}
            </text>
          </g>
        )
      })}

      <text x="40" y={FH - 32} fontFamily={FONT} fontSize="12.5" fontWeight="700" fill={P.accent}>
        {FEEDBACK_UI.footer}
      </text>
    </svg>
  )
}

export default HighlightCanvas
