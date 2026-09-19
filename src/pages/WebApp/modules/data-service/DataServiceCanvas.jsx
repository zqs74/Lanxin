/**
 * 赛事数据服务 · 画布
 *
 * 全部内联属性 SVG（不用 className / 外部 CSS / 外部图片），可完整序列化后导出 PNG。
 * 配色沿用联动商家图的浅色米白，见 dataServiceData.js 的 PALETTE。
 */
import React from 'react'
import {
  CANVAS,
  FONT,
  PALETTE as P,
  KPIS,
  MENU,
  TEAM_TABLE,
  RECENT_MATCHES,
  GROWTH,
  PLAYER_TOP,
  DATA_ASSETS,
} from './dataServiceData.js'

const W = CANVAS.width
const H = CANVAS.height

function TopBar() {
  return (
    <g>
      <rect x="0" y="0" width={W} height="72" fill={P.topBar} />
      <line x1="0" y1="72" x2={W} y2="72" stroke={P.panelBorder} strokeWidth="1" />
      <rect x="32" y="19" width="34" height="34" rx="10" fill={P.accent} />
      <circle cx="49" cy="36" r="7" fill={P.topBar} />
      <text x="82" y="46" fontFamily={FONT} fontSize="24" fontWeight="700" fill={P.text}>
        赛事数据服务中台
      </text>

      <rect x="1250" y="19" width="150" height="34" rx="17" fill={P.pageBg} stroke={P.panelBorder} strokeWidth="1" />
      <text x="1325" y="42" textAnchor="middle" fontFamily={FONT} fontSize="15" fill={P.muted}>
        2026 赛季
      </text>
      <circle cx="1436" cy="36" r="17" fill={P.accent} />
      <text x="1436" y="42" textAnchor="middle" fontFamily={FONT} fontSize="15" fontWeight="700" fill="#FFFFFF">
        运
      </text>
      <text x="1464" y="42" fontFamily={FONT} fontSize="16" fill={P.text}>
        运营管理员
      </text>
    </g>
  )
}

function SideBar() {
  return (
    <g>
      <rect x="0" y="72" width="200" height={H - 72} fill={P.sideBar} />
      <line x1="200" y1="72" x2="200" y2={H} stroke={P.panelBorder} strokeWidth="1" />
      {MENU.map((item, index) => {
        const top = 116 + index * 58
        const active = index === 0
        return (
          <g key={item}>
            {active ? (
              <>
                <rect x="12" y={top} width="176" height="48" rx="12" fill={P.pageBg} />
                <rect x="0" y={top + 10} width="4" height="28" rx="2" fill={P.accent} />
              </>
            ) : null}
            <circle cx="42" cy={top + 24} r="6" fill={active ? P.accent : P.dim} />
            <text
              x="66"
              y={top + 30}
              fontFamily={FONT}
              fontSize="18"
              fontWeight={active ? 700 : 400}
              fill={active ? P.accent : P.muted}
            >
              {item}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function Panel({ x, y, w, h }) {
  return (
    <rect x={x} y={y} width={w} height={h} rx="18" fill={P.panel} stroke={P.panelBorder} strokeWidth="1" />
  )
}

function PanelTitle({ x, y, w, title, right }) {
  return (
    <g>
      <text x={x + 32} y={y + 46} fontFamily={FONT} fontSize="22" fontWeight="700" fill={P.text}>
        {title}
      </text>
      {right ? (
        <text x={x + w - 32} y={y + 46} textAnchor="end" fontFamily={FONT} fontSize="15" fill={P.muted}>
          {right}
        </text>
      ) : null}
      <line x1={x + 32} y1={y + 68} x2={x + w - 32} y2={y + 68} stroke={P.panelBorder} strokeWidth="1" />
    </g>
  )
}

function KpiRow() {
  const CARD_W = 326
  const GAP = 16
  return (
    <g>
      {KPIS.map((kpi, index) => {
        const x = 224 + index * (CARD_W + GAP)
        return (
          <g key={kpi.label}>
            <Panel x={x} y={96} w={CARD_W} h={140} />
            <rect x={x} y="124" width="5" height="84" rx="2.5" fill={P.accent} />
            <text x={x + 26} y="172" fontFamily={FONT} fontSize="46" fontWeight="800" fill={P.text}>
              {kpi.value}
              <tspan fontFamily={FONT} fontSize="20" fontWeight="700" fill={P.muted}>
                {` ${kpi.unit}`}
              </tspan>
            </text>
            <text x={x + 26} y="202" fontFamily={FONT} fontSize="17" fill={P.muted}>
              {kpi.label}
            </text>
            <text x={x + 26} y="226" fontFamily={FONT} fontSize="14" fill={P.accent}>
              {kpi.trend}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/** 球队数据排行 */
function TeamTablePanel() {
  const X = 224
  const Y = 260
  const WIDTH = 856
  const HEIGHT = 400
  const COL_X = [256, 312, 570, 720, 866, 976, 1048]
  const ALIGN = ['start', 'start', 'end', 'end', 'end', 'end', 'end']

  return (
    <g>
      <Panel x={X} y={Y} w={WIDTH} h={HEIGHT} />
      <PanelTitle x={X} y={Y} w={WIDTH} title="球队数据排行" right="近 30 天 · 常规赛" />

      {TEAM_TABLE.columns.map((column, index) => (
        <text
          key={column}
          x={COL_X[index]}
          y="368"
          textAnchor={ALIGN[index]}
          fontFamily={FONT}
          fontSize="15"
          fill={P.dim}
        >
          {column}
        </text>
      ))}

      {TEAM_TABLE.rows.map((row, rowIndex) => {
        const rowY = 408 + rowIndex * 46
        const topThree = rowIndex < 3
        return (
          <g key={row[1]}>
            {rowIndex % 2 === 1 ? (
              <rect x="248" y={rowY - 26} width="808" height="40" rx="9" fill={P.rowAlt} />
            ) : null}
            <circle cx="266" cy={rowY - 6} r="13" fill={P.accent} fillOpacity={topThree ? 1 : 0.18} />
            <text
              x="266"
              y={rowY}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="15"
              fontWeight="700"
              fill={topThree ? '#FFFFFF' : P.muted}
            >
              {row[0]}
            </text>
            <text x={COL_X[1]} y={rowY} fontFamily={FONT} fontSize="18" fontWeight="700" fill={P.text}>
              {row[1]}
            </text>
            {row.slice(2).map((cell, cellIndex) => (
              <text
                key={cellIndex}
                x={COL_X[cellIndex + 2]}
                y={rowY}
                textAnchor="end"
                fontFamily={FONT}
                fontSize="16"
                fill={cellIndex === 1 ? P.accent : P.text}
                fillOpacity={cellIndex === 1 ? 1 : 0.88}
              >
                {cell}
              </text>
            ))}
          </g>
        )
      })}
    </g>
  )
}

/** 近期赛事数据档 */
function RecentMatchesPanel() {
  const X = 224
  const Y = 676
  const WIDTH = 856
  const HEIGHT = 200

  return (
    <g>
      <Panel x={X} y={Y} w={WIDTH} h={HEIGHT} />
      <PanelTitle x={X} y={Y} w={WIDTH} title="近期赛事数据档" right="最近 3 场" />

      {RECENT_MATCHES.map((match, index) => {
        const rowY = 766 + index * 40
        return (
          <g key={match.date}>
            <text x="256" y={rowY} fontFamily={FONT} fontSize="15" fill={P.dim}>
              {match.date}
            </text>
            <text x="340" y={rowY} fontFamily={FONT} fontSize="18" fontWeight="700" fill={P.text}>
              {match.home}
            </text>
            <text x="470" y={rowY} textAnchor="middle" fontFamily={FONT} fontSize="20" fontWeight="800" fill={P.accent}>
              {match.score}
            </text>
            <text x="600" y={rowY} fontFamily={FONT} fontSize="18" fontWeight="700" fill={P.text}>
              {match.away}
            </text>
            <text x="1048" y={rowY} textAnchor="end" fontFamily={FONT} fontSize="15" fill={P.muted}>
              {match.status}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/** 球员成长曲线 */
function GrowthPanel() {
  const X = 1104
  const Y = 260
  const WIDTH = 472
  const HEIGHT = 240
  const chartLeft = 1136
  const chartRight = 1544
  const step = (chartRight - chartLeft) / (GROWTH.months.length - 1)

  const toPoints = (series, bandTop, bandBottom) => {
    const min = Math.min(...series)
    const max = Math.max(...series)
    const span = max - min || 1
    return series.map((value, index) => [
      chartLeft + index * step,
      bandBottom - ((value - min) / span) * (bandBottom - bandTop),
    ])
  }

  const chartTop = 376
  const chartBottom = 452
  // 得分走满整幅高度，命中率压在下半幅，避免两条线形状重合
  const scoring = toPoints(GROWTH.scoring, chartTop, chartBottom)
  const accuracy = toPoints(GROWTH.accuracy, 418, 460)
  const toPath = (points) =>
    points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  return (
    <g>
      <Panel x={X} y={Y} w={WIDTH} h={HEIGHT} />
      <text x={X + 32} y={Y + 46} fontFamily={FONT} fontSize="22" fontWeight="700" fill={P.text}>
        球员成长曲线
      </text>
      <text x={X + WIDTH - 32} y={Y + 46} textAnchor="end" fontFamily={FONT} fontSize="15" fill={P.muted}>
        {GROWTH.player}
      </text>

      <circle cx="1140" cy="336" r="5" fill={P.accent} />
      <text x="1154" y="341" fontFamily={FONT} fontSize="14" fill={P.muted}>
        场均得分
      </text>
      <circle cx="1250" cy="336" r="5" fill={P.dim} />
      <text x="1264" y="341" fontFamily={FONT} fontSize="14" fill={P.muted}>
        投篮命中率
      </text>

      {[0, 1, 2].map((line) => (
        <line
          key={line}
          x1={chartLeft}
          y1={chartTop + (line * (chartBottom - chartTop)) / 2}
          x2={chartRight}
          y2={chartTop + (line * (chartBottom - chartTop)) / 2}
          stroke={P.panelBorder}
          strokeWidth="1"
          strokeDasharray="4 6"
        />
      ))}

      <path d={toPath(accuracy)} fill="none" stroke={P.dim} strokeWidth="2.5" strokeDasharray="7 5" strokeLinecap="round" />
      <path d={toPath(scoring)} fill="none" stroke={P.accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {scoring.map(([x, y], index) => (
        <g key={`dot-${index}`}>
          <circle cx={x} cy={y} r="5.5" fill={P.panel} stroke={P.accent} strokeWidth="3" />
          <text x={x} y={y - 14} textAnchor="middle" fontFamily={FONT} fontSize="13" fontWeight="700" fill={P.accent}>
            {GROWTH.scoring[index]}
          </text>
          <text x={x} y={Y + HEIGHT - 22} textAnchor="middle" fontFamily={FONT} fontSize="14" fill={P.dim}>
            {GROWTH.months[index]}
          </text>
        </g>
      ))}
    </g>
  )
}

/** 球员数据榜 */
function PlayerTopPanel() {
  const X = 1104
  const Y = 516
  const WIDTH = 472
  const HEIGHT = 184

  return (
    <g>
      <Panel x={X} y={Y} w={WIDTH} h={HEIGHT} />
      <PanelTitle x={X} y={Y} w={WIDTH} title="球员数据榜" right="场均得分" />

      {PLAYER_TOP.map((player, index) => {
        const rowY = 620 + index * 40 - 24
        return (
          <g key={player.name}>
            <circle cx="1152" cy={rowY - 6} r="14" fill={P.accent} fillOpacity={index === 0 ? 1 : 0.22} />
            <text
              x="1152"
              y={rowY}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="15"
              fontWeight="700"
              fill={index === 0 ? '#FFFFFF' : P.muted}
            >
              {player.rank}
            </text>
            <text x="1180" y={rowY} fontFamily={FONT} fontSize="18" fontWeight="700" fill={P.text}>
              {player.name}
            </text>
            <text x="1330" y={rowY} fontFamily={FONT} fontSize="15" fill={P.muted}>
              {player.team}
            </text>
            <text x="1544" y={rowY} textAnchor="end" fontFamily={FONT} fontSize="22" fontWeight="800" fill={P.accent}>
              {player.value}
              <tspan fontFamily={FONT} fontSize="13" fontWeight="400" fill={P.muted}>
                {` ${player.unit}`}
              </tspan>
            </text>
          </g>
        )
      })}
    </g>
  )
}

/** 赛场数据沉淀 */
function DataAssetsPanel() {
  const X = 1104
  const Y = 716
  const WIDTH = 472
  const HEIGHT = 160

  return (
    <g>
      <Panel x={X} y={Y} w={WIDTH} h={HEIGHT} />
      <text x={X + 32} y={Y + 44} fontFamily={FONT} fontSize="22" fontWeight="700" fill={P.text}>
        赛场数据沉淀
      </text>
      <line x1={X + 32} y1={Y + 62} x2={X + WIDTH - 32} y2={Y + 62} stroke={P.panelBorder} strokeWidth="1" />

      {DATA_ASSETS.map((asset, index) => {
        const rowY = Y + 84 + index * 32
        return (
          <g key={asset.label}>
            <text x={X + 32} y={rowY} fontFamily={FONT} fontSize="16" fill={P.muted}>
              {asset.label}
            </text>
            <text x={X + WIDTH - 32} y={rowY} textAnchor="end" fontFamily={FONT} fontSize="24" fontWeight="800" fill={P.text}>
              {asset.value}
              <tspan fontFamily={FONT} fontSize="14" fontWeight="400" fill={P.muted}>
                {` ${asset.unit}`}
              </tspan>
            </text>
          </g>
        )
      })}
    </g>
  )
}

export function DataServiceCanvas() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="赛事数据服务后台">
      <rect x="0" y="0" width={W} height={H} fill={P.pageBg} />
      <TopBar />
      <SideBar />
      <KpiRow />
      <TeamTablePanel />
      <RecentMatchesPanel />
      <GrowthPanel />
      <PlayerTopPanel />
      <DataAssetsPanel />
    </svg>
  )
}

export default DataServiceCanvas
