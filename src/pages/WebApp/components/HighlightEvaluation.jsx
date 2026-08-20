import React, { useState } from 'react';
import {
  Users, FileText, Clock, Calendar, Share2,
  TrendingUp, TrendingDown, Lightbulb, FileDown
} from 'lucide-react';
import StatusPill from './StatusPill.jsx';

/**
 * 集锦价值多维评估看板（集锦追踪与评估 · 评估页）
 * 左雷达图 + 右趋势曲线 + 五维评分卡 + 底部智能建议
 * @param {Object} props
 * @param {Object} props.data - 评估数据（来自 trackingMock.js 的 EVALUATION_DATA）
 * @param {string} [props.step='evaluate'] - 当前步骤 key（用于顶部圆点高亮）
 * @param {Function} [props.onStepChange]  - 步骤切换回调（提供时顶部圆点可点击）
 */
export default function HighlightEvaluation({ data, step = 'evaluate', onStepChange }) {
  const {
    videoTitle = '粤BA半决赛·张子轩三分绝杀',
    radarData = [],
    overallScore = 0,
    trend7 = [],
    dimensions = [],
    suggestions = []
  } = data || {};

  const [range, setRange] = useState('近7天');

  if (!data) return null;

  const STEPS = [
    { key: 'evaluate', label: '评估' },
    { key: 'shortlink', label: '短链生成' },
    { key: 'source', label: '来源追踪' },
    { key: 'collection', label: '数据采集' },
    { key: 'analysis', label: '数据分析' }
  ];

  const ICON_MAP = { Users, FileText, Clock, Calendar, Share2 };
  const DIM_COLOR = {
    traffic: 'info',
    persona: 'purple',
    behavior: 'brand',
    timing: 'ok',
    path: 'danger'
  };
  const COLOR_TEXT = {
    brand: 'text-[var(--brand)]',
    info: 'text-[var(--info)]',
    ok: 'text-[var(--ok)]',
    warn: 'text-[var(--warn)]',
    danger: 'text-[var(--danger)]',
    purple: 'text-[var(--purple)]'
  };

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">集锦价值多维评估</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">多维度量化集锦传播价值，辅助运营决策</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* 步骤进度条（可点击跳转） */}
          <div className="flex items-center py-1.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
            {STEPS.map((s, i) => {
              const isCurrent = step === s.key;
              return (
                <React.Fragment key={s.key}>
                  {i > 0 && <div className="w-5 h-px bg-[var(--border)] mx-1" />}
                  <button
                    type="button"
                    onClick={onStepChange ? () => onStepChange(s.key) : undefined}
                    disabled={!onStepChange}
                    className={['group flex flex-col items-center gap-0.5', onStepChange ? 'cursor-pointer' : ''].join(' ')}
                    aria-label={onStepChange ? `跳转到${s.label}页面` : s.label}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${isCurrent ? 'bg-[var(--brand)]' : 'bg-[var(--surface-muted)] group-hover:bg-[var(--brand)]/60'}`}
                    />
                    <span
                      className={`text-[10px] whitespace-nowrap transition-colors ${isCurrent ? 'text-[var(--brand)] font-semibold' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`}
                    >
                      {s.label}
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
          <label className="relative inline-flex items-center">
            <span className="sr-only">选择集锦</span>
            <select
              value={videoTitle}
              onChange={() => {}}
              className="input-base px-3 py-2 pr-8 text-sm"
              aria-label="选择集锦"
            >
              <option value={videoTitle}>{videoTitle}</option>
            </select>
          </label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="input-base px-3 py-2 pr-8 text-sm"
            aria-label="选择时间范围"
          >
            <option value="近7天">近7天</option>
            <option value="近30天">近30天</option>
          </select>
          <button type="button" className="btn btn-accent inline-flex items-center gap-2 !py-2 !px-4 text-sm shadow-sm">
            <FileDown size={16} aria-hidden="true" />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ===== 左栏：价值评估雷达 ===== */}
        <div className="col-span-12 lg:col-span-5">
          <div className="card-base card-solid p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">价值评估雷达</h3>
              <StatusPill variant="brand">综合评分</StatusPill>
            </div>

            <div className="relative w-full max-w-[340px] mx-auto shrink-0" style={{ aspectRatio: '1 / 1' }}>
              <RadarChart data={radarData} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-5xl font-black tabular-nums text-[var(--brand)]">{overallScore}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">综合评分</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {radarData.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3 flex flex-col gap-2"
                >
                  <div className="text-sm font-medium text-[var(--text-muted)] truncate">{item.label}</div>
                  <div className="text-2xl font-black tabular-nums text-[var(--text-primary)] leading-none">
                    {item.value}
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand)]"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== 右栏：趋势图 + 五维评分卡 ===== */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="card-base card-solid p-5">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-3">传播效果趋势</h3>
            <TrendChart data={trend7} />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs">
              <LegendItem color="var(--info)" label="播放量" />
              <LegendItem color="var(--ok)" label="完播率" />
              <LegendItem color="var(--brand)" label="互动率" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {dimensions.map((dim) => {
              const color = dim.color || DIM_COLOR[dim.key] || 'brand';
              const Icon = ICON_MAP[dim.icon] || Users;
              const isUp = dim.trend === 'up';
              const TrendIcon = isUp ? TrendingUp : TrendingDown;
              return (
                <div key={dim.key} className="card-base card-solid p-3 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon size={14} style={{ color: `var(--${color})` }} aria-hidden="true" />
                    <span className="text-xs text-[var(--text-muted)] truncate">{dim.label}</span>
                  </div>
                  <div className={`text-2xl font-black tabular-nums mt-1 ${COLOR_TEXT[color] || COLOR_TEXT.brand}`}>
                    {dim.value}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-xs">
                    <TrendIcon size={12} style={{ color: isUp ? 'var(--ok)' : 'var(--danger)' }} aria-hidden="true" />
                    <span style={{ color: isUp ? 'var(--ok)' : 'var(--danger)' }}>
                      {isUp ? '↑' : '↓'}{dim.pct}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-snug mt-1.5">{dim.advice}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== 底部建议条 ===== */}
      <div className="card-base card-solid p-4 border-l-4 border-[var(--brand)]">
        <div className="flex items-start gap-3 flex-col sm:flex-row">
          <div className="flex items-center gap-2 shrink-0">
            <Lightbulb size={18} className="text-[var(--brand)]" aria-hidden="true" />
            <span className="text-sm font-bold text-[var(--text-primary)]">智能优化建议</span>
          </div>
          <div className="flex-1 space-y-1 min-w-0">
            {suggestions.map((s) => (
              <p key={s} className="text-sm text-[var(--text-secondary)] leading-relaxed">· {s}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== SVG 雷达图 ======================== */
const GRID_LEVELS = [20, 40, 60, 80, 100];

function pointFor(value, index, total, radius) {
  const angle = (-Math.PI / 2) + ((Math.PI * 2) / total) * index;
  const r = (value / 100) * radius;
  return { x: 160 + Math.cos(angle) * r, y: 160 + Math.sin(angle) * r };
}

function RadarChart({ data }) {
  if (!data.length) return null;
  const total = data.length;
  const radius = 112;

  const polygon = data
    .map((item, index) => {
      const p = pointFor(item.value, index, total, radius);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 320 320" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      {GRID_LEVELS.map((level) => {
        const points = data
          .map((_, index) => {
            const p = pointFor(level, index, total, radius);
            return `${p.x},${p.y}`;
          })
          .join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray={level === 100 ? '0' : '4 4'}
          />
        );
      })}

      {data.map((item, index) => {
        const edge = pointFor(100, index, total, radius);
        return (
          <g key={item.label}>
            <line
              x1="160"
              y1="160"
              x2={edge.x}
              y2={edge.y}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={edge.x}
              y={edge.y}
              textAnchor={edge.x < 150 ? 'end' : edge.x > 170 ? 'start' : 'middle'}
              dominantBaseline={edge.y < 150 ? 'baseline' : 'hanging'}
              fontSize="12"
              fill="var(--text-muted)"
            >
              {item.label}
            </text>
          </g>
        );
      })}

      <polygon points={polygon} fill="var(--brand)" fillOpacity="0.2" stroke="var(--brand)" strokeWidth="2.5" />

      {data.map((item, index) => {
        const p = pointFor(item.value, index, total, radius);
        return (
          <g key={`${item.label}-dot`}>
            <circle cx={p.x} cy={p.y} r="5" fill="var(--brand)" />
            <circle cx={p.x} cy={p.y} r="2" fill="white" />
          </g>
        );
      })}
    </svg>
  );
}

/* ======================== SVG 三线趋势图 ======================== */
function normalizeSeries(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v) => ((v - min) / span) * 100);
}

function TrendChart({ data }) {
  if (!data.length) return null;

  const X0 = 40;
  const X1 = 440;
  const Y0 = 18;
  const Y1 = 168;
  const n = data.length;
  const step = (X1 - X0) / (n - 1);
  const xOf = (i) => X0 + i * step;
  const yOf = (norm) => Y1 - (norm / 100) * (Y1 - Y0);

  const series = [
    { key: 'plays', color: 'var(--info)', data: data.map((d) => d.plays) },
    { key: 'completion', color: 'var(--ok)', data: data.map((d) => d.completion) },
    { key: 'interaction', color: 'var(--brand)', data: data.map((d) => d.interaction) }
  ];

  return (
    <svg viewBox="0 0 480 200" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      {[0, 50, 100].map((v) => {
        const y = yOf(v);
        return (
          <g key={v}>
            <line x1={X0} y1={y} x2={X1} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
            <text x={X0 - 6} y={y + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">
              {v}
            </text>
          </g>
        );
      })}

      {series.map((s) => {
        const norms = normalizeSeries(s.data);
        const points = data.map((_, i) => `${xOf(i)},${yOf(norms[i])}`).join(' ');
        return (
          <g key={s.key}>
            <polyline
              points={points}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {data.map((_, i) => (
              <circle key={i} cx={xOf(i)} cy={yOf(norms[i])} r="3" fill={s.color} />
            ))}
          </g>
        );
      })}

      {data.map((d, i) => (
        <text
          key={d.day}
          x={xOf(i)}
          y={188}
          textAnchor="middle"
          fontSize="10"
          fill="var(--text-muted)"
        >
          D{d.day}
        </text>
      ))}
    </svg>
  );
}

function LegendItem({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
