import React from 'react';
import { Signal, Wifi, BatteryFull } from 'lucide-react';

/**
 * 通用手机外框组件：渲染逼真手机 UI，截图后可直接用于 PPT
 * @param {Object} props
 * @param {React.ReactNode} props.children - 手机屏幕内容
 * @param {'light'|'dark'} [props.statusBarColor='light'] - 状态栏文字颜色
 * @param {number} [props.width=420] - 手机宽度（px）
 * @param {number} [props.height=800] - 手机高度（px）
 */
export default function PhoneFrame({ children, statusBarColor = 'light', width = 420, height = 800 }) {
  const barColor = statusBarColor === 'light' ? 'text-white' : 'text-black';
  return (
    <div className="relative mx-auto" style={{ width: `${width}px` }}>
      <div
        className="relative rounded-[2.5rem] border-[6px] border-[#1a1a1a] bg-[var(--bg-primary)] overflow-hidden shadow-2xl"
        style={{ height: `${height}px` }}
      >
        {/* 状态栏 */}
        <div className="absolute top-0 left-0 right-0 h-8 z-20 flex items-center justify-between px-6 pt-2">
          <span className={`text-[11px] font-semibold ${barColor}`}>9:41</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-24 h-6 rounded-full bg-black" />
          <div className="flex items-center gap-1">
            <Signal size={11} className={barColor} aria-hidden="true" />
            <Wifi size={11} className={barColor} aria-hidden="true" />
            <BatteryFull size={13} className={barColor} aria-hidden="true" />
          </div>
        </div>
        {/* 内容区 */}
        <div
          className="h-full overflow-y-auto pt-8 pb-6 scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          <style>{`::-webkit-scrollbar { display: none; }`}</style>
          {children}
        </div>
        {/* Home条 */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-[var(--text-muted)] opacity-40 z-20" />
      </div>
    </div>
  );
}