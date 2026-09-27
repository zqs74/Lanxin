import React from 'react';
import KpiStrip from './components/KpiStrip.jsx';
import FeatureCard from './components/FeatureCard.jsx';

/**
 * 仪表盘：顶部 4 KPI + 原 3x3 节奏的功能入口卡网格
 * @param {Object} props
 * @param {(view: string) => void} props.onNavigate - 点击功能卡触发，view ∈ 'ai'|'schedule'|'resource'|'emergency'|'visual'|'timeline'
 */
export default function Dashboard({ onNavigate }) {
  const kpis = [
    { title: '进行中赛事', value: '6/18', unit: '', trend: '▲ 2 场正在进行', trendDir: 'up', accent: 'brand' },
    { title: '今日资源占用', value: 67, unit: '%', trend: '▲ 较昨日 +8%', trendDir: 'up', accent: 'info' },
    { title: '待响应预案', value: 2, unit: '个', trend: '雷雨 / 设备维护', trendDir: 'flat', accent: 'warn' },
    { title: '本周活动数', value: 23, unit: '场', trend: '比赛14 · 训练6 · 其他3', trendDir: 'up', accent: 'purple' },
  ];

  return (
    <div className="flex flex-col gap-6 px-1">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-1">
          篮芯 AI 管理控制台
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <KpiStrip key={i} {...k} />
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">功能导航</h2>
          <span className="text-xs text-[var(--text-muted)]">共 18 项 · 17 项新增</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {['ai', 'schedule', 'resource', 'emergency', 'visual', 'timeline', 'matching', 'roster'].map((v) => (
            <FeatureCard key={v} variant={v} onClick={() => onNavigate(v)} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {['ppt', 'linkage', 'data', 'tables', 'poster', 'cost', 'tech', 'region', 'future', 'multimodal', 'promo', 'library'].map((v) => (
            <FeatureCard key={v} variant={v} onClick={() => onNavigate(v)} />
          ))}
        </div>
      </div>
    </div>
  );
}
