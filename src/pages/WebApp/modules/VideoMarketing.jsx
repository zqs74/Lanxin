import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Copy, Check, Sparkles, Clock, Shield, Award,
  Building2, Handshake, BarChart3, TrendingUp, CalendarDays, Briefcase,
  Maximize2, Minimize2, History,
  CircleDollarSign
} from 'lucide-react';
import { useMarketingMock } from '../hooks/useMockApi.js';
import HighlightTracking from './HighlightTracking.jsx';
import VideoCoverCard from '../components/VideoCoverCard.jsx';
import TrendLineChart from '../components/TrendLineChart.jsx';
import UserPieChart from '../components/UserPieChart.jsx';
import KpiStrip from '../components/KpiStrip.jsx';
import StatusPill from '../components/StatusPill.jsx';
import ComboBarChart from '../components/ComboBarChart.jsx';
import StackedBarChart from '../components/StackedBarChart.jsx';
import DualLineChart from '../components/DualLineChart.jsx';
import RoiScatterChart from '../components/RoiScatterChart.jsx';

/* ======================== 顶部 Tabs（3 个） ======================== */
const TABS = [
  { key: 'video', label: '🎬 视频营销' },
  { key: 'brand', label: '🏀 森耐特 业绩与营收' },
  { key: 'report', label: '📊 营销报表' },
  { key: 'tracking', label: '🎯 集锦追踪与评估' }
];

function TopTabs({ tab, onChange, fullscreen, onToggleFullscreen }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 w-full'>
      <div className='flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] w-full md:w-auto inline-flex shadow-sm'>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type='button'
              role='tab'
              aria-selected={active}
              onClick={() => onChange(t.key)}
              className={[
                'btn !text-sm !py-2.5 !px-5 whitespace-nowrap transition-all',
                active ? 'btn-accent shadow-md translate-y-[-1px]' : 'btn-ghost text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              ].join(' ')}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <button
        type='button'
        onClick={onToggleFullscreen}
        aria-label={fullscreen ? '退出全屏' : '全屏展示'}
        className='btn btn-ghost inline-flex items-center gap-2 !py-2 !px-4 border border-[var(--border)] hover:border-[var(--brand)]/60 transition-all shadow-sm'
      >
        {fullscreen ? <Minimize2 size={16} className='text-[var(--brand)]' /> : <Maximize2 size={16} className='text-[var(--text-muted)]' />}
        <span className='text-sm font-medium'>{fullscreen ? '退出全屏' : '全屏展示'}</span>
      </button>
    </div>
  );
}

/* ======================== Tab1：视频营销 ======================== */
function TabVideoMarketing({
  videoBasic, kpi, trend7, trend30, demographics, ai,
  coverUrl, onCoverChange,
  trendGranularity, setTrendGranularity,
  copiedKey, copyToClipboard
}) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
        <div className='col-span-12 lg:col-span-5 space-y-4'>
          <VideoCoverCard videoBasic={videoBasic} coverUrl={coverUrl} onCoverChange={onCoverChange} />
          <TrendLineChart
            trend7={trend7} trend30={trend30}
            granularity={trendGranularity}
            onGranularityChange={setTrendGranularity}
          />
        </div>

        <div className='col-span-12 lg:col-span-7 space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            {kpi.map(k => (
              <KpiStrip
                key={k.key}
                title={k.title} value={k.value} unit={k.unit}
                accent={k.accent} trendDir={k.trend}
                trend={`较上周 ${k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→'} ${k.pct}%`}
                iconName={k.icon}
                ariaLabel={`KPI：${k.title} ${k.value} ${k.unit} ${k.trend === 'up' ? '↑' : '↓'}${k.pct}%`}
              />
            ))}
          </div>

          <div className='card-base card-solid p-5 space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Sparkles size={18} className='text-[var(--brand)]' />
                <h3 className='text-base font-bold text-[var(--text-primary)]'>AI 营销建议</h3>
              </div>
              <StatusPill variant='brand'>综合评分 {ai.score}/10</StatusPill>
            </div>

            <div className='space-y-2'>
              <div className='text-xs text-[var(--text-muted)] font-medium'>💡 智能标题推荐</div>
              {ai.titles.map((t, i) => (
                <div key={i}
                     className='flex items-start gap-2 p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/30 hover:bg-[var(--surface-muted)] transition-colors group'>
                  <span className='flex-shrink-0 text-[var(--brand)] font-bold text-xs mt-0.5'>T{i + 1}</span>
                  <p className='flex-1 text-sm text-[var(--text-primary)] leading-relaxed'>{t}</p>
                  <button
                    type='button' className='btn btn-ghost !p-2 flex-shrink-0'
                    onClick={() => copyToClipboard(`title-${i}`, t)}
                    aria-label={`复制标题 ${i + 1}`}
                  >
                    {copiedKey === `title-${i}`
                      ? <Check size={14} className='text-[var(--ok)]' />
                      : <Copy size={14} className='text-[var(--text-muted)] group-hover:text-[var(--text-primary)]' />}
                  </button>
                </div>
              ))}
            </div>

            <div className='space-y-2'>
              <div className='text-xs text-[var(--text-muted)] font-medium'>🏷️ 话题标签推荐</div>
              <div className='flex flex-wrap gap-2'>
                {ai.hashtags.map((tag, i) => (
                  <button
                    key={i} type='button'
                    onClick={() => copyToClipboard(`tag-${i}`, tag)}
                    aria-label={`复制话题标签 ${tag}`}
                    className='btn px-3.5 py-1.5 rounded-full text-xs font-medium border border-[var(--brand)]/40 bg-[var(--brand)]/10 text-[var(--brand)] hover:bg-[var(--brand)]/20 transition-colors flex items-center gap-1.5 group'
                  >
                    {tag}
                    {copiedKey === `tag-${i}`
                      ? <Check size={11} className='text-[var(--ok)]' />
                      : <Copy size={11} className='opacity-60 group-hover:opacity-100' />}
                  </button>
                ))}
              </div>
            </div>

            <div className='p-4 rounded-2xl border border-dashed border-[var(--ok)]/40 bg-[var(--ok)]/5 flex items-center justify-between gap-3'>
              <div className='flex items-start gap-2.5'>
                <Clock size={16} className='text-[var(--ok)] flex-shrink-0 mt-0.5' />
                <div>
                  <div className='text-xs font-medium text-[var(--ok)]'>最佳发布时间建议</div>
                  <div className='text-sm text-[var(--text-primary)] mt-0.5'>{ai.bestTime}</div>
                </div>
              </div>
              <button type='button' className='btn btn-accent !py-2 !text-xs whitespace-nowrap'>一键应用</button>
            </div>
          </div>

          <UserPieChart demographics={demographics} totalFans='12.4万' />
        </div>
      </div>
    </div>
  );
}

/* ======================== Tab2：森耐特业绩 ======================== */
function TabBrandPerformance({ brand, revenue15Day, annualRevenue, financialBrief }) {
  const highlightColorMap = { brand: 'var(--brand)', ok: 'var(--ok)', info: 'var(--info)', purple: 'var(--purple)', warn: 'var(--warn)' };

  return (
    <div className='space-y-4'>
      {/* 第一行（对齐 P4）：品牌信息（5） + 2x2 高亮数字（4） + 3 收益模式（3） */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
        <div className='col-span-12 lg:col-span-5'>
          <div className='card-base card-solid p-5 space-y-4 relative overflow-hidden h-full'>
            <div className='absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 pointer-events-none'
                 style={{ background: 'radial-gradient(circle, var(--brand), transparent 70%)' }} />
            <div className='flex items-start justify-between relative'>
              <div className='space-y-1.5'>
                <div className='flex items-center gap-2'>
                  <div className='inline-flex items-center justify-center px-3 py-1 rounded-xl border border-[var(--brand)]/40 bg-[var(--brand)]/10 text-[var(--brand)] text-xs font-semibold'>
                    <Handshake size={13} className='mr-1' />
                    CBA夏季联赛 官方合作
                  </div>
                  <span className='inline-flex items-center text-xs text-[var(--text-muted)]'>{brand.coopDuration}</span>
                </div>
                <h2 className='text-3xl font-black tracking-tight text-[var(--text-primary)] leading-none'>
                  {brand.nameCn}
                </h2>
                <div className='text-xl font-extrabold tracking-[0.2em] mt-1 text-[var(--brand)]'>
                  {brand.logoText}
                </div>
                <div className='inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] mt-0.5'>
                  <Award size={12} className='text-[var(--warn)]' />
                  NBA 官方装备 Since {brand.since}
                </div>
              </div>
              <div className='w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-[var(--brand)]/40 bg-[var(--surface-muted)] shadow-inner'>
                <Building2 size={28} className='text-[var(--brand)]' />
              </div>
            </div>

            <p className='text-sm text-[var(--text-muted)] leading-relaxed relative'>
              {brand.tagline}
            </p>

            {/* 品牌里程碑时间线 */}
            <div className='relative pt-3 border-t border-dashed border-[var(--border)]'>
              <div className='text-xs text-[var(--text-muted)] font-semibold mb-2.5 flex items-center gap-1.5'>
                <History size={12} /> 品牌里程碑
              </div>
              <div className='space-y-2'>
                {brand.brandTimeline.map((t, i) => (
                  <div key={i} className='flex items-start gap-2.5 group'>
                    <div className='flex-shrink-0 w-2 h-2 rounded-full mt-1.5 bg-[var(--brand)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_20%,transparent)]' />
                    <div className='flex-1 grid grid-cols-5 gap-2 items-baseline'>
                      <span className='col-span-2 text-xs font-bold text-[var(--brand)] tabular-nums'>{t.year}</span>
                      <span className='col-span-3 text-xs text-[var(--text-primary)] leading-snug'>{t.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex items-center justify-between pt-1 relative'>
              <div className='flex -space-x-2'>
                {['🏀', '👕', '🧦', '🏆'].map((e, i) => (
                  <div key={i}
                       className='w-9 h-9 rounded-2xl flex items-center justify-center text-base border-2 border-[var(--card-solid)] bg-[var(--surface-muted)] shadow-sm'>
                    {e}
                  </div>
                ))}
              </div>
              <button type='button' className='btn btn-accent !py-2 !text-xs'>前往联名商城</button>
            </div>
          </div>
        </div>

        {/* 中：2x2 高亮数字 */}
        <div className='col-span-12 lg:col-span-4 grid grid-cols-2 gap-3'>
          {brand.highlights.map((h, i) => (
            <div key={i}
                 className='card-base card-solid p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:-translate-y-0.5 transition-all min-h-[176px]'>
              <div className='absolute -bottom-12 -right-12 w-40 h-40 rounded-full opacity-20 pointer-events-none'
                   style={{ background: `radial-gradient(circle, ${highlightColorMap[h.color]}, transparent 70%)` }} />
              <div className='text-xs text-[var(--text-muted)] font-semibold tracking-wider z-10'>{h.label}</div>
              <div className='mt-3 flex items-baseline justify-center gap-2 z-10'>
                <span
                  className='text-[52px] leading-none font-black tabular-nums tracking-tight'
                  style={{ color: highlightColorMap[h.color] }}
                >{h.value}</span>
                <span className='text-[15px] text-[var(--text-muted)] font-semibold'>{h.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 右：3 大收益模式 */}
        <div className='col-span-12 lg:col-span-3 card-base card-solid p-4 space-y-3'>
          <div className='flex items-center gap-2 mb-1'>
            <CircleDollarSign size={16} className='text-[var(--brand)]' />
            <h3 className='text-sm font-bold text-[var(--text-primary)]'>收益模式构成</h3>
          </div>
          <div className='space-y-2.5'>
            {brand.revenueModels.map((m, i) => {
              const clr = highlightColorMap[m.color];
              return (
                <div key={i} className='rounded-2xl border border-[var(--border)] p-3 bg-[var(--surface-muted)]/25 hover:bg-[var(--surface-muted)] transition-all'>
                  <div className='flex items-center justify-between mb-1'>
                    <div className='flex items-center gap-2'>
                      <div className='w-2.5 h-2.5 rounded-full' style={{ background: clr, boxShadow: `0 0 0 3px color-mix(in srgb, ${clr} 20%, transparent)` }} />
                      <span className='text-xs font-bold text-[var(--text-primary)]'>{m.title}</span>
                    </div>
                    <span className='text-[10px] font-bold px-2 py-0.5 rounded-full text-[var(--text-primary)]'
                          style={{ background: `color-mix(in srgb, ${clr} 18%, transparent)` }}>占比 {m.share}</span>
                  </div>
                  <p className='text-[11px] text-[var(--text-muted)] mb-1.5 leading-snug'>{m.desc}</p>
                  <span className='text-lg font-black tabular-nums leading-none' style={{ color: clr }}>{m.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 近期 15 日收益曲线（独占一行） */}
      <DualLineChart
        data={revenue15Day.map(d => ({ day: d.day, seriesA: d.value, seriesB: d.profit }))}
        nameA='营业额（万元）' nameB='净利润（万元）'
        colorA='brand' colorB='ok'
        title='💹 近期 15 日收益曲线（营业额 vs 净利润 · 毛利率 ≈ 48%）'
        unitA='万' unitB='万'
        dualAxis={false}
      />

      {/* 2021 - 2026 营业额（组合柱 + 增长折线 + 毛利率） */}
      <ComboBarChart data={annualRevenue} title='🏗️ 2021 - 2026 品牌营收结构（万元）'
                     accent1='brand' accent2='info'
                     series1Name='产品销售（球衣/服饰/联名）' series2Name='营销服务（赛事/赞助/合作）' lineName='同比增长率' />

      {/* 财政简报（6 条） */}
      <div className='card-base card-solid p-5 space-y-3.5'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Briefcase size={17} className='text-[var(--brand)]' />
            <h3 className='text-base font-bold text-[var(--text-primary)]'>📋 财政简报 · 2026 年度</h3>
          </div>
          <div className='text-xs text-[var(--text-muted)] flex items-center gap-1'>
            <CalendarDays size={12} /> 截至 2026 年 7 月
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {financialBrief.map((b, i) => {
            const variantMap = { 本期: 'brand', 利润: 'ok', 曝光: 'info', 投入: 'warn', 渠道: 'purple', 周转: b.trend === 'down' ? 'ok' : 'info' };
            const variant = variantMap[b.tag] || 'brand';
            return (
              <div key={i} className='rounded-2xl border border-[var(--border)] p-4 bg-[var(--surface-muted)]/20 hover:bg-[var(--surface-muted)] transition-colors space-y-2.5'>
                <div className='flex items-center justify-between'>
                  <StatusPill variant={variant}>{b.tag}</StatusPill>
                  <div className={[
                    'text-xs font-semibold tabular-nums flex items-center gap-0.5',
                    b.trend === 'up' ? 'text-[var(--ok)]' : b.trend === 'down' ? 'text-[var(--ok)]' : 'text-[var(--text-muted)]'
                  ].join(' ')}>
                    <TrendingUp size={12} /> {b.trend === 'down' ? '↓' : '↑'} {Math.abs(b.pct)}%
                  </div>
                </div>
                <div className='text-sm text-[var(--text-primary)] font-semibold leading-snug'>{b.title}</div>
                <div className='text-xl font-black text-[var(--text-primary)] tabular-nums tracking-tight'>{b.value}</div>
                <div className='text-xs text-[var(--text-muted)] leading-snug pt-1 border-t border-dashed border-[var(--border)]'>
                  {b.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ======================== Tab3：营销报表 ======================== */
function TabMarketingReport({ overviewKpi, growth30Day, channelRevenue, topCampaigns }) {
  const channelSeries = useMemo(() => [
    { name: '抖音', color: 'brand' },
    { name: '视频号', color: 'ok' },
    { name: 'B站', color: 'info' },
    { name: '小红书', color: 'warn' },
    { name: '线下', color: 'purple' }
  ], []);

  // 渠道累计占比（6 个月合计）
  const channelShares = useMemo(() => {
    const perCh = channelSeries.map(c => ({
      name: c.name,
      color: c.color,
      total: channelRevenue.reduce((s, m) => s + (m[c.name] || 0), 0)
    }));
    const sum = perCh.reduce((s, c) => s + c.total, 0);
    return {
      items: perCh.map(c => ({ ...c, pct: sum ? +(c.total / sum * 100).toFixed(1) : 0 })),
      sum
    };
  }, [channelRevenue, channelSeries]);

  const aggregate = useMemo(() => {
    const last = channelRevenue[channelRevenue.length - 1];
    const prev = channelRevenue[channelRevenue.length - 2];
    const lTot = channelSeries.reduce((a, c) => a + (last?.[c.name] || 0), 0);
    const pTot = channelSeries.reduce((a, c) => a + (prev?.[c.name] || 0), 0);
    const mom = pTot ? ((lTot - pTot) / pTot * 100) : 0;
    return {
      total: 673.2,
      avg: +(673.2 / 6).toFixed(1),
      mom: +mom.toFixed(1),
      latestTotal: +lTot.toFixed(1)
    };
  }, [channelRevenue, channelSeries]);

  const colorMap = {
    brand: 'var(--brand)', ok: 'var(--ok)', info: 'var(--info)',
    warn: 'var(--warn)', purple: 'var(--purple)', danger: 'var(--danger)'
  };

  return (
    <div className='space-y-4'>
      {/* 4 KPI 顶部条 */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        {overviewKpi.map(k => (
          <KpiStrip
            key={k.key} title={k.title} value={k.value} unit={k.unit}
            accent={k.accent} trendDir={k.trend}
            trend={`近 30 日 ${k.trend === 'up' ? '↑' : '↓'} ${k.pct}%`}
            iconName={k.icon}
          />
        ))}
      </div>

      {/* 增长追踪 + 报表汇总 */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
        <div className='col-span-12 lg:col-span-8'>
          <DualLineChart
            data={growth30Day.map(d => ({ day: d.day, seriesA: d.revenue, seriesB: d.growthRate }))}
            nameA='营业额（万元/日）' nameB='销量增长率（%）'
            colorA='brand' colorB='ok'
            title='🚀 近期增长追踪（近 30 日 · 营业额 vs 销量增长 35% 中枢）'
            unitA='万' unitB='%' dualAxis={true}
          />
        </div>
        <div className='col-span-12 lg:col-span-4'>
          <div className='card-base card-solid p-5 space-y-3.5 h-full'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Shield size={16} className='text-[var(--ok)]' />
                <h3 className='text-sm font-bold text-[var(--text-primary)]'>📊 报表汇总（近 6 月）</h3>
              </div>
              <StatusPill variant='ok'>健康增长 35%</StatusPill>
            </div>
            <div className='space-y-2.5'>
              {[
                { k: '累计营业额', v: `¥ ${aggregate.total} 万`, clr: 'var(--brand)' },
                { k: '月均营业额', v: `¥ ${aggregate.avg} 万`, clr: 'var(--info)' },
                { k: '2026-07', v: `¥ ${aggregate.latestTotal} 万`, clr: 'var(--purple)' },
                { k: '月环比', v: `${aggregate.mom >= 0 ? '↑' : '↓'} ${Math.abs(aggregate.mom)}%`, clr: aggregate.mom >= 0 ? 'var(--ok)' : 'var(--danger)' },
                { k: '综合毛利率', v: '48.32 %', clr: 'var(--purple)' },
                { k: '全网品牌曝光', v: '4.8 亿+', clr: 'var(--brand)' }
              ].map((it, i) => (
                <div key={i} className='flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-muted)]/30'>
                  <span className='text-xs text-[var(--text-muted)]'>{it.k}</span>
                  <span className='text-sm font-bold tabular-nums' style={{ color: it.clr }}>{it.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 堆叠柱状 + 渠道占比卡片（删除 ROI 气泡模块） */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
        <div className='col-span-12 lg:col-span-8'>
          <StackedBarChart data={channelRevenue} series={channelSeries}
                           title='💹 各渠道月度营业额（近 6 月 · 含线下联名）' />
        </div>
        <div className='col-span-12 lg:col-span-4'>
          <div className='card-base card-solid p-5 space-y-3.5 h-full'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <BarChart3 size={16} className='text-[var(--brand)]' />
                <h3 className='text-sm font-bold text-[var(--text-primary)]'>🧩 渠道累计占比（近 6 月）</h3>
              </div>
              <StatusPill variant='brand' size='sm'>合计 ¥ {channelShares.sum.toFixed(1)}万</StatusPill>
            </div>
            {/* 占比条（横向堆叠可视化） */}
            <div className='relative w-full h-5 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] shadow-inner'>
              {(() => {
                let offset = 0;
                return channelShares.items.map(c => {
                  const pct = c.pct;
                  const left = offset;
                  offset += pct;
                  const bg = colorMap[c.color] || 'var(--brand)';
                  return (
                    <div
                      key={c.name}
                      className='absolute top-0 bottom-0 first:rounded-l-full last:rounded-r-full'
                      title={`${c.name}：¥${c.total.toFixed(1)}万 · ${pct}%`}
                      style={{ left: `${left}%`, width: `${pct}%`, background: `linear-gradient(180deg, color-mix(in srgb, ${bg} 95%, #fff), ${bg})` }}
                    />
                  );
                });
              })()}
            </div>
            <div className='space-y-2'>
              {/* 表头（统一列宽，与下方每行严格对齐） */}
              <div className='grid grid-cols-[20px_1fr_72px_92px] items-center gap-3 px-2.5 pb-2 border-b border-dashed border-[var(--border)] text-[10.5px] font-bold text-[var(--text-muted)] uppercase tracking-wider'>
                <div />
                <div>渠道</div>
                <div className='text-right'>占比</div>
                <div className='text-right'>营业额</div>
              </div>
              {channelShares.items.map(c => {
                const bg = colorMap[c.color] || 'var(--brand)';
                return (
                  <div
                    key={c.name}
                    className='group grid grid-cols-[20px_1fr_72px_92px] items-start gap-3 p-2.5 rounded-2xl hover:bg-[var(--surface-muted)]/40 transition-colors'
                  >
                    <div className='pt-2 shrink-0'>
                      <div
                        className='w-3 h-3 rounded-full border shadow-sm'
                        style={{ background: bg, borderColor: 'color-mix(in srgb, var(--border) 70%, ' + bg + ')' }}
                      />
                    </div>
                    <div className='min-w-0'>
                      <div className='text-sm font-semibold text-[var(--text-primary)] truncate'>{c.name}</div>
                      <div className='mt-1.5 h-1.5 rounded-full overflow-hidden bg-[var(--surface-muted)]'>
                        <div className='h-full rounded-full' style={{ width: `${c.pct}%`, background: bg }} />
                      </div>
                    </div>
                    <div className='pt-0.5 shrink-0 text-right tabular-nums'>
                      <span className='text-sm font-black' style={{ color: bg }}>{c.pct}%</span>
                    </div>
                    <div className='pt-0.5 shrink-0 text-right tabular-nums'>
                      <span className='text-xs font-bold text-[var(--text-primary)]'>¥ {c.total.toFixed(1)}万</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Campaigns 独占一行，更饱满 */}
      <div className='card-base card-solid p-5 space-y-3.5'>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <div className='flex items-center gap-2'>
            <BarChart3 size={17} className='text-[var(--brand)]' />
            <h3 className='text-base font-bold text-[var(--text-primary)]'>🏆 本期 Top 5 营销 Campaign</h3>
          </div>
          <StatusPill variant='info' size='sm'>综合评分</StatusPill>
        </div>
        <div className='space-y-2'>
          {/* 表头（统一列宽，与每行严格对齐） */}
          <div className='grid grid-cols-[52px_1fr_repeat(3,_88px)] items-end gap-3 px-3.5 pb-2 border-b border-dashed border-[var(--border)] text-[10.5px] font-bold text-[var(--text-muted)] uppercase tracking-wider'>
            <div>排名</div>
            <div>Campaign</div>
            <div className='text-right'>触达</div>
            <div className='text-right'>营收</div>
            <div className='text-right'>评分</div>
          </div>
          {topCampaigns.map((c, i) => {
            const colors = ['brand', 'ok', 'info', 'purple', 'warn'];
            const clr = `var(--${colors[i]})`;
            return (
              <div key={i}
                   className='group grid grid-cols-[52px_1fr_repeat(3,_88px)] items-start gap-3 p-3.5 rounded-2xl border border-[var(--border)] hover:border-[color-mix(in_srgb,var(--brand)_55%,var(--border))] hover:-translate-y-[1px] transition-all bg-[var(--surface-muted)]/25'>
                <div className='shrink-0'>
                  <div className='w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base tabular-nums shadow-sm'
                       style={{ color: clr, background: `color-mix(in srgb, ${clr} 18%, var(--surface-muted))` }}>
                    {c.rank}
                  </div>
                </div>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <div className='font-semibold text-[var(--text-primary)] truncate'>{c.name}</div>
                    <StatusPill variant={colors[i]} size='sm'>{c.type}</StatusPill>
                  </div>
                  <div className='mt-1.5 h-1.5 rounded-full overflow-hidden bg-[var(--surface-muted)]'>
                    <div className='h-full rounded-full transition-all'
                         style={{ width: `${c.score}%`, background: `linear-gradient(90deg, ${clr}, color-mix(in srgb, ${clr} 70%, var(--ok)))` }} />
                  </div>
                </div>
                <div className='pt-0.5 shrink-0 text-right tabular-nums'>
                  <div className='text-[11px] text-[var(--text-muted)]'>{c.reach}</div>
                </div>
                <div className='pt-0.5 shrink-0 text-right tabular-nums'>
                  <div className='font-bold text-[var(--brand)] text-base'>{c.revenue}</div>
                </div>
                <div className='pt-0.5 shrink-0 text-right tabular-nums'>
                  <div className='text-[10.5px] text-[var(--text-muted)]'>
                    <span className='font-semibold text-[var(--text-primary)]'>{c.score}</span>/100
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ======================== 主组件 ======================== */
export default function VideoMarketing() {
  const mock = useMarketingMock();
  const [tab, setTab] = useState('video');
  const [coverUrl, setCoverUrl] = useState(null);
  const [trendGranularity, setTrendGranularity] = useState('7d');
  const [copiedKey, setCopiedKey] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const contentRef = useRef(null);

  // 监听文档全屏变化，保证状态与 ESC 退出同步
  useEffect(() => {
    const onFsChange = () => {
      const el = document.fullscreenElement || document.webkitFullscreenElement;
      setFullscreen(Boolean(el));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const handleCoverChange = (file) => {
    if (!file) return;
    if (coverUrl) { try { URL.revokeObjectURL(coverUrl); } catch { /* ignore */ } }
    setCoverUrl(URL.createObjectURL(file));
  };

  const copyToClipboard = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch { /* ignore */ }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(prev => (prev === key ? null : prev)), 1500);
  };

  const toggleFullscreen = async () => {
    try {
      const el = contentRef.current;
      if (!el) return;
      const isFs = document.fullscreenElement || document.webkitFullscreenElement;
      if (isFs) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
        setFullscreen(false);
      } else {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        setFullscreen(true);
      }
    } catch {
      // 浏览器不支持/用户拒绝时，退化为 CSS 全屏浮层
      setFullscreen(prev => !prev);
    }
  };

  return (
    <div
      ref={contentRef}
      className={[
        'space-y-4 transition-all',
        fullscreen ? 'video-marketing-fullscreen' : ''
      ].join(' ')}
    >
      {/* 顶部 3 Tabs + 全屏按钮 */}
      <TopTabs tab={tab} onChange={setTab} fullscreen={fullscreen} onToggleFullscreen={toggleFullscreen} />

      {tab === 'video' && (
        <TabVideoMarketing
          videoBasic={mock.videoBasic}
          kpi={mock.kpi}
          trend7={mock.trend7}
          trend30={mock.trend30}
          demographics={mock.demographics}
          ai={mock.ai}
          coverUrl={coverUrl}
          onCoverChange={handleCoverChange}
          trendGranularity={trendGranularity}
          setTrendGranularity={setTrendGranularity}
          copiedKey={copiedKey}
          copyToClipboard={copyToClipboard}
        />
      )}
      {tab === 'brand' && (
        <TabBrandPerformance
          brand={mock.brand}
          revenue15Day={mock.revenue15Day}
          annualRevenue={mock.annualRevenue}
          financialBrief={mock.financialBrief}
        />
      )}
      {tab === 'report' && (
        <TabMarketingReport
          overviewKpi={mock.overviewKpi}
          growth30Day={mock.growth30Day}
          channelRevenue={mock.channelRevenue}
          channelRoi={mock.channelRoi}
          topCampaigns={mock.topCampaigns}
        />
      )}
      {/* 集锦追踪与评估（HighlightTracking 模块，含 5 步导航） */}
      {tab === 'tracking' && <HighlightTracking />}
    </div>
  );
}
