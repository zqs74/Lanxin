/**
 * 办赛成本统计 · 画布（竖版 760×1180）
 *
 * 版式按用户要求：
 *   顶部   场馆实景图（全宽）
 *   照片下 左：裁判照 + 人员成本 ｜ 右：环形图（成本构成）
 *   底部   成本表
 *
 * 字号整体放大一档，画布相应加高，保证贴进 PPT 也看得清。
 * 全部内联属性 SVG，导出 PNG 时照片会自动内联成 data URI。
 */
import React from 'react'
import { COST, FONT, PALETTE as P } from './costChartData.js'

const W = COST.width
const H = COST.height

const PHOTO_TOP = 108
const PHOTO_H = 306

const MID_TOP = 430
const MID_H = 360
const LEFT_X = 24
const LEFT_W = 348
const RIGHT_X = 388
const RIGHT_W = 348

const TABLE_TOP = 806
const TABLE_HEAD = 50
const TABLE_ROW = 62
const TABLE_TOTAL = 56

const fmt = (n) => `¥${n.toLocaleString('en-US')}`

/** 环形图几何（右侧卡片内） */
const DONUT_CX = RIGHT_X + RIGHT_W / 2
const DONUT_CY = MID_TOP + 120
const DONUT_R = 86
const DONUT_W = 28
const CIRC = 2 * Math.PI * DONUT_R

export function CostChartCanvas() {
  let acc = 0
  const arcs = COST.categories.map((category) => {
    const len = CIRC * (category.pct / 100)
    const arc = { ...category, len, offset: -acc }
    acc += len
    return arc
  })

  const rowsTop = TABLE_TOP + TABLE_HEAD

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="办赛成本统计">
      <defs>
        <clipPath id="cc-photo">
          <rect x="0" y={PHOTO_TOP} width={W} height={PHOTO_H} />
        </clipPath>
        <clipPath id="cc-referee">
          <circle cx={LEFT_X + LEFT_W / 2} cy={MID_TOP + 108} r="68" />
        </clipPath>
        <linearGradient id="cc-photo-shade" x1="0%" y1="45%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B1A2E" stopOpacity="0" />
          <stop offset="100%" stopColor="#0B1A2E" stopOpacity="0.88" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={W} height={H} fill={P.pageBg} />

      {/* 标题 */}
      <text x="32" y="56" fontFamily={FONT} fontSize="34" fontWeight="800" fill={P.text}>
        {COST.title}
      </text>
      <text x="32" y="92" fontFamily={FONT} fontSize="17" fill={P.muted}>
        {COST.subtitle}
      </text>

      {/* 顶部：场馆实景图 */}
      <image
        href={COST.photo}
        x="0"
        y={PHOTO_TOP}
        width={W}
        height={PHOTO_H}
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#cc-photo)"
      />
      <rect
        x="0"
        y={PHOTO_TOP + PHOTO_H - 104}
        width={W}
        height="104"
        fill="url(#cc-photo-shade)"
        clipPath="url(#cc-photo)"
      />
      <text x="26" y={PHOTO_TOP + PHOTO_H - 26} fontFamily={FONT} fontSize="20" fontWeight="700" fill="#FFFFFF">
        {COST.photoLabel}
      </text>

      {/* 中排左：裁判照 + 人员成本 */}
      <rect x={LEFT_X} y={MID_TOP} width={LEFT_W} height={MID_H} rx="14" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
      <circle cx={LEFT_X + LEFT_W / 2} cy={MID_TOP + 108} r="68" fill={P.track} />
      <image
        href={COST.referee.photo}
        x={LEFT_X + LEFT_W / 2 - 68}
        y={MID_TOP + 40}
        width="136"
        height="136"
        preserveAspectRatio="xMidYMin slice"
        clipPath="url(#cc-referee)"
      />
      <circle
        cx={LEFT_X + LEFT_W / 2}
        cy={MID_TOP + 108}
        r="68"
        fill="none"
        stroke={COST.categories[0].color}
        strokeWidth="3.5"
      />
      <text
        x={LEFT_X + LEFT_W / 2}
        y={MID_TOP + 214}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="24"
        fontWeight="800"
        fill={P.text}
      >
        {COST.referee.name}
      </text>
      <text
        x={LEFT_X + LEFT_W / 2}
        y={MID_TOP + 244}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="17"
        fill={P.muted}
      >
        {`${COST.referee.level} · 执裁 ${COST.referee.experience} 场`}
      </text>
      <line
        x1={LEFT_X + 32}
        y1={MID_TOP + 266}
        x2={LEFT_X + LEFT_W - 32}
        y2={MID_TOP + 266}
        stroke={P.line}
        strokeWidth="1"
      />
      <text x={LEFT_X + 32} y={MID_TOP + 308} fontFamily={FONT} fontSize="18" fill={P.muted}>
        {`裁判组 · ${COST.referee.count} 人次`}
      </text>
      <text
        x={LEFT_X + LEFT_W - 32}
        y={MID_TOP + 308}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="24"
        fontWeight="800"
        fill={COST.categories[0].color}
      >
        {fmt(COST.referee.amount)}
      </text>

      {/* 中排右：环形图 */}
      <rect x={RIGHT_X} y={MID_TOP} width={RIGHT_W} height={MID_H} rx="14" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
      <circle cx={DONUT_CX} cy={DONUT_CY} r={DONUT_R} fill="none" stroke={P.track} strokeWidth={DONUT_W} />
      {arcs.map((arc) => (
        <circle
          key={arc.key}
          cx={DONUT_CX}
          cy={DONUT_CY}
          r={DONUT_R}
          fill="none"
          stroke={arc.color}
          strokeWidth={DONUT_W}
          strokeDasharray={`${arc.len} ${CIRC - arc.len}`}
          strokeDashoffset={arc.offset}
          transform={`rotate(-90 ${DONUT_CX} ${DONUT_CY})`}
        />
      ))}
      <text x={DONUT_CX} y={DONUT_CY - 8} textAnchor="middle" fontFamily={FONT} fontSize="15" fill={P.muted}>
        赛事总成本
      </text>
      <text x={DONUT_CX} y={DONUT_CY + 26} textAnchor="middle" fontFamily={FONT} fontSize="28" fontWeight="800" fill={P.total}>
        {fmt(COST.total)}
      </text>

      {COST.categories.map((category, index) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        const x = RIGHT_X + 26 + col * 164
        const y = MID_TOP + 254 + row * 44
        return (
          <g key={`legend-${category.key}`}>
            <rect x={x} y={y - 11} width="12" height="12" rx="3" fill={category.color} />
            <text x={x + 19} y={y} fontFamily={FONT} fontSize="16" fontWeight="700" fill={P.text}>
              {category.name}
            </text>
            <text x={x + 19} y={y + 21} fontFamily={FONT} fontSize="15" fill={category.color}>
              {`${category.pct}%`}
            </text>
          </g>
        )
      })}

      {/* 底部：成本表 */}
      <rect x="24" y={TABLE_TOP} width={W - 48} height={TABLE_HEAD} rx="10" fill={P.headBg} />
      {[
        { label: '成本类别', x: 52, anchor: 'start' },
        { label: '主要内容', x: 200, anchor: 'start' },
        { label: '金额', x: W - 116, anchor: 'end' },
        { label: '占比', x: W - 52, anchor: 'end' },
      ].map((col) => (
        <text
          key={col.label}
          x={col.x}
          y={TABLE_TOP + 33}
          textAnchor={col.anchor}
          fontFamily={FONT}
          fontSize="18"
          fontWeight="700"
          fill={P.text}
        >
          {col.label}
        </text>
      ))}

      {COST.categories.map((category, index) => {
        const top = rowsTop + index * TABLE_ROW
        return (
          <g key={`row-${category.key}`}>
            {index % 2 === 1 ? (
              <rect x="24" y={top} width={W - 48} height={TABLE_ROW} rx="8" fill={P.track} />
            ) : null}
            <rect x="32" y={top + 20} width="5" height={TABLE_ROW - 40} rx="2.5" fill={category.color} />
            <text x="52" y={top + 39} fontFamily={FONT} fontSize="19" fontWeight="700" fill={P.text}>
              {category.name}
            </text>
            <text x="200" y={top + 39} fontFamily={FONT} fontSize="16" fill={P.muted}>
              {category.brief}
            </text>
            <text x={W - 116} y={top + 39} textAnchor="end" fontFamily={FONT} fontSize="20" fontWeight="700" fill={P.text}>
              {fmt(category.amount)}
            </text>
            <text x={W - 52} y={top + 39} textAnchor="end" fontFamily={FONT} fontSize="17" fill={category.color}>
              {`${category.pct}%`}
            </text>
            <line x1="52" y1={top + TABLE_ROW} x2={W - 52} y2={top + TABLE_ROW} stroke={P.line} strokeWidth="1" />
          </g>
        )
      })}

      <rect
        x="24"
        y={rowsTop + COST.categories.length * TABLE_ROW}
        width={W - 48}
        height={TABLE_TOTAL}
        rx="10"
        fill={P.headBg}
      />
      <text
        x="52"
        y={rowsTop + COST.categories.length * TABLE_ROW + 36}
        fontFamily={FONT}
        fontSize="19"
        fontWeight="800"
        fill={P.text}
      >
        合计
      </text>
      <text
        x={W - 52}
        y={rowsTop + COST.categories.length * TABLE_ROW + 36}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="24"
        fontWeight="800"
        fill={P.total}
      >
        {`${fmt(COST.total)}   100%`}
      </text>

      <text x="32" y={H - 14} fontFamily={FONT} fontSize="14" fill={P.dim}>
        {COST.note}
      </text>
    </svg>
  )
}

export default CostChartCanvas
