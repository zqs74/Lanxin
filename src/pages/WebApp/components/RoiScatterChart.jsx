import React, { useMemo } from 'react';
import { Trophy, Medal, TrendingUp, Wallet, Users, Zap } from 'lucide-react';
import StatusPill from './StatusPill.jsx';

/* RoiScatterChart（重构：废弃气泡散点，改为渠道 ROI 效能排行榜）
 *
 * 新样式：横向卡片列表（更直观、无气泡重叠、符合整体圆角审美）
 *  - 排名徽章（金银铜色 + 序号）
 *  - 渠道名称 + 分类 Tag
 *  - ROI 渐变进度条（满格 5.0x，虚线标注合格线 2.0x）
 *  - 3 项核心数据：ROI / 投入 / 转化
 *  - 效能等级 S/A/B/C 徽章
 ***********************************************************************************************/
const COLOR_MAP = {
  brand: 'var(--brand)', info: 'var(--info)', ok: 'var(--ok)',
  purple: 'var(--purple)', warn: 'var(--warn)', danger: 'var(--danger)',
  surface: 'var(--surface)', muted: 'var(--text-muted)', border: 'var(--border)',
  card: 'var(--card-solid)', primary: 'var(--text-primary)'
};

// S/A/B/C 等级判定
function gradeOf(roi) {
  if (roi >= 4.0) return { lv: 'S', color: 'brand', desc: '明星渠道' };
  if (roi >= 3.0) return { lv: 'A', color: 'ok', desc: '优质渠道' };
  if (roi >= 2.0) return { lv: 'B', color: 'info', desc: '合格渠道' };
  return { lv: 'C', color: 'warn', desc: '待优化' };
}

// 金银铜排名颜色
function rankTone(rank) {
  if (rank === 1) return { text: '#D4AF37', bg: 'linear-gradient(135deg, #fff4cc, #ffe08a)', border: 'rgba(212,175,55,0.55)' };
  if (rank === 2) return { text: '#9ca3af', bg: 'linear-gradient(135deg, #f3f4f6, #d1d5db)', border: 'rgba(156,163,175,0.55)' };
  if (rank === 3) return { text: '#b45309', bg: 'linear-gradient(135deg, #ffedd5, #fdba74)', border: 'rgba(180,83,9,0.5)' };
  return { text: 'var(--text-muted)', bg: 'var(--surface-muted)', border: 'var(--border)' };
}

export default function RoiScatterChart({
  data = [],
  title = '渠道 ROI 效能榜（投入 · 转化 · 回报率）'
}) {
  // 按 ROI 从高到低排序
  const sorted = useMemo(
    () => [...data].sort((a, b) => b.roi - a.roi),
    [data]
  );
  if (!sorted.length) return null;

  const MAX_ROI = 5.0; // 进度条满格
  const BASE_ROI = 2.0; // 合格线
  const baseLinePct = Math.min(100, (BASE_ROI / MAX_ROI) * 100);

  const totalSpend = sorted.reduce((s, d) => s + d.spend, 0);
  const totalConv = sorted.reduce((s, d) => s + d.conv, 0);
  const champ = sorted[0];
  const champGrade = gradeOf(champ.roi);

  return (
    <div className='card-base card-solid p-5 space-y-4 h-full'>
      {/* 标题 + 冠军高光 + 汇总 */}
      <div className='space-y-3'>
        <div className='flex items-start justify-between gap-3 flex-wrap'>
          <div>
            <h3 className='text-base font-bold text-[var(--text-primary)] flex items-center gap-1.5'>
              <Trophy size={17} className='text-[var(--brand)]' />
              {title}
            </h3>
            <div className='text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-3'>
              <span className='inline-flex items-center gap-1'>
                <span className='w-4 h-4 rounded-full' style={{
                  background: 'linear-gradient(90deg, var(--danger), var(--warn), var(--ok), var(--brand))'
                }} />
                ROI 效能条
              </span>
              <span>合格线 <span className='font-bold text-[var(--warn)]'>2.0x</span></span>
            </div>
          </div>

          {/* 冠军卡片 */}
          <div className='rounded-2xl p-3 relative overflow-hidden min-w-[220px] shadow-sm'
               style={{
                 background: 'linear-gradient(135deg, color-mix(in srgb, var(--brand) 12%, var(--card-solid)), var(--card-solid))',
                 border: '1px solid color-mix(in srgb, var(--brand) 40%, var(--border))'
               }}>
            <div className='absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 pointer-events-none'
                 style={{ background: 'radial-gradient(circle, var(--brand), transparent 70%)' }} />
            <div className='flex items-center gap-2 mb-1.5 relative'>
              <div className='w-8 h-8 rounded-2xl flex items-center justify-center'
                   style={{ background: rankTone(1).bg, border: `1px solid ${rankTone(1).border}` }}>
                <Medal size={15} style={{ color: rankTone(1).text }} />
              </div>
              <div>
                  <div className='text-[10px] text-[var(--text-muted)] font-semibold'>本期冠军</div>
                  <div className='text-sm font-black text-[var(--text-primary)] leading-tight'>{champ.name}</div>
                </div>
              <StatusPill variant={champGrade.color} className='ml-auto'>{champGrade.lv} · {champGrade.desc}</StatusPill>
            </div>
            <div className='grid grid-cols-3 gap-2 relative'>
              <div className='rounded-xl p-2 text-center' style={{ background: 'color-mix(in srgb, var(--ok) 12%, var(--surface-muted))' }}>
                <div className='text-[10px] text-[var(--text-muted)]'>ROI</div>
                <div className='text-sm font-black text-[var(--ok)] tabular-nums leading-tight'>{champ.roi.toFixed(2)}x</div>
              </div>
              <div className='rounded-xl p-2 text-center' style={{ background: 'color-mix(in srgb, var(--info) 12%, var(--surface-muted))' }}>
                <div className='text-[10px] text-[var(--text-muted)]'>投入</div>
                <div className='text-sm font-black text-[var(--info)] tabular-nums leading-tight'>¥{champ.spend}万</div>
              </div>
              <div className='rounded-xl p-2 text-center' style={{ background: 'color-mix(in srgb, var(--purple) 12%, var(--surface-muted))' }}>
                <div className='text-[10px] text-[var(--text-muted)]'>转化</div>
                <div className='text-sm font-black text-[var(--purple)] tabular-nums leading-tight'>{champ.conv}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 汇总条 */}
        <div className='grid grid-cols-3 gap-3'>
          <div className='flex items-center gap-2 p-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/30'>
            <div className='w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--brand)]/15 text-[var(--brand)]'>
              <Wallet size={14} />
            </div>
            <div>
              <div className='text-[10.5px] text-[var(--text-muted)]'>累计投入</div>
              <div className='text-sm font-black tabular-nums text-[var(--text-primary)] leading-tight'>¥ {totalSpend.toFixed(1)} 万</div>
            </div>
          </div>
          <div className='flex items-center gap-2 p-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/30'>
            <div className='w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--ok)]/15 text-[var(--ok)]'>
              <Users size={14} />
            </div>
            <div>
              <div className='text-[10.5px] text-[var(--text-muted)]'>累计转化</div>
              <div className='text-sm font-black tabular-nums text-[var(--text-primary)] leading-tight'>{totalConv} 人</div>
            </div>
          </div>
          <div className='flex items-center gap-2 p-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/30'>
            <div className='w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--purple)]/15 text-[var(--purple)]'>
              <Zap size={14} />
            </div>
            <div>
              <div className='text-[10.5px] text-[var(--text-muted)]'>覆盖渠道</div>
              <div className='text-sm font-black tabular-nums text-[var(--text-primary)] leading-tight'>{sorted.length} 个</div>
            </div>
          </div>
        </div>
      </div>

      {/* 渠道列表 */}
      <div className='space-y-2.5'>
        {sorted.map((d, i) => {
          const rank = i + 1;
          const c = COLOR_MAP[d.color] || COLOR_MAP.brand;
          const g = gradeOf(d.roi);
          const pct = Math.min(100, (d.roi / MAX_ROI) * 100);
          const tone = rankTone(rank);
          const overBase = d.roi >= BASE_ROI;

          return (
            <div
              key={d.name}
              className='group relative rounded-2xl border border-[var(--border)] p-3.5 hover:border-[color-mix(in_srgb,var(--brand)_55%,var(--border))] hover:-translate-y-[1px] transition-all overflow-hidden'
              style={{ background: 'linear-gradient(180deg, var(--card-solid), color-mix(in srgb, var(--surface-muted) 40%, var(--card-solid)))' }}
            >
              {/* 排名侧光 */}
              <div className='absolute left-0 top-0 bottom-0 w-[3px]'
                   style={{
                     background: rank <= 3
                       ? `linear-gradient(180deg, ${tone.text}, color-mix(in srgb, ${tone.text} 30%, transparent))`
                       : `linear-gradient(180deg, ${c}, transparent)`
                   }} />

              <div className='flex items-center gap-3 pl-2'>
                {/* 排名徽章 */}
                <div className='w-9 h-9 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm border shadow-sm'
                     style={{ background: tone.bg, borderColor: tone.border, color: tone.text }}>
                  {rank}
                </div>

                {/* 名称 + 等级 */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='font-bold text-[var(--text-primary)] truncate'>{d.name}</span>
                    <StatusPill variant={g.color} size='sm'>{g.lv} · {g.desc}</StatusPill>
                    {!overBase && (
                      <span className='inline-flex items-center gap-1 text-[10.5px] text-[var(--warn)] font-semibold px-2 py-0.5 rounded-full border border-[var(--warn)]/30 bg-[var(--warn)]/10'>
                        ⚠ 低于合格线
                      </span>
                    )}
                  </div>

                  {/* ROI 进度条（含合格线） */}
                  <div className='relative mt-2 h-3 rounded-full overflow-hidden bg-[var(--surface-muted)]'>
                    <div
                      className='absolute left-0 top-0 bottom-0 rounded-full transition-all duration-500'
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${overBase ? 'color-mix(in srgb, var(--ok) 65%, var(--brand))' : 'var(--warn)'}, ${c})`
                      }}
                    />
                    {/* 合格线 2.0x 虚线 */}
                    <div className='absolute top-0 bottom-0 w-[2px]' style={{ left: `${baseLinePct}%` }}>
                      <div className='w-[2px] h-full'
                           style={{
                             background: `repeating-linear-gradient(to bottom, var(--warn) 0 3px, transparent 3px 6px)`
                           }} />
                    </div>
                    {/* ROI 数值叠在条上 */}
                    <div className='absolute inset-0 flex items-center px-2 justify-between pointer-events-none'>
                      <span className='text-[10px] font-bold tabular-nums text-white drop-shadow'
                            style={{ opacity: pct > 18 ? 1 : 0 }}>
                        ROI {d.roi.toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </div>

                {/* 三项核心指标 */}
                <div className='flex shrink-0 gap-2 items-center'>
                  <div className='w-[84px] rounded-xl p-2 text-center border border-[var(--border)] bg-[var(--surface-muted)]/40'>
                    <div className='flex items-center justify-center gap-1 text-[10px] text-[var(--text-muted)]'>
                      <TrendingUp size={10} /> ROI
                    </div>
                    <div className='text-sm font-black tabular-nums leading-tight' style={{ color: c }}>
                      {d.roi.toFixed(2)}x
                    </div>
                  </div>
                  <div className='w-[84px] rounded-xl p-2 text-center border border-[var(--border)] bg-[var(--surface-muted)]/40'>
                    <div className='flex items-center justify-center gap-1 text-[10px] text-[var(--text-muted)]'>
                      <Wallet size={10} /> 投入
                    </div>
                    <div className='text-sm font-black tabular-nums leading-tight text-[var(--info)]'>
                      ¥{d.spend}万
                    </div>
                  </div>
                  <div className='w-[84px] rounded-xl p-2 text-center border border-[var(--border)] bg-[var(--surface-muted)]/40'>
                    <div className='flex items-center justify-center gap-1 text-[10px] text-[var(--text-muted)]'>
                      <Users size={10} /> 转化
                    </div>
                    <div className='text-sm font-black tabular-nums leading-tight text-[var(--purple)]'>
                      {d.conv}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 图例 / 备注 */}
      <div className='flex flex-wrap items-center justify-end gap-3 pt-1 border-t border-dashed border-[var(--border)] text-[10.5px] text-[var(--text-muted)]'>
        <div>{'S · A · B · C 分级徽章'}</div>
      </div>
    </div>
  );
}
