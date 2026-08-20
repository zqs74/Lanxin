import React, { useState } from 'react';
import {
  Trophy, CalendarDays, ArrowLeft, Download, Printer,
  PieChart, TrendingDown, CheckCircle2, Check, Send,
  Users, Building2, Package, Megaphone
} from 'lucide-react';
import StatusPill from './StatusPill.jsx';
import KpiStrip from './KpiStrip.jsx';
import StepFlowIndicator from './StepFlowIndicator.jsx';

/**
 * 资源智能匹配 · Step3 输出清单
 * 顶部赛事信息 + 汇总KPI + 左四库清单 + 右成本环形图/时间轴 + 底部确认下发
 * @param {Object} props
 * @param {Object} props.data
 * @param {Object}   props.data.eventInfo        - 赛事信息
 * @param {Object}   props.data.summary          - 汇总统计
 * @param {Object[]} props.data.categorySummary  - 四库分类清单
 * @param {Object[]} props.data.costBreakdown    - 成本分布
 * @param {Object[]} props.data.timeline         - 赛事时间轴
 * @param {string}   [props.step='output']       - 当前步骤 key
 * @param {Function} [props.onStepChange]        - 步骤切换回调
 * @param {Function} [props.onPrev]              - 返回匹配
 */
export default function ResourceOutputList({ data, step = 'output', onStepChange, onPrev }) {
  const {
    eventInfo = {}, summary = {}, categorySummary = [], costBreakdown = [], timeline = []
  } = data || {};
  const [dispatchedFlash, setDispatchedFlash] = useState(false);

  if (!data) return null;

  const STEPS = [
    { key: 'input', label: '输入需求' },
    { key: 'matching', label: '自动匹配' },
    { key: 'output', label: '输出清单' }
  ];

  const DB_ICON = { Users, Building2, Package, Megaphone };
  const DB_TEXT = {
    info: 'text-[var(--info)]', ok: 'text-[var(--ok)]',
    warn: 'text-[var(--warn)]', purple: 'text-[var(--purple)]'
  };
  const DB_BG = {
    info: 'bg-[var(--info)]/15', ok: 'bg-[var(--ok)]/15',
    warn: 'bg-[var(--warn)]/15', purple: 'bg-[var(--purple)]/15'
  };
  const DB_BORDER = {
    info: 'border-l-[var(--info)]', ok: 'border-l-[var(--ok)]',
    warn: 'border-l-[var(--warn)]', purple: 'border-l-[var(--purple)]'
  };
  const COLOR_VAR = {
    info: 'var(--info)', ok: 'var(--ok)', warn: 'var(--warn)', purple: 'var(--purple)'
  };

  const PHASE_DOT = { prepare: 'var(--info)', match: 'var(--brand)', wrapup: 'var(--purple)' };

  const fmt = (n) => (Number(n) || 0).toLocaleString();

  /* ===== SVG 环形图辅助 ===== */
  const polar = (cx, cy, r, deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arcPath = (cx, cy, innerR, outerR, start, end) => {
    const large = end - start > 180 ? 1 : 0;
    const sOut = polar(cx, cy, outerR, start);
    const eOut = polar(cx, cy, outerR, end);
    const sIn = polar(cx, cy, innerR, end);
    const eIn = polar(cx, cy, innerR, start);
    return [
      `M ${sOut.x.toFixed(2)} ${sOut.y.toFixed(2)}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${eOut.x.toFixed(2)} ${eOut.y.toFixed(2)}`,
      `L ${sIn.x.toFixed(2)} ${sIn.y.toFixed(2)}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${eIn.x.toFixed(2)} ${eIn.y.toFixed(2)}`,
      'Z'
    ].join(' ');
  };

  let angleAcc = 0;
  const donutSegments = costBreakdown.map((c) => {
    const start = angleAcc;
    angleAcc += c.pct * 3.6;
    return { ...c, d: arcPath(90, 90, 55, 75, start, angleAcc) };
  });

  const handleDispatch = () => {
    setDispatchedFlash(true);
    setTimeout(() => setDispatchedFlash(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">输出清单</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">将匹配结果整合为整场赛事的完整资源清单，可导出、可下发执行</p>
        </div>
        <StepFlowIndicator steps={STEPS} current={step} onStepChange={onStepChange} />
      </div>

      {/* ===== 1. 赛事信息卡 ===== */}
      <div className="card-solid p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center shrink-0">
            <Trophy size={20} className="text-[var(--brand)]" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--text-primary)]">{eventInfo.tournament}</span>
              <StatusPill variant="brand">{eventInfo.level}</StatusPill>
            </div>
            <span className="text-[var(--text-muted)]">|</span>
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
              <CalendarDays size={15} aria-hidden="true" />
              {eventInfo.date}
            </div>
            <span className="text-[var(--text-muted)]">|</span>
            <span className="text-sm text-[var(--text-muted)]">
              {eventInfo.totalMatches}场 / {eventInfo.days}天 / {eventInfo.venues}馆
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onPrev && (
            <button type="button" onClick={onPrev} className="btn btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60">
              <ArrowLeft size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
              返回匹配
            </button>
          )}
          <button type="button" className="btn btn-accent inline-flex items-center gap-1.5 px-4 py-2 text-sm">
            <Download size={15} aria-hidden="true" />
            导出完整清单
          </button>
          <button type="button" className="btn btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60">
            <Printer size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
            打印
          </button>
        </div>
      </div>

      {/* ===== 2. 汇总KPI条 ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStrip title="总资源项" value={summary.totalResources} unit="项" trend="覆盖4大资源库" accent="brand" />
        <KpiStrip title="总预算" value={`¥${fmt(summary.totalCost)}`} unit="" trend="↓节省¥52,000" trendDir="down" accent="info" />
        <KpiStrip title="匹配率" value={summary.matchRate} unit="%" trend="249/263项已匹配" trendDir="up" accent="ok" />
        <KpiStrip title="确认率" value="97.6" unit="%" trend="仅6项待确认" accent="purple" />
      </div>

      {/* ===== 3. 主体左右两栏 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ===== 左栏：四库分类清单 ===== */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {categorySummary.map((cat) => {
            const CatIcon = DB_ICON[cat.icon] || Package;
            const partialCount = (cat.items || []).filter((it) => it.status === 'partial').length;
            const confirmedCount = cat.count - partialCount;
            return (
              <div key={cat.id} className={`card-solid p-5 border-l-[3px] ${DB_BORDER[cat.color] || 'border-l-[var(--brand)]'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${DB_BG[cat.color] || 'bg-[var(--brand)]/15'}`}>
                      <CatIcon size={16} className={DB_TEXT[cat.color] || 'text-[var(--brand)]'} aria-hidden="true" />
                    </div>
                    <span className="text-base font-bold text-[var(--text-primary)]">{cat.name}</span>
                    <StatusPill variant={cat.color}>{cat.count}项</StatusPill>
                  </div>
                  <span className={`text-lg font-black tabular-nums ${DB_TEXT[cat.color] || 'text-[var(--brand)]'}`}>
                    ¥{fmt(cat.cost)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[560px]">
                    <div className="grid grid-cols-[1.5fr_2fr_60px_80px_1fr_50px] gap-2 text-xs text-[var(--text-muted)] font-bold border-b border-[var(--border)] pb-2">
                      <span>项目</span><span>详情</span><span>数量</span><span>费用</span><span>联系人</span><span>状态</span>
                    </div>
                    {(cat.items || []).map((it) => (
                      <div key={it.role} className="grid grid-cols-[1.5fr_2fr_60px_80px_1fr_50px] items-center gap-2 py-2.5 border-b border-[var(--border)]/50 hover:bg-[var(--surface-muted)]/30 transition-colors">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{it.role}</span>
                        <span className="text-xs text-[var(--text-muted)]">{it.detail}</span>
                        <span className="text-sm tabular-nums text-[var(--text-primary)]">{fmt(it.count)}{it.unit}</span>
                        <span className="text-sm font-bold tabular-nums text-[var(--text-primary)]">{fmt(it.cost)}</span>
                        <span className="text-xs text-[var(--text-muted)]">{it.contact}</span>
                        <div>
                          {it.status === 'confirmed'
                            ? <StatusPill variant="ok">已确认</StatusPill>
                            : <StatusPill variant="warn">部分确认</StatusPill>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 mt-2">
                  <span className="text-xs text-[var(--text-muted)]">共{cat.count}项 · {confirmedCount}项已确认</span>
                  <span className="text-xs text-[var(--text-muted)]">小计 ¥{fmt(cat.cost)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== 右栏：成本分布 + 时间轴 ===== */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* 成本分布 */}
          <div className="card-solid p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart size={16} className="text-[var(--brand)]" aria-hidden="true" />
                <span className="text-sm font-bold text-[var(--text-primary)]">成本分布</span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">总预算 ¥{fmt(summary.totalCost)}</span>
            </div>

            <div className="relative w-full max-w-[200px] mx-auto aspect-square">
              <svg viewBox="0 0 180 180" width="100%" height="100%">
                {donutSegments.map((seg) => (
                  <path key={seg.category} d={seg.d} fill={COLOR_VAR[seg.color] || 'var(--brand)'} opacity="0.92" />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black tabular-nums text-[var(--brand)]">{Math.round(summary.totalCost / 10000)}.6万</span>
                <span className="text-xs text-[var(--text-muted)] mt-0.5">总预算</span>
              </div>
            </div>

            <div className="space-y-2.5 mt-4">
              {costBreakdown.map((c) => (
                <div key={c.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_VAR[c.color] }} />
                    <span className="text-xs text-[var(--text-primary)]">{c.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tabular-nums text-[var(--text-primary)]">¥{fmt(c.amount)}</span>
                    <span className="text-[10px] text-[var(--text-muted)] w-10 text-right">{c.pct}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-2 rounded-lg bg-[var(--ok)]/10 flex items-center gap-2">
              <TrendingDown size={14} className="text-[var(--ok)] shrink-0" aria-hidden="true" />
              <span className="text-xs text-[var(--ok)]">AI匹配较传统采购节省 ¥{fmt(summary.costSaved)}（↓11.9%）</span>
            </div>
          </div>

          {/* 赛事时间轴 */}
          <div className="card-solid p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-[var(--brand)]" aria-hidden="true" />
                <span className="text-sm font-bold text-[var(--text-primary)]">赛事资源时间轴</span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">{eventInfo.days}天 / {timeline.length}个阶段</span>
            </div>

            <div className="space-y-0">
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center self-stretch">
                    <span className="w-3 h-3 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: PHASE_DOT[t.status] || 'var(--brand)' }} />
                    {i < timeline.length - 1 && <span className="flex-1 w-px bg-[var(--border)] my-0.5" style={{ minHeight: 24 }} />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="text-xs font-bold text-[var(--text-primary)]">{t.day}</div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{t.phase}</div>
                    <div className="text-xs text-[var(--text-muted)] leading-snug mt-0.5">{t.items}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== 4. 底部确认条 ===== */}
      <div className="card-solid p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <CheckCircle2 size={20} className="text-[var(--ok)]" aria-hidden="true" />
          <div>
            <div className="text-base font-bold text-[var(--text-primary)]">资源清单已生成</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">整场赛事资源整合完成 · 可导出Excel/PDF</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDispatch}
          className="btn btn-accent inline-flex items-center gap-1.5 px-5 py-2 text-sm"
        >
          {dispatchedFlash
            ? <Check size={15} aria-hidden="true" />
            : <Send size={15} aria-hidden="true" />}
          {dispatchedFlash ? '已下发执行' : '确认清单·下发执行'}
        </button>
      </div>
    </div>
  );
}