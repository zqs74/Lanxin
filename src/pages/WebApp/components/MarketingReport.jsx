import React, { useMemo, useState, useEffect } from 'react';
import {
  Sparkles, TrendingUp, BarChart3, Shield,
  Play, Pause, RotateCcw, Trophy
} from 'lucide-react';
import StatusPill from './StatusPill.jsx';
import AnimatedNumber from './AnimatedNumber.jsx';
import DualLineChart from './DualLineChart.jsx';
import StackedBarChart from './StackedBarChart.jsx';
import RoiScatterChart from './RoiScatterChart.jsx';
import DonutChart from './DonutChart.jsx';
import MarqueeTicker from './MarqueeTicker.jsx';

/* ======================== 营销报表 · 6 幕智能路演 ========================
 * 幕1 数据冲击：4 KPI 数字滚动计数（级联浮现）
 * 幕2 增长描画：30 日双折线从左向右画出 + 报表汇总计数
 * 幕3 渠道擂台：6 月堆叠柱逐月生长 + 环形占比扫描
 * 幕4 ROI 效率：渠道 ROI 排行榜逐行登场
 * 幕5 Campaign：Top5 卡片墙封面图 + 计数登场
 * 幕6 收尾脉冲：渠道实时营业额走马灯循环
 ******************************************************************************/

const ACT_DURATION = [1500, 2500, 2600, 1800, 2200];

const CAMP_IMAGES = [
  '/images/showcase/case-brand-sandknit.png',
  '/images/showcase/case-yueba-champion.png',
  '/images/showcase/case-game-action-01.png',
  '/images/showcase/case-villageba-ceremony.png',
  '/images/showcase/case-game-action-02.jpeg'
];

const ACCENT = {
  brand: 'var(--brand)', ok: 'var(--ok)', info: 'var(--info)',
  purple: 'var(--purple)', warn: 'var(--warn)', danger: 'var(--danger)'
};

export default function MarketingReport({ overviewKpi, growth30Day, channelRevenue, channelRoi, topCampaigns }) {
  const [act, setAct] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [session, setSession] = useState(0);

  const channelSeries = useMemo(() => [
    { name: '抖音', color: 'brand' },
    { name: '视频号', color: 'ok' },
    { name: 'B站', color: 'info' },
    { name: '小红书', color: 'warn' },
    { name: '线下', color: 'purple' }
  ], []);

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

  const tickerItems = useMemo(() => {
    const last = channelRevenue[channelRevenue.length - 1] || {};
    return [
      { label: '抖音', value: `¥${last['抖音'] ?? 0}万` },
      { label: '视频号', value: `¥${last['视频号'] ?? 0}万` },
      { label: 'B站', value: `¥${last['B站'] ?? 0}万` },
      { label: '小红书', value: `¥${last['小红书'] ?? 0}万` },
      { label: '线下', value: `¥${last['线下'] ?? 0}万` },
      { label: '累计营业额', value: '¥673.2万' },
      { label: '品牌销量增长', value: '+35%' },
      { label: '全网品牌曝光', value: '4.8亿+' },
      { label: '综合毛利率', value: '48.32%' }
    ];
  }, [channelRevenue]);

  // 路演时序推进（暂停时冻结，播放时继续）
  useEffect(() => {
    if (!playing || act >= ACT_DURATION.length) return;
    const t = setTimeout(() => setAct(a => a + 1), ACT_DURATION[act]);
    return () => clearTimeout(t);
  }, [act, playing]);

  const replay = () => {
    setSession(s => s + 1);
    setAct(0);
    setPlaying(true);
  };
  const togglePlay = () => setPlaying(p => !p);

  const showLine = act >= 1;
  const showBars = act >= 2;
  const showRoi = act >= 3;
  const showCamp = act >= 4;
  const showTicker = act >= 5;

  const KPI_DECIMALS = { mRevenue: 1, growthRate: 1, exposureVideos: 0, grossMargin: 2 };
  const KPI_NUMS = { mRevenue: 673.2, growthRate: 35.0, exposureVideos: 2341, grossMargin: 48.32 };

  const summaryItems = [
    { k: '累计营业额', v: aggregate.total, d: 1, suffix: ' 万', clr: ACCENT.brand },
    { k: '月均营业额', v: aggregate.avg, d: 1, suffix: ' 万', clr: ACCENT.info },
    { k: '2026-07', v: aggregate.latestTotal, d: 1, suffix: ' 万', clr: ACCENT.purple },
    { k: '月环比', v: Math.abs(aggregate.mom), d: 1, prefix: aggregate.mom >= 0 ? '↑ ' : '↓ ', suffix: ' %', clr: aggregate.mom >= 0 ? ACCENT.ok : ACCENT.danger },
    { k: '综合毛利率', v: 48.32, d: 2, suffix: ' %', clr: ACCENT.purple },
    { k: '全网品牌曝光', v: 4.8, d: 1, suffix: ' 亿+', clr: ACCENT.brand }
  ];

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes tour-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tour-row { animation: tour-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes tour-sweep {
          from { transform: rotate(-90deg); }
          to { transform: rotate(270deg); }
        }
        @keyframes tour-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .tour-marquee { animation: tour-marquee 26s linear infinite; }
      `}</style>

      {/* ===== 路演控制条 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center shrink-0">
            <Sparkles size={17} className="text-[var(--brand)]" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">营销报表 · 智能数据路演</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">数字滚动 · 折线描画 · 柱状生长 · 环形扫描 · 卡片登场</p>
          </div>
          <StatusPill variant="brand">{playing ? '演示中' : '已暂停'}</StatusPill>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="btn btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60"
          >
            {playing
              ? <><Pause size={15} className="text-[var(--warn)]" aria-hidden="true" />暂停</>
              : <><Play size={15} className="text-[var(--ok)]" aria-hidden="true" />播放</>}
          </button>
          <button
            type="button"
            onClick={replay}
            className="btn btn-accent inline-flex items-center gap-1.5 px-4 py-2 text-sm"
          >
            <RotateCcw size={15} aria-hidden="true" />
            重播路演
          </button>
        </div>
      </div>

      <div key={session}>
        {/* ===== 幕1 数据冲击 · KPI 计数 ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {overviewKpi.map((k, i) => (
            <div
              key={k.key}
              className="card-base card-solid p-4 relative overflow-hidden tour-row"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-25"
                style={{ background: `radial-gradient(circle, ${ACCENT[k.accent] || ACCENT.brand}, transparent 70%)` }}
              />
              <div className="relative flex items-start justify-between">
                <span className="text-xs text-[var(--text-muted)] font-semibold">{k.title}</span>
                <TrendingUp size={14} className="text-[var(--ok)]" aria-hidden="true" />
              </div>
              <div className="relative mt-2 flex items-baseline gap-1">
                <AnimatedNumber
                  value={KPI_NUMS[k.key] ?? 0}
                  decimals={KPI_DECIMALS[k.key] ?? 0}
                  run={true}
                  className="text-3xl font-black tabular-nums tracking-tight"
                  style={{ color: ACCENT[k.accent] || 'var(--brand)' }}
                />
                <span className="text-xs text-[var(--text-muted)]">{k.unit}</span>
              </div>
              <p className="relative mt-1.5 text-xs text-[var(--ok)]">近 30 日 ↑ {k.pct}%</p>
            </div>
          ))}
        </div>

        {/* ===== 幕2 增长描画 · 折线 + 汇总 ===== */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          style={{
            opacity: showLine ? 1 : 0,
            transform: showLine ? 'none' : 'translateY(18px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            pointerEvents: showLine ? 'auto' : 'none'
          }}
        >
          <div className="col-span-12 lg:col-span-8">
            <DualLineChart
              data={growth30Day.map(d => ({ day: d.day, seriesA: d.revenue, seriesB: d.growthRate }))}
              nameA='营业额（万元/日）' nameB='销量增长率（%）'
              colorA='brand' colorB='ok'
              title='🚀 近期增长追踪（近 30 日 · 营业额 vs 销量增长 35% 中枢）'
              unitA='万' unitB='%' dualAxis={true}
              animate={showLine}
            />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="card-base card-solid p-5 space-y-3.5 h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-[var(--ok)]" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">📊 报表汇总（近 6 月）</h3>
                </div>
                <StatusPill variant="ok">健康增长 35%</StatusPill>
              </div>
              <div className="space-y-2.5">
                {summaryItems.map((it) => (
                  <div key={it.k} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-muted)]/30">
                    <span className="text-xs text-[var(--text-muted)]">{it.k}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: it.clr }}>
                      <AnimatedNumber value={it.v} decimals={it.d} prefix={it.prefix || ''} suffix={it.suffix || ''} run={showLine} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== 幕3 渠道擂台 · 堆叠柱生长 + 环形扫描 ===== */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          style={{
            opacity: showBars ? 1 : 0,
            transform: showBars ? 'none' : 'translateY(18px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            pointerEvents: showBars ? 'auto' : 'none'
          }}
        >
          <div className="col-span-12 lg:col-span-8">
            <StackedBarChart
              data={channelRevenue}
              series={channelSeries}
              title='💹 各渠道月度营业额（近 6 月 · 含线下联名）'
              animate={showBars}
            />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="card-base card-solid p-5 space-y-4 h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-[var(--brand)]" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">🧩 渠道累计占比（近 6 月）</h3>
                </div>
                <StatusPill variant="brand" size="sm">合计 ¥ {channelShares.sum.toFixed(1)}万</StatusPill>
              </div>
              <DonutChart
                items={channelShares.items.map(c => ({ label: c.name, value: c.total, color: ACCENT[c.color] }))}
                centerLabel="累计营业额"
                centerUnit="万"
                animate={showBars}
              />
            </div>
          </div>
        </div>

        {/* ===== 幕4 ROI 效率榜 ===== */}
        {showRoi && (
          <div className="tour-row">
            <RoiScatterChart data={channelRoi} title='💎 渠道 ROI 效能榜（投入 · 转化 · 回报率）' animate />
          </div>
        )}

        {/* ===== 幕5 Top5 Campaign 卡片墙 ===== */}
        {showCamp && (
          <div className="card-base card-solid p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy size={17} className="text-[var(--brand)]" aria-hidden="true" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">🏆 本期 Top 5 营销 Campaign</h3>
              </div>
              <StatusPill variant="info" size="sm">综合评分</StatusPill>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              {topCampaigns.map((c, i) => {
                const clr = ACCENT[['brand', 'ok', 'info', 'purple', 'warn'][i]] || ACCENT.brand;
                const revenueNum = parseFloat((c.revenue || '').replace(/[^\d.]/g, '')) || 0;
                return (
                  <div
                    key={c.rank}
                    className="tour-row group rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[color-mix(in_srgb,var(--brand)_55%,var(--border))] hover:-translate-y-1 transition-all bg-[var(--surface-muted)]/25 flex flex-col"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div className="relative h-24 shrink-0 overflow-hidden">
                      <img src={CAMP_IMAGES[i]} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div
                        className="absolute top-2 left-2 w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shadow"
                        style={{ background: `linear-gradient(135deg, ${clr}, color-mix(in srgb, ${clr} 70%, #fff))`, color: '#0F2A5A' }}
                      >
                        {c.rank}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-[11px] font-bold text-white leading-tight line-clamp-2">{c.name}</div>
                      </div>
                    </div>
                    <div className="p-3 space-y-2 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <StatusPill variant={['brand', 'ok', 'info', 'purple', 'warn'][i]} size="sm">{c.type}</StatusPill>
                        <span className="text-[10px] text-[var(--text-muted)]">触达 {c.reach}</span>
                      </div>
                      <div className="flex items-end justify-between mt-auto">
                        <div>
                          <div className="text-[10px] text-[var(--text-muted)]">营收</div>
                          <div className="text-lg font-black tabular-nums" style={{ color: clr }}>
                            ¥<AnimatedNumber value={revenueNum} decimals={1} run={true} />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-[var(--text-muted)]">评分</div>
                          <div className="text-sm font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>{c.score}<span className="text-[10px] text-[var(--text-muted)]">/100</span></div>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-[var(--surface-muted)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${c.score}%`, background: `linear-gradient(90deg, ${clr}, color-mix(in srgb, ${clr} 70%, var(--ok)))` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== 幕6 收尾脉冲 · 实时走马灯 ===== */}
        {showTicker && (
          <div className="tour-row">
            <MarqueeTicker items={tickerItems} title="渠道实时营业额走马灯" />
          </div>
        )}
      </div>
    </div>
  );
}
