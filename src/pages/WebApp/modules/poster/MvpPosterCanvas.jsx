/**
 * 球员交付海报 · 画布
 *
 * 0.7:1 竖版（700×1000）。参考热门 MVP 海报的常见做法：
 * 照片满铺上半幅并压暗、巨型 MVP 半透明压在画面上、姓名叠进画面、
 * 下方信息区集中放数据，橙金强调色呼应昇梦 logo。
 *
 * 说明：本机 Photoshop 的「选择主体 / 移除背景」AI 命令不可用（跑完是 NO ALPHA），
 * 无法把人物抠成透明 PNG，因此改用「照片满铺 + 暗角 + 底缘渐变」让人物融进画面。
 */
import React from 'react'
import { POSTER, FONT, PALETTE as P } from './posterData.js'

const W = POSTER.width
const H = POSTER.height

const PHOTO_H = 700
const INFO_TOP = PHOTO_H

export function MvpPosterCanvas() {
  // 三列分别贴左边距 / 居中 / 贴右边距，视觉间隙最均匀
  const dataCols = [
    { x: 48, anchor: 'start' },
    { x: 350, anchor: 'middle' },
    { x: 652, anchor: 'end' },
  ]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="球员交付海报">
      <defs>
        <linearGradient id="mp-bg" x1="0%" y1="0%" x2="30%" y2="100%">
          <stop offset="0%" stopColor={P.bgFrom} />
          <stop offset="100%" stopColor={P.bgTo} />
        </linearGradient>
        <radialGradient id="mp-vignette" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="62%" stopColor="#000000" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.72" />
        </radialGradient>
        <linearGradient id="mp-photo-bottom" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={P.bgTo} stopOpacity="0" />
          <stop offset="62%" stopColor={P.bgTo} stopOpacity="0.55" />
          <stop offset="100%" stopColor={P.bgTo} stopOpacity="1" />
        </linearGradient>
        <linearGradient id="mp-photo-top" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={P.bgFrom} stopOpacity="0.92" />
          <stop offset="100%" stopColor={P.bgFrom} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mp-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={P.accent} stopOpacity="0" />
          <stop offset="50%" stopColor={P.accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={P.accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mp-badge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={P.accentLight} />
          <stop offset="100%" stopColor={P.accentDeep} />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={W} height={H} fill="url(#mp-bg)" />

      {/* 照片满铺上半幅 */}
      <image
        href={POSTER.photo}
        x="0"
        y="0"
        width={W}
        height={PHOTO_H}
        preserveAspectRatio="xMidYMid slice"
      />
      <rect x="0" y="0" width={W} height={PHOTO_H} fill="url(#mp-vignette)" />
      <rect x="0" y="0" width={W} height="150" fill="url(#mp-photo-top)" />
      <rect x="0" y={PHOTO_H - 310} width={W} height="310" fill="url(#mp-photo-bottom)" />

      {/* 巨型 MVP 压在画面上 */}
      <text
        x={W / 2}
        y={PHOTO_H - 66}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="228"
        fontWeight="900"
        letterSpacing="10"
        fill={P.accent}
        fillOpacity="0.17"
      >
        MVP
      </text>

      {/* 顶部：昇梦 logo + 赛事名 */}
      <image href={POSTER.logo} x="42" y="28" width="170" height="51" />
      <text x={W - 44} y="62" textAnchor="end" fontFamily={FONT} fontSize="17" fill={P.muted}>
        {POSTER.league}
      </text>

      {/* 姓名叠进画面 */}
      <text
        x="46"
        y={PHOTO_H - 100}
        fontFamily={FONT}
        fontSize="70"
        fontWeight="800"
        fill={P.text}
        stroke="rgba(3,6,12,0.55)"
        strokeWidth="6"
        paintOrder="stroke"
      >
        {POSTER.player.name}
      </text>
      <text
        x="48"
        y={PHOTO_H - 58}
        fontFamily={FONT}
        fontSize="22"
        fontWeight="700"
        fill={P.accent}
        stroke="rgba(3,6,12,0.5)"
        strokeWidth="4"
        paintOrder="stroke"
      >
        {`#${POSTER.player.number} · ${POSTER.player.team}`}
      </text>
      <rect x="162" y={PHOTO_H - 88} width="92" height="38" rx="19" fill="url(#mp-badge)" />
      <text
        x="208"
        y={PHOTO_H - 61}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="21"
        fontWeight="800"
        fill="#2A1405"
      >
        {POSTER.badge}
      </text>

      {/* 信息区 */}
      <rect x="0" y={INFO_TOP} width={W} height={H - INFO_TOP} fill={P.panel} />
      <line x1="0" y1={INFO_TOP} x2={W} y2={INFO_TOP} stroke="url(#mp-line)" strokeWidth="2" />

      {/* 主数据 */}
      {POSTER.main.map((item, index) => (
        <g key={item.label}>
          <text
            x={dataCols[index].x}
            y={INFO_TOP + 82}
            textAnchor={dataCols[index].anchor}
            fontFamily={FONT}
            fontSize="64"
            fontWeight="800"
            fill={P.accent}
          >
            {item.value}
          </text>
          <text
            x={dataCols[index].x}
            y={INFO_TOP + 120}
            textAnchor={dataCols[index].anchor}
            fontFamily={FONT}
            fontSize="20"
            fill={P.muted}
          >
            {item.label}
          </text>
        </g>
      ))}

      <line x1="48" y1={INFO_TOP + 162} x2={W - 48} y2={INFO_TOP + 162} stroke={P.line} strokeWidth="1.5" />

      {/* 次数据：与主数据同列同对齐，行间留呼吸空间 */}
      {POSTER.extra.map((item, index) => (
        <g key={item.label}>
          <text
            x={dataCols[index].x}
            y={INFO_TOP + 216}
            textAnchor={dataCols[index].anchor}
            fontFamily={FONT}
            fontSize="32"
            fontWeight="800"
            fill={P.text}
          >
            {item.value}
          </text>
          <text
            x={dataCols[index].x}
            y={INFO_TOP + 244}
            textAnchor={dataCols[index].anchor}
            fontFamily={FONT}
            fontSize="17"
            fill={P.muted}
          >
            {item.label}
          </text>
        </g>
      ))}

      <line x1="48" y1={H - 38} x2={W - 48} y2={H - 38} stroke={P.line} strokeWidth="1" />
      <text x="48" y={H - 14} fontFamily={FONT} fontSize="14" fill={P.muted}>
        昇梦体育 · 赛事数据服务
      </text>
      <text x={W - 48} y={H - 14} textAnchor="end" fontFamily={FONT} fontSize="14" fill={P.accent}>
        {POSTER.footer}
      </text>
    </svg>
  )
}

export default MvpPosterCanvas
