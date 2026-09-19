/**
 * 联动商家图谱 · 方案 A（联动商家墙）
 *
 * 全部用内联属性的 SVG 绘制（不使用 className / 外部 CSS / 外部图片引用），
 * 画布可被完整序列化后导出 PNG —— 复制到剪贴板直接粘进 PPT。
 *
 * 方案 B（中心辐射）/ 方案 C（联动闭环）已停用，代码存于 archive/LinkageSchemes.v1-abc.jsx。
 */
import React from 'react'
import { CANVAS, FONT, MERCHANTS, categoryColor } from './linkageData.js'
import { BrandLogo } from './BrandLogo.jsx'

const W = CANVAS.width
const H = CANVAS.height

function CanvasDefs({ id, theme }) {
  return (
    <defs>
      <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={theme.from} />
        <stop offset="100%" stopColor={theme.to} />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={theme.glow} stopOpacity={theme.glowOpacity} />
        <stop offset="70%" stopColor={theme.glow} stopOpacity={theme.glowOpacity * 0.35} />
        <stop offset="100%" stopColor={theme.glow} stopOpacity="0" />
      </radialGradient>
      <marker
        id={`${id}-arrow`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M0,0 L10,5 L0,10 Z" fill={theme.accent} />
      </marker>
    </defs>
  )
}

function CanvasBackdrop({ id, theme, glowCx = 800, glowCy = 340, glowR = 660 }) {
  return (
    <g>
      <rect x="0" y="0" width={W} height={H} fill={`url(#${id}-bg)`} />
      <ellipse cx={glowCx} cy={glowCy} rx={glowR} ry={glowR * 0.6} fill={`url(#${id}-glow)`} />
      <rect x="0" y="0" width={W} height="6" fill={theme.accent} fillOpacity="0.7" />
    </g>
  )
}

/** 页眉：标题居中放大，副标题居中，下方一条收束装饰线 */
function CanvasHeader({ theme, title, subtitle }) {
  return (
    <g>
      <text
        x={W / 2}
        y="150"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="82"
        fontWeight="800"
        fill={theme.accent}
        letterSpacing="6"
      >
        {title}
      </text>
      <text x={W / 2} y="212" textAnchor="middle" fontFamily={FONT} fontSize="24" fill={theme.muted}>
        {subtitle}
      </text>
      <line
        x1={W / 2 - 240}
        y1="250"
        x2={W / 2 + 240}
        y2="250"
        stroke={theme.accent}
        strokeOpacity="0.38"
        strokeWidth="2"
      />
    </g>
  )
}

/**
 * 白底商家卡片：logo + 中文名（+ 可选英文名）
 */
function MerchantCard({ theme, merchant, x, y, w, h, logoBoxW, logoBoxH, nameSize = 24, enSize = 15 }) {
  const centerX = x + w / 2
  const nameY = y + h - (enSize ? 36 : 26)
  // logo 安全区：卡片顶部留白 → 名称上方留白，保证 logo 放大后也不会压到名字
  const safeTop = y + 12
  const safeBottom = nameY - nameSize - 6
  const safeH = Math.max(18, safeBottom - safeTop)
  const logoCy = (safeTop + safeBottom) / 2
  const boxH = Math.min(logoBoxH, safeH)

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="18" fill={theme.card} />
      <BrandLogo id={merchant.key} cx={centerX} cy={logoCy} boxW={logoBoxW} boxH={boxH} />
      <text
        x={centerX}
        y={nameY}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize={nameSize}
        fontWeight="700"
        fill={theme.cardText}
      >
        {merchant.cn}
      </text>
      {enSize ? (
        <text
          x={centerX}
          y={nameY + enSize + 7}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={enSize}
          fill={theme.cardMuted}
        >
          {merchant.en}
        </text>
      ) : null}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 方案 A · 联动商家墙                                                  */
/* ------------------------------------------------------------------ */

export function SchemeA({ theme }) {
  const id = 'sa'
  const COLS = 5
  const ROWS = 3
  const GAP_X = 18
  const GAP_Y = 18
  const START_X = 60
  const START_Y = 288
  const CARD_W = (W - START_X * 2 - GAP_X * (COLS - 1)) / COLS
  const CARD_H = (H - START_Y - 48 - GAP_Y * (ROWS - 1)) / ROWS

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="联动商家墙">
      <CanvasDefs id={id} theme={theme} />
      <CanvasBackdrop id={id} theme={theme} glowCy={300} glowR={980} />
      <CanvasHeader
        theme={theme}
        title="联动商家"
        subtitle="25 家长期合作品牌 · 覆盖运动装备 / 篮球器材 / 运动防护 / 运动饮品 / 运动潮流"
      />

      {MERCHANTS.map((merchant, index) => {
        const col = index % COLS
        const row = Math.floor(index / COLS)
        const x = START_X + col * (CARD_W + GAP_X)
        const y = START_Y + row * (CARD_H + GAP_Y)
        return (
          <g key={merchant.key}>
            <MerchantCard
              theme={theme}
              merchant={merchant}
              x={x}
              y={y}
              w={CARD_W}
              h={CARD_H}
              logoBoxW={CARD_W - 84}
              logoBoxH={CARD_H * 0.52}
              nameSize={24}
            />
            <circle cx={x + 18} cy={y + 18} r="5" fill={categoryColor(merchant)} />
          </g>
        )
      })}
    </svg>
  )
}
