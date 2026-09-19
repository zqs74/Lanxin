/**
 * 基层赛事数据积累 · 画布（760×660）
 *
 * 版式：标题 → 四个关键数字 → 数据资产明细表 → 数据来源
 * 全部内联属性 SVG，可完整序列化后导出 PNG；无底色，贴 PPT 不出色块。
 */
import React from 'react'
import { REGION, FONT, PALETTE as P } from './regionChartData.js'

const W = REGION.width
const H = REGION.height

const KPI_TOP = 108
const KPI_H = 108
const ROW_TOP = 258
const ROW_H = 62

export function RegionChartCanvas() {
  const kpiW = (W - 48 - 3 * 16) / 4

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="基层赛事数据积累">
      <rect x="0" y="0" width={W} height={H} fill={P.pageBg} />

      <text x="32" y="54" fontFamily={FONT} fontSize="28" fontWeight="800" fill={P.text}>
        {REGION.title}
      </text>
      <text x="32" y="84" fontFamily={FONT} fontSize="15" fill={P.muted}>
        {REGION.subtitle}
      </text>

      {/* 关键数字 */}
      {REGION.kpis.map((kpi, index) => {
        const x = 24 + index * (kpiW + 16)
        return (
          <g key={kpi.label}>
            <rect x={x} y={KPI_TOP} width={kpiW} height={KPI_H} rx="12" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
            <text
              x={x + kpiW / 2}
              y={KPI_TOP + 52}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="32"
              fontWeight="800"
              fill={P.accent}
            >
              {kpi.value}
              <tspan fontFamily={FONT} fontSize="14" fontWeight="700" fill={P.muted}>
                {` ${kpi.unit}`}
              </tspan>
            </text>
            <text
              x={x + kpiW / 2}
              y={KPI_TOP + 82}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="14"
              fill={P.muted}
            >
              {kpi.label}
            </text>
          </g>
        )
      })}

      {/* 明细表 */}
      <rect x="24" y={ROW_TOP} width={W - 48} height={ROW_H} rx="10" fill={P.headBg} />
      {[
        { label: '数据维度', x: 52, anchor: 'start' },
        { label: '累积量', x: 320, anchor: 'end' },
        { label: '说明', x: 356, anchor: 'start' },
      ].map((col) => (
        <text
          key={col.label}
          x={col.x}
          y={ROW_TOP + 38}
          textAnchor={col.anchor}
          fontFamily={FONT}
          fontSize="16"
          fontWeight="700"
          fill={P.text}
        >
          {col.label}
        </text>
      ))}

      {REGION.rows.map((row, index) => {
        const top = ROW_TOP + ROW_H + index * ROW_H
        return (
          <g key={row.name}>
            {index % 2 === 1 ? (
              <rect x="24" y={top} width={W - 48} height={ROW_H} rx="8" fill={P.track} />
            ) : null}
            <rect x="32" y={top + 18} width="5" height={ROW_H - 36} rx="2.5" fill={row.color} />
            <text x="52" y={top + 38} fontFamily={FONT} fontSize="16" fontWeight="700" fill={P.text}>
              {row.name}
            </text>
            <text x="320" y={top + 38} textAnchor="end" fontFamily={FONT} fontSize="17" fontWeight="800" fill={row.color}>
              {row.value}
            </text>
            <text x="356" y={top + 38} fontFamily={FONT} fontSize="13" fill={P.muted}>
              {row.detail}
            </text>
            <line x1="52" y1={top + ROW_H} x2={W - 52} y2={top + ROW_H} stroke={P.line} strokeWidth="1" />
          </g>
        )
      })}

      <text x="32" y={H - 14} fontFamily={FONT} fontSize="13" fill={P.dim}>
        {REGION.note}
      </text>
    </svg>
  )
}

export default RegionChartCanvas
