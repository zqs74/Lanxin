/**
 * 未来规划 · 数字化数据积累 画布（竖版 600×1000）
 *
 * 画布铺一层浅色底，按钮是「透明玻璃」浮在上面（透出底色）：
 *   玻璃体几乎无色 → 透镜光环（外亮/内暗/外彩细边）→ 顶部弧光 → 内容彩色。
 * 交互（方案 A）：整张卡片可点，卡内不放胶囊，「查看球员档案 →」是文字链接。
 */
import React from 'react'
import { FUTURE, FONT, PALETTE as P, formatNumber, tint } from './futureChartData.js'

const W = FUTURE.width
const H = FUTURE.height

const PAD = 24
const CARD_GAP = 22
const RADIUS = 46
const CARD_H = (H - PAD * 2 - CARD_GAP * (FUTURE.items.length - 1)) / FUTURE.items.length

export function FutureChartCanvas() {
  const cardW = W - PAD * 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="数字化数据积累">
      <defs>
        {/* 玻璃体：几乎无色，只留一层薄雾 */}
        <linearGradient id="lg-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
          <stop offset="54%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.38" />
        </linearGradient>
        {/* 透镜光环 */}
        <linearGradient id="lg-lens" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="38%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
        </linearGradient>
        {/* 顶部弧光 */}
        <radialGradient id="lg-spec" cx="50%" cy="0%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="46%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id="lg-shadow" x="-16%" y="-12%" width="132%" height="134%">
          <feDropShadow dx="0" dy="5" stdDeviation="11" floodColor="#0E1B2C" floodOpacity="0.13" />
        </filter>
      </defs>

      {/* 画布保持透明：底色由外层容器/PPT 提供，导出 PNG 不带背景 */}

      {FUTURE.items.map((item, index) => {
        const top = PAD + index * (CARD_H + CARD_GAP)
        return (
          <g key={item.key}>
            {/* 透明玻璃体（透出底色） */}
            <rect
              x={PAD}
              y={top}
              width={cardW}
              height={CARD_H}
              rx={RADIUS}
              fill="url(#lg-body)"
              filter="url(#lg-shadow)"
            />
            {/* 顶部弧光 */}
            <rect
              x={PAD + RADIUS * 0.6}
              y={top + 1.5}
              width={cardW - RADIUS * 1.2}
              height={CARD_H * 0.32}
              rx={RADIUS * 0.7}
              fill="url(#lg-spec)"
            />
            {/* 透镜外圈亮线 */}
            <rect
              x={PAD + 1}
              y={top + 1}
              width={cardW - 2}
              height={CARD_H - 2}
              rx={RADIUS - 1}
              fill="none"
              stroke="url(#lg-lens)"
              strokeWidth="2.2"
            />
            {/* 内侧彩色暗线（厚度折射） */}
            <rect
              x={PAD + 4.5}
              y={top + 4.5}
              width={cardW - 9}
              height={CARD_H - 9}
              rx={RADIUS - 4.5}
              fill="none"
              stroke={item.color}
              strokeOpacity="0.2"
              strokeWidth="3"
            />
            {/* 最外彩色细边 */}
            <rect
              x={PAD + 0.6}
              y={top + 0.6}
              width={cardW - 1.2}
              height={CARD_H - 1.2}
              rx={RADIUS - 0.6}
              fill="none"
              stroke={tint(item.color, 0.38)}
              strokeWidth="1.2"
            />

            {/* 内容 */}
            <text x={PAD + 28} y={top + 54} fontFamily={FONT} fontSize="22" fontWeight="700" fill="#FFFFFF" fillOpacity="0.88">
              {item.label}
            </text>

            <text x={PAD + 28} y={top + 140} fontFamily={FONT} fontSize="76" fontWeight="800" fill={item.color}>
              {formatNumber(Number(item.value))}
              <tspan fontFamily={FONT} fontSize="26" fontWeight="700" fill="#FFFFFF" fillOpacity="0.66">
                {` ${item.unit}`}
              </tspan>
            </text>

            <text x={PAD + 28} y={top + 194} fontFamily={FONT} fontSize="18" fontWeight="700" fill={item.color}>
              {`${item.detail} →`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default FutureChartCanvas
