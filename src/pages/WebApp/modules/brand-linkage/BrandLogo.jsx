import React from 'react'
import { LOGOS } from './logoData.js'

/**
 * 内联渲染品牌矢量 logo。
 * 全部走 path 数据、不引用外部文件，因此画布可以被完整序列化后导出 PNG。
 *
 * @param {Object} props
 * @param {string} props.id      logoData.js 中的 key
 * @param {number} props.cx      中心 x
 * @param {number} props.cy      中心 y
 * @param {number} props.boxW    可用宽
 * @param {number} props.boxH    可用高
 * @param {string} [props.color] 强制填充色（不传则用品牌原色）
 */
export function BrandLogo({ id, cx, cy, boxW, boxH, color }) {
  const logo = LOGOS[id]
  if (!logo) return null

  const [bx, by, bw, bh] = logo.bbox ?? logo.vb
  const safeW = bw > 0 ? bw : 1
  const safeH = bh > 0 ? bh : 1
  const scale = Math.min(boxW / safeW, boxH / safeH)
  const tx = cx - (bx + safeW / 2) * scale
  const ty = cy - (by + safeH / 2) * scale
  const override = color ?? (logo.tone === 'dark' ? '#0A2A54' : null)

  return (
    <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
      {logo.shapes.map((shape, index) => (
        <path
          key={index}
          d={shape.d}
          fill={shape.fill === 'none' ? 'none' : override ?? shape.fill}
          fillRule={shape.rule ?? 'nonzero'}
        />
      ))}
    </g>
  )
}

export default BrandLogo
