import React, { useState } from 'react';
import { TrendingDown, FileDown, Clock, Activity } from 'lucide-react';
import StatusPill from './StatusPill.jsx';
import { FATIGUE_DATA, FATIGUE_MATCH_KEYS, getFatigueData } from '../data/biomechanicsMock.js';

const STATUS_COLOR = { ok: 'var(--ok)', warn: 'var(--warn)', danger: 'var(--danger)' };

/**
 * 疲劳衰减曲线分析界面（生物力学分析 · 维度⑤）
 * 四节指标衰减趋势 + 疲劳指数 + 四节柱图 + 轮换建议
 * 顶部球员/比赛切换对应不同 mock 数据
 * @param {Object} props
 * @param {string} [props.playerName] - 受控球员名
 * @param {Function} [props.onPlayerChange] - 球员切换回调
 * @param {string} [props.match] - 受控比赛
 * @param {Function} [props.onMatchChange] - 比赛切换回调
 */
export default function FatigueDecayCurve({ playerName: controlledPlayer, onPlayerChange, match: controlledMatch, onMatchChange }) {
  const PLAYERS = Object.keys(FATIGUE_DATA);
  const [localPlayer, setLocalPlayer] = useState(PLAYERS[0] || '张子轩');
  const [localMatch, setLocalMatch] = useState(FATIGUE_MATCH_KEYS[0]);

  const playerName = controlledPlayer != null ? controlledPlayer : localPlayer;
  const match = controlledMatch != null ? controlledMatch : localMatch;

  const handlePlayerChange = (value) => {
    if (controlledPlayer == null) setLocalPlayer(value);
    if (onPlayerChange) onPlayerChange(value);
  };
  const handleMatchChange = (value) => {
    if (controlledMatch == null) setLocalMatch(value);
    if (onMatchChange) onMatchChange(value);
  };

  const data = getFatigueData(playerName, match) || {};
  const { quarterData = [], decayMetrics = [], fatigueIndex = {}, comparison = {}, suggestion = '' } = data;

  const pillOf = (status) => (status === 'ok' ? 'ok' : status === 'warn' ? 'warn' : 'danger');
  const labelOf = (status) => (status === 'ok' ? '正常' : status === 'warn' ? '需关注' : '重度');

  const speed = decayMetrics.find((d) => d.metric === '跑动速度');
  const sprint = decayMetrics.find((d) => d.metric === '冲刺次数');
  const angle = decayMetrics.find((d) => d.metric === '投篮角度');

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--purple)]/10 flex items-center justify-center shrink-0">
            <TrendingDown size={18} className="text-[var(--purple)]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">疲劳衰减曲线</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">四节比赛疲劳追踪 · 衰减率分析与轮换建议</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={playerName} onChange={(e) => handlePlayerChange(e.target.value)} className="input-base px-3 py-2 pr-8 text-sm" aria-label="选择球员">
            {PLAYERS.map((p) => (
              <option key={p} value={p}>#{FATIGUE_DATA[p][FATIGUE_MATCH_KEYS[0]].player.number} {FATIGUE_DATA[p][FATIGUE_MATCH_KEYS[0]].player.name}</option>
            ))}
          </select>
          <select value={match} onChange={(e) => handleMatchChange(e.target.value)} className="input-base px-3 py-2 pr-8 text-sm" aria-label="选择比赛">
            {FATIGUE_MATCH_KEYS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button type="button" className="btn btn-accent inline-flex items-center gap-2 !py-2 !px-4 text-sm shadow-sm">
            <FileDown size={16} aria-hidden="true" />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ===== 左栏：多指标衰减折线图 ===== */}
        <div className="col-span-12 lg:col-span-8">
          <div className="card-base card-solid p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">四节比赛指标衰减趋势</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--brand)]" />速度
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--ok)]" />角度
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--danger)]" />冲刺
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--warn)]" />起跳
                </span>
              </div>
            </div>
            <DecayLineChart quarterData={quarterData} decayMetrics={decayMetrics} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
            {decayMetrics.map((d) => {
              const color = STATUS_COLOR[d.status] || 'var(--text-muted)';
              return (
                <div key={d.metric} className="card-base card-solid p-2.5 border-t-2 min-w-0" style={{ borderTopColor: color }}>
                  <div className="text-[10px] text-[var(--text-muted)] truncate">{d.metric}</div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-lg font-black tabular-nums leading-none ${d.status === 'ok' ? '' : ''}`} style={{ color }}>
                      {d.rising ? '↑' : '↓'}{d.decay}%
                    </span>
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] font-mono mt-1">Q1 {d.q1} → Q4 {d.q4}{d.unit}</div>
                  <div className="text-[9px] text-[var(--text-muted)]">警戒 &lt;{d.ideal}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== 右栏 ===== */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* 疲劳指数 */}
          <div className="card-base card-solid p-5">
            <div className="text-center">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">疲劳指数</div>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-5xl font-black tabular-nums text-[var(--text-primary)]">{fatigueIndex.score ?? 0}</span>
                <span className="text-lg text-[var(--text-muted)]">分</span>
              </div>
              <div className="mt-2">
                <StatusPill variant={pillOf(fatigueIndex.score >= 70 ? 'warn' : fatigueIndex.score >= 60 ? 'warn' : 'ok')}>
                  {fatigueIndex.grade} · {fatigueIndex.level}
                </StatusPill>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div>
                <div className="text-[10px] text-[var(--text-muted)]">{comparison.player}</div>
                <div className="text-base font-black tabular-nums text-[var(--brand)]">{comparison.fatigueScore ?? 0}</div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)]">队内均值</div>
                <div className="text-base font-black tabular-nums text-[var(--text-primary)]">{comparison.teamAvg ?? 0}</div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)]">联赛均值</div>
                <div className="text-base font-black tabular-nums text-[var(--text-primary)]">{comparison.leagueAvg ?? 0}</div>
              </div>
            </div>
          </div>

          {/* 四节跑动速度对比柱图 */}
          <div className="card-base card-solid p-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">四节跑动速度对比</h3>
            <QuarterBarChart quarterData={quarterData} />
          </div>

          {/* 轮换建议 */}
          <div className="card-base card-solid p-4 border-l-4 border-[var(--warn)]">
            <div className="flex items-start gap-3 pl-0">
              <Clock size={16} className="text-[var(--warn)] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="text-sm font-bold text-[var(--warn)]">轮换建议</span>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-0.5">{suggestion}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 底部综合疲劳评估总结条 ===== */}
      <div className="card-base card-solid p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Activity size={18} className="text-[var(--brand)] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <span className="text-sm font-bold text-[var(--text-primary)]">综合疲劳评估</span>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{fatigueIndex.desc}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {speed && <StatusPill variant={pillOf(speed.status)}>速度衰减 {labelOf(speed.status)}</StatusPill>}
            {sprint && <StatusPill variant={pillOf(sprint.status)}>冲刺衰减 {labelOf(sprint.status)}</StatusPill>}
            {angle && <StatusPill variant={pillOf(angle.status)}>角度衰减 {labelOf(angle.status)}</StatusPill>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== SVG 多指标衰减折线图 ======================== */
const DECAY_SERIES = [
  { label: '跑动速度', field: 'speed', color: 'var(--brand)' },
  { label: '投篮角度', field: 'angle', color: 'var(--ok)' },
  { label: '冲刺次数', field: 'sprint', color: 'var(--danger)' },
  { label: '起跳高度', field: 'jump', color: 'var(--warn)' }
];

function DecayLineChart({ quarterData, decayMetrics }) {
  if (!quarterData.length) return null;

  const W = 640;
  const H = 280;
  const padL = 46;
  const padR = 110;
  const padT = 18;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yMin = 40;
  const yMax = 100;
  const n = quarterData.length;
  const xOf = (i) => padL + (i / (n - 1)) * plotW;
  const yOf = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const q1Val = (series) => quarterData[0][series.field];
  const normVal = (series, q) => (quarterData[q][series.field] / q1Val(series)) * 100;

  const decayOf = (label) => decayMetrics.find((d) => d.metric === label);

  return (
    <svg viewBox="0 0 640 280" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      {/* Y 轴网格线 */}
      {[100, 80, 60, 40].map((v) => (
        <g key={v}>
          <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="var(--border)" strokeDasharray="4 4" />
          <text x={padL - 8} y={yOf(v) + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">{v}%</text>
        </g>
      ))}

      {/* Q1 = 100% 基准线 */}
      <line x1={padL} y1={yOf(100)} x2={W - padR} y2={yOf(100)} stroke="var(--border)" strokeWidth="1.5" strokeDasharray="2 4" />

      {/* 警戒线 85% */}
      <line x1={padL} y1={yOf(85)} x2={W - padR} y2={yOf(85)} stroke="var(--warn)" strokeDasharray="6 3" />
      <text x={padL} y={yOf(85) - 5} textAnchor="start" fontSize="9" fill="var(--warn)">警戒线 85%</text>

      {/* 4 条衰减折线 */}
      {DECAY_SERIES.map((s) => {
        const points = quarterData.map((_, i) => `${xOf(i)},${yOf(normVal(s, i))}`).join(' ');
        const decay = decayOf(s.label);
        return (
          <g key={s.label}>
            <polyline
              points={points}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {quarterData.map((_, i) =>
              i === 0 ? null : (
                <circle
                  key={i}
                  cx={xOf(i)}
                  cy={yOf(normVal(s, i))}
                  r="4"
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                />
              )
            )}
            {decay && (
              <text x={xOf(n - 1) + 6} y={yOf(normVal(s, n - 1)) + 4} textAnchor="start" fontSize="10" fontWeight="bold" fill={s.color}>
                ↓{decay.decay}%
              </text>
            )}
          </g>
        );
      })}

      {/* X 轴标签 */}
      {quarterData.map((q, i) => (
        <text key={q.quarter} x={xOf(i)} y={H - padB + 18} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--text-muted)">
          {q.quarter}
        </text>
      ))}
    </svg>
  );
}

/* ======================== SVG 四节跑动速度对比柱图 ======================== */
function QuarterBarChart({ quarterData }) {
  if (!quarterData.length) return null;

  const W = 260;
  const H = 120;
  const padT = 16;
  const padB = 24;
  const plotH = H - padT - padB;
  const q1speed = quarterData[0].speed || 1;
  const barColors = ['var(--ok)', 'var(--ok)', 'var(--warn)', 'var(--danger)'];
  const barW = 40;
  const gap = 16;
  const startX = 10;
  const maxH = plotH;

  const last = quarterData[quarterData.length - 1];
  const decay = Math.round(((q1speed - last.speed) / q1speed) * 1000) / 10;

  return (
    <div className="relative">
      <svg viewBox="0 0 260 120" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
        {quarterData.map((q, i) => {
          const h = (q.speed / q1speed) * maxH;
          const x = startX + i * (barW + gap);
          const y = padT + maxH - h;
          return (
            <g key={q.quarter}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="4"
                fill={barColors[i]}
                opacity={i === 1 ? 0.8 : 1}
              />
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--text-primary)">
                {q.speed}
              </text>
              <text x={x + barW / 2} y={H - padB + 14} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                {q.quarter}
              </text>
            </g>
          );
        })}
      </svg>
      <span className="absolute right-0 top-1 text-[11px] font-bold text-[var(--danger)]">↓{decay}%</span>
    </div>
  );
}
