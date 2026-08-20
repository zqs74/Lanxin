import React from 'react';
import { Activity, TrendingUp, ShieldCheck, Check } from 'lucide-react';
import StatusPill from './StatusPill.jsx';

/**
 * 数据采集实时监控界面（集锦追踪与评估 · Step3）
 * 实时数据流 + 数据质量指标 + 智能过滤规则 + 24h 回传趋势
 * @param {Object} props
 * @param {Object} props.data           - 数据采集数据（trackingMock.js 的 COLLECTION_DATA）
 * @param {string} [props.step='collection'] - 当前步骤 key
 * @param {Function} [props.onStepChange]    - 步骤切换回调
 */
export default function DataCollection({ data, step = 'collection', onStepChange }) {
  const {
    stats = {},
    liveLogs = [],
    filterRules = { spider: [], ip: [] },
    trend24h = []
  } = data || {};

  if (!data) return null;

  const STEPS = [
    { key: 'evaluate', label: '评估' },
    { key: 'shortlink', label: '短链生成' },
    { key: 'source', label: '来源追踪' },
    { key: 'collection', label: '数据采集' },
    { key: 'analysis', label: '数据分析' }
  ];

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center shrink-0">
            <Activity size={18} className="text-[var(--brand)]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">数据采集</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">实时回传 · 智能清洗 · 保证数据真实有效</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse" aria-hidden="true" />
            <span className="text-sm text-[var(--ok)] font-medium">采集中</span>
            <span className="text-xs text-[var(--text-muted)]">今日累计 {(stats.totalClicks ?? 0).toLocaleString()} 条</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ===== 左栏：实时数据流（终端风格） ===== */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card-base card-solid p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[var(--text-primary)]">实时数据流</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse" aria-hidden="true" />
                <span className="text-[10px] text-[var(--danger)] font-bold tracking-wider">LIVE</span>
              </div>
            </div>

            <div className="bg-[var(--bg-primary)] rounded-xl p-3 font-mono text-[11px] leading-relaxed max-h-[420px] overflow-y-auto flex-1 scrollbar-custom">
              {liveLogs.map((log) => (
                <div key={log.time} className="whitespace-nowrap">
                  <span className="text-[var(--text-muted)]">[{log.time}] </span>
                  <span className="text-[var(--info)]">src:{log.src}</span>
                  <span className="text-[var(--text-primary)]"> dev:{log.dev}</span>
                  <span className="text-[var(--text-muted)]"> ip:{log.ip}</span>
                  <span className="text-[var(--text-muted)]"> → </span>
                  {log.status === 'valid' ? (
                    <span className="text-[var(--ok)]">有效✓</span>
                  ) : (
                    <span className="text-[var(--danger)]">拦截✗</span>
                  )}
                  {log.status === 'blocked' && <span className="text-[var(--warn)]">({log.reason})</span>}
                </div>
              ))}
            </div>

            <div className="text-[10px] text-[var(--text-muted)] mt-2">仅显示最近 {liveLogs.length} 条 · 自动滚动</div>
          </div>
        </div>

        {/* ===== 右栏 ===== */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* 4 个质量指标卡 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="card-base card-solid p-4 border-l-4 border-[var(--info)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">今日总点击</span>
                <TrendingUp size={14} className="text-[var(--ok)]" aria-hidden="true" />
              </div>
              <div className="text-3xl font-black tabular-nums mt-1 text-[var(--text-primary)]">
                {(stats.totalClicks ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-[var(--ok)] mt-1">↑8.3%</div>
            </div>

            <div className="card-base card-solid p-4 border-l-4 border-[var(--ok)]">
              <span className="text-xs text-[var(--text-muted)]">有效数据 · 占比{stats.validPct}%</span>
              <div className="text-3xl font-black tabular-nums mt-1 text-[var(--ok)]">
                {(stats.validClicks ?? 0).toLocaleString()}
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--ok)]" style={{ width: `${stats.validPct ?? 0}%` }} />
              </div>
            </div>

            <div className="card-base card-solid p-4 border-l-4 border-[var(--danger)]">
              <span className="text-xs text-[var(--text-muted)]">已过滤爬虫</span>
              <div className="text-3xl font-black tabular-nums mt-1 text-[var(--danger)]">
                {stats.spiderBlocked ?? 0}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                UA黑名单{stats.spiderUA ?? 0} / 频率异常{stats.spiderFreq ?? 0}
              </div>
            </div>

            <div className="card-base card-solid p-4 border-l-4 border-[var(--warn)]">
              <span className="text-xs text-[var(--text-muted)]">异常IP拦截</span>
              <div className="text-3xl font-black tabular-nums mt-1 text-[var(--warn)]">
                {stats.ipBlocked ?? 0}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                高频{stats.ipHighFreq ?? 0} / 地域突变{stats.ipGeoJump ?? 0}
              </div>
            </div>
          </div>

          {/* 智能过滤规则 */}
          <div className="card-base card-solid p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[var(--brand)]" aria-hidden="true" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">智能过滤规则</h3>
              </div>
              <StatusPill variant="ok">规则生效中</StatusPill>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-[var(--text-muted)] mb-2">爬虫识别</div>
                <div className="space-y-1.5">
                  {filterRules.spider.map((r) => (
                    <div key={r} className="flex items-center gap-2">
                      <Check size={14} className="text-[var(--ok)] shrink-0" aria-hidden="true" />
                      <span className="text-sm text-[var(--text-secondary)]">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-muted)] mb-2">异常IP识别</div>
                <div className="space-y-1.5">
                  {filterRules.ip.map((r) => (
                    <div key={r} className="flex items-center gap-2">
                      <Check size={14} className="text-[var(--ok)] shrink-0" aria-hidden="true" />
                      <span className="text-sm text-[var(--text-secondary)]">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 24 小时回传趋势 */}
          <div className="card-base card-solid p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">24小时回传趋势</h3>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[var(--surface-muted)]" />
                  原始数据
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[var(--ok)]" />
                  清洗后有效
                </span>
              </div>
            </div>
            <CollectionTrendChart data={trend24h} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== SVG 柱 + 折线组合图 ======================== */
function CollectionTrendChart({ data }) {
  if (!data.length) return null;

  const W = 480;
  const H = 160;
  const top = 12;
  const bottom = 132;
  const maxRaw = Math.max(...data.map((d) => d.raw));
  const scale = (bottom - top) / maxRaw;
  const xOf = (i) => i * 20 + 10;
  const yOf = (v) => bottom - v * scale;

  const linePoints = data.map((d, i) => `${xOf(i)},${yOf(d.cleaned)}`).join(' ');
  const areaPoints = [
    `M ${xOf(0)},${yOf(data[0].cleaned)}`,
    ...data.map((d, i) => `L ${xOf(i)},${yOf(d.cleaned)}`),
    `L ${xOf(data.length - 1)},${bottom}`,
    `L ${xOf(0)},${bottom}`,
    'Z'
  ].join(' ');

  return (
    <svg viewBox="0 0 480 160" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      <defs>
        <linearGradient id="cleanArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ok)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--ok)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {data.map((d, i) => (
        <rect
          key={d.hour}
          x={xOf(i) - 5}
          y={yOf(d.raw)}
          width="10"
          height={Math.max(0, bottom - yOf(d.raw))}
          fill="var(--surface-muted)"
          rx="2"
        />
      ))}

      <polygon points={areaPoints} fill="url(#cleanArea)" />
      <polyline
        points={linePoints}
        fill="none"
        stroke="var(--ok)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => (
        <circle key={`c-${d.hour}`} cx={xOf(i)} cy={yOf(d.cleaned)} r="2" fill="var(--ok)" />
      ))}

      {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
        <text key={h} x={xOf(h)} y={148} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
          {String(h).padStart(2, '0')}:00
        </text>
      ))}
    </svg>
  );
}
