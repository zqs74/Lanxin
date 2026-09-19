/**
 * 赛事数据服务 · 数据表画布
 *
 * 样式复用「运动数据分析中台」的表卡（浅色模式）：
 * 白色表卡 + 金色标题条 + 米色表头底 + 列间竖线贯穿 + 数值列加粗 + 第一列灰色。
 *
 * 画布统一 1.66:1，行高按行数铺满；不画页面底色，
 * 导出 PNG 时保留透明，直接贴 PPT 不会出色块。
 * 全部内联属性 SVG，可完整序列化后导出 PNG。
 */
import React from 'react'
import {
  FONT,
  PALETTE as P,
  TABLE_WIDTH,
  PAD,
  CONTENT_W,
  HEAD_TOP,
  HEAD_H,
  rowHeight,
  tableHeight,
} from './dataTableData.js'

export function DataTableCanvas({ table }) {
  const height = tableHeight()
  const rowH = rowHeight(table)
  const tableBottom = HEAD_TOP + HEAD_H + table.rows.length * rowH

  const colX = []
  let acc = PAD
  for (const width of table.colWidths) {
    colX.push(acc)
    acc += width
  }
  const contentRight = PAD + CONTENT_W

  const anchor = (index) => (index === 0 ? 'start' : 'end')
  const textX = (index) =>
    index === 0 ? colX[index] + 20 : colX[index] + table.colWidths[index] - 20

  return (
    <svg
      viewBox={`0 0 ${TABLE_WIDTH} ${height}`}
      width="100%"
      height="100%"
      role="img"
      aria-label={`${table.title}数据表`}
    >
      {/* 卡片 */}
      <rect
        x="1"
        y="1"
        width={TABLE_WIDTH - 2}
        height={height - 2}
        rx="18"
        fill={P.card}
        stroke={P.cardBorder}
        strokeWidth="1"
      />

      {/* 标题：左侧金条 + 标题 + 说明 */}
      <rect x={PAD + 4} y="30" width="5" height="28" rx="2.5" fill={P.accent} />
      <text x={PAD + 22} y="54" fontFamily={FONT} fontSize="26" fontWeight="800" fill={P.text}>
        {table.title}
      </text>
      <text
        x={PAD + 22 + table.title.length * 28 + 14}
        y="54"
        fontFamily={FONT}
        fontSize="16"
        fill={P.muted}
      >
        {table.caption}
      </text>

      {/* 表头 */}
      <rect x={PAD} y={HEAD_TOP} width={CONTENT_W} height={HEAD_H} fill={P.headBg} />
      {table.columns.map((column, index) => (
        <text
          key={column}
          x={textX(index)}
          y={HEAD_TOP + 36}
          textAnchor={anchor(index)}
          fontFamily={FONT}
          fontSize="23"
          fontWeight="700"
          fill={index === 0 ? P.label : P.text}
        >
          {column}
        </text>
      ))}

      {/* 数据行 */}
      {table.rows.map((row, rowIndex) => {
        const top = HEAD_TOP + HEAD_H + rowIndex * rowH
        return (
          <g key={`row-${rowIndex}`}>
            {row.map((cell, cellIndex) => (
              <text
                key={`cell-${rowIndex}-${cellIndex}`}
                x={textX(cellIndex)}
                y={top + rowH / 2 + 8}
                textAnchor={anchor(cellIndex)}
                fontFamily={FONT}
                fontSize={cellIndex === 0 ? 23 : 26}
                fontWeight={cellIndex === 0 ? 500 : 700}
                fill={cellIndex === 0 ? P.label : P.text}
              >
                {cell}
              </text>
            ))}
          </g>
        )
      })}

      {/* 横线：表头上下 + 每行底部 */}
      <line x1={PAD} y1={HEAD_TOP} x2={contentRight} y2={HEAD_TOP} stroke={P.line} strokeWidth="1" />
      <line
        x1={PAD}
        y1={HEAD_TOP + HEAD_H}
        x2={contentRight}
        y2={HEAD_TOP + HEAD_H}
        stroke={P.line}
        strokeWidth="1"
      />
      {table.rows.map((row, rowIndex) => (
        <line
          key={`h-${rowIndex}`}
          x1={PAD}
          y1={HEAD_TOP + HEAD_H + (rowIndex + 1) * rowH}
          x2={contentRight}
          y2={HEAD_TOP + HEAD_H + (rowIndex + 1) * rowH}
          stroke={P.line}
          strokeWidth="1"
        />
      ))}

      {/* 竖线：每列之间，从表头顶到表格底 */}
      {colX.slice(1).map((x) => (
        <line key={`v-${x}`} x1={x} y1={HEAD_TOP} x2={x} y2={tableBottom} stroke={P.line} strokeWidth="1" />
      ))}
    </svg>
  )
}

export default DataTableCanvas
