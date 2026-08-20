import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * 仪表盘顶部 KPI 统计卡片
 * @param {Object} props
 * @param {string} props.title   - 标题（如"进行中赛事"）
 * @param {string|number} props.value - 主数值（如 "6/18"、67）
 * @param {string} props.unit    - 单位（"%"/"个"/"场"，空字符串则不显示）
 * @param {string} props.trend   - 趋势小字（如 "较昨日 +2"、"↑ 8%"）
 * @param {'up'|'down'|'flat'} props.trendDir - 趋势箭头颜色
 * @param {'brand'|'info'|'warn'|'purple'|'ok'|'danger'} props.accent - 主数值颜色
 */
export default function KpiStrip({ title, value, unit = '', trend, trendDir = 'flat', accent = 'brand' }) {
  const accentColorMap = {
    brand: 'text-[var(--brand)]',
    info: 'text-[var(--info)]',
    warn: 'text-[var(--warn)]',
    purple: 'text-[var(--purple)]',
    ok: 'text-[var(--ok)]',
    danger: 'text-[var(--danger)]',
  };

  const trendIconColorMap = {
    up: 'var(--ok)',
    down: 'var(--danger)',
    flat: 'var(--text-muted)',
  };

  const trendTextColorMap = {
    up: 'text-[var(--ok)]',
    down: 'text-[var(--danger)]',
    flat: 'text-[var(--text-muted)]',
  };

  const TrendIcon = trendDir === 'up' ? TrendingUp : trendDir === 'down' ? TrendingDown : Minus;
  const ariaLabel = `KPI：${title} ${value}${unit} ${trend}`;

  return (
    <div
      className="card-base card-solid p-4 min-w-[0]"
      aria-label={ariaLabel}
      role="group"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[var(--text-muted)] text-xs">{title}</span>
        <TrendIcon
          size={14}
          style={{ color: trendIconColorMap[trendDir] }}
          aria-hidden="true"
        />
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className={`text-2xl font-bold font-mono tracking-tight ${accentColorMap[accent]}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-[var(--text-muted)]">{unit}</span>}
      </div>
      <p className={`text-xs ${trendTextColorMap[trendDir]}`}>{trend}</p>
    </div>
  );
}
