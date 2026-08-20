import React, { useState } from 'react';
import { Activity, FileDown, Lightbulb } from 'lucide-react';
import StatusPill from './StatusPill.jsx';
import { JOINT_ANGLE_DATA, getJointAngleData } from '../data/biomechanicsMock.js';

const STATUS_COLOR = { ok: 'var(--ok)', warn: 'var(--warn)', danger: 'var(--danger)' };

/**
 * 关节角度链分析界面（生物力学分析 · 维度①）
 * 左人体骨架角度图 + 右关节角度卡 + 角度变化时间轴 + 教练建议
 * 顶部球员/动作切换对应不同 mock 数据
 * @param {Object} props
 * @param {string} [props.playerName]         - 受控球员名（由主模块驱动时传入）
 * @param {Function} [props.onPlayerChange]   - 球员切换回调
 */
export default function JointAngleChain({ playerName: controlledPlayer, onPlayerChange }) {
  const PLAYERS = Object.keys(JOINT_ANGLE_DATA);
  const [localPlayer, setLocalPlayer] = useState(PLAYERS[0] || '张子轩');
  const [activeAction, setActiveAction] = useState('投篮出手');

  const playerName = controlledPlayer != null ? controlledPlayer : localPlayer;
  const handlePlayerChange = (value) => {
    if (controlledPlayer == null) setLocalPlayer(value);
    if (onPlayerChange) onPlayerChange(value);
  };

  const player = JOINT_ANGLE_DATA[playerName]?.player || {};
  const activeData = getJointAngleData(playerName, activeAction) || {};
  const { joints = [], timeline = [], overallScore = 0 } = activeData;

  const ACTIONS = ['投篮出手', '防守滑步', '运球突破'];

  const statusColor = (status) => STATUS_COLOR[status] || 'var(--text-muted)';

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--purple)]/10 flex items-center justify-center shrink-0">
            <Activity size={18} className="text-[var(--purple)]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">关节角度链分析</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">投篮·防守动作关节角度生物力学评估</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={`#${player.number} ${player.name}`}
            onChange={(e) => {
              const text = e.target.value;
              const name = text.replace(/^#\d+\s*/, '');
              handlePlayerChange(name);
            }}
            className="input-base px-3 py-2 pr-8 text-sm"
            aria-label="选择球员"
          >
            {PLAYERS.map((p) => (
              <option key={p} value={`#${JOINT_ANGLE_DATA[p].player.number} ${JOINT_ANGLE_DATA[p].player.name}`}>
                #{JOINT_ANGLE_DATA[p].player.number} {JOINT_ANGLE_DATA[p].player.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            {ACTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setActiveAction(a)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs transition-all',
                  activeAction === a ? 'bg-[var(--brand)] text-black font-semibold' : 'border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand)]/60'
                ].join(' ')}
                aria-pressed={activeAction === a}
              >
                {a}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-accent inline-flex items-center gap-2 !py-2 !px-4 text-sm shadow-sm">
            <FileDown size={16} aria-hidden="true" />
            导出分析报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ===== 左栏：人体骨架角度图 ===== */}
        <div className="col-span-12 lg:col-span-5">
          <div className="card-base card-solid p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">人体关节角度示意图</h3>
              <StatusPill variant="brand">综合评分 {overallScore}</StatusPill>
            </div>

            <div className="relative w-full max-w-[300px] mx-auto" style={{ aspectRatio: '280 / 380' }}>
              <HumanFigure joints={joints} />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--ok)]" />理想区间
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--warn)]" />需关注
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--danger)]" />偏差较大
              </span>
            </div>
          </div>
        </div>

        {/* ===== 右栏：角度数据详情 ===== */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {/* 5 个关节角度卡 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {joints.map((j) => {
              const color = statusColor(j.status);
              return (
                <div
                  key={j.name}
                  className="card-base card-solid p-3 border-t-2 min-w-0"
                  style={{ borderTopColor: color, ...(j.status === 'warn' ? { borderLeft: '2px solid var(--warn)' } : {}) }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-[var(--text-muted)]">{j.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-muted)] whitespace-nowrap">
                      {j.phase}
                    </span>
                  </div>
                  <div className="text-2xl font-black tabular-nums mt-1" style={{ color }}>
                    {j.currentAngle}°
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{j.idealMin}°-{j.idealMax}°</div>
                </div>
              );
            })}
          </div>

          {/* 关节角度变化曲线 */}
          <div className="card-base card-solid p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">关节角度变化曲线</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-3">投篮动作 0-500ms 全程关节角度追踪</p>
            <AngleTimelineChart timeline={timeline} />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
              {SERIES.map((s) => (
                <span key={s.key} className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />{s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== 底部教练建议条 ===== */}
      <div className="card-base card-solid p-4 border-l-4 border-[var(--brand)]">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={16} className="text-[var(--brand)]" aria-hidden="true" />
          <span className="text-sm font-bold text-[var(--text-primary)]">教练建议</span>
        </div>
        <ul className="space-y-1.5">
          {joints.map((j) => (
            <li key={j.name} className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: statusColor(j.status) }} />
              <span className="text-sm text-[var(--text-secondary)]">
                <b className="text-[var(--text-primary)]">{j.name}</b>：{j.advice}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ======================== SVG 人体模型图 ======================== */
const SERIES = [
  { key: 'shoulder', label: '肩关节', color: 'var(--brand)' },
  { key: 'elbow', label: '肘关节', color: 'var(--info)' },
  { key: 'wrist', label: '腕关节', color: 'var(--purple)' },
  { key: 'hip', label: '髋关节', color: 'var(--ok)' },
  { key: 'knee', label: '膝关节', color: 'var(--warn)' }
];

const JOINT_POS = {
  // Coordinates are aligned to the supplied 1696x2560 cutout after it is
  // rendered into the 252x380 image box (x=14..266, y=0..380).
  shoulder: { x: 109, y: 123, arc: [248, 338], label: [76, 116] },
  elbow: { x: 69, y: 150, arc: [185, 285], label: [47, 151] },
  wrist: { x: 71, y: 111, arc: [150, 250], label: [48, 106] },
  hip: { x: 116, y: 205, arc: [248, 342], label: [76, 213] },
  knee: { x: 111, y: 282, arc: [238, 332], label: [72, 293] }
};

const JOINT_DISPLAY_ANGLE = {
  shoulder: 71,
  elbow: 111,
  wrist: 162,
  hip: 174,
  knee: 168,
};

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

function HumanFigure() {
  const posOf = (key) => JOINT_POS[key];
  const angleOf = (key) => JOINT_DISPLAY_ANGLE[key] ?? 0;
  const colorOf = () => 'var(--ok)';

  return (
    <svg viewBox="0 0 280 380" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      <image
        href="/images/biomechanics/joint-model.png"
        x="14"
        y="0"
        width="252"
        height="380"
        preserveAspectRatio="xMidYMid meet"
      />

      <defs>
        <filter id="jointGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.4" floodColor="rgba(16,185,129,0.55)" />
        </filter>
      </defs>

      {/* 关键关节标注 */}
      <g filter="url(#jointGlow)">
        {/* 5 个标注关节：弧线 + 高亮圆点 + 角度值 */}
        {SERIES.map((s) => {
          const pos = posOf(s.key);
          const color = colorOf(s.key);
          const angle = angleOf(s.key);
          return (
            <g key={s.key}>
              <path
                d={arcPath(pos.x, pos.y, s.key === 'shoulder' ? 20 : s.key === 'hip' ? 18 : s.key === 'knee' ? 17 : 15, pos.arc[0], pos.arc[1])}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx={pos.x} cy={pos.y} r="6.5" fill={color} stroke="white" strokeWidth="2" />
              <text x={pos.label[0]} y={pos.label[1]} textAnchor="end" fontSize="12" fontWeight="bold" fill="var(--ok)">
                {angle}°
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* ======================== SVG 关节角度时间轴 ======================== */
function AngleTimelineChart({ timeline }) {
  if (!timeline.length) return null;

  const W = 480;
  const H = 200;
  const padL = 44;
  const padR = 18;
  const padT = 16;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xMax = 500;
  const yMax = 150;
  const xOf = (t) => padL + (t / xMax) * plotW;
  const yOf = (v) => padT + (1 - v / yMax) * plotH;

  return (
    <svg viewBox="0 0 480 200" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      {/* Y 轴网格线（每 30°） */}
      {[0, 30, 60, 90, 120, 150].map((v) => (
        <g key={v}>
          <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="var(--border)" strokeDasharray={v === 0 ? '0' : '4 4'} />
          <text x={padL - 8} y={yOf(v) + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">{v}°</text>
        </g>
      ))}

      {/* X 轴刻度线（每 100ms） */}
      {timeline.map((t) => (
        <line key={t.time} x1={xOf(t.time)} y1={padT} x2={xOf(t.time)} y2={padT + plotH} stroke="var(--border)" />
      ))}

      {/* 5 条关节折线 */}
      {SERIES.map((s) => (
        <g key={s.key}>
          <polyline
            points={timeline.map((t) => `${xOf(t.time)},${yOf(t[s.key])}`).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {timeline.map((t) => (
            <circle key={t.time} cx={xOf(t.time)} cy={yOf(t[s.key])} r="3" fill={s.color} />
          ))}
        </g>
      ))}

      {/* X 轴阶段标签 */}
      {timeline.map((t) => (
        <text key={t.time} x={xOf(t.time)} y={H - padB + 16} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
          {t.label}
        </text>
      ))}
    </svg>
  );
}
