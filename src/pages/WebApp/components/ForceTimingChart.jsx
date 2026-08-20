import React, { useState } from 'react';
import { Zap, FileDown, Check } from 'lucide-react';
import StatusPill from './StatusPill.jsx';
import { FORCE_TIMING_DATA, getForceTimingData } from '../data/biomechanicsMock.js';

const COLOR_VAR = { ok: 'var(--ok)', brand: 'var(--brand)', info: 'var(--info)', warn: 'var(--warn)', danger: 'var(--danger)' };

/**
 * 发力时序分析界面（生物力学分析 · 维度②）
 * 三阶段时序图 + 力-时间曲线 + 效率评分 + 衔接分析
 * 顶部球员切换对应不同 mock 数据
 * @param {Object} props
 * @param {string} [props.playerName]         - 受控球员名（由主模块驱动时传入）
 * @param {Function} [props.onPlayerChange]   - 球员切换回调
 */
export default function ForceTimingChart({ playerName: controlledPlayer, onPlayerChange }) {
  const PLAYERS = Object.keys(FORCE_TIMING_DATA);
  const [localPlayer, setLocalPlayer] = useState(PLAYERS[0] || '张子轩');

  const playerName = controlledPlayer != null ? controlledPlayer : localPlayer;
  const handlePlayerChange = (value) => {
    if (controlledPlayer == null) setLocalPlayer(value);
    if (onPlayerChange) onPlayerChange(value);
  };

  const data = getForceTimingData(playerName) || {};
  const { player = {}, phases = [], overlap = {}, forceCurve = [], efficiency = {}, comparison = {} } = data;

  const stageColor = (color) => COLOR_VAR[color] || 'var(--info)';

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--purple)]/10 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-[var(--purple)]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">发力时序分析</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">下肢→躯干→上肢 动力链顺序与时间分配评估</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={playerName}
            onChange={(e) => handlePlayerChange(e.target.value)}
            className="input-base px-3 py-2 pr-8 text-sm"
            aria-label="选择球员"
          >
            {PLAYERS.map((p) => (
              <option key={p} value={p}>#{FORCE_TIMING_DATA[p].player.number} {FORCE_TIMING_DATA[p].player.name}</option>
            ))}
          </select>
          <button type="button" className="btn btn-accent inline-flex items-center gap-2 !py-2 !px-4 text-sm shadow-sm">
            <FileDown size={16} aria-hidden="true" />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ===== 左栏：三阶段时序图 ===== */}
        <div className="col-span-12 lg:col-span-7">
          <div className="card-base card-solid p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">发力链时序图</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-3">下肢蹬伸 → 躯干传导 → 上肢出手</p>
            <TimingBarChart phases={phases} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {phases.map((p) => {
              const color = stageColor(p.color);
              return (
                <div key={p.id} className="card-base card-solid p-3 border-t-2" style={{ borderTopColor: color }}>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{p.name}</span>
                    <StatusPill variant={p.status === 'ok' ? 'ok' : p.status === 'warn' ? 'warn' : 'danger'}>
                      {p.status === 'ok' ? '标准' : p.status === 'warn' ? '需关注' : '偏差'}
                    </StatusPill>
                  </div>
                  <div className="text-lg font-black tabular-nums mt-1" style={{ color }}>
                    持续时间 {p.durationMs}ms
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">理想区间 {p.idealRange || p.ideal}</div>
                  <div className="text-sm text-[var(--text-secondary)] mt-1">功率输出 {p.power}%</div>
                  <p className="text-[10px] text-[var(--text-muted)] leading-snug mt-1.5">{p.detail}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== 右栏：力-时间曲线 + 效率评分 ===== */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="card-base card-solid p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">力-时间曲线</h3>
            <ForceCurveChart phases={phases} curve={forceCurve} />
          </div>

          <div className="card-base card-solid p-5">
            <div className="text-center">
              <div className="text-6xl font-black text-[var(--brand)]">{efficiency.grade || 'A'}</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">发力效率评分</div>
              <div className="text-3xl font-black tabular-nums text-[var(--text-primary)] mt-1">
                {efficiency.score || 0}<span className="text-lg text-[var(--text-muted)]">分</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div>
                <div className="text-xs text-[var(--text-muted)]">{comparison.player || player.name}</div>
                <div className="text-lg font-black tabular-nums text-[var(--brand)]">{comparison.score ?? 0}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">队内均值</div>
                <div className="text-lg font-black tabular-nums text-[var(--text-primary)]">{comparison.teamAvg ?? 0}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">联赛均值</div>
                <div className="text-lg font-black tabular-nums text-[var(--text-primary)]">{comparison.leagueAvg ?? 0}</div>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] pt-3 mt-4">
              {efficiency.assessment}
            </p>
          </div>
        </div>
      </div>

      {/* ===== 底部衔接分析条 ===== */}
      <div className="card-base card-solid p-4 border-l-4 border-[var(--brand)]">
        <div className="flex items-center gap-3 flex-wrap">
          <Check size={16} className="text-[var(--ok)] shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            阶段衔接重叠 {overlap.totalOverlap}ms（理想区间 {overlap.ideal}）
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            下肢与躯干重叠{overlap.lowerTrunk}ms / 躯干与上肢重叠{overlap.trunkUpper}ms
          </span>
        </div>
      </div>
    </div>
  );
}

/* ======================== SVG 发力时序条形图 ======================== */
function TimingBarChart({ phases }) {
  if (!phases.length) return null;

  const W = 520;
  const H = 200;
  const padL = 24;
  const padR = 24;
  const padT = 24;
  const padB = 28;
  const plotW = W - padL - padR;
  const maxMs = 540;
  const xOf = (t) => padL + (t / maxMs) * plotW;
  const barRows = [45, 92, 139];
  const barH = 36;

  const overlaps = [];
  for (let i = 0; i < phases.length - 1; i++) {
    const a = phases[i];
    const b = phases[i + 1];
    const start = Math.max(a.startMs, b.startMs);
    const end = Math.min(a.startMs + a.durationMs, b.startMs + b.durationMs);
    if (start < end) overlaps.push({ row: i + 1, start, end });
  }

  return (
    <svg viewBox="0 0 520 200" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      <defs>
        <pattern id="overlapStripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="transparent" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--brand)" strokeWidth="2.5" />
        </pattern>
      </defs>

      {/* 时间轴刻度线 */}
      {Array.from({ length: 10 }, (_, i) => i * 60).map((t) => (
        <g key={t}>
          <line x1={xOf(t)} y1={padT} x2={xOf(t)} y2={padT + 160} stroke="var(--border)" />
          <text x={xOf(t)} y={H - padB + 14} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{t}</text>
        </g>
      ))}

      {/* 3 个阶段条 */}
      {phases.map((p, i) => {
        const color = COLOR_VAR[p.color] || 'var(--info)';
        const x = xOf(p.startMs);
        const width = xOf(p.startMs + p.durationMs) - x;
        return (
          <g key={p.id}>
            {/* 上方标注起止时长 */}
            <text x={x} y={barRows[i] - 7} textAnchor="start" fontSize="9" fill="var(--text-muted)">
              {p.startMs}→{p.startMs + p.durationMs}ms
            </text>
            {/* 阶段条 */}
            <rect x={x} y={barRows[i]} width={width} height={barH} rx="6" fill={color} opacity="0.7" />
            {/* 条内标签 */}
            <text x={x + 10} y={barRows[i] + barH / 2} textAnchor="start" dominantBaseline="middle" fontSize="11" fontWeight="bold" fill="var(--text-primary)">
              {p.name} {p.durationMs}ms
            </text>
          </g>
        );
      })}

      {/* 重叠区域斜纹 */}
      {overlaps.map((ov, i) => (
        <rect
          key={i}
          x={xOf(ov.start)}
          y={barRows[ov.row]}
          width={xOf(ov.end) - xOf(ov.start)}
          height={barH}
          rx="6"
          fill="url(#overlapStripes)"
          opacity="0.9"
        />
      ))}

      {/* 底部 ms 单位标注 */}
      <text x={W - padR} y={H - padB + 14} textAnchor="end" fontSize="9" fill="var(--text-muted)">ms</text>
    </svg>
  );
}

/* ======================== SVG 力-时间曲线 ======================== */
function ForceCurveChart({ phases, curve }) {
  if (!curve.length) return null;

  const W = 380;
  const H = 180;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxMs = 540;
  const maxF = 100;
  const xOf = (t) => padL + (t / maxMs) * plotW;
  const yOf = (f) => padT + (1 - f / maxF) * plotH;

  const points = curve.map((d) => `${xOf(d.t)},${yOf(d.f)}`).join(' ');
  const areaPoints = [
    `M ${xOf(curve[0].t)},${yOf(curve[0].f)}`,
    ...curve.map((d) => `L ${xOf(d.t)},${yOf(d.f)}`),
    `L ${xOf(curve[curve.length - 1].t)},${padT + plotH}`,
    `L ${xOf(curve[0].t)},${padT + plotH}`,
    'Z'
  ].join(' ');

  const bounds = phases.length
    ? phases.map((p) => ({ x: xOf(p.startMs + p.durationMs), label: p.name }))
    : [];

  return (
    <svg viewBox="0 0 380 180" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      <defs>
        <linearGradient id="forceGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y 轴网格线 */}
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="var(--border)" strokeDasharray="4 4" />
          <text x={padL - 6} y={yOf(v) + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">{v}</text>
        </g>
      ))}

      {/* 面积渐变 + 曲线 */}
      <polygon points={areaPoints} fill="url(#forceGradient)" opacity="0.15" />
      <polyline points={points} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* 阶段分界虚线 + 标签 */}
      {bounds.map((b) => (
        <g key={b.label}>
          <line x1={b.x} y1={padT} x2={b.x} y2={padT + plotH} stroke="var(--border)" strokeDasharray="3 3" />
          <text x={b.x} y={padT + 10} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{b.label}</text>
        </g>
      ))}
    </svg>
  );
}
