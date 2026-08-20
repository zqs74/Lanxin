import React, { useState } from 'react';
import { Move, FileDown, AlertTriangle } from 'lucide-react';
import StatusPill from './StatusPill.jsx';
import { COG_TRAJECTORY_DATA, COG_SEQUENCE_KEYS, getCogTrajectoryData } from '../data/biomechanicsMock.js';

const STATUS_COLOR = { ok: 'var(--ok)', warn: 'var(--warn)', danger: 'var(--danger)' };
const PHASE_COLOR = { dribble: 'var(--info)', jump: 'var(--brand)', land: 'var(--warn)' };

/**
 * 重心轨迹分析界面（生物力学分析 · 维度③）
 * 球场俯视轨迹 + 重心高度曲线 + 三阶段分析 + 落地预警
 * 顶部球员/动作序列切换对应不同 mock 数据
 * @param {Object} props
 * @param {string} [props.playerName] - 受控球员名
 * @param {Function} [props.onPlayerChange] - 球员切换回调
 * @param {string} [props.action] - 受控动作序列
 * @param {Function} [props.onActionChange] - 动作序列切换回调
 */
export default function CogTrajectoryChart({ playerName: controlledPlayer, onPlayerChange, action: controlledAction, onActionChange }) {
  const PLAYERS = Object.keys(COG_TRAJECTORY_DATA);
  const [localPlayer, setLocalPlayer] = useState(PLAYERS[0] || '张子轩');
  const [localAction, setLocalAction] = useState(COG_SEQUENCE_KEYS[0]);

  const playerName = controlledPlayer != null ? controlledPlayer : localPlayer;
  const action = controlledAction != null ? controlledAction : localAction;

  const handlePlayerChange = (value) => {
    if (controlledPlayer == null) setLocalPlayer(value);
    if (onPlayerChange) onPlayerChange(value);
  };
  const handleActionChange = (value) => {
    if (controlledAction == null) setLocalAction(value);
    if (onActionChange) onActionChange(value);
  };

  const data = getCogTrajectoryData(playerName, action) || {};
  const { courtPath = [], heightCurve = [], phases = [], metrics = {}, warning = '' } = data;

  const metricCards = [
    { label: '最高重心', value: `${metrics.maxHeight ?? 0}cm`, color: 'text-[var(--brand)]' },
    { label: '起跳高度', value: `${metrics.jumpHeight ?? 0}cm`, color: 'text-[var(--ok)]' },
    { label: '落地稳定', value: `${metrics.landingStability ?? 0}%`, color: 'text-[var(--warn)]' },
    { label: '重心控制', value: `${metrics.cogControl ?? 0}%`, color: 'text-[var(--info)]' }
  ];

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--purple)]/10 flex items-center justify-center shrink-0">
            <Move size={18} className="text-[var(--purple)]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">重心轨迹分析</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">运球突破→急停跳投 重心运动学追踪</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={playerName} onChange={(e) => handlePlayerChange(e.target.value)} className="input-base px-3 py-2 pr-8 text-sm" aria-label="选择球员">
            {PLAYERS.map((p) => (
              <option key={p} value={p}>#{COG_TRAJECTORY_DATA[p].player.number} {COG_TRAJECTORY_DATA[p].player.name}</option>
            ))}
          </select>
          <select value={action} onChange={(e) => handleActionChange(e.target.value)} className="input-base px-3 py-2 pr-8 text-sm" aria-label="选择动作序列">
            {COG_SEQUENCE_KEYS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="button" className="btn btn-accent inline-flex items-center gap-2 !py-2 !px-4 text-sm shadow-sm">
            <FileDown size={16} aria-hidden="true" />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ===== 左栏：球场俯视轨迹 ===== */}
        <div className="col-span-12 lg:col-span-7">
          <div className="card-base card-solid p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">球场重心轨迹</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                {metricCards.map((m) => (
                  <div key={m.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/40 px-2 py-1.5 min-w-[64px]">
                    <div className={`text-lg font-black tabular-nums leading-none ${m.color}`}>{m.value}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full max-w-[330px] mx-auto" style={{ aspectRatio: '300 / 350' }}>
              <CourtChart path={courtPath} />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--info)]" />运球阶段
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--brand)]" />起跳阶段
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--warn)]" />落地阶段
              </span>
            </div>
          </div>
        </div>

        {/* ===== 右栏：高度曲线 + 三阶段分析 ===== */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="card-base card-solid p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">重心高度-时间曲线</h3>
            <HeightCurveChart curve={heightCurve} phases={phases} />
          </div>

          <div className="card-base card-solid p-4 space-y-3">
            {phases.map((p) => {
              const color = STATUS_COLOR[p.status] || 'var(--text-muted)';
              return (
                <div key={p.name} className="flex items-center gap-3 pl-3" style={{ borderLeft: `3px solid ${color}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--text-primary)]">{p.name}</span>
                      <StatusPill variant={p.status === 'ok' ? 'ok' : p.status === 'warn' ? 'warn' : 'danger'}>
                        {p.status === 'ok' ? '稳定' : p.status === 'warn' ? '需关注' : '风险'}
                      </StatusPill>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      时长 {p.duration} | 重心 {p.heightRange}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-snug mt-1">{p.desc}</p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.stability}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== 底部落地稳定性预警条 ===== */}
      <div className="card-base card-solid p-4 border-l-4 border-[var(--warn)]">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-[var(--warn)] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="text-sm font-bold text-[var(--warn)]">落地稳定性预警</span>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-0.5">{warning}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== SVG 半场球场 + 轨迹 ======================== */
function polar(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx, cy, r, a1, a2) {
  const start = polar(cx, cy, r, a1);
  const end = polar(cx, cy, r, a2);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

function CourtChart({ path }) {
  if (!path.length) return null;

  const groupKey = (p) => (p.phase === 'start' || p.phase === 'dribble' || p.phase === 'stop' ? 'dribble' : p.phase);
  const segments = [];
  path.forEach((p, i) => {
    const g = groupKey(p);
    if (i === 0 || groupKey(path[i - 1]) !== g) segments.push({ color: PHASE_COLOR[g], points: [] });
    segments[segments.length - 1].points.push(p);
  });

  const peak = path.reduce((a, b) => (a.h >= b.h ? a : b));
  const firstLand = path.find((p) => p.phase === 'land');
  const LABELS = new Set(['起步', '加速突破', '急停', '最高点', '出手', '落地']);

  return (
    <svg viewBox="0 0 300 350" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      <defs>
        <linearGradient id="courtFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--surface-muted) 88%, var(--brand) 12%)" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--surface) 80%, #6a4b1f 20%)" />
        </linearGradient>
        <linearGradient id="paintArea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--brand) 35%, var(--surface))" stopOpacity="0.55" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--warn) 18%, var(--surface))" stopOpacity="0.28" />
        </linearGradient>
        <filter id="trajectoryGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(212,175,55,0.28)" />
        </filter>
      </defs>

      {/* 球场背景 */}
      <rect x="12" y="12" width="276" height="326" rx="20" fill="url(#courtFloor)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="22" y="22" width="256" height="306" rx="16" fill="none" stroke="color-mix(in srgb, var(--border) 75%, white 25%)" strokeWidth="1.2" />

      {/* 木地板分区细线 */}
      {[58, 94, 130, 166, 202, 238].map((x) => (
        <line key={x} x1={x} y1="22" x2={x} y2="328" stroke="color-mix(in srgb, var(--border) 35%, transparent)" strokeWidth="0.8" />
      ))}

      {/* 中线 + 中圈（标准半场下半区） */}
      <line x1="22" y1="255" x2="278" y2="255" stroke="var(--border)" strokeWidth="1.6" />
      <circle cx="150" cy="255" r="34" fill="none" stroke="var(--border)" strokeWidth="1.6" />
      <circle cx="150" cy="255" r="4" fill="var(--border)" opacity="0.7" />

      {/* 罚球区/禁区（居中，篮筐正下方） */}
      <rect x="120" y="40" width="60" height="98" rx="4" fill="url(#paintArea)" stroke="var(--border)" strokeWidth="1.8" />
      <rect x="132" y="40" width="36" height="42" fill="none" stroke="color-mix(in srgb, var(--border) 90%, white 10%)" strokeWidth="1.2" />
      <line x1="120" y1="138" x2="180" y2="138" stroke="var(--border)" strokeWidth="1.8" />
      <path d={arcPath(150, 138, 20, 180, 360)} fill="none" stroke="var(--border)" strokeWidth="1.5" />
      <path d={arcPath(150, 138, 20, 0, 180)} fill="none" stroke="color-mix(in srgb, var(--border) 65%, transparent)" strokeWidth="1.2" strokeDasharray="4 4" />

      {/* 三分线（大弧居中，从左侧到右侧包住禁区） */}
      <path d={arcPath(150, 40, 106, 199, 341)} fill="none" stroke="var(--border)" strokeWidth="1.8" />
      <line x1="46" y1="40" x2="46" y2="188" stroke="var(--border)" strokeWidth="1.6" />
      <line x1="254" y1="40" x2="254" y2="188" stroke="var(--border)" strokeWidth="1.6" />

      {/* 篮板 + 篮筐（顶部居中） */}
      <line x1="150" y1="24" x2="150" y2="58" stroke="color-mix(in srgb, white 55%, var(--border) 45%)" strokeWidth="2.4" />
      <rect x="146" y="30" width="8" height="3" rx="1.5" fill="color-mix(in srgb, white 70%, var(--border) 30%)" />
      <circle cx="150" cy="40" r="7.5" fill="none" stroke="var(--brand)" strokeWidth="2.4" />
      <circle cx="150" cy="40" r="2.3" fill="var(--brand)" />
      <path d="M143 46 Q150 51 157 46" fill="none" stroke="color-mix(in srgb, white 75%, var(--brand) 25%)" strokeWidth="1.2" />

      {/* 轨迹分段折线 */}
      {segments.map((seg, i) => (
        <polyline
          key={i}
          points={seg.points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={seg.color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#trajectoryGlow)"
        />
      ))}

      {/* 轨迹点 */}
      {path.map((p, i) => {
        const g = groupKey(p);
        const isPeak = p === peak;
        const isFirstLand = p === firstLand;
        const isStart = i === 0;
        let r = 3.5;
        let fill = PHASE_COLOR[g];
        if (isPeak) {
          r = 6;
          fill = 'var(--brand)';
        } else if (isFirstLand) {
          r = 5;
          fill = 'var(--warn)';
        } else if (isStart) {
          r = 5;
          fill = 'var(--info)';
        }
        return (
          <g key={`${p.x}-${p.y}`}>
            {isPeak && (
              <circle cx={p.x} cy={p.y} r="11" fill="none" stroke="var(--brand)" strokeWidth="1.8" opacity="0.55" />
            )}
            <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke="white" strokeWidth="1.4" />
            {LABELS.has(p.label) && (
              <text x={p.x} y={p.y + (i % 2 === 0 ? -10 : 16)} textAnchor="middle" fontSize="8.5" fontWeight="600" fill="var(--text-primary)">
                {p.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ======================== SVG 重心高度曲线 ======================== */
function HeightCurveChart({ curve, phases }) {
  if (!curve.length) return null;

  const W = 360;
  const H = 200;
  const padL = 38;
  const padR = 12;
  const padT = 12;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxT = 2.0;
  const yMin = 80;
  const yMax = 160;
  const xOf = (t) => padL + (t / maxT) * plotW;
  const yOf = (h) => padT + (1 - (h - yMin) / (yMax - yMin)) * plotH;

  const points = curve.map((d) => `${xOf(d.t)},${yOf(d.h)}`).join(' ');
  const areaPoints = [
    `M ${xOf(curve[0].t)},${yOf(curve[0].h)}`,
    ...curve.map((d) => `L ${xOf(d.t)},${yOf(d.h)}`),
    `L ${xOf(curve[curve.length - 1].t)},${padT + plotH}`,
    `L ${xOf(curve[0].t)},${padT + plotH}`,
    'Z'
  ].join(' ');

  const peak = curve.reduce((a, b) => (a.h >= b.h ? a : b));
  const bounds = [];
  let acc = 0;
  phases.forEach((p) => {
    acc += parseFloat(p.duration) || 0;
    bounds.push({ t: acc, label: p.name });
  });

  return (
    <svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      <defs>
        <linearGradient id="cogGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y 轴网格线 */}
      {[80, 100, 120, 140, 160].map((v) => (
        <g key={v}>
          <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="var(--border)" strokeDasharray="4 4" />
          <text x={padL - 6} y={yOf(v) + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">{v}</text>
        </g>
      ))}

      {/* 面积 + 曲线 */}
      <polygon points={areaPoints} fill="url(#cogGradient)" opacity="0.1" />
      <polyline points={points} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* 阶段分界虚线 */}
      {bounds.map((b) => (
        <g key={b.label}>
          <line x1={xOf(b.t)} y1={padT} x2={xOf(b.t)} y2={padT + plotH} stroke="var(--border)" strokeDasharray="3 3" />
          <text x={xOf(b.t)} y={padT + 10} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{b.label}</text>
        </g>
      ))}

      {/* 最高点标注 */}
      <circle cx={xOf(peak.t)} cy={yOf(peak.h)} r="5" fill="var(--brand)" />
      <text x={xOf(peak.t)} y={yOf(peak.h) - 8} textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--brand)">
        {peak.h}cm
      </text>
    </svg>
  );
}
