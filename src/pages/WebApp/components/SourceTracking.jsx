import React, { useState } from 'react';
import { Navigation, Download, Check, X } from 'lucide-react';
import StatusPill from './StatusPill.jsx';

/**
 * 来源追踪流量分析界面（集锦追踪与评估 · Step2）
 * 渠道环形图 + 302 桑基图 + 设备/地域 + 实时点击日志
 * @param {Object} props
 * @param {Object} props.data           - 来源追踪数据（trackingMock.js 的 SOURCE_DATA）
 * @param {string} [props.step='source'] - 当前步骤 key
 * @param {Function} [props.onStepChange] - 步骤切换回调
 */
export default function SourceTracking({ data, step = 'source', onStepChange }) {
  const {
    channels = [],
    totalClicks = 0,
    flowData = null,
    deviceSplit = [],
    regions = [],
    clickLogs = []
  } = data || {};

  const [link, setLink] = useState('https://smty.tv/s/8K2x9');
  const [range, setRange] = useState('近7天');
  const [activeFilter, setActiveFilter] = useState('全部');

  if (!data) return null;

  const STEPS = [
    { key: 'evaluate', label: '评估' },
    { key: 'shortlink', label: '短链生成' },
    { key: 'source', label: '来源追踪' },
    { key: 'collection', label: '数据采集' },
    { key: 'analysis', label: '数据分析' }
  ];

  const FILTERS = ['全部', '微信', '抖音', '微博', '异常'];

  const filteredLogs = clickLogs.filter((log) => {
    if (activeFilter === '全部') return true;
    if (activeFilter === '异常') return log.status === 'fail' || log.latency >= 5000;
    return log.channel === activeFilter;
  });

  const CHANNEL_PILL = { 微信: 'ok', 抖音: 'danger', 微博: 'info', 直链: 'brand', 其他: 'purple' };

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center shrink-0">
            <Navigation size={18} className="text-[var(--brand)]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">来源追踪</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">追踪每一次点击的来源、设备与跳转路径</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          <select
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="input-base px-3 py-2 pr-8 text-sm"
            aria-label="选择短链"
          >
            <option value="https://smty.tv/s/8K2x9">https://smty.tv/s/8K2x9</option>
            <option value="https://smty.tv/s/7Hq2p">https://smty.tv/s/7Hq2p</option>
          </select>
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
            <Download size={16} aria-hidden="true" />
            导出追踪报告
          </button>
        </div>
      </div>

      {/* ===== 第一行：渠道 / 桑基 / 设备地域 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 来源渠道分布 */}
        <div className="card-base card-solid p-5">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-3">来源渠道分布</h3>
          <div className="relative w-[200px] mx-auto" style={{ aspectRatio: '1 / 1' }}>
            <DonutChart
              segments={channels.map((ch) => ({ pct: ch.pct, color: COLOR_VAR[ch.color] || 'var(--info)' }))}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-3xl font-black tabular-nums text-[var(--text-primary)]">{totalClicks.toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">总点击</div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {channels.map((ch) => (
              <div key={ch.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_VAR[ch.color] || 'var(--info)' }} />
                  <span className="text-[var(--text-secondary)]">{ch.name}</span>
                </div>
                <span className="text-[var(--text-muted)] tabular-nums">{ch.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 流量路径桑基图 */}
        <div className="card-base card-solid p-5">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-3">点击→302跳转→播放 路径流向</h3>
          <SankeyChart flow={flowData} />
          <p className="text-xs text-[var(--text-muted)] mt-3 text-center">302重定向：用户无感知跳转，中间完成埋点采集</p>
        </div>

        {/* 设备与地域 */}
        <div className="card-base card-solid p-5">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-3">设备与地域</h3>

          <div className="mb-5">
            <div className="text-xs text-[var(--text-muted)] font-medium mb-2">设备分布</div>
            <div className="relative w-[96px] mx-auto" style={{ aspectRatio: '1 / 1' }}>
              <DonutChart
                segments={deviceSplit.map((d) => ({ pct: d.pct, color: d.name === '移动端' ? 'var(--info)' : 'var(--surface-muted)' }))}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-lg font-black tabular-nums text-[var(--info)]">
                  {deviceSplit[0]?.pct ?? 0}%
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">{deviceSplit[0]?.name ?? ''}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium mb-2">地域 TOP5</div>
            <div className="space-y-2">
              {regions.map((r) => {
                const max = regions[0]?.clicks || 1;
                return (
                  <div key={r.rank} className="grid grid-cols-[24px_1fr_60px] items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-[var(--text-muted)]">{r.rank}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-[var(--text-primary)] w-8 shrink-0">{r.city}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                        <div className="h-full rounded-full bg-[var(--info)]" style={{ width: `${(r.clicks / max) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-right text-xs tabular-nums text-[var(--text-secondary)]">{r.clicks}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== 第二行：实时点击日志 ===== */}
      <div className="card-base card-solid p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[var(--text-primary)]">点击日志</span>
            <span className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse" aria-hidden="true" />
            <span className="text-xs text-[var(--ok)]">实时</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={[
                  'px-3 py-1 rounded-full text-xs transition-all',
                  activeFilter === f
                    ? 'bg-[var(--brand)] text-black font-semibold'
                    : 'border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand)]/60 hover:text-[var(--text-primary)]'
                ].join(' ')}
                aria-pressed={activeFilter === f}
                aria-label={`筛选${f}日志`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[80px_80px_100px_1fr_120px_80px] gap-2 text-xs text-[var(--text-muted)] font-bold border-b border-[var(--border)] pb-2 mb-1">
          <span>时间</span>
          <span>渠道</span>
          <span>设备</span>
          <span>IP · 地域</span>
          <span>跳转状态</span>
          <span>响应耗时</span>
        </div>

        {filteredLogs.map((log) => {
          const abnormal = log.status === 'fail' || log.latency >= 5000;
          return (
            <div
              key={log.time}
              className={[
                'grid grid-cols-[80px_80px_100px_1fr_120px_80px] gap-2 items-center py-2.5 text-sm border-b border-[var(--border)]/40 last:border-0 transition-colors',
                abnormal ? 'bg-[var(--brand)]/8 border-l-4 border-[var(--brand)] pl-1' : 'hover:bg-[var(--surface-muted)]/40'
              ].join(' ')}
            >
              <span className="font-mono text-xs text-[var(--text-secondary)]">{log.time}</span>
              <span>
                <StatusPill variant={CHANNEL_PILL[log.channel] || 'info'}>{log.channel}</StatusPill>
              </span>
              <span className="text-xs text-[var(--text-secondary)] truncate">{log.device}</span>
              <span className="text-xs text-[var(--text-muted)] truncate">
                {log.ip} · {log.region}
              </span>
              <span className={`flex items-center gap-1 text-xs ${abnormal ? 'text-[var(--danger)]' : 'text-[var(--ok)]'}`}>
                {log.status === 'success' ? <Check size={12} aria-hidden="true" /> : <X size={12} aria-hidden="true" />}
                {log.status === 'success' ? '302→播放' : '跳转超时'}
              </span>
              <span className={`font-mono text-xs ${log.latency >= 5000 ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>
                {log.latency}ms
              </span>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="py-8 text-center text-sm text-[var(--text-muted)]">当前筛选条件下无日志</div>
        )}
      </div>
    </div>
  );
}

/* ======================== 颜色映射 ======================== */
const COLOR_VAR = {
  ok: 'var(--ok)',
  danger: 'var(--danger)',
  info: 'var(--info)',
  brand: 'var(--brand)',
  purple: 'var(--purple)',
  warn: 'var(--warn)'
};

/* ======================== SVG 环形图 ======================== */
function polarToCartesian(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx, cy, rOuter, rInner, start, end) {
  const large = end - start > 180 ? 1 : 0;
  const o1 = polarToCartesian(cx, cy, rOuter, start);
  const o2 = polarToCartesian(cx, cy, rOuter, end);
  const i1 = polarToCartesian(cx, cy, rInner, end);
  const i2 = polarToCartesian(cx, cy, rInner, start);
  return `M ${o1.x} ${o1.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${rInner} ${rInner} 0 ${large} 0 ${i2.x} ${i2.y} Z`;
}

function DonutChart({ segments }) {
  const cx = 100;
  const cy = 100;
  const rOuter = 95;
  const rInner = 70;
  let angle = 0;

  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      {segments.map((seg, i) => {
        const span = (seg.pct / 100) * 360;
        const path = arcPath(cx, cy, rOuter, rInner, angle, angle + span);
        angle += span;
        return <path key={i} d={path} fill={seg.color} />;
      })}
      {segments.length === 0 && (
        <circle cx={cx} cy={cy} r={(rOuter + rInner) / 2} fill="var(--surface-muted)" />
      )}
    </svg>
  );
}

/* ======================== SVG 简化桑基图 ======================== */
function bezierPath(x1, y1, x2, y2) {
  const dx = (x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

function SankeyChart({ flow }) {
  if (!flow) return null;

  const { sources = [] } = flow;
  const total = sources.reduce((s, n) => s + n.value, 0) || 1;

  const bandY = 25;
  const bandH = 180;
  const leftLabelX = 40;
  const leftX = 52;
  const leftW = 62;
  const clickX = 160;
  const clickW = 62;
  const redirectX = 235;
  const redirectW = 62;
  const rightX = 345;
  const rightW = 66;
  const rightLabelX = 448;

  const sourceRects = [];
  let y = bandY;
  sources.forEach((s) => {
    const h = (s.value / total) * bandH;
    sourceRects.push({ ...s, x: leftX, y, w: leftW, h, midY: y + h / 2 });
    y += h;
  });

  const clickNode = { x: clickX, y: 40, w: clickW, h: 110, midY: 95 };
  const redirectNode = { x: redirectX, y: 150, w: redirectW, h: 70, midY: 185 };
  const successNode = { x: rightX, y: 45, w: rightW, h: 100, midY: 95, color: 'var(--ok)' };
  const failNode = { x: rightX, y: 165, w: rightW, h: 40, midY: 185, color: 'var(--danger)' };

  const widthScale = (v) => Math.max(2, (v / total) * 28);

  return (
    <svg viewBox="0 0 500 250" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      {/* 来源 → 点击短链 */}
      {sourceRects.map((s) => (
        <path
          key={`${s.id}-click`}
          d={bezierPath(leftX + leftW, s.midY, clickX, clickNode.midY)}
          fill="none"
          stroke={COLOR_VAR[s.color] || 'var(--info)'}
          strokeOpacity="0.3"
          strokeWidth={widthScale(s.value)}
        />
      ))}

      {/* 点击短链 → 302重定向 */}
      <path
        d={bezierPath(clickX + clickW, clickNode.midY, redirectX, redirectNode.midY)}
        fill="none"
        stroke="var(--brand)"
        strokeOpacity="0.3"
        strokeWidth={widthScale(total)}
      />

      {/* 302重定向 → 结果 */}
      <path
        d={bezierPath(redirectX + redirectW, redirectNode.midY, rightX, successNode.midY)}
        fill="none"
        stroke="var(--ok)"
        strokeOpacity="0.3"
        strokeWidth={widthScale(total * 0.9)}
      />
      <path
        d={bezierPath(redirectX + redirectW, redirectNode.midY, rightX, failNode.midY)}
        fill="none"
        stroke="var(--danger)"
        strokeOpacity="0.3"
        strokeWidth={widthScale(total * 0.1)}
      />

      {/* 来源节点 */}
      {sourceRects.map((s) => (
        <g key={s.id}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="4" fill={COLOR_VAR[s.color] || 'var(--info)'} />
          <text x={leftLabelX} y={s.midY} textAnchor="end" dominantBaseline="middle" fontSize="12" fill="var(--text-muted)">
            {s.label}
          </text>
        </g>
      ))}

      {/* 中间动作节点 */}
      <rect x={clickNode.x} y={clickNode.y} width={clickNode.w} height={clickNode.h} rx="4" fill="var(--surface-muted)" stroke="var(--border)" />
      <text x={clickNode.x + clickNode.w / 2} y={clickNode.midY} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="var(--text-primary)">
        点击短链
      </text>

      <rect
        x={redirectNode.x}
        y={redirectNode.y}
        width={redirectNode.w}
        height={redirectNode.h}
        rx="4"
        fill="var(--surface-muted)"
        stroke="var(--brand)"
        strokeWidth="2"
      />
      <text x={redirectNode.x + redirectNode.w / 2} y={redirectNode.midY} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="var(--brand)">
        302重定向
      </text>

      {/* 右侧结果节点 */}
      <rect x={successNode.x} y={successNode.y} width={successNode.w} height={successNode.h} rx="4" fill={successNode.color} />
      <text x={rightLabelX} y={successNode.midY} textAnchor="start" dominantBaseline="middle" fontSize="12" fill="var(--ok)">
        成功播放
      </text>
      <rect x={failNode.x} y={failNode.y} width={failNode.w} height={failNode.h} rx="4" fill={failNode.color} />
      <text x={rightLabelX} y={failNode.midY} textAnchor="start" dominantBaseline="middle" fontSize="12" fill="var(--danger)">
        跳转失败
      </text>
    </svg>
  );
}
