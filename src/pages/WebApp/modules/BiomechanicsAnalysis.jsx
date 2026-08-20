import React, { useState } from 'react';
import { Dna, FileDown, Award, Construction } from 'lucide-react';
import StatusPill from '../components/StatusPill.jsx';
import JointAngleChain from '../components/JointAngleChain.jsx';
import ForceTimingChart from '../components/ForceTimingChart.jsx';
import CogTrajectoryChart from '../components/CogTrajectoryChart.jsx';
import MovementSymmetry from '../components/MovementSymmetry.jsx';
import FatigueDecayCurve from '../components/FatigueDecayCurve.jsx';

/**
 * 生物力学分析主模块（运动数据分析中台 · 第6个 Tab）
 * 维度导航条（5 维度平级，紫色高亮）+ 球员/赛事下拉 + 认证标准条 + 渲染 5 子页面
 */
const DIMENSIONS = [
  { key: 'joint', label: '关节角度链' },
  { key: 'force', label: '发力时序' },
  { key: 'cog', label: '重心轨迹' },
  { key: 'symmetry', label: '动作对称性' },
  { key: 'fatigue', label: '疲劳衰减曲线' }
];

const DOTS = ['①', '②', '③', '④', '⑤'];
const PLAYER_LABEL = {
  '张子轩': '#23 张子轩',
  '李明超': '#7 李明超',
  '陈浩': '#15 陈浩',
  '王伟': '#9 王伟',
  '赵磊': '#31 赵磊'
};
const EVENTS = ['粤BA半决赛', '省青赛决赛', '城联赛', '村BA'];

function DimensionPlaceholder({ label }) {
  return (
    <div className="card-base card-solid p-16 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--surface-muted)] flex items-center justify-center">
        <Construction size={24} className="text-[var(--purple)]" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold text-[var(--text-primary)]">「{label}」页面开发中</p>
      <p className="text-sm text-[var(--text-muted)] mt-1">后续维度将在此接入</p>
    </div>
  );
}

export default function BiomechanicsAnalysis() {
  const [dimension, setDimension] = useState('joint');
  const [player, setPlayer] = useState('张子轩');
  const [event, setEvent] = useState(EVENTS[0]);

  const renderDimension = () => {
    switch (dimension) {
      case 'joint':
        return <JointAngleChain playerName={player} onPlayerChange={setPlayer} />;
      case 'force':
        return <ForceTimingChart playerName={player} onPlayerChange={setPlayer} />;
      case 'cog':
        return <CogTrajectoryChart playerName={player} onPlayerChange={setPlayer} />;
      case 'symmetry':
        return <MovementSymmetry playerName={player} onPlayerChange={setPlayer} />;
      case 'fatigue':
        return <FatigueDecayCurve playerName={player} onPlayerChange={setPlayer} />;
      default: {
        const meta = DIMENSIONS.find((d) => d.key === dimension);
        return <DimensionPlaceholder label={meta?.label || dimension} />;
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--purple)]/10 flex items-center justify-center shrink-0">
            <Dna size={18} className="text-[var(--purple)]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">生物力学分析</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">关节角度 · 发力时序 · 重心轨迹 · 动作对称性 · 疲劳衰减</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={player} onChange={(e) => setPlayer(e.target.value)} className="input-base px-3 py-2 pr-8 text-sm" aria-label="选择球员">
            {Object.keys(PLAYER_LABEL).map((p) => (
              <option key={p} value={p}>{PLAYER_LABEL[p]}</option>
            ))}
          </select>
          <select value={event} onChange={(e) => setEvent(e.target.value)} className="input-base px-3 py-2 pr-8 text-sm" aria-label="选择赛事">
            {EVENTS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <button type="button" className="btn btn-accent inline-flex items-center gap-2 !py-2 !px-4 text-sm shadow-sm">
            <FileDown size={16} aria-hidden="true" />
            导出完整报告
          </button>
        </div>
      </div>

      {/* ===== 维度导航条 ===== */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {DIMENSIONS.map((d, i) => {
          const active = dimension === d.key;
          return (
            <button
              key={d.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setDimension(d.key)}
              className="rounded-xl px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-colors"
              style={active ? { color: 'white', background: 'var(--purple)' } : { color: 'var(--text-muted)' }}
            >
              <span className="mr-1.5">{DOTS[i]}</span>
              {d.label}
            </button>
          );
        })}
      </div>

      {/* ===== 认证标准提示条 ===== */}
      <div className="card-solid p-3 flex flex-wrap items-center gap-3">
        <Award size={18} className="text-[var(--brand)] shrink-0" aria-hidden="true" />
        <span className="text-sm text-[var(--text-primary)] flex-1 min-w-0">
          评估模型对标《中国篮球协会2025年技术与体能测试数据分析报告》
        </span>
        <StatusPill variant="brand">国家级权威标准</StatusPill>
      </div>

      <section key={dimension}>{renderDimension()}</section>
    </div>
  );
}
