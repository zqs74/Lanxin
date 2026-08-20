import React, { useState } from 'react';
import { Scale, FileDown, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import StatusPill from './StatusPill.jsx';
import { SYMMETRY_DATA, getSymmetryData } from '../data/biomechanicsMock.js';

const STATUS_COLOR = { ok: 'var(--ok)', warn: 'var(--warn)', danger: 'var(--danger)' };

/**
 * 动作对称性分析界面（生物力学分析 · 维度④）
 * 左右对比人体图 + 对称性雷达图 + 指标明细/趋势 + 损伤风险评估
 * 顶部球员切换对应不同 mock 数据
 * @param {Object} props
 * @param {string} [props.playerName] - 受控球员名
 * @param {Function} [props.onPlayerChange] - 球员切换回调
 */
export default function MovementSymmetry({ playerName: controlledPlayer, onPlayerChange }) {
  const PLAYERS = Object.keys(SYMMETRY_DATA);
  const [localPlayer, setLocalPlayer] = useState(PLAYERS[0] || '张子轩');

  const playerName = controlledPlayer != null ? controlledPlayer : localPlayer;
  const handlePlayerChange = (value) => {
    if (controlledPlayer == null) setLocalPlayer(value);
    if (onPlayerChange) onPlayerChange(value);
  };

  const data = getSymmetryData(playerName) || {};
  const { symmetryData = [], radarData = [], overallSymmetry = 0, riskLevel = {}, history = [] } = data;

  const riskPill = { ok: 'ok', warn: 'warn', danger: 'danger' }[riskLevel.color] || 'ok';

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--purple)]/10 flex items-center justify-center shrink-0">
            <Scale size={18} className="text-[var(--purple)]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">动作对称性分析</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">左右侧肢体发力均衡度 · 损伤风险评估</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={playerName} onChange={(e) => handlePlayerChange(e.target.value)} className="input-base px-3 py-2 pr-8 text-sm" aria-label="选择球员">
            {PLAYERS.map((p) => (
              <option key={p} value={p}>#{SYMMETRY_DATA[p].player.number} {SYMMETRY_DATA[p].player.name}</option>
            ))}
          </select>
          <button type="button" className="btn btn-accent inline-flex items-center gap-2 !py-2 !px-4 text-sm shadow-sm">
            <FileDown size={16} aria-hidden="true" />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ===== 左栏：左右对比人体图 ===== */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card-base card-solid p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">左右侧发力对比</h3>
            <div className="relative w-full max-w-[260px] mx-auto" style={{ aspectRatio: '260 / 390' }}>
              <SymmetryFigure data={symmetryData} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--info)]" />左侧
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--ok)]" />右侧
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--warn)]" />差异关注
              </span>
            </div>
          </div>
        </div>

        {/* ===== 中栏：对称性雷达图 ===== */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card-base card-solid p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">对称性雷达图</h3>
              <StatusPill variant="ok">总对称度 {overallSymmetry}%</StatusPill>
            </div>
            <div className="relative w-full max-w-[250px] mx-auto" style={{ aspectRatio: '1 / 1' }}>
              <SymmetryRadar data={radarData} />
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1">
              {radarData.map((d) => {
                const color = STATUS_COLOR[d.value >= 90 ? 'ok' : d.value >= 85 ? 'warn' : 'danger'];
                return (
                  <div key={d.label} className="text-center px-0.5">
                    <div className="text-[10px] text-[var(--text-muted)] truncate">{d.label}</div>
                    <div className="text-sm font-bold tabular-nums" style={{ color }}>{d.value}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== 右栏：数据表 + 趋势 ===== */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="card-base card-solid p-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">对称性指标明细</h3>
            <div className="grid grid-cols-[1fr_50px_50px_64px] gap-2 text-xs text-[var(--text-muted)] font-bold border-b border-[var(--border)] pb-1.5 mb-1">
              <span>指标</span>
              <span className="text-right">左侧</span>
              <span className="text-right">右侧</span>
              <span className="text-right">对称度</span>
            </div>
            {symmetryData.map((d) => {
              const color = STATUS_COLOR[d.status] || 'var(--text-muted)';
              const warn = d.status === 'warn' || d.status === 'danger';
              return (
                <div
                  key={d.metric}
                  className={[
                    'grid grid-cols-[1fr_50px_50px_64px] gap-2 items-center py-2.5 border-b border-[var(--border)] last:border-0',
                    warn ? 'bg-[var(--warn)]/8 -mx-2 px-2 rounded' : ''
                  ].join(' ')}
                >
                  <span className="text-xs text-[var(--text-primary)] truncate">{d.metric}</span>
                  <span className="text-right text-xs font-mono text-[var(--text-muted)]">{d.left}</span>
                  <span className="text-right text-xs font-mono text-[var(--text-muted)]">{d.right}</span>
                  <span className="flex items-center justify-end gap-1">
                    <span className="text-sm font-bold tabular-nums" style={{ color }}>{d.symmetry}</span>
                    {d.status === 'ok' ? (
                      <Check size={12} className="text-[var(--ok)]" aria-hidden="true" />
                    ) : (
                      <AlertTriangle size={12} className="text-[var(--warn)]" aria-hidden="true" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="card-base card-solid p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">对称度趋势</h3>
              <span className="text-xs text-[var(--text-muted)]">近2个月 · 滚轮滑动查看</span>
            </div>
            <SymmetryTrend history={history} />
          </div>
        </div>
      </div>

      {/* ===== 底部损伤风险预警条 ===== */}
      <div className="card-base card-solid p-4 border-l-4 border-[var(--ok)]">
        <div className="flex items-center gap-3 flex-wrap">
          <ShieldCheck size={24} className="text-[var(--ok)] shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-[var(--ok)]">损伤风险评估：{riskLevel.level}</span>
              <StatusPill variant={riskPill}>{riskLevel.level}</StatusPill>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{riskLevel.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== SVG 真人左右对称标注图 ======================== */
const METRIC_POS = {
  '上肢推力': { left: [89, 114], right: [171, 114] },
  '侧向移动速度': { left: [73, 164], right: [187, 164] },
  '下肢蹬伸力': { left: [102, 221], right: [158, 221] },
  '单腿起跳高度': { left: [101, 292], right: [159, 292] },
  '落地缓冲稳定性': { left: [94, 354], right: [166, 354] }
};

function rOf(value, unit) {
  if (unit === 'N') return Math.min(17, 8 + value / 60);
  if (unit === 'm/s') return Math.min(14, 8 + value * 1.2);
  if (unit === 'cm') return Math.min(15, 8 + value / 7);
  if (unit === '%') return Math.min(16, 8 + value / 12);
  return 12;
}

function SymmetryFigure({ data }) {
  return (
    <svg viewBox="0 0 260 390" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      <image
        href="/images/biomechanics/动作对称性.png"
        x="20"
        y="0"
        width="220"
        height="390"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* 中线 */}
      <line x1="130" y1="20" x2="130" y2="378" stroke="var(--border)" strokeDasharray="4 4" />

      {/* 顶部左右标注 */}
      <text x="60" y="20" textAnchor="middle" fontSize="11" fill="var(--text-muted)">← 左侧</text>
      <text x="200" y="20" textAnchor="middle" fontSize="11" fill="var(--text-muted)">右侧 →</text>

      {/* 左右侧数据圆点 */}
      {data.map((d) => {
        const pos = METRIC_POS[d.metric];
        if (!pos) return null;
        const warn = d.status === 'warn' || d.status === 'danger';
        const leftColor = warn ? 'var(--warn)' : 'var(--info)';
        const rightColor = warn ? 'var(--warn)' : 'var(--ok)';
        return (
          <g key={d.metric}>
            <circle cx={pos.left[0]} cy={pos.left[1]} r={rOf(d.left, d.unit)} fill={leftColor} opacity="0.72" stroke="white" strokeWidth="1" />
            <text x={pos.left[0]} y={pos.left[1]} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="bold" fill="var(--text-primary)">
              {d.left}{d.unit}
            </text>
            <circle cx={pos.right[0]} cy={pos.right[1]} r={rOf(d.right, d.unit)} fill={rightColor} opacity="0.72" stroke="white" strokeWidth="1" />
            <text x={pos.right[0]} y={pos.right[1]} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="bold" fill="var(--text-primary)">
              {d.right}{d.unit}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ======================== SVG 对称性雷达图 ======================== */
const GRID_LEVELS = [20, 40, 60, 80, 100];

function pointFor(value, index, total, radius) {
  const angle = -Math.PI / 2 + ((Math.PI * 2) / total) * index;
  const r = (value / 100) * radius;
  return { x: 140 + Math.cos(angle) * r, y: 140 + Math.sin(angle) * r };
}

function SymmetryRadar({ data }) {
  if (!data.length) return null;
  const total = data.length;
  const radius = 100;

  const polygon = data.map((item, i) => {
    const p = pointFor(item.value, i, total, radius);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 280 280" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={data.map((_, i) => {
            const p = pointFor(level, i, total, radius);
            return `${p.x},${p.y}`;
          }).join(' ')}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray={level === 100 ? '0' : '4 4'}
        />
      ))}

      {data.map((item, i) => {
        const edge = pointFor(100, i, total, radius);
        return (
          <g key={item.label}>
            <line x1="140" y1="140" x2={edge.x} y2={edge.y} stroke="var(--border)" strokeWidth="1" />
            <text
              x={edge.x}
              y={edge.y}
              textAnchor={edge.x < 130 ? 'end' : edge.x > 150 ? 'start' : 'middle'}
              dominantBaseline={edge.y < 130 ? 'baseline' : 'hanging'}
              fontSize="11"
              fill="var(--text-muted)"
            >
              {item.label}
            </text>
          </g>
        );
      })}

      <polygon points={polygon} fill="var(--brand)" fillOpacity="0.2" stroke="var(--brand)" strokeWidth="2.5" />

      {data.map((item, i) => {
        const p = pointFor(item.value, i, total, radius);
        const low = item.value < 90;
        return (
          <g key={`${item.label}-dot`}>
            <circle cx={p.x} cy={p.y} r="5" fill={low ? 'var(--warn)' : 'var(--brand)'} />
            <circle cx={p.x} cy={p.y} r="2" fill="white" />
          </g>
        );
      })}
    </svg>
  );
}

/* ======================== SVG 对称度趋势折线（横向滚动） ======================== */
function SymmetryTrend({ history }) {
  if (!history.length) return null;

  const n = history.length;
  const STEP = 14;
  const W = Math.max(560, n * STEP);
  const H = 100;
  const padL = 12;
  const padR = 12;
  const padT = 16;
  const padB = 22;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yMin = 80;
  const yMax = 95;
  const xOf = (i) => padL + (i / (n - 1)) * plotW;
  const yOf = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const points = history.map((h, i) => `${xOf(i)},${yOf(h.value)}`).join(' ');
  const last = history[n - 1];

  return (
    <div className="overflow-x-auto scrollbar-custom">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ minWidth: W, height: H, display: 'block' }}
      >
        <polyline points={points} fill="none" stroke="var(--ok)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {history.map((h, i) => (
          <circle key={h.date} cx={xOf(i)} cy={yOf(h.value)} r="3" fill="var(--ok)" />
        ))}
        {history.map((h, i) =>
          (i % 7 === 0 || i === n - 1) ? (
            <text key={h.date} x={xOf(i)} y={H - padB + 14} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
              {h.date}
            </text>
          ) : null
        )}
        <text x={xOf(n - 1)} y={yOf(last.value) - 9} textAnchor="end" fontSize="10" fontWeight="bold" fill="var(--ok)">
          {last.value}%
        </text>
      </svg>
    </div>
  );
}
