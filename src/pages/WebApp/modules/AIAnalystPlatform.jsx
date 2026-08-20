import React, { useMemo, useState } from 'react'
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  Printer,
} from 'lucide-react'
import DetailDrawer from '../components/DetailDrawer.jsx'
import GrowthCurveChart from '../components/GrowthCurveChart.jsx'
import HalfCourtHeatmap from '../components/HalfCourtHeatmap.jsx'
import ReportSectionHeader from '../components/ReportSectionHeader.jsx'
import SkillRadarChart from '../components/SkillRadarChart.jsx'
import StatusPill from '../components/StatusPill.jsx'
import BiomechanicsAnalysis from './BiomechanicsAnalysis.jsx'
import { useAnalysisReportMock } from '../hooks/useMockApi.js'

const TABS = [
  { key: 'overview', label: '比赛总览' },
  { key: 'team', label: '球队分析' },
  { key: 'players', label: '球员表现' },
  { key: 'growth', label: '成长分析' },
  { key: 'events', label: '事件热区' },
  { key: 'biomechanics', label: '生物力学分析' },
]

const SORT_OPTIONS = {
  pts: '得分',
  eff: '效率',
  plusMinus: '正负值',
  reb: '篮板',
  ast: '助攻',
}

const EVENT_TYPE_LABEL = {
  all: '全部',
  score: '得分',
  assist: '助攻',
  rebound: '篮板',
  steal: '抢断',
  block: '封盖',
}

function formatPct(value) {
  return `${value.toFixed(1)}%`
}

function CompactKpi({ label, value, sub, accent = 'brand' }) {
  const accentClass = {
    brand: 'text-[var(--brand)]',
    info: 'text-[var(--info)]',
    purple: 'text-[var(--purple)]',
    ok: 'text-[var(--ok)]',
  }[accent] ?? 'text-[var(--brand)]'

  const accentHex = {
    brand: '#D4AF37',
    info: '#3B82F6',
    purple: '#8B5CF6',
    ok: '#10B981',
  }[accent] ?? '#D4AF37'

  return (
    <div className="card-base card-solid p-4 min-w-[0] relative overflow-hidden">
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-40"
        style={{ background: `radial-gradient(circle, ${accentHex} 0%, transparent 70%)` }}
      />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</div>
        <div className={`mt-1.5 text-[32px] leading-none font-black tabular-nums text-center ${accentClass}`}>{value}</div>
        {sub ? <div className="mt-1.5 text-[11px] tabular-nums text-[var(--text-muted)] text-center">{sub}</div> : null}
      </div>
    </div>
  )
}

function ShotMixBars({ mix }) {
  return (
    <div className="flex h-6 overflow-hidden rounded-md bg-[var(--surface-muted)]">
      <div className="flex items-center justify-center text-[10px] font-semibold text-white" style={{ width: `${mix.rim * 100}%`, background: '#0F2A5A' }}>
        篮下
      </div>
      <div className="flex items-center justify-center text-[10px] font-semibold text-[#0F2A5A]" style={{ width: `${mix.mid * 100}%`, background: '#D4AF37' }}>
        中投
      </div>
      <div className="flex items-center justify-center text-[10px] font-semibold text-white" style={{ width: `${mix.three * 100}%`, background: 'var(--purple)' }}>
        三分
      </div>
    </div>
  )
}

function DenseList({ rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`grid grid-cols-[72px_1fr] gap-2 px-2.5 py-1.5 ${index !== rows.length - 1 ? 'border-b border-[var(--border)]/70' : ''}`}
        >
          <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">{row.label}</div>
          <div className="text-[12px] text-[var(--text-primary)]">{row.value}</div>
        </div>
      ))}
    </div>
  )
}

function formatMetricValue(value, unit = '') {
  if (typeof value !== 'number') return `${value}${unit}`
  const normalized = Number.isInteger(value) ? value.toString() : value.toFixed(1)
  return `${normalized}${unit}`
}

function MetricTable({ leftTeam, rightTeam, rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-[12px]">
        <thead className="bg-[var(--surface-muted)]/85">
          <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            <th className="px-2.5 py-1.5">指标</th>
            <th className="px-2.5 py-1.5">{leftTeam.shortName}</th>
            <th className="px-2.5 py-1.5">{rightTeam.shortName}</th>
            <th className="px-2.5 py-1.5">差值</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const leftBetter = row.inverse ? row.left < row.right : row.left > row.right
            const rightBetter = row.inverse ? row.right < row.left : row.right > row.left
            const diff = typeof row.left === 'number' && typeof row.right === 'number'
              ? row.left - row.right
              : null

            return (
              <tr key={row.label} className="border-t border-[var(--border)]/70">
                <td className="px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">{row.label}</td>
                <td className={`px-2.5 py-1.5 tabular-nums ${leftBetter ? 'bg-[var(--info)]/8 text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                  {formatMetricValue(row.left, row.unit)}
                </td>
                <td className={`px-2.5 py-1.5 tabular-nums ${rightBetter ? 'bg-[var(--brand)]/18 text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                  {formatMetricValue(row.right, row.unit)}
                </td>
                <td className="px-2.5 py-1.5 tabular-nums font-semibold text-[var(--text-primary)]">
                  {diff === null ? '-' : `${diff > 0 ? '+' : ''}${Number.isInteger(diff) ? diff : diff.toFixed(1)}`}
                  {row.unit}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function MetricDataTable({ columns, rows, minWidth = 520 }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-[12px]" style={{ minWidth }}>
        <thead className="bg-[var(--surface-muted)]/85">
          <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            {columns.map((column) => (
              <th key={column.key} className="border-r border-[var(--border)]/50 px-2.5 py-1.5 last:border-r-0">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-[var(--border)]/70 hover:bg-[var(--surface-muted)]/55">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`border-r border-[var(--border)]/50 px-2.5 py-1.5 align-top last:border-r-0 ${
                    column.emphasis ? 'font-bold tabular-nums text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const COMMAND_ACCENT = {
  brand: '#D4AF37',
  info: '#3B82F6',
  purple: '#8B5CF6',
  ok: '#10B981',
  warn: '#F59E0B',
  danger: '#EF4444',
  slate: '#64748B',
}

function CommandTable({ title, columns, rows, accent = 'purple' }) {
  const accentColor = COMMAND_ACCENT[accent] ?? COMMAND_ACCENT.purple
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface-muted)]/75 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block h-[18px] w-[4px] rounded-[2px] shadow-[0_0_0_1px_rgba(255,255,255,0.35)_inset]"
            style={{ background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}cc 100%)` }}
          />
          <div
            className="text-[15px] font-black uppercase leading-none"
            style={{
              color: 'var(--text-primary)',
              letterSpacing: '0.08em',
              textShadow: '0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            {title}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-0 table-fixed text-[12px]">
          <thead className="bg-[var(--surface)]">
            <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              {columns.map((column) => (
                <th key={column.key} className="border-r border-[var(--border)]/50 px-2.5 py-1.5 font-semibold last:border-r-0">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-[var(--border)]/70">
                {columns.map((column) => (
                  <td key={column.key} className="border-r border-[var(--border)]/50 px-2.5 py-1.5 align-middle last:border-r-0">
                    <span className={`block truncate ${column.emphasis ? 'font-black tabular-nums text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {row[column.key]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OverviewTab({ report, bestPlayer }) {
  const { matchMeta, teamSummary, keyMoments } = report
  const overviewRows = [
    { label: '回合数', left: report.teamShotProfile.dg.pace, right: report.teamShotProfile.gz.pace },
    { label: '进攻效率', left: report.teamShotProfile.dg.ortg, right: report.teamShotProfile.gz.ortg },
    { label: '防守效率', left: report.teamShotProfile.dg.drtg, right: report.teamShotProfile.gz.drtg, inverse: true },
    { label: '有效命中率', left: report.teamShotProfile.dg.efg, right: report.teamShotProfile.gz.efg, unit: '%' },
    { label: '失误率', left: report.teamShotProfile.dg.tov, right: report.teamShotProfile.gz.tov, unit: '%', inverse: true },
    { label: '进攻篮板率', left: report.teamShotProfile.dg.orb, right: report.teamShotProfile.gz.orb, unit: '%' },
    { label: '罚球率', left: report.teamShotProfile.dg.ftRate, right: report.teamShotProfile.gz.ftRate, unit: '%' },
  ]
  const shotRows = [
    { label: '篮下占比', left: report.teamShotProfile.dg.rimShare, right: report.teamShotProfile.gz.rimShare, unit: '%' },
    { label: '篮下命中', left: report.teamShotProfile.dg.rimPct, right: report.teamShotProfile.gz.rimPct, unit: '%' },
    { label: '中投占比', left: report.teamShotProfile.dg.midShare, right: report.teamShotProfile.gz.midShare, unit: '%' },
    { label: '中投命中', left: report.teamShotProfile.dg.midPct, right: report.teamShotProfile.gz.midPct, unit: '%' },
    { label: '三分占比', left: report.teamShotProfile.dg.threeShare, right: report.teamShotProfile.gz.threeShare, unit: '%' },
    { label: '三分命中', left: report.teamShotProfile.dg.threePct, right: report.teamShotProfile.gz.threePct, unit: '%' },
  ]
  const leaders = [
    { label: '得分王', value: `${bestPlayer.name} ${bestPlayer.pts}` },
    { label: '助攻王', value: `${report.playerStats.slice().sort((a, b) => b.ast - a.ast)[0].name} ${report.playerStats.slice().sort((a, b) => b.ast - a.ast)[0].ast}` },
    { label: '篮板王', value: `${report.playerStats.slice().sort((a, b) => b.reb - a.reb)[0].name} ${report.playerStats.slice().sort((a, b) => b.reb - a.reb)[0].reb}` },
    { label: '效率值', value: `${report.playerStats.slice().sort((a, b) => b.eff - a.eff)[0].name} ${report.playerStats.slice().sort((a, b) => b.eff - a.eff)[0].eff}` },
  ]
  const factRows = [
    { field: '赛事', valueA: matchMeta.eventName, valueB: matchMeta.groupName, valueC: matchMeta.date },
    { field: '场馆', valueA: matchMeta.venue, valueB: matchMeta.sourceLabel, valueC: matchMeta.reportId },
    { field: '结论', valueA: `${matchMeta.swingQuarter} · 东莞 8:0`, valueB: matchMeta.keyEdge, valueC: `${bestPlayer.name} ${bestPlayer.pts}/${bestPlayer.ast}/${bestPlayer.reb}` },
  ]
  const factTableColumns = [
    { key: 'field', label: '字段' },
    { key: 'valueA', label: '信息 1' },
    { key: 'valueB', label: '信息 2' },
    { key: 'valueC', label: '信息 3' },
  ]
  const momentColumns = [
    { key: 'index', label: '#' },
    { key: 'title', label: '回合' },
    { key: 'body', label: '判读' },
  ]
  const momentRows = keyMoments.map((moment, index) => ({
    index: `0${index + 1}`,
    title: moment.title,
    body: moment.body,
  }))
  const leaderColumns = [
    { key: 'label', label: '榜项' },
    { key: 'value', label: '球员 / 数据', emphasis: true },
  ]
  const quarterColumns = [
    { key: 'quarter', label: '节次' },
    { key: 'dg', label: matchMeta.teams.dg.shortName, emphasis: true },
    { key: 'gz', label: matchMeta.teams.gz.shortName, emphasis: true },
    { key: 'net', label: '净胜', emphasis: true },
    { key: 'totalNet', label: '累计', emphasis: true },
  ]
  let totalNet = 0
  const quarterRows = matchMeta.quarterScores.dg.map((score, index) => {
    const net = score - matchMeta.quarterScores.gz[index]
    totalNet += net
    return {
      quarter: `Q${index + 1}`,
      dg: score,
      gz: matchMeta.quarterScores.gz[index],
      net: `${net > 0 ? '+' : ''}${net}`,
      totalNet: `${totalNet > 0 ? '+' : ''}${totalNet}`,
    }
  })

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <CompactKpi label="主队得分" value={teamSummary.dg.score} sub={`${teamSummary.dg.assists} AST · ${teamSummary.dg.rebounds} REB`} accent="info" />
        <CompactKpi label="客队得分" value={teamSummary.gz.score} sub={`${teamSummary.gz.assists} AST · ${teamSummary.gz.rebounds} REB`} accent="brand" />
        <CompactKpi label="最佳球员" value={bestPlayer.number} sub={`${bestPlayer.name} · ${bestPlayer.pts} PTS`} accent="purple" />
        <CompactKpi label="转折节次" value="Q3" sub="23 : 19" accent="ok" />
        <CompactKpi label="关键优势" value="ORB" sub="13 二次得分" accent="info" />
        <CompactKpi label="报告编号" value="017" sub={matchMeta.reportId} accent="brand" />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div className="card-base card-solid p-3 space-y-2 relative overflow-hidden">
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-35"
            style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
          />
          <div className="relative">
            <ReportSectionHeader accent="info" title="攻防四要素" />
            <MetricTable
              leftTeam={matchMeta.teams.dg}
              rightTeam={matchMeta.teams.gz}
              rows={overviewRows}
            />
          </div>
        </div>

        <div className="card-base card-solid p-3 space-y-2 relative overflow-hidden">
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-35"
            style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
          />
          <div className="relative">
            <ReportSectionHeader accent="brand" title="投篮分布" />
            <MetricTable
              leftTeam={matchMeta.teams.dg}
              rightTeam={matchMeta.teams.gz}
              rows={shotRows}
            />
          </div>
        </div>

        <div className="card-base card-solid p-3 space-y-2 relative overflow-hidden">
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-30"
            style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
          />
          <div className="relative">
            <ReportSectionHeader accent="ok" title="节比分盘口" />
            <MetricDataTable columns={quarterColumns} rows={quarterRows} minWidth={0} />
          </div>
        </div>

        <div className="card-base card-solid p-3 space-y-2 relative overflow-hidden">
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-30"
            style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
          />
          <div className="relative">
            <ReportSectionHeader accent="purple" title="榜首数据" />
            <MetricDataTable columns={leaderColumns} rows={leaders} minWidth={0} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="card-base card-solid p-3 space-y-2 relative overflow-hidden xl:col-span-1">
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-30"
            style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}
          />
          <div className="relative">
            <ReportSectionHeader accent="warn" title="赛况索引" />
            <MetricDataTable columns={factTableColumns} rows={factRows} minWidth={0} />
          </div>
        </div>

        <div className="card-base card-solid p-3 space-y-2 relative overflow-hidden xl:col-span-2">
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 translate-x-[45%] translate-y-[45%] rounded-full blur-3xl opacity-25"
            style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
          />
          <div className="relative">
            <ReportSectionHeader accent="danger" title="关键回合" />
            <MetricDataTable columns={momentColumns} rows={momentRows} minWidth={0} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamAnalysisTab({ report }) {
  const { matchMeta, teamSummary, teamShotProfile } = report
  const dg = teamShotProfile.dg
  const gz = teamShotProfile.gz
  const factorRows = [
    { label: '回合数', left: dg.pace, right: gz.pace },
    { label: '进攻效率', left: dg.ortg, right: gz.ortg },
    { label: '防守效率', left: dg.drtg, right: gz.drtg, inverse: true },
    { label: '有效命中率', left: dg.efg, right: gz.efg, unit: '%' },
    { label: '失误率', left: dg.tov, right: gz.tov, unit: '%', inverse: true },
    { label: '进攻篮板率', left: dg.orb, right: gz.orb, unit: '%' },
    { label: '罚球率', left: dg.ftRate, right: gz.ftRate, unit: '%' },
  ]
  const teamRows = [
    { label: '得分', left: teamSummary.dg.score, right: teamSummary.gz.score },
    { label: '篮板', left: teamSummary.dg.rebounds, right: teamSummary.gz.rebounds },
    { label: '助攻', left: teamSummary.dg.assists, right: teamSummary.gz.assists },
    { label: '抢断', left: teamSummary.dg.steals, right: teamSummary.gz.steals },
    { label: '封盖', left: teamSummary.dg.blocks, right: teamSummary.gz.blocks },
    { label: '失误', left: teamSummary.dg.turnovers, right: teamSummary.gz.turnovers, inverse: true },
  ]
  const shotRows = [
    { label: '篮下占比', left: dg.rimShare, right: gz.rimShare, unit: '%' },
    { label: '篮下命中', left: dg.rimPct, right: gz.rimPct, unit: '%' },
    { label: '中投占比', left: dg.midShare, right: gz.midShare, unit: '%' },
    { label: '中投命中', left: dg.midPct, right: gz.midPct, unit: '%' },
    { label: '三分占比', left: dg.threeShare, right: gz.threeShare, unit: '%' },
    { label: '三分命中', left: dg.threePct, right: gz.threePct, unit: '%' },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="card-base card-solid p-3 space-y-2 relative overflow-hidden">
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-35"
            style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
          />
          <div className="relative">
            <ReportSectionHeader accent="info" title="四要素" />
            <MetricTable leftTeam={matchMeta.teams.dg} rightTeam={matchMeta.teams.gz} rows={factorRows} />
          </div>
        </div>

        <div className="card-base card-solid p-3 space-y-2 relative overflow-hidden">
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-35"
            style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
          />
          <div className="relative">
            <ReportSectionHeader accent="brand" title="团队指标" />
            <MetricTable leftTeam={matchMeta.teams.dg} rightTeam={matchMeta.teams.gz} rows={teamRows} />
          </div>
        </div>

        <div className="card-base card-solid p-3 space-y-2 relative overflow-hidden">
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-35"
            style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
          />
          <div className="relative">
            <ReportSectionHeader accent="purple" title="投篮结构" />
            <MetricTable leftTeam={matchMeta.teams.dg} rightTeam={matchMeta.teams.gz} rows={shotRows} />
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayersTab({
  report,
  sortedPlayers,
  sortKey,
  sortDir,
  onSort,
  selectedPlayer,
  onSelectPlayer,
  onOpenDrawer,
}) {
  const performers = report.topPerformers.map((id) => report.playerStats.find((player) => player.id === id)).filter(Boolean)
  const playerColumns = [
    { key: 'player', label: '球员' },
    { key: 'team', label: '队伍' },
    { key: 'minutes', label: '时间' },
    { key: 'pts', label: 'PTS', emphasis: true },
    { key: 'reb', label: 'REB' },
    { key: 'ast', label: 'AST' },
    { key: 'stl', label: 'STL' },
    { key: 'blk', label: 'BLK' },
    { key: 'fgPct', label: 'FG%' },
    { key: 'tpPct', label: '3P%' },
    { key: 'eff', label: 'EFF', emphasis: true },
    { key: 'plusMinus', label: '+/-' },
  ]
  const playerRows = sortedPlayers.map((player) => ({
    player: (
      <div className="min-w-0">
        <div className="font-semibold text-[var(--text-primary)]">#{player.number} {player.name}</div>
        <div className="text-[10px] text-[var(--text-muted)]">{player.position}</div>
      </div>
    ),
    team: <StatusPill variant={player.teamId === 'dg' ? 'info' : 'brand'}>{report.matchMeta.teams[player.teamId].shortName}</StatusPill>,
    minutes: <span className="tabular-nums text-[var(--text-secondary)]">{player.minutes}</span>,
    pts: <span className="tabular-nums font-semibold text-[var(--text-primary)]">{player.pts}</span>,
    reb: <span className="tabular-nums text-[var(--text-secondary)]">{player.reb}</span>,
    ast: <span className="tabular-nums text-[var(--text-secondary)]">{player.ast}</span>,
    stl: <span className="tabular-nums text-[var(--text-secondary)]">{player.stl}</span>,
    blk: <span className="tabular-nums text-[var(--text-secondary)]">{player.blk}</span>,
    fgPct: <span className="tabular-nums text-[var(--text-secondary)]">{formatPct(player.fgPct)}</span>,
    tpPct: <span className="tabular-nums text-[var(--text-secondary)]">{formatPct(player.tpPct)}</span>,
    eff: <span className="tabular-nums font-semibold text-[var(--text-primary)]">{player.eff}</span>,
    plusMinus: <span className="tabular-nums text-[var(--text-secondary)]">{player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}</span>,
  }))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {performers.map((player) => {
          const accentColor = player.teamId === 'dg' ? '#3B82F6' : '#D4AF37'
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => {
                onSelectPlayer(player)
                onOpenDrawer(true)
              }}
              className="card-base card-solid p-3 text-left transition-colors hover:border-[var(--border-hover)] relative overflow-hidden text-left"
            >
              <div
                className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-35"
                style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
              />
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[15px] font-black text-[var(--text-primary)]">#{player.number} {player.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{player.position} · {player.minutes}</div>
                  </div>
                  <StatusPill variant={player.teamId === 'dg' ? 'info' : 'brand'}>
                    {report.matchMeta.teams[player.teamId].shortName}
                  </StatusPill>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[
                    ['PTS', player.pts],
                    ['REB', player.reb],
                    ['AST', player.ast],
                    ['EFF', player.eff],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/45 px-2 py-1.5 text-center">
                      <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
                      <div className="text-[14px] font-bold tabular-nums text-[var(--text-primary)]">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="card-base card-solid p-3 space-y-2 relative overflow-hidden">
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 translate-x-[45%] translate-y-[45%] rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
        />
        <div className="relative">
          <ReportSectionHeader
            accent="purple"
            title="球员数据表"
            action={
              <button
                type="button"
                onClick={() => onSort(sortKey)}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] bg-[var(--surface-muted)]/45 hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {SORT_OPTIONS[sortKey]} {sortDir === 'desc' ? '↓' : '↑'}
              </button>
            }
          />
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="min-w-[1080px] w-full text-[12px]">
              <thead className="bg-[var(--surface-muted)]/85">
                <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  {playerColumns.map((col) => (
                    <th key={col.key} className="border-r border-[var(--border)]/50 px-2.5 py-1.5 last:border-r-0">
                      {(['pts', 'reb', 'ast', 'stl', 'blk', 'fgPct', 'tpPct', 'eff', 'plusMinus'].includes(col.key)) ? (
                        <button
                          type="button"
                          onClick={() => onSort(col.key)}
                          className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
                        >
                          {col.label}
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      ) : col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, idx) => {
                  const row = playerRows[idx]
                  const isSelected = selectedPlayer?.id === player.id
                  return (
                    <tr
                      key={player.id}
                      className={`border-t border-[var(--border)]/70 cursor-pointer transition-colors ${isSelected ? 'bg-[var(--purple)]/10' : 'hover:bg-[var(--surface-muted)]/55'}`}
                      onClick={() => {
                        onSelectPlayer(player)
                        onOpenDrawer(true)
                      }}
                    >
                      {playerColumns.map((col) => (
                        <td key={col.key} className={`border-r border-[var(--border)]/50 px-2.5 py-1.5 align-middle last:border-r-0 ${col.emphasis ? 'font-bold tabular-nums text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                          {row[col.key]}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function GrowthTab({ players, profile, activePlayerId, onChangePlayer }) {
  if (!profile) return null

  return (
    <div className="space-y-3">
      <div className="card-base card-solid p-3 space-y-3 relative overflow-hidden">
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 translate-x-[45%] translate-y-[45%] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
        />
        <div className="relative">
          <ReportSectionHeader
            accent="purple"
            title="成长分析"
            action={
              <div className="flex flex-wrap gap-1.5">
                {players.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => onChangePlayer(player.id)}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition-colors ${
                      activePlayerId === player.id
                        ? 'bg-[var(--purple)] text-white shadow-md'
                        : 'bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    #{player.number} {player.name}
                  </button>
                ))}
              </div>
            }
          />

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-3">
              <div className="card-base card-solid p-3 relative overflow-hidden">
                <div
                  className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-35"
                  style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
                />
                <div className="relative">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[18px] font-black text-[var(--text-primary)]">{profile.playerName}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{profile.role}</div>
                    </div>
                    <StatusPill variant="purple">成长样本</StatusPill>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {profile.tags.map((tag) => (
                      <StatusPill key={tag} variant="purple">{tag}</StatusPill>
                    ))}
                  </div>
                </div>
              </div>
              <SkillRadarChart data={profile.radar} />
            </div>

            <div className="space-y-3">
              <GrowthCurveChart data={profile.trend} />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <DenseList
                  rows={profile.focus.map((item, index) => ({
                    label: `重点0${index + 1}`,
                    value: item,
                  }))}
                />
                <DenseList
                  rows={[
                    { label: '建议', value: profile.advice },
                    { label: '走势', value: `${profile.trend[0].efficiency} → ${profile.trend[profile.trend.length - 1].efficiency}` },
                    { label: '出手质量', value: `${profile.trend[0].shotQuality} → ${profile.trend[profile.trend.length - 1].shotQuality}` },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EventHeatmapTab({
  report,
  eventType,
  onChangeEventType,
  activeTeamId,
  onChangeTeamId,
  selectedPlayerId,
  onChangePlayerId,
}) {
  const teamPlayers = report.playerStats.filter((player) => player.teamId === activeTeamId)
  const filteredEvents = report.eventStream.filter((event) => {
    if (eventType !== 'all' && event.type !== eventType) return false
    if (selectedPlayerId !== 'all' && event.playerId !== selectedPlayerId) return false
    return event.teamId === activeTeamId
  })
  const shots = report.shotMap[activeTeamId].shots.filter((shot) => selectedPlayerId === 'all' || shot.playerId === selectedPlayerId)
  const teamProfile = report.teamShotProfile[activeTeamId]
  const accentColor = activeTeamId === 'dg' ? '#3B82F6' : '#D4AF37'
  const eventColumns = [
    { key: 'quarter', label: '节次' },
    { key: 'time', label: '时间' },
    { key: 'label', label: '事件' },
    { key: 'score', label: '比分', emphasis: true },
  ]

  return (
    <div className="space-y-3">
      <div className="card-base card-solid p-3 space-y-3 relative overflow-hidden">
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 translate-x-[45%] translate-y-[45%] rounded-full blur-3xl opacity-25"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
        />
        <div className="relative">
          <ReportSectionHeader
            accent={activeTeamId === 'dg' ? 'info' : 'brand'}
            title="事件热区"
            action={
              <div className="flex flex-wrap gap-1.5">
                {['dg', 'gz'].map((teamId) => (
                  <button
                    key={teamId}
                    type="button"
                    onClick={() => onChangeTeamId(teamId)}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition-colors ${
                      activeTeamId === teamId
                        ? 'bg-[var(--purple)] text-white shadow-md'
                        : 'bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {report.matchMeta.teams[teamId].name}
                  </button>
                ))}
              </div>
            }
          />

          <div className="flex flex-wrap gap-1.5">
            {Object.entries(EVENT_TYPE_LABEL).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onChangeEventType(key)}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition-colors ${
                  eventType === key
                    ? 'bg-[var(--brand)] text-[#0F2A5A] shadow-md'
                    : 'bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {label}
              </button>
            ))}

            <div className="relative">
              <select
                value={selectedPlayerId}
                onChange={(e) => onChangePlayerId(e.target.value)}
                className="appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 pr-8 text-xs text-[var(--text-secondary)]"
              >
                <option value="all">全部球员</option>
                {teamPlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    #{player.number} {player.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
            <HalfCourtHeatmap shots={shots} />

            <div className="space-y-3">
              <div className="card-base card-solid p-3 space-y-2 relative overflow-hidden">
                <div
                  className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-35"
                  style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
                />
                <div className="relative">
                  <ReportSectionHeader accent={activeTeamId === 'dg' ? 'info' : 'brand'} title="分区命中率" />
                  {[
                    ['篮下', teamProfile.rimShare, teamProfile.rimPct],
                    ['中投', teamProfile.midShare, teamProfile.midPct],
                    ['三分', teamProfile.threeShare, teamProfile.threePct],
                  ].map(([label, share, pct]) => (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-[12px]">
                        <span className="text-[var(--text-muted)]">{label}</span>
                        <span className="tabular-nums font-semibold text-[var(--text-primary)]">{share}% / {pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-xl bg-[var(--surface-muted)]">
                        <div className="h-full rounded-l-xl" style={{ width: `${share}%`, background: accentColor }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-base card-solid p-3 relative overflow-hidden">
                <div
                  className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-30"
                  style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
                />
                <div className="relative">
                  <ReportSectionHeader accent="purple" title="事件时间线" />
                  <div className="mt-2 max-h-[416px] overflow-y-auto rounded-xl border border-[var(--border)]">
                    <table className="w-full min-w-[700px] text-[12px]">
                      <thead className="sticky top-0 bg-[var(--surface-muted)]/95 backdrop-blur z-10">
                        <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                          {eventColumns.map((col) => (
                            <th key={col.key} className="border-r border-[var(--border)]/50 px-2.5 py-1.5 last:border-r-0">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvents.map((event) => (
                          <tr key={event.id} className="border-t border-[var(--border)]/70 hover:bg-[var(--surface-muted)]/55">
                            <td className="border-r border-[var(--border)]/50 px-2.5 py-1.5 last:border-r-0">
                              <StatusPill variant="purple">{event.quarter}</StatusPill>
                            </td>
                            <td className="border-r border-[var(--border)]/50 px-2.5 py-1.5 last:border-r-0 tabular-nums text-[var(--text-secondary)]">{event.time}</td>
                            <td className="border-r border-[var(--border)]/50 px-2.5 py-1.5 last:border-r-0 text-[var(--text-primary)]">{event.label}</td>
                            <td className="border-r border-[var(--border)]/50 px-2.5 py-1.5 last:border-r-0 tabular-nums font-bold text-[var(--text-primary)]">{event.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AIAnalystPlatform() {
  const report = useAnalysisReportMock()
  const [activeTab, setActiveTab] = useState('overview')
  const [sortKey, setSortKey] = useState('pts')
  const [sortDir, setSortDir] = useState('desc')
  const [selectedPlayer, setSelectedPlayer] = useState(() => report.playerStats.find((player) => player.id === report.matchMeta.bestPlayerId) ?? report.playerStats[0])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [growthPlayerId, setGrowthPlayerId] = useState(report.matchMeta.bestPlayerId)
  const [eventType, setEventType] = useState('all')
  const [activeTeamId, setActiveTeamId] = useState('dg')
  const [selectedEventPlayerId, setSelectedEventPlayerId] = useState('all')

  const bestPlayer = useMemo(
    () => report.playerStats.find((player) => player.id === report.matchMeta.bestPlayerId) ?? report.playerStats[0],
    [report]
  )

  const sortedPlayers = useMemo(() => {
    const multiplier = sortDir === 'desc' ? -1 : 1
    return [...report.playerStats].sort((a, b) => {
      if (a[sortKey] === b[sortKey]) return a.number - b.number
      return a[sortKey] > b[sortKey] ? multiplier : -multiplier
    })
  }, [report.playerStats, sortDir, sortKey])

  const growthPlayers = useMemo(
    () => Object.keys(report.growthProfiles).map((playerId) => report.playerStats.find((player) => player.id === playerId)).filter(Boolean),
    [report]
  )

  const growthProfile = report.growthProfiles[growthPlayerId]

  function handleSort(nextKey) {
    if (sortKey === nextKey) {
      setSortDir((current) => (current === 'desc' ? 'asc' : 'desc'))
      return
    }
    setSortKey(nextKey)
    setSortDir('desc')
  }

  const margin = report.teamSummary.dg.score - report.teamSummary.gz.score
  const commandQuarterColumns = [
    { key: 'team', label: '球队' },
    { key: 'q1', label: 'Q1', emphasis: true },
    { key: 'q2', label: 'Q2', emphasis: true },
    { key: 'q3', label: 'Q3', emphasis: true },
    { key: 'q4', label: 'Q4', emphasis: true },
    { key: 'total', label: 'Total', emphasis: true },
  ]
  const commandQuarterRows = [
    {
      team: report.matchMeta.teams.dg.shortName,
      q1: report.matchMeta.quarterScores.dg[0],
      q2: report.matchMeta.quarterScores.dg[1],
      q3: report.matchMeta.quarterScores.dg[2],
      q4: report.matchMeta.quarterScores.dg[3],
      total: report.teamSummary.dg.score,
    },
    {
      team: report.matchMeta.teams.gz.shortName,
      q1: report.matchMeta.quarterScores.gz[0],
      q2: report.matchMeta.quarterScores.gz[1],
      q3: report.matchMeta.quarterScores.gz[2],
      q4: report.matchMeta.quarterScores.gz[3],
      total: report.teamSummary.gz.score,
    },
  ]
  const commandFactorColumns = [
    { key: 'metric', label: '指标' },
    { key: 'dg', label: '东莞', emphasis: true },
    { key: 'gz', label: '广州', emphasis: true },
    { key: 'lead', label: '领先项' },
  ]
  const commandFactorRows = [
    { metric: 'eFG%', dg: report.teamShotProfile.dg.efg, gz: report.teamShotProfile.gz.efg, lead: '+9.7' },
    { metric: 'TOV%', dg: report.teamShotProfile.dg.tov, gz: report.teamShotProfile.gz.tov, lead: '少 4.3' },
    { metric: 'ORB%', dg: report.teamShotProfile.dg.orb, gz: report.teamShotProfile.gz.orb, lead: '+7.0' },
    { metric: 'FTR', dg: report.teamShotProfile.dg.ftRate, gz: report.teamShotProfile.gz.ftRate, lead: '+3.9' },
  ]
  const commandPlayerColumns = [
    { key: 'rank', label: '#' },
    { key: 'player', label: '球员' },
    { key: 'pts', label: 'PTS', emphasis: true },
    { key: 'ast', label: 'AST', emphasis: true },
    { key: 'eff', label: 'EFF', emphasis: true },
  ]
  const commandPlayerRows = [...report.playerStats]
    .sort((a, b) => b.eff - a.eff)
    .slice(0, 5)
    .map((player, index) => ({
      rank: index + 1,
      player: `#${player.number} ${player.name}`,
      pts: player.pts,
      ast: player.ast,
      eff: player.eff,
    }))
  const commandOpsColumns = [
    { key: 'slot', label: '席位' },
    { key: 'signal', label: '重点信号', emphasis: true },
    { key: 'value', label: '数值', emphasis: true },
    { key: 'action', label: '教练侧' },
  ]
  const commandOpsRows = [
    { slot: '攻防', signal: '净效率差', value: '+22.3', action: '保持高位挡拆' },
    { slot: '节奏', signal: '回合数', value: report.teamShotProfile.dg.pace, action: '不降速' },
    { slot: '篮板', signal: 'ORB%', value: '+7.0', action: '继续压前场板' },
    { slot: '风险', signal: '主控失误', value: bestPlayer.tov, action: '弱侧提前接应' },
  ]
  const scoreRail = [
    { label: 'Q1', dg: report.matchMeta.quarterScores.dg[0], gz: report.matchMeta.quarterScores.gz[0] },
    { label: 'Q2', dg: report.matchMeta.quarterScores.dg[1], gz: report.matchMeta.quarterScores.gz[1] },
    { label: 'Q3', dg: report.matchMeta.quarterScores.dg[2], gz: report.matchMeta.quarterScores.gz[2] },
    { label: 'Q4', dg: report.matchMeta.quarterScores.dg[3], gz: report.matchMeta.quarterScores.gz[3] },
  ]

  return (
    <div className="animate-fade-in space-y-3 pb-4">
      {/* ========= P1 顶部专业报告 Hero（P2 风格） ========= */}
      <section className="overflow-hidden card-base card-solid shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        {/* 顶部深蓝/金黄切角 Header 条 */}
        <div className="relative">
          <div className="flex items-stretch h-[72px]">
            {/* 左侧深蓝块（切角） */}
            <div
              className="flex-1 flex items-center px-5 relative"
              style={{
                background: 'linear-gradient(135deg, #0F2A5A 0%, #1E3A8A 60%, #0F2A5A 100%)',
                clipPath: 'polygon(0 0, 100% 0, calc(100% - 32px) 100%, 0 100%)',
              }}
            >
              <div className="flex flex-col gap-0.5">
                <div className="text-[10px] font-bold tracking-[0.24em] text-white/60 uppercase">LANXIN SPORTS ANALYTICS</div>
                <div className="text-[22px] leading-none font-black tracking-tight text-white">{report.matchMeta.title}</div>
              </div>
            </div>
            {/* 右侧金黄块（切角反向） */}
            <div
              className="flex-[0.95] flex items-center justify-end px-5 -ml-[32px] relative"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #E8C868 50%, #B8941F 100%)',
                clipPath: 'polygon(32px 0, 100% 0, 100% 100%, 0 100%)',
              }}
            >
              <div className="flex items-center gap-2">
                {report.matchMeta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide"
                    style={{ background: 'rgba(15,42,90,0.18)', color: '#0F2A5A' }}
                  >
                    {tag}
                  </span>
                ))}
                <button
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:brightness-105"
                  style={{ background: '#0F2A5A', color: '#D4AF37' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  导出报告
                </button>
                <button
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border-2 hover:brightness-105"
                  style={{ borderColor: '#0F2A5A', color: '#0F2A5A', background: 'rgba(255,255,255,0.18)' }}
                >
                  <Printer className="w-3.5 h-3.5" />
                  打印简版
                </button>
              </div>
            </div>
          </div>
          {/* 中间比分/赛事信息条 */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-1.5 border-y border-[var(--border)] bg-[var(--surface-muted)]/30">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] tabular-nums text-[var(--text-secondary)]">
              <span className="font-bold text-[var(--text-primary)]">{report.matchMeta.eventName}</span>
              <span>{report.matchMeta.groupName}</span>
              <span>{report.matchMeta.date}</span>
              <span>{report.matchMeta.venue}</span>
              <span className="font-mono text-[var(--text-muted)]">{report.matchMeta.reportId}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-[var(--text-muted)]">分差</span>
              <span className="text-[16px] font-black tabular-nums" style={{ color: 'var(--brand)' }}>+{margin}</span>
              <span className="text-[var(--text-muted)]">东莞领先</span>
              <span className="mx-2 w-px h-4 bg-[var(--border)]" />
              <span className="text-[var(--text-muted)]">核心</span>
              <span className="font-bold text-[var(--text-primary)]">{report.matchMeta.swingQuarter} · {bestPlayer.name}</span>
            </div>
          </div>
        </div>

        {/* 下方：左右球队 Logo 卡 + 中间大比分 + 节分表 */}
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
          {/* 左：主队卡 深蓝渐变 */}
          <div
            className="relative p-5 xl:border-r border-[var(--border)]"
            style={{ background: 'linear-gradient(135deg, rgba(15,42,90,0.12) 0%, rgba(59,130,246,0.04) 100%)' }}
          >
            <div className="flex items-start gap-4">
              {/* 队徽方块 */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #0F2A5A 0%, #1E40AF 100%)',
                  border: '2px solid rgba(212,175,55,0.6)',
                }}
              >
                <span className="text-[26px] leading-none font-black tracking-wider" style={{ color: '#D4AF37' }}>DG</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text-muted)]">{report.matchMeta.teams.dg.record}</div>
                <div className="mt-1 text-[20px] leading-none font-black tracking-tight text-[var(--text-primary)]">{report.matchMeta.teams.dg.name}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: 'rgba(15,42,90,0.14)', color: 'var(--info)' }}>
                    {report.teamSummary.dg.assists} AST
                  </span>
                  <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: 'rgba(15,42,90,0.14)', color: 'var(--info)' }}>
                    {report.teamSummary.dg.rebounds} REB
                  </span>
                </div>
              </div>
            </div>
            {/* 超大得分（蓝色靠右，冲击感 + 扫光呼吸） */}
            <div className="mt-6 pr-0.5 text-right">
              <div
                className="leading-none font-black tabular-nums hero-shine-blue"
                style={{
                  fontSize: '122px',
                  letterSpacing: '-0.03em',
                }}
              >
                {report.teamSummary.dg.score}
              </div>
              <div
                className="mt-1 text-[11px] font-black tracking-[0.36em] uppercase text-right"
                style={{ color: 'rgba(59,130,246,0.75)' }}
              >
                HOME
              </div>
            </div>
          </div>

          {/* 中：对冲 VS + 节分表 */}
          <div className="p-5 relative flex flex-col">
            {/* VS 区：V 微微上抬（小幅度冲击感，渐变独立作用在每个字母防止错位看不见） */}
            <div className="relative flex items-center justify-center pt-5 pb-3 select-none">
              {/* 装饰性对角分隔线（浅） */}
              <div className="pointer-events-none absolute inset-0 flex items-center">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--border)]/70 to-transparent" />
              </div>
              <div className="relative inline-flex flex-col items-center">
                <div
                  className="flex items-end leading-none font-black"
                  style={{
                    letterSpacing: '0.08em',
                    animation: 'glowPulseRed 2.6s ease-in-out infinite',
                  }}
                >
                  <span
                    style={{
                      fontSize: '84px',
                      transform: 'translateY(-3px)',
                      background: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 50%, #F87171 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    V
                  </span>
                  <span
                    style={{
                      fontSize: '84px',
                      background: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 50%, #F87171 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    S
                  </span>
                </div>
                <span
                  className="mt-1 inline-flex items-center gap-2 text-[10px] font-black tracking-[0.30em] uppercase"
                  style={{ color: 'var(--danger)' }}
                >
                  <span className="h-px w-6 bg-[var(--danger)]/60" />
                  FINAL
                  <span className="h-px w-6 bg-[var(--danger)]/60" />
                </span>
              </div>
            </div>

            {/* 节分表 4 格 */}
            <div className="mt-2 grid grid-cols-4 gap-3">
              {scoreRail.map((item) => {
                const net = item.dg - item.gz
                const dgLead = net > 0
                const accentColor = dgLead ? '#3B82F6' : net < 0 ? '#D4AF37' : '#9CA3AF'
                return (
                  <div
                    key={item.label}
                    className="card-base card-solid p-3 text-center relative overflow-hidden"
                  >
                    <div
                      className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-40"
                      style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
                    />
                    <div className="relative">
                      <div className="text-[10px] font-black tracking-[0.2em] text-[var(--text-muted)] uppercase">{item.label}</div>
                      <div className="mt-1 text-[20px] font-black tabular-nums text-[var(--text-primary)]">
                        <span style={{ color: 'var(--info)' }}>{item.dg}</span>
                        <span className="mx-1 text-[var(--text-muted)] font-normal">:</span>
                        <span style={{ color: 'var(--brand)' }}>{item.gz}</span>
                      </div>
                      <div
                        className="mt-0.5 text-[11px] font-bold tabular-nums"
                        style={{ color: dgLead ? 'var(--info)' : net < 0 ? 'var(--brand)' : 'var(--text-muted)' }}
                      >
                        {net > 0 ? '+' : ''}{net}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 最佳球员 + 关键信号小卡 */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="card-base card-solid p-3 relative overflow-hidden">
                <div
                  className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-40"
                  style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
                />
                <div className="relative">
                  <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--text-muted)]">最佳球员 MVP</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(139,92,246,0.18)' }}
                    >
                      <span className="text-[15px] font-black tabular-nums" style={{ color: 'var(--purple)' }}>{bestPlayer.number}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[15px] font-black tracking-tight text-[var(--text-primary)] truncate">{bestPlayer.name}</div>
                      <div className="text-[10px] font-bold tabular-nums text-[var(--text-muted)]">
                        {bestPlayer.pts} PTS · {bestPlayer.ast} AST · {bestPlayer.reb} REB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-base card-solid p-3 relative overflow-hidden">
                <div
                  className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 translate-x-[40%] translate-y-[40%] rounded-full blur-2xl opacity-40"
                  style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
                />
                <div className="relative">
                  <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--text-muted)]">胜负关键</div>
                  <div className="mt-1 text-[15px] font-black tracking-tight text-[var(--text-primary)]">{report.matchMeta.swingQuarter} 拉开</div>
                  <div className="mt-0.5 text-[10px] font-bold tabular-nums text-[var(--text-muted)]">
                    前场篮板 +7.0 · 二次得分 13
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右：客队卡 金黄渐变 */}
          <div
            className="relative p-5 xl:border-l border-[var(--border)]"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(184,148,31,0.04) 100%)' }}
          >
            <div className="flex items-start gap-4 xl:flex-row-reverse">
              {/* 队徽方块 */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                  border: '2px solid rgba(15,42,90,0.5)',
                }}
              >
                <span className="text-[26px] leading-none font-black tracking-wider" style={{ color: '#0F2A5A' }}>GZ</span>
              </div>
              <div className="flex-1 min-w-0 xl:text-right">
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text-muted)]">{report.matchMeta.teams.gz.record}</div>
                <div className="mt-1 text-[20px] leading-none font-black tracking-tight text-[var(--text-primary)]">{report.matchMeta.teams.gz.name}</div>
                <div className="mt-2 flex flex-wrap gap-1 xl:justify-end">
                  <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: 'rgba(212,175,55,0.18)', color: 'var(--brand)' }}>
                    {report.teamSummary.gz.assists} AST
                  </span>
                  <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: 'rgba(212,175,55,0.18)', color: 'var(--brand)' }}>
                    {report.teamSummary.gz.rebounds} REB
                  </span>
                </div>
              </div>
            </div>
            {/* 超大得分（金色靠左，冲击感 + 扫光呼吸） */}
            <div className="mt-6 pl-0.5 text-left">
              <div
                className="leading-none font-black tabular-nums hero-shine-gold"
                style={{
                  fontSize: '122px',
                  letterSpacing: '-0.03em',
                }}
              >
                {report.teamSummary.gz.score}
              </div>
              <div
                className="mt-1 text-[11px] font-black tracking-[0.36em] uppercase text-left"
                style={{ color: 'rgba(184,148,31,0.82)' }}
              >
                AWAY
              </div>
            </div>
          </div>
        </div>

        {/* 底部 4 信息表 */}
        <div className="grid grid-cols-1 gap-3 p-4 pt-2 lg:grid-cols-2 border-t border-[var(--border)]">
          <CommandTable title="节比分" accent="warn" columns={commandQuarterColumns} rows={commandQuarterRows} />
          <CommandTable title="四要素领先项" accent="info" columns={commandFactorColumns} rows={commandFactorRows} />
          <CommandTable title="贡献榜" accent="brand" columns={commandPlayerColumns} rows={commandPlayerRows} />
          <CommandTable title="教练席信号" accent="ok" columns={commandOpsColumns} rows={commandOpsRows} />
        </div>
      </section>

      <div className="flex items-center overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="rounded-xl px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-colors"
            style={activeTab === tab.key ? { color: 'white', background: 'var(--purple)' } : { color: 'var(--text-muted)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? <OverviewTab report={report} bestPlayer={bestPlayer} /> : null}
      {activeTab === 'team' ? <TeamAnalysisTab report={report} /> : null}
      {activeTab === 'players' ? (
        <PlayersTab
          report={report}
          sortedPlayers={sortedPlayers}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          selectedPlayer={selectedPlayer}
          onSelectPlayer={setSelectedPlayer}
          onOpenDrawer={setDrawerOpen}
        />
      ) : null}
      {activeTab === 'growth' ? (
        <GrowthTab
          players={growthPlayers}
          profile={growthProfile}
          activePlayerId={growthPlayerId}
          onChangePlayer={setGrowthPlayerId}
        />
      ) : null}
      {activeTab === 'events' ? (
        <EventHeatmapTab
          report={report}
          eventType={eventType}
          onChangeEventType={setEventType}
          activeTeamId={activeTeamId}
          onChangeTeamId={(teamId) => {
            setActiveTeamId(teamId)
            setSelectedEventPlayerId('all')
          }}
          selectedPlayerId={selectedEventPlayerId}
          onChangePlayerId={setSelectedEventPlayerId}
        />
      ) : null}
      {activeTab === 'biomechanics' ? <BiomechanicsAnalysis /> : null}

      <DetailDrawer
        open={drawerOpen && !!selectedPlayer}
        onClose={() => setDrawerOpen(false)}
        title={selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : ''}
      >
        {selectedPlayer ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill variant={selectedPlayer.teamId === 'dg' ? 'info' : 'brand'}>
                {report.matchMeta.teams[selectedPlayer.teamId].name}
              </StatusPill>
              <StatusPill variant="purple">{selectedPlayer.position}</StatusPill>
              <StatusPill variant="ok">{selectedPlayer.minutes}</StatusPill>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {[
                ['得分', selectedPlayer.pts],
                ['篮板', selectedPlayer.reb],
                ['助攻', selectedPlayer.ast],
                ['效率', selectedPlayer.eff],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</div>
                  <div className="mt-1 text-[22px] font-black tabular-nums text-[var(--text-primary)]">{value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/70 p-3">
              <ReportSectionHeader accent="purple" title="出手结构" />
              <div className="mt-4">
                <ShotMixBars mix={selectedPlayer.shotMix} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-[var(--text-muted)]">
                <div>篮下 {(selectedPlayer.shotMix.rim * 100).toFixed(0)}%</div>
                <div>中投 {(selectedPlayer.shotMix.mid * 100).toFixed(0)}%</div>
                <div>三分 {(selectedPlayer.shotMix.three * 100).toFixed(0)}%</div>
              </div>
            </div>

            <DenseList
              rows={[
                { label: '判断', value: `${selectedPlayer.name} 本场核心价值在 ${selectedPlayer.ast >= 4 ? '持球决策与串联' : '完成度与终结'}` },
                { label: '强项', value: selectedPlayer.tpPct >= 38 ? '外线直接出手' : '中距离与顺下终结' },
                { label: '下一步', value: selectedPlayer.position === 'PG' ? '高压下第一拍保护' : '对抗后第一时间终结' },
              ]}
            />
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  )
}
