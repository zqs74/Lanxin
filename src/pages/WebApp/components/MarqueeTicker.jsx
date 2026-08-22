import React from 'react';

/**
 * 实时数据走马灯（营销报表路演 · 幕6 收尾循环）
 * 内容无缝循环滚动，营造营销大屏实时感
 * @param {Object} props
 * @param {Array<{label:string, value:string}>} props.items
 * @param {string} [props.title]
 */
export default function MarqueeTicker({ items = [], title = '实时渠道数据' }) {
  if (!items.length) return null;
  const doubled = [...items, ...items];

  return (
    <div className="card-base card-solid p-3 relative overflow-hidden">
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
        <span className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse" aria-hidden="true" />
        <span className="font-semibold">{title}</span>
        <span className="text-[10px]">实时滚动 · 循环播放</span>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex whitespace-nowrap w-max tour-marquee">
          {doubled.map((it, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-4 text-sm">
              <span className="font-bold text-[var(--text-primary)]">{it.label}</span>
              <span className="font-black tabular-nums" style={{ color: 'var(--brand)' }}>{it.value}</span>
              <span className="text-[var(--text-muted)]">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
