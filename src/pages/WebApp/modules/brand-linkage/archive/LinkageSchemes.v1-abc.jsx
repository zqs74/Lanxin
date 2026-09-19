// 存档：方案 B（中心辐射）/ 方案 C（联动闭环）的完整实现，2026-09-19 起停用但保留。
// 若要恢复，把本文件内容并回 LinkageSchemes.jsx 并重新注册到 BrandLinkageStudio 的 SCHEME_LIST。

/**
 * 联动商家图谱 · 三个方案画布
 *
 * 全部用内联属性的 SVG 绘制（不使用 className / 外部 CSS / 外部图片引用），
 * 画布可被完整序列化后导出 PNG —— 复制到剪贴板直接粘进 PPT。
 */
import React from 'react'
import {
  CANVAS,
  FONT,
  MERCHANTS,
  ORBIT_MERCHANTS,
  FEATURED_MERCHANTS,
  FLOW_SOURCES,
  LINKAGE_CHANNELS,
  FEEDBACK_ITEMS,
  merchantByKey,
  categoryColor,
} from './linkageData.js'
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

function CanvasHeader({ theme, title, subtitle, rightValue, rightLabel }) {
  return (
    <g>
      <text x="60" y="84" fontFamily={FONT} fontSize="44" fontWeight="800" fill={theme.accent}>
        {title}
      </text>
      <text x="60" y="126" fontFamily={FONT} fontSize="20" fill={theme.muted}>
        {subtitle}
      </text>
      {rightValue ? (
        <>
          <text
            x={W - 60}
            y="80"
            textAnchor="end"
            fontFamily={FONT}
            fontSize="46"
            fontWeight="800"
            fill={theme.text}
          >
            {rightValue}
          </text>
          <text x={W - 60} y="118" textAnchor="end" fontFamily={FONT} fontSize="18" fill={theme.muted}>
            {rightLabel}
          </text>
        </>
      ) : null}
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
  const START_Y = 172
  const CARD_W = (W - START_X * 2 - GAP_X * (COLS - 1)) / COLS
  const CARD_H = (H - START_Y - 48 - GAP_Y * (ROWS - 1)) / ROWS

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="联动商家墙">
      <CanvasDefs id={id} theme={theme} />
      <CanvasBackdrop id={id} theme={theme} glowCy={250} glowR={900} />
      <CanvasHeader
        theme={theme}
        title="联动商家"
        subtitle="覆盖运动装备 / 篮球器材 / 运动防护 / 运动饮品 / 运动潮流 等领域"
        rightValue="25 家"
        rightLabel="长期合作品牌"
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

/* ------------------------------------------------------------------ */
/* 方案 B · 中心辐射                                                    */
/* ------------------------------------------------------------------ */

export function SchemeB({ theme }) {
  const id = 'sb'
  const cx = 800
  const cy = 470
  const rx = 580
  const ry = 245
  const CARD_W = 240
  const CARD_H = 112
  const angles = [-90, -45, 0, 45, 90, 135, 180, 225]

  const nodes = ORBIT_MERCHANTS.map((key, index) => {
    const merchant = merchantByKey(key)
    const rad = (angles[index] * Math.PI) / 180
    return {
      merchant,
      x: cx + rx * Math.cos(rad),
      y: cy + ry * Math.sin(rad),
    }
  }).filter((node) => node.merchant)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="联动商家中心辐射图">
      <CanvasDefs id={id} theme={theme} />
      <CanvasBackdrop id={id} theme={theme} glowCx={cx} glowCy={cy} glowR={660} />
      <CanvasHeader
        theme={theme}
        title="联动商家"
        subtitle="赛事流量与联动商家双向奔赴 · 覆盖 10.7w 人次"
        rightValue="52 万"
        rightLabel="私域流量池"
      />

      <g>
        {nodes.map(({ merchant, x, y }) => (
          <line
            key={`line-${merchant.key}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={categoryColor(merchant)}
            strokeOpacity="0.45"
            strokeWidth="2"
          />
        ))}
      </g>

      <g>
        {nodes.map(({ merchant, x, y }) => {
          const mode = merchant.mode ?? ''
          if (!mode) return null
          const lx = cx + (x - cx) * 0.62
          const ly = cy + (y - cy) * 0.62
          const boxW = mode.length * 15 + 26
          return (
            <g key={`mode-${merchant.key}`}>
              <rect
                x={lx - boxW / 2}
                y={ly - 15}
                width={boxW}
                height="30"
                rx="15"
                fill={theme.from}
                stroke={categoryColor(merchant)}
                strokeOpacity="0.6"
                strokeWidth="1.2"
              />
              <text
                x={lx}
                y={ly + 6}
                textAnchor="middle"
                fontFamily={FONT}
                fontSize="15"
                fontWeight="700"
                fill={categoryColor(merchant)}
              >
                {mode}
              </text>
            </g>
          )
        })}
      </g>

      <g>
        <circle
          cx={cx}
          cy={cy}
          r="162"
          fill="none"
          stroke={theme.accent}
          strokeOpacity="0.22"
          strokeWidth="1.5"
          strokeDasharray="7 9"
        />
        <circle
          cx={cx}
          cy={cy}
          r="126"
          fill={`url(#${id}-glow)`}
          stroke={theme.accent}
          strokeOpacity="0.85"
          strokeWidth="2.5"
        />
        <text
          x={cx}
          y={cy - 38}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize="22"
          fontWeight="700"
          fill={theme.accent}
          letterSpacing="3"
        >
          赛事流量池
        </text>
        <text x={cx} y={cy + 24} textAnchor="middle" fontFamily={FONT} fontSize="62" fontWeight="800" fill={theme.text}>
          52 万
        </text>
        <text x={cx} y={cy + 62} textAnchor="middle" fontFamily={FONT} fontSize="20" fill={theme.muted}>
          私域用户
        </text>
      </g>

      <g>
        {nodes.map(({ merchant, x, y }) => (
          <g key={`node-${merchant.key}`}>
            <MerchantCard
              theme={theme}
              merchant={merchant}
              x={x - CARD_W / 2}
              y={y - CARD_H / 2}
              w={CARD_W}
              h={CARD_H}
              logoBoxW={CARD_W - 70}
              logoBoxH={CARD_H * 0.46}
              nameSize={20}
            />
            <circle cx={x - CARD_W / 2 + 16} cy={y - CARD_H / 2 + 16} r="4.5" fill={categoryColor(merchant)} />
          </g>
        ))}
      </g>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* 方案 C · 联动闭环                                                    */
/* ------------------------------------------------------------------ */

export function SchemeC({ theme }) {
  const id = 'sc'
  const START_X = 60
  const SPAN = W - START_X * 2
  const FLOW_GAP = 16
  const FLOW_W = (SPAN - FLOW_GAP * 3) / 4
  const FLOW_Y = 160
  const FLOW_H = 130

  const CARD_GAP = 16
  const CARD_W = (SPAN - CARD_GAP * 5) / 6
  const CARD_Y = 384
  const CARD_H = 320

  const merchants = FEATURED_MERCHANTS.map((key) => merchantByKey(key)).filter(Boolean)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="联动商家闭环图">
      <CanvasDefs id={id} theme={theme} />
      <CanvasBackdrop id={id} theme={theme} glowCy={400} glowR={920} />
      <CanvasHeader
        theme={theme}
        title="联动闭环"
        subtitle="赛事流量入口 → 四条联动通道 → 联动商家 → 商家反哺赛事"
        rightValue="10.7w"
        rightLabel="赛事覆盖人次"
      />

      {/* 上排：流量入口 */}
      <g>
        {FLOW_SOURCES.map((source, index) => {
          const x = START_X + index * (FLOW_W + FLOW_GAP)
          return (
            <g key={`flow-${index}`}>
              <rect
                x={x}
                y={FLOW_Y}
                width={FLOW_W}
                height={FLOW_H}
                rx="16"
                fill={theme.card}
                fillOpacity="0.10"
                stroke={theme.line}
                strokeWidth="1.5"
              />
              <rect x={x} y={FLOW_Y + 30} width="5" height="76" rx="2.5" fill={theme.accent} />
              <text x={x + 22} y={FLOW_Y + 58} fontFamily={FONT} fontSize="26" fontWeight="700" fill={theme.text}>
                {source.title}
              </text>
              <text x={x + 22} y={FLOW_Y + 94} fontFamily={FONT} fontSize="18" fill={theme.muted}>
                {source.desc}
              </text>
            </g>
          )
        })}
      </g>

      {/* 中间：四条联动通道 */}
      <g>
        <line
          x1={START_X + 74}
          y1="312"
          x2={START_X + 74}
          y2="358"
          stroke={theme.accent}
          strokeWidth="2.5"
          markerEnd={`url(#${id}-arrow)`}
        />
        <line
          x1={W - START_X - 74}
          y1="312"
          x2={W - START_X - 74}
          y2="358"
          stroke={theme.accent}
          strokeWidth="2.5"
          markerEnd={`url(#${id}-arrow)`}
        />
        <text
          x={W / 2}
          y="346"
          textAnchor="middle"
          fontFamily={FONT}
          fontSize="24"
          fontWeight="700"
          fill={theme.accent}
        >
          {`四条联动通道：${LINKAGE_CHANNELS.join(' · ')}`}
        </text>
      </g>

      {/* 下排：联动商家 */}
      <g>
        {merchants.map((merchant, index) => {
          const x = START_X + index * (CARD_W + CARD_GAP)
          return (
            <g key={`merchant-${merchant.key}`}>
              <MerchantCard
                theme={theme}
                merchant={merchant}
                x={x}
                y={CARD_Y}
                w={CARD_W}
                h={CARD_H}
                logoBoxW={CARD_W - 56}
                logoBoxH={96}
                nameSize={28}
                enSize={16}
              />
              <circle cx={x + 20} cy={CARD_Y + 20} r="6" fill={categoryColor(merchant)} />
            </g>
          )
        })}
      </g>

      {/* 底部：商家反哺赛事 */}
      <g>
        <rect
          x={START_X}
          y="556"
          width={SPAN}
          height="60"
          rx="18"
          fill={theme.accent}
          fillOpacity="0.14"
          stroke={theme.accent}
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
        <path d="M132,586 L112,574 L112,598 Z" fill={theme.accent} fillOpacity="0.9" />
        <text x="150" y="593" fontFamily={FONT} fontSize="22" fontWeight="700" fill={theme.accent}>
          商家反哺赛事：
        </text>
        <text x="324" y="593" fontFamily={FONT} fontSize="21" fill={theme.text}>
          {FEEDBACK_ITEMS.join(' · ')}
        </text>
        <text x={W - START_X - 20} y="593" textAnchor="end" fontFamily={FONT} fontSize="17" fill={theme.muted}>
          形成「流量增长 → 商业变现 → 赛事升级」正循环
        </text>
      </g>
    </svg>
  )
}
